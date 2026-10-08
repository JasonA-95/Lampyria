// AFFICHAGE : dessin de la grille, boutons, clics. Il utilise le moteur mais ne contient aucune règle.
const cv=document.getElementById('c'),g=cv.getContext('2d'),$=i=>document.getElementById(i);
const MSG={loin:'Trop loin : 3 PM par tour, sans traverser les obstacles.',cible:'Cible invalide (portée ou ligne de vue).',cout:'Pas assez de PA, ou sort en recharge.'};
let C,tw,th,ox,oy,W,H,mode,busy;
const msg=t=>$('msgEl').textContent=t,say=k=>{const r=DATA.repliques[k];$('sayEl').innerHTML='<b>'+r[0]+'</b> : '+r[1]};
function size(){const N=DATA.taille;W=Math.min(innerWidth-16,620);tw=W/N;th=tw/2;ox=W/2;oy=th*1.5;H=N*th+th*3;const d=devicePixelRatio||1;
cv.width=Math.round(W*d);cv.height=Math.round(H*d);cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(d,0,0,d,0,0)}
function init(){C=new Combat(DATA);mode='move';busy=false;say('debut');
msg('Touche une case éclairée pour te déplacer, ou choisis un sort puis une cible.');ui();draw()}
cv.onclick=e=>{if(busy||C.result)return;const r=cv.getBoundingClientRect(),a=(e.clientX-r.left-ox)/(tw/2),b=(e.clientY-r.top-oy)/(th/2);
const x=Math.round((a+b)/2),y=Math.round((b-a)/2);if(x<0||y<0||x>=DATA.taille||y>=DATA.taille)return;act(x,y)};
function act(x,y){let r;if(mode=='move')r=C.move(x,y);else{r=C.cast(mode,x,y);if(r.ok)mode='move'}
if(!r.ok){msg(MSG[r.tag]);return}
if(r.tag=='soin'||r.tag=='fuite')say(r.tag);
msg(r.target?r.target.n+(r.target.hp<=0?' est vaincu.':' perd '+r.dmg+' PV.'):'');
if(C.result=='win'){msg('Victoire ! Le chemin vers la forêt est libre.');say('victoire')}
ui();draw()}
async function endTurn(){if(busy||C.result)return;busy=true;mode='move';ui();
for(const f of C.foes){if(f.hp<=0)continue;await new Promise(r=>setTimeout(r,400));const d=C.foeTurn(f);
if(d){msg(f.n+' te frappe : -'+d+' PV.');say('coup')}draw();ui();
if(C.result=='lose'){msg("Défaite. Dans le jeu complet : retour au village, sans perte d'objets.");say('defaite');busy=false;ui();draw();return}}
C.newTurn();busy=false;msg('À toi de jouer.');ui();draw()}
function mk(t,sub,on,fn,dis){const b=document.createElement('button');b.innerHTML=t+(sub?'<small>'+sub+'</small>':'');b.className=on?'on':'';b.disabled=dis;b.onclick=fn;$('bar').appendChild(b)}
function ui(){const h=C.hero;$('hud').innerHTML='PV <b>'+h.hp+'/'+h.max+'</b> PA <b>'+C.pa+'</b> PM <b>'+C.pm+'</b> Tour <b>'+C.turn+'</b> '+DATA.lanterne;
$('bar').innerHTML='';const off=busy||C.result;
mk('Se déplacer',C.PM+' PM par tour',mode=='move',()=>{mode='move';ui();draw()},off);
C.S.forEach((s,i)=>mk(s.n,s.pa+' PA'+(C.cd[i]?', recharge '+C.cd[i]:''),mode===i,()=>{mode=i;msg('Touche une case en surbrillance bleue.');ui();draw()},off||C.pa<s.pa||C.cd[i]>0));
mk('Fin du tour','',false,endTurn,off);mk('Recommencer','',false,init,false)}
const col=l=>'rgb('+[38+82*l,32+52*l,51-3*l].map(Math.round)+')';
function dia(cx,cy,f){g.beginPath();g.moveTo(cx,cy-th/2);g.lineTo(cx+tw/2,cy);g.lineTo(cx,cy+th/2);g.lineTo(cx-tw/2,cy);g.closePath();g.fillStyle=f;g.fill();g.strokeStyle='rgba(0,0,0,.25)';g.stroke()}
function draw(){const N=DATA.taille,h=C.hero;g.clearRect(0,0,W,H);
const rc=mode=='move'&&!busy&&!C.result?C.reach():{},rs=new Set(mode!='move'&&!C.result?C.ranged(mode).map(t=>t.join(',')):[]);
g.textAlign='center';g.textBaseline='middle';g.font=Math.round(tw*.7)+'px serif';
for(let s=0;s<=2*N-2;s++)for(let x=0;x<N;x++){const y=s-x;if(y<0||y>=N)continue;const k=x+','+y;
const cx=(x-y)*tw/2+ox,cy=(x+y)*th/2+oy,l=Math.max(0,1-Math.hypot(x-h.x,y-h.y)/6.5)*((x+y)%2?.9:1);
dia(cx,cy,col(l));if(rc[k]>0)dia(cx,cy,'rgba(255,180,84,.32)');if(rs.has(k))dia(cx,cy,'rgba(106,169,255,.45)');
if(C.rocks.has(k)){g.fillStyle='#fff';g.fillText('🪨',cx,cy-th*.15);continue}
const u=C.at(x,y);if(u){g.fillStyle='#fff';g.fillText(u.e,cx,cy-th*.3);
g.fillStyle='#000a';g.fillRect(cx-tw*.25,cy-th*.95,tw*.5,4);g.fillStyle=u===h?'#7fd18b':'#e5564a';g.fillRect(cx-tw*.25,cy-th*.95,tw*.5*u.hp/u.max,4)}}
const hx=(h.x-h.y)*tw/2+ox,hy=(h.x+h.y)*th/2+oy,gr=g.createRadialGradient(hx,hy,0,hx,hy,tw*3);
gr.addColorStop(0,'rgba(255,180,84,.28)');gr.addColorStop(1,'rgba(255,180,84,0)');
g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over'}
addEventListener('resize',()=>{size();draw()});size();init();
