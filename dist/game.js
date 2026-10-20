import {FIGURES,TAU,makeDrawing,roundPoints,shuffled} from './engine.js';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
const ROUND_SECONDS=18,ROUND_COUNT=5;
// Toda la partida vive aquí. El render y la puntuación leen el mismo estado.
const state={phase:'ready',round:0,total:0,elapsed:0,errors:0,hint:false,deck:[],options:[],selected:new Set(),correct:0};
let drawing=makeDrawing(FIGURES[0]),lastTime=0,lastDebug=0,best=0;
try{best=Number(localStorage.getItem('circularte-guess-best'))||0;}catch{}
const format=n=>String(n).padStart(4,'0');
$('best').textContent=best?`${best.toLocaleString('es')} pts`:'Por descubrir';
function updateStats(){
  $('round').innerHTML=`${String(state.round+1).padStart(2,'0')} <small>/ 05</small>`;
  $('score').textContent=format(state.total);
  $('timer').innerHTML=`${Math.ceil(Math.max(0,ROUND_SECONDS-state.elapsed))}<small>s</small>`;
  $('time-fill').style.width=`${Math.max(0,1-state.elapsed/ROUND_SECONDS)*100}%`;
  $('time-fill').style.background=state.elapsed>13?'#ed714f':'#a7e4c7';
}
function feedback(text,kind=''){$('feedback').textContent=text;$('feedback').className=`feedback ${kind}`;}
function paintAnswers(){
  $('answers').replaceChildren();
  const choices=state.phase==='ready'?['Primera opción','Segunda opción','Tercera opción','Cuarta opción']:state.options.map(f=>f.name);
  choices.forEach((name,i)=>{
    const button=document.createElement('button');button.className='answer';
    const key=document.createElement('span');key.textContent=i+1;button.append(key,document.createTextNode(name));
    button.disabled=state.phase!=='playing'||state.selected.has(i);
    if(state.phase==='reveal'&&state.options[i].id===state.deck[state.round].id)button.classList.add('correct');
    else if(state.selected.has(i))button.classList.add('wrong');
    button.addEventListener('click',()=>answer(i));$('answers').append(button);
  });
}
function begin(){state.deck=shuffled(FIGURES).slice(0,ROUND_COUNT);state.round=0;state.total=0;state.correct=0;startRound();}
function startRound(){
  const target=state.deck[state.round];
  Object.assign(state,{phase:'playing',elapsed:0,errors:0,hint:false,selected:new Set()});
  state.options=shuffled([target,...shuffled(FIGURES.filter(f=>f.id!==target.id)).slice(0,3)]);
  drawing=makeDrawing(target);lastTime=performance.now();
  $('overlay').hidden=true;$('next').hidden=true;$('pause').disabled=false;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','Pausar juego');
  $('hint').disabled=false;$('question').textContent='¿Qué figura se está dibujando?';
  $('canvas-tag').textContent='MIRA EL TRAZO. CONFÍA EN TU INTUICIÓN.';
  feedback('Hasta 1.000 puntos. Cada segundo cuenta.');updateStats();paintAnswers();
}
function answer(index){
  if(state.phase!=='playing'||state.selected.has(index))return;
  if(state.options[index].id===state.deck[state.round].id){
    const points=roundPoints(state.elapsed,state.errors,state.hint);state.total+=points;state.correct++;
    endRound(`¡Es ${state.deck[state.round].name.toLowerCase()}! +${points} puntos · ${state.elapsed.toFixed(1)} s`,'success');
  }else{
    state.selected.add(index);state.errors++;
    feedback('Esa no era. −100 puntos de esta ronda. ¡Todavía puedes acertar!','error');paintAnswers();
  }
}
function endRound(message,kind){
  state.phase='reveal';$('hint').disabled=true;$('pause').disabled=true;
  $('next').hidden=false;$('next').innerHTML=state.round===ROUND_COUNT-1?'Ver mi resultado <span>→</span>':'Siguiente figura <span>→</span>';
  $('canvas-tag').textContent=state.deck[state.round].name.toUpperCase();
  feedback(message,kind);updateStats();paintAnswers();$('next').focus({preventScroll:true});
}
function useHint(){
  if(state.phase!=='playing'||state.hint)return;
  state.hint=true;$('hint').disabled=true;
  const wrong=state.options.findIndex((f,i)=>f.id!==state.deck[state.round].id&&!state.selected.has(i));
  if(wrong>=0)state.selected.add(wrong);
  feedback(`${state.deck[state.round].hint} Pista: −150 puntos.`);paintAnswers();
}
function showOverlay(content){$('overlay-content').innerHTML=content;$('overlay').hidden=false;}
function pause(){
  if(state.phase==='playing'){
    state.phase='paused';$('hint').disabled=true;paintAnswers();$('pause').textContent='▶';$('pause').setAttribute('aria-label','Reanudar juego');
    showOverlay('<span class="overlay-kicker">UN RESPIRO</span><h2>El reloj espera.</h2><p>Tu partida sigue justo donde la dejaste.</p><button class="primary" id="resume">Seguir jugando <span>→</span></button>');
    $('resume').addEventListener('click',pause);$('resume').focus({preventScroll:true});
  }else if(state.phase==='paused'){
    state.phase='playing';lastTime=performance.now();$('overlay').hidden=true;$('hint').disabled=state.hint;paintAnswers();$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','Pausar juego');
  }
}
function finish(){
  state.phase='finished';const newBest=state.total>best;
  if(newBest){best=state.total;try{localStorage.setItem('circularte-guess-best',String(best));}catch{}}
  $('best').textContent=`${best.toLocaleString('es')} pts`; $('next').hidden=true;
  showOverlay(`<span class="overlay-kicker">${newBest?'✦ NUEVA MEJOR MARCA':'PARTIDA COMPLETADA'}</span><h2>${state.total.toLocaleString('es')}<br><span style="font-size:20px">puntos de intuición</span></h2><p>${state.correct} de 5 figuras adivinadas.<br>${state.total>=3500?'¡Tienes un ojo increíble!':'Cada partida entrena tu mirada.'}</p><button class="primary" id="again">Volver a jugar <span>↺</span></button>`);
  $('again').addEventListener('click',begin);$('again').focus({preventScroll:true});
}
// Se dibuja la suma de círculos y solo la parte recorrida del contorno.
function draw(now){
  ctx.clearRect(0,0,720,520);ctx.save();ctx.translate(360,270);
  const demo=state.phase==='ready',complete=state.phase==='reveal'||state.phase==='finished';
  const progress=complete?1:demo?.28:Math.min(1,state.elapsed/(ROUND_SECONDS*.86));
  const t=(demo?now/14000%1:progress)*TAU;
  let x=0,y=0;
  ctx.lineWidth=1;
  for(const circle of drawing.circles){
    const nx=x+circle.radius*Math.cos(circle.frequency*t+circle.phase),ny=y+circle.radius*Math.sin(circle.frequency*t+circle.phase);
    if(circle.radius>1.2){ctx.strokeStyle=demo?'#a7e4c73b':'#a7e4c729';ctx.beginPath();ctx.arc(x,y,circle.radius,0,TAU);ctx.stroke();ctx.strokeStyle='#b8c4d53d';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(nx,ny);ctx.stroke();}
    x=nx;y=ny;
  }
  const limit=Math.floor(progress*720);
  ctx.strokeStyle='#a7e4c7';ctx.lineWidth=3;ctx.lineJoin='round';ctx.lineCap='round';
  ctx.shadowColor='#a7e4c7';ctx.shadowBlur=10;ctx.beginPath();
  for(let i=0;i<=limit;i++){const p=drawing.curve[i];i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}
  if(!demo&&!complete)ctx.lineTo(x,y);ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle='#ed714f';ctx.beginPath();ctx.arc(x,y,5,0,TAU);ctx.fill();ctx.restore();
  $('percent').textContent=`${Math.round(progress*100)} %`;
  $('drawing-status').textContent=complete?'Figura revelada':state.phase==='ready'?'60 círculos, infinitas posibilidades':'60 círculos en movimiento';
}
function tick(now){
  if(state.phase==='playing'){
    state.elapsed=Math.min(ROUND_SECONDS,state.elapsed+(now-lastTime)/1000);updateStats();
    if(state.elapsed>=ROUND_SECONDS)endRound(`Se acabó el tiempo. Era ${state.deck[state.round].name.toLowerCase()}. +0 puntos.`,'error');
  }
  lastTime=now;draw(now);
  if(now-lastDebug>200){$('debug').textContent=JSON.stringify({estado:state.phase,ronda:state.round+1,segundos:+state.elapsed.toFixed(1),errores:state.errors,pista:state.hint,puntos:state.total});lastDebug=now;}
  requestAnimationFrame(tick);
}
function showHow(){const section=$('how');section.hidden=false;section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
$('start').addEventListener('click',begin);$('restart').addEventListener('click',begin);$('hint').addEventListener('click',useHint);$('pause').addEventListener('click',pause);
$('next').addEventListener('click',()=>{if(state.phase!=='reveal')return;if(state.round===ROUND_COUNT-1)finish();else{state.round++;startRound();}});
$('explain').addEventListener('click',showHow);$('open-code').addEventListener('click',showHow);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.phase==='playing')pause();});
document.addEventListener('keydown',event=>{
  if(event.repeat||event.ctrlKey||event.metaKey||event.altKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
  if(/^[1-4]$/.test(event.key)){event.preventDefault();answer(Number(event.key)-1);}
  if(event.key==='Escape')pause();
});
paintAnswers();updateStats();requestAnimationFrame(tick);
