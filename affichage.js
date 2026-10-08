// AFFICHAGE : écran de préparation, dessin de la grille, boutons, clics. Les règles sont dans moteur.js.
const cv=document.getElementById('c'),g=cv.getContext('2d'),$=i=>document.getElementById(i);
const MSG={loin:'Trop loin : déplacement limité par tes PM, sans traverser les obstacles.',cible:'Cible invalide (portée, ligne de vue ou case vide).',cout:'Pas assez de PA, ou sort en recharge.'};
const cfg={classe:'porte',cap:5,lueurs:['gourmande','peureuse']};
let C,tw,th,ox,oy,W,H,mode,busy,hint='',tt;
const msg=t=>$('msgEl').textContent=t,say=k=>{const r=DATA.repliques[k];$('sayEl').innerHTML='<b>'+r[0]+'</b> : '+r[1]};
const sum=()=>cfg.lueurs.reduce((a,k)=>a+DATA.lueurs[k].t,0);
const rg=r=>r[0]==r[1]?r[0]:r[0]+'-'+r[1];
function descr(s){const a=[s.pa+' PA, portée '+rg(s.r)+(s.los?', ligne de vue':'')];
if(s.dmg)a.push('inflige '+s.dmg+' dégâts'+(s.aoe!=null?' en zone (rayon '+s.aoe+')':'')+(s.drain?' et te soigne (plus ta vie est basse, plus tu récupères)':''));
if(s.heal)a.push('soigne '+s.heal+' PV');if(s.tp)a.push('te téléporte sur une case libre');
if(s.rage)a.push('ta prochaine attaque inflige le double, mais -1 PM au tour suivant');
if(s.mur)a.push('dégâts subis réduits de moitié pendant 2 tours, mais tu ne peux pas bouger');
if(s.sleep)a.push('endort la cible 1 tour (réveil si elle subit des dégâts)');
if(s.swap)a.push('échange ta place avec la cible');if(s.cd)a.push('recharge '+s.cd+' tours');return s.n+' : '+a.join(', ')+'.'}
const fx=[];let fxOn=false;
function pop(u,t,c){fx.push({x:u.x,y:u.y,t,c,t0:performance.now()});if(!fxOn){fxOn=true;(function L(){draw();if(fx.length)requestAnimationFrame(L);else fxOn=false})()}}
function drawFx(){const now=performance.now();for(let i=fx.length-1;i>=0;i--){const f=fx[i],a=(now-f.t0)/1100;if(a>=1){fx.splice(i,1);continue}
const cx=(f.x-f.y)*tw/2+ox,cy=(f.x+f.y)*th/2+oy-th*(1+a*1.4);g.globalAlpha=1-a*a;g.font='bold '+Math.round(tw*.55)+'px Georgia,serif';
g.lineWidth=4;g.strokeStyle='#120d1a';g.strokeText(f.t,cx,cy);g.fillStyle=f.c;g.fillText(f.t,cx,cy);g.globalAlpha=1}}
function chip(p,t,sub,on,dis,fn){const b=document.createElement('button');b.innerHTML=t+(sub?'<small>'+sub+'</small>':'');b.className=on?'on':'';b.disabled=dis;b.onclick=fn;$(p).appendChild(b);return b}
function showSetup(){$('game').classList.add('hide');const s=$('setup');s.style.display='block';
s.innerHTML='<section><h2>Classe</h2><div class="row" id="r1"></div><h2>Capacité de la lanterne</h2><div class="row" id="r2"></div></section><section><h2>Lueurs équipées : '+sum()+'/'+cfg.cap+' (4 maximum)</h2><div class="row" id="r3"></div><p id="hint">'+(hint||'Touche une classe ou une Lueur pour voir ses sorts.')+'</p><div class="row" id="r4"></div></section>';
for(const k in DATA.classes){const c=DATA.classes[k];chip('r1',c.e+' '+c.n,c.info,cfg.classe==k,false,()=>{cfg.classe=k;hint=c.sorts.map(descr).join(' ');showSetup()})}
[[5,'fin acte 1'],[8,'milieu de jeu'],[12,'fin de jeu']].forEach(([v,l])=>chip('r2',''+v,l,cfg.cap==v,false,()=>{cfg.cap=v;while(sum()>v)cfg.lueurs.pop();showSetup()}));
for(const k in DATA.lueurs){const l=DATA.lueurs[k],on=cfg.lueurs.includes(k);
chip('r3',l.n,'taille '+l.t+' : '+l.sort.n,on,!on&&(sum()+l.t>cfg.cap||cfg.lueurs.length>=4),()=>{cfg.lueurs=on?cfg.lueurs.filter(z=>z!=k):[...cfg.lueurs,k];hint=descr(l.sort);showSetup()})}
chip('r4','Commencer le combat','',false,false,()=>{s.style.display='none';$('game').classList.remove('hide');init()})}
function size(){const N=DATA.taille,L=matchMedia('(orientation:landscape) and (max-height:600px)').matches;
W=L?Math.max(260,Math.min(innerWidth-285,(innerHeight-8)/.55)):Math.min(innerWidth-8,900);tw=W/N;th=tw/2;ox=W/2;oy=th*1.6;H=oy+(N-1)*th+th*.7;const d=devicePixelRatio||1;
cv.width=Math.round(W*d);cv.height=Math.round(H*d);cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(d,0,0,d,0,0)}
function init(){size();C=new Combat(DATA,cfg);mode='move';busy=false;say('debut');
msg('Touche une case éclairée pour te déplacer, ou choisis un sort puis une cible.');ui();draw()}
cv.onclick=e=>{if(busy||C.result)return;const r=cv.getBoundingClientRect(),a=(e.clientX-r.left-ox)/(tw/2),b=(e.clientY-r.top-oy)/(th/2);
const x=Math.round((a+b)/2),y=Math.round((b-a)/2);if(x<0||y<0||x>=DATA.taille||y>=DATA.taille)return;act(x,y)};
function act(x,y){const hp0=C.hero.hp;let r;if(mode=='move')r=C.move(x,y);else{r=C.cast(mode,x,y);if(r.ok)mode='move'}
if(!r.ok){msg(MSG[r.tag]);return}
if(r.tag)say(r.tag);
if(r.hit)r.hit.forEach(f=>pop(f,'-'+r.dmg,'#ff6b5e'));const dh=C.hero.hp-hp0;if(dh>0)pop(C.hero,'+'+dh,'#7fd18b');
const P={rage:['RAGE','#ffb454'],mur:['MUR','#c9b8ff'],sommeil:['Zzz','#9ecbff'],fuite:['Fuite !','#ffe08a'],farce:['Hop !','#ffe08a']}[r.tag];
if(P)pop(r.tag=='sommeil'?(C.foes.find(f=>f.sleep&&f.hp>0)||C.hero):C.hero,...P);
const k=r.hit?r.hit.filter(f=>f.hp<=0).length:0;
msg(r.hit&&r.hit.length?'-'+r.dmg+' PV sur '+r.hit.length+' ennemi(s)'+(k?', '+k+' vaincu(s).':'.'):'');
if(C.result=='win'){msg('Victoire ! Le chemin vers la forêt est libre.');say('victoire')}
ui();draw()}
async function endTurn(){if(busy||C.result)return;busy=true;mode='move';ui();
for(const f of C.foes){if(f.hp<=0)continue;await new Promise(r=>setTimeout(r,400));const d=C.foeTurn(f);
if(d<0){msg(f.n+' dort et passe son tour.');pop(f,'Zzz','#9ecbff')}else if(d){msg(f.n+' te frappe : -'+d+' PV.');say('coup');pop(C.hero,'-'+d,'#ff6b5e')}draw();ui();
if(C.result=='lose'){msg("Défaite. Dans le jeu complet : retour au village, sans perte d'objets.");say('defaite');busy=false;ui();draw();return}}
C.newTurn();busy=false;msg(C.pm==0?'À toi de jouer (tu ne peux pas te déplacer ce tour).':'À toi de jouer.');ui();draw()}
function mk(t,sub,on,fn,dis){const b=document.createElement('button');b.innerHTML=t+(sub?'<small>'+sub+'</small>':'');b.className=on?'on':'';b.disabled=dis;b.onclick=fn;$('bar').appendChild(b);return b}
function ui(){const h=C.hero;$('hud').innerHTML='PV <b>'+h.hp+'/'+h.max+'</b> PA <b>'+C.pa+'</b> PM <b>'+C.pm+'</b> Tour <b>'+C.turn+'</b>'+(h.rage?' <b>RAGE</b>':'')+(h.mur?' <b>MUR</b>':'');
$('bar').innerHTML='';const off=busy||C.result;
mk('Se déplacer',C.PM+' PM par tour',mode=='move',()=>{mode='move';ui();draw()},off);
C.S.forEach((s,i)=>{const no=C.pa<s.pa||C.cd[i]>0;
const b=mk(s.n,s.pa+' PA'+(C.cd[i]?', recharge '+C.cd[i]:''),mode===i,()=>{if(off)return;$('tip').textContent=descr(s);
if(no){msg(C.cd[i]>0?'En recharge : encore '+C.cd[i]+' tour(s).':'Pas assez de PA pour ce sort.');return}mode=i;msg('Touche une case en surbrillance bleue.');ui();draw()},false);
b.title=descr(s);if(no||off)b.classList.add('dim');
b.onpointerdown=()=>{clearTimeout(tt);tt=setTimeout(()=>$('tip').textContent=descr(s),400)};b.onpointerup=b.onpointerleave=()=>clearTimeout(tt)});
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
g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';drawFx()}
addEventListener('resize',()=>{if(C&&!$('game').classList.contains('hide')){size();draw()}});showSetup();
