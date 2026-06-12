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
  b[7][4]='wK'; b[6][3]='wP'; b[6][4]='wP'; b[6][5]='wP';
  b[0][4]='bK'; b[1][3]='bP'; b[1][4]='bP'; b[1][5]='bP';
  return b;
}

// ── Game state ────────────────────────────────────────
// P1 = White on A, Black on B
// P2 = Black on A, White on B
// One move per turn on either board.
let RS;
function rFresh(){
  return{
    bA:rMakeA(), bB:rMakeB(),
    epA:null, epB:null,
    castA:{w:{k:true,q:true},b:{k:true,q:true}},
    castB:{w:{k:false,q:false},b:{k:false,q:false}},
    resP1:[], resP2:[],  // reserves: P1 captures on A, drops on B; same for P2
    turn:1, tNum:1, gameOver:false,
    logA:[], logB:[],
    histSnaps:[],
    sel:null,       // {which, r, c} — currently selected piece
    dropMode:null,  // {piece} — reserve piece chosen to drop
    killMode:false, // true = next click on own piece removes it
    discardResMode:false, // true = next click on reserve piece discards it
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

function rGetBot(which){
  const bots = typeof BOTS!=='undefined' ? BOTS : [];
  if(!rBotSplit) return bots[rBotIdxA] || bots[1];
  const idx = which==='a' ? rBotIdxA : rBotIdxB;
  return bots[idx] || bots[1];
}
function rIsHumanBoard(){ return false; } // bots only on P2
function rP2IsAllHuman(){ return false; }

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

// ── Commit a single move ──────────────────────────────
// mv = { which:'a'|'b', move:{fr,fc,tr,tc,f} | {drop:true,piece,tr,tc} }
function rCommit(which, mv){
  const pCl = RS.turn===1 ? (which==='a'?'w':'b') : (which==='a'?'b':'w');

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

    // If captured, add to capturer's reserve & respawn for owner
    if(result.cap){
      const capType = rTyp(result.cap);
      const capOwner = rClr(result.cap); // original owner color
      // The capturer (pCl) gets the piece to drop on their OTHER board
      const piece = pCl + capType;
      if(RS.turn===1) RS.resP1.push(piece); else RS.resP2.push(piece);
      // Respawn on Board A ONLY when the capture happened on Board B
      if(which==='b') rRespawn(capOwner+capType, capOwner);
    }
  }

  // Log
  const logArr = which==='a' ? RS.logA : RS.logB;
  logArr.push({n:RS.tNum, p:RS.turn, note});

  // Check win: opponent in checkmate on BOTH boards?
  const oppCl  = rOpp(RS.turn===1?'w':'b');  // opp's A-color
  const oppClB = rOpp(RS.turn===1?'b':'w');  // opp's B-color
  const cmA = rCheckmate(RS.bA, oppCl,  RS.epA);
  const cmB = rCheckmate(RS.bB, oppClB, RS.epB);

  // Advance turn
  RS.turn = RS.turn===1?2:1;
  RS.tNum++;
  RS.sel = null;
  RS.dropMode = null;
  RS.killMode = false;
  RS.discardResMode = false;

  rdbRender();

  if(cmA && cmB){
    RS.gameOver=true;
    const winner = 'Player '+(RS.turn===1?2:1);
    document.getElementById('rdb-win-overlay').className='show';
    document.getElementById('rdb-win-sub').textContent=winner+' — double checkmate!';
    rdbMsg('💀 '+winner+' wins!');
    return;
  }

  // Check messages
  const msgs=[];
  if(rInCheck(RS.bA, oppCl))  msgs.push('CHECK on A!');
  if(rInCheck(RS.bB, oppClB)) msgs.push('CHECK on B!');
  if(msgs.length) rdbMsg(msgs.join('  ')); else rdbMsg('');

  // Trigger bot if P2's turn
  if(RS.turn===2 && !rP2IsAllHuman() && !RS.gameOver){
    setTimeout(rDoBotTurn, (typeof botMoveDelay!=='undefined'?botMoveDelay:400)+50);
  }
}

// ── Bot turn ──────────────────────────────────────────
function rDoBotTurn(){
  if(!RS||RS.gameOver||RS.turn!==2) return;
  if(rP2IsAllHuman()) return;

  const bLocked = RS.tNum<=5; // Board B locked for first 5 turns
  const botA = rGetBot('a'); // bot for Board A (plays Black on A)
  const botB = rGetBot('b'); // bot for Board B (plays White on B)

  // Each bot focuses on its own board, cooperating as a team
  const mvA = (botA && !rIsHumanBoard('a')) ? rGetBotMove(RS.bA,'b',RS.epA,botA) : null;
  const mvB = (botB && !rIsHumanBoard('b') && !bLocked) ? rGetBotMove(RS.bB,'w',RS.epB,botB) : null;

  // Reserve drops — use the relevant bot's logic
  const res = RS.resP2;
  let chosen = null;

  if(!bLocked && res.length>0 && botB && !rIsHumanBoard('b') && Math.random()<0.3){
    const piece = res[Math.floor(Math.random()*res.length)];
    const sq = rGetBotDrop(piece, RS.bB);
    if(sq){ chosen={which:'b',mv:{drop:true,piece,tr:sq.tr,tc:sq.tc}}; }
  }

  if(!chosen){
    // Split mode: bots prefer their own board, but will cover if the other is human
    if(!rBotSplit){
      // Single bot: pick best board by eval
      if(mvA && mvB){ chosen = Math.random()<0.5?{which:'a',mv:mvA}:{which:'b',mv:mvB}; }
      else if(mvA){ chosen={which:'a',mv:mvA}; }
      else if(mvB){ chosen={which:'b',mv:mvB}; }
    } else {
      // Dual bot: A-bot prefers Board A, B-bot prefers Board B
      // If both have moves, each stays on their board — randomly pick which one goes this turn
      const aHasMove = mvA && botA && !rIsHumanBoard('a');
      const bHasMove = mvB && botB && !rIsHumanBoard('b');
      if(aHasMove && bHasMove){
        // Both want to move — weight toward the board in more danger (in check)
        const aInCheck = rInCheck(RS.bA,'b');
        const bInCheck = rInCheck(RS.bB,'w');
        if(aInCheck && !bInCheck) chosen={which:'a',mv:mvA};
        else if(bInCheck && !aInCheck) chosen={which:'b',mv:mvB};
        else chosen = Math.random()<0.5?{which:'a',mv:mvA}:{which:'b',mv:mvB};
      } else if(aHasMove){ chosen={which:'a',mv:mvA}; }
      else if(bHasMove){ chosen={which:'b',mv:mvB}; }
    }
  }

  if(!chosen){ return; } // no moves available
  rCommit(chosen.which, chosen.mv);
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

function rGetBotDrop(piece,bB){
  const ty=rTyp(piece); const squares=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){ if(bB[r][c]) continue; if(ty==='P'&&(r===0||r===7)) continue; squares.push({tr:r,tc:c}); }
  if(!squares.length) return null;
  squares.sort((a,b)=>Math.abs(a.tr-3.5)+Math.abs(a.tc-3.5)-(Math.abs(b.tr-3.5)+Math.abs(b.tc-3.5)));
  return squares[Math.floor(Math.random()*Math.min(squares.length,5))];
}

// ── UI ────────────────────────────────────────────────
const RDB_SQ=54;

function rdbInit(){ RS=rFresh(); rBotMenuOpen=false; rdbRender(); rdbMsg('Make a move on either board.'); }
window.rdbInit=rdbInit;
function rdbReset(){ document.getElementById('rdb-win-overlay').className=''; rdbInit(); }
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
  rdbMsg(RS.killMode ? '☠ Kill mode — click one of your own pieces to remove it (no turn used).' : '');
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
  if(rBotMenuOpen && rBotMenuTarget===which){ // close
    rBotMenuOpen=false; menu.style.display='none'; return;
  }
  rBotMenuTarget=which;
  rBotMenuOpen=true;
  rBuildBotMenu(which);
  // Position near the button
  const btn=document.getElementById(which==='a'?'rdb-bot-btn-a':'rdb-bot-btn-b');
  if(btn){
    const r=btn.getBoundingClientRect();
    menu.style.left=r.left+'px';
    menu.style.top=(r.bottom+4)+'px';
  }
  menu.style.display='block';
  // Close on outside click
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

  // No Human option — bots only on P2
  const secretDivider=document.createElement('div');
  secretDivider.style.cssText='display:none';
  let secretSection=false;

  bots.forEach((bot,i)=>{
    if(bot.secret&&!bot.unlocked){
      if(!secretSection){
        secretSection=true;
        const div=document.createElement('div');
        div.style.cssText='padding:4px 10px 2px;font-family:"EB Garamond",Georgia,serif;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#888;background:#111;border-top:2px solid rgba(245,200,0,0.25);border-bottom:1px solid rgba(245,200,0,0.1);';
        div.textContent='🔒 Secret Bots';
        menu.appendChild(div);
      }
      const lb=document.createElement('button');
      lb.style.cssText='display:block;width:100%;padding:6px 14px;font-size:12px;text-align:left;background:#111;border:none;border-bottom:1px solid #222;color:#555;box-shadow:none;letter-spacing:0.05em;font-family:"Courier Prime",Courier,monospace;cursor:default;font-style:italic;';
      lb.textContent='🔒 ???';
      menu.appendChild(lb);
      return;
    }
    if(bot.secret&&bot.unlocked&&!secretSection){
      secretSection=true;
      const div=document.createElement('div');
      div.style.cssText='padding:4px 10px 2px;font-family:"EB Garamond",Georgia,serif;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#888;background:#111;border-top:2px solid rgba(245,200,0,0.25);';
      div.textContent='🔓 Secret Bots';
      menu.appendChild(div);
    }
    const b=document.createElement('button');
    b.style.cssText='display:block;width:100%;padding:6px 14px;font-size:13px;text-align:left;background:'+(curIdx===i?'var(--blue-dark)':'var(--cream)')+';color:'+(curIdx===i?'var(--yellow)':'var(--black)')+';border:none;border-bottom:2px solid #000;border-radius:0;box-shadow:none;letter-spacing:0.02em;font-family:\'EB Garamond\',Georgia,serif;font-weight:600;text-transform:none;cursor:pointer;';
    b.textContent=bot.name;
    b.onclick=()=>window.rdbSelectBot(which,i);
    menu.appendChild(b);
  });
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
  const allHuman = rP2IsAllHuman();
  let p2label;
  if(allHuman){
    p2label='Player 2 to move';
  } else if(!rBotSplit){
    const bot=typeof BOTS!=='undefined'&&rBotIdxA>=0?BOTS[rBotIdxA]:null;
    p2label=bot?'Bot ('+bot.name+') thinking...':'Player 2 to move';
  } else {
    const bA=typeof BOTS!=='undefined'&&rBotIdxA>=0?BOTS[rBotIdxA]:null;
    const bB=typeof BOTS!=='undefined'&&rBotIdxB>=0?BOTS[rBotIdxB]:null;
    p2label=(bA?bA.name:'Human')+' / '+(bB?bB.name:'Human')+' thinking...';
  }
  const pn = RS.turn===1 ? 'Player 1 to move' : p2label;
  const lockNote = RS.tNum<=5 ? '  🔒 Board B locked — '+(6-RS.tNum)+' turn'+(6-RS.tNum===1?'':'s')+' left' : '';
  document.getElementById('rdb-status').textContent = 'Turn '+RS.tNum+' — '+pn+lockNote;
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
  const pCl = RS.turn===1 ? (which==='a'?'w':'b') : (which==='a'?'b':'w');
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

  // Drop highlights (all empty squares on the selected board)
  const dropOk=new Set();
  if(RS.dropMode){
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
      if(board[r][c]) continue;
      if(rTyp(RS.dropMode.piece)==='P'&&(r===0||r===7)) continue;
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
      if(player!==RS.turn){ rdbMsg('Not your turn.',true); return; }
      // Board B locked for first 5 turns
      if(which==='b'&&RS.tNum<=5){ rdbMsg('Board B is locked until turn 6.',true); return; }
      if(board[r][c]){ rdbMsg('That square is occupied.',true); return; }
      if(rTyp(piece)==='P'&&(r===0||r===7)){ rdbMsg('Cannot drop pawn on back rank.',true); return; }
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
  // Block if it's the bot's turn
  if(RS.turn===2&&!rP2IsAllHuman()) return;
  // Block Board B for first 5 turns
  if(which==='b'&&RS.tNum<=5){ rdbMsg('Board B is locked until turn 6.',true); return; }

  const board=which==='a'?RS.bA:RS.bB;
  const ep=which==='a'?RS.epA:RS.epB;
  // Active player's color on this board
  const pCl = RS.turn===1 ? (which==='a'?'w':'b') : (which==='a'?'b':'w');

  // ── Kill mode: player clicks one of their own pieces to remove it ──
  if(RS.killMode){
    const p=board[r][c];
    if(!p){ rdbMsg('No piece there.',true); return; }
    if(rClr(p)!==pCl){ rdbMsg('You can only kill your own pieces.',true); return; }
    if(rTyp(p)==='K'){ rdbMsg('Cannot kill your own King!',true); return; }
    board[r][c]=null;
    RS.killMode=false; RS.sel=null;
    rdbRender();
    rdbMsg('☠ Piece removed.');
    return;
  }

  // ── Drop mode: player clicked a square to place a reserve piece ──
  if(RS.dropMode){
    if(board[r][c]){ rdbMsg('That square is occupied.',true); return; }
    if(rTyp(RS.dropMode.piece)==='P'&&(r===0||r===7)){ rdbMsg('Cannot drop pawn on back rank.',true); return; }
    rCommit(which, {drop:true, piece:RS.dropMode.piece, tr:r, tc:c});
    return;
  }

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

const _origRdbInit=rdbInit;
window.rdbInit=function(){ _origRdbInit(); };

})();
