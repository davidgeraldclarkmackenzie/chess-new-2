// ═══════════════════════════════════════════════
// POLITICAL BOT SYSTEMS
// ═══════════════════════════════════════════════

function trackBotLoss(activeIdx){
  const bot=BOTS[activeIdx]; if(!bot) return;
  if(bot.piecesLost===undefined) bot.piecesLost=0;
  bot.piecesLost++;
}
function getTrumpBomberRate(bot){ return Math.min(bot.cheatMax||0.75,(bot.bomberBase||0.15)+(bot.piecesLost||0)*(bot.bomberPerLoss||0.05)); }
function getTrumpWallRate(bot){   return Math.min(bot.cheatMax||0.75,(bot.wallBase||0.00)+(bot.piecesLost||0)*(bot.wallPerLoss||0.10)); }

// TRUMP: B-2 Bomber
function trumpBomberStrike(targetColor,afterFn){
  const targets=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=board[r][c];
    if(p&&color(p)===targetColor&&type(p)!=='K') targets.push([r,c]);
  }
  if(!targets.length){ if(afterFn) afterFn(); return; }
  const [tr,tc]=targets[Math.floor(Math.random()*targets.length)];
  const ai=botIdx>=0?botIdx:whiteBotIdx;
  showBotChat('onMove',ai);
  const bomber=document.getElementById('b2-bomber');
  const targetY=tr*sqSize+sqSize/2-22;
  bomber.style.top=targetY+'px'; bomber.style.left='0px';
  bomber.innerHTML=`<svg viewBox="0 0 120 55" xmlns="http://www.w3.org/2000/svg" style="transform:scaleX(-1)">
    <polygon points="60,2 118,38 100,42 60,30 20,42 2,38" fill="#cc2200" stroke="#ff4400" stroke-width="1"/>
    <polygon points="60,8 108,36 90,40 60,26 30,40 12,36" fill="#aa1100" stroke="none"/>
    <ellipse cx="60" cy="20" rx="8" ry="4" fill="#880000" stroke="#cc4400" stroke-width="0.5"/>
    <text x="48" y="36" font-size="9" fill="#ffdd00" font-family="sans-serif">🇺🇸</text>
  </svg>`;
  bomber.classList.remove('flying'); void bomber.offsetWidth; bomber.classList.add('flying');
  setTimeout(()=>{
    const container=document.getElementById('board-container');
    const flash=document.createElement('div'); flash.className='bomb-flash';
    const flashSize=sqSize*1.4;
    flash.style.cssText=`width:${flashSize}px;height:${flashSize}px;left:${tc*sqSize-flashSize/2+sqSize/2}px;top:${tr*sqSize-flashSize/2+sqSize/2}px;`;
    container.appendChild(flash); setTimeout(()=>flash.remove(),600);
    board[tr][tc]=null; rebuildPieces(); renderSquares();
    cheatMsg('✈️ TRUMP B-2 BOMBER STRIKE! PIECE DESTROYED','#ff4400');
    if(afterFn) afterFn();
  },1900);
  setTimeout(()=>{ bomber.classList.remove('flying'); bomber.innerHTML=''; },3800);
}

// TRUMP: Wall / Deport
function trumpWallBlock(afterFn){
  // Find which side Don is playing, target the opponent
  const donSide=(botIdx>=0&&BOTS[botIdx]&&(BOTS[botIdx].isTrump||BOTS[botIdx].name.includes('The Don')))?'b':(whiteBotIdx>=0&&BOTS[whiteBotIdx]&&(BOTS[whiteBotIdx].isTrump||BOTS[whiteBotIdx].name.includes('The Don')))?'w':null;
  const humanColor = donSide ? opponent(donSide) : 'w';
  const targets=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=board[r][c];
    if(p&&color(p)===humanColor&&type(p)!=='K') targets.push([r,c]);
  }
  if(!targets.length){ if(afterFn) afterFn(); return; }
  const [tr,tc]=targets[Math.floor(Math.random()*targets.length)];
  const targetRow=(humanColor==='w')?7:0;
  const emptySpots=[];
  for(let c=0;c<8;c++) if(!board[targetRow][c]) emptySpots.push(c);
  if(emptySpots.length){
    const dc=emptySpots[Math.floor(Math.random()*emptySpots.length)];
    board[targetRow][dc]=board[tr][tc]; board[tr][tc]=null;
    rebuildPieces(); renderSquares();
    cheatMsg('🧱 DEPORTED! PIECE SENT BACK ACROSS THE WALL','#ff6a00');
    showBotChat('onWall',botIdx>=0?botIdx:whiteBotIdx);
  }
  if(afterFn) setTimeout(afterFn,400);
}

// BIDEN: Sleep Mode
let bidenSleeping=false;
let bidenSleepTimeout=null;
let bidenLagActive=false;

function bidenSleep(afterFn){
  if(bidenSleeping) return;
  bidenSleeping=true;
  const ov=document.getElementById('biden-sleep-overlay');
  if(ov) ov.classList.add('active');
  const delay=3000+Math.random()*4000;
  bidenSleepTimeout=setTimeout(()=>{ bidenWake(); if(afterFn) afterFn(); },delay);
  showBotChat('onSleep',botIdx>=0?botIdx:whiteBotIdx);
  cheatMsg('😴 BIDEN FELL ASLEEP — CLICK THE BOARD TO WAKE HIM','#4488ff');
}
function bidenWake(){
  if(!bidenSleeping) return;
  bidenSleeping=false;
  const ov=document.getElementById('biden-sleep-overlay');
  if(ov) ov.classList.remove('active');
  if(bidenSleepTimeout){ clearTimeout(bidenSleepTimeout); bidenSleepTimeout=null; }
  showBotChat('onWake',botIdx>=0?botIdx:whiteBotIdx);
  cheatMsg('😳 BIDEN AWAKES! GAME RESUMES','#4488ff');
  if(!gameOver) setTimeout(doBotMove,400);
}

// BIDEN: Laser Teleport King to safe tile
function bidenLaserTeleport(){
  const myColor=turn;
  const kp=findKing(board,myColor); if(!kp) return;
  const [kr,kc]=kp;
  const safeTiles=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    if(board[r][c]) continue;
    const nb=board.map(row=>[...row]);
    nb[r][c]=nb[kr][kc]; nb[kr][kc]=null;
    if(!isAttacked(nb,r,c,opponent(myColor))) safeTiles.push([r,c]);
  }
  if(!safeTiles.length){ cheatMsg('⚡ NO SAFE SQUARE FOR TELEPORT','#ffaa00'); return; }
  const [tr,tc]=safeTiles[Math.floor(Math.random()*safeTiles.length)];
  const container=document.getElementById('board-container');
  const laser=document.createElement('div');
  laser.style.cssText=`position:absolute;left:${kc*sqSize}px;top:${kr*sqSize}px;width:${sqSize}px;height:${sqSize}px;background:radial-gradient(circle,#00ffff,#0088ff,transparent);z-index:50;pointer-events:none;`;
  laser.style.animation='bomb-flash-anim 0.3s ease-out forwards';
  container.appendChild(laser); setTimeout(()=>laser.remove(),400);
  board[tr][tc]=board[kr][kc]; board[kr][kc]=null;
  rebuildPieces(); renderSquares();
  cheatMsg('⚡ LASER TELEPORT! KING BEAMED TO SAFETY','#4488ff');
}

// BIDEN: Ice Cream Drop — block enemy promotion path
function bidenIceCreamDrop(){
  const enemyColor=opponent(turn);
  let bestPawn=null, bestDist=99;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=board[r][c];
    if(!p||color(p)!==enemyColor||type(p)!=='P') continue;
    const dist=(enemyColor==='w')?(7-r):r;
    if(dist<bestDist){ bestDist=dist; bestPawn=[r,c]; }
  }
  if(bestPawn){
    const [pr,pc]=bestPawn;
    const blockRow=(enemyColor==='w')?(pr-1):(pr+1);
    if(inBounds(blockRow,pc)&&!board[blockRow][pc]){
      board[blockRow][pc]='ICE';
      rebuildPieces(); renderSquares();
      cheatMsg('🍦 ICE CREAM DROP! PROMOTION PATH BLOCKED','#ff88cc');
    } else {
      board[pr][pc]=null; rebuildPieces(); renderSquares();
      cheatMsg('🍦 ICE CREAM DROP! PAWN VAPORIZED','#ff88cc');
    }
  } else {
    board[3][3]=null; board[3][4]=null; rebuildPieces(); renderSquares();
    cheatMsg('🍦 ICE CREAM DROPPED ON CENTER','#ff88cc');
  }
}

// BIDEN: Clear Reset — vaporize center 4
function bidenClearReset(){
  [[3,3],[3,4],[4,3],[4,4]].forEach(([r,c])=>{ board[r][c]=null; });
  rebuildPieces(); renderSquares();
  cheatMsg('💥 CLEAR RESET! CENTER VAPORIZED','#4488ff');
}

// BIDEN: Drone Strike — destroy highest-value enemy piece
function bidenDroneStrike(){
  const enemyColor=opponent(turn);
  const vals={Q:9,R:5,B:3,N:3,P:1};
  let best=null,bestVal=-1;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=board[r][c];
    if(!p||color(p)!==enemyColor||type(p)==='K') continue;
    const v=vals[type(p)]||0; if(v>bestVal){ bestVal=v; best=[r,c]; }
  }
  if(!best){ cheatMsg('🎯 NO DRONE TARGET FOUND','#ffaa00'); return; }
  const [tr,tc]=best;
  const container=document.getElementById('board-container');
  const flash=document.createElement('div'); flash.className='bomb-flash';
  const fz=sqSize*1.2;
  flash.style.cssText=`width:${fz}px;height:${fz}px;left:${tc*sqSize-fz/2+sqSize/2}px;top:${tr*sqSize-fz/2+sqSize/2}px;`;
  container.appendChild(flash); setTimeout(()=>flash.remove(),500);
  board[tr][tc]=null; rebuildPieces(); renderSquares();
  cheatMsg('🎯 DRONE STRIKE! HIGHEST VALUE ENEMY PIECE ELIMINATED','#4488ff');
}

// OBAMA: Drone Strike — precision elimination
const OBAMA_DRONE_MSGS=['🎯 OBAMA DRONE STRIKE — COLLATERAL DAMAGE MINIMIZED','🎯 PRECISION STRIKE AUTHORIZED — PEACE PRIZE INTACT','🎯 OBAMA: "I\'M REALLY GOOD AT KILLING." PIECE ELIMINATED.','🎯 DRONE AWAY. HAVE A NICE DAY.','🎯 TARGETED ELIMINATION — HOPE & CHANGE DELIVERED','🎯 OBAMA DRONE PROGRAM: OPERATIONAL'];
function obamadroneStrike(){
  const enemyColor=opponent(turn);
  const vals={Q:9,R:5,B:3,N:3,P:1};
  let targets=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=board[r][c];
    if(!p||color(p)!==enemyColor||type(p)==='K') continue;
    targets.push({r,c,v:vals[type(p)]||0});
  }
  targets.sort((a,b)=>b.v-a.v);
  const hits=targets.slice(0,(targets.length>1&&Math.random()<0.35)?2:1);
  if(!hits.length){cheatMsg('🎯 OBAMA: NO VALID TARGETS. STAND DOWN.','#4488ff');return;}
  const container=document.getElementById('board-container');
  hits.forEach(({r,c},i)=>{
    setTimeout(()=>{
      const fz=sqSize*1.4;
      const flash=document.createElement('div');flash.className='bomb-flash';
      flash.style.cssText=`width:${fz}px;height:${fz}px;left:${c*sqSize-fz/2+sqSize/2}px;top:${r*sqSize-fz/2+sqSize/2}px;`;
      container.appendChild(flash);setTimeout(()=>flash.remove(),500);
      board[r][c]=null;rebuildPieces();renderSquares();
    },i*280);
  });
  const msg=OBAMA_DRONE_MSGS[Math.floor(Math.random()*OBAMA_DRONE_MSGS.length)];
  const extra=hits.length>1?' (DOUBLE TAP)':'';
  setTimeout(()=>cheatMsg(msg+extra,'#4488ff'),hits.length>1?320:0);
}

// BIDEN: Lag Blunder
function bidenLagBlunder(afterFn){
  bidenLagActive=true;
  const overlay=document.getElementById('lag-bar-overlay');
  const fill=document.getElementById('lag-bar-fill');
  if(overlay) overlay.classList.add('active');
  if(fill) fill.style.width='0%';
  cheatMsg('⏳ CONNECTION LAG... STAND BY','#4488ff');
  let pct=0;
  const interval=setInterval(()=>{
    pct+=Math.random()*3+0.8;
    if(fill) fill.style.width=Math.min(pct,100)+'%';
    if(pct>=100){
      clearInterval(interval);
      setTimeout(()=>{
        if(overlay) overlay.classList.remove('active');
        bidenLagActive=false;
        const moves=allLegalMoves(board,turn,enPassant,castleRights);
        if(moves.length){
          const blunder=moves[Math.floor(Math.random()*moves.length)];
          animateAndCommit(blunder[0],blunder[1],blunder[2],blunder[3],blunder[4],true,afterFn);
        } else { if(afterFn) afterFn(); }
      },400);
    }
  },80);
}

// ELON: Falcon Rocket countdown
let falconTarget=null;
let elonPopupActive=false;
const ELON_X_POSTS=[
  '𝕏: Autonomous Pawns next year. Level 5.',
  '𝕏: Concerning. King slow. Is chess woke? 🤔',
  '𝕏: Bought dark squares. 120Hz refresh.',
  '𝕏: Replace Knights with Cybertrucks?',
  '𝕏: Chess board needs more free speech.',
  '𝕏: Rooks are government workers. Inefficient.',
  '𝕏: Filing to acquire chess.com. Obvious move.',
  '𝕏: Pawns should be autonomous. FSD.',
];

function elonFalconRocket(){
  const enemyColor=opponent(turn);
  const vals={Q:9,R:5,B:3,N:3,P:1};
  let best=null,bestVal=-1;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=board[r][c];
    if(!p||color(p)!==enemyColor||type(p)==='K') continue;
    const v=vals[type(p)]||0; if(v>bestVal){ bestVal=v; best=[r,c]; }
  }
  if(!best) best=[3+Math.floor(Math.random()*2),3+Math.floor(Math.random()*2)];
  falconTarget={r:best[0],c:best[1],turnsLeft:2};
  renderSquares();
  const label=document.getElementById('falcon-countdown-label');
  if(label){ label.style.display='block'; label.style.left=(best[1]*sqSize+2)+'px'; label.style.top=(best[0]*sqSize+2)+'px'; label.textContent='🚀 T-2'; }
  cheatMsg('🚀 FALCON 9 TARGETED — IMPACT IN 2 TURNS','#1d9bf0');
}

function elonTickFalcon(){
  if(!falconTarget) return;
  falconTarget.turnsLeft--;
  const label=document.getElementById('falcon-countdown-label');
  if(falconTarget.turnsLeft>0){
    if(label) label.textContent='🚀 T-'+falconTarget.turnsLeft;
    renderSquares(); return;
  }
  const {r,c}=falconTarget; falconTarget=null;
  if(label) label.style.display='none';
  for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
    const nr=r+dr,nc=c+dc;
    if(!inBounds(nr,nc)) continue;
    const p=board[nr][nc]; if(p&&type(p)!=='K') board[nr][nc]=null;
  }
  const container=document.getElementById('board-container');
  const flash=document.createElement('div'); flash.className='bomb-flash';
  const fz=sqSize*2.2;
  flash.style.cssText=`width:${fz}px;height:${fz}px;left:${c*sqSize-fz/2+sqSize/2}px;top:${r*sqSize-fz/2+sqSize/2}px;`;
  container.appendChild(flash); setTimeout(()=>flash.remove(),700);
  rebuildPieces(); renderSquares();
  cheatMsg('💥 FALCON 9 IMPACT! BLAST ZONE CLEARED','#1d9bf0');
}

function elonXPopup(afterFn){
  if(elonPopupActive){ if(afterFn) afterFn(); return; }
  const post=ELON_X_POSTS[Math.floor(Math.random()*ELON_X_POSTS.length)];
  const pmsg=document.getElementById('elon-popup-msg');
  if(pmsg) pmsg.textContent=post;
  const pov=document.getElementById('elon-popup-overlay');
  if(pov) pov.classList.add('active');
  elonPopupActive=true;
  window._elonAfterFn=afterFn;
  // Penalize Elon's ELO (increase random factor) on each popup
  const ai=botIdx>=0?botIdx:whiteBotIdx;
  const bot=BOTS[ai];
  if(bot&&bot.isElon){ bot.elonEloPenalty=(bot.elonEloPenalty||0)+0.04; bot.random=Math.min(0.85,(0.16+(bot.elonEloPenalty))); }
  cheatMsg('𝕏 INCOMING POST — DISMISS TO CONTINUE','#1d9bf0');
}
function elonDismissPopup(e){
  if(e&&e.target){
    const inBox=e.target.closest&&e.target.closest('#elon-popup-box');
    if(inBox&&e.target.id!=='elon-popup-dismiss') return;
  }
  const pov=document.getElementById('elon-popup-overlay');
  if(pov) pov.classList.remove('active');
  elonPopupActive=false;
  const fn=window._elonAfterFn; window._elonAfterFn=null;
  if(fn) fn();
  setTimeout(()=>{ if(!gameOver&&shouldBotMove()&&!elonPopupActive&&!bidenSleeping&&!bidenLagActive) doBotMove(); },150);
}

// ── PLAYGROUND TRIGGERS ──
function togglePlayground(){
  const sb=document.getElementById('playground-sidebar');
  if(sb) sb.classList.toggle('open');
}
function pg_trumpBomber(){ trumpBomberStrike(turn==='w'?'b':'w',null); }
function pg_trumpWall(){ trumpWallBlock(null); }
function pg_bidenSleep(){ bidenSleep(null); }
function pg_bidenLaserTeleport(){ bidenLaserTeleport(); }
function pg_bidenIceCream(){ bidenIceCreamDrop(); }
function pg_bidenClearReset(){ bidenClearReset(); }
function pg_bidenDroneStrike(){ bidenDroneStrike(); }
function pg_bidenLag(){ bidenLagBlunder(()=>{ if(!gameOver) setTimeout(()=>{ if(!bidenSleeping&&!elonPopupActive) doBotMove(); },300); }); }
function pg_elonFalcon(){ elonFalconRocket(); }
function pg_elonXPopup(){ elonXPopup(()=>{ if(!gameOver&&shouldBotMove()) setTimeout(doBotMove,150); }); }

// ── Patch renderSquares to show falcon & ice cream overlays ──
const _origRenderSquares2=renderSquares;
renderSquares=function(){
  _origRenderSquares2();
  const boardEl=document.getElementById('board');
  if(!boardEl) return;
  if(falconTarget){
    const {r,c}=falconTarget;
    if(inBounds(r,c)){ const sq=boardEl.children[r*8+c]; if(sq) sq.classList.add('falcon-target'); }
  }
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    if(board[r][c]==='ICE'){
      const sq=boardEl.children[r*8+c]; if(sq) sq.classList.add('icecream-block');
    }
  }
};

// ── Patch legalMoves to block ICE squares ──
const _origLM=legalMoves;
legalMoves=function(b,r,c,ep,cr){
  return _origLM(b,r,c,ep,cr).filter(([nr,nc])=>b[nr][nc]!=='ICE');
};

// ── Patch handleClick to tick falcon on human moves ──
const _origHC=handleClick;
handleClick=function(r,c){
  // In Chesskers mode, checkers turns go to the CvC handler
  if(cvcMode && cvcCheckersTurn){ cvcHandleClick(r,c); return; }
  _origHC(r,c);
  if(falconTarget) setTimeout(elonTickFalcon,200);
};

// ── Patch doBotMove for political bot interceptors ──
const _origDBM=doBotMove;
doBotMove=function(){
  if(gameOver) return;
  if(bidenSleeping) return;
  if(bidenLagActive) return;
  if(elonPopupActive) return;
  const ai=turn==='b'?botIdx:whiteBotIdx; if(ai<0) return;
  const bot=BOTS[ai]; if(!bot) return;
  // Biden Lag: 8% chance per turn to lag-blunder instead
  const _brandonSleepChance = (bot.bidenMode==='brandon') ? 0.22 : 0.08;
  if(bot.isBiden&&!bidenLagActive&&!bidenSleeping&&Math.random()<_brandonSleepChance){
    if(bot.bidenMode==='brandon') bidenSleep(()=>{ if(!gameOver) setTimeout(()=>{ if(!bidenSleeping&&!elonPopupActive) _origDBM(); },300); });
    else bidenLagBlunder(()=>{ if(!gameOver) setTimeout(()=>{ if(!bidenSleeping&&!elonPopupActive) _origDBM(); },300); });
    return;
  }
  _origDBM();
  // Post-move political specials (fire AFTER the move lands)
  // Capture bot color NOW before _origDBM flips turn
  const _botColor = turn; // turn is still the bot's color when this closure runs (captured before setTimeout)
  const _humanColor = opponent(turn);
  setTimeout(()=>{
    if(gameOver) return;
    const bypassChance=0.25;
    if(Math.random()<bypassChance) return;
    if(bot.isTrump){
      const br=getTrumpBomberRate(bot), wr=getTrumpWallRate(bot);
      const roll=Math.random();
      if(roll<br) trumpBomberStrike(_humanColor,null);
      else if(roll<br+wr) trumpWallBlock(null);
    }
    if(bot.isBiden&&!bidenSleeping&&!bidenLagActive){
      if(bot.bidenMode==='obama'){
        if(Math.random()<0.40) obamadroneStrike();
      } else {
        if(isInCheck(board,turn)) bidenLaserTeleport();
        else if(Math.random()<0.10) bidenDroneStrike();
      }
    }
    if(bot.isElon){
      if(!falconTarget&&Math.random()<0.15) elonFalconRocket();
      if(!elonPopupActive&&Math.random()<0.20) elonXPopup(()=>{ if(!gameOver&&shouldBotMove()) setTimeout(doBotMove,150); });
    }
    if(falconTarget) setTimeout(elonTickFalcon,100);
  },botMoveDelay+200);
};



function buildBotButtons(){
  const el=document.getElementById('bot-buttons'); el.innerHTML='';
  const side=_botMenuSide;
  const currentIdx = side==='w' ? whiteBotIdx : botIdx;

  // Human option
  const off=document.createElement('button');
  off.textContent='👤 Human';
  off.className=currentIdx===-1?'active-bot':'';
  off.onclick=()=>{
    if(side==='w'){ whiteBotIdx=-1; document.getElementById('bot-btn-w').textContent='👤 Human ▾'; }
    else { botIdx=-1; document.getElementById('bot-btn-b').textContent='Human ▾'; }
    buildBotButtons(); document.getElementById('bot-menu').style.display='none';
  };
  el.appendChild(off);

  BOTS.forEach((bot,i)=>{
    if(bot.secret) return; // secret bots handled separately below
    const b=document.createElement('button'); b.textContent=bot.name;
    b.className=currentIdx===i?'active-bot':'';
    b.onclick=()=>{
      if(side==='w'){
        whiteBotIdx=i;
        document.getElementById('bot-btn-w').textContent=bot.name+' ▾';
        const d=BOT_CHAT_LIST[i];
        if(d&&d.onStart&&d.onStart.length){
          const m=d.onStart[Math.floor(Math.random()*d.onStart.length)];
          const _isD=BOTS[i]&&BOTS[i].name.includes('The Don');
          const _bn=BOTS[i]?BOTS[i].name.replace(/^[^ ]+ /,'').replace(/\s*\(.*\)$/,''):'';
          _showSpeechRow('w',d.avatar,_bn,m,_isD);
        }
      } else {
        botIdx=i;
        document.getElementById('bot-btn-b').textContent=bot.name+' ▾';
        const d=BOT_CHAT_LIST[i];
        if(d&&d.onStart&&d.onStart.length){
          const m=d.onStart[Math.floor(Math.random()*d.onStart.length)];
          const _isD=BOTS[i]&&BOTS[i].name.includes('The Don');
          const _bn=BOTS[i]?BOTS[i].name.replace(/^[^ ]+ /,'').replace(/\s*\(.*\)$/,''):'';
          _showSpeechRow('b',d.avatar,_bn,m,_isD);
        }
      }
      resetGame();
      buildBotButtons();
      document.getElementById('bot-menu').style.display='none';
    };
    el.appendChild(b);
  });

  // ── Secret Bots Section ──
  const secretBots = BOTS.map((bot,i)=>({bot,i})).filter(({bot})=>bot.secret);
  const anyUnlocked = secretBots.some(({bot})=>bot.unlocked);

  // Divider
  const divider = document.createElement('div');
  divider.style.cssText='padding:4px 10px 2px;font-family:"EB Garamond",Georgia,serif;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#888;background:#111;border-top:2px solid rgba(245,200,0,0.25);border-bottom:1px solid rgba(245,200,0,0.1);';
  divider.textContent = anyUnlocked ? '🔓 Secret Bots' : '🔒 Secret Bots — type code below';
  el.appendChild(divider);

  secretBots.forEach(({bot,i})=>{
    const b = document.createElement('button');
    if(bot.unlocked){
      b.textContent = bot.name;
      b.className = currentIdx===i ? 'active-bot' : '';
      b.style.cssText='display:block;width:100%;padding:6px 14px;font-size:13px;text-align:left;background:'+(currentIdx===i?'var(--blue-dark)':'var(--cream)')+';border:none;border-bottom:2px solid #000;border-radius:0;color:'+(currentIdx===i?'var(--yellow)':'var(--black)')+';box-shadow:none;letter-spacing:0.02em;font-family:"EB Garamond",Georgia,serif;font-weight:600;text-transform:none;cursor:pointer;';
      b.onmouseover=()=>{ if(currentIdx!==i){b.style.background='var(--yellow)';} };
      b.onmouseout=()=>{ b.style.background=currentIdx===i?'var(--blue-dark)':'var(--cream)'; };
      b.onclick=()=>{
        if(side==='w'){
          whiteBotIdx=i;
          document.getElementById('bot-btn-w').textContent=bot.name+' ▾';
          const d=BOT_CHAT_LIST[i];
          if(d&&d.onStart&&d.onStart.length){
          const m=d.onStart[Math.floor(Math.random()*d.onStart.length)];
          const _isD=BOTS[i]&&BOTS[i].name.includes('The Don');
          const _bn=BOTS[i]?BOTS[i].name.replace(/^[^ ]+ /,'').replace(/\s*\(.*\)$/,''):'';
          _showSpeechRow('w',d.avatar,_bn,m,_isD);
          }
        } else {
          botIdx=i;
          document.getElementById('bot-btn-b').textContent=bot.name+' ▾';
          const d=BOT_CHAT_LIST[i];
          if(d&&d.onStart&&d.onStart.length){
          const m=d.onStart[Math.floor(Math.random()*d.onStart.length)];
          const _isD=BOTS[i]&&BOTS[i].name.includes('The Don');
          const _bn=BOTS[i]?BOTS[i].name.replace(/^[^ ]+ /,'').replace(/\s*\(.*\)$/,''):'';
          _showSpeechRow('b',d.avatar,_bn,m,_isD);
          }
        }
        resetGame();
        buildBotButtons();
        document.getElementById('bot-menu').style.display='none';
      };
    } else {
      b.textContent = '🔒 ???';
      b.style.cssText='display:block;width:100%;padding:6px 14px;font-size:12px;text-align:left;background:#111;border:none;border-bottom:1px solid #222;border-radius:0;color:#555;box-shadow:none;letter-spacing:0.05em;font-family:"Courier Prime",Courier,monospace;cursor:default;font-style:italic;';
    }
    el.appendChild(b);
  });

  // Auto-apply USA flag theme when a US bundle bot is active
  const usFlagIdx = THEMES.findIndex(t=>t.usflag);
  if(isUSBundleActive()){
    if(themeIdx!==usFlagIdx){ themeIdx=usFlagIdx; buildSwatches(); savePrefs(); }
  } else {
    if(themeIdx===usFlagIdx){ themeIdx=0; buildSwatches(); savePrefs(); }
  }
}

function updateEvalBar(score){
  // NEW5: Update eval bar display
  const bar=document.getElementById('eval-bar-fill');
  const label=document.getElementById('eval-bar-label');
  if(!bar||!label) return;
  // score>0 = white advantage, score<0 = black advantage
  const pct=Math.max(5,Math.min(95,50+score/60));
  bar.style.width=pct+'%';
  const absS=Math.abs(score/100).toFixed(1);
  if(score>30) label.textContent='W +'+absS;
  else if(score<-30) label.textContent='B +'+absS;
  else label.textContent='='+absS;
}

function showTeacherSummary(){
  if(!teacherLog.length) return;
  const wMoves=teacherLog.filter(m=>m.color==='w');
  const bMoves=teacherLog.filter(m=>m.color==='b');
  const count=(arr,q)=>arr.filter(m=>m.eval===q).length;
  const lines=[];
  const fmt=(col,arr)=>{
    const g=count(arr,'good'),o=count(arr,'ok'),b=count(arr,'bad');
    return col+': ✅'+g+' good, 🔶'+o+' ok, ❌'+b+' bad';
  };
  if(wMoves.length) lines.push(fmt('White',wMoves));
  if(bMoves.length) lines.push(fmt('Black',bMoves));
  const panel=document.getElementById('teacher-summary-panel');
  if(panel){
    panel.innerHTML='<b>📊 Move Analysis</b><br>'+lines.join('<br>');
    panel.style.display='block';
  } else {
    // Create floating summary
    const el=document.createElement('div');
    el.id='teacher-summary-panel';
    el.style.cssText='position:fixed;bottom:70px;left:50%;transform:translateX(-50%);z-index:1200;background:#0a0a0a;border:3px solid #f5c800;box-shadow:4px 4px 0 #000;padding:12px 20px;font-family:"EB Garamond",Georgia,serif;font-size:14px;color:#f5f0d8;text-align:center;min-width:260px;';
    el.innerHTML='<b style="color:#f5c800">📊 Move Analysis</b><br>'+lines.join('<br>')+'<br><button onclick="this.parentElement.remove()" style="margin-top:8px;font-size:12px;padding:3px 12px;background:#f5c800;color:#000;border:2px solid #000;cursor:pointer;font-weight:700;">Dismiss</button>';
    document.body.appendChild(el);
  }
}

function checkGameOver(){
  // In Chesskers mode, win conditions are handled by cvcCheckWinner, not chess stalemate/checkmate
  if(cvcMode) return;
  const moves=allLegalMoves(board,turn,enPassant,castleRights);
  if(!moves.length){
    gameOver=true;
    const inCheck=isInCheck(board,turn);
    if(inCheck){
      const winner=turn==='w'?'Black':'White';
      document.getElementById('msg').textContent=winner+' wins by checkmate';
      document.getElementById('status').textContent='';
      if(botIdx>=0&&turn==='w'){
        showOverlay('checkmate','CHECKMATE','You have been defeated');
        setTimeout(()=>showBotChat('onWin', botIdx),600);
        if(whiteBotIdx>=0) setTimeout(()=>showBotChat('onLose', whiteBotIdx),1200);
      } else if(botIdx>=0&&turn==='b'){
        showOverlay('win','YOU WIN','Congratulations!');
        setTimeout(()=>showBotChat('onLose', botIdx),600);
        if(whiteBotIdx>=0) setTimeout(()=>showBotChat('onWin', whiteBotIdx),1200);
      } else {
        showOverlay('checkmate',winner+' WINS',winner+' wins by checkmate');
      }
    } else {
      document.getElementById('msg').textContent='Stalemate · Draw';
      document.getElementById('status').textContent='';
      showOverlay('checkmate','STALEMATE','The game is a draw');
    }
    if(teacherEnabled) setTimeout(showTeacherSummary, 800);
  }
}

let _overlayDismissTimer=null;
function showOverlay(type, word, sub){
  const ov=document.getElementById('game-over-overlay');
  ov.className='show '+type;
  document.getElementById('game-over-word').textContent=word;
  document.getElementById('game-over-sub').textContent=sub;
  ov.style.animation='none';
  ov.offsetHeight;
  ov.style.animation='';
  if(_overlayDismissTimer) clearTimeout(_overlayDismissTimer);
  _overlayDismissTimer=setTimeout(()=>{ ov.className=''; },10000);
}

function closeOverlayAndReset(){
  document.getElementById('game-over-overlay').className='';
  resetGame();
}

function handleClick(r,c){
  if(gameOver)return;
  if(cvcMode&&cvcCheckersTurn){ cvcHandleClick(r,c); return; }
  // In cvcMode turn='w' means chess (human unless whiteBotIdx set). Don't block on botIdx alone.
  if(!cvcMode && turn==='b'&&botIdx>=0) return;
  if(turn==='w'&&whiteBotIdx>=0) return; // white is a bot
  const p=board[r][c];
  if(selected){
    const[sr,sc]=selected;
    const move=highlightMoves&&highlightMoves.find(([nr,nc])=>nr===r&&nc===c);
    if(move){
      const[nr,nc,promo]=move;
      if(cvcMode){
        animateAndCommit(sr,sc,nr,nc,promo,false,null);
      } else {
        animateAndCommit(sr,sc,nr,nc,promo,false,()=>{if(!gameOver)doBotMove();});
      }
      return;
    }
    selected=null;highlightMoves=[];blockedMoves=[];
  }
  if(p&&color(p)===turn){
    selected=[r,c];
    highlightMoves=legalMoves(board,r,c,enPassant,castleRights);
    blockedMoves=[];
  }
  renderSquares();
}

function resetGame(){
  // In Chesskers mode, New Game should restart Chesskers, not normal chess
  if(cvcMode){ resetCvc(); return; }
  cvcCheckersTurn=false;
  board=initBoard();turn='w';selected=null;highlightMoves=[];blockedMoves=[];history=[];
  castleRights={w:{k:true,q:true},b:{k:true,q:true}};enPassant=null;gameOver=false;
  moveLog=[];
  teacherLog=[];
  const tp=document.getElementById('teacher-summary-panel');if(tp)tp.remove();
  steveModeActive=false;
  drunkModeActive=false;
  document.getElementById('board-container').style.transform='';
  document.getElementById('msg').textContent='';
  // Build the wall if The Don is active
  if(isDonActive()){
    setTimeout(()=>showBotChat('onWall'),800);
  }
  renderMoveHistory();
  _chatLogCount=0;
  const _cl=document.getElementById('chat-log-list');if(_cl)_cl.innerHTML='';
  const _clf=document.getElementById('chat-log-footer');if(_clf)_clf.textContent='—';
  resize();
  // Trigger bot if white is a bot
  if(whiteBotIdx>=0) setTimeout(doBotMove, 400);
}

function undoMove(){
  if(!history.length)return;
  const prev=history.pop();
  board=prev.board;turn=prev.turn;castleRights=prev.castleRights;enPassant=prev.enPassant;
  moveLog=prev.moveLog||[];
  gameOver=false;selected=null;highlightMoves=[];blockedMoves=[];
  document.getElementById('msg').textContent='';
  renderMoveHistory();
  rebuildPieces();renderSquares();
}

function resize(){
  // Subtract fixed widths for history panel (160px) + chat panel (150px) + gaps + board rank labels
  const maxSize=Math.min(window.innerWidth-380,window.innerHeight-160);
  sqSize=Math.max(40,Math.floor(maxSize/8));
  const boardSize=sqSize*8;
  const boardEl=document.getElementById('board');
  boardEl.style.width=boardSize+'px';
  boardEl.style.height=boardSize+'px';
  const layer=document.getElementById('piece-layer');
  layer.style.width=boardSize+'px';
  layer.style.height=boardSize+'px';
  const ov=document.getElementById('s-overlay');
  ov.style.left=(sqSize*3)+'px'; ov.style.top=(sqSize*3)+'px';
  ov.style.width=(sqSize*2)+'px'; ov.style.height=(sqSize*2)+'px';
  document.getElementById('s-letter').style.fontSize=Math.floor(sqSize*1.7)+'px';
  document.getElementById('s-letter').style.color=sColor;
  syncHistoryPanelHeight();
  rebuildPieces();
  renderSquares();
}

window.addEventListener('resize',resize);
loadPrefs();
// Don't init game until mode is chosen — just prep prefs
buildSwatches();
buildBotButtons();
buildSSwatches();
// Hide app until mode selected
document.getElementById('app').style.display='none';

function startMode(mode){
  const ms = document.getElementById('mode-select');
  if(ms) ms.style.display='none';

  if(mode==='rdb'){
    document.getElementById('rdb-app').classList.add('open');
    rdbInit();
    return;
  }

  if(mode==='rdb'){
    document.getElementById('rdb-screen').classList.add('open');
    rdbInit();
    return;
  }

  if(mode==='4p'){
    document.getElementById('app').style.display='flex';
    toggle4P();
    return;
  }

  document.getElementById('app').style.display='flex';

  if(mode==='chesskers'){
    whiteBotIdx=-1; botIdx=-1;
    cvcMode=true;
    ckSetupUI();
    resetCvc();
    buildSwatches(); buildBotButtons(); buildSSwatches();
    return;
  }

  if(mode==='sandbox'){
    document.getElementById('app').style.display='flex';
    sandboxMode=true;
    document.getElementById('edit-board-btn').style.display='';
    showSandboxMapPicker();
    return;
  }

  // 2P mode
  sandboxMode=false;
  document.getElementById('edit-board-btn').style.display='none';
  cvcMode=false; ckRestoreUI();
  resetGame();
  buildSwatches(); buildBotButtons(); buildSSwatches();
}

