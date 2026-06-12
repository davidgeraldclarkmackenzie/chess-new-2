// ── Cheat Code Engine ──
let cheatBuffer='';
window.addEventListener('keydown', e=>{
  // Don't capture cheats when typing in the unlock input
  if(document.activeElement && document.activeElement.id==='unlock-input') return;
  cheatBuffer+=e.key;
  if(cheatBuffer.length>10) cheatBuffer=cheatBuffer.slice(-10);
  checkCheats();
});

let cheatBannerTimeout=null;
function cheatMsg(text, col='#f5c800'){
  const banner=document.getElementById('cheat-banner');
  banner.textContent=text;
  banner.style.color=col;
  banner.style.display='block';
  banner.style.animation='none';
  banner.offsetHeight;
  banner.style.animation='banner-drop 0.25s cubic-bezier(0.17,0.89,0.32,1.28) both';
  if(cheatBannerTimeout)clearTimeout(cheatBannerTimeout);
  cheatBannerTimeout=setTimeout(()=>{banner.style.display='none';},3000);
}

function donTankRetaliation(){
  if(!isDonActive()||gameOver)return;

  // Show The Don's reaction
  const _donSide2=(botIdx>=0&&BOTS[botIdx]&&BOTS[botIdx].isTrump)?'b':(whiteBotIdx>=0&&BOTS[whiteBotIdx]&&BOTS[whiteBotIdx].isTrump)?'w':'b';
  const taunts=["you think CHEATS work against ME? WRONG.","TANK 'EM. we have the best tanks.","nobody cheats The Don and gets away with it.","FAKE CHEATS. my tank is real.","that's an ACT OF WAR."];
  _showSpeechRow(_donSide2,'🍊','The Don',taunts[Math.floor(Math.random()*taunts.length)],true);

  // Build the tank SVG and position it in the middle of the board
  const tank=document.getElementById('don-tank');
  const boardSize=sqSize*8;
  const tankH=Math.round(sqSize*0.9);
  const tankW=Math.round(tankH*2.2);
  tank.style.top=Math.round(boardSize/2 - tankH/2)+'px';
  tank.style.left='0px';
  tank.style.width=tankW+'px';
  tank.style.height=tankH+'px';
  tank.innerHTML=`<svg viewBox="0 0 110 50" xmlns="http://www.w3.org/2000/svg" width="${tankW}" height="${tankH}">
    <!-- tracks -->
    <rect x="5" y="33" width="100" height="14" rx="7" fill="#2a2a1a" stroke="#111" stroke-width="1.5"/>
    <circle cx="16" cy="40" r="6" fill="#1a1a0a" stroke="#333" stroke-width="1"/>
    <circle cx="35" cy="40" r="6" fill="#1a1a0a" stroke="#333" stroke-width="1"/>
    <circle cx="55" cy="40" r="6" fill="#1a1a0a" stroke="#333" stroke-width="1"/>
    <circle cx="75" cy="40" r="6" fill="#1a1a0a" stroke="#333" stroke-width="1"/>
    <circle cx="94" cy="40" r="6" fill="#1a1a0a" stroke="#333" stroke-width="1"/>
    <!-- body -->
    <rect x="10" y="22" width="90" height="16" rx="3" fill="#5a6a2a" stroke="#333" stroke-width="1.5"/>
    <!-- turret -->
    <ellipse cx="52" cy="22" rx="22" ry="12" fill="#4a5a1a" stroke="#333" stroke-width="1.5"/>
    <!-- barrel pointing left -->
    <rect x="2" y="19" width="34" height="6" rx="3" fill="#3a4a10" stroke="#222" stroke-width="1.2"/>
    <!-- hatch -->
    <ellipse cx="58" cy="16" rx="8" ry="5" fill="#3a4a10" stroke="#444" stroke-width="1"/>
    <!-- orange star for The Don -->
    <text x="70" y="32" font-size="10" fill="#ff6a00" font-family="serif">★</text>
  </svg>`;

  tank.classList.remove('rolling');
  void tank.offsetWidth;
  tank.classList.add('rolling');

  // Collect all white non-king pieces to blast
  const targets=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const p=board[r][c];
    if(p&&color(p)==='w'&&type(p)!=='K') targets.push([r,c]);
  }

  // Fire shells at each piece with staggered timing
  targets.forEach(([r,c],idx)=>{
    setTimeout(()=>{
      if(board[r][c]&&color(board[r][c])==='w'&&type(board[r][c])!=='K'){
        // Explosion at square
        const container=document.getElementById('board-container');
        const exp=document.createElement('div');
        exp.className='tank-explosion';
        const expSize=sqSize*1.2;
        exp.style.width=expSize+'px';
        exp.style.height=expSize+'px';
        exp.style.left=(c*sqSize - expSize/2 + sqSize/2)+'px';
        exp.style.top=(r*sqSize - expSize/2 + sqSize/2)+'px';
        container.appendChild(exp);
        setTimeout(()=>exp.remove(),500);
        board[r][c]=null;
        rebuildPieces();
        renderSquares();
      }
    }, 800 + idx*120);
  });

  const totalTime=800+targets.length*120+400;
  setTimeout(()=>{
    cheatMsg('🪖 THE DON SENT A TANK — ALL YOUR PIECES DESTROYED','#ff6a00');
    tank.classList.remove('rolling');
    tank.innerHTML='';
  }, totalTime);
}

function checkCheats(){
  // If 4P overlay is open, route to 4P cheats
  const fp4open=document.getElementById('fourp-overlay')&&document.getElementById('fourp-overlay').style.display==='flex';
  if(fp4open){ checkFourPCheats(); return; }
  // Chesskers-specific cheats
  if(cvcMode){
    if(cheatBuffer.endsWith('bypass')){cheatBuffer='';cvcBypassForced=!cvcBypassForced;cheatMsg('⚠ Forced-jump bypass: '+(cvcBypassForced?'ON':'OFF'));return;}
    if(cheatBuffer.endsWith('freeze')){cheatBuffer='';cvcBotFrozen=!cvcBotFrozen;cheatMsg('🤖 Bot '+(cvcBotFrozen?'FROZEN':'THAWED'));return;}
    if(cheatBuffer.endsWith('allking')){cheatBuffer='';for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]==='bC')board[r][c]='bCK';rebuildPieces();renderSquares();cheatMsg('👑 ALL CHECKERS PROMOTED TO KINGS');return;}
    if(cheatBuffer.endsWith('boom')){cheatBuffer='';for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]==='bC'||board[r][c]==='bCK')board[r][c]=null;rebuildPieces();renderSquares();cheatMsg('💥 NUCLEAR: ALL CHECKERS WIPED','#ff4400');return;}
  }
  if(cheatBuffer.endsWith('77777')){cheatBuffer='';activateQueenCheat();if(isDonActive())setTimeout(donTankRetaliation,400);return;}
  if(cheatBuffer.endsWith('88888')){cheatBuffer='';activateGodMode();if(isDonActive())setTimeout(donTankRetaliation,400);return;}
  if(cheatBuffer.endsWith('99999')){cheatBuffer='';activateNuclear();if(isDonActive())setTimeout(donTankRetaliation,800);return;}
  if(cheatBuffer.endsWith('55555')){cheatBuffer='';activateSwapSides();if(isDonActive())setTimeout(donTankRetaliation,400);return;}
  if(cheatBuffer.endsWith('33333')){cheatBuffer='';activateTimeWarp();if(isDonActive())setTimeout(donTankRetaliation,400);return;}
  if(cheatBuffer.endsWith('boom')){cheatBuffer='';activateBoom();if(isDonActive())setTimeout(donTankRetaliation,400);return;}
  if(cheatBuffer.endsWith('steve')){cheatBuffer='';activateSteveMode();return;}
  if(cheatBuffer.endsWith('drunk')){cheatBuffer='';activateDrunkMode();return;}
}

function activateQueenCheat(){
  if(gameOver)return;
  // NEW6: apply across all quadrants - place wQ in all 4 corners of board
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=board[r][c];if(p==='wK'||p==='bK')continue;board[r][c]=null;}
  const[bkr,bkc]=findKing(board,'b');
  for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]==='wK')board[r][c]=null;
  const wkPos=(bkr>3)?[0,0]:[7,0];
  board[wkPos[0]][wkPos[1]]='wK';
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=board[r][c];if(p==='wK'||p==='bK')continue;board[r][c]=null;}
  // Place queens in all 4 quadrant rows around enemy king
  const rows=[Math.max(0,bkr-1),Math.min(7,bkr+1),Math.max(0,bkr-2),Math.min(7,bkr+2)];
  const usedRows=new Set();
  rows.forEach(r=>{
    if(usedRows.has(r))return; usedRows.add(r);
    for(let c=0;c<8;c++){if(!(r===wkPos[0]&&c===wkPos[1])&&!(r===bkr&&c===bkc))board[r][c]='wQ';}
  });
  turn='b';selected=null;highlightMoves=[];blockedMoves=[];
  checkGameOver();rebuildPieces();renderSquares();
  cheatMsg('👑 CHEAT: INSTANT CHECKMATE (ALL QUADRANTS)');
}

function activateGodMode(){
  if(gameOver)return;
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const p=board[r][c];
    if(p&&color(p)==='w'&&type(p)!=='K')board[r][c]=null;
  }
  for(let c=0;c<8;c++){
    if(board[7][c]!=='wK')board[7][c]='wQ';
  }
  rebuildPieces();renderSquares();
  cheatMsg('👸 GOD MODE: 8 QUEENS DEPLOYED');
}

function activateNuclear(){
  if(gameOver)return;

  // ── Launch missile across the board ──
  const container=document.getElementById('board-container');
  const boardSize=sqSize*8;

  // Create missile element
  const missile=document.createElement('div');
  missile.id='nuclear-missile';
  missile.style.cssText=[
    'position:absolute',
    'z-index:999',
    'pointer-events:none',
    'top:'+(Math.round(boardSize*0.38))+'px',
    'left:'+(-110)+'px',
    'width:100px',
    'height:44px',
    'transition:left 1.1s cubic-bezier(0.22,0.61,0.36,1), top 1.1s ease-in'
  ].join(';');
  missile.innerHTML=`<svg viewBox="0 0 100 44" xmlns="http://www.w3.org/2000/svg" width="100" height="44">
    <!-- exhaust flame -->
    <ellipse cx="7" cy="22" rx="9" ry="5" fill="#ff6a00" opacity="0.85"/>
    <ellipse cx="3" cy="22" rx="5" ry="3" fill="#ffdd00" opacity="0.9"/>
    <!-- body -->
    <rect x="12" y="15" width="68" height="14" rx="5" fill="#c8c8c8" stroke="#888" stroke-width="1.2"/>
    <!-- nose cone -->
    <polygon points="80,22 100,17 100,27" fill="#e03020" stroke="#900" stroke-width="1"/>
    <!-- fins -->
    <polygon points="12,29 4,40 20,29" fill="#aaaaaa" stroke="#777" stroke-width="1"/>
    <polygon points="12,15 4,4 20,15" fill="#aaaaaa" stroke="#777" stroke-width="1"/>
    <!-- warhead band -->
    <rect x="74" y="15" width="6" height="14" rx="1" fill="#ff4400" stroke="#c00" stroke-width="0.8"/>
    <!-- ☢ symbol -->
    <text x="34" y="27" font-size="12" text-anchor="middle" fill="#333" font-family="serif" font-weight="bold">☢</text>
    <!-- rivets -->
    <circle cx="25" cy="19" r="1.5" fill="#999"/>
    <circle cx="45" cy="19" r="1.5" fill="#999"/>
    <circle cx="65" cy="19" r="1.5" fill="#999"/>
  </svg>`;
  container.appendChild(missile);

  // Animate: fly across board
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      missile.style.left=(boardSize+20)+'px';
      missile.style.top=(Math.round(boardSize*0.22))+'px';
    });
  });

  // After missile exits: flash + destroy pieces
  setTimeout(()=>{
    missile.remove();
    // Impact flash
    document.getElementById('board').style.filter='brightness(4) sepia(1) hue-rotate(-20deg)';
    // Shockwave ring
    const wave=document.createElement('div');
    wave.style.cssText=[
      'position:absolute','z-index:998','pointer-events:none',
      'border-radius:50%',
      'border:6px solid rgba(255,100,0,0.85)',
      'width:20px','height:20px',
      'top:'+(boardSize/2-10)+'px',
      'left:'+(boardSize/2-10)+'px',
      'transition:width 0.5s ease-out,height 0.5s ease-out,top 0.5s ease-out,left 0.5s ease-out,opacity 0.5s ease-out',
      'opacity:1'
    ].join(';');
    container.appendChild(wave);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const ws=boardSize*1.6;
      wave.style.width=ws+'px';
      wave.style.height=ws+'px';
      wave.style.top=(boardSize/2-ws/2)+'px';
      wave.style.left=(boardSize/2-ws/2)+'px';
      wave.style.opacity='0';
    }));
    setTimeout(()=>wave.remove(), 600);

    setTimeout(()=>{
      document.getElementById('board').style.filter='';
      const enemyCol=opponent(turn);
      for(let r=0;r<8;r++)for(let c=0;c<8;c++){
        const p=board[r][c];
        if(p&&color(p)===enemyCol&&type(p)!=='K')board[r][c]=null;
      }
      checkGameOver();rebuildPieces();renderSquares();
      cheatMsg('☢️ NUCLEAR: ALL ENEMY PIECES VAPORISED (ALL QUADRANTS)','#ff4400');
    },450);
  }, 1200);
}

function activateSwapSides(){
  if(gameOver)return;
  if(cvcMode){
    // In Chesskers: swap which side the bots (or humans) are on
    const tmp=botIdx; botIdx=whiteBotIdx; whiteBotIdx=tmp;
    // Update button labels
    const wBtn=document.getElementById('bot-btn-w');
    const bBtn=document.getElementById('bot-btn-b');
    if(wBtn) wBtn.textContent=(whiteBotIdx>=0?BOTS[whiteBotIdx].name:'👤 Human')+' ▾';
    if(bBtn) bBtn.textContent=(botIdx>=0?BOTS[botIdx].name:'👤 Human')+' ▾';
    cheatMsg('🔄 SIDES SWAPPED — Chess & Checkers players switched');
    // Restart so the right bot fires first
    resetCvc();
    return;
  }
  const newBoard=Array.from({length:8},()=>Array(8).fill(null));
  for(let r=0;r<8;r++)for(let c=0;c<8;c++)newBoard[7-r][7-c]=board[r][c];
  board=newBoard;
  turn=opponent(turn);
  const cr=castleRights;
  castleRights={w:{k:cr.b.q,q:cr.b.k},b:{k:cr.w.q,q:cr.w.k}};
  selected=null;highlightMoves=[];blockedMoves=[];
  rebuildPieces();renderSquares();
  cheatMsg('🔄 SIDES SWAPPED — YOU NOW PLAY AS '+(turn==='w'?'WHITE':'BLACK'));
}

function activateTimeWarp(){
  if(!history.length){cheatMsg('⏪ NO HISTORY TO REWIND','#ffaa00');return;}
  const first=history[0];
  board=first.board.map(row=>[...row]);
  turn=first.turn;
  castleRights=JSON.parse(JSON.stringify(first.castleRights));
  enPassant=first.enPassant;
  moveLog=first.moveLog||[];
  history=[];
  gameOver=false;selected=null;highlightMoves=[];blockedMoves=[];
  document.getElementById('msg').textContent='';
  renderMoveHistory();
  rebuildPieces();renderSquares();
  cheatMsg('⏪ TIME WARP: REWOUND TO MOVE 1');
}

function activateBoom(){
  if(gameOver)return;
  if(!selected){cheatMsg('💥 SELECT A PIECE FIRST, THEN TYPE boom','#ffaa00');return;}
  const[sr,sc]=selected;
  let blasted=0;
  const affectedSquares=[];
  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
    if(dr===0&&dc===0)continue;
    const nr=sr+dr,nc=sc+dc;
    if(!inBounds(nr,nc))continue;
    const p=board[nr][nc];
    if(p&&type(p)!=='K'){
      board[nr][nc]=null;
      blasted++;
      affectedSquares.push([nr,nc]);
    }
  }
  affectedSquares.forEach(([r,c])=>{
    const idx=r*8+c;
    const sqEl=document.getElementById('board').children[idx];
    if(sqEl){sqEl.classList.add('explosion-sq');setTimeout(()=>sqEl.classList.remove('explosion-sq'),500);}
  });
  selected=null;highlightMoves=[];blockedMoves=[];
  checkGameOver();rebuildPieces();renderSquares();
  cheatMsg(`💥 BOOM! ${blasted} PIECE${blasted!==1?'S':''} DESTROYED`,'#ff6600');
}

function activateDrunkMode(){
  drunkModeActive=!drunkModeActive;
  if(drunkModeActive){
    cheatMsg('🍺 DRUNK MODE: OPPONENT STAGGERS — YOUR MOVES UNAFFECTED','#ffaa00');
    document.getElementById('board-container').style.transform='rotate(-1.5deg)';
    document.getElementById('board-container').style.transition='transform 0.3s';
  } else {
    cheatMsg('🍺 DRUNK MODE OFF','#888888');
    document.getElementById('board-container').style.transform='';
  }
}

function activateSteveMode(){
  steveModeActive=!steveModeActive;
  let existingStyle=document.getElementById('steve-mode-style');
  if(steveModeActive){
    if(!existingStyle){
      const s=document.createElement('style');
      s.id='steve-mode-style';
      s.textContent=`
        .piece::after {
          content: 'STEVE';
          position: absolute;
          bottom: 2px;
          left: 0; right: 0;
          text-align: center;
          font-family: 'Courier Prime', Courier, monospace;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #f5c800;
          text-shadow: 0 0 2px #000, 0 0 4px #000;
          pointer-events: none;
          z-index: 30;
        }
      `;
      document.head.appendChild(s);
    }
    cheatMsg('🧔 STEVE MODE ACTIVATED — ALL HAIL THE STEVES');
  } else {
    if(existingStyle)existingStyle.remove();
    cheatMsg('🧔 STEVE MODE DEACTIVATED','#888888');
  }
}