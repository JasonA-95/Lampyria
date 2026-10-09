// AFFICHAGE : dessin de la grille, boutons de combat, clics. Les règles sont dans moteur.js, les menus dans menu.js.
const cv=$('c'),g=cv.getContext('2d');
const MSG={loin:'Trop loin : déplacement limité par tes PM, sans traverser les obstacles.',cible:'Cible invalide (portée, ligne de vue ou case vide).',cout:'Pas assez de PA, ou sort en recharge.'};
let C,tw,th,ox,oy,W,H,mode,busy,tt,pend=null,after=null;
const fx=[];let fxOn=false;
function pop(u,t,c){fx.push({x:u.x,y:u.y,t,c,t0:performance.now()});if(!fxOn){fxOn=true;(function L(){draw();if(fx.length)requestAnimationFrame(L);else fxOn=false})()}}
function drawFx(){const now=performance.now();for(let i=fx.length-1;i>=0;i--){const f=fx[i],a=(now-f.t0)/1100;if(a>=1){fx.splice(i,1);continue}
const cx=(f.x-f.y)*tw/2+ox,cy=(f.x+f.y)*th/2+oy-th*(1+a*1.4);g.globalAlpha=1-a*a;g.font='bold '+Math.round(tw*.55)+'px Georgia,serif';
g.lineWidth=4;g.strokeStyle='#120d1a';g.strokeText(f.t,cx,cy);g.fillStyle=f.c;g.fillText(f.t,cx,cy);g.globalAlpha=1}}

// ---------- fin de combat ----------
function reward(){const e=DATA.rencontres[cfg.renc];if(cfg.test)return{test:true};
const r={xp:e.xp,loot:e.loot||{},lv:0,items:[],eq:[],lueur:null};sv.xp+=e.xp;for(const k in r.loot)sv.res[k]+=r.loot[k];
while(sv.xp>=40*sv.niv){sv.xp-=40*sv.niv;sv.niv++;r.lv++}
if(cfg.renc==sv.renc&&sv.renc<DATA.rencontres.length-1)sv.renc++;
if(e.unlock&&!sv.deb.includes(e.unlock)){sv.deb.push(e.unlock);r.lueur=e.unlock}
r.items=rollDrops(cfg.renc);r.eq=r.items.map(autoEquip);store();return r}
function endFight(res,r){combatLive=false;const win=res=='win',n=el('div','');
if(win){say('victoire');let h='<h2>Victoire !</h2>';
if(r.test)h+='<p>Mode test : aucun gain.</p>';
else{h+='<p>+'+r.xp+' XP'+(r.lv?' · <b style="color:var(--ember)">Niveau '+sv.niv+' !</b>':'')+'</p>';
const L=Object.keys(r.loot);if(L.length)h+='<p><span class="chips">'+L.map(k=>'<span class="chip ok">'+rn(k)+' +'+r.loot[k]+'</span>').join('')+'</span></p>';
if(r.lueur)h+='<p>✨ Nouvelle Lueur : <b>'+DATA.lueurs[r.lueur].n+'</b></p>';
r.items.forEach((id,i)=>{const o=DATA.objets[id];h+='<p>'+o.e+' <b style="color:'+RC[o.r]+'">'+o.n+'</b> <span class="sp">('+RAR[o.r]+', '+fmtSt(o.st)+')'+(r.eq[i]?' · équipé':' · dans ton sac')+'</span></p>'});}
n.innerHTML=h}
else{say('defaite');n.innerHTML='<h2>Défaite</h2><p>'+(EX.group?'Tu te réveilles au village, sans rien avoir perdu.':'Aucune perte : réessaie avec un autre équipement ou d\'autres Lueurs.')+'</p>'}
const fin=()=>EX.group?EX.back(res):openMenu('jouer');
after=fin;msg(win?'Victoire !':'Défaite.');ui();draw();
const B=EX.group?[['Continuer',fin,'pri']]:win?[['Menu',()=>openMenu('jouer')],['Rejouer',()=>startTraining(cfg.renc),'pri']]:[['Menu',()=>openMenu('jouer')],['Réessayer',()=>startTraining(cfg.renc),'pri']];
modal(n,B)}
function startTraining(i){EX.group=null;EX.on=false;EX.tok++;cfg.renc=i;hideMenu();$('game').classList.remove('hide');init()}
function leaveFight(){combatLive=false;if(EX.group){const q=EX.group;EX.group=null;EX.start()}else openMenu('jouer')}

// ---------- dimensions et initialisation ----------
function size(){const N=DATA.taille,L=matchMedia('(orientation:landscape) and (max-height:600px)').matches;
W=L?Math.max(260,Math.min(innerWidth-310,(innerHeight-8)/.55)):Math.min(innerWidth-8,900);tw=W/N;th=tw/2;ox=W/2;oy=th*1.6;H=oy+(N-1)*th+th*.7;const d=devicePixelRatio||1;
cv.width=Math.round(W*d);cv.height=Math.round(H*d);cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(d,0,0,d,0,0)}
function init(){size();normL();C=new Combat(DATA,{...cfg,niv:sv.niv,gear:gear().t});mode='move';busy=false;pend=null;after=null;combatLive=true;
say(DATA.rencontres[cfg.renc].say||'debut');$('tip').textContent='Maintiens un sort pour lire sa description.';
msg('Touche une case éclairée pour te déplacer, ou choisis un sort puis une cible.');ui();draw()}
cv.onclick=e=>{if(EX.on)return EX.click(e);if(busy||C.result)return;const r=cv.getBoundingClientRect(),a=(e.clientX-r.left-ox)/(tw/2),b=(e.clientY-r.top-oy)/(th/2);
const x=Math.round((a+b)/2),y=Math.round((b-a)/2);if(x<0||y<0||x>=DATA.taille||y>=DATA.taille)return;act(x,y)};

// ---------- actions ----------
function act(x,y){const ok=mode=='move'?C.reach()[x+','+y]>0:C.ranged(mode).some(t=>t[0]==x&&t[1]==y);
if(!ok){pend=null;msg(mode=='move'?MSG.loin:MSG.cible);draw();return}
if(!pend||pend.x!=x||pend.y!=y){pend={x,y};msg(mode=='move'?'Déplacement : '+C.reach()[x+','+y]+' PM. Touche encore la case pour confirmer.':'Zone affichée. Touche encore la même case pour lancer le sort.');draw();return}
pend=null;const hp0=C.hero.hp;let r;if(mode=='move')r=C.move(x,y);else{r=C.cast(mode,x,y);if(r.ok)mode='move'}
if(!r.ok){msg(MSG[r.tag]);return}
if(r.tag)say(r.tag);
if(r.hit)r.hit.forEach(f=>pop(f,'-'+r.dmg,'#ff6b5e'));if(r.blocked)pop(C.foes.find(f=>f.boss&&f.hp>0),'Invulnérable','#c9b8ff');const dh=C.hero.hp-hp0;if(dh>0)pop(C.hero,'+'+dh,'#7fd18b');
const P={rage:['RAGE','#ffb454'],mur:['MUR','#c9b8ff'],sommeil:['Zzz','#9ecbff'],fuite:['Fuite !','#ffe08a'],farce:['Hop !','#ffe08a']}[r.tag];
if(P)pop(r.tag=='sommeil'?(C.foes.find(f=>f.sleep&&f.hp>0)||C.hero):C.hero,...P);
const k=r.hit?r.hit.filter(f=>f.hp<=0).length:0;
msg(r.formDown?(r.out?'Le formulaire est projeté hors du terrain !':'Formulaire détruit !')+' Le Chambellan est vulnérable 2 tours.':r.blocked&&!(r.hit&&r.hit.length)?'Le Chambellan est invulnérable tant que le formulaire flotte sur lui !':r.hit&&r.hit.length?'-'+r.dmg+' PV sur '+r.hit.length+' ennemi(s)'+(k?', '+k+' vaincu(s).':'.'):'');
if(C.result=='win'){const rw=reward();ui();draw();setTimeout(()=>endFight('win',rw),500);return}
ui();draw()}
async function endTurn(){if(busy||C.result)return;busy=true;mode='move';pend=null;ui();
for(const f of C.foes){if(f.hp<=0)continue;await new Promise(r=>setTimeout(r,400));const d=C.foeTurn(f);
if(d<0){msg(f.n+' dort et passe son tour.');pop(f,'Zzz','#9ecbff')}else if(d){msg(f.n+' te frappe : -'+d+' PV.');say('coup');pop(C.hero,'-'+d,'#ff6b5e')}draw();ui();
if(C.result=='lose'){busy=false;ui();draw();endFight('lose');return}}
C.newTurn();busy=false;msg(C.pm==0?'À toi de jouer (tu ne peux pas te déplacer ce tour).':'À toi de jouer.');ui();draw()}

// ---------- boutons ----------
function mk(t,sub,cls,fn,dis){const b=btn(t,sub,cls,fn,dis);$('bar').appendChild(b);return b}
function pips(cls,n,max){let s='';for(let i=0;i<max;i++)s+='<i class="'+(i<n?'f':'')+'"></i>';return '<span class="pip '+cls+'">'+cls.toUpperCase()+' '+s+'</span>'}
function ui(){const h=C.hero;
$('hud').innerHTML='<div class="pv"><span><b style="color:var(--ink)">'+h.hp+'</b> / '+h.max+' PV · Niv '+sv.niv+'</span><div class="bar"><i style="width:'+Math.max(0,Math.round(100*h.hp/h.max))+'%"></i></div></div>'+pips('pa',C.pa,C.PA)+pips('pm',C.pm,C.PM)+'<span class="pip">Tour '+C.turn+'</span>'+(h.rage?'<span class="tag">RAGE</span>':'')+(h.mur?'<span class="tag">MUR</span>':'');
$('bar').innerHTML='';const F=$('foot');F.innerHTML='';
if(C.result){F.appendChild(btn('Menu','','',()=>after&&after()));F.appendChild(btn('Continuer','','pri',()=>after&&after()));return}
const off=busy;
mk('Se déplacer',C.PM+' PM par tour',mode=='move'?'on':'',()=>{if(off)return;mode='move';pend=null;ui();draw()},off);
C.S.forEach((s,i)=>{const no=C.pa<s.pa||C.cd[i]>0;
const b=mk(s.n,s.pa+' PA'+(C.cd[i]?' · recharge '+C.cd[i]:''),mode===i?'on':'',()=>{if(off)return;$('tip').textContent=descr(s);
if(no){msg(C.cd[i]>0?'En recharge : encore '+C.cd[i]+' tour(s).':'Pas assez de PA pour ce sort.');return}mode=i;pend=s.r[1]==0?{x:C.hero.x,y:C.hero.y}:null;msg(pend?'Zone affichée. Touche ton personnage pour confirmer.':'Touche une case bleue pour voir la zone, puis touche-la encore pour confirmer.');ui();draw()},false);
b.title=descr(s);if(no||off)b.classList.add('dim');
b.onpointerdown=()=>{clearTimeout(tt);tt=setTimeout(()=>$('tip').textContent=descr(s),400)};b.onpointerup=b.onpointerleave=()=>clearTimeout(tt)});
F.appendChild(btn('☰ Menu','','',()=>openMenu(),busy));F.appendChild(btn('Fin du tour','','pri',endTurn,off))}

// ---------- dessin ----------
const col=l=>'rgb('+[38+82*l,32+52*l,51-3*l].map(Math.round)+')';
function dia(cx,cy,f){g.beginPath();g.moveTo(cx,cy-th/2);g.lineTo(cx+tw/2,cy);g.lineTo(cx,cy+th/2);g.lineTo(cx-tw/2,cy);g.closePath();g.fillStyle=f;g.fill();g.strokeStyle='rgba(0,0,0,.25)';g.stroke()}
function draw(){if(EX.on)return EX.draw();if(!C)return;const N=DATA.taille,h=C.hero;g.clearRect(0,0,W,H);
const rc=mode=='move'&&!busy&&!C.result?C.reach():{},rs=new Set(mode!='move'&&!C.result?C.ranged(mode).map(t=>t.join(',')):[]),rz=new Set(mode!='move'&&!C.result?C.zone(mode).map(t=>t.join(',')):[]);
const pp={},zone=new Set();if(pend&&!C.result){if(mode=='move')C.path(pend.x,pend.y).forEach(t=>pp[t.join(',')]=1);
else{const s=C.S[mode];for(let x=0;x<N;x++)for(let y=0;y<N;y++)if(C.ok(x,y)&&C.dist({x,y},pend)<=(s.aoe??0))zone.add(x+','+y)}}
g.textAlign='center';g.textBaseline='middle';g.font=Math.round(tw*.7)+'px serif';
for(let s=0;s<=2*N-2;s++)for(let x=0;x<N;x++){const y=s-x;if(y<0||y>=N)continue;const k=x+','+y;
const cx=(x-y)*tw/2+ox,cy=(x+y)*th/2+oy,l=Math.max(0,1-Math.hypot(x-h.x,y-h.y)/6.5)*((x+y)%2?.9:1);
dia(cx,cy,col(l));if(rc[k]>0)dia(cx,cy,'rgba(255,180,84,.32)');if(rz.has(k))dia(cx,cy,'rgba(106,169,255,.2)');if(rs.has(k))dia(cx,cy,'rgba(106,169,255,.45)');if(pp[k])dia(cx,cy,'rgba(255,240,170,.6)');if(zone.has(k))dia(cx,cy,'rgba(229,86,74,.6)');
if(C.rocks.has(k)){g.fillStyle='#fff';g.fillText('🪨',cx,cy-th*.15);continue}
const u=C.at(x,y);if(u){g.fillStyle='#fff';g.fillText(u.sleep?'💤':u.e,cx,cy-th*.3);if(u.boss&&C.bossInv())g.fillText('🛡️',cx+tw*.32,cy-th*.75);
g.fillStyle='#000a';g.fillRect(cx-tw*.25,cy-th*.95,tw*.5,4);g.fillStyle=u===h?'#7fd18b':'#e5564a';g.fillRect(cx-tw*.25,cy-th*.95,tw*.5*Math.max(0,u.hp)/u.max,4)}}
const hx=(h.x-h.y)*tw/2+ox,hy=(h.x+h.y)*th/2+oy,gr=g.createRadialGradient(hx,hy,0,hx,hy,tw*3);
gr.addColorStop(0,'rgba(255,180,84,.28)');gr.addColorStop(1,'rgba(255,180,84,0)');
g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';drawFx()}
addEventListener('resize',()=>{if(!$('game').classList.contains('hide')){size();draw()}});
openMenu('jouer');
