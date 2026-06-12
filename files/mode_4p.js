// ═══════════════════════════════
// SANDBOX MAP PICKER
// ═══════════════════════════════

const SANDBOX_MAPS = [
  {
    id: 'standard',
    name: 'Standard',
    desc: 'Classic chess setup',
    icon: '♟',
    board: () => initBoard()
  },
  {
    id: 'empty',
    name: 'Empty Board',
    desc: 'Blank slate — place pieces freely',
    icon: '⬜',
    board: () => Array.from({length:8},()=>Array(8).fill(null))
  },
  {
    id: 'pawns',
    name: 'Pawns Only',
    desc: 'Just pawns — promote race!',
    icon: '♙',
    board: () => {
      const b = Array.from({length:8},()=>Array(8).fill(null));
      for(let c=0;c<8;c++){ b[1][c]='bP'; b[6][c]='wP'; }
      b[0][4]='bK'; b[7][4]='wK';
      return b;
    }
  },
  {
    id: 'endgame',
    name: 'Endgame',
    desc: 'Kings, rooks & bishops only',
    icon: '♖',
    board: () => {
      const b = Array.from({length:8},()=>Array(8).fill(null));
      b[0][4]='bK'; b[0][0]='bR'; b[0][7]='bR'; b[1][2]='bB'; b[1][5]='bB';
      b[7][4]='wK'; b[7][0]='wR'; b[7][7]='wR'; b[6][2]='wB'; b[6][5]='wB';
      return b;
    }
  },
  {
    id: 'fortress',
    name: 'Fortress',
    desc: 'Pawns form a wall in the center',
    icon: '🧱',
    board: () => {
      const b = initBoard();
      // Extra pawn wall across row 4 for white, row 3 for black
      for(let c=0;c<8;c++){ if(!b[4][c]) b[4][c]='wP'; if(!b[3][c]) b[3][c]='bP'; }
      return b;
    }
  },
  {
    id: 'mirror',
    name: 'Mirror',
    desc: 'White setup mirrored on both sides',
    icon: '🪞',
    board: () => {
      const b = Array.from({length:8},()=>Array(8).fill(null));
      const back=['R','N','B','Q','K','B','N','R'];
      for(let c=0;c<8;c++){
        b[7][c]='w'+back[c]; b[6][c]='wP';
        b[0][c]='w'+back[c]; b[1][c]='wP';
        // Convert top row to black
        b[0][c]='b'+back[c]; b[1][c]='bP';
      }
      return b;
    }
  },
  {
    id: 'queensgambit',
    name: "Queen's Gambit",
    desc: 'Starts mid-game after 1.d4 d5 2.c4',
    icon: '♛',
    board: () => {
      const b = initBoard();
      // Apply the Queen's Gambit moves
      b[4][3]='wP'; b[6][3]=null; // 1.d4
      b[3][3]='bP'; b[1][3]=null; // 1...d5
      b[4][2]='wP'; b[6][2]=null; // 2.c4
      return b;
    }
  },
  {
    id: 'chaos',
    name: 'Chaos',
    desc: 'Random piece positions — anything goes!',
    icon: '🎲',
    board: () => {
      const b = Array.from({length:8},()=>Array(8).fill(null));
      const types=['R','N','B','Q','B','N','R'];
      // Place kings safely
      b[0][Math.floor(Math.random()*6)+1]='bK';
      b[7][Math.floor(Math.random()*6)+1]='wK';
      // Scatter random pieces
      const pieces=['wR','wN','wB','wQ','wR','wN','wP','wP','wP','wP',
                    'bR','bN','bB','bQ','bR','bN','bP','bP','bP','bP'];
      pieces.forEach(p=>{
        let attempts=0;
        while(attempts++<50){
          const r=Math.floor(Math.random()*6)+1, c=Math.floor(Math.random()*8);
          if(!b[r][c]){ b[r][c]=p; break; }
        }
      });
      return b;
    }
  },
  {
    id: 'kingsonly',
    name: 'Kings Only',
    desc: 'Just kings — add your own pieces',
    icon: '♔',
    board: () => {
      const b = Array.from({length:8},()=>Array(8).fill(null));
      b[0][4]='bK'; b[7][4]='wK';
      return b;
    }
  },
  {
    id: 'knights',
    name: 'Knights Tour',
    desc: 'All knights, no pawns — wild moves!',
    icon: '♞',
    board: () => {
      const b = Array.from({length:8},()=>Array(8).fill(null));
      b[0][4]='bK'; b[7][4]='wK';
      for(let c=0;c<8;c++){ b[0][c]= c===4?'bK':'bN'; b[7][c]= c===4?'wK':'wN'; }
      return b;
    }
  },
];

let sandboxPendingMap = null;

function buildMapPicker(){
  const grid = document.getElementById('sandbox-map-grid');
  if(!grid) return;
  grid.innerHTML = SANDBOX_MAPS.map(m => {
    let preview = '';
    try { preview = buildMiniBoard(m.board()); } catch(e) { preview = ''; }
    return `<div class="map-card" onclick="sandboxPickMap('${m.id}')">
      <div class="map-mini-board">${preview}</div>
      <div class="map-card-title">${m.icon} ${m.name}</div>
      <div class="map-card-desc">${m.desc}</div>
    </div>`;
  }).join('');
}

function buildMiniBoard(b){
  let html='';
  const glyphs={wP:'♙',wR:'♖',wN:'♘',wB:'♗',wQ:'♕',wK:'♔',
                bP:'♟',bR:'♜',bN:'♞',bB:'♝',bQ:'♛',bK:'♚'};
  const wCol='#e8f0ff', bCol='#d46a00';
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const light=(r+c)%2===0;
    const p=b[r][c];
    const g=glyphs[p]||'';
    const textCol = p ? (p[0]==='w'?'#fff':'#000') : 'transparent';
    html+=`<div class="map-mini-sq ${light?'l':'d'}" style="color:${textCol};text-shadow:${p?'0 0 2px #000':''}">${g}</div>`;
  }
  return html;
}

function showSandboxMapPicker(){
  buildMapPicker();
  const el = document.getElementById('sandbox-map-picker');
  if(el) el.classList.add('show');
}

function sandboxPickMap(mapId){
  const el = document.getElementById('sandbox-map-picker');
  if(el) el.classList.remove('show');

  // null = cancel, go back to mode select
  if(!mapId){
    showModeSelect();
    return;
  }

  const map = SANDBOX_MAPS.find(m=>m.id===mapId);
  if(!map){ mapId='standard'; }

  // Ensure app is visible before rendering
  document.getElementById('app').style.display='flex';

  whiteBotIdx=-1; botIdx=-1;
  try{
    document.getElementById('bot-btn-w').textContent='👤 Human ▾';
    document.getElementById('bot-btn-b').textContent='👤 Human ▾';
  }catch(e){}

  // Small delay ensures DOM is laid out and resize() gets correct dimensions
  setTimeout(()=>{
    resetGame();
    if(map){
      board = map.board();
      // Reset castle rights — only standard has normal castling setup
      castleRights = {w:{k:false,q:false},b:{k:false,q:false}};
      if(mapId==='standard') castleRights={w:{k:true,q:true},b:{k:true,q:true}};
      rebuildPieces();
      renderSquares();
    }
    buildSwatches(); buildBotButtons(); buildSSwatches();
    const sb=document.getElementById('playground-sidebar');
    if(sb) sb.classList.add('open');
  }, 50);
}

// ═══════════════════════════════════════════════
// 4-PLAYER CHESS ENGINE
// 14×14 board, corners cut (3×3 each), 4 players
// Turn order: 0=Red(bottom), 1=Blue(left), 2=Yellow(top), 3=Green(right)
// ═══════════════════════════════════════════════

const FP_SIZE = 14;
const FP_CORNER = 3;

// Piece colors per player
const FP_COLORS = ['#e03020','#2060cc','#f5c800','#22aa44'];
const FP_DARKS  = ['#8a1a10','#103880','#c49a00','#115522'];
const FP_NAMES  = ['Red','Blue','Yellow','Green'];
const FP_TURN_IDS = ['fourp-t0','fourp-t1','fourp-t2','fourp-t3'];

const FP_THEMES = [
  {l:'#dde8f0', d:'#7a9ab8', bg:'#000a3a', name:'Stevenson'},
  {l:'#f0d9b5', d:'#b58863', bg:'#2a1a08', name:'Walnut'},
  {l:'#dfe0c8', d:'#4a7fa5', bg:'#0a1a0a', name:'Ocean'},
  {l:'#e8e8e8', d:'#4a4a4a', bg:'#111',    name:'Stone'},
  {l:'#f5e6c8', d:'#b07a3e', bg:'#1a0800', name:'Bronze'},
  {l:'#f0e0e0', d:'#a04040', bg:'#1a0000', name:'Ruby'},
  {l:'#e8e0f0', d:'#6a4a9a', bg:'#0a0020', name:'Amethyst'},
  {l:'#1a1a2e', d:'#16213e', bg:'#000',    name:'Midnight'},
];
let fpThemeIdx = 0;

function toggleFpPicker(){
  const p=document.getElementById('fourp-picker');
  p.style.display=p.style.display==='flex'?'none':'flex';
}

function fpBuildSwatches(){
  const el=document.getElementById('fourp-swatches'); if(!el) return;
  el.innerHTML='';
  FP_THEMES.forEach((t,i)=>{
    const w=document.createElement('div');
    w.title=t.name;
    w.style.cssText=`width:22px;height:22px;cursor:pointer;border:2px solid ${i===fpThemeIdx?'#c9a84c':'rgba(201,168,76,0.2)'};border-radius:2px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;`;
    w.innerHTML=`<div style="background:${t.l}"></div><div style="background:${t.d}"></div><div style="background:${t.d}"></div><div style="background:${t.l}"></div>`;
    w.onclick=()=>{ fpThemeIdx=i; fpBuildSwatches(); fpDraw(); };
    el.appendChild(w);
  });
}

let fp = {
  board: null,
  turn: 0,
  selected: null,
  moves: [],
  eliminated: [false,false,false,false],
  sqSize: 44,
  gameOver: false,
  botIdxs: [null, 1, 3, 5],
  teams: ['A','B','C','D'],
  cornerSpeech: {0:null,1:null,2:null,3:null},
  speechOn: true,
  moveLog: [],
  captured: [[],[],[],[]],
  // NEW7: animation state
  anim: null, // {fr,fc,tr,tc,piece,progress,startTime,duration}
};

function fpInBounds(r, c) {
  if(r < 0 || r >= FP_SIZE || c < 0 || c >= FP_SIZE) return false;
  // cut 3×3 corners
  if(r < FP_CORNER && c < FP_CORNER) return false;
  if(r < FP_CORNER && c >= FP_SIZE - FP_CORNER) return false;
  if(r >= FP_SIZE - FP_CORNER && c < FP_CORNER) return false;
  if(r >= FP_SIZE - FP_CORNER && c >= FP_SIZE - FP_CORNER) return false;
  return true;
}

function fpPiece(player, type) { return {player, type}; }

function fpInitBoard() {
  const b = Array.from({length: FP_SIZE}, () => Array(FP_SIZE).fill(null));

  // Helper: place back row + pawn row for each player
  // Red: rows 12-13, cols 3-10
  const redBack  = ['R','N','B','Q','K','B','N','R'];
  for(let i = 0; i < 8; i++) {
    b[13][3+i] = fpPiece(0, redBack[i]);
    b[12][3+i] = fpPiece(0, 'P');
  }
  // Blue: cols 0-1, rows 3-10
  const blueBack = ['R','N','B','K','Q','B','N','R'];
  for(let i = 0; i < 8; i++) {
    b[3+i][0] = fpPiece(1, blueBack[i]);
    b[3+i][1] = fpPiece(1, 'P');
  }
  // Yellow: rows 0-1, cols 3-10
  const yellBack = ['R','N','B','K','Q','B','N','R'];
  for(let i = 0; i < 8; i++) {
    b[0][3+i] = fpPiece(2, yellBack[i]);
    b[1][3+i] = fpPiece(2, 'P');
  }
  // Green: cols 12-13, rows 3-10
  const grnBack  = ['R','N','B','Q','K','B','N','R'];
  for(let i = 0; i < 8; i++) {
    b[3+i][13] = fpPiece(3, grnBack[i]);
    b[3+i][12] = fpPiece(3, 'P');
  }
  return b;
}

// Pawn move directions per player
const FP_PAWN_DIR = [
  {dr:-1,dc:0},  // Red moves up
  {dr:0,dc:1},   // Blue moves right
  {dr:1,dc:0},   // Yellow moves down
  {dr:0,dc:-1},  // Green moves left
];
// Pawn start rows/cols per player
const FP_PAWN_START = [12, 1, 1, 12]; // row for red/yellow, col for blue/green

function fpSameTeam(p1, p2){
  if(p1===p2) return true;
  return fp.teams[p1]===fp.teams[p2];
}

function fpRawMoves(b, r, c) {
  const p = b[r][c]; if(!p) return [];
  const {player: pl, type: t} = p;
  const moves = [];
  const canLand=(nr,nc)=>{ const op=b[nr][nc]; return !op || !fpSameTeam(pl,op.player); };
  const add = (nr, nc) => { if(fpInBounds(nr,nc)&&canLand(nr,nc)) moves.push({r:nr,c:nc}); };

  if(t === 'P') {
    const {dr, dc} = FP_PAWN_DIR[pl];
    const nr1 = r+dr, nc1 = c+dc;
    if(fpInBounds(nr1,nc1) && !b[nr1][nc1]) {
      add(nr1, nc1);
      // double push from start
      const onStart = (pl===0||pl===2) ? (r===FP_PAWN_START[pl]) : (c===FP_PAWN_START[pl]);
      const nr2=r+2*dr, nc2=c+2*dc;
      if(onStart && fpInBounds(nr2,nc2) && !b[nr2][nc2]) add(nr2,nc2);
    }
    // captures diagonally in pawn's forward direction
    const capDirs = pl===0||pl===2
      ? [{dr,dc:1},{dr,dc:-1}]
      : [{dr:1,dc},{dr:-1,dc}];
    capDirs.forEach(({dr:cdr,dc:cdc})=>{
      const cr=r+cdr,cc=c+cdc;
      if(fpInBounds(cr,cc) && b[cr][cc] && !fpSameTeam(pl,b[cr][cc].player))
        moves.push({r:cr,c:cc});
    });
  } else if(t === 'N') {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc])=>{
      const nr=r+dr,nc=c+dc;
      if(fpInBounds(nr,nc) && (!b[nr][nc]||!fpSameTeam(pl,b[nr][nc].player))) add(nr,nc);
    });
  } else if(t === 'K') {
    [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>{
      const nr=r+dr,nc=c+dc;
      if(fpInBounds(nr,nc) && (!b[nr][nc]||!fpSameTeam(pl,b[nr][nc].player))) add(nr,nc);
    });
  } else {
    const dirs = t==='R'?[[0,1],[0,-1],[1,0],[-1,0]]
               : t==='B'?[[1,1],[1,-1],[-1,1],[-1,-1]]
               : [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
    dirs.forEach(([dr,dc])=>{
      let nr=r+dr,nc=c+dc;
      while(fpInBounds(nr,nc)){
        if(b[nr][nc]){
          if(!fpSameTeam(pl,b[nr][nc].player)) moves.push({r:nr,c:nc});
          break;
        }
        moves.push({r:nr,c:nc});
        nr+=dr; nc+=dc;
      }
    });
  }
  return moves;
}

function fpFindKing(b, player) {
  for(let r=0;r<FP_SIZE;r++) for(let c=0;c<FP_SIZE;c++)
    if(b[r][c] && b[r][c].player===player && b[r][c].type==='K') return {r,c};
  return null;
}

function fpIsAttacked(b, r, c, byPlayer) {
  for(let i=0;i<FP_SIZE;i++) for(let j=0;j<FP_SIZE;j++)
    if(b[i][j] && b[i][j].player===byPlayer)
      if(fpRawMoves(b,i,j).some(m=>m.r===r&&m.c===c)) return true;
  return false;
}

function fpIsInCheck(b, player) {
  const k = fpFindKing(b, player); if(!k) return false;
  for(let p=0;p<4;p++) {
    if(fpSameTeam(p, player)) continue; // teammates don't threaten your king
    if(fpIsAttacked(b,k.r,k.c,p)) return true;
  }
  return false;
}

function fpApplyMove(b, r, c, nr, nc) {
  const nb = b.map(row=>[...row]);
  nb[nr][nc] = nb[r][c];
  nb[r][c] = null;
  // Pawn promotion
  if(nb[nr][nc] && nb[nr][nc].type==='P') {
    const pl=nb[nr][nc].player;
    if((pl===0&&nr===0)||(pl===2&&nr===13)||(pl===1&&nc===13)||(pl===3&&nc===0))
      nb[nr][nc]={player:pl,type:'Q'};
  }
  return nb;
}

function fpLegalMoves(b, r, c, eliminated) {
  const p=b[r][c]; if(!p) return [];
  const pl=p.player;
  // Bug6: filter out moves that land on eliminated players' squares (already removed but guard)
  const raw=fpRawMoves(b,r,c).filter(({r:nr,c:nc})=>{
    const target=b[nr][nc];
    if(target&&eliminated&&eliminated[target.player]) return true; // can capture eliminated pieces? no: skip
    return true;
  });
  return raw.filter(({r:nr,c:nc})=>{
    try{
      const nb=fpApplyMove(b,r,c,nr,nc);
      return !fpIsInCheck(nb,pl);
    }catch(e){return false;}
  });
}

function fpAllLegalMoves(b, player, eliminated) {
  const moves=[];
  for(let r=0;r<FP_SIZE;r++) for(let c=0;c<FP_SIZE;c++)
    if(b[r][c] && b[r][c].player===player)
      fpLegalMoves(b,r,c,eliminated).forEach(m=>moves.push({fr:r,fc:c,...m}));
  return moves;
}

const FP_PIECE_GLYPHS = {P:'',R:'R',N:'N',B:'B',Q:'Q',K:'K'};
const FP_FILES = 'abcdefghijklmno';

function fpToSAN(fr, fc, tr, tc, piece, isCapture, board){
  const t = piece.type;
  if(t==='K' && Math.abs(fc-tc)===2) return tc>fc ? 'O-O' : 'O-O-O';
  let s = t!=='P' ? t : '';
  if(t==='P' && isCapture) s += FP_FILES[fc];
  if(isCapture) s += 'x';
  s += FP_FILES[tc] + (FP_SIZE - tr);
  if(tr===0||tr===FP_SIZE-1||tc===0||tc===FP_SIZE-1) if(t==='P') s += '=Q';
  return s;
}

function fpRecordCapture(tr, tc, capturer){
  const victim = fp.board[tr][tc];
  if(victim && victim.player !== capturer){
    if(!fp.captured[capturer]) fp.captured[capturer]=[];
    fp.captured[capturer].push({player: victim.player, type: victim.type});
    fpRenderCaptured();
  }
}

function fpRecordMove(fr, fc, tr, tc, movingPlayer, wasCapture){
  const piece = fp.board[tr][tc];
  if(!piece) return;
  const san = fpToSAN(fr, fc, tr, tc, piece, wasCapture, fp.board);
  fp.moveLog.push({player: movingPlayer, san, turn: fp.moveLog.length+1});
  fpRenderMoveLog();
  const _dl=document.getElementById('fp-dialogue-list');if(_dl)_dl.innerHTML='';
}

function fpRenderCaptured(){
  const el=document.getElementById('fourp-captured-list');
  if(!el) return;
  const colors=['#e03020','#2060cc','#f5c800','#22aa44'];
  const names=['Red','Blue','Yel','Grn'];
  const typeOrder={Q:0,R:1,B:2,N:3,P:4,K:5};
  const glyphs={P:'♟',R:'♜',N:'♞',B:'♝',Q:'♛',K:'♚'};
  // Tally all captured pieces grouped by victim player
  const totals={};
  for(let capturer=0;capturer<4;capturer++){
    (fp.captured[capturer]||[]).forEach(c=>{
      const key=c.player+'_'+c.type;
      totals[key]=(totals[key]||0)+1;
    });
  }
  // Build per-player rows
  let html='';
  for(let p=0;p<4;p++){
    const cap=fp.captured[p]||[];
    if(!cap.length) continue;
    // Sort by piece value
    const sorted=[...cap].sort((a,b)=>(typeOrder[a.type]||9)-(typeOrder[b.type]||9));
    // Build piece icons
    const icons=sorted.map(c=>{
      const victimCol=colors[c.player];
      return `<span title="${names[c.player]} ${c.type}" style="color:${victimCol};text-shadow:0 0 3px #000,0 0 2px #000;font-size:15px;line-height:1;">${glyphs[c.type]||c.type}</span>`;
    }).join('');
    html+=`<div style="display:flex;align-items:center;gap:5px;padding:3px 8px;border-bottom:1px solid rgba(245,200,0,0.08);">
      <span style="color:${colors[p]};font-weight:700;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;width:26px;flex-shrink:0;font-family:'Courier Prime',monospace;">${names[p]}</span>
      <span style="flex:1;display:flex;flex-wrap:wrap;gap:1px;align-items:center;">${icons}</span>
      <span style="color:rgba(245,200,0,0.5);font-size:10px;font-family:'Courier Prime',monospace;flex-shrink:0;">${cap.length}</span>
    </div>`;
  }
  el.innerHTML=html||`<div style="color:rgba(245,200,0,0.3);font-size:11px;font-style:italic;text-align:center;padding:8px;font-family:'EB Garamond',Georgia,serif;">No captures yet</div>`;
}

function fpRenderMoveLog(){
  const list = document.getElementById('fourp-move-list');
  const footer = document.getElementById('fourp-move-footer');
  if(!list) return;
  const colors = ['#e03020','#2060cc','#f5c800','#22aa44'];
  const names = ['Red','Blue','Yel','Grn'];
  list.innerHTML = fp.moveLog.slice(-40).map((m,i)=>{
    const col = colors[m.player];
    const name = names[m.player];
    return `<div style="display:flex;align-items:center;gap:4px;padding:2px 8px;font-family:'Courier Prime',monospace;font-size:11px;border-bottom:1px solid rgba(255,255,255,0.05);">
      <span style="color:${col};font-weight:700;width:28px;flex-shrink:0;">${name}</span>
      <span style="color:#ddd;">${m.san}</span>
    </div>`;
  }).join('');
  list.scrollTop = list.scrollHeight;
  if(footer) footer.textContent = fp.moveLog.length + ' move' + (fp.moveLog.length!==1?'s':'');
}

// ── NEW7: Animated piece slide for 4P ──
function fpAnimateMove(fr,fc,tr,tc,piece,onDone){
  const duration=160;
  const startTime=performance.now();
  fp.anim={fr,fc,tr,tc,piece,progress:0,startTime,duration};
  function frame(now){
    const t=Math.min(1,(now-startTime)/duration);
    fp.anim.progress=t;
    fpDraw();
    if(t<1) requestAnimationFrame(frame);
    else{fp.anim=null;fpDraw();if(onDone)onDone();}
  }
  requestAnimationFrame(frame);
}

// ── Canvas Renderer ──
function fpDraw() {
  const canvas = document.getElementById('fourp-canvas');
  if(!canvas) return;
  const sz = fp.sqSize;
  const total = FP_SIZE * sz;
  canvas.width = total;
  canvas.height = total;
  // Bug3: enforce strict square
  canvas.style.width = total + 'px';
  canvas.style.height = total + 'px';
  const ctx = canvas.getContext('2d');

  // Board squares
  const theme = FP_THEMES[fpThemeIdx];
  for(let r=0;r<FP_SIZE;r++) for(let c=0;c<FP_SIZE;c++) {
    if(!fpInBounds(r,c)) { ctx.fillStyle=theme.bg; ctx.fillRect(c*sz,r*sz,sz,sz); continue; }
    const light=(r+c)%2===0;
    ctx.fillStyle = light ? theme.l : theme.d;
    ctx.fillRect(c*sz,r*sz,sz,sz);
  }

  // Highlights
  if(fp.selected) {
    const {r,c}=fp.selected;
    ctx.fillStyle='rgba(245,200,0,0.5)';
    ctx.fillRect(c*sz,r*sz,sz,sz);
    fp.moves.forEach(({r:nr,c:nc})=>{
      if(fp.board[nr][nc]) {
        ctx.strokeStyle='rgba(245,200,0,0.9)';
        ctx.lineWidth=4;
        ctx.strokeRect(nc*sz+2,nr*sz+2,sz-4,sz-4);
      } else {
        ctx.fillStyle='rgba(245,200,0,0.55)';
        ctx.beginPath();
        ctx.arc(nc*sz+sz/2,nr*sz+sz/2,sz*0.18,0,Math.PI*2);
        ctx.fill();
      }
    });
  }

  // Centre S overlay - drawn BEFORE pieces so pieces appear on top
  ctx.save();
  ctx.globalAlpha=1.0;
  ctx.font=`bold ${Math.round(total*0.28)}px 'Cinzel Decorative',Georgia,serif`;
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle=sColor;
  ctx.fillText('S', total/2, total/2);
  ctx.restore();

  // Pieces (NEW7: skip animated piece at source, draw interpolated)
  for(let r=0;r<FP_SIZE;r++) for(let c=0;c<FP_SIZE;c++) {
    const p=fp.board[r][c]; if(!p) continue;
    // Skip the animated piece at destination during animation (draw it separately below)
    if(fp.anim && r===fp.anim.tr && c===fp.anim.tc) continue;
    fpDrawPiece(ctx, p.player, p.type, c*sz, r*sz, sz);
  }
  // Draw animated sliding piece
  if(fp.anim){
    const a=fp.anim;
    const t=a.progress;
    const ease=t<0.5?2*t*t:(1-Math.pow(-2*t+2,2)/2); // easeInOutQuad
    const ax=(a.fc+(a.tc-a.fc)*ease)*sz;
    const ay=(a.fr+(a.tr-a.fr)*ease)*sz;
    ctx.save();
    ctx.globalAlpha=0.92;
    fpDrawPiece(ctx, a.piece.player, a.piece.type, ax, ay, sz);
    ctx.restore();
  }

  // The Don's wall — draw if any player slot has The Don
  const donInGame = isDonActive();
  if(donInGame){
    const wallH = Math.max(3, Math.round(sz/8));
    const totalW = sz * FP_SIZE;
    const mid = sz * 7; // between rows/cols 6 and 7

    // Horizontal wall (across full board)
    const wallY = mid - Math.floor(wallH/2);
    for(let x=0; x<totalW; x+=28){
      ctx.fillStyle = (Math.floor(x/28)%2===0) ? '#cc6633' : '#b85c2a';
      ctx.fillRect(x, wallY, Math.min(28, totalW-x), wallH);
    }
    ctx.strokeStyle='#7a3800'; ctx.lineWidth=1;
    ctx.strokeRect(0, wallY, totalW, wallH);

    // Vertical wall (down full board)
    const wallX = mid - Math.floor(wallH/2);
    for(let y=0; y<totalW; y+=28){
      ctx.fillStyle = (Math.floor(y/28)%2===0) ? '#b85c2a' : '#cc6633';
      ctx.fillRect(wallX, y, wallH, Math.min(28, totalW-y));
    }
    ctx.strokeStyle='#7a3800'; ctx.lineWidth=1;
    ctx.strokeRect(wallX, 0, wallH, totalW);
  }

  // Corner name tags — sized to fit inside the 3×3 cut corners (FP_CORNER * sz)
  const cornerSize = FP_CORNER * sz; // exactly the cut corner area
  const corners = [
    {ax:'left',  ay:'bottom', player:0},  // Red: bottom-left
    {ax:'left',  ay:'top',    player:1},  // Blue: top-left
    {ax:'right', ay:'top',    player:2},  // Yellow: top-right
    {ax:'right', ay:'bottom', player:3},  // Green: bottom-right
  ];
  corners.forEach(({ax,ay,player})=>{
    if(fp.eliminated[player]) return;
    const botI = fp.botIdxs[player];
    const botData = botI!=null ? BOT_CHAT_LIST[botI] : null;
    const name = botI!=null ? BOTS[botI].name.replace(/\s*\(\d+\)/,'') : 'Human';
    const avatar = botData ? botData.avatar : '👤';
    const isActive = fp.turn===player && !fp.gameOver;
    const col = FP_COLORS[player];

    // Position box exactly in the corner cutout
    const bx = ax==='left' ? 2 : total - cornerSize + 2;
    const by = ay==='top'  ? 2 : total - cornerSize + 2;
    const boxW = cornerSize - 4;
    const boxH = cornerSize - 4;

    ctx.save();

    // Background
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = isActive ? col : '#0a0a0a';
    ctx.strokeStyle = isActive ? '#f5c800' : col;
    ctx.lineWidth = isActive ? 3 : 2;
    fpRoundRect(ctx, bx, by, boxW, boxH, 6);
    ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 1;

    // Avatar — centred top half
    ctx.font = `${Math.round(boxH * 0.38)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(avatar, bx + boxW/2, by + boxH * 0.32);

    // Name — bottom half
    ctx.font = `bold ${Math.round(boxH * 0.18)}px 'EB Garamond',Georgia,serif`;
    ctx.fillStyle = isActive ? '#fff' : '#ccc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Truncate name to fit
    let nameStr = name.slice(0, 10);
    while(nameStr.length > 3 && ctx.measureText(nameStr).width > boxW - 8) nameStr = nameStr.slice(0,-1);
    ctx.fillText(nameStr, bx + boxW/2, by + boxH * 0.62);

    // Team badge
    const team = fp.teams[player];
    const teamCols = {A:'#c0392b', B:'#1a3a7a', C:'#5a2a00', D:'#0a4a20'};
    const badgeW = boxW * 0.55, badgeH = boxH * 0.2;
    const badgeX = bx + (boxW - badgeW)/2;
    const badgeY = by + boxH * 0.78;
    ctx.fillStyle = teamCols[team] || '#333';
    fpRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, 3);
    ctx.fill();
    ctx.font = `bold ${Math.round(badgeH * 0.7)}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Team ' + team, badgeX + badgeW/2, badgeY + badgeH/2);

    ctx.restore();
  });

  // Grid border
  ctx.strokeStyle='#f5c800';
  ctx.lineWidth=3;
  ctx.strokeRect(0,0,total,total);

  // Bug3: Coordinate labels A-N (cols) and 1-14 (rows) drawn as HTML overlay
  fpDrawCoordLabels(total, sz);
}

function fpDrawCoordLabels(total, sz){
  let labelsDiv=document.getElementById('fp-coord-labels');
  if(!labelsDiv){
    labelsDiv=document.createElement('div');
    labelsDiv.id='fp-coord-labels';
    labelsDiv.style.cssText='position:absolute;top:0;left:0;pointer-events:none;z-index:5;';
    const wrap=document.getElementById('fourp-board-wrap');
    if(wrap) wrap.style.position='relative', wrap.appendChild(labelsDiv);
  }
  const canvas=document.getElementById('fourp-canvas');
  if(!canvas) return;
  const rect=canvas.getBoundingClientRect();
  const wrapRect=document.getElementById('fourp-board-wrap').getBoundingClientRect();
  const offX=rect.left-wrapRect.left;
  const offY=rect.top-wrapRect.top;
  const colLabels='ABCDEFGHIJKLMN';
  const lSz=Math.max(9,Math.round(sz*0.26));
  let html='';
  for(let c=0;c<FP_SIZE;c++){
    const x=offX+c*sz+sz/2;
    html+=`<div style="position:absolute;left:${x}px;top:${offY-lSz-2}px;transform:translateX(-50%);font-family:'Courier Prime',monospace;font-size:${lSz}px;font-weight:700;color:#f5c800;line-height:1;">${colLabels[c]}</div>`;
    html+=`<div style="position:absolute;left:${x}px;top:${offY+total+2}px;transform:translateX(-50%);font-family:'Courier Prime',monospace;font-size:${lSz}px;font-weight:700;color:#f5c800;line-height:1;">${colLabels[c]}</div>`;
  }
  for(let r=0;r<FP_SIZE;r++){
    const y=offY+r*sz+sz/2;
    const lbl=String(FP_SIZE-r);
    html+=`<div style="position:absolute;right:${wrapRect.width-offX+2}px;top:${y}px;transform:translateY(-50%);font-family:'Courier Prime',monospace;font-size:${lSz}px;font-weight:700;color:#f5c800;line-height:1;">${lbl}</div>`;
    html+=`<div style="position:absolute;left:${offX+total+2}px;top:${y}px;transform:translateY(-50%);font-family:'Courier Prime',monospace;font-size:${lSz}px;font-weight:700;color:#f5c800;line-height:1;">${lbl}</div>`;
  }
  labelsDiv.innerHTML=html;
}

function fpRoundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

function fpDrawPiece(ctx, player, type, x, y, sz) {
  let _donPlayer=-1;try{_donPlayer=fp.botIdxs.findIndex(idx=>idx!=null&&BOTS[idx]&&(BOTS[idx].isTrump||BOTS[idx].name.includes('The Don')));}catch(e){}
  const _isDonPiece=_donPlayer>=0&&player===_donPlayer;
  const col =_isDonPiece?'#ff6a00':FP_COLORS[player];
  const dark=_isDonPiece?'#7a3000':FP_DARKS[player];

  // Always use white sprites as base, then tint to player color (except The Don keeps orange)
  const imgKey='w'+type;
  const imgSrc=PIECE_IMGS[imgKey];

  if(imgSrc){
    if(!fpDrawPiece._cache) fpDrawPiece._cache={};
    const cacheKey=imgKey;
    if(!fpDrawPiece._cache[cacheKey]){
      const img=new Image();
      img.src=imgSrc;
      fpDrawPiece._cache[cacheKey]=img;
    }
    const img=fpDrawPiece._cache[cacheKey];
    if(img.complete&&img.naturalWidth>0){
      ctx.save();
      const pad=sz*0.1;
      const pw=sz-pad*2, ph=sz-pad*2;

      // Draw piece tinted to player color using multiply composite
      // First draw the piece normally into an offscreen canvas, then tint
      const off=document.createElement('canvas');
      off.width=sz; off.height=sz;
      const oc=off.getContext('2d');
      oc.drawImage(img,pad,pad,pw,ph);

      // Tint: draw color overlay with multiply
      oc.globalCompositeOperation='multiply';
      oc.fillStyle=col;
      oc.fillRect(pad,pad,pw,ph);

      // Restore alpha from original image
      oc.globalCompositeOperation='destination-in';
      oc.drawImage(img,pad,pad,pw,ph);

      // Draw shadow/outline in dark color for contrast
      ctx.shadowColor='rgba(0,0,0,0.7)';
      ctx.shadowBlur=3;
      ctx.drawImage(off,x,y);
      ctx.restore();
      return;
    }
    // Trigger load then redraw
    if(!img.onload) img.onload=()=>fpDraw();
  }

  // Fallback: glyph only
  ctx.save();
  const glyphs={P:'♟',R:'♜',N:'♞',B:'♝',Q:'♛',K:'♚'};
  ctx.fillStyle=col;
  ctx.font=`bold ${sz*0.65}px serif`;
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(glyphs[type]||'?',x+sz/2,y+sz/2+sz*0.05);
  ctx.restore();
}

function fpCrossesWall(sr, nr, sc, nc){
  // Horizontal wall between rows 6 and 7
  const crossH = (sr<=6&&nr>=7)||(sr>=7&&nr<=6);
  // Vertical wall between cols 6 and 7
  const crossV = (sc<=6&&nc>=7)||(sc>=7&&nc<=6);
  return crossH || crossV;
}

function fpDeportCheck(sr, sc, nr, nc, movingPlayer, afterFn){
  // Only deport if The Don is in the game
  const donInGame = isDonActive();
  if(!donInGame){ if(afterFn) afterFn(); return; }

  // Don's own team doesn't get deported
  const donPlayer = fp.botIdxs.findIndex(idx=>idx!=null&&BOTS[idx]&&(BOTS[idx].name.includes('The Don')||BOTS[idx].isTrump));

  if(fpCrossesWall(sr,nr,sc,nc) && Math.random()<0.5){
    setTimeout(()=>{
      const piece = fp.board[nr][nc];
      if(!piece){ if(afterFn) afterFn(); return; }
      fp.board[nr][nc] = null;
      fp.board[sr][sc] = piece;
      // Undo the turn that was already advanced in fpNextTurn
      let prev = (fp.turn+3)%4;
      let tries=0;
      while(fp.eliminated[prev]&&tries<4){ prev=(prev+3)%4; tries++; }
      fp.turn = prev;
      fpUpdateTurnBar();
      document.getElementById('fourp-status').textContent = FP_NAMES[fp.turn]+' to move (DEPORTED!)';
      fpDraw();
      cheatMsg('🧱 DEPORTED BACK ACROSS THE WALL','#ff6a00');
      // Show Don speech
      const donI = fp.botIdxs[donPlayer];
      if(donI!=null) fpShowCornerSpeech(donPlayer, 'onWall');
      // Now it's the deported player's turn again
      if(fp.botIdxs[fp.turn] !== null && !fp.gameOver) setTimeout(fpDoBotMove, botMoveDelay);
      if(afterFn) afterFn();
    }, 400);
  } else {
    if(afterFn) afterFn();
  }
}

function fpHandleClick(e) {
  if(fp.gameOver || fp.botIdxs[fp.turn] !== null) return;
  const canvas=document.getElementById('fourp-canvas');
  const rect=canvas.getBoundingClientRect();
  const scaleX=canvas.width/rect.width;
  const scaleY=canvas.height/rect.height;
  const x=(e.clientX-rect.left)*scaleX;
  const y=(e.clientY-rect.top)*scaleY;
  const c=Math.floor(x/fp.sqSize);
  const r=Math.floor(y/fp.sqSize);
  if(!fpInBounds(r,c)) return;

  if(fp.selected) {
    const move=fp.moves.find(m=>m.r===r&&m.c===c);
    if(move) {
      const sr=fp.selected.r, sc2=fp.selected.c;
      const movingPlayer=fp.turn;
      const wasCapture = !!(fp.board[r][c] && fp.board[r][c].player !== movingPlayer);
      const movingPiece=fp.board[sr][sc2];
      fp.selected=null; fp.moves=[];
      // NEW7: animate slide then commit
      fpAnimateMove(sr,sc2,r,c,movingPiece,()=>{
        if(wasCapture) fpRecordCapture(r,c,movingPlayer);
        fp.board=fpApplyMove(fp.board,sr,sc2,r,c);
        fpRecordMove(sr,sc2,r,c,movingPlayer,wasCapture);
        fpNextTurn();
        fpDraw();
        fpDeportCheck(sr,sc2,r,c,movingPlayer,()=>{
          if(fp.botIdxs[fp.turn] !== null && !fp.gameOver) setTimeout(fpDoBotMove, botMoveDelay);
        });
      });
      return;
    }
    fp.selected=null; fp.moves=[];
  }

  const p=fp.board[r][c];
  if(p && p.player===fp.turn && !fp.eliminated[fp.turn]) {
    const legal=fpLegalMoves(fp.board,r,c,fp.eliminated);
    fp.selected={r,c};
    fp.moves=legal;
  }
  fpDraw();
}

function fpNextTurn() {
  // Check if current player's king was captured
  for(let p=0;p<4;p++){
    if(!fp.eliminated[p] && !fpFindKing(fp.board,p)){
      fp.eliminated[p]=true;
      const row=document.getElementById(`fourp-t${p}`);
      if(row){ row.style.opacity='0.3'; row.style.textDecoration='line-through'; }
    }
  }

  // NEW2: Check winner — team mode: a team wins when all opponents eliminated
  const alive = fp.eliminated.map((e,i)=>!e&&i).filter(v=>v!==false);
  if(alive.length <= 1){
    fp.gameOver = true;
    const winner = alive.length===1 ? alive[0] : fp.eliminated.findIndex(e=>!e);
    const winTeam = winner>=0 ? fp.teams[winner] : null;
    if(winTeam){
      const teamMembers = FP_NAMES.filter((_,i)=>fp.teams[i]===winTeam).join(' & ');
      document.getElementById('fourp-status').textContent=`Team ${winTeam} wins! (${teamMembers})`;
      document.getElementById('fourp-msg').textContent='🏆';
      show4PWinScreen(winTeam, teamMembers, winner);
    } else {
      document.getElementById('fourp-status').textContent='Draw!';
      document.getElementById('fourp-msg').textContent='🤝';
    }
    fpUpdateTurnBar();
    return;
  }
  // Check if all alive players are on the same team
  const aliveTeams = [...new Set(alive.map(i=>fp.teams[i]))];
  if(aliveTeams.length===1){
    fp.gameOver=true;
    const winTeam=aliveTeams[0];
    const teamMembers=FP_NAMES.filter((_,i)=>fp.teams[i]===winTeam).join(' & ');
    document.getElementById('fourp-status').textContent=`Team ${winTeam} wins! (${teamMembers})`;
    document.getElementById('fourp-msg').textContent='🏆';
    const winnerIdx=[0,1,2,3].find(p=>!fp.eliminated[p]&&fp.teams[p]===winTeam);
    show4PWinScreen(winTeam, teamMembers, winnerIdx!=null?winnerIdx:0);
    fpUpdateTurnBar();
    [0,1,2,3].forEach(p=>{ if(!fp.eliminated[p]) setTimeout(()=>fpShowCornerSpeech(p,'onWin'),p*400); });
    [0,1,2,3].forEach(p=>{ if(fp.eliminated[p]) setTimeout(()=>fpShowCornerSpeech(p,'onLose'),600+p*400); });
    return;
  }

  // Bug6: Advance turn, skip eliminated players with strict guard
  let next=(fp.turn+1)%4;
  let tries=0;
  while(fp.eliminated[next] && tries<4){ next=(next+1)%4; tries++; }
  if(tries>=4){ fp.gameOver=true; return; } // all eliminated
  fp.turn=next;
  fpUpdateTurnBar();

  // Check stalemate/checkmate for new player
  const moves=fpAllLegalMoves(fp.board,fp.turn,fp.eliminated);
  const inCheck=fpIsInCheck(fp.board,fp.turn);
  if(!moves.length){
    if(inCheck){
      fp.eliminated[fp.turn]=true;
      const row=document.getElementById(`fourp-t${fp.turn}`);
      if(row){ row.style.opacity='0.3'; row.style.textDecoration='line-through'; }
      fpNextTurn();
    } else {
      document.getElementById('fourp-msg').textContent=FP_NAMES[fp.turn]+' is stalemated';
      fp.eliminated[fp.turn]=true;
      const row=document.getElementById(`fourp-t${fp.turn}`);
      if(row){ row.style.opacity='0.3'; row.style.textDecoration='line-through'; }
      fpNextTurn();
    }
    return;
  }
  document.getElementById('fourp-status').textContent=FP_NAMES[fp.turn]+' to move'+(inCheck?' · Check':'');
  document.getElementById('fourp-msg').textContent='';

  // Speech on check
  if(inCheck) fpShowCornerSpeech(fp.turn, 'onCheck');

  // If current player is a bot, trigger their move
  if(fp.botIdxs[fp.turn] !== null && !fp.gameOver) setTimeout(fpDoBotMove, botMoveDelay);
}

function fpSetTeam(player, team){
  fp.teams[player] = team;
  fpUpdateTeamDisplay();
  fpBuildBotMenus(); // re-check bot availability
}

function fpUpdateTeamDisplay(){
  const teamColors = {A:'#c0392b', B:'#1a3a7a', C:'#5a2a00', D:'#0a4a20'};
  const names = ['Red','Blue','Yellow','Green'];

  [0,1,2,3].forEach(p=>{
    const t = fp.teams[p];
    ['a','b','c','d'].forEach(letter=>{
      const btn = document.getElementById(`fp-team${p}-${letter}`);
      if(!btn) return;
      const team = letter.toUpperCase();
      const active = t===team;
      btn.style.background = active ? (teamColors[team]||'#555') : '#333';
      btn.style.color = active ? '#fff' : '#888';
    });
  });

  // Update summary
  const summary = document.getElementById('fp-team-summary');
  if(summary){
    const teamMap = {A:[],B:[],C:[],D:[]};
    names.forEach((n,i)=>{ if(teamMap[fp.teams[i]]) teamMap[fp.teams[i]].push(n); });
    summary.textContent = ['A','B','C','D']
      .filter(t=>teamMap[t].length)
      .map(t=>`${t}: ${teamMap[t].join(' & ')}`)
      .join(' · ');
  }
}

function fpBotAllowed(player, botIdx){
  // Bug2: Allow up to 3 identical bots per team
  const usedBy = [0,1,2,3].filter(p => p!==player && fp.botIdxs[p]===botIdx);
  if(usedBy.length===0) return true;
  if(usedBy.length>=3) return false;
  return usedBy.every(p => fp.teams[p]===fp.teams[player]);
}

function fpBuildBotMenus(){
  [0,1,2,3].forEach(player=>{
    const menu=document.getElementById(`fourp-bot${player}-menu`);
    if(!menu) return;
    menu.innerHTML='';

    // Human option — always allowed
    const human=document.createElement('button');
    human.textContent='👤 Human';
    human.style.cssText='display:block;width:100%;padding:5px 12px;font-size:12px;text-align:left;background:#f5f0d8;border:none;border-bottom:1px solid #ccc;font-family:"EB Garamond",Georgia,serif;font-weight:600;cursor:pointer;';
    if(fp.botIdxs[player]===null) human.style.background='#0a0fa8', human.style.color='#f5c800';
    human.onclick=()=>{
      fp.botIdxs[player]=null;
      document.getElementById(`fourp-bot${player}-btn`).textContent='You (Human) ▾';
      menu.style.display='none';
      fpBuildBotMenus();
    };
    menu.appendChild(human);

    BOTS.forEach((bot,i)=>{
      if(bot.secret&&!bot.unlocked) return;
      const allowed = fpBotAllowed(player, i);
      const b=document.createElement('button');
      b.textContent = allowed ? bot.name : bot.name + ' 🚫';
      const isSelected = fp.botIdxs[player]===i;
      b.style.cssText=`display:block;width:100%;padding:5px 12px;font-size:12px;text-align:left;background:${isSelected?'#0a0fa8':allowed?'#f5f0d8':'#ddd'};color:${isSelected?'#f5c800':allowed?'#000':'#999'};border:none;border-bottom:1px solid #ccc;font-family:"EB Garamond",Georgia,serif;font-weight:600;cursor:${allowed?'pointer':'not-allowed'};`;
      if(allowed){
        b.onmouseover=()=>{ if(!isSelected) b.style.background='#f5c800'; };
        b.onmouseout=()=>{ b.style.background=fp.botIdxs[player]===i?'#0a0fa8':'#f5f0d8'; b.style.color=fp.botIdxs[player]===i?'#f5c800':'#000'; };
        b.onclick=()=>{
          fp.botIdxs[player]=i;
          document.getElementById(`fourp-bot${player}-btn`).textContent=bot.name+' ▾';
          menu.style.display='none';
          fpBuildBotMenus();
        };
      } else {
        b.title = 'Already used on a different team — only 2 uses allowed, same team only';
        b.onclick=()=>{ cheatMsg('⛔ That bot is already on a different team!','#cc0000'); };
      }
      menu.appendChild(b);
    });
  });
}

function toggleFpBotMenu(player){
  [0,1,2,3].forEach(p=>{
    const m=document.getElementById(`fourp-bot${p}-menu`);
    if(m) m.style.display=(p===player && m.style.display==='none')?'block':'none';
  });
}

// Close menus on outside click
document.addEventListener('click', e=>{
  if(!e.target || !e.target.closest || !e.target.closest('[id^="fourp-bot"]')) {
    [0,1,2,3].forEach(p=>{ const m=document.getElementById(`fourp-bot${p}-menu`); if(m) m.style.display='none'; });
  }
});

function fpTriggerOilStrike(){
  // Find the Don's player slot
  const donPlayer = fp.botIdxs.findIndex(idx=>idx!=null&&BOTS[idx]&&BOTS[idx].name.includes('The Don'));
  if(donPlayer<0) return;

  // Target a random enemy (non-teammate) piece that isn't a king
  const targets=[];
  for(let r=0;r<FP_SIZE;r++) for(let c=0;c<FP_SIZE;c++){
    const p=fp.board[r][c];
    if(p && !fpSameTeam(p.player,donPlayer) && p.type!=='K') targets.push([r,c]);
  }
  if(!targets.length) return;
  const [tr,tc]=targets[Math.floor(Math.random()*targets.length)];

  // Show OIL chat
  // 4P oil chat via fpShowCornerSpeech

  // Launch the B-2 across the 4P canvas area
  const canvas=document.getElementById('fourp-canvas');
  const rect=canvas.getBoundingClientRect();
  const sz=fp.sqSize;
  const bomber=document.getElementById('b2-bomber');
  bomber.style.position='fixed';
  bomber.style.top=(rect.top + tr*sz + sz/2 - 22)+'px';
  bomber.style.left='0px';
  bomber.style.width='90px';
  bomber.style.height='45px';
  bomber.innerHTML=`<svg viewBox="0 0 160 70" xmlns="http://www.w3.org/2000/svg" width="160" height="70" style="transform:scaleX(-1)">
    <!-- Main wing body -->
    <polygon points="80,5 158,52 138,58 80,38 22,58 2,52" fill="#1a1a1a" stroke="#444" stroke-width="1.5"/>
    <!-- Inner wing shading -->
    <polygon points="80,12 145,50 125,54 80,34 35,54 15,50" fill="#2a2a2a" stroke="none"/>
    <!-- Fuselage hump -->
    <ellipse cx="80" cy="28" rx="18" ry="10" fill="#222" stroke="#333" stroke-width="1"/>
    <!-- Cockpit -->
    <ellipse cx="80" cy="24" rx="9" ry="5" fill="#111" stroke="#555" stroke-width="1"/>
    <!-- Engine exhausts -->
    <rect x="52" y="50" width="12" height="6" rx="3" fill="#ff4400" opacity="0.8"/>
    <rect x="96" y="50" width="12" height="6" rx="3" fill="#ff4400" opacity="0.8"/>
    <!-- Wing details -->
    <line x1="2" y1="52" x2="158" y2="52" stroke="#333" stroke-width="0.8" opacity="0.5"/>
    <line x1="80" y1="5" x2="80" y2="38" stroke="#333" stroke-width="0.8" opacity="0.4"/>
  </svg>`;
  bomber.classList.remove('flying');
  void bomber.offsetWidth;
  bomber.classList.add('flying');

  // Explosion + destroy piece
  setTimeout(()=>{
    const container=document.getElementById('fourp-canvas').parentElement;
    const flash=document.createElement('div');
    flash.className='bomb-flash';
    const fz=sz*1.4;
    flash.style.cssText=`position:absolute;width:${fz}px;height:${fz}px;left:${tc*sz-fz/2+sz/2}px;top:${tr*sz-fz/2+sz/2}px;border-radius:50%;background:radial-gradient(circle,#fff 0%,#ffaa00 40%,#ff4400 70%,transparent 100%);animation:bomb-flash-anim 0.5s ease-out forwards;pointer-events:none;z-index:50;`;
    container.appendChild(flash);
    setTimeout(()=>flash.remove(),600);
    fp.board[tr][tc]=null;
    fpDraw();
    cheatMsg('💥 OIL STRIKE! THE DON BOMBED AN ENEMY','#ff6a00');
  }, 1900);

  setTimeout(()=>{ bomber.classList.remove('flying'); bomber.innerHTML=''; bomber.style.position=''; },3800);
}

function toggleFpSpeech(){
  fp.speechOn = !fp.speechOn;
  const btn = document.getElementById('fp-speech-toggle-btn');
  if(btn) btn.textContent = '💬 Chat: ' + (fp.speechOn ? 'On' : 'Off');
  if(!fp.speechOn){
    // Hide all speech divs
    [0,1,2,3].forEach(p=>{ const d=document.getElementById('fp-speech-'+p); if(d) d.style.display='none'; });
  }
  fpDraw();
}

function fpShowCornerSpeech(player, type){
  if(!fp.speechOn) return;
  if(!settingsState.fp4pSpeech) return;
  const botI = fp.botIdxs[player];
  if(botI==null) return;
  const data = BOT_CHAT_LIST[botI];
  if(!data||!data[type]||!data[type].length) return;
  const lines = data[type];
  const raw = lines[Math.floor(Math.random()*lines.length)];
  const msg = typeof raw==='function' ? raw() : raw;
  fp.cornerSpeech[player] = msg;

  // Show in HTML div
  const div = document.getElementById('fp-speech-'+player);
  if(div){
    const avatar = data.avatar || '';
    const isDon = BOTS[botI]&&BOTS[botI].name.includes('The Don');
    div.innerHTML = avatar + ' ' + msg;
    div.style.display = 'block';
    div.style.background = isDon ? '#ff6a00' : '#fffdf0';
    div.style.color = isDon ? '#fff' : '#111';
    div.style.borderColor = isDon ? '#7a3000' : FP_COLORS[player];
  }

  // Feed 4P dialogue log
  const _FP_PNAMES=['Red','Blue','White','Black'];
  const _FP_PCOLS=['#e03020','#2060cc','#cccccc','#888888'];
  const dlist=document.getElementById('fp-dialogue-list');
  if(dlist&&msg){
    const de=document.createElement('div');de.className='fp-dialogue-entry';
    const isDon_=BOTS[botI]&&BOTS[botI].name.includes('The Don');
    if(isDon_) de.style.background='rgba(255,106,0,0.1)';
    de.innerHTML='<span class="fp-dialogue-who" style="color:'+_FP_PCOLS[player]+'">'+(data.avatar||'')+' '+_FP_PNAMES[player]+'</span><span class="fp-dialogue-msg">&ldquo;'+msg+'&rdquo;</span>';
    dlist.appendChild(de);dlist.scrollTop=dlist.scrollHeight;
    while(dlist.children.length>80)dlist.removeChild(dlist.firstChild);
  }

  fpDraw();
  if(!fp._speechTimers) fp._speechTimers={};
  if(fp._speechTimers[player]) clearTimeout(fp._speechTimers[player]);
  fp._speechTimers[player]=setTimeout(()=>{
    fp.cornerSpeech[player]=null;
    if(div) div.style.display='none';
    fpDraw();
  }, 5000);
}

function fpScreenShake(){/* Bug4: screen shake disabled for 4P */}
function fpDoBotMove(){
  if(fp.gameOver || fp.botIdxs[fp.turn] === null) return;
  const cv=document.getElementById('fourp-canvas');if(cv)cv.style.transform='';
  const moves = fpAllLegalMoves(fp.board, fp.turn, fp.eliminated);
  if(!moves.length) return;

  const playerBotIdx = fp.botIdxs[fp.turn];
  const bot = playerBotIdx != null ? BOTS[playerBotIdx] : null;
  let move;

  if(bot){
    if(Math.random() < bot.random){
      move = moves[Math.floor(Math.random()*moves.length)];
    } else {
      // Check if a teammate is in check — if so, weight moves that help more heavily
      const teammateInCheck = [0,1,2,3].some(p =>
        p !== fp.turn && !fp.eliminated[p] && fpSameTeam(p, fp.turn) && fpIsInCheck(fp.board, p)
      );

      // Order moves: captures first, then moves that relieve teammate check
      const ordered = [...moves].sort((a, b) => {
        const capA = fp.board[a.r][a.c] ? 1 : 0;
        const capB = fp.board[b.r][b.c] ? 1 : 0;
        return capB - capA;
      });

      let best = Infinity, bm = [];
      ordered.forEach(m => {
        const nb = fpApplyMove(fp.board, m.fr, m.fc, m.r, m.c);
        const score = fpEval(nb, fp.turn);
        if(score < best){ best=score; bm=[m]; }
        else if(score===best) bm.push(m);
      });
      move = bm[Math.floor(Math.random()*bm.length)];
    }
  } else {
    move = moves[Math.floor(Math.random()*moves.length)];
  }

  // Check if this is a capture BEFORE applying the move
  const isCapture = !!fp.board[move.r][move.c];
  const movingPlayer4p = fp.turn;
  const mfr=move.fr, mfc=move.fc, mtr=move.r, mtc=move.c;

  const movingPiece4p=fp.board[mfr][mfc];
  fp.selected = null; fp.moves = [];

  // Show corner speech for move or capture
  fpShowCornerSpeech(movingPlayer4p, isCapture ? 'onCapture' : 'onMove');

  // NEW7: animate bot move then commit
  fpAnimateMove(mfr,mfc,mtr,mtc,movingPiece4p,()=>{
    if(isCapture) fpRecordCapture(mtr,mtc,movingPlayer4p);
    fp.board = fpApplyMove(fp.board, mfr, mfc, mtr, mtc);
    fpRecordMove(mfr, mfc, mtr, mtc, movingPlayer4p, isCapture);

    // Oil strike — if this player is The Don, 15% chance
    const thisBot = fp.botIdxs[movingPlayer4p] != null ? BOTS[fp.botIdxs[movingPlayer4p]] : null;
    if(thisBot && thisBot.name.includes('The Don') && !fp.gameOver && Math.random()<0.15){
      setTimeout(fpTriggerOilStrike, 600);
    }

    fpNextTurn();
    fpDraw();
    // Bug6: pass proper afterFn so bot chain never breaks
    fpDeportCheck(mfr, mfc, mtr, mtc, movingPlayer4p, ()=>{
      if(!fp.gameOver && fp.botIdxs[fp.turn]!==null) setTimeout(fpDoBotMove, botMoveDelay);
    });
  });
}

function fpEval(b, player){
  let score = 0;
  const val = {P:1,N:3,B:3,R:5,Q:9,K:100};
  const posBonus = {
    P: 0.1, N: 0.15, B: 0.15, R: 0.1, Q: 0.05, K: 0
  };

  for(let r=0;r<FP_SIZE;r++) for(let c=0;c<FP_SIZE;c++){
    const p=b[r][c]; if(!p) continue;
    const v = val[p.type]||0;
    // Centralisation bonus — pieces near center of 14x14 board are slightly better
    const dist = Math.max(Math.abs(r-6.5), Math.abs(c-6.5));
    const pos = (posBonus[p.type]||0) * Math.max(0, 7-dist);

    if(fpSameTeam(p.player, player)){
      score -= (v + pos); // all teammates: equally good
    } else {
      score += v; // enemy pieces: bad to have them on board
    }
  }

  // Penalty if any teammate king is in check — bots should try to help
  for(let p=0;p<4;p++){
    if(fpSameTeam(p, player) && !fp.eliminated[p]){
      if(fpIsInCheck(b, p)) score += 8; // discourage leaving teammate in check
    }
  }

  // Bonus if any enemy king is in check
  for(let p=0;p<4;p++){
    if(!fpSameTeam(p, player) && !fp.eliminated[p]){
      if(fpIsInCheck(b, p)) score -= 4;
    }
  }

  return score;
}

function fpUpdateTurnBar() {
  for(let p=0;p<4;p++){
    const row=document.getElementById(`fourp-t${p}`);
    if(!row) continue;
    if(fp.eliminated[p]){
      row.style.opacity='0.35';
      row.style.outline='none';
    } else if(p===fp.turn){
      row.style.opacity='1';
      row.style.outline='3px solid #f5c800';
    } else {
      row.style.opacity='0.7';
      row.style.outline='none';
    }
  }
}

function fourpReset() {
  fp.board=fpInitBoard();
  fp.turn=0;
  fp.selected=null;
  fp.moves=[];
  fp.eliminated=[false,false,false,false];
  fp.gameOver=false;
  fp.cornerSpeech={0:null,1:null,2:null,3:null};
  fp.moveLog=[];
  fp.captured=[[],[],[],[]];
  fpRenderMoveLog();
  fpRenderCaptured();
  document.getElementById('fourp-status').textContent='Red to move';
  document.getElementById('fourp-msg').textContent='';
  for(let p=1;p<4;p++){
    const row=document.getElementById(`fourp-t${p}`);
    if(row){ row.style.opacity='1'; row.style.textDecoration='none'; }
  }
  fpBuildBotMenus();
  fpBuildSwatches();
  fpUpdateTeamDisplay();
  fpUpdateTurnBar();
  fp4pResize();
  fpDraw();
  // Start speech for all bot players
  [0,1,2,3].forEach(p=>{ if(fp.botIdxs[p]!=null) setTimeout(()=>{ fpShowCornerSpeech(p,'onStart'); fpDraw(); }, 300+p*500); });
  if(fp.botIdxs[fp.turn] !== null) setTimeout(fpDoBotMove, botMoveDelay);
}

function fp4pResize() {
  // Allow board to be larger than the viewport — let the overlay scroll
  const available=Math.min(window.innerWidth - 40, window.innerHeight - 180, 980);
  fp.sqSize=Math.max(36, Math.floor(available/FP_SIZE));
  const sz=fp.sqSize*FP_SIZE;
  const canvas=document.getElementById('fourp-canvas');
  if(canvas){canvas.style.width=sz+'px';canvas.style.height=sz+'px';}
  const wrap=document.getElementById('fourp-board-wrap');
  if(wrap){wrap.style.width=sz+'px';wrap.style.height=sz+'px';wrap.style.overflow='visible';}
}

function show4PWinScreen(team, members, winnerPlayer){
  let ov=document.getElementById('fourp-win-overlay');
  if(!ov){
    ov=document.createElement('div');
    ov.id='fourp-win-overlay';
    ov.style.cssText='position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;background:rgba(0,80,0,0.88);animation:overlay-fade-in 0.4s ease forwards;';
    ov.innerHTML=`<button id="fourp-win-close" onclick="document.getElementById('fourp-win-overlay').remove()" style="position:absolute;top:18px;right:22px;background:rgba(255,255,255,0.18);border:2px solid rgba(255,255,255,0.5);color:#fff;font-size:22px;font-weight:700;width:38px;height:38px;cursor:pointer;border-radius:50%;display:flex;align-items:center;justify-content:center;">✕</button>
      <div id="fourp-win-word" style="font-family:'EB Garamond',Georgia,serif;font-size:clamp(50px,14vw,130px);font-weight:700;letter-spacing:6px;text-transform:uppercase;color:#fff;text-shadow:6px 6px 0 rgba(0,0,0,0.4);-webkit-text-stroke:2px rgba(0,0,0,0.3);animation:word-pop 0.5s cubic-bezier(0.17,0.89,0.32,1.28) 0.1s both;line-height:1;">WINS!</div>
      <div id="fourp-win-sub" style="font-family:'EB Garamond',Georgia,serif;font-size:clamp(14px,3vw,22px);color:rgba(255,255,255,0.85);letter-spacing:3px;text-transform:uppercase;animation:word-pop 0.5s cubic-bezier(0.17,0.89,0.32,1.28) 0.2s both;"></div>
      <div id="fourp-win-members" style="font-family:'EB Garamond',Georgia,serif;font-size:clamp(12px,2vw,18px);color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;animation:word-pop 0.5s cubic-bezier(0.17,0.89,0.32,1.28) 0.25s both;"></div>
      <div style="display:flex;gap:12px;animation:word-pop 0.5s cubic-bezier(0.17,0.89,0.32,1.28) 0.35s both;">
        <button onclick="document.getElementById('fourp-win-overlay').remove();fourpReset();" style="font-family:'EB Garamond',Georgia,serif;font-size:18px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;background:#fff;color:#111;border:4px solid #000;padding:10px 30px;cursor:pointer;box-shadow:5px 5px 0 rgba(0,0,0,0.4);">New Game</button>
        <button onclick="document.getElementById('fourp-win-overlay').remove();" style="font-family:'EB Garamond',Georgia,serif;font-size:18px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;background:rgba(255,255,255,0.2);color:#fff;border:4px solid rgba(255,255,255,0.5);padding:10px 30px;cursor:pointer;box-shadow:5px 5px 0 rgba(0,0,0,0.4);">Close</button>
      </div>`;
    document.body.appendChild(ov);
  }
  const teamColor=['#e03020','#2060cc','#f5c800','#22aa44'][winnerPlayer]||'#888888';
  ov.style.background=`rgba(0,80,0,0.92)`;
  const wordEl=ov.querySelector('#fourp-win-word');
  const subEl=ov.querySelector('#fourp-win-sub');
  const membersEl=ov.querySelector('#fourp-win-members');
  if(wordEl) wordEl.textContent='TEAM '+team+' WINS!';
  if(subEl) subEl.textContent=FP_NAMES[winnerPlayer]+' & allies triumph!';
  if(membersEl) membersEl.textContent='Members: '+members;
  ov.style.display='flex';
}

function toggle4P() {
  const ov=document.getElementById('fourp-overlay');
  const showing=ov.style.display==='flex';
  if(showing){
    ov.style.display='none';
  } else {
    ov.style.display='flex';
    if(!fp.board) fourpReset();
    else { fpBuildBotMenus(); fpBuildSwatches(); fpUpdateTeamDisplay(); fp4pResize(); fpDraw(); fpRenderMoveLog(); }
  }
}

// Attach canvas click directly (script runs after DOM)
(function attachFourP(){
  const canvas=document.getElementById('fourp-canvas');
  if(canvas) canvas.addEventListener('click',fpHandleClick);
  const inp=document.getElementById('unlock-input');
  if(inp) inp.addEventListener('keydown',e=>{if(e.key==='Enter')tryUnlockCode();});
  // Redraw after fonts load so the S appears correctly
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(()=>{ if(fp.board) fpDraw(); });
  }
})();

// 4P cheat codes
function checkFourPCheats(){
  if(!fp.board||fp.gameOver) return;
  // NUKE: wipe all pieces except kings from every player
  if(cheatBuffer.endsWith('99999')){
    cheatBuffer='';
    for(let r=0;r<FP_SIZE;r++) for(let c=0;c<FP_SIZE;c++){
      const p=fp.board[r][c];
      if(p&&p.type!=='K') fp.board[r][c]=null;
    }
    fpDraw(); cheatMsg('☢️ 4P NUCLEAR: ALL PIECES GONE','#ff4400'); return;
  }
  // QUEENS: give ALL alive players queens on their back rows (NEW6: all quadrants)
  if(cheatBuffer.endsWith('88888')){
    cheatBuffer='';
    [0,1,2,3].forEach(p=>{
      if(fp.eliminated[p]) return;
      let placed=0;
      // Place queens near each player's starting area
      const startCols=[3,4,5,6,7,8,9,10];
      const startRows={0:[12,11],1:[3,4],2:[0,1],3:[10,11]};
      const rowsForPlayer=startRows[p];
      rowsForPlayer.forEach(r=>{
        startCols.forEach(c=>{
          if(placed<4&&fpInBounds(r,c)&&!fp.board[r][c]){fp.board[r][c]={player:p,type:'Q'};placed++;}
        });
      });
    });
    fpDraw(); cheatMsg('👸 4P GOD MODE: QUEENS FOR ALL (ALL QUADRANTS)'); return;
  }
  // BOOM: remove all pieces around board center
  if(cheatBuffer.endsWith('boom')){
    cheatBuffer='';
    const mid=Math.floor(FP_SIZE/2);
    for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
      const nr=mid+dr,nc=mid+dc;
      if(fpInBounds(nr,nc)&&fp.board[nr][nc]&&fp.board[nr][nc].type!=='K') fp.board[nr][nc]=null;
    }
    fpDraw(); cheatMsg('💥 4P BOOM: CENTER CLEARED','#ff6600'); return;
  }
}


