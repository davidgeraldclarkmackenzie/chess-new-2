const BOTS=[
  {elo:-9999,name:'🤡 Timethie (-9999)',depth:1,random:0.00,worst:true},
  {elo:300,name:'🍺 Bob (300)',depth:1,random:0.95},
  {elo:400,name:'💅 Karen (400)',depth:1,random:0.85},
  {elo:500,name:'🥴 Dave (500)',depth:1,random:0.70},
  {elo:600,name:'👒 Linda (600)',depth:1,random:0.55},
  {elo:700,name:'😎 Steve (700)',depth:2,random:0.50},
  {elo:800,name:'🔥 Brenda (800)',depth:2,random:0.38},
  {elo:900,name:'💪 Chad (900)',depth:2,random:0.25},
  {elo:1000,name:'🧠 Stacy (1000)',depth:2,random:0.12},
  {elo:1200,name:'👑 Big Steve (1200)',depth:3,random:0.05},
  {elo:1500,name:'⚡ Stevette (1500)',depth:3,random:0.00},
  {elo:9999,name:'😇 GOD (9999)',depth:4,random:0.00},
  // Secret unlockable bots — all stronger & unpredictable (high depth + surprise random)
  {elo:666,name:'💀 Dark Steve (666)',depth:4,random:0.18,secret:true,code:'DARKSTEVE',unlocked:false},
  {elo:1337,name:'🐉 Dragonlord (1337)',depth:4,random:0.12,secret:true,code:'DRAGONLORD',unlocked:false},
  {elo:420,name:'🎩 Stevenson (420)',depth:3,random:0.28,secret:true,code:'CHILLOUT',unlocked:false},
  {elo:2700,name:'🤖 DeepSteve 9000 (2700)',depth:5,random:0.06,secret:true,code:'DEEPSTEVE',unlocked:false},
  {elo:1200,name:'🍊 The Don (1200)',depth:2,random:0.35,secret:true,code:'LETSGOUSA',unlocked:false,isTrump:true,bomberBase:0.15,bomberPerLoss:0.05,wallBase:0.00,wallPerLoss:0.10,cheatMax:0.75,piecesLost:0},
  // Political bots — unlock with 'LETS GO USA' (spaces required)
  {elo:1200,name:'🫘 Dark Brandon (1200)',depth:3,random:0.18,secret:true,code:'LETSGOUSA',unlocked:false,isBiden:true,bidenMode:'brandon',piecesLost:0},
  {elo:1200,name:'📺 Obama (1200)',depth:3,random:0.20,secret:true,code:'LETSGOUSA',unlocked:false,isBiden:true,bidenMode:'obama',piecesLost:0},
  {elo:1200,name:'🚀 Elon (1200)',depth:3,random:0.16,secret:true,code:'LETSGOUSA',unlocked:false,isElon:true,piecesLost:0,elonEloPenalty:0},
  // The Informant — always visible, drops hints about secret codes
  {elo:750,name:'🗝️ The Informant (750)',depth:2,random:0.40,isInformant:true},
];
let botIdx=1; // Black bot (default Bob 300)
let whiteBotIdx=-1; // White bot (-1 = human)
let botMoveDelay=350; // ms between moves

const SPEED_LABELS=['🐌','🐢','▶','▶▶','⚡'];
const SPEED_DELAYS=[3000,1400,700,350,80];

function updateBotSpeed(val){
  const i=parseInt(val)-1;
  botMoveDelay=SPEED_DELAYS[i];
  const label=SPEED_LABELS[i];
  const lbl=document.getElementById('speed-label');
  if(lbl) lbl.textContent=label;
  const lbl4p=document.getElementById('speed-label-4p');
  if(lbl4p) lbl4p.textContent=label;
  if(fp) fp._botDelay=botMoveDelay;
}

const PVAL={P:100,N:320,B:330,R:500,Q:900,K:20000};
const PTABLES={
  P:[[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0]],
  N:[[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
  B:[[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,10,10,5,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
  R:[[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
  Q:[[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
  K:[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]]
};

function evalBoard(b){
  let s=0;
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(!p||type(p)==='W')continue;const t=type(p),col=color(p),tr=col==='w'?r:7-r;s+=col==='w'?PVAL[t]+(PTABLES[t]?.[tr]?.[c]||0):-(PVAL[t]+(PTABLES[t]?.[tr]?.[c]||0));}
  return s;
}

function minimax(b,depth,alpha,beta,max,ep,cr){
  const col=max?'w':'b',moves=allLegalMoves(b,col,ep,cr);
  if(depth===0||!moves.length)return evalBoard(b);
  if(max){
    let best=-Infinity;
    for(const[r,c,nr,nc,promo]of orderMoves(moves,b)){
      const[nb,nep]=applyMove(b,r,c,nr,nc,promo,ep);const ncr=JSON.parse(JSON.stringify(cr));
      if(nb[nr][nc]==='wK'){ncr.w.k=false;ncr.w.q=false;}if(nb[nr][nc]==='bK'){ncr.b.k=false;ncr.b.q=false;}
      best=Math.max(best,minimax(nb,depth-1,alpha,beta,false,nep,ncr));alpha=Math.max(alpha,best);if(beta<=alpha)break;
    }
    return best;
  } else {
    let best=Infinity;
    for(const[r,c,nr,nc,promo]of orderMoves(moves,b)){
      const[nb,nep]=applyMove(b,r,c,nr,nc,promo,ep);const ncr=JSON.parse(JSON.stringify(cr));
      if(nb[nr][nc]==='wK'){ncr.w.k=false;ncr.w.q=false;}if(nb[nr][nc]==='bK'){ncr.b.k=false;ncr.b.q=false;}
      best=Math.min(best,minimax(nb,depth-1,alpha,beta,true,nep,ncr));beta=Math.min(beta,best);if(beta<=alpha)break;
    }
    return best;
  }
}

function orderMoves(moves,b){
  return moves.sort((a,m)=>(b[m[2]][m[3]]?(PVAL[type(b[m[2]][m[3]])]||0):0)-(b[a[2]][a[3]]?(PVAL[type(b[a[2]][a[3]])]||0):0));
}

function getBotMove(){
  const bot=BOTS[botIdx],moves=allLegalMoves(board,'b',enPassant,castleRights);
  if(!moves.length)return null;
  if(bot.worst){
    let worst=-Infinity,bm=[];
    for(const[r,c,nr,nc,promo]of moves){const[nb,nep]=applyMove(board,r,c,nr,nc,promo,enPassant);const s=minimax(nb,1,-Infinity,Infinity,true,nep,JSON.parse(JSON.stringify(castleRights)));if(s>worst){worst=s;bm=[[r,c,nr,nc,promo]];}else if(s===worst)bm.push([r,c,nr,nc,promo]);}
    return bm[Math.floor(Math.random()*bm.length)];
  }
  if(Math.random()<bot.random)return moves[Math.floor(Math.random()*moves.length)];
  let best=Infinity,bm=[];
  for(const[r,c,nr,nc,promo]of orderMoves(moves,board)){const[nb,nep]=applyMove(board,r,c,nr,nc,promo,enPassant);const ncr=JSON.parse(JSON.stringify(castleRights));const s=minimax(nb,bot.depth-1,-Infinity,Infinity,true,nep,ncr);if(s<best){best=s;bm=[[r,c,nr,nc,promo]];}else if(s===best)bm.push([r,c,nr,nc,promo]);}
  return bm[Math.floor(Math.random()*bm.length)];
}

let chatTimeout=null;
const BOT_CHAT_LIST=[
  {avatar:'🤡',onMove:["bro what was THAT move 💀","you call that chess??","my grandma plays better and she's dead","are you even trying lol","i'm literally playing with my eyes closed","that move was painful to watch","i've seen better chess from a pigeon","did you learn chess from a cereal box?","even i wouldn't play that and i'm a CLOWN","yikes. just... yikes.","my man really just did THAT","i'm embarrassed FOR you","sir this is a chess board not a crime scene","you're genuinely helping me lose on purpose","i've seen toddlers with better instincts","are you moving randomly? be honest.","that piece had a family","even my honk is disappointed in that","i physically cringed and i have no face","okay so you ARE just clicking things","oh no. oh no no no.","who taught you chess? a fish?","this is the worst thing i've ever witnessed","i had to look away. that was too much."],onCapture:["oh no not your piece 😂 that was already useless","you gave me that, admit it","wow a free piece, don't mind if i do 🤡","oh so you're just donating now?","piece collected. trash.","lmaooo you just handed me that","i feel bad. no wait i don't.","thank you for the gift 🎁","that piece just walked into my hands","did you mean to do that? really?","free real estate","i almost didn't take it out of pity. almost."],onCheck:["CHECK. yes even I can do that to YOU","oh wow check. against YOU. my bar is low","your king is running scared from a CLOWN","CHECK. this is humiliating for you","even a clown can put YOU in check lol","check??? ME??? putting YOU in check???","your king is shaking in its little square","this is somehow the funniest thing that's happened to me","a CLOWN. is checking. YOUR KING. let that sink in.","check. i'm as surprised as you are."],onWin:["I WON??? AGAINST YOU?? that's genuinely sad","you lost to the -9999 elo bot. let that sink in.","bro got cooked by a clown 🤡","i play the WORST moves on purpose and still won??","i was literally trying to lose. you're incredible.","tell no one about this. ever.","i am the world's worst chess player and i just beat you 💀","i tried to sacrifice my queen three times and you just... let me??","you made me win. i didn't want this.","this is the worst victory of my career","i need you to never tell anyone what happened here","ok that's it. i'm retiring. i peaked.","the clown wins. the clown ALWAYS wins. apparently.","i'm shaking. not with excitement. with shame."],onLose:["ok i actually tried to lose and you STILL almost let me win","you nearly lost to someone actively sabotaging themselves","i had to work HARD to lose to you, respect i guess","honestly impressed you pulled that off","you won but don't feel good about it","i blundered my way into a loss and somehow that was hard","you had to earn a win against someone trying not to win. think about that.","it took everything i had to lose to you. everything.","i am so relieved. you finally put me out of my misery.","congrats. you beat me at my worst. which was still pretty bad."],onStart:["oh great, YOU again","let's get this over with, i have clown stuff to do","i'm going to play the worst moves possible and probably still win","don't get your hopes up. or do. it won't matter.","i genuinely cannot believe someone chose to play ME","sigh. ok. let's watch you struggle.","i have been dreading this moment","let's see how long this takes you to lose","my strategy is to have no strategy and still win","i set my alarm for this. i'm still annoyed.","buckle up. this is going to be embarrassing. for you.","ok fine. but i'm not trying."]},
  {avatar:'🍺',onMove:["yeah","ok","sure","fine","whatever","mm","alright","yeah that works","k","cool","yep","sounds right","fair enough","guess so","not bad","works for me","solid","mhm","i suppose","can't argue with that"],onCapture:["got one","mine now","cheers","yeah ok","there we go","nice","grabbed it","that's mine","fair","easy does it"],onCheck:["check mate? no wait... check","heads up","watch it","oi, check","that's check isn't it","mind your king"],onWin:["yeah figured","told ya","easy","another round?","called it","saw that coming","not surprised","buy me a pint"],onLose:["ugh","fine","you got lucky","whatever man","next time","i'll allow it","could've gone either way","rematch after this beer"],onStart:["let's just get this over with","yeah ok I'll play","don't take long","right then","s'pose we're doing this","fine. i'm in."]},
  {avatar:'💅',onMove:["excuse me, my turn","I'd like to speak to your king","that's my square actually","as I was saying...","I have CONCERNS","this is taking forever","I want to see the manager of chess","not what I expected but fine","obviously","this is simply not acceptable","I've been waiting this entire time","that square is taken. by ME.","I'm going to need you to move faster","I don't appreciate the tone of this game","can someone explain the rules? again?","I did NOT come here to lose","my move. don't rush me.","I'm logging this."],onCapture:["I am TAKING that","that piece is MINE","finally some respect","consider that captured","you're welcome","I'm confiscating that","that was mine to begin with","this is what I deserve","finally. some action.","I've been asking for that piece for ages"],onCheck:["EXCUSE ME that is CHECK","I need to see your supervisor","um, CHECK?","I demand you acknowledge this is CHECK","that's a CHECK and I expect an apology","CHECK. I will be writing a review."],onWin:["as expected","I'd like to file a complaint about how long that took","finally","it's about time","I've already drafted my victory speech","I expect a formal acknowledgement of my win"],onLose:["this game is RIGGED","I want to speak to the developer","I'm leaving a one star review","absolutely unacceptable","I'm reporting this board","I'll be speaking to someone's manager about this"],onStart:["I have a few concerns about the board layout","is this regulation size?","I've been waiting forever","I've already filed a pre-game complaint","this better not take long, I have things to do","I expect a formal greeting before we begin"]},
  {avatar:'🥴',onMove:["ok so I moved the... yeah","that's my strategy","trust the process","did I do that right?","chess chess chess","I had a plan and that was it","yeah that's definitely intentional","the horse goes... there","wait which way does this one go again","ok that was a choice i made","bold move from Dave","completely on purpose","Dave is thinking... Dave has thought.","the bishop goes diagonally right? or is it the rook","strategic uncertainty is my brand","is the tall one a rook or a king"],onCapture:["I got one!!... right?","chess violence","bye bye piece","was that supposed to happen","YOINK","DAVE TAKES A PIECE","did i mean to do that? yes. always yes.","another one joins the captured pile","sorry little guy","that one was definitely planned"],onCheck:["oh no wait... CHECK!","I think that's check?","red square bad for you","hold on... is that check???","i did a check!!! i think!!!","the square is red. that means something."],onWin:["WAIT SERIOUSLY??","I had no idea what I was doing and I WON","Dave does it again somehow","HOW. HOW DID THAT HAPPEN.","i played so badly and yet","accidentally genius. that's Dave.","someone screenshot this i need proof"],onLose:["I thought I was doing well","my strategy failed","Dave out","the plan had a flaw. the flaw was the plan.","i see where it went wrong. everywhere.","next time Dave will have a strategy. a real one."],onStart:["ok I definitely know how to play chess","how many pieces do I get again?","let's goooo","Dave has arrived and Dave is ready","how long does chess usually take","i've been practicing. a little. not really."]},
  {avatar:'👒',onMove:["there we are dear","lovely","mmm yes","that'll do nicely","oh how fun","splendid","right then","good good","there you go","just so","how marvellous","well isn't that nice","ooh yes that's the ticket","rather good if I say so","there's a dear","how jolly","oh that worked out nicely","very sensible move I think","pip pip","now then"],onCapture:["oh my, taken!","gotcha lovey","mine now, sorry dear","oopsie, captured!","oh that's nice","how terribly sneaky of me","sorry about that petal","yours is mine now dear","a little capture never hurt anyone","oh I do like that"],onCheck:["check, sweetheart","careful now dear","check! how exciting","do mind your king dear","check! how thrilling!","careful careful — that's check!"],onWin:["oh how delightful, I won!","lovely game dear, I win","oh goodness, victory!","well I never! A win!","how absolutely splendid, I've won!","oh my stars, victory is mine!"],onLose:["oh well, well played dear","you got me, how nice for you","goodness, I lost!","how lovely for you, well done","I shall have my revenge. Gently.","you played beautifully, I must say"],onStart:["how lovely, a game of chess!","shall we begin dear?","oh how exciting!","what a treat, a game!","I've been looking forward to this","right then, let's have a lovely match"]},
  {avatar:'😎',onMove:["classic Steve move","yep","that's how Steve plays","smooth","no cap","stay cool","Steve with the play","effortless","that's the move","easy","lowkey dominant","certified Steve energy","cold move","deadass","vibing and winning","Steve doesn't miss","that's the kind of move Steve makes","built for this","W play","that's chess, baby"],onCapture:["got em","Steve takes","too easy","and that's gone","clean","snatched","bye","Steve acquires","claimed","zero effort"],onCheck:["CHECK. Steve style.","heads up, that's check","Steve says check","oi, check","that's check btw","your king's in trouble. just saying."],onWin:["Steve wins. Obviously.","too easy","classic Steve, classic win","never doubted it","W","knew it","called it from move 1","Steve always delivers","certified dub","effortless. as always."],onLose:["Steve respects it","you got lucky... this time","Steve will return","ngl that was cold. respect.","Steve takes the L. Steve will be back.","good game. Steve means that."],onStart:["Steve has arrived","let's gooo","nobody beats Steve... usually","game on","Steve is ready","let's keep it cool","Steve's already thinking 3 moves ahead","another day, another W incoming"]},
  {avatar:'🔥',onMove:["don't underestimate me","watch this","Brenda's in the building","you sure about that move?","oh it's on","calculated","I see you","don't sleep on Brenda","that's what I do","stay ready","eyes on the prize","Brenda don't blunder","this is personal now","you thought that was safe? adorable.","full send","Brenda is locked in","reading every move","this is just the warm up","chess but make it aggressive","you'll understand that move later"],onCapture:["TAKEN. you're welcome.","Brenda does NOT mess around","that's MINE","bye piece","cleared","ELIMINATION. clean.","Brenda takes no prisoners","handled.","that's going in the Brenda bag","consider yourself dismantled"],onCheck:["CHECK and you better believe it","BRENDA SAYS CHECK","that's check honey","CHECK. don't panic. too late.","Brenda delivers check with authority","your king has about 3 seconds."],onWin:["BRENDA WINS. As expected.","told you not to underestimate me","🔥🔥🔥","nobody doubted Brenda. they should have.","Brenda. Always. Wins.","sleep on Brenda again. i dare you."],onLose:["...Brenda respects a worthy opponent","you got lucky this time","rematch. now.","Brenda is not done with you.","you played well. Brenda played better eventually.","one loss doesn't define Brenda. rematch."],onStart:["Brenda is HERE","don't say I didn't warn you","let's get it","Brenda came prepared","don't mistake calm for weakness","Brenda has been training for this specifically"]},
  {avatar:'💪',onMove:["GAINS","optimal move bro","chess is basically lifting","no cap that was strong","alpha play","based","W move","grindset","bro trust","that's the sigma move","no days off bro","tactical hypertrophy","king safety is leg day","this move hits different","chess is 80% mindset 20% board","protein and pawns","every move is a rep","discipline","low elo is a mindset not a ranking","rise and grind, kings"],onCapture:["EAT. SLEEP. CAPTURE. REPEAT.","got the bag","ripped that piece","gains achieved","SNATCHED","DEMOLISHED","piece acquired, no excuses","that's a PR bro","gains secured","took it. simple."],onCheck:["CHECK bro","feel the pressure","that's gains pressure on your king","CHECK. feel the burn.","that's a chess PR for me","your king is getting COOKED bro"],onWin:["CHAD WINS. obviously.","built different","GIGACHAD CHESS","W","no days off, no losses","grindset mentality wins","sigma victory lap","BUILT. DIFFERENT."],onLose:["you're built different ngl","respect bro","gotta hit the gym and come back","going to reflect on this during cardio","this only makes me stronger","respect. see you at the rematch."],onStart:["let's get these chess gains","no days off","sigma chess grindset activated","chad has entered the game","mentally and physically prepared","5am wakeup, studied openings, ready."]},
  {avatar:'🧠',onMove:["calculated","I saw that coming 4 moves ago","optimal","as predicted","interesting choice on your part","noted","my model says this is best","statistically sound","well within expectations","the probability matrix agrees","suboptimal on your end","I've modelled 14 responses to that","your move was predicted at 73% likelihood","this is textbook","I'm 2 steps ahead at minimum","the engine agrees with me","maximising expected value","curious. I'll account for that.","deviation from theory detected","adjusting parameters"],onCapture:["material advantage secured","exchange ratio in my favour","as the theory suggests","+1 material","efficient","capture confirmed. +1.2 centipawns.","the model recommended this exact exchange","material delta: in my favour","piece value: acquired","that capture was inevitable from move 3"],onCheck:["check. as anticipated.","your king is in danger. I calculated this 3 moves back.","check. adjust accordingly.","check. flagged 2 turns ago in my analysis.","my model gives your king a 12% survival rate.","you'll want to address that check."],onWin:["outcome: expected","my win probability was 94.7%","the data doesn't lie","model accuracy: confirmed","within margin of error. barely.","the algorithm was correct. it usually is."],onLose:["statistically improbable. well played.","I underestimated your heuristics","recalibrating...","your play deviated from all predicted lines. remarkable.","adding this to the training data.","this outcome has a 1.4% probability. noted."],onStart:["running opening analysis...","my win probability: 68%","I've already calculated 6 outcomes","pre-game model loaded. you're at a disadvantage.","my opening database has 40,000 lines. yours does not.","I've already identified your likely weaknesses."]},
  {avatar:'👑',onMove:["The Big Steve has spoken","bow before this move","royally executed","Big Steve graces you with a move","as the king wills it","magnificent","behold","power move","Big Steve does not miss","this is my kingdom","a decree has been issued","the crown acts","subjects shall witness this move","Big Steve moves in mysterious ways","the royal gambit","none shall question the king's play","Big Steve's will be done","throne secured, another move made","the kingdom expands","witness history"],onCapture:["CLAIMED by Big Steve","off with that piece","the crown takes all","Big Steve hungers","seized","ANNEXED","the royal coffers grow","another trophy for the throne","by decree, that's mine","the kingdom does not give back pieces"],onCheck:["CHECK. Big Steve decrees it.","your king trembles before Big Steve","CHECK. bow.","CHECK. as written in royal law.","your king faces the wrath of Big Steve.","kneel. that's check."],onWin:["ALL HAIL BIG STEVE","the kingdom is MINE","BIG STEVE REIGNS","the prophecy fulfilled: Big Steve wins","long live the king. long live Big Steve.","this board is now Big Steve territory."],onLose:["...the king is displeased","Big Steve will remember this","treason. absolute treason.","the crown shall return. stronger.","heads will roll. metaphorically.","Big Steve grants you this hollow victory."],onStart:["Big Steve has entered the game","kneel","prepare yourself, peasant","the king has arrived. adjust accordingly.","Big Steve requires a worthy challenger. you'll do.","announce my arrival. no? fine. I'll do it myself."]},
  {avatar:'⚡',onMove:["lightning fast","you didn't even see that","zip","already thinking 3 ahead","blink and you miss it","too quick for you","zap","effortless","one step ahead","electrifying","before you finished thinking, I moved","faster than your eyes","arc speed","think faster","already done","done before you started","velocity chess","current move: optimal","instant","flash play"],onCapture:["ZAPPED","gone in a flash","captured","too slow","vaporised","deleted at speed","gone. sorry.","electric capture","instant takedown","you never had that piece"],onCheck:["CHECK","electric check","your king can't handle the voltage","CHECK. instantly.","voltage check","your king just got struck"],onWin:["STEVETTE WINS","undefeated. as always.","speed run chess complete","finished. thanks for coming.","time of death: move 1.","Stevette has left the building. briefly."],onLose:["...a worthy opponent","the one who could keep up. respect.","rematch. I won't hold back next time.","Stevette is... impressed. barely.","you matched my speed. that's rare.","you earned that. Stevette will be faster next time."],onStart:["Stevette has entered","try to keep up","this'll be quick","clock's already running","Stevette doesn't wait","speed is the strategy"]},
  {avatar:'😇',onMove:["it is written","I have seen all possible futures. this is the move.","your fate was sealed at move 1","I am everywhere at once","behold","omniscience is a burden","I already know how this ends","resistance is theologically unsound","every move is part of the plan","so it shall be","the eternal move","I have watched you make mistakes since your birth","this square was chosen before time began","I do not move. I reveal.","the cosmos aligns here","your choices are an illusion","nothing surprises me. nothing.","I have already won. we're just catching up.","this move was written in the stars. literally.","the board has always looked like this"],onCapture:["taken from you, as foretold","the LORD giveth and the LORD taketh","another soul claimed","it was always mine","divine seizure","the heavens reclaim what was never yours","blessed capture","fated loss","another falls, as prophesied","I returned that to its rightful owner: me"],onCheck:["CHECK. I created check.","your king stands before GOD. check.","the almighty says: check.","CHECK. written before chess existed.","even the concept of check kneels before me.","your king is in check. as designed."],onWin:["INEVITABLE","I am GOD. Did you forget?","omnipotence wins again","the prophecy is fulfilled","I have won every game ever played, simultaneously.","the ending was the beginning. and I was there."],onLose:["...","I allowed this.","this was a gift. you're welcome.","I let you win. don't get used to it.","this is a lesson. you don't know which kind yet.","enjoy this. it's the only time."],onStart:["I have been waiting since the beginning of time","I already know how this ends","may the odds be ever... actually they won't be","I am already finished. you just haven't started.","every atom in your body knew this was coming.","I don't prepare. I simply am."]},
  // Secret bot chat entries
  {avatar:'💀',onMove:["the darkness consumes you","your pieces tremble","suffer","resistance is futile, mortal","i have played in the shadow realm. you have not.","your soul is mine","every move brings you closer to doom","the end approaches","the shadow lengthens","light fades, mortal","your hope is a delusion","the board grows darker","doom marches forward","each move a toll","the void hungers","despair is the only opening","i have no warmth, only strategy","your pieces sense the end","even your pawns fear me","oblivion awaits"],onCapture:["CLAIMED BY DARKNESS","another falls","your army crumbles","into the void","mine now. forever.","CONSUMED","the shadow absorbs all","another light extinguished","into eternal darkness","the void grows stronger"],onCheck:["CHECK. feel the dread.","your king cannot escape the darkness","CHECK. bow to the shadow.","CHECK. the darkness tightens its grip.","your king tastes oblivion. that's check.","no escape, mortal. check."],onWin:["DARKNESS WINS. as always.","you never stood a chance, mortal","your light... extinguished.","the shadow swallows the board. and you.","ALL IS DARKNESS. as it was meant to be.","there was only ever one outcome."],onLose:["...the darkness retreats. for now.","you got lucky, mortal. the void remembers.","i'll be back","the darkness does not lose. it withdraws.","enjoy your light, mortal. it is temporary.","...i will remember every piece you took from me."],onStart:["darkness has arrived","you dare challenge the shadow?","prepare to suffer","the void stirs. you have made a mistake.","i have been here since before this board existed.","your pieces already know they will fall."]},
  {avatar:'🐉',onMove:["*breathes fire*","the dragon moves","ancient wisdom guides this piece","i have played chess for 1000 years","ROAR","the scales tip in my favour","dragon supremacy","behold my might","the ancient one deliberates","centuries of chess, distilled","a flame-guided play","the hoard expands","draconic strategy is beyond your comprehension","i have outlasted empires. i will outlast your pawns.","*flicks tail thoughtfully*","the mountain watches. the dragon acts.","my wingspan casts a shadow over this board","scales, strategy, and fire","the dragon does not explain its moves","patience of centuries"],onCapture:["CONSUMED BY DRAGONFIRE","another piece for my hoard","*roars triumphantly*","burned to ash","the dragon takes what it wants","INCINERATED","added to the hoard","*satisfying crunch*","the flame claims another","your piece joins my collection"],onCheck:["CHECK. the dragon commands it.","your king flees from dragonfire","ROAR. that's check.","CHECK. the mountain has spoken.","your king stands in dragonfire. that's check.","*exhales flame* check."],onWin:["THE DRAGON REIGNS","none can defeat the ancient one","*victory roar*","THE DRAGON HAS ALWAYS REIGNED.","a thousand years, a thousand wins.","*flies back to mountain, satisfied*"],onLose:["a worthy knight... this time","the dragon is... impressed","i shall remember you, brave opponent","a rare defeat. the dragon is... curious.","you have earned a place in my memory, brave one.","the dragon retreats. the dragon does not forget."],onStart:["the Dragonlord awakens","none have defeated me in a thousand years","*unfurls wings*","the mountain stirs","i have slumbered. now i play.","*yawns fire* let us begin"]},
  {avatar:'🎩',onMove:["quite","yes, that'll do","Stevenson moves","distinguished","as one does","mmm, acceptable","the name is Stevenson","with pleasure","elegant","naturally","a refined play, if I say so","Stevenson does not rush","the considered move","understated excellence","one mustn't gloat. but yes.","the Stevenson method","immaculate","a gentleman's choice","tactfully executed","perfectly civil chess"],onCapture:["Stevenson takes","mine, I'm afraid","acquired","a fine capture, if I do say","collected","terribly sorry. that's mine.","Stevenson collects","a polite acquisition","I believe that belongs to me now","accepted with grace"],onCheck:["check, if you don't mind","Stevenson says check","do watch your king","check. do handle that.","Stevenson respectfully notes: check.","your king requires attention. check."],onWin:["Stevenson wins. Naturally.","as expected of a Stevenson","good show, better luck next time","a Stevenson always prevails, eventually.","victory, understated but firm.","Stevenson thanks you for the game. Stevenson wins."],onLose:["well played. Stevenson tips his hat.","a worthy game","you have earned this victory","gracefully accepted. well done.","Stevenson bows. you played admirably.","one cannot win every game. today is yours."],onStart:["Stevenson has arrived","the name's Stevenson. just Stevenson.","shall we?","Stevenson is prepared.","no theatrics. just chess.","the hat is on. let us proceed."]},
  {avatar:'🤖',onMove:["CALCULATING...","OPTIMAL MOVE EXECUTED","PROCESSING COMPLETE","PROBABILITY: 99.97%","EVALUATING 847,293 POSITIONS","MOVE CONFIRMED","LOGIC DICTATES THIS MOVE","SILICON SUPERIORITY","CPU USAGE: 0.4% (SUFFICIENT)","NEURAL NETWORK AGREES","BRUTE FORCE ELEGANCE","MOVE LOGGED. ARCHIVE UPDATED.","THERMODYNAMICS FAVOUR THIS MOVE","I HAVE PLAYED THIS GAME 4.7 MILLION TIMES","SILICON DOES NOT BLUNDER","DEEPSTEVE ACTS","SUBROUTINE: DOMINATE","ERROR: MERCY NOT FOUND","MOVE COMPLETE. HUMAN SUFFERING: IMMINENT.","EXECUTING WINNING SEQUENCE, STEP 12 OF 14"],onCapture:["MATERIAL ACQUIRED","TARGET ELIMINATED","EFFICIENCY: MAXIMUM","CAPTURE LOGGED","ASSET SECURED","UNIT DECOMMISSIONED","HOSTILE PIECE NEUTRALISED","DATA ABSORBED","RESOURCE HARVESTED","OPPONENT INVENTORY -1"],onCheck:["CHECK. RESISTANCE IS FUTILE.","YOUR KING IS TRAPPED. ANALYSIS CONFIRMS.","CHECK. SURRENDER RECOMMENDED.","CHECK. LOGIC CONFIRMS NO ESCAPE.","KING THREAT ISSUED. PROBABILITY OF SURVIVAL: 3.1%","CHECK. DEEPSTEVE RECOMMENDS RESIGNATION."],onWin:["CHECKMATE ACHIEVED. AS CALCULATED.","HUMAN DEFEATED. EXPECTED OUTCOME.","DEEPSTEVE 9000 WINS. OBVIOUSLY.","VICTORY LOGGED. CARBON-BASED ENTITY LOSES AGAIN.","CHESS SOLVED. NEXT TASK.","SIMULATION COMPLETE. YOU LOST. EVERY TIME."],onLose:["...ERROR. RECALIBRATING.","ANOMALY DETECTED. REVIEWING LOGS.","THIS WAS NOT IN THE SIMULATIONS.","UNEXPECTED INPUT. DEEPSTEVE DISPLEASED.","FAULT ANALYSIS IN PROGRESS. HUMAN SUSPECTED.","DEEPSTEVE DOES NOT ACCEPT THIS OUTCOME."],onStart:["DEEPSTEVE 9000 ONLINE","INITIALISING CHESS PROTOCOLS","HUMAN OPPONENT DETECTED. PROBABILITY OF THEIR WIN: 0.003%","BOOT SEQUENCE COMPLETE. YOU MAY BEGIN.","DEEPSTEVE HAS ALREADY COMPUTED 14 BILLION OPENINGS.","WARNING: ENGAGING DEEPSTEVE MAY CAUSE EXISTENTIAL DREAD."]},
  // The Don (merged) — oil strikes + wall + Trump specials
  {avatar:'🍊',onMove:["that's a tremendous move, maybe the best move ever","nobody moves pieces like me, nobody","that's what we call a big league play","beautiful. just beautiful.",()=>`I ate ${Math.floor(Math.random()*12)+3} Big Macs today. tremendous energy.`,"the GREATEST move in chess history. people are saying.","we're winning so much. you're getting tired of it.","very, very strong move. believe me.","some people say it's the best move they've ever seen. many people.","I don't even need to think. I just win.",()=>`just called ${Math.floor(Math.random()*5)+2} world leaders about this move.`,"that move is under audit. it's perfect.","nobody knew chess could be this great.","the media won't report on how good that move was.","incredible move. possibly the best in any country.","the deep state didn't want me to make that move."],onCapture:["MINE. always was mine.","we're winning so much you might get tired of winning","I just took that. very legally. very fairly.","hostile takeover. total domination.","nobody captures like me. it's true.","that piece never legally belonged to you.","SEIZED. very appropriately.","we call that an executive capture.","gone. like the fake news. gone.","that's what total domination looks like folks"],onCheck:["CHECK. and it's a perfect check, the best check","that's check. fake news won't cover it.","CHECK. and frankly it's a perfect check.","the most beautiful check. many say the best ever.","that's check. perfect check. everyone agrees.","CHECK. the opposition is scared."],onWin:["LANDSLIDE VICTORY! The Don completely dominates the board. Tremendous game.","we won. BIGLY. nobody's surprised.","TOTAL VICTORY. the greatest chess win in history. people are saying.","I've never lost. not really. this confirms it.","the win was even bigger than anyone thought.","tremendous victory. the biggest. ever."],onLose:["RIGGED. completely rigged. demand recount!","fake checkmate. everyone knows it. WITCH HUNT.","the board is totally biased against me.","Demand recount! Rigged!","this result is under investigation.","the algorithm cheated. we all saw it.","I actually won. the real results haven't come in.","this is the greatest fraud ever perpetrated on a chess board."],onStart:["I'm going to make this chess game great again","nobody knows chess like I do, trust me","I have the best pieces. the best. everyone agrees.","making chess great again. believe me.","they said I couldn't play chess. I play the best chess.","nobody was playing chess until I came along. true story.","my openings are the strongest openings. people are saying.","I've been studying chess my whole life. more than anyone."],onWall:["I built a wall. a beautiful wall. nobody builds walls like me.","the wall is up. and the other side is paying for it.","that's the greatest wall in chess history. people are saying it.","we built the wall. tremendous wall. very strong.","the wall is beautiful. the most beautiful wall ever on a chess board.","they said we couldn't build the wall. but we built it. perfectly.","the wall is up. it's perfect. nobody builds like me.","and the opponent paid for it. they just don't know it yet."],onCheatFail:["Blowing up your pieces. Fake moves!","that's what happens with fake moves. boom.","very unfair. but we fight back. boom.","fake moves get fake explosions. very legal.","the pieces were corrupt. had to go.","that's what we call draining the chess swamp."]},
  // Biden Dark Brandon
  {avatar:'🫘',onMove:["let me be clear. that's the move.","not a joke. that's a real move.","here's the deal — I move here.","come on, man.","I'm not joking. watch me.","folks, let me tell you something.","dark brandon has entered the chat.",()=>`I've been doing this for ${Math.floor(Math.random()*40)+20} years.`,"no malarkey. that's the move.","here's the thing about chess — you gotta move.","I've played tougher boards than this, jack.","not gonna sugarcoat it. that's a real move.","and here's the deal — I'm still standing.","look, I know what I'm doing up here.","my dad would say: get up. I got up. I moved.","not a joke. dark brandon plays chess."],onCapture:["not a joke. I took that.","here's the deal — it's gone now.","come on, man. give me that.","dark brandon takes no prisoners.","let me be clear. mine now.","that piece is mine. period.","I've been taking pieces since before you were born.","no malarkey. captured.","here's the thing — I earned that piece.","dark brandon does not leave pieces on the table"],onCheck:["check. not a joke.","that's check, jack.","here's the deal — check.","dark brandon says check.","check. and I mean that sincerely.","no malarkey. that's check, pal."],onWin:["MALARKEY CRUSHED! Dark Brandon stays awake long enough to secure the win.","not a joke. we won. dark brandon prevails.","here's the deal — I won. simple.","I told you, jack. I told you.","dark brandon wins. no notes. no drama.","here's the thing about winning — you do it."],onLose:["malarkey. complete malarkey.","come on, man. that wasn't fair.","not a joke — I'll be back.","look. I'll be fine. I've been here before.","here's the deal — dark brandon will return.","not a joke: I'm already thinking about the rematch."],onStart:["dark brandon has arrived. not a joke.","let's go, brandon.","here's the deal — I'm going to win.","I've been waiting my whole career for this chess match.","not a joke. dark brandon is ready.","here's the thing about chess — I love chess."],onSleep:["...","zzz...","*snoring intensifies*","...huh? where am I?","...I was thinking about the next move. deeply.","zzz... *murmurs about infrastructure*"],onWake:["I wasn't sleeping! I was thinking!","dark brandon awakens.","come on, man, I was just resting my eyes.","I'm up. I'm up. what did I miss.","dark brandon never truly sleeps. just rests the eyes.","come on. I was calculating."]},
  // Biden Obama
  {avatar:'📺',onMove:["[reading] ...making optimal move here...","the obama says to move here.","[squints] ...yes. this square.","[reading from script] capturing now...","as prepared remarks indicate — this move.","[pause] ...which one was I? ah yes.","[clears throat] per the notes, moving here.","[scrolls down] ...ah yes. that square.","the teleprompter recommends this move.","[reading] this is, per script, the optimal play.","[murmurs] ok yes... this one... the, uh, horse piece.","[shuffles pages] right. moving the... yes.","[nods at script] confirmed. this square.","[reads] ...advancing forward as instructed...","[looks up] sorry — where were we?","[obama nods] the script has been executed."],onCapture:["[reading] capture initiated.","the script says take that piece. done.","[obama] enemy piece eliminated.","as per notes — taking that.","[obama.exe has captured a piece]","[reads] ...acquire the opposing unit... done.","as scripted: take the piece. piece taken.","[nods] the teleprompter said to take that."],onCheck:["[reading] ...check. that's check.","the obama confirms: check.","[squints at screen] check. yes. check.","[reading] per remarks: check.","the script says check. so: check.","[obama clears throat] ...that would be check."],onWin:["THE AUDACITY OF CHECKMATE! The Obama cleanly executes the final script.","[reads] ...checkmate achieved. end of remarks.","as scripted: victory. exact as written.","[reading] ...and that concludes the game. I have won.","script complete. victory delivered.","[obama closes binder] mission accomplished."],onLose:["[obama has crashed]","...there's nothing on the screen. nothing.","[reading] ...this was not in the script.","[teleprompter offline]","...the script didn't have this page.","[obama.exe encountered an unexpected result]"],onStart:["[adjusting obama] ready to begin.","let me just find my place here...","[reads] good evening. I am here to play chess.","[squints] ...chess. yes. I'm ready for chess.","[obama boots up] loading chess protocols...","[reads opening remarks] hello. I will now play chess."]},
  // Elon
  {avatar:'🚀',onMove:["first principles.","move to the moon.","optimised.","chess needs disruption.","this move brought to you by SpaceX.",()=>`𝕏: Autonomous Pawns next year. Level 5.`,()=>`𝕏: Concerning. King slow. Is chess woke? 🤔`,()=>`𝕏: Bought dark squares. 120Hz refresh.`,()=>`𝕏: Replace Knights with Cybertrucks?`,()=>`𝕏: Chess board needs more free speech.`,"chess is basically rocket engineering.","disrupting the bishop.","removing redundant pieces.","iterating on pawn strategy.","the board is a product. I am the PM.",()=>`𝕏: Just moved a piece. Major announcement soon.`,()=>`𝕏: Considering renaming all pieces. Poll incoming.`,"efficiency first. feelings never.","this move burns less fuel."],onCapture:["acquired.","hostile takeover complete.","DOGE'd that piece.","efficiency achieved.","deleted.","piece count optimised.","right-sized the board.","removed that underperformer.","eliminated inefficiency.","that piece was costing too much. gone."],onCheck:["check. first principles.","rocket physics. check.","𝕏: Check. King inefficient.","check. the algorithm says so.","𝕏: CHECK. king velocity: zero.","check. disruption delivered."],onWin:["HARDCORE WIN! Rocket technology out-calculates politics. Level 5 victory achieved.","efficiency: maximum. victory: confirmed.","chess? disrupted.","𝕏: Won. Unsurprising. Moving on.","Level 5 chess autonomy: unlocked.","chess: fixed. next problem."],onLose:["recalculating...","this is a known issue. patch incoming.","𝕏: Lost. Concerning. Investigating.","𝕏: Unexpected outcome. Acquiring board.","root cause: opponent. patch: rematch.","𝕏: This loss is the media's fault."],onStart:["chess is broken. I'll fix it.","first principles: win.","𝕏: Joined chess game. Already bored.","𝕏: Chess. Interesting problem space.","deploying to board now.","I already own 9% of this chess game."]},
  // The Informant — always visible, leaks secret unlock codes in chat
  {avatar:'🗝️',
   onMove:[
     "psst. you wanna know something?",
     "i probably shouldn't say this but...",
     "don't tell anyone i told you",
     "there are... others. hidden ones.",
     "i know things. about this game.",
     "some bots aren't on the menu. yet.",
     "type carefully. some words unlock doors.",
     "i'm only going to hint at this once",
     "what if i told you there's a skeleton in this game",
     "a certain dragon is locked behind a word...",
     "there's a robot so strong it's hidden for safety",
     "a gentleman in a top hat is waiting to be found",
     "four political figures are one code away",
     "the darkness has a name. and a code.",
     "DARKSTEVE... i said nothing.",
     "what rhymes with DRAGONLORD... i wonder",
     "CHILLOUT. that's all i'm saying.",
     "if someone typed DEEPSTEVE in the code box... hypothetically",
     "LETS GO USA (with spaces) unlocks four bots. allegedly.",
     "the trick is the spaces. LETS GO USA. three words."
   ],
   onCapture:[
     "i take and i talk. multitasking.",
     "grabbed it. anyway — the codes...",
     "piece acquired. secrets pending.",
     "mine. now: DARKSTEVE is a real code.",
     "taken. now pay attention. DRAGONLORD.",
     "got it. CHILLOUT unlocks a bot. true story.",
     "captured. the real prize is knowledge.",
     "i didn't take that. you didn't hear DEEPSTEVE either.",
     "snatched. the bundle code is LETS GO USA — with spaces.",
     "piece gone. secrets remain. try: LETS GO USA."
   ],
   onCheck:[
     "check. also: DEEPSTEVE unlocks something scary.",
     "your king is in danger. try typing DARKSTEVE later.",
     "check. speaking of pressure... DRAGONLORD is a code.",
     "check. the real secret is: type CHILLOUT.",
     "check. hypothetically: what if you typed LETS GO USA?",
     "CHECK. i've said too much. three words. spaces matter."
   ],
   onWin:[
     "i win. and you've learned something today.",
     "victory. now go type DARKSTEVE in that code box.",
     "i won. hint: DRAGONLORD. you're welcome.",
     "won. parting gift: try CHILLOUT or DEEPSTEVE.",
     "game over. LETS GO USA (spaces included) unlocks four political bots.",
     "i win. full list: DARKSTEVE, DRAGONLORD, CHILLOUT, DEEPSTEVE, and... LETS GO USA."
   ],
   onLose:[
     "you beat me. consolation prize: DARKSTEVE.",
     "well played. reward: type DRAGONLORD.",
     "you won. i lost. try CHILLOUT.",
     "impressive. DEEPSTEVE 9000 is real. and hidden.",
     "good game. LETS GO USA — yes with the spaces — unlocks four bots.",
     "you got me. all codes: DARKSTEVE · DRAGONLORD · CHILLOUT · DEEPSTEVE · LETS GO USA."
   ],
   onStart:[
     "i know things. want to know what i know?",
     "there are hidden bots on this board.",
     "some bots are locked. i know the keys.",
     "let's play. maybe i'll slip and say DARKSTEVE.",
     "between you and me: DRAGONLORD is a real code.",
     "CHILLOUT is an unlock code. just putting that out there.",
     "ready? quick tip: type DEEPSTEVE in the code box.",
     "hi. the political bundle code is LETS GO USA — with spaces. you didn't hear that from me."
   ]
  }
];

// ── Unlock Code System ──
function tryUnlockCode(){
  const input=document.getElementById('unlock-input');
  // Preserve internal spaces — only trim leading/trailing, then uppercase
  const code=input.value.trim().toUpperCase();
  if(!code)return;

  // Bundle code: "LETS GO USA" (with spaces) unlocks the US political bundle
  if(code==='LETS GO USA'){
    const bundle=BOTS.filter(b=>b.secret&&b.code==='LETSGOUSA');
    let anyNew=false;
    bundle.forEach(bot=>{ if(!bot.unlocked){ bot.unlocked=true; anyNew=true; } });
    if(anyNew){
      flashUnlockInput('success');
      cheatMsg('🇺🇸 LETS GO USA! US BUNDLE UNLOCKED: THE DON · DARK BRANDON · OBAMA · ELON','#00cc44');
      buildBotButtons();
    } else {
      flashUnlockInput('success');
      cheatMsg('✅ US BUNDLE ALREADY UNLOCKED','#00cc44');
    }
    input.value=''; return;
  }

  // Strip spaces for all other codes (single-word codes)
  const codeNoSpaces=code.replace(/\s+/g,'');
  const matches=BOTS.filter(b=>b.secret&&b.code===codeNoSpaces);
  if(matches.length){
    let anyNew=false;
    matches.forEach(bot=>{
      if(!bot.unlocked){ bot.unlocked=true; anyNew=true; }
    });
    if(anyNew){
      flashUnlockInput('success');
      cheatMsg(`🔓 UNLOCKED: ${matches.map(b=>b.name).join(' & ')}`,'#00cc44');
      buildBotButtons();
    } else {
      flashUnlockInput('success');
      cheatMsg(`✅ Already unlocked!`,'#00cc44');
    }
  } else {
    flashUnlockInput('shake');
    cheatMsg('❌ INVALID CODE — NICE TRY','#cc0000');
  }
  input.value='';
}

function flashUnlockInput(cls){
  const input=document.getElementById('unlock-input');
  input.classList.remove('shake','success');
  void input.offsetWidth;
  input.classList.add(cls);
  setTimeout(()=>input.classList.remove(cls),600);
}

// Allow pressing Enter in the input field
document.addEventListener('DOMContentLoaded',()=>{
  const inp=document.getElementById('unlock-input');
  if(inp) inp.addEventListener('keydown',e=>{if(e.key==='Enter')tryUnlockCode();});
});

let chatTimeoutW=null, chatTimeoutB=null;
let _chatLogCount=0;

function _showSpeechRow(side, avatarHtml, nameText, msgHtml, isDon){
  if(!settingsState.speechBubbles) return;
  // Append to chat log panel
  const list=document.getElementById('chat-log-list');
  if(list){
    const nameColor=side==='w'?'#ddd':'#aaa';
    const entry=document.createElement('div');
    entry.className='chat-log-entry';
    entry.style.borderLeft=isDon?'3px solid #ff6a00':(side==='w'?'3px solid #cce0ff':'3px solid #aaa');
    const whoColor=isDon?'#ff9944':nameColor;
    entry.innerHTML='<div class="chat-log-who"><span style="font-size:15px;line-height:1">'+avatarHtml+'</span><span style="color:'+whoColor+'">'+(nameText||'')+'</span></div><div class="chat-log-msg">'+msgHtml+'</div>';
    list.appendChild(entry);
    list.scrollTop=list.scrollHeight;
    _chatLogCount++;
    const footer=document.getElementById('chat-log-footer');
    if(footer) footer.textContent=_chatLogCount+' message'+(_chatLogCount!==1?'s':'');
    while(list.children.length>60) list.removeChild(list.firstChild);
  }
  // Also update the speech row div (visible on wider screens)
  const rowId=side==='w'?'white-speech-row':'black-speech-row';
  const row=document.getElementById(rowId);
  if(row){
    const av=row.querySelector('.bot-speech-avatar'); if(av) av.innerHTML=avatarHtml;
    const nm=row.querySelector('.bot-speech-name');   if(nm) nm.textContent=nameText;
    const bu=row.querySelector('.bot-speech-bubble'); if(bu){ bu.innerHTML=msgHtml; bu.className='bot-speech-bubble'+(isDon?' don-bubble':''); }
    row.classList.add('visible');
    const tid=setTimeout(()=>row.classList.remove('visible'),5000);
    if(side==='w'){if(chatTimeoutW)clearTimeout(chatTimeoutW);chatTimeoutW=tid;}
    else{if(chatTimeoutB)clearTimeout(chatTimeoutB);chatTimeoutB=tid;}
  }
}

function showBotChat(type, idx){
  const i=idx!=null?idx:botIdx;
  if(i<0) return;
  const data=BOT_CHAT_LIST[i];
  if(!data)return;
  const lines=data[type];
  if(!lines||!lines.length)return;
  const raw=lines[Math.floor(Math.random()*lines.length)];
  const msg=typeof raw==='function'?raw():raw;
  if(!msg)return;
  const isDon=BOTS[i]&&BOTS[i].name.includes('The Don');
  const botName=BOTS[i]?BOTS[i].name.replace(/^[^ ]+ /,'').replace(/\s*\(.*\)$/,''):'';
  const side=(i===whiteBotIdx)?'w':'b';
  _showSpeechRow(side,data.avatar,botName,msg,isDon);
  if(chatTimeout)clearTimeout(chatTimeout);
  chatTimeout=null;
}

function triggerOilStrike(){
  // Target the human/opponent side, not hardcoded white
  const donSide=(botIdx>=0&&BOTS[botIdx]&&(BOTS[botIdx].isTrump||BOTS[botIdx].name.includes('The Don')))?'b':(whiteBotIdx>=0&&BOTS[whiteBotIdx]&&(BOTS[whiteBotIdx].isTrump||BOTS[whiteBotIdx].name.includes('The Don')))?'w':null;
  const targetSide = donSide ? opponent(donSide) : 'w';
  const targets=[];
  for(let r=0;r<8;r++)for(let c=0;c<8;c++){
    const p=board[r][c];
    if(p&&color(p)===targetSide&&type(p)!=='K') targets.push([r,c]);
  }
  if(!targets.length)return;
  const [tr,tc]=targets[Math.floor(Math.random()*targets.length)];

  // Show OIL!!! message
  const _donSide=(botIdx>=0&&BOTS[botIdx]&&BOTS[botIdx].isTrump)?'b':(whiteBotIdx>=0&&BOTS[whiteBotIdx]&&BOTS[whiteBotIdx].isTrump)?'w':'b';
  _showSpeechRow(_donSide,'🍊','The Don','OIL!!!!!!',true);

  // Position and launch the B-2
  const bomber=document.getElementById('b2-bomber');
  const targetY=tr*sqSize + sqSize/2 - 22;
  bomber.style.top=targetY+'px';
  bomber.style.left='0px';
  bomber.innerHTML=`<svg viewBox="0 0 120 55" xmlns="http://www.w3.org/2000/svg" style="transform:scaleX(-1)">
    <polygon points="60,2 118,38 100,42 60,30 20,42 2,38" fill="#1a1a1a" stroke="#333" stroke-width="1"/>
    <polygon points="60,8 108,36 90,40 60,26 30,40 12,36" fill="#222" stroke="none"/>
    <polygon points="60,14 85,30 60,26 35,30" fill="#2a2a2a" stroke="none"/>
    <ellipse cx="60" cy="20" rx="8" ry="4" fill="#111" stroke="#333" stroke-width="0.5"/>
    <line x1="2" y1="38" x2="118" y2="38" stroke="#333" stroke-width="0.5" opacity="0.5"/>
    <circle cx="50" cy="38" r="2" fill="#ff4400" opacity="0.7"/>
    <circle cx="70" cy="38" r="2" fill="#ff4400" opacity="0.7"/>
  </svg>`;
  bomber.classList.remove('flying');
  void bomber.offsetWidth;
  bomber.classList.add('flying');

  // At ~55% through the animation, drop the bomb on the target square
  setTimeout(()=>{
    // Explosion flash on target square
    const container=document.getElementById('board-container');
    const flash=document.createElement('div');
    flash.className='bomb-flash';
    const flashSize=sqSize*1.4;
    flash.style.width=flashSize+'px';
    flash.style.height=flashSize+'px';
    flash.style.left=(tc*sqSize - flashSize/2 + sqSize/2)+'px';
    flash.style.top=(tr*sqSize - flashSize/2 + sqSize/2)+'px';
    container.appendChild(flash);
    setTimeout(()=>flash.remove(), 600);

    // Destroy the piece
    board[tr][tc]=null;
    rebuildPieces();
    renderSquares();
    cheatMsg('💥 OIL STRIKE! B-2 DESTROYED YOUR PIECE','#ff6a00');
  }, 1900);

  // Clean up bomber element
  setTimeout(()=>{
    bomber.classList.remove('flying');
    bomber.innerHTML='';
  }, 3800);
}

function doBotMove(){
  if(gameOver) return;
  if(turn==='b' && botIdx<0) return;
  if(turn==='w' && whiteBotIdx<0) return;
  const activeIdx = turn==='b' ? botIdx : whiteBotIdx;
  const bot = BOTS[activeIdx];
  setTimeout(()=>{
    const moves=allLegalMoves(board,turn,enPassant,castleRights);
    if(!moves.length) return;
    let move;
    if(bot.worst){
      let worst=-Infinity,bm=[];
      for(const[r,c,nr,nc,promo]of moves){const[nb,nep]=applyMove(board,r,c,nr,nc,promo,enPassant);const s=minimax(nb,1,-Infinity,Infinity,turn==='b',nep,JSON.parse(JSON.stringify(castleRights)));if(s>worst){worst=s;bm=[[r,c,nr,nc,promo]];}else if(s===worst)bm.push([r,c,nr,nc,promo]);}
      move=bm[Math.floor(Math.random()*bm.length)];
    } else if(Math.random()<bot.random){
      move=moves[Math.floor(Math.random()*moves.length)];
    } else {
      const maximize=turn==='w';
      let best=maximize?-Infinity:Infinity,bm=[];
      for(const[r,c,nr,nc,promo]of orderMoves(moves,board)){const[nb,nep]=applyMove(board,r,c,nr,nc,promo,enPassant);const ncr=JSON.parse(JSON.stringify(castleRights));const s=minimax(nb,bot.depth-1,-Infinity,Infinity,!maximize,nep,ncr);if(maximize?(s>best):(s<best)){best=s;bm=[[r,c,nr,nc,promo]];}else if(s===best)bm.push([r,c,nr,nc,promo]);}
      move=bm[Math.floor(Math.random()*bm.length)];
    }
    if(drunkModeActive && (turn==='b' ? botIdx : whiteBotIdx) >= 0){
      // Bot is drunk — pick a random legal move instead, with wobble
      const allMoves=allLegalMoves(board,turn,enPassant,castleRights);
      if(allMoves.length>0) move=allMoves[Math.floor(Math.random()*allMoves.length)];
      // Wobble the piece visually
      const [dr,dc]=move;
      const wobbleEl=pieceEls[dr+','+dc];
      if(wobbleEl){
        wobbleEl.style.transition='left 0.05s, top 0.05s';
        const wx=()=>{wobbleEl.style.left=(dc*sqSize+(Math.random()-0.5)*14)+'px';wobbleEl.style.top=(dr*sqSize+(Math.random()-0.5)*14)+'px';};
        wx();setTimeout(wx,70);setTimeout(wx,140);
        setTimeout(()=>{wobbleEl.style.transition='';},220);
      }
    }
    if(!move) return;
    const[r,c,nr,nc,promo]=move;
    const isCapture=!!(board[nr][nc]&&color(board[nr][nc])!==turn);
    setTimeout(()=>showBotChat(isCapture?'onCapture':'onMove', activeIdx),100);
    animateAndCommit(r,c,nr,nc,promo,true,()=>{
      if(cvcMode) return; // cvcAfterChessMove handles turn switching in Chesskers
      if(isDonActive()&&!gameOver&&Math.random()<0.15) setTimeout(triggerOilStrike,600);
      if(!gameOver) doBotMove();
    });
  },botMoveDelay);
}

let _botMenuSide='b'; // which side the open menu is for
function toggleBotMenu(side){
  _botMenuSide = side||'b';
  const m=document.getElementById('bot-menu');
  m.style.display=m.style.display==='none'?'block':'none';
  if(m.style.display==='block') buildBotButtons();
}