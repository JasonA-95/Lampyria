// ÉTAT : sauvegarde, réglages, équipement, butin et petits utilitaires d'interface partagés par tous les écrans.
const $=i=>document.getElementById(i);
let sv;try{sv=JSON.parse(localStorage.getItem('lampyria'))}catch(e){}
sv=sv&&typeof sv=='object'?sv:{};
const SV0={niv:1,xp:0,res:{braise:0,champi:0,laine:0},cap:3,renc:0,deb:['gourmande'],inv:[],eq:{},pity:0,classe:'porte',lueurs:['gourmande'],q:{}};
for(const k in SV0)if(sv[k]==null)sv[k]=JSON.parse(JSON.stringify(SV0[k]));
if(!DATA.classes[sv.classe])sv.classe='porte';
const store=()=>{try{localStorage.setItem('lampyria',JSON.stringify(sv))}catch(e){}};
const cfg={classe:sv.classe,renc:0,test:false,lueurs:sv.lueurs.filter(k=>DATA.lueurs[k])};
const saveCfg=()=>{sv.classe=cfg.classe;sv.lueurs=[...cfg.lueurs];store()};
const sum=()=>cfg.lueurs.reduce((a,k)=>a+DATA.lueurs[k].t,0);
const avail=()=>cfg.test?Object.keys(DATA.lueurs):sv.deb;
const capNow=()=>cfg.test?12:sv.cap;
function normL(){const av=avail(),cap=capNow();cfg.lueurs=cfg.lueurs.filter(k=>av.includes(k));while(sum()>cap||cfg.lueurs.length>4)cfg.lueurs.pop()}

// ---------- petits outils d'interface ----------
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.innerHTML=x;return e};
function btn(t,sub,cls,fn,dis){const b=el('button',cls||'','<span class="nm">'+t+'</span>'+(sub?'<span class="mt">'+sub+'</span>':''));b.disabled=!!dis;if(fn)b.onclick=fn;return b}
let tto;function toast(t){const e=$('toast');e.textContent=t;e.classList.remove('hide');clearTimeout(tto);tto=setTimeout(()=>e.classList.add('hide'),2600)}
const closeModal=()=>$('modal').classList.add('hide');
function modal(node,btns){const c=$('mcard');c.innerHTML='';c.appendChild(node);const f=el('div','mbtns');
(btns||[]).forEach(([t,fn,cls])=>f.appendChild(btn(t,'',cls||'',()=>{closeModal();if(fn)fn()})));c.appendChild(f);$('modal').classList.remove('hide')}
const SPK={Gourmande:'#ffb454',Peureuse:'#ffe08a',Colérique:'#ff7b6b',Rêveuse:'#9ecbff',Têtue:'#c9b8ff',Farceuse:'#8de0c0',Mélancolique:'#9aa7ee'};
function speak(who,txt){const c=SPK[who]||'#ffd9a0';$('sayEl').style.borderLeftColor=c;$('sayEl').innerHTML='<span class="who" style="color:'+c+'">'+who+'</span>'+txt}
const say=k=>speak(...DATA.repliques[k]);
const msg=t=>$('msgEl').textContent=t;

// ---------- ressources ----------
const rn=k=>DATA.res[k].split(' ')[0];
const rl=o=>Object.keys(o).map(k=>rn(k)+' '+o[k]).join(' ');
const canPay=c=>Object.keys(c).every(k=>sv.res[k]>=c[k]);
const pay=c=>Object.keys(c).forEach(k=>sv.res[k]-=c[k]);
const costChips=c=>'<span class="chips">'+Object.keys(c).map(k=>'<span class="chip '+(sv.res[k]>=c[k]?'ok':'no')+'">'+rn(k)+' '+c[k]+'</span>').join('')+'</span>';

// ---------- description des sorts ----------
const rg=r=>r[0]==r[1]?r[0]:r[0]+'-'+r[1];
function descrBody(s){const a=[s.pa+' PA, '+(s.r[1]?'portée '+rg(s.r):'sur soi')+(s.los?', ligne de vue':'')];
if(s.dmg)a.push('inflige '+s.dmg+' dégâts'+(s.aoe!=null?' en zone (rayon '+s.aoe+')':'')+(s.drain?' et te soigne (plus ta vie est basse, plus tu récupères)':''));
if(s.heal)a.push('soigne '+s.heal+' PV');if(s.tp)a.push('te téléporte sur une case libre');if(s.push)a.push('repousse la cible de '+s.push+' case');
if(s.rage)a.push('ta prochaine attaque inflige le double, mais -1 PM au tour suivant');
if(s.mur)a.push('dégâts subis réduits de moitié pendant 2 tours, mais tu ne peux pas bouger');
if(s.sleep)a.push('endort la cible 1 tour (réveil si elle subit des dégâts)');
if(s.swap)a.push('échange ta place avec la cible');if(s.cd)a.push('recharge '+s.cd+' tours');return a.join(', ')+'.'}
const descr=s=>s.n+' : '+descrBody(s);

// ---------- équipement ----------
const RAR=['Commun','Rare','Épique','Légendaire'],RC=['#c9c2d6','#6fb7ff','#c58bff','#ffb454'];
const SLOTS=[['arme','Arme','⚔️'],['tete','Tête','🎩'],['corps','Corps','🧥'],['bottes','Bottes','👢'],['acc1','Accessoire 1','💍'],['acc2','Accessoire 2','💍']];
const slotType=s=>s.startsWith('acc')?'acc':s;
const fmtSt=st=>Object.keys(st).map(k=>'+'+st[k]+(k=='pv'?' PV':k=='dmg'?' dégâts':k=='res'?' % rés.':' PM')).join(' · ');
function gear(){const t={pv:0,dmg:0,res:0,pm:0},cnt={};
for(const [s] of SLOTS){const id=sv.eq[s];if(!id||!sv.inv.includes(id))continue;const o=DATA.objets[id];for(const k in o.st)t[k]+=o.st[k];if(o.set)cnt[o.set]=(cnt[o.set]||0)+1}
for(const k in cnt){const b=DATA.sets[k].bonus;for(const n in b)if(cnt[k]>=+n)for(const s in b[n])t[s]+=b[n][s]}
t.res=Math.min(t.res,40);return{t,cnt}}
function equip(slot,id){if(id){for(const s in sv.eq)if(sv.eq[s]==id)delete sv.eq[s];sv.eq[slot]=id}else delete sv.eq[slot];store()}
function autoEquip(id){const t=DATA.objets[id].slot,c=t=='acc'?['acc1','acc2']:[t],s=c.find(x=>!sv.eq[x]||!sv.inv.includes(sv.eq[x]));if(s){sv.eq[s]=id;return true}return false}
// Butin : chaque objet a sa chance ; garantie anti-malchance (4 combats sans objet, 1 contre un boss).
function rollDrops(ri){const R=DATA.rencontres[ri],D=R.drops||[],got=[];
for(const d of D)if(!sv.inv.includes(d.id)&&Math.random()*100<d.p)got.push(d.id);
if(!got.length){const left=D.filter(d=>!sv.inv.includes(d.id));sv.pity=(sv.pity||0)+1;
if(left.length&&sv.pity>=(R.m.some(m=>m.boss)?1:4))got.push(left[Math.floor(Math.random()*left.length)].id)}
if(got.length)sv.pity=0;got.forEach(id=>sv.inv.push(id));return got}
