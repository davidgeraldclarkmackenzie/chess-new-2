// ══════════════════════════════════════════════════════════════
//  CHESSKERS — Chess (White) vs Checkers (Black)
//  Runs inside the existing #app board, hijacking cvcMode.
//  Chess side uses all normal chess rules.
//  Checkers side uses checkers rules (forced jumps, kings, side-squats).
// ══════════════════════════════════════════════════════════════

let cvcMode = false;
let sandboxMode = false;
let cvcCheckersTurn = false;  // false=chess(white) turn, true=checkers(black) turn
let cvcBypassForced = false;  // cheat: bypass forced jump
let cvcBotFrozen   = false;   // cheat: freeze AI
let cvcCheckerBotActive = true; // bot plays checkers side when true (mirrors botIdx logic)

// ── Patch bot-row labels when in Chesskers mode ──
function ckSetupUI(){
  const wLbl = document.querySelector('#bot-row .bot-label');
  const bLbl = document.querySelectorAll('#bot-row .bot-label')[1];
  if(wLbl) wLbl.textContent = 'Chess (White)';
  if(bLbl) bLbl.textContent = 'Checkers (Black)';
  const h1 = document.querySelector('#header h1');
  if(h1){ h1._origText = h1._origText || h1.textContent; h1.textContent = '⚔ CHESSKERS'; }
  const sub = document.querySelector('#header .header-sub');
  if(sub){ sub._origText = sub._origText || sub.textContent; sub.textContent = 'Chess vs Checkers · Stevenson Club Edition'; }
}
function ckRestoreUI(){
  const wLbl = document.querySelector('#bot-row .bot-label');
  const bLbl = document.querySelectorAll('#bot-row .bot-label')[1];
  if(wLbl) wLbl.textContent = 'White';
  if(bLbl) bLbl.textContent = 'Black';
  const h1 = document.querySelector('#header h1');
  if(h1 && h1._origText) h1.textContent = h1._origText;
  const sub = document.querySelector('#header .header-sub');
  if(sub && sub._origText) sub.textContent = sub._origText;
}

// ── Board init ──
function initCvcBoard(){
  const b = Array.from({length:8},()=>Array(8).fill(null));
  const back=['wR','wN','wB','wQ','wK','wB','wN','wR'];
  for(let c=0;c<8;c++) b[7][c]=back[c];
  for(let c=0;c<8;c++) b[6][c]='wP';
  // Checkers on dark squares rows 0-2
  for(let r=0;r<3;r++) for(let c=0;c<8;c++) if((r+c)%2===1) b[r][c]='bC';
  return b;
}

// ── Checker move generation ──
// Returns moves/jumps. Jumps always override normals (forced capture rule).
function cvcCheckerMoves(b, r, c, forceCapOnly){
  const p = b[r][c]; if(!p || p[0]!=='b') return [];
  const isKing = p==='bCK';
  const dirs = isKing ? [1,-1] : [1]; // normal checkers move DOWN (increasing r)
  const normals=[], jumps=[];

  dirs.forEach(dr=>{
    // Diagonal moves/jumps
    [-1,1].forEach(dc=>{
      const nr=r+dr, nc=c+dc;
      if(nr<0||nr>7||nc<0||nc>7) return;
      if(!b[nr][nc]){
        if(!forceCapOnly) normals.push({r:nr,c:nc,cap:null,type:'move'});
      } else if(b[nr][nc][0]==='w'){
        const jr=r+dr*2, jc=c+dc*2;
        if(jr>=0&&jr<8&&jc>=0&&jc<8&&!b[jr][jc])
          jumps.push({r:jr,c:jc,cap:[nr,nc],type:'jump'});
      }
    });
    // Side squat (horizontal, no row gain)
    [-1,1].forEach(dc=>{
      const nc=c+dc*2;
      if(nc>=0&&nc<8&&!b[r][nc]&&(r+nc)%2===1) // must stay on dark squares
        if(!forceCapOnly) normals.push({r:r,c:nc,cap:null,type:'squat'});
    });
  });
  return jumps.length ? jumps : normals;
}

// All checkers that have available captures
function cvcAllCheckerCaptures(b){
  const caps=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=b[r][c]; if(!p||p[0]!=='b') continue;
    if(cvcCheckerMoves(b,r,c,true).length) caps.push([r,c]);
  }
  return caps;
}

// Apply a checker or chess move to a board copy
function cvcApplyMove(b, sr, sc, nr, nc, cap){
  const nb = b.map(row=>[...row]);
  nb[nr][nc] = nb[sr][sc];
  nb[sr][sc] = null;
  if(cap) nb[cap[0]][cap[1]] = null;
  // King promotion: checkers reach row 7 (White's back rank)
  if(nb[nr][nc]==='bC' && nr===7) nb[nr][nc]='bCK';
  return nb;
}

// Win check
function cvcCheckWinner(b){
  let checkers=0, chess=0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    if(b[r][c]==='bC'||b[r][c]==='bCK') checkers++;
    if(b[r][c]&&b[r][c][0]==='w') chess++;
  }
  if(checkers===0) return 'chess';
  if(!findKing(b,'w')) return 'checkers';
  if(chess===0) return 'checkers';
  return null;
}

// ── Reset / start ──
function resetCvc(){
  cvcMode=true; cvcCheckersTurn=false;
  board=initCvcBoard();
  turn='w'; selected=null; highlightMoves=[]; blockedMoves=[]; history=[];
  castleRights={w:{k:true,q:true},b:{k:false,q:false}};
  enPassant=null; gameOver=false; moveLog=[]; teacherLog=[];
  const tp=document.getElementById('teacher-summary-panel'); if(tp) tp.remove();
  steveModeActive=false; drunkModeActive=false;
  document.getElementById('board-container').style.transform='';
  document.getElementById('msg').textContent='';
  document.getElementById('status').textContent='Chess (White) to move';
  renderMoveHistory(); resize();
  rebuildPieces(); renderSquares();
  // If bot plays checkers side, wait before first AI move
  if(!cvcCheckersTurn && shouldCvcCheckerBot()) { /* chess goes first */ }
}

function shouldCvcCheckerBot(){ return botIdx>=0; }
function shouldCvcChessBot(){ return whiteBotIdx>=0; }

// ── Click handler ──
function cvcHandleClick(r, c){
  if(gameOver) return;

  // ── Chess (white) turn ──
  if(!cvcCheckersTurn){
    handleClick(r,c); // normal chess logic; cvcAfterChessMove fires after commit
    return;
  }

  // ── Checkers (black) turn ──
  const p = board[r][c];
  const forcedPieces = cvcBypassForced ? [] : cvcAllCheckerCaptures(board);
  const hasForcedCapture = forcedPieces.length > 0;

  if(selected){
    const [sr,sc] = selected;
    const move = highlightMoves && highlightMoves.find(m=>m.r===r&&m.c===c);
    if(move){
      if(hasForcedCapture && !move.cap){
        document.getElementById('msg').textContent='⚠ Must jump!';
        rebuildPieces(); renderSquares(); return;
      }
      // Save undo history
      history.push({board:board.map(row=>[...row]),turn,castleRights:JSON.parse(JSON.stringify(castleRights)),enPassant,moveLog:JSON.parse(JSON.stringify(moveLog))});
      // Record move notation
      const files='abcdefgh';
      const note=files[sc]+(8-sr)+(move.cap?'x':'-')+files[r]+(8-nr);
      if(moveLog.length&&moveLog[moveLog.length-1].black===null) moveLog[moveLog.length-1].black=note;
      else moveLog.push({white:'…',black:note});
      renderMoveHistory();

      board = cvcApplyMove(board, sr, sc, r, c, move.cap);
      selected=null; highlightMoves=[];

      // Win check
      const winner = cvcCheckWinner(board);
      if(winner){ gameOver=true; rebuildPieces(); renderSquares(); cvcShowWinner(winner); return; }

      // Multi-jump chain?
      if(move.cap){
        const moreCaps = cvcCheckerMoves(board,r,c,true);
        if(moreCaps.length){
          selected=[r,c]; highlightMoves=moreCaps;
          rebuildPieces(); renderSquares();
          document.getElementById('msg').textContent='Continue jumping!';
          return;
        }
      }

      // End checkers turn
      cvcEndCheckersTurn();
      return;
    }
    selected=null; highlightMoves=[];
  }

  // Select a checker
  if(p&&(p==='bC'||p==='bCK')){
    if(hasForcedCapture && !forcedPieces.some(([fr,fc])=>fr===r&&fc===c)){
      document.getElementById('msg').textContent='⚠ Must use a piece that can jump!';
      rebuildPieces(); renderSquares(); return;
    }
    selected=[r,c];
    highlightMoves = cvcCheckerMoves(board,r,c,hasForcedCapture);
    document.getElementById('msg').textContent='';
  } else {
    selected=null; highlightMoves=[];
  }
  rebuildPieces(); renderSquares();
}

function cvcEndCheckersTurn(){
  cvcCheckersTurn=false; turn='w';
  selected=null; highlightMoves=[];
  rebuildPieces(); renderSquares();
  document.getElementById('status').textContent='Chess (White) to move';
  document.getElementById('msg').textContent='';
  // Chess bot?
  if(shouldCvcChessBot()) setTimeout(doBotMove, botMoveDelay);
}

// Called from animateAndCommit after a chess move commits
function cvcAfterChessMove(){
  if(!cvcMode) return;
  const winner = cvcCheckWinner(board);
  if(winner){ gameOver=true; cvcShowWinner(winner); return; }
  cvcCheckersTurn=true; turn='b';
  document.getElementById('status').textContent='Checkers (Black) to move';
  const forcedPieces = cvcBypassForced ? [] : cvcAllCheckerCaptures(board);
  document.getElementById('msg').textContent = forcedPieces.length ? '⚠ Forced jump!' : '';
  rebuildPieces(); renderSquares();
  // Checkers bot?
  if(!cvcBotFrozen && shouldCvcCheckerBot()) setTimeout(cvcDoBotMove, botMoveDelay);
}

// ── Checkers AI ──
function cvcDoBotMove(){
  if(gameOver||!cvcCheckersTurn||cvcBotFrozen) return;
  // Collect all moves for all black pieces
  const all=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    if(board[r][c]==='bC'||board[r][c]==='bCK'){
      const moves = cvcCheckerMoves(board,r,c,false);
      moves.forEach(m=>all.push({sr:r,sc:c,...m}));
    }
  }
  if(!all.length){ gameOver=true; cvcShowWinner('chess'); return; }
  // Prefer jumps, then advancing moves
  const scored = all.map(m=>{
    let s = 0;
    if(m.cap) s += 5 + (board[m.cap[0]]?.[m.cap[1]]?PVAL[type(board[m.cap[0]][m.cap[1]])]||1:1)*0.01;
    s -= m.r * 0.1; // advancing = lower row
    if(board[m.sr][m.sc]==='bC'&&m.r===7) s+=3; // king promotion
    s += Math.random()*0.4;
    return {...m,s};
  });
  scored.sort((a,b)=>b.s-a.s);
  const best = scored[0];

  // Show bot speech
  const activeIdx = botIdx;
  if(activeIdx>=0){
    const chatType = best.cap?'onCapture':'onMove';
    setTimeout(()=>showBotChat(chatType, activeIdx),100);
  }

  history.push({board:board.map(row=>[...row]),turn,castleRights:JSON.parse(JSON.stringify(castleRights)),enPassant,moveLog:JSON.parse(JSON.stringify(moveLog))});

  // Animate move
  const sr=best.sr, sc=best.sc, nr=best.r, nc=best.c;
  const movEl = pieceEls[sr+','+sc];
  if(movEl){
    movEl.classList.add('moving');
    movEl.style.left=(nc*sqSize)+'px'; movEl.style.top=(nr*sqSize)+'px';
    delete pieceEls[sr+','+sc]; pieceEls[nr+','+nc]=movEl;
  }
  if(best.cap){
    const capKey=best.cap[0]+','+best.cap[1];
    const capEl=pieceEls[capKey];
    if(capEl){ capEl.classList.add('capturing'); capEl.addEventListener('animationend',()=>capEl.remove(),{once:true}); delete pieceEls[capKey]; }
  }

  setTimeout(()=>{
    // Record move
    const files='abcdefgh';
    const note=files[sc]+(8-sr)+(best.cap?'x':'-')+files[nc]+(8-nr);
    if(moveLog.length&&moveLog[moveLog.length-1].black===null) moveLog[moveLog.length-1].black=note;
    else moveLog.push({white:'…',black:note});
    renderMoveHistory();

    board = cvcApplyMove(board,sr,sc,nr,nc,best.cap);

    const winner=cvcCheckWinner(board);
    if(winner){ gameOver=true; rebuildPieces(); renderSquares(); cvcShowWinner(winner); return; }

    // Multi-jump chain
    if(best.cap){
      const moreCaps=cvcCheckerMoves(board,nr,nc,true);
      if(moreCaps.length){
        rebuildPieces(); renderSquares();
        setTimeout(()=>{
          const chain=moreCaps[Math.floor(Math.random()*moreCaps.length)];
          const fakeMove={sr:nr,sc:nc,...chain};
          // Re-run bot with chain
          const f=fakeMove;
          const ml2=pieceEls[f.sr+','+f.sc];
          if(ml2){ ml2.classList.add('moving'); ml2.style.left=(f.c*sqSize)+'px'; ml2.style.top=(f.r*sqSize)+'px'; delete pieceEls[f.sr+','+f.sc]; pieceEls[f.r+','+f.c]=ml2; }
          if(f.cap){ const ck=f.cap[0]+','+f.cap[1]; const ce=pieceEls[ck]; if(ce){ce.classList.add('capturing');ce.addEventListener('animationend',()=>ce.remove(),{once:true});delete pieceEls[ck];} }
          setTimeout(()=>{
            const note2=files[f.sc]+(8-f.sr)+'x'+files[f.c]+(8-f.r);
            if(moveLog.length&&moveLog[moveLog.length-1].black!==null) moveLog[moveLog.length-1].black+='×'+files[f.c]+(8-f.r);
            board=cvcApplyMove(board,f.sr,f.sc,f.r,f.c,f.cap);
            const w2=cvcCheckWinner(board);
            if(w2){ gameOver=true; rebuildPieces(); renderSquares(); cvcShowWinner(w2); return; }
            cvcEndCheckersTurn();
          },200);
        },250);
        return;
      }
    }
    cvcEndCheckersTurn();
  },250);
}

function cvcShowWinner(winner){
  const isChessWin = winner==='chess';
  showOverlay(isChessWin?'win':'checkmate',
    isChessWin?'CHESS WINS':'CHECKERS WINS',
    isChessWin?'All checkers captured — White triumphs!':'The Chess King has fallen — Checkers prevails!');
}

// ── Patch the cheat system to support Chesskers-specific cheats ──
const _origCheckCheats = typeof checkCheats!=='undefined' ? checkCheats : null;
// These are injected into the main cheat engine later (see checkCheats extension below)

// Keep a note that cvcMode starts false

function showModeSelect(){
  const ms=document.getElementById('mode-select');
  if(ms){ ms.style.display='flex'; }
  const ra=document.getElementById('rdb-app');
  if(ra) ra.classList.remove('open');
  const rdbs=document.getElementById('rdb-screen');
  if(rdbs) rdbs.classList.remove('open');
  const fo=document.getElementById('fourp-overlay');
  if(fo) fo.style.display='none';
  document.getElementById('app').style.display='none';
  sandboxMode=false;
  const eb=document.getElementById('edit-board-btn');
  if(eb) eb.style.display='none';
  if(cvcMode){ cvcMode=false; ckRestoreUI(); }
}