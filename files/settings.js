// ══════════════════════════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════════════════════════
const settingsState = {
  speechBubbles: true,
  chatLog:        true,
  fp4pSpeech:     true,
  teacher:        true,
};

function openSettings(){
  // Sync toggle button states
  Object.keys(settingsState).forEach(k => _syncSettingsToggle(k));
  document.getElementById('settings-overlay').style.display = 'flex';
}
function closeSettings(){
  document.getElementById('settings-overlay').style.display = 'none';
}

function _syncSettingsToggle(key){
  const idMap = {
    speechBubbles: 'toggle-speech-bubbles',
    chatLog:        'toggle-chat-log',
    fp4pSpeech:     'toggle-4p-speech',
    teacher:        'toggle-teacher',
  };
  const btn = document.getElementById(idMap[key]);
  if(!btn) return;
  const on = settingsState[key];
  btn.textContent = on ? 'ON' : 'OFF';
  btn.classList.toggle('off', !on);
}

function settingsToggle(key){
  settingsState[key] = !settingsState[key];
  _syncSettingsToggle(key);
  _applySettings();
}

function _applySettings(){
  // Speech bubbles (white/black rows)
  const show = settingsState.speechBubbles;
  ['white-speech-row','black-speech-row'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.visibility = show ? '' : 'hidden';
  });
  // Teacher
  teacherEnabled = settingsState.teacher;
}

// Settings unlock — mirrors tryUnlockCode but uses the settings input
function settingsUnlock(){
  const input = document.getElementById('settings-unlock-input');
  const code = input.value.trim().toUpperCase();
  const msg = document.getElementById('settings-unlock-msg');
  if(!code){ msg.textContent=''; return; }

  if(code === 'LETS GO USA'){
    const bundle = BOTS.filter(b=>b.secret&&b.code==='LETSGOUSA');
    let anyNew = false;
    bundle.forEach(bot=>{ if(!bot.unlocked){ bot.unlocked=true; anyNew=true; } });
    msg.style.color='#44ee88';
    msg.textContent = anyNew ? '🇺🇸 US BUNDLE UNLOCKED: THE DON · DARK BRANDON · OBAMA · ELON' : '✅ US Bundle already unlocked';
    if(anyNew) buildBotButtons();
    input.value=''; return;
  }

  const codeNoSpaces = code.replace(/\s+/g,'');
  const matches = BOTS.filter(b=>b.secret&&b.code===codeNoSpaces);
  if(matches.length){
    let anyNew=false;
    matches.forEach(bot=>{ if(!bot.unlocked){ bot.unlocked=true; anyNew=true; } });
    msg.style.color='#44ee88';
    msg.textContent = anyNew ? '🔓 UNLOCKED: '+matches.map(b=>b.name).join(' & ') : '✅ Already unlocked!';
    if(anyNew) buildBotButtons();
  } else {
    msg.style.color='#ff6666';
    msg.textContent = '❌ Invalid code — try again';
  }
  input.value='';
}

// ══════════════════════════════════════════════════════════════
//  SANDBOX BOARD EDITOR — v2 (tabbed: 2P + 4P)
// ══════════════════════════════════════════════════════════════

let sbBoard = null;         // working copy of 8×8 board
let sb4pBoard = null;       // working copy of 14×14 4P board
let sbSelectedTool = null;  // piece string or null=erase
let sbCurrentTab = '2p';    // '2p' | '4p'
let sbSqSize = 56;
let sb4pSqSize = 36;

const SB_CHESS_TYPES  = ['K','Q','R','B','N','P'];
const SB_PIECE_LABELS = {K:'King',Q:'Queen',R:'Rook',B:'Bishop',N:'Knight',P:'Pawn'};
// 4-player piece colours
const FP_COLORS_SB = [
  {id:'r', fill:'#e03020', hi:'#ff6655', ol:'#7a1010', name:'Red'},
  {id:'b', fill:'#2060cc', hi:'#5599ff', ol:'#0a2060', name:'Blue'},
  {id:'y', fill:'#ccaa00', hi:'#ffe033', ol:'#604400', name:'Yellow'},
  {id:'g', fill:'#22aa44', hi:'#44dd77', ol:'#0a4020', name:'Green'},
];

function openSandboxEditor(){
  sbBoard   = board.map(row => [...row]);
  sb4pBoard = fp && fp.board ? fp.board.map(row => row.map(c => c ? Object.assign({},c) : null)) : null;
  sbSqSize  = Math.max(44, Math.min(sqSize||60, 60));
  const overlay = document.getElementById('sandbox-editor');
  overlay.classList.add('open');
  sbBuildPalette();
  sbSwitchTab(sbCurrentTab, true);
}

function closeSandboxEditor(){
  document.getElementById('sandbox-editor').classList.remove('open');
  sbSelectedTool = null;
}

function sbSwitchTab(tab, force){
  if(tab === sbCurrentTab && !force) return;
  sbCurrentTab = tab;
  document.querySelectorAll('.sb-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('sb-tab-'+tab).classList.add('active');
  document.getElementById('sb-palette-chess').style.display = tab==='2p' ? '' : 'none';
  document.getElementById('sb-palette-4p').style.display   = tab==='4p' ? '' : 'none';
  sbBuildBoardUI();
  if(tab==='2p') sbRenderBoardPieces();
  else           sb4pRenderBoardPieces();
}

// ── Tool selection ──
function sbSelectTool(piece){
  sbSelectedTool = piece;
  document.querySelectorAll('.palette-piece, #palette-erase').forEach(el => el.classList.remove('selected-tool'));
  if(piece === null){
    document.getElementById('palette-erase').classList.add('selected-tool');
    document.getElementById('sb-status').textContent = 'Erase mode — click squares to remove';
  } else {
    const el = document.querySelector(`.palette-piece[data-piece="${piece}"]`);
    if(el) el.classList.add('selected-tool');
    // friendly label
    let label = '';
    if(typeof piece === 'object'){
      label = `${FP_COLORS_SB[piece.player]?.name||''} ${piece.type}`;
    } else {
      const col  = piece[0]==='w' ? 'White' : 'Black';
      const kind = (piece.includes('C')) ? ('Checker'+(piece.endsWith('K')?' King':'')) : (SB_PIECE_LABELS[piece.slice(1)]||piece.slice(1));
      label = `${col} ${kind}`;
    }
    document.getElementById('sb-status').textContent = `Placing: ${label}`;
  }
}

// ── SVG helpers ──
function sbMakeMiniPieceSVG(piece){
  if(!piece) return '';
  // 4P piece objects
  if(typeof piece === 'object' && piece.type){
    const fc = FP_COLORS_SB[piece.player] || FP_COLORS_SB[0];
    return makePiece(piece.type, false, fc.fill); // reuse existing makePiece with override colour
  }
  if(piece === 'bC' || piece === 'bCK'){
    const k = piece === 'bCK';
    return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="#cc2200" stroke="#1a1a1a" stroke-width="3"/><circle cx="50" cy="50" r="26" fill="#ff3300" stroke="#1a1a1a" stroke-width="2"/>${k?'<text x="50" y="60" font-size="30" text-anchor="middle" fill="#ffdd00" font-weight="bold" font-family="serif">♛</text>':''}</svg>`;
  }
  if(piece === 'wC' || piece === 'wCK'){
    const k = piece === 'wCK';
    return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="#dddddd" stroke="#555" stroke-width="3"/><circle cx="50" cy="50" r="26" fill="#ffffff" stroke="#555" stroke-width="2"/>${k?'<text x="50" y="60" font-size="30" text-anchor="middle" fill="#444" font-weight="bold" font-family="serif">♛</text>':''}</svg>`;
  }
  return makePiece(piece.slice(1), piece[0]==='w');
}

// ── Palette builder ──
function sbMakePaletteItem(pieceVal, label, title){
  const d = document.createElement('div');
  d.className = 'palette-piece';
  const key = typeof pieceVal==='object' ? JSON.stringify(pieceVal) : pieceVal;
  d.dataset.piece = key;
  d.draggable = true;
  d.title = title||label;
  d.innerHTML = sbMakeMiniPieceSVG(pieceVal) + `<span class="piece-label">${label}</span>`;
  d.onclick = () => sbSelectTool(pieceVal);
  d.addEventListener('dragstart', e => { sbSelectTool(pieceVal); e.dataTransfer.setData('text', key); });
  return d;
}

function sbBuildPalette(){
  // 2P chess palette
  ['white-chess','black-chess'].forEach((id,i) => {
    const col = i===0?'w':'b';
    const el = document.getElementById('palette-'+id);
    el.innerHTML = '';
    SB_CHESS_TYPES.forEach(t => el.appendChild(sbMakePaletteItem(col+t, t, (i===0?'White ':'Black ')+SB_PIECE_LABELS[t])));
  });
  // Checkers
  [['red-checkers',[['bC','C','Red Checker'],['bCK','K','Red Checker King']]],
   ['white-checkers',[['wC','C','White Checker'],['wCK','K','White Checker King']]]
  ].forEach(([id,items]) => {
    const el = document.getElementById('palette-'+id);
    el.innerHTML = '';
    items.forEach(([p,l,t]) => el.appendChild(sbMakePaletteItem(p,l,t)));
  });
  // 4P palette
  const fpPaletteIds = ['palette-4p-red','palette-4p-blue','palette-4p-yellow','palette-4p-green'];
  fpPaletteIds.forEach((pid,pi) => {
    const el = document.getElementById(pid); if(!el) return;
    el.innerHTML = '';
    SB_CHESS_TYPES.forEach(t => {
      const pieceObj = {player:pi, type:t};
      el.appendChild(sbMakePaletteItem(pieceObj, t, FP_COLORS_SB[pi].name+' '+SB_PIECE_LABELS[t]));
    });
  });
}

// ── Build board UI ──
function sbBuildBoardUI(){
  const is4p = sbCurrentTab === '4p';
  const SIZE  = is4p ? 14 : 8;
  const SZ    = is4p ? sb4pSqSize : sbSqSize;
  const wrap  = document.getElementById('sandbox-board-wrap');
  wrap.style.width  = (SZ*SIZE)+'px';
  wrap.style.height = (SZ*SIZE)+'px';
  const sqDiv = document.getElementById('sandbox-board-squares');
  sqDiv.style.cssText = 'position:absolute;inset:0;';
  sqDiv.innerHTML = '';
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
    const sq = document.createElement('div');
    sq.className = 'sb-sq ' + ((r+c)%2===0?'light':'dark');
    sq.style.cssText = `left:${c*SZ}px;top:${r*SZ}px;width:${SZ}px;height:${SZ}px;`;
    sq.dataset.r=r; sq.dataset.c=c;
    // 4P: shade corners (invalid squares)
    if(is4p){
      const inCorner=(r<3&&c<3)||(r<3&&c>10)||(r>10&&c<3)||(r>10&&c>10);
      if(inCorner){ sq.style.background='#222'; sq.style.opacity='0.4'; sq.dataset.corner='1'; }
    }
    sq.onclick = () => {
      if(sq.dataset.corner==='1') return;
      const rr=+sq.dataset.r, cc=+sq.dataset.c;
      if(is4p){
        if(!sb4pBoard) return;
        sb4pBoard[rr][cc] = sbSelectedTool===null ? null : (typeof sbSelectedTool==='object' ? Object.assign({},sbSelectedTool) : null);
        sb4pRenderBoardPieces();
      } else {
        sbBoard[rr][cc] = sbSelectedTool===null ? null : (typeof sbSelectedTool==='string' ? sbSelectedTool : null);
        sbRenderBoardPieces();
      }
    };
    sq.addEventListener('dragover', e => { e.preventDefault(); sq.classList.add('drag-over'); });
    sq.addEventListener('dragleave', () => sq.classList.remove('drag-over'));
    sq.addEventListener('drop', e => {
      e.preventDefault(); sq.classList.remove('drag-over');
      if(sq.dataset.corner==='1') return;
      const rr=+sq.dataset.r, cc=+sq.dataset.c;
      const raw = e.dataTransfer.getData('text');
      let piece = sbSelectedTool;
      try { const parsed=JSON.parse(raw); if(parsed&&parsed.type) piece=parsed; } catch(err){ if(raw) piece=raw; }
      if(is4p){
        sb4pBoard[rr][cc] = (typeof piece==='object'&&piece&&piece.type) ? Object.assign({},piece) : null;
        sb4pRenderBoardPieces();
      } else {
        sbBoard[rr][cc] = (typeof piece==='string') ? piece : null;
        sbRenderBoardPieces();
      }
    });
    sqDiv.appendChild(sq);
  }
}

// ── Render pieces on 2P board ──
function sbRenderBoardPieces(){
  const sz = sbSqSize, layer = document.getElementById('sandbox-board-pieces');
  layer.style.cssText='position:absolute;inset:0;pointer-events:none;';
  layer.innerHTML = '';
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p = sbBoard[r][c]; if(!p) continue;
    const div = document.createElement('div');
    div.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;left:${c*sz}px;top:${r*sz}px;display:flex;align-items:center;justify-content:center;`;
    div.innerHTML = `<div style="width:${sz*0.82}px;height:${sz*0.82}px;">${sbMakeMiniPieceSVG(p)}</div>`;
    layer.appendChild(div);
  }
}

// ── Render pieces on 4P board ──
function sb4pRenderBoardPieces(){
  if(!sb4pBoard){ document.getElementById('sandbox-board-pieces').innerHTML='<div style="color:rgba(245,200,0,0.5);font-family:serif;padding:20px;text-align:center;">Start a 4P game first to edit its board</div>'; return; }
  const sz=sb4pSqSize, layer=document.getElementById('sandbox-board-pieces');
  layer.style.cssText='position:absolute;inset:0;pointer-events:none;';
  layer.innerHTML='';
  for(let r=0;r<14;r++) for(let c=0;c<14;c++){
    const p=sb4pBoard[r][c]; if(!p) continue;
    const div=document.createElement('div');
    div.style.cssText=`position:absolute;width:${sz}px;height:${sz}px;left:${c*sz}px;top:${r*sz}px;display:flex;align-items:center;justify-content:center;`;
    div.innerHTML=`<div style="width:${sz*0.82}px;height:${sz*0.82}px;">${sbMakeMiniPieceSVG(p)}</div>`;
    layer.appendChild(div);
  }
}

// ── Board actions ──
function sbClearBoard(){
  if(sbCurrentTab==='2p'){
    sbBoard = Array.from({length:8},()=>Array(8).fill(null));
    sbRenderBoardPieces();
  } else {
    if(sb4pBoard) sb4pBoard = Array.from({length:14},()=>Array(14).fill(null));
    sb4pRenderBoardPieces();
  }
  document.getElementById('sb-status').textContent = 'Board cleared';
}

function sbResetToGame(){
  if(sbCurrentTab==='2p'){
    sbBoard = board.map(row=>[...row]);
    sbRenderBoardPieces();
  } else {
    sb4pBoard = fp&&fp.board ? fp.board.map(row=>row.map(c=>c?Object.assign({},c):null)) : null;
    sb4pRenderBoardPieces();
  }
  document.getElementById('sb-status').textContent = 'Reset to current game state';
}

function sbSetupDefault(){
  if(sbCurrentTab==='2p'){
    // Standard chess starting position
    const back = ['R','N','B','Q','K','B','N','R'];
    sbBoard = Array.from({length:8},()=>Array(8).fill(null));
    for(let c=0;c<8;c++){
      sbBoard[0][c]='b'+back[c];
      sbBoard[1][c]='bP';
      sbBoard[6][c]='wP';
      sbBoard[7][c]='w'+back[c];
    }
    sbRenderBoardPieces();
    document.getElementById('sb-status').textContent = 'Standard chess starting position';
  } else {
    // Standard 4P starting positions
    if(!sb4pBoard) sb4pBoard=Array.from({length:14},()=>Array(14).fill(null));
    else for(let r=0;r<14;r++) for(let c=0;c<14;c++) sb4pBoard[r][c]=null;
    const back4=['R','N','B','Q','K','B','N','R'];
    // Red (player 0) — bottom, cols 3-10, rows 12-13
    for(let i=0;i<8;i++){ sb4pBoard[13][3+i]={player:0,type:back4[i]}; sb4pBoard[12][3+i]={player:0,type:'P'}; }
    // Blue (player 1) — left, rows 3-10, cols 0-1
    for(let i=0;i<8;i++){ sb4pBoard[3+i][0]={player:1,type:back4[i]}; sb4pBoard[3+i][1]={player:1,type:'P'}; }
    // Yellow (player 2) — top, cols 3-10, rows 0-1
    for(let i=0;i<8;i++){ sb4pBoard[0][3+i]={player:2,type:back4[7-i]}; sb4pBoard[1][3+i]={player:2,type:'P'}; }
    // Green (player 3) — right, rows 3-10, cols 12-13
    for(let i=0;i<8;i++){ sb4pBoard[3+i][13]={player:3,type:back4[7-i]}; sb4pBoard[3+i][12]={player:3,type:'P'}; }
    sb4pRenderBoardPieces();
    document.getElementById('sb-status').textContent = '4P standard starting positions set';
  }
}

function sbApplyToGame(){
  if(sbCurrentTab==='2p'){
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) board[r][c]=sbBoard[r][c];
    turn='w'; selected=null; highlightMoves=[]; blockedMoves=[];
    enPassant=null; gameOver=false; history=[];
    castleRights={wK:false,wR_k:false,wR_q:false,bK:false,bR_k:false,bR_q:false};
    rebuildPieces(); renderSquares();
    document.getElementById('status').textContent='White to move';
    document.getElementById('msg').textContent='';
  } else {
    if(fp && fp.board && sb4pBoard){
      for(let r=0;r<14;r++) for(let c=0;c<14;c++) fp.board[r][c]=sb4pBoard[r][c]?Object.assign({},sb4pBoard[r][c]):null;
      fpDraw && fpDraw();
      document.getElementById('sb-status').textContent='4P board updated!';
    }
  }
  closeSandboxEditor();
}

