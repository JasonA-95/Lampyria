// AFFICHAGE : écran de préparation, dessin de la grille, boutons, clics. Les règles sont dans moteur.js.
const cv=document.getElementById('c'),g=cv.getContext('2d'),$=i=>document.getElementById(i);
const MSG={loin:'Trop loin : déplacement limité par tes PM, sans traverser les obstacles.',cible:'Cible invalide (portée, ligne de vue ou case vide).',cout:'Pas assez de PA, ou sort en recharge.'};
const cfg={classe:'porte',cap:5,lueurs:['gourmande','peureuse']};
let C,tw,th,ox,oy,W,H,mode,busy;
const msg=t=>$('msgEl').textContent=t,say=k=>{const r=DATA.repliques[k];$('sayEl').innerHTML='<b>'+r[0]+'</b> : '+r[1]};
const sum=()=>cfg.lueurs.reduce((a,k)=>a+DATA.lueurs[k].t,0);
function chip(p,t,sub,on,dis,fn){const b=document.createElement('button');b.innerHTML=t+(sub?'<small>'+sub+'</small>':'');b.className=on?'on':'';b.disabled=dis;b.onclick=fn;$(p).appendChild(b)}
function showSetup(){$('game').style.display='none';const s=$('setup');s.style.display='block';
s.innerHTML='<h2>Classe</h2><div class="row" id="r1"></div><h2>Capacité de la lanterne</h2><div class="row" id="r2"></div><h2>Lueurs équipées : '+sum()+'/'+cfg.cap+' (4 maximum)</h2><div class="row" id="r3"></div><div class="row" id="r4"></div>';
for(const k in DATA.classes){const c=DATA.classes[k];chip('r1',c.e+' '+c.n,c.info,cfg.classe==k,false,()=>{cfg.classe=k;showSetup()})}
[[5,'fin acte 1'],[8,'milieu de jeu'],[12,'fin de jeu']].forEach(([v,l])=>chip('r2',''+v,l,cfg.cap==v,false,()=>{cfg.cap=v;while(sum()>v)cfg.lueurs.pop();showSetup()}));
for(const k in DATA.lueurs){const l=DATA.lueurs[k],on=cfg.lueurs.includes(k);
chip('r3',l.n,'taille '+l.t+' : '+l.sort.n,on,!on&&(sum()+l.t>cfg.cap||cfg.lueurs.length>=4),()=>{cfg.lueurs=on?cfg.lueurs.filter(z=>z!=k):[...cfg.lueurs,k];showSetup()})}
chip('r4','Commencer le combat','',false,false,()=>{s.style.display='none';$('game').style.display='block';init()})}
function size(){const N=DATA.taille;W=Math.min(innerWidth-16,620);tw=W/N;th=tw/2;ox=W/2;oy=th*1.5;H=N*th+th*3;const d=devicePixelRatio||1;
cv.width=Math.round(W*d);cv.height=Math.round(H*d);cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(d,0,0,d,0,0)}
function init(){size();C=new Combat(DATA,cfg);mode='move';busy=false;say('debut');
msg('Touche une case éclairée pour te déplacer, ou choisis un sort puis une cible.');ui();draw()}
cv.onclick=e=>{if(busy||C.result)return;const r=cv.getBoundingClientRect(),a=(e.clientX-r.left-ox)/(tw/2),b=(e.clientY-r.top-oy)/(th/2);
const x=Math.round((a+b)/2),y=Math.round((b-a)/2);if(x<0||y<0||x>=DATA.taille||y>=DATA.taille)return;act(x,y)};
function act(x,y){let r;if(mode=='move')r=C.move(x,y);else{r=C.cast(mode,x,y);if(r.ok)mode='move'}
if(!r.ok){msg(MSG[r.tag]);return}
if(r.tag)say(r.tag);
const k=r.hit?r.hit.filter(f=>f.hp<=0).length:0;
msg(r.hit&&r.hit.length?'-'+r.dmg+' PV sur '+r.hit.length+' ennemi(s)'+(k?', '+k+' vaincu(s).':'.'):'');
if(C.result=='win'){msg('Victoire ! Le chemin vers la forêt est libre.');say('victoire')}
ui();draw()}
async function endTurn(){if(busy||C.result)return;busy=true;mode='move';ui();
for(const f of C.foes){if(f.hp<=0)continue;await new Promise(r=>setTimeout(r,400));const d=C.foeTurn(f);
if(d<0)msg(f.n+' dort et passe son tour.');else if(d){msg(f.n+' te frappe : -'+d+' PV.');say('coup')}draw();ui();
if(C.result=='lose'){msg("Défaite. Dans le jeu complet : retour au village, sans perte d'objets.");say('defaite');busy=false;ui();draw();return}}
C.newTurn();busy=false;msg(C.pm==0?'À toi de jouer (tu ne peux pas te déplacer ce tour).':'À toi de jouer.');ui();draw()}
function mk(t,sub,on,fn,dis){const b=document.createElement('button');b.innerHTML=t+(sub?'<small>'+sub+'</small>':'');b.className=on?'on':'';b.disabled=dis;b.onclick=fn;$('bar').appendChild(b)}
function ui(){const h=C.hero;$('hud').innerHTML='PV <b>'+h.hp+'/'+h.max+'</b> PA <b>'+C.pa+'</b> PM <b>'+C.pm+'</b> Tour <b>'+C.turn+'</b>'+(h.rage?' <b>RAGE</b>':'')+(h.mur?' <b>MUR</b>':'');
$('bar').innerHTML='';const off=busy||C.result;
mk('Se déplacer',C.PM+' PM par tour',mode=='move',()=>{mode='move';ui();draw()},off);
C.S.forEach((s,i)=>mk(s.n,s.pa+' PA'+(C.cd[i]?', recharge '+C.cd[i]:''),mode===i,()=>{mode=i;msg('Touche une case en surbrillance bleue.');ui();draw()},off||C.pa<s.pa||C.cd[i]>0));
mk('Fin du tour','',false,endTurn,off);mk('Équipement','classe et Lueurs',false,showSetup,busy)}
const col=l=>'rgb('+[38+82*l,32+52*l,51-3*l].map(Math.round)+')';
function dia(cx,cy,f){g.beginPath();g.moveTo(cx,cy-th/2);g.lineTo(cx+tw/2,cy);g.lineTo(cx,cy+th/2);g.lineTo(cx-tw/2,cy);g.closePath();g.fillStyle=f;g.fill();g.strokeStyle='rgba(0,0,0,.25)';g.stroke()}
function draw(){const N=DATA.taille,h=C.hero;g.clearRect(0,0,W,H);
const rc=mode=='move'&&!busy&&!C.result?C.reach():{},rs=new Set(mode!='move'&&!C.result?C.ranged(mode).map(t=>t.join(',')):[]);
g.textAlign='center';g.textBaseline='middle';g.font=Math.round(tw*.7)+'px serif';
for(let s=0;s<=2*N-2;s++)for(let x=0;x<N;x++){const y=s-x;if(y<0||y>=N)continue;const k=x+','+y;
const cx=(x-y)*tw/2+ox,cy=(x+y)*th/2+oy,l=Math.max(0,1-Math.hypot(x-h.x,y-h.y)/6.5)*((x+y)%2?.9:1);
dia(cx,cy,col(l));if(rc[k]>0)dia(cx,cy,'rgba(255,180,84,.32)');if(rs.has(k))dia(cx,cy,'rgba(106,169,255,.45)');
if(C.rocks.has(k)){g.fillStyle='#fff';g.fillText('🪨',cx,cy-th*.15);continue}
const u=C.at(x,y);if(u){g.fillStyle='#fff';g.fillText(u.sleep?'💤':u.e,cx,cy-th*.3);
g.fillStyle='#000a';g.fillRect(cx-tw*.25,cy-th*.95,tw*.5,4);g.fillStyle=u===h?'#7fd18b':'#e5564a';g.fillRect(cx-tw*.25,cy-th*.95,tw*.5*u.hp/u.max,4)}}
const hx=(h.x-h.y)*tw/2+ox,hy=(h.x+h.y)*th/2+oy,gr=g.createRadialGradient(hx,hy,0,hx,hy,tw*3);
gr.addColorStop(0,'rgba(255,180,84,.28)');gr.addColorStop(1,'rgba(255,180,84,0)');
g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over'}
addEventListener('resize',()=>{if(C&&$('game').style.display!='none'){size();draw()}});showSetup();
