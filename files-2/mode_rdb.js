(function(){
'use strict';
// ═══════════════════════════════════════════════════
//  RESURRECTION DOUBLE BUGHOUSE — Clean Rewrite
//
//  Rules:
//  • Two boards (A and B) run simultaneously.
//  • P1 plays White on A, Black on B.
//  • P2 plays Black on A, White on B.
//  • Each turn: the active player makes ONE move on
//    ONE board of their choice.
//  • Capturing a piece adds it to your reserve; you
//    may drop a reserve piece instead of moving.
//  • Captured pieces respawn on Board A for their
//    original owner.
//  • Win by checkmating opponent on BOTH boards.
// ═══════════════════════════════════════════════════

const FILES='abcdefgh';
function rc2sq(r,c){return FILES[c]+(8-r);}
function inBd(r,c){return r>=0&&r<8&&c>=0&&c<8;}
function rClr(p){return p?p[0]:null;}
function rTyp(p){return p?p[1]:null;}
function rOpp(c){return c==='w'?'b':'w';}
function rCpBd(b){return b.map(r=>[...r]);}
const GL={wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'};

// ── Starting boards ──────────────────────────────────
function rMakeA(){
  const b=Array.from({length:8},()=>Array(8).fill(null));
  const back=['R','N','B','Q','K','B','N','R'];
  for(let c=0;c<8;c++){b[7][c]='w'+back[c];b[6][c]='wP';b[0][c]='b'+back[c];b[1][c]='bP';}
  return b;
}
function rMakeB(){
  const b=Array.from({length:8},()=>Array(8).fill(null));
  // P1=White (rows 6-7), P2=Black (rows 0-1) — same orientation as Board A
  b[7][4]='wK'; b[6][3]='wP'; b[6][4]='wP'; b[6][5]='wP';
  b[0][4]='bK'; b[1][3]='bP'; b[1][4]='bP'; b[1][5]='bP';
  return b;
}

// ── Game state ────────────────────────────────────────
// P1 = White on BOTH boards (rows 6-7)
// P2 = Black on BOTH boards (rows 0-1)
let RS;
function rFresh(){
  return{
    bA:rMakeA(), bB:rMakeB(),
    epA:null, epB:null,
    castA:{w:{k:true,q:true},b:{k:true,q:true}},
    castB:{w:{k:true,q:true},b:{k:true,q:true}},
    resP1:[], resP2:[],
    turn:1, subTurn:'a', tNum:1, gameOver:false,
    matedA:false, matedB:false,  // king mated on each board — skips that sub-turn
    logA:[], logB:[],
    histSnaps:[],
    sel:null,
    dropMode:null,
    killMode:false,
    discardResMode:false,
  };
}

// ── Bot config — use main BOTS array ──────────────────
// rBotIdxA = bot playing P2 on Board A (Black on A)
// rBotIdxB = bot playing P2 on Board B (White on B)
// -1 = human for that board
// rBotSplit = true means A and B have separate bots; false = rBotIdxA controls both
let rBotIdxA = 1; // default Bob (300) on Board A
let rBotIdxB = 1; // default Bob (300) on Board B
let rBotSplit = false; // false = one bot handles both boards
let rBotMenuOpen = false;

// ── Cheat integration ──────────────────────────────────
// Cheats apply to both RDB boards simultaneously.
// We intercept the global checkCheats by wrapping it when RDB is active.
let _rdbCheatsHooked = false;
function rdbHookCheats(){
  if(_rdbCheatsHooked) return;
  _rdbCheatsHooked = true;
  // Patch activateNuclear, activateGodMode, activateQueenCheat, activateSwapSides,
  // activateTimeWarp, activateBoom to also run on RDB boards when RDB overlay is open.
  const _rdbCheatsActive = () => {
    const ov = document.getElementById('rdb-overlay');
    return ov && (ov.style.display === 'flex' || ov.style.display === 'block' || ov.classList.contains('open'));
  };

  let _rdbCheatBuf = '';
  _rdbCheatBuf_clear = () => { _rdbCheatBuf = ''; };
  document.addEventListener('keydown', e => {
    if(!_rdbCheatsActive()) return;
    if(document.activeElement && document.activeElement.id === 'unlock-input') return;
    _rdbCheatBuf += e.key;
    if(_rdbCheatBuf.length > 10) _rdbCheatBuf = _rdbCheatBuf.slice(-10);
    rdbCheckCheats(_rdbCheatBuf);
  });
}

function rdbCheckCheats(buf){
  if(!RS || RS.gameOver) return;
  if(buf.endsWith('99999')){ // Nuclear — wipe all enemy (P2/bot) non-king pieces from both boards
    _rdbCheatBuf_clear();
    ['bA','bB'].forEach(bk => {
      const enemyCol = bk==='bA' ? 'b' : 'w'; // P2 plays black on A, white on B
      for(let r=0;r<8;r++) for(let c=0;c<8;c++){
        const p=RS[bk][r][c];
        if(p && rClr(p)===enemyCol && rTyp(p)!=='K') RS[bk][r][c]=null;
      }
    });
    rdbRender();
    if(typeof cheatMsg==='function') cheatMsg('☢️ RDB NUCLEAR: ALL BOT PIECES VAPORISED (BOTH BOARDS)','#ff4400');
    return;
  }
  if(buf.endsWith('88888')){ // God mode — fill P1's back rank with queens on both boards
    _rdbCheatBuf_clear();
    for(let c=0;c<8;c++){ if(RS.bA[7][c]!=='wK') RS.bA[7][c]='wQ'; }
    for(let c=0;c<8;c++){ if(RS.bB[7][c]!=='wK') RS.bB[7][c]='wQ'; }
    rdbRender();
    if(typeof cheatMsg==='function') cheatMsg('👸 RDB GOD MODE: QUEENS ON BOTH BOARDS');
    return;
  }
  if(buf.endsWith('33333')){ // Time warp — undo to first snap on both boards
    _rdbCheatBuf_clear();
    if(RS.histSnaps.length){
      const first = RS.histSnaps[0];
      Object.assign(RS, JSON.parse(JSON.stringify(first)));
      RS.gameOver=false; RS.sel=null; RS.dropMode=null; RS.killMode=false; RS.discardResMode=false;
      RS.histSnaps=[];
      rdbRender();
      if(typeof cheatMsg==='function') cheatMsg('⏪ RDB TIME WARP: REWOUND TO START');
    } else {
      if(typeof cheatMsg==='function') cheatMsg('⏪ NO HISTORY TO REWIND','#ffaa00');
    }
    return;
  }
  if(buf.endsWith('55555')){ // Swap — flip whose turn it is
    _rdbCheatBuf_clear();
    RS.turn = RS.turn===1 ? 2 : 1;
    rdbRender();
    if(typeof cheatMsg==='function') cheatMsg('🔄 RDB SIDES SWAPPED — NOW PLAYER '+(RS.turn===1?'1':'2')+' TO MOVE');
    return;
  }
  if(buf.endsWith('boom')){ // Boom — blast adjacent pieces around P1 kings on both boards
    _rdbCheatBuf_clear();
    let blasted=0;
    ['bA','bB'].forEach(bk => {
      for(let r=0;r<8;r++) for(let c=0;c<8;c++){
        if(RS[bk][r][c]==='wK' || RS[bk][r][c]==='bK'){
          const myCol = bk==='bA'?'w':'b'; // P1 color on this board
          if(rClr(RS[bk][r][c])!==myCol) return;
          for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
            if(!dr&&!dc) continue;
            const nr=r+dr, nc=c+dc;
            if(!inBd(nr,nc)) continue;
            const p=RS[bk][nr][nc];
            if(p && rTyp(p)!=='K'){ RS[bk][nr][nc]=null; blasted++; }
          }
        }
      }
    });
    rdbRender();
    if(typeof cheatMsg==='function') cheatMsg('💥 RDB BOOM! '+blasted+' PIECE'+(blasted!==1?'S':'')+' DESTROYED','#ff6600');
    return;
  }
}
// Internal cheat buf clear (set by rdbHookCheats closure)
let _rdbCheatBuf_clear = () => {};

function rGetBot(which){
  const bots = typeof BOTS!=='undefined' ? BOTS : [];
  const idx = !rBotSplit ? rBotIdxA : (which==='a' ? rBotIdxA : rBotIdxB);
  // Return the selected bot, or first available bot, with depth fallback
  const bot = bots[idx] || bots[0];
  if(!bot) return {depth:1, random:0}; // bare minimum fallback
  return {...bot, depth: bot.depth||1};
}
function rIsHumanBoard(){ return false; } // bots only on P2
function rP2IsAllHuman(){ return rBotIdxA < 0 && rBotIdxB < 0; }

// ── Move generation ───────────────────────────────────
function rPseudo(b,r,c,ep){
  const p=b[r][c]; if(!p) return [];
  const cl=rClr(p), ty=rTyp(p), ms=[];
  const push=(tr,tc,f)=>{ if(inBd(tr,tc)) ms.push({fr:r,fc:c,tr,tc,f}); };
  if(ty==='P'){
    const d=cl==='w'?-1:1, sR=cl==='w'?6:1;
    if(inBd(r+d,c)&&!b[r+d][c]){ push(r+d,c,'p'); if(r===sR&&!b[r+2*d][c]) push(r+2*d,c,'p2'); }
    for(const dc of[-1,1]){ const tr=r+d,tc=c+dc; if(inBd(tr,tc)){ if(b[tr][tc]&&rClr(b[tr][tc])!==cl) push(tr,tc,'x'); if(ep&&ep[0]===tr&&ep[1]===tc) push(tr,tc,'ep'); } }
  } else if(ty==='N'){
    for(const[dr,dc]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]){ const tr=r+dr,tc=c+dc; if(inBd(tr,tc)&&rClr(b[tr][tc])!==cl) push(tr,tc,'n'); }
  } else if(ty==='K'){
    for(const[dr,dc]of[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){ const tr=r+dr,tc=c+dc; if(inBd(tr,tc)&&rClr(b[tr][tc])!==cl) push(tr,tc,'k'); }
    const bR=cl==='w'?7:0;
    if(r===bR&&c===4){ if(!b[bR][5]&&!b[bR][6]) push(bR,6,'ck'); if(!b[bR][3]&&!b[bR][2]&&!b[bR][1]) push(bR,2,'cq'); }
  } else {
    const dirs={R:[[-1,0],[1,0],[0,-1],[0,1]],B:[[-1,-1],[-1,1],[1,-1],[1,1]],Q:[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]}[ty]||[];
    for(const[dr,dc]of dirs){ let tr=r+dr,tc=c+dc; while(inBd(tr,tc)){ if(b[tr][tc]){ if(rClr(b[tr][tc])!==cl) push(tr,tc,'x'); break; } push(tr,tc,'s'); tr+=dr; tc+=dc; } }
  }
  return ms;
}

function rKingPos(b,cl){ for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(b[r][c]===cl+'K') return[r,c]; return null; }
function rAttacked(b,r,c,byCl){ for(let pr=0;pr<8;pr++) for(let pc=0;pc<8;pc++) if(rClr(b[pr][pc])===byCl&&rPseudo(b,pr,pc,null).some(m=>m.tr===r&&m.tc===c)) return true; return false; }
function rInCheck(b,cl){ const k=rKingPos(b,cl); return k?rAttacked(b,k[0],k[1],rOpp(cl)):false; }

function rApply(b,mv,ep){
  const nb=rCpBd(b), p=nb[mv.fr][mv.fc], cl=rClr(p), ty=rTyp(p);
  let cap=nb[mv.tr][mv.tc], newEp=null;
  if(mv.f==='ep'){ const d=cl==='w'?1:-1; cap=nb[mv.tr+d][mv.tc]; nb[mv.tr+d][mv.tc]=null; }
  nb[mv.tr][mv.tc]=p; nb[mv.fr][mv.fc]=null;
  if(mv.f==='p2') newEp=[mv.tr+(cl==='w'?1:-1),mv.tc];
  if(mv.f==='ck'){ const bR=cl==='w'?7:0; nb[bR][5]=nb[bR][7]; nb[bR][7]=null; }
  if(mv.f==='cq'){ const bR=cl==='w'?7:0; nb[bR][3]=nb[bR][0]; nb[bR][0]=null; }
  if(ty==='P'&&(mv.tr===0||mv.tr===7)) nb[mv.tr][mv.tc]=cl+'Q';
  return{nb,cap,newEp};
}

function rLegal(b,r,c,ep){
  const p=b[r][c]; if(!p) return []; const cl=rClr(p);
  return rPseudo(b,r,c,ep).filter(mv=>{
    if((mv.f==='ck'||mv.f==='cq')&&rInCheck(b,cl)) return false;
    if(mv.f==='ck'){ const bR=cl==='w'?7:0; const{nb}=rApply(b,{...mv,tr:bR,tc:5},ep); if(rInCheck(nb,cl)) return false; }
    if(mv.f==='cq'){ const bR=cl==='w'?7:0; const{nb}=rApply(b,{...mv,tr:bR,tc:3},ep); if(rInCheck(nb,cl)) return false; }
    const{nb}=rApply(b,mv,ep); return !rInCheck(nb,cl);
  });
}

function rAllLegal(b,cl,ep){ const ms=[]; for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(rClr(b[r][c])===cl) rLegal(b,r,c,ep).forEach(m=>ms.push(m)); return ms; }
function rCheckmate(b,cl,ep){ return rInCheck(b,cl)&&rAllLegal(b,cl,ep).length===0; }

// ── Respawn captured piece on Board A ────────────────
function rRespawn(piece, ownerCl){
  const ty=rTyp(piece), homeR=ownerCl==='w'?7:0, b=RS.bA;
  if(ty==='P'){ const pR=ownerCl==='w'?6:1; for(let c=0;c<8;c++) if(!b[pR][c]){ b[pR][c]=piece; return; } }
  const back=['R','N','B','Q','K','B','N','R']; let tC=back.indexOf(ty); if(tC<0) tC=4;
  for(let d=0;d<8;d++){ if(tC+d<8&&!b[homeR][tC+d]){ b[homeR][tC+d]=piece; return; } if(tC-d>=0&&!b[homeR][tC-d]){ b[homeR][tC-d]=piece; return; } }
}

// ── Respawn captured piece on Board B ────────────────
function rRespawnB(piece, ownerCl){
  const ty=rTyp(piece), b=RS.bB;
  const homeR = ownerCl==='w' ? 7 : 0;
  if(ty==='P'){
    const pR = ownerCl==='w' ? 6 : 1;
    for(let c=0;c<8;c++) if(!b[pR][c]){ b[pR][c]=piece; return; }
    for(let dr=1;dr<8;dr++){
      for(const row of [pR-dr, pR+dr]){
        if(row<1||row>6) continue;
        for(let c=0;c<8;c++) if(!b[row][c]){ b[row][c]=piece; return; }
      }
    }
    return;
  }
  for(let d=0;d<8;d++){
    for(const row of [homeR+d*(ownerCl==='w'?-1:1), homeR-d*(ownerCl==='w'?-1:1)]){
      if(row<0||row>7) continue;
      for(let c=0;c<8;c++) if(!b[row][c]){ b[row][c]=piece; return; }
    }
  }
}

// ── Commit a single move ──────────────────────────────
// mv = { which:'a'|'b', move:{fr,fc,tr,tc,f} | {drop:true,piece,tr,tc} }
function rCommit(which, mv){
  const pCl = RS.turn===1 ? 'w' : 'b'; // P1=white, P2=black on both boards

  // Save undo snapshot
  RS.histSnaps.push(JSON.parse(JSON.stringify({
    bA:RS.bA, bB:RS.bB, epA:RS.epA, epB:RS.epB,
    castA:RS.castA, castB:RS.castB,
    resP1:[...RS.resP1], resP2:[...RS.resP2],
    turn:RS.turn, tNum:RS.tNum,
    logA:[...RS.logA], logB:[...RS.logB]
  })));

  const board = which==='a' ? RS.bA : RS.bB;
  const ep    = which==='a' ? RS.epA : RS.epB;
  let note;

  if(mv.drop){
    // Drop a reserve piece
    const nb=rCpBd(board); nb[mv.tr][mv.tc]=mv.piece;
    if(which==='a'){ RS.bA=nb; RS.epA=null; } else { RS.bB=nb; RS.epB=null; }
    note=(GL[mv.piece]||'?')+'→'+rc2sq(mv.tr,mv.tc);
    // Remove from reserve
    const res = RS.turn===1 ? RS.resP1 : RS.resP2;
    const idx=res.indexOf(mv.piece); if(idx>=0) res.splice(idx,1);
  } else {
    // Normal move
    const result = rApply(board, mv, ep);
    if(which==='a'){ RS.bA=result.nb; RS.epA=result.newEp||null; }
    else           { RS.bB=result.nb; RS.epB=result.newEp||null; }
    note = rc2sq(mv.fr,mv.fc)+rc2sq(mv.tr,mv.tc);

    // Castle rights on A
    if(which==='a'){
      if(RS.bA[7][4]!=='wK'){ RS.castA.w.k=false; RS.castA.w.q=false; }
      if(RS.bA[0][4]!=='bK'){ RS.castA.b.k=false; RS.castA.b.q=false; }
    }

    // If captured, add to capturer's reserve & respawn for owner (kings excluded)
    if(result.cap && rTyp(result.cap)!=='K'){
      const capType = rTyp(result.cap);
      const capOwner = rClr(result.cap); // original owner color
      // The capturer (pCl) gets the piece to drop on their OTHER board
      const piece = pCl + capType;
      if(RS.turn===1) RS.resP1.push(piece); else RS.resP2.push(piece);
      // Respawn on the OTHER board when captured
      if(which==='b') rRespawn(capOwner+capType, capOwner);        // captured on B → respawn on A
      if(which==='a') rRespawnB(capOwner+capType, capOwner);       // captured on A → respawn on B
    }
  }

  // Log
  const logArr = which==='a' ? RS.logA : RS.logB;
  logArr.push({n:RS.tNum, p:RS.turn, note});

  // ── Checkmate detection ────────────────────────────────
  // oppCl = opponent's color on each board
  const oppCl  = RS.turn===1 ? 'b' : 'w'; // opponent color on both boards
  const oppClB = oppCl;
  // Re-check mate status on both boards every commit (a respawn may have freed a king)
  RS.matedA = rCheckmate(RS.bA, oppCl,  RS.epA);
  RS.matedB = rCheckmate(RS.bB, oppClB, RS.epB);

  // Advance subTurn — skip a board if that king is already mated
  function rAdvanceTurn(){
    if(which==='a'){
      const bLocked = RS.tNum<=5;
      if(bLocked || RS.matedB){
        // B is locked or mated — skip straight to other player
        RS.turn = RS.turn===1 ? 2 : 1;
        RS.subTurn = 'a';
        RS.tNum++;
      } else {
        RS.subTurn = 'b';
      }
    } else {
      // Played B: hand off — skip A if opponent's A-king is mated
      RS.turn = RS.turn===1 ? 2 : 1;
      RS.tNum++;
      // Check new opponent's mate status from their perspective
      const newOppCl  = RS.turn===1 ? 'b' : 'w';
      const newOppClB = newOppCl;
      const newMatedA = rCheckmate(RS.bA, newOppCl,  RS.epA);
      const newMatedB = rCheckmate(RS.bB, newOppClB, RS.epB);
      if(newMatedA && !newMatedB){
        // New player's A-king is mated — skip to B
        RS.subTurn = 'b';
      } else {
        RS.subTurn = 'a';
      }
    }
    RS.sel = null; RS.dropMode = null; RS.killMode = false; RS.discardResMode = false;
  }
  rAdvanceTurn();

  rdbRender();

  // Win: both kings mated simultaneously
  if(RS.matedA && RS.matedB){
    RS.gameOver=true;
    const winner = 'Player '+(RS.turn===1?2:1);
    document.getElementById('rdb-win-overlay').className='show';
    document.getElementById('rdb-win-sub').textContent=winner+' — both kings checkmated!';
    rdbMsg('💀 '+winner+' wins!');
    const _winnerWasP = RS.turn===1 ? 2 : 1;
    setTimeout(()=> rdbShowBotChat(_winnerWasP===2 ? 'onWin' : 'onLose', rBotIdxA), 300);
    return;
  }

  // Status messages
  const msgs=[];
  if(RS.matedA) msgs.push('♚ Board A king is MATED — skipping that board!');
  else if(rInCheck(RS.bA, oppCl)) msgs.push('CHECK on A!');
  if(RS.matedB) msgs.push('♚ Board B king is MATED — skipping that board!');
  else if(rInCheck(RS.bB, oppClB)) msgs.push('CHECK on B!');
  if(msgs.length){
    rdbMsg(msgs.join('  '));
    if(RS.turn===1) setTimeout(()=> rdbShowBotChat('onCheck', rBotIdxA), 150);
  } else { rdbMsg(''); }

  // Trigger bot if still P2's turn (chain A→B), or if P2's turn just started
  if(RS.turn===2 && !rP2IsAllHuman() && !RS.gameOver){
    const delay = RS.subTurn==='b' ? 150 : (typeof botMoveDelay!=='undefined'?botMoveDelay:400)+50;
    setTimeout(rDoBotTurn, delay);
  }
}

// ── Bot turn ──────────────────────────────────────────
function rDoBotTurn(){
  if(!RS||RS.gameOver||RS.turn!==2) return;
  if(rP2IsAllHuman()) return;

  const bLocked = RS.tNum<=5;
  let required = RS.subTurn;

  // Skip a board if that king is currently mated
  if(required==='a' && RS.matedA) required='b';
  else if(required==='b' && RS.matedB) required='a';

  // If B is still locked and required is B, skip to next player's A
  if(required==='b' && bLocked){
    RS.turn=RS.turn===1?2:1; RS.subTurn='a'; RS.tNum++;
    rdbRender();
    if(RS.turn===2 && !rP2IsAllHuman() && !RS.gameOver)
      setTimeout(rDoBotTurn, (typeof botMoveDelay!=='undefined'?botMoveDelay:400)+50);
    return;
  }

  const bot = rGetBot(required);
  let chosen = null;

  if(required==='a'){
    const mv = bot ? rGetBotMove(RS.bA,'b',RS.epA,bot) : null; // P2=black on A
    if(mv) chosen = {which:'a', mv};
  } else {
    // Try reserve drop on B first (30% chance)
    const res = RS.resP2;
    if(res.length>0 && Math.random()<0.3){
      const piece = res[Math.floor(Math.random()*res.length)];
      const sq = rGetBotDrop(piece, RS.bB, 'b');
      if(sq) chosen = {which:'b', mv:{drop:true, piece, tr:sq.tr, tc:sq.tc}};
    }
    if(!chosen){
      const mv = bot ? rGetBotMove(RS.bB,'b',RS.epB,bot) : null; // P2=black on B
      if(mv) chosen = {which:'b', mv};
    }
  }

  if(!chosen){
    // No legal moves — skip this sub-turn and hand off
    if(required==='a'){ RS.subTurn='b'; }
    else { RS.turn=RS.turn===1?2:1; RS.subTurn='a'; RS.tNum++; }
    rdbRender();
    if(RS.turn===2 && !rP2IsAllHuman() && !RS.gameOver)
      setTimeout(rDoBotTurn, (typeof botMoveDelay!=='undefined'?botMoveDelay:400)+50);
    return;
  }
  const _chatBoard = chosen.which==='a' ? RS.bA : RS.bB;
  const _mv = chosen.mv;
  const _isCapture = !_mv.drop && _chatBoard[_mv.tr] && _chatBoard[_mv.tr][_mv.tc];
  rCommit(chosen.which, chosen.mv);
  const _chatBotIdx = rBotSplit ? (chosen.which==='a' ? rBotIdxA : rBotIdxB) : rBotIdxA;
  setTimeout(()=> rdbShowBotChat(_isCapture ? 'onCapture' : 'onMove', _chatBotIdx), 80);
}

function rGetBotMove(b,cl,ep,bot){
  const ms=rAllLegal(b,cl,ep); if(!ms.length) return null;
  if(Math.random()<(bot.random||0)) return ms[Math.floor(Math.random()*ms.length)];
  const maximize=cl==='w';
  // worst:true bots pick the move that's worst for them
  const findWorst=!!(bot.worst);
  let best=(maximize?-Infinity:Infinity), bm=[];
  const RPVAL={P:100,N:320,B:330,R:500,Q:900,K:20000};
  function rEval(b){ let s=0; for(let r=0;r<8;r++) for(let c=0;c<8;c++){ const p=b[r][c]; if(!p) continue; const v=RPVAL[rTyp(p)]||0; s+=rClr(p)==='w'?v:-v; } return s; }
  function minimax(b,depth,a,be,maxing,ep){
    const cl2=maxing?'w':'b'; const ms2=rAllLegal(b,cl2,ep);
    if(depth===0||!ms2.length) return rEval(b);
    if(maxing){ let best2=-Infinity; for(const m of ms2){ const{nb,newEp}=rApply(b,m,ep); best2=Math.max(best2,minimax(nb,depth-1,a,be,false,newEp||null)); a=Math.max(a,best2); if(be<=a)break; } return best2; }
    else { let best2=Infinity; for(const m of ms2){ const{nb,newEp}=rApply(b,m,ep); best2=Math.min(best2,minimax(nb,depth-1,a,be,true,newEp||null)); be=Math.min(be,best2); if(be<=a)break; } return best2; }
  }
  for(const mv of ms){
    const{nb,newEp}=rApply(b,mv,ep);
    const s=minimax(nb,(bot.depth||1)-1,-Infinity,Infinity,!maximize,newEp||null);
    const better = findWorst
      ? (maximize ? s<best : s>best)
      : (maximize ? s>best : s<best);
    if(better){best=s;bm=[mv];}else if(s===best)bm.push(mv);
  }
  return bm[Math.floor(Math.random()*bm.length)]||ms[0];
}

function rGetBotDrop(piece, bB, which){
  const ty=rTyp(piece); const squares=[];
  // P2 is always black — own half is rows 0-3 on both boards
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    if(bB[r][c]) continue;
    if(ty==='P'&&(r===0||r===7)) continue;
    if(r>3) continue; // black's half
    squares.push({tr:r,tc:c});
  }
  if(!squares.length) return null;
  squares.sort((a,b)=>Math.abs(a.tr-3.5)+Math.abs(a.tc-3.5)-(Math.abs(b.tr-3.5)+Math.abs(b.tc-3.5)));
  return squares[Math.floor(Math.random()*Math.min(squares.length,5))];
}

// Returns true if row r is in the dropping player's own half on the given board.
// P1 = white on A (rows 4-7), black on B (rows 0-3)
// P2 = black on A (rows 0-3), white on B (rows 4-7)
function rDropRowOk(which, player, r){
  const pCl = player===1 ? 'w' : 'b';
  return pCl==='w' ? r>=4 : r<=3;
}

// ── Bot chat ──────────────────────────────────────────
let _rdbChatTimeout = null;
function rdbShowBotChat(eventType, botIdx){
  const bots = typeof BOTS!=='undefined' ? BOTS : [];
  const bot = bots[botIdx];
  if(!bot) return;
  // Find this bot's chat list
  const chatList = typeof BOT_CHAT_LIST!=='undefined' ? BOT_CHAT_LIST : null;
  let lines = null;
  if(chatList){
    // BOT_CHAT_LIST entries match BOTS by index implicitly via avatar/name
    // Find by matching avatar or name snippet
    const entry = chatList.find(e => bot.name && bot.name.startsWith(e.avatar));
    if(entry && entry[eventType] && entry[eventType].length){
      lines = entry[eventType];
    }
  }
  // Fallback generic lines
  if(!lines){
    const fallbacks = {
      onMove:["your move.","hmm.","interesting.","let's see what you do with that.","calculated."],
      onCapture:["got one.","mine now.","thank you.","free piece.","i'll take that."],
      onCheck:["check.","watch your king.","check — don't ignore that.","👀 check."],
      onWin:["gg.","that's the game.","well played.","i win."],
      onLose:["well played.","you got me.","rematch?","good game."],
      onStart:["let's go.","ready.","i'm watching.","your move first."]
    };
    lines = fallbacks[eventType] || fallbacks.onMove;
  }
  const text = lines[Math.floor(Math.random()*lines.length)];
  const avatar = bot.name.match(/^(\S+)/)?.[1] || '🤖';
  const el = document.getElementById('rdb-bot-chat');
  if(!el) return;
  el.innerHTML = `<span style="font-size:1.4em;line-height:1;flex-shrink:0;">${avatar}</span>`
    + `<span style="flex:1;font-family:'EB Garamond',Georgia,serif;font-size:13px;font-style:italic;color:var(--yellow,#f5c800);opacity:0.92;">"${text}"</span>`;
  el.style.opacity='1';
  el.style.display='flex';
  if(_rdbChatTimeout) clearTimeout(_rdbChatTimeout);
  _rdbChatTimeout = setTimeout(()=>{
    el.style.opacity='0';
    setTimeout(()=>{ el.style.display='none'; }, 400);
  }, 3200);
}

// ── UI ────────────────────────────────────────────────
const RDB_SQ=54;

function rdbInit(){
  RS=rFresh();
  rBotMenuOpen=false;
  rdbHookCheats();
  rdbRender();
  rdbMsg('Make a move on either board.');
  // Bot start taunt
  setTimeout(()=> rdbShowBotChat('onStart', rBotIdxA), 500);
}
window.rdbInit=rdbInit;
function rdbReset(){
  document.getElementById('rdb-win-overlay').className='';
  rdbInit();
  setTimeout(()=> rdbShowBotChat('onStart', rBotIdxA), 600);
}
window.rdbReset=rdbReset;
function rdbUndo(){
  if(!RS.histSnaps.length) return;
  Object.assign(RS, JSON.parse(JSON.stringify(RS.histSnaps.pop())));
  RS.gameOver=false; RS.sel=null; RS.dropMode=null; RS.killMode=false; RS.discardResMode=false;
  rdbRender(); rdbMsg('');
}
window.rdbUndo=rdbUndo;
function rdbTogglePicker(){ const p=document.getElementById('rdb-picker'); p.style.display=p.style.display==='none'?'flex':'none'; }
window.rdbTogglePicker=rdbTogglePicker;
function rdbCancelDrop(){ RS.dropMode=null; rdbRender(); rdbMsg(''); }
window.rdbCancelDrop=rdbCancelDrop;

// ── Kill mode: remove one of your own pieces (no turn change) ──
window.rdbToggleKill=function(){
  if(!RS||RS.gameOver) return;
  if(RS.turn===2&&!rP2IsAllHuman()) return;
  RS.killMode=!RS.killMode;
  RS.dropMode=null; RS.discardResMode=false; RS.sel=null;
  rdbRender();
  rdbMsg(RS.killMode ? '☠ Kill mode — click one of your own pieces to remove it (costs a turn).' : '');
};

// ── Discard reserve mode: remove a piece from your reserves ──
window.rdbToggleDiscardRes=function(){
  if(!RS||RS.gameOver) return;
  if(RS.turn===2&&!rP2IsAllHuman()) return;
  RS.discardResMode=!RS.discardResMode;
  RS.dropMode=null; RS.killMode=false; RS.sel=null;
  rdbRender();
  rdbMsg(RS.discardResMode ? '🗑 Discard mode — click a reserve piece below to remove it.' : '');
};

// Called when a reserve piece is clicked while in discard mode
window.rdbDiscardReserveClick=function(idx, player){
  if(!RS||RS.gameOver) return;
  if(!RS.discardResMode){ window.rdbReserveClick( (player===1?RS.resP1:RS.resP2)[idx], player ); return; }
  // discard mode
  if(player!==RS.turn){ rdbMsg('Not your reserves.',true); return; }
  const arr = player===1 ? RS.resP1 : RS.resP2;
  if(idx<0||idx>=arr.length) return;
  const removed=arr.splice(idx,1)[0];
  RS.discardResMode=false;
  rdbRender();
  rdbMsg('🗑 Removed '+GL[removed]+' from your reserves.');
};

// ── Bot menu ──────────────────────────────────────────
let rBotMenuTarget = 'a'; // which board the open menu is for

window.rdbToggleSplit=function(){
  rBotSplit=!rBotSplit;
  const btn=document.getElementById('rdb-split-btn');
  const bWrap=document.getElementById('rdb-bot-b-wrap');
  if(rBotSplit){
    if(btn) btn.textContent='2 Bots Split ▸';
    if(bWrap) bWrap.style.display='flex';
  } else {
    if(btn) btn.textContent='1 Bot Both ▸';
    if(bWrap) bWrap.style.display='none';
  }
  rdbReset();
};

window.rdbToggleBotMenu=function(which){
  const menu=document.getElementById('rdb-bot-menu');
  if(!menu) return;
  if(rBotMenuOpen && rBotMenuTarget===which){
    rBotMenuOpen=false; menu.style.display='none'; return;
  }
  rBotMenuTarget=which;
  rBotMenuOpen=true;
  rBuildBotMenu(which);
  const btn=document.getElementById(which==='a'?'rdb-bot-btn-a':'rdb-bot-btn-b');
  if(btn){
    const r=btn.getBoundingClientRect();
    const menuH = Math.min(420, window.innerHeight * 0.7);
    menu.style.maxHeight = menuH+'px';
    menu.style.overflowY = 'auto';
    menu.style.width = '220px';
    // Open upward if not enough room below
    const spaceBelow = window.innerHeight - r.bottom - 8;
    if(spaceBelow < menuH && r.top > menuH){
      menu.style.top = (r.top - menuH - 4)+'px';
    } else {
      menu.style.top = (r.bottom+4)+'px';
    }
    menu.style.left = Math.min(r.left, window.innerWidth-230)+'px';
  }
  menu.style.display='block';
  setTimeout(()=>{
    const close=e=>{
      if(!menu.contains(e.target)&&e.target!==btn){ rBotMenuOpen=false; menu.style.display='none'; document.removeEventListener('click',close); }
    };
    document.addEventListener('click',close);
  },50);
};

function rBuildBotMenu(which){
  const menu=document.getElementById('rdb-bot-menu'); if(!menu) return;
  const curIdx = which==='a' ? rBotIdxA : rBotIdxB;
  menu.innerHTML='';
  const bots = typeof BOTS!=='undefined' ? BOTS : [];

  let secretSection=false;
  let selectedEl=null;

  bots.forEach((bot,i)=>{
    if(bot.secret && !bot.unlocked){
      if(!secretSection){
        secretSection=true;
        const div=document.createElement('div');
        div.style.cssText='padding:4px 10px 2px;font-family:"EB Garamond",Georgia,serif;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#888;background:#111;border-top:2px solid rgba(245,200,0,0.25);border-bottom:1px solid rgba(245,200,0,0.1);';
        div.textContent='🔒 Secret Bots (unlock in Settings)';
        menu.appendChild(div);
      }
      const lb=document.createElement('button');
      lb.style.cssText='display:block;width:100%;padding:6px 14px;font-size:12px;text-align:left;background:#111;border:none;border-bottom:1px solid #222;color:#555;box-shadow:none;letter-spacing:0.05em;font-family:"Courier Prime",Courier,monospace;cursor:default;font-style:italic;';
      lb.textContent='🔒 ???';
      menu.appendChild(lb);
      return;
    }
    if(bot.secret && bot.unlocked && !secretSection){
      secretSection=true;
      const div=document.createElement('div');
      div.style.cssText='padding:4px 10px 2px;font-family:"EB Garamond",Georgia,serif;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#f5c800;background:#111;border-top:2px solid rgba(245,200,0,0.5);';
      div.textContent='🔓 Secret Bots';
      menu.appendChild(div);
    }
    const b=document.createElement('button');
    const isSel = curIdx===i;
    b.style.cssText='display:block;width:100%;padding:7px 14px;font-size:13px;text-align:left;'
      +'background:'+(isSel?'var(--blue-dark, #0a0fa8)':'#1a1a1a')
      +';color:'+(isSel?'var(--yellow, #f5c800)':'#eee')
      +';border:none;border-bottom:1px solid #333;border-radius:0;box-shadow:none;'
      +'letter-spacing:0.02em;font-family:\'EB Garamond\',Georgia,serif;font-weight:'+(isSel?'700':'400')
      +';text-transform:none;cursor:pointer;';
    b.textContent=(isSel?'▸ ':'')+bot.name;
    b.onclick=()=>window.rdbSelectBot(which,i);
    menu.appendChild(b);
    if(isSel) selectedEl=b;
  });

  // Scroll selected bot into view
  if(selectedEl) setTimeout(()=>selectedEl.scrollIntoView({block:'nearest'}), 20);
}

window.rdbSelectBot=function(which, idx){
  if(idx<0) return; // bots only
  if(which==='a') rBotIdxA=idx;
  else rBotIdxB=idx;
  rBotMenuOpen=false;
  const menu=document.getElementById('rdb-bot-menu');
  if(menu) menu.style.display='none';
  // Update button label
  const bots=typeof BOTS!=='undefined'?BOTS:[];
  const label = idx<0 ? '👤 Human ▾' : (bots[idx]?bots[idx].name+' ▾':'Bot ▾');
  const btn=document.getElementById(which==='a'?'rdb-bot-btn-a':'rdb-bot-btn-b');
  if(btn) btn.textContent=label;
  rdbReset();
};

// ── Render ────────────────────────────────────────────
function rGetTheme(){ return typeof THEMES!=='undefined'?THEMES[typeof themeIdx!=='undefined'?themeIdx:0]:{l:'#cce0ff',d:'#1a5fa8'}; }

function rdbRender(){
  rDrawBoard('a'); rDrawBoard('b');
  rDrawCoords('a'); rDrawCoords('b');
  rDrawReserves(); rDrawLog('a'); rDrawLog('b');
  rSyncHeights(); rBuildSwatches();
  // Ensure bot chat element exists
  if(!document.getElementById('rdb-bot-chat')){
    const chatEl = document.createElement('div');
    chatEl.id = 'rdb-bot-chat';
    chatEl.style.cssText = [
      'display:none','align-items:center','gap:10px',
      'padding:8px 14px','margin:6px 0',
      'background:rgba(0,0,0,0.55)','border:1px solid rgba(245,200,0,0.35)',
      'border-radius:4px','min-height:36px',
      'transition:opacity 0.4s ease',
      'pointer-events:none'
    ].join(';');
    const statusEl = document.getElementById('rdb-status');
    if(statusEl && statusEl.parentNode){
      statusEl.parentNode.insertBefore(chatEl, statusEl.nextSibling);
    }
  }
  // Make reserve sections more prominent via inline style boosts
  ['rdb-res-p1','rdb-res-p2'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.style.minHeight='52px';
    el.style.fontSize='28px';
    el.style.gap='6px';
    el.style.padding='8px 10px';
    el.style.flexWrap='wrap';
  });
  // Reserve labels
  ['rdb-res-label-p1','rdb-res-label-p2'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){ el.style.fontSize='12px'; el.style.letterSpacing='0.12em'; }
  });
  const allHuman = rP2IsAllHuman();
  const pn = RS.turn===1
    ? 'Player 1 — move on Board '+(RS.subTurn.toUpperCase())
    : (()=>{
        if(allHuman) return 'Player 2 — move on Board '+(RS.subTurn.toUpperCase());
        if(!rBotSplit){
          const bot=typeof BOTS!=='undefined'&&rBotIdxA>=0?BOTS[rBotIdxA]:null;
          return bot?bot.name+' — Board '+(RS.subTurn.toUpperCase()):'Player 2 — Board '+(RS.subTurn.toUpperCase());
        }
        const bA=typeof BOTS!=='undefined'&&rBotIdxA>=0?BOTS[rBotIdxA]:null;
        const bB=typeof BOTS!=='undefined'&&rBotIdxB>=0?BOTS[rBotIdxB]:null;
        return (bA?bA.name:'Human')+' / '+(bB?bB.name:'Human')+' — Board '+(RS.subTurn.toUpperCase());
      })();
  const mateNote = [RS.matedA?'♚A mated':'', RS.matedB?'♚B mated':''].filter(Boolean).join(', ');
  const lockNote = RS.tNum<=5 ? '  🔒 Board B locked — '+(6-RS.tNum)+' turn'+(6-RS.tNum===1?'':'s')+' left' : '';
  document.getElementById('rdb-status').textContent = 'Turn '+RS.tNum+' — '+pn+(mateNote?' ('+mateNote+')':'')+lockNote;
  // Drop row
  const dr=document.getElementById('rdb-drop-row');
  if(RS.dropMode){ dr.style.display='flex'; document.getElementById('rdb-drop-piece-label').textContent=GL[RS.dropMode.piece]||'?'; }
  else dr.style.display='none';
  const killBanner=document.getElementById('rdb-kill-banner');
  const discardBanner=document.getElementById('rdb-discard-banner');
  if(killBanner) killBanner.style.display=RS.killMode?'flex':'none';
  if(discardBanner) discardBanner.style.display=RS.discardResMode?'flex':'none';
}

function rDrawBoard(which){
  const sq=RDB_SQ;
  const board=which==='a'?RS.bA:RS.bB;
  const ep=which==='a'?RS.epA:RS.epB;
  // Active player's color on this board
  const pCl = RS.turn===1 ? 'w' : 'b'; // P1=white, P2=black on both boards
  const grid=document.getElementById('rdb-board-'+which);
  grid.innerHTML='';
  grid.style.gridTemplateColumns='repeat(8,'+sq+'px)';
  const theme=rGetTheme();
  const kp=rKingPos(board,pCl);
  const inCh=kp?rInCheck(board,pCl):false;

  // Legal move highlights for selected piece
  const legalTo=new Set();
  if(RS.sel && RS.sel.which===which){
    rLegal(board,RS.sel.r,RS.sel.c,ep).forEach(m=>legalTo.add(m.tr+','+m.tc));
  }

  // Drop highlights (only empty squares on player's own half)
  const dropOk=new Set();
  if(RS.dropMode){
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
      if(board[r][c]) continue;
      if(rTyp(RS.dropMode.piece)==='P'&&(r===0||r===7)) continue;
      if(!rDropRowOk(which, RS.turn, r)) continue;
      dropOk.add(r+','+c);
    }
  }

  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const sqEl=document.createElement('div');
    const isL=(r+c)%2===0;
    sqEl.style.cssText='width:'+sq+'px;height:'+sq+'px;position:relative;cursor:pointer;user-select:none;box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
    sqEl.style.background=isL?theme.l:theme.d;
    if(inCh&&kp&&kp[0]===r&&kp[1]===c) sqEl.style.background='#cc0000';
    if(RS.sel&&RS.sel.which===which&&RS.sel.r===r&&RS.sel.c===c) sqEl.style.outline='4px solid var(--yellow)';
    if(legalTo.has(r+','+c)){
      if(board[r][c]){ sqEl.style.boxShadow='inset 0 0 0 4px rgba(245,200,0,0.9)'; }
      else{ const d=document.createElement('div'); d.style.cssText='position:absolute;width:34%;height:34%;border-radius:50%;background:rgba(245,200,0,0.6);pointer-events:none;z-index:2;top:50%;left:50%;transform:translate(-50%,-50%);'; sqEl.appendChild(d); }
    }
    if(dropOk.has(r+','+c)){ const d=document.createElement('div'); d.style.cssText='position:absolute;width:30%;height:30%;border-radius:50%;background:rgba(0,200,255,0.55);pointer-events:none;z-index:2;top:50%;left:50%;transform:translate(-50%,-50%);'; sqEl.appendChild(d); }
    const p=board[r][c];
    if(p){
      const pd=document.createElement('div');
      pd.style.cssText='width:90%;height:90%;pointer-events:none;position:relative;z-index:1;display:flex;align-items:center;justify-content:center;';
      pd.innerHTML=typeof makePiece==='function'?makePiece(rTyp(p),rClr(p)==='w'):'<span style="font-size:'+(sq*0.72)+'px;line-height:1">'+GL[p]+'</span>';
      sqEl.appendChild(pd);
    }
    sqEl.addEventListener('click',()=>rClick(which,r,c));
    // Drag-drop from reserves onto board squares
    sqEl.addEventListener('dragover', e=>{
      if(!e.dataTransfer.types.includes('rdb-piece')) return;
      e.preventDefault();
      sqEl.style.outline='3px solid #00ccff';
    });
    sqEl.addEventListener('dragleave', ()=>{
      if(RS.sel&&RS.sel.which===which&&RS.sel.r===r&&RS.sel.c===c) sqEl.style.outline='4px solid var(--yellow)';
      else sqEl.style.outline='';
    });
    sqEl.addEventListener('drop', e=>{
      e.preventDefault();
      sqEl.style.outline='';
      const piece=e.dataTransfer.getData('rdb-piece');
      const player=parseInt(e.dataTransfer.getData('rdb-player'));
      if(!piece||!player) return;
      if(!RS||RS.gameOver) return;
      if(RS.turn===2&&!rP2IsAllHuman()) return;
      if(which!==RS.subTurn){ rdbMsg('You must move on Board '+(RS.subTurn.toUpperCase())+' first.',true); return; }
      if(player!==RS.turn){ rdbMsg('Not your turn.',true); return; }
      // Board B locked for first 5 turns
      if(which==='b'&&RS.tNum<=5){ rdbMsg('Board B is locked until turn 6.',true); return; }
      if(board[r][c]){ rdbMsg('That square is occupied.',true); return; }
      if(rTyp(piece)==='P'&&(r===0||r===7)){ rdbMsg('Cannot drop pawn on back rank.',true); return; }
      if(!rDropRowOk(which, player, r)){ rdbMsg('You can only drop on your own half of the board.',true); return; }
      // Remove from reserve
      const arr=player===1?RS.resP1:RS.resP2;
      const idx=arr.indexOf(piece); if(idx<0){ rdbMsg('Piece no longer in reserve.',true); return; }
      arr.splice(idx,1);
      RS.dropMode=null; RS.killMode=false; RS.discardResMode=false; RS.sel=null;
      rCommit(which, {drop:true, piece, tr:r, tc:c});
    });
    grid.appendChild(sqEl);
  }

  // Board B locked overlay for first 5 turns
  if(which==='b'){
    const existing=document.getElementById('rdb-b-lock-overlay');
    if(RS.tNum<=5){
      if(!existing){
        const ov=document.createElement('div');
        ov.id='rdb-b-lock-overlay';
        ov.style.cssText='position:absolute;inset:0;background:rgba(0,0,0,0.55);z-index:10;display:flex;align-items:center;justify-content:center;pointer-events:none;';
        ov.innerHTML='<div style="font-family:\'EB Garamond\',Georgia,serif;font-size:13px;font-weight:700;color:#ffaa44;letter-spacing:.12em;text-transform:uppercase;text-align:center;text-shadow:1px 1px 0 #000;">🔒 Locked<br><span style="font-size:10px;opacity:0.8;">Opens turn 6</span></div>';
        grid.style.position='relative';
        grid.appendChild(ov);
      }
    } else {
      if(existing) existing.remove();
    }
  }
}

function rDrawCoords(which){
  const sq=RDB_SQ;
  const re=document.getElementById('rdb-ranks-'+which); re.innerHTML='';
  const fe=document.getElementById('rdb-files-'+which); fe.innerHTML='';
  for(let r=0;r<8;r++){ const d=document.createElement('div'); d.className='rank-label'; d.style.height=sq+'px'; d.style.lineHeight=sq+'px'; d.textContent=8-r; re.appendChild(d); }
  FILES.split('').forEach(f=>{ const d=document.createElement('div'); d.className='file-label'; d.style.width=sq+'px'; d.textContent=f; fe.appendChild(d); });
}

function rDrawReserves(){
  const fmt=(a,player)=>a.length
    ?a.map((p,i)=>{
      const isDiscard=RS.discardResMode&&player===RS.turn;
      const style=isDiscard
        ?'cursor:pointer;font-size:20px;padding:2px;background:rgba(255,0,0,0.25);border:1px solid #ff4444;border-radius:3px;'
        :'cursor:pointer;font-size:20px;padding:2px;cursor:grab;';
      const title=isDiscard?'Click to discard from reserve':'Drag or click to drop on a board';
      return '<span draggable="true" style="'+style+'" '
        +'onclick="window.rdbDiscardReserveClick('+i+','+player+')" '
        +'ondragstart="window.rdbResDragStart(event,'+JSON.stringify(p)+','+player+')" '
        +'title="'+title+'">'+GL[p]+'</span>';
    }).join('')
    :'<span style="color:rgba(245,200,0,0.3);font-size:11px;font-family:\'EB Garamond\',serif;">empty</span>';
  document.getElementById('rdb-res-p1').innerHTML=fmt(RS.resP1,1);
  document.getElementById('rdb-res-p2').innerHTML=fmt(RS.resP2,2);
}

// ── Drag-and-drop from reserves ───────────────────────
window.rdbResDragStart=function(e, piece, player){
  e.dataTransfer.setData('rdb-piece', piece);
  e.dataTransfer.setData('rdb-player', String(player));
  e.dataTransfer.effectAllowed='move';
};

function rDrawLog(which){
  const log=which==='a'?RS.logA:RS.logB;
  const listEl=document.getElementById('rdb-hist-list-'+which);
  const footEl=document.getElementById('rdb-hist-foot-'+which);
  listEl.innerHTML='';
  const pairs=[]; let cur=null;
  log.forEach(e=>{ if(e.p===1){ cur={n:e.n,p1:e.note,p2:null}; pairs.push(cur); } else if(cur&&cur.n===e.n) cur.p2=e.note; else{ cur={n:e.n,p1:null,p2:e.note}; pairs.push(cur); } });
  pairs.slice(-40).reverse().forEach(pair=>{
    const row=document.createElement('div'); row.className='move-row';
    row.innerHTML='<div class="move-num">'+pair.n+'</div><div class="move-cell white-cell">'+(pair.p1||'…')+'</div><div class="move-cell black-cell">'+(pair.p2||'')+'</div>';
    listEl.appendChild(row);
  });
  footEl.textContent=log.length+' moves';
}

function rSyncHeights(){
  const h=(RDB_SQ*8+8)+'px';
  const ha=document.getElementById('rdb-hist-a'), hb=document.getElementById('rdb-hist-b');
  if(ha) ha.style.height=h; if(hb) hb.style.height=h;
}

function rBuildSwatches(){
  if(typeof THEMES==='undefined') return;
  const el=document.getElementById('rdb-theme-swatches'); if(!el||el.children.length>0) return;
  THEMES.forEach((t,i)=>{
    const w=document.createElement('div'); w.title=t.name;
    w.style.cssText='width:18px;height:18px;cursor:pointer;border:2px solid rgba(201,168,76,0.3);border-radius:2px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;';
    w.innerHTML='<div style="background:'+t.l+'"></div><div style="background:'+t.d+'"></div><div style="background:'+t.d+'"></div><div style="background:'+t.l+'"></div>';
    w.onclick=()=>{ themeIdx=i; el.innerHTML=''; rdbRender(); };
    el.appendChild(w);
  });
}

// ── Click handler ─────────────────────────────────────
function rClick(which, r, c){
  if(!RS||RS.gameOver) return;
  if(RS.turn===2&&!rP2IsAllHuman()) return;
  if(RS.subTurn==='b'&&RS.tNum<=5) RS.subTurn='a';

  const board=which==='a'?RS.bA:RS.bB;
  const ep=which==='a'?RS.epA:RS.epB;
  const pCl = RS.turn===1 ? 'w' : 'b'; // P1=white, P2=black on both boards

  // ── Kill mode ──
  if(RS.killMode){
    const p=board[r][c];
    if(!p){ rdbMsg('No piece there.',true); return; }
    if(rClr(p)!==pCl){ rdbMsg('You can only kill your own pieces.',true); return; }
    if(rTyp(p)==='K'){ rdbMsg('Cannot kill your own King!',true); return; }
    RS.histSnaps.push(JSON.parse(JSON.stringify({
      bA:RS.bA,bB:RS.bB,epA:RS.epA,epB:RS.epB,
      castA:RS.castA,castB:RS.castB,
      resP1:[...RS.resP1],resP2:[...RS.resP2],
      turn:RS.turn,tNum:RS.tNum,
      logA:[...RS.logA],logB:[...RS.logB]
    })));
    board[r][c]=null;
    RS.killMode=false; RS.sel=null; RS.dropMode=null; RS.discardResMode=false;
    const bLk=RS.tNum<=5;
    if(which==='a'){
      RS.subTurn=(bLk||RS.matedB)?'a':'b';
      if(bLk||RS.matedB){ RS.turn=RS.turn===1?2:1; RS.tNum++; }
    } else {
      RS.turn=RS.turn===1?2:1; RS.subTurn='a'; RS.tNum++;
    }
    rdbRender();
    rdbMsg('☠ Piece removed — turn used.');
    if(RS.turn===2&&!rP2IsAllHuman()&&!RS.gameOver)
      setTimeout(rDoBotTurn,(typeof botMoveDelay!=='undefined'?botMoveDelay:400)+50);
    return;
  }

  // ── Drop mode: drop counts as the sub-turn for whichever board it lands on ──
  if(RS.dropMode){
    if(which==='b'&&RS.tNum<=5){ rdbMsg('Board B is locked until turn 6.',true); return; }
    if(board[r][c]){ rdbMsg('That square is occupied.',true); return; }
    if(rTyp(RS.dropMode.piece)==='P'&&(r===0||r===7)){ rdbMsg('Cannot drop pawn on back rank.',true); return; }
    if(!rDropRowOk(which,RS.turn,r)){ rdbMsg('You can only drop on your own half of the board.',true); return; }
    RS.subTurn=which; // so rAdvanceTurn advances from the right board
    rCommit(which,{drop:true,piece:RS.dropMode.piece,tr:r,tc:c});
    return;
  }

  // ── Enforce subTurn for normal moves ──
  if(which!==RS.subTurn){
    const matedOnRequired=RS.subTurn==='a'?RS.matedA:RS.matedB;
    if(matedOnRequired) RS.subTurn=RS.subTurn==='a'?'b':'a';
    if(which!==RS.subTurn){ rdbMsg('You must move on Board '+(RS.subTurn.toUpperCase())+' first.',true); return; }
  }
  if(which==='b'&&RS.tNum<=5){ rdbMsg('Board B is locked until turn 6.',true); return; }

  // ── No piece selected yet ──
  if(!RS.sel){
    if(board[r][c] && rClr(board[r][c])===pCl){
      RS.sel={which,r,c};
      rDrawBoard(which);
      rdbMsg('Piece selected — click a destination.');
    }
    return;
  }

  // ── Piece already selected ──
  const{which:sw, r:fr, c:fc}=RS.sel;

  // Clicked a different board — switch selection to new board
  if(sw!==which){
    if(board[r][c]&&rClr(board[r][c])===pCl){
      RS.sel={which,r,c};
      rDrawBoard(sw); rDrawBoard(which);
      rdbMsg('Switched to '+which.toUpperCase()+' board — pick a destination.');
    } else {
      rdbMsg('Select one of your pieces first.',true);
    }
    return;
  }

  // Deselect
  if(fr===r&&fc===c){ RS.sel=null; rDrawBoard(which); rdbMsg(''); return; }

  // Reselect a different own piece
  if(board[r][c]&&rClr(board[r][c])===pCl){
    RS.sel={which,r,c}; rDrawBoard(which); rdbMsg('Piece selected — click a destination.'); return;
  }

  // Try to move
  const mv=rLegal(board,fr,fc,ep).find(m=>m.tr===r&&m.tc===c);
  if(!mv){ rdbMsg('Illegal move — try again.',true); RS.sel=null; rDrawBoard(which); return; }

  RS.sel=null;
  rCommit(which, mv);
}

// ── Reserve click: pick a piece to drop ──────────────
window.rdbReserveClick=function(piece, player){
  if(!RS||RS.gameOver) return;
  if(RS.turn===2&&!rP2IsAllHuman()) return;
  if(player!==RS.turn){ rdbMsg('Not your turn.',true); return; }
  RS.dropMode={piece}; RS.sel=null; RS.killMode=false; RS.discardResMode=false;
  rdbRender();
  rdbMsg('Dropping '+GL[piece]+' — click any empty square on either board.');
};

function rdbMsg(msg, err=false){
  const el=document.getElementById('rdb-msg'); if(!el) return;
  el.textContent=msg; el.style.color=err?'#cc0000':'#117700';
}

})();