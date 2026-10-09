// MENU : écran à onglets (Jouer, Héros, Lanterne, Atelier, Quêtes). Aucun dessin de grille ici.
let tab='jouer',resume=null,combatLive=false;
const TABS=[['jouer','Jouer','🏠'],['heros','Héros','🛡️'],['lanterne','Lanterne','🏮'],['atelier','Atelier','🔨'],['quetes','Quêtes','📜']];
const craftables=()=>Object.keys(DATA.objets).filter(id=>DATA.objets[id].cout&&!sv.inv.includes(id));
const canCraftAny=()=>craftables().some(id=>canPay(DATA.objets[id].cout));
const questReady=()=>Object.keys(DATA.quetes).some(id=>{const s=(sv.q||{})[id];return s&&s.s==1&&(s.n||0)>=DATA.quetes[id].need});
const heroMax=()=>DATA.classes[cfg.classe].hp+8*(sv.niv-1)+gear().t.pv;

function itemRow(id,extra){const o=DATA.objets[id];
return '<span class="em">'+o.e+'</span><span class="tx"><span class="nm" style="color:'+RC[o.r]+'">'+o.n+'</span><span class="mt">'+RAR[o.r]+' · '+fmtSt(o.st)+(o.set?' · '+DATA.sets[o.set].n:'')+'</span>'+(extra||'')+'</span>'}
function card(title,...kids){const c=el('div','card',title?'<h3>'+title+'</h3>':'');kids.forEach(k=>{if(k)c.appendChild(typeof k=='string'?el('p','',k):k)});return c}
function row(html,fn,cls){const r=el(fn?'button':'div','row '+(cls||''),html);if(fn)r.onclick=fn;return r}

// ---------- ouverture / fermeture ----------
function openMenu(t){if(EX.on)resume='ex';else if(combatLive&&!$('game').classList.contains('hide'))resume='combat';else if(!combatLive)resume=null;
EX.on=false;EX.tok++;EX.walking=false;if(t)tab=t;normL();closeModal();$('game').classList.add('hide');$('menu').classList.remove('hide');renderMenu();$('mbody').scrollTop=0}
function hideMenu(){$('menu').classList.add('hide')}
function showGame(){hideMenu();$('game').classList.remove('hide');size();if(EX.on)EX.draw();else if(C)draw()}
function renderMenu(){const sc=$('mbody').scrollTop,need=40*sv.niv;
$('mhead').innerHTML='<div class="top"><h1>Lampyria</h1><span class="lv">Niveau <b>'+sv.niv+'</b> · '+sv.xp+'/'+need+' XP</span></div><div class="bar"><i style="width:'+Math.round(100*sv.xp/need)+'%"></i></div><div class="chips">'+Object.keys(DATA.res).map(k=>'<span class="chip">'+rn(k)+' '+sv.res[k]+'</span>').join('')+(cfg.test?'<span class="chip no">Mode test</span>':'')+'</div>';
const T=$('tabs');T.innerHTML='';TABS.forEach(([id,n,ic])=>{const b=el('button',id==tab?'sel':'','<span class="ic">'+ic+'</span><span class="nm">'+n+'</span>');
if((id=='atelier'&&canCraftAny())||(id=='quetes'&&questReady()))b.appendChild(el('span','dot'));b.onclick=()=>{tab=id;renderMenu();$('mbody').scrollTop=0};T.appendChild(b)});
const B=$('mbody');B.innerHTML='';({jouer:tabJouer,heros:tabHeros,lanterne:tabLanterne,atelier:tabAtelier,quetes:tabQuetes})[tab](B);B.scrollTop=sc;
const F=$('mfoot');F.innerHTML='';
F.appendChild(resume=='combat'&&combatLive?btn('Reprendre le combat','','pri',showGame):resume=='ex'?btn("Reprendre l'exploration",DATA.cartes[sv.map||'village'].n,'pri',()=>EX.start()):btn('Explorer le monde',DATA.cartes[sv.map||'village'].n,'pri',()=>EX.start()))}

// ---------- onglet Jouer ----------
function tabJouer(B){const m=DATA.cartes[sv.map||'village'];
B.appendChild(card('Aventure','Tu es à : <b>'+m.n+'</b>. Explore, parle aux habitants, récolte et affronte les monstres pour progresser.',
questReady()?el('div','chips','<span class="chip ok">Une quête est prête à être rendue</span>'):null));
if(combatLive)B.appendChild(card('Combat en cours','Un combat est en pause. Tu peux le reprendre avec le bouton en bas, ou y renoncer.',btn('Abandonner le combat','','danger',leaveFight)));
const t=card('Combat d\'entraînement','Rejoue un combat déjà débloqué pour gagner de l\'XP, des ressources et du butin.');
DATA.rencontres.forEach((e,i)=>{if(i>sv.renc)return;const d=(e.drops||[]).filter(x=>!sv.inv.includes(x.id)).length;
t.appendChild(row('<span class="em">⚔️</span><span class="tx"><span class="nm">'+e.n+'</span><span class="mt">'+e.xp+' XP · '+(d?d+' objet(s) à obtenir':'tout obtenu')+'</span></span>',()=>startTraining(i),combatLive?'lock':''))});
B.appendChild(t);
const o=card('Options');
o.appendChild(row('<span class="em">🧪</span><span class="tx"><span class="nm">Mode test : '+(cfg.test?'activé':'désactivé')+'</span><span class="mt">Toutes les Lueurs, capacité 12, aucun gain.</span></span>',()=>{cfg.test=!cfg.test;normL();renderMenu()}));
o.appendChild(row('<span class="em">🗑️</span><span class="tx"><span class="nm">Effacer la sauvegarde</span><span class="mt">Recommencer l\'aventure depuis le début.</span></span>',()=>{
modal(el('div','','<h2>Tout effacer ?</h2><p>Niveau, objets, quêtes et ressources seront perdus. Cette action est définitive.</p>'),[['Annuler'],['Effacer',()=>{try{localStorage.removeItem('lampyria')}catch(e){}location.reload()},'danger']])}));
B.appendChild(o)}

// ---------- onglet Héros ----------
function tabHeros(B){const cl=el('div','grid');
for(const k in DATA.classes){const c=DATA.classes[k];cl.appendChild(btn(c.e+' '+c.n,c.info,cfg.classe==k?'on':'',()=>{cfg.classe=k;saveCfg();renderMenu()}))}
B.appendChild(card('Classe',cl,'Les sorts de classe sont toujours disponibles en combat.'));
const sp=el('div','');sp.innerHTML=DATA.classes[cfg.classe].sorts.map(s=>'<p class="sp" style="margin:0 0 6px"><b>'+s.n+'</b> : '+descrBody(s)+'</p>').join('');B.appendChild(card('Sorts de '+DATA.classes[cfg.classe].n,sp));
const G=gear().t,st=el('div','grid2');
st.innerHTML=[[heroMax(),'PV'],['+'+(sv.niv-1+G.dmg),'Dégâts bonus'],[G.res+' %','Résistance'],[DATA.heros.pm+G.pm,'PM par tour']].map(([v,n])=>'<div class="stat"><b>'+v+'</b><span>'+n+'</span></div>').join('');
B.appendChild(card('Statistiques',st,combatLive?'Les changements d\'équipement s\'appliquent au prochain combat.':null));
const eq=card('Équipement');
SLOTS.forEach(([s,n,ic])=>{const id=sv.eq[s]&&sv.inv.includes(sv.eq[s])?sv.eq[s]:null,have=sv.inv.filter(i=>DATA.objets[i].slot==slotType(s)).length;
eq.appendChild(id?row(itemRow(id)+'<span class="mt">'+n+'</span>',()=>pickGear(s)):row('<span class="em">'+ic+'</span><span class="tx"><span class="nm">'+n+'</span><span class="mt">'+(have?'Vide : touche pour équiper ('+have+' disponible'+(have>1?'s':'')+')':'Vide : fabrique ou trouve un objet')+'</span></span>',()=>pickGear(s),'empty'))});
const gc=gear().cnt;for(const k in DATA.sets){const S=DATA.sets[k],n=gc[k]||0,l=Object.keys(S.bonus).map(p=>'<span style="color:'+(n>=+p?'var(--ok)':'var(--dim)')+'">'+p+' pièces : '+fmtSt(S.bonus[p])+'</span>').join('<br>');
eq.appendChild(el('div','set','<b>'+S.n+' ('+n+'/3)</b><br>'+l))}
B.appendChild(eq)}
function pickGear(slot){const t=slotType(slot),own=sv.inv.filter(i=>DATA.objets[i].slot==t),n=el('div','pick','<h2>'+SLOTS.find(s=>s[0]==slot)[1]+'</h2>');
if(!own.length)n.appendChild(el('p','','Aucun objet de ce type pour l\'instant. L\'atelier et les combats en fournissent.'));
own.forEach(id=>{const cur=sv.eq[slot]==id,r=row(itemRow(id,cur?'<span class="mt" style="color:var(--ok)">Équipé ici</span>':(Object.keys(sv.eq).find(s=>sv.eq[s]==id)?'<span class="mt">Équipé ailleurs : sera déplacé</span>':'')),()=>{equip(slot,id);closeModal();renderMenu()});n.appendChild(r)});
if(sv.eq[slot])n.appendChild(row('<span class="em">✖️</span><span class="tx"><span class="nm">Retirer</span></span>',()=>{equip(slot,null);closeModal();renderMenu()}));
modal(n,[['Fermer']])}

// ---------- onglet Lanterne ----------
function whereLueur(k){const r=DATA.rencontres.find(e=>e.unlock==k);if(r)return 'Récompense : '+r.n;
const q=Object.keys(DATA.quetes).find(id=>DATA.quetes[id].rew&&DATA.quetes[id].rew.lueur==k);return q?'Quête : '+DATA.quetes[q].n:'Introuvable pour l\'instant'}
function tabLanterne(B){const cap=capNow(),used=sum();
let seg='';const cells=[];cfg.lueurs.forEach(k=>{for(let i=0;i<DATA.lueurs[k].t;i++)cells.push('f')});for(let i=0;i<cap;i++)seg+='<i class="'+(cells[i]||'')+'"></i>';
const c=card('Lanterne','<div class="seg">'+seg+'</div><span class="sp"><b>'+used+'/'+cap+'</b> de capacité utilisée · <b>'+cfg.lueurs.length+'/4</b> Lueurs</span>');
const up=DATA.lampiste.find(u=>u.cap>sv.cap);
if(up&&!cfg.test){const ok=canPay(up.cout);c.appendChild(row('<span class="em">🔧</span><span class="tx"><span class="nm">Maître Lampiste : capacité '+up.cap+'</span><span class="mt">'+costChips(up.cout)+'</span></span>',()=>{if(!ok){toast('Ressources insuffisantes');return}pay(up.cout);sv.cap=up.cap;store();toast('Lanterne agrandie : capacité '+up.cap);renderMenu()},ok?'':'lock'))}
else if(!cfg.test)c.appendChild(el('p','','Capacité maximale atteinte.'));
B.appendChild(c);
const L=card('Lueurs','Chaque Lueur ajoute un sort. Les grandes Lueurs prennent plus de place dans la lanterne.');
const av=avail();
Object.keys(DATA.lueurs).forEach(k=>{const l=DATA.lueurs[k];
if(!av.includes(k)){L.appendChild(row('<span class="em">🔒</span><span class="tx"><span class="nm">'+l.n+'</span><span class="mt">'+whereLueur(k)+'</span></span>',null,'lock'));return}
const on=cfg.lueurs.includes(k),why=!on&&(used+l.t>cap?'Pas assez de place dans la lanterne':cfg.lueurs.length>=4?'4 Lueurs maximum':'');
const b=el('button','lu'+(on?' on':''),'<span class="em" style="font-size:22px">'+(on?'✨':'💡')+'</span><span class="tx"><span class="nm">'+l.n+'</span><span class="mt">'+l.sort.n+' : '+descrBody(l.sort)+'</span>'+(why?'<span class="mt" style="color:var(--bad)">'+why+'</span>':'')+'</span><span class="sz">taille '+l.t+'</span>');
if(why)b.classList.add('dim');
b.onclick=()=>{if(why){toast(why);return}cfg.lueurs=on?cfg.lueurs.filter(z=>z!=k):[...cfg.lueurs,k];saveCfg();renderMenu()};L.appendChild(b)});
B.appendChild(L)}

// ---------- onglet Atelier ----------
function craft(id){const o=DATA.objets[id];if(sv.inv.includes(id)||!canPay(o.cout)){toast('Impossible');return}
pay(o.cout);sv.inv.push(id);const e=autoEquip(id);store();toast(o.n+' fabriqué'+(e?' et équipé':''));renderMenu()}
function tabAtelier(B){const list=craftables(),c=card('Fabrication','Transforme tes ressources en équipement. Chaque objet se fabrique une seule fois.');
if(!list.length)c.appendChild(el('p','','Tout est fabriqué !'));
SLOTS.filter((s,i)=>i<5).forEach(([s,n])=>{const L=list.filter(id=>DATA.objets[id].slot==slotType(s));if(!L.length)return;
c.appendChild(el('h3','',n=='Accessoire 1'?'Accessoires':n));
L.forEach(id=>{const o=DATA.objets[id],ok=canPay(o.cout);c.appendChild(row(itemRow(id,'<span class="mt">'+costChips(o.cout)+'</span>'),()=>craft(id),ok?'':'lock'))})});
B.appendChild(c);
const D=Object.keys(DATA.objets).filter(id=>!DATA.objets[id].cout),d=card('À trouver en combat','Ces objets ne se fabriquent pas : ils tombent sur les monstres (une garantie évite la malchance trop longue).');
D.forEach(id=>{const own=sv.inv.includes(id),src=DATA.rencontres.find(e=>(e.drops||[]).some(x=>x.id==id));
d.appendChild(row(itemRow(id,'<span class="mt">'+(own?'<span style="color:var(--ok)">Obtenu</span>':'Butin : '+(src?src.n:'?'))+'</span>'),null,own?'':'lock'))});
B.appendChild(d)}

// ---------- onglet Quêtes ----------
function tabQuetes(B){const Q=sv.q||{};let any=false;
for(const id in DATA.quetes){const q=DATA.quetes[id],s=Q[id];
if(!s&&(q.req||0)>sv.renc)continue;any=true;
const n=s?Math.min(s.n||0,q.need):0,done=s&&s.s==2,ready=s&&s.s==1&&n>=q.need;
const c=card(done?'Terminée':s?(ready?'À rendre':'En cours'):'Disponible','<b style="color:var(--ink);font-size:15px">'+q.n+'</b>');
c.appendChild(el('p','',q.desc));
if(s)c.appendChild(el('div','bar','<i style="width:'+Math.round(100*(done?1:n/q.need))+'%"></i>'));
c.appendChild(el('p','',done?'Récompense reçue.':ready?'Retourne voir le Maître Lampiste au village.':s?'Progression : '+n+'/'+q.need:'Parle au Maître Lampiste, au village.'));
B.appendChild(c)}
if(!any)B.appendChild(card('Quêtes','Aucune quête pour l\'instant.'))}
