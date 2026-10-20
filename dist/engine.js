// Motor didáctico independiente. Mismo principio de Fourier que CirculArte.
// No necesita imágenes, fuentes de emoji ni servicios externos.
export const TAU = Math.PI * 2;
const polygon = (points) => points.map(([x,y]) => ({x,y}));
const parametric = (f,n=240) => Array.from({length:n},(_,i) => {const [x,y]=f(i/n*TAU);return {x,y};});
export const FIGURES = [
  {id:'corazon',name:'Corazón',hint:'Suele representar un sentimiento.',path:parametric(t=>[16*Math.sin(t)**3,-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))])},
  {id:'estrella',name:'Estrella',hint:'La puedes encontrar en el cielo.',path:polygon(Array.from({length:10},(_,i)=>{const t=i/10*TAU-Math.PI/2,r=i%2?45:100;return [Math.cos(t)*r,Math.sin(t)*r];}))},
  {id:'luna',name:'Luna',hint:'Cambia de aspecto a lo largo del mes.',path:polygon([...Array.from({length:150},(_,i)=>{const t=-Math.PI/2-i/149*Math.PI;return [100*Math.cos(t),100*Math.sin(t)];}),...Array.from({length:150},(_,i)=>{const t=Math.PI/2+i/149*Math.PI;return [45+Math.cos(t)*65,100*Math.sin(t)];})])},
  {id:'rayo',name:'Rayo',hint:'Aparece en una tormenta.',path:polygon([[20,-110],[-75,15],[-12,15],[-35,110],[80,-25],[15,-25]])},
  {id:'casa',name:'Casa',hint:'Un lugar para vivir.',path:polygon([[-100,-10],[0,-100],[100,-10],[70,-10],[70,95],[20,95],[20,25],[-20,25],[-20,95],[-70,95],[-70,-10]])},
  {id:'pez',name:'Pez',hint:'Su hogar está bajo el agua.',path:polygon([[-65,0],[-35,-45],[30,-60],[90,-28],[110,0],[90,28],[30,60],[-35,45],[-65,0],[-110,55],[-110,-55]])},
  {id:'arbol',name:'Árbol',hint:'Tiene raíces, pero no camina.',path:polygon([[0,-115],[60,-45],[32,-45],[85,20],[48,20],[105,82],[20,82],[20,115],[-20,115],[-20,82],[-105,82],[-48,20],[-85,20],[-32,-45],[-60,-45]])},
  {id:'cohete',name:'Cohete',hint:'Se prepara para despegar.',path:polygon([[0,-120],[35,-70],[40,20],[80,65],[80,100],[35,75],[22,75],[12,115],[0,92],[-12,115],[-22,75],[-35,75],[-80,100],[-80,65],[-40,20],[-35,-70]])},
  {id:'corona',name:'Corona',hint:'Un símbolo de la realeza.',path:polygon([[-100,-65],[-45,-5],[0,-100],[45,-5],[100,-65],[75,90],[-75,90]])},
  {id:'mariposa',name:'Mariposa',hint:'Empieza su vida como una oruga.',path:parametric(t=>{const r= Math.exp(Math.cos(t))-2*Math.cos(4*t)-Math.sin(t/12)**5;return [Math.sin(t)*r,-Math.cos(t)*r];})},
];

// Igualar distancias evita que el lápiz acelere en los segmentos largos.
export function remuestrear(points,count=512) {
  const lengths=[0];
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];lengths.push(lengths.at(-1)+Math.hypot(b.x-a.x,b.y-a.y));}
  const result=[];let segment=0;
  for(let j=0;j<count;j++){
    const distance=j/count*lengths.at(-1);
    while(segment<points.length-1 && lengths[segment+1]<distance) segment++;
    const a=points[segment],b=points[(segment+1)%points.length],span=lengths[segment+1]-lengths[segment];
    const ratio=span?(distance-lengths[segment])/span:0;
    result.push({x:a.x+(b.x-a.x)*ratio,y:a.y+(b.y-a.y)*ratio});
  }
  const minX=Math.min(...result.map(p=>p.x)),maxX=Math.max(...result.map(p=>p.x));
  const minY=Math.min(...result.map(p=>p.y)),maxY=Math.max(...result.map(p=>p.y));
  const scale=300/Math.max(maxX-minX,maxY-minY,1);
  return result.map(p=>({x:(p.x-(minX+maxX)/2)*scale,y:(p.y-(minY+maxY)/2)*scale}));
}

// Transformada discreta de Fourier compleja: un coeficiente = un círculo.
export function fourier(points,terms=60) {
  const n=points.length,coefficients=[];
  for(let j=0;j<terms;j++){
    const frequency=j===0?0:Math.ceil(j/2)*(j%2?1:-1);let re=0,im=0;
    for(let k=0;k<n;k++){
      const angle=TAU*frequency*k/n,c=Math.cos(angle),s=Math.sin(angle);
      re+=points[k].x*c+points[k].y*s;im+=points[k].y*c-points[k].x*s;
    }
    re/=n;im/=n;coefficients.push({frequency,radius:Math.hypot(re,im),phase:Math.atan2(im,re)});
  }
  return coefficients.sort((a,b)=>b.radius-a.radius);
}

export function penAt(circles,t) {
  let x=0,y=0;
  for(const c of circles){x+=c.radius*Math.cos(c.frequency*t+c.phase);y+=c.radius*Math.sin(c.frequency*t+c.phase);}
  return {x,y};
}
export function makeDrawing(figure){
  const circles=fourier(remuestrear(figure.path));
  const curve=Array.from({length:721},(_,i)=>penAt(circles,i/720*TAU));
  return {circles,curve};
}
export function roundPoints(seconds,errors=0,hint=false){return Math.max(100,Math.round(1000-seconds*40)-errors*100-(hint?150:0));}
export function shuffled(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
