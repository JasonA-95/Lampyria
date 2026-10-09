// EXPLORATION : cartes du monde, déplacement, récolte, rencontres. Utilise la grille et le style de affichage.js.
const EX={on:false,map:null,x:0,y:0,groups:[],nodes:[],pend:null,tok:0,steps:0,group:null,walking:false};
const exK=(x,y)=>x+','+y,qs=()=>sv.q=sv.q||{};
function exBlock(){const d=DATA.cartes[EX.map],s=new Set(d.rocks.map(r=>exK(r[0],r[1])));
EX.groups.forEach(q=>{if(!q.dead)s.add(exK(q.x,q.y))});EX.nodes.forEach(n=>s.add(exK(n.x,n.y)));
d.npcs.forEach(n=>s.add(exK(n.x,n.y)));d.exits.forEach(e=>s.add(exK(e.x,e.y)));return s}
function exEnt(x,y){const d=DATA.cartes[EX.map];
const q=EX.groups.find(q=>!q.dead&&q.x==x&&q.y==y);if(q)return{t:'g',o:q};
const n=EX.nodes.find(n=>n.x==x&&n.y==y);if(n)return{t:'n',o:n};
const p=d.npcs.find(n=>n.x==x&&n.y==y);if(p)return{t:'p',o:p};
const e=d.exits.find(e=>e.x==x&&e.y==y);if(e)return{t:'e',o:e};return null}
function exPath(tx,ty,ent){const N=DATA.taille,B=exBlock(),near=ent&&ent.t!='e',
goal=(x,y)=>near?Math.abs(x-tx)+Math.abs(y-ty)==1:(x==tx&&y==ty);
if(goal(EX.x,EX.y))return[];
const p={},d={[exK(EX.x,EX.y)]:1},q=[[EX.x,EX.y]];let end=null;
while(q.length&&!end){const [x,y]=q.shift();for(const [a,b] of DIRS){const nx=x+a,ny=y+b,k=exK(nx,ny);
if(nx<0||ny<0||nx>=N||ny>=N||d[k])continue;
if(B.has(k)&&!(ent&&ent.t=='e'&&nx==tx&&ny==ty))continue;
d[k]=1;p[k]=[x,y];if(goal(nx,ny)){end=[nx,ny];break}q.push([nx,ny])}}
if(!end)return null;const r=[];let c=end;while(c&&!(c[0]==EX.x&&c[1]==EX.y)){r.unshift(c);c=p[exK(c[0],c[1])]}return r}
EX.enter=(name,x,y)=>{const d=DATA.cartes[name];EX.map=name;sv.map=name;store();
EX.x=x??d.start[0];EX.y=y??d.start[1];EX.groups=d.groups.map(q=>({...q}));EX.nodes=d.nodes.map(n=>({...n,until:0}));EX.pend=null;const Q=qs(),on=(p,i)=>{const s=Q[p.quest];return s&&s.s==1&&!(s.got||[]).includes(name+i)};
(d.picks||[]).forEach((p,i)=>{if(on(p,i))EX.nodes.push({x:p.x,y:p.y,pick:1,quest:p.quest,id:name+i,until:0})});
(d.hides||[]).forEach((p,i)=>{if(on(p,i))EX.groups.push({x:p.x,y:p.y,renc:p.renc,hide:1,quest:p.quest,id:name+i})})}
EX.start=()=>{EX.on=true;EX.tok++;EX.walking=false;EX.group=null;$('setup').style.display='none';$('game').classList.remove('hide');size();
if(EX.map!==(sv.map||'village'))EX.enter(sv.map||'village');
$('tip').textContent='Touche une case, puis touche-la encore pour y aller. Rochers et monstres bloquent le passage.';
msg('Tu es : '+DATA.cartes[EX.map].n+'.');EX.ui();EX.draw()};
EX.hud=()=>{const R=DATA.res;$('hud').innerHTML='Niv <b>'+sv.niv+'</b> '+DATA.cartes[EX.map].n+' '+Object.keys(R).map(k=>R[k].split(' ')[0]+' <b>'+sv.res[k]+'</b>').join(' ');
};
EX.ui=()=>{EX.hud();$('bar').innerHTML='';mk('Quêtes','journal',false,EX.log,false);mk('Équipement','classe, Lueurs, lampiste',false,showSetup,false)};
EX.log=()=>{const Q=qs(),L=Object.keys(DATA.quetes).filter(id=>Q[id]).map(id=>{const q=DATA.quetes[id],s=Q[id];
return s.s==2?'✅ '+q.n+' (terminée)':'🔸 '+q.n+' : '+Math.min(s.n||0,q.need)+'/'+q.need+(s.n>=q.need?' (à rendre)':'')});
$('tip').innerHTML=L.length?L.join('<br>'):'Aucune quête. Parle au Maître Lampiste, au village.'};
EX.gain=r=>{let t='';if(r.xp){sv.xp+=r.xp;t+=' +'+r.xp+' XP';while(sv.xp>=40*sv.niv){sv.xp-=40*sv.niv;sv.niv++;t+=' Niveau '+sv.niv+' !'}}
for(const k in (r.res||{})){sv.res[k]+=r.res[k];t+=' +'+r.res[k]+' '+DATA.res[k].split(' ')[0]}
if(r.lueur&&!sv.deb.includes(r.lueur)){sv.deb.push(r.lueur);t+=' Nouvelle Lueur : '+DATA.lueurs[r.lueur].n+' !'}store();return t};
EX.prog=(id,cell)=>{const s=qs()[id],q=DATA.quetes[id];if(!s||s.s!=1||(s.n||0)>=q.need)return;s.got=s.got||[];if(cell)s.got.push(cell);s.n=(s.n||0)+1;store();
msg('Quête « '+q.n+' » : '+s.n+'/'+q.need+(s.n>=q.need?'. Retourne voir le Maître Lampiste.':'.'))};
EX.talk=p=>{const Q=qs(),B=[];let t=p.txt;
(p.quests||[]).forEach(id=>{const q=DATA.quetes[id],s=Q[id];
if(!s){if((q.req||0)<=sv.renc)B.push(['Accepter : '+q.n,q.desc,false,()=>{Q[id]={s:1,n:0,got:[]};store();EX.enter(EX.map,EX.x,EX.y);$('sayEl').innerHTML='<b>'+p.n+'</b> : '+q.say;EX.ui();EX.draw();EX.log()},false])}
else if(s.s==1){const ok=s.n>=q.need,afford=!q.cost||Object.keys(q.cost).every(k=>sv.res[k]>=q.cost[k]);
if(ok)B.push(['Terminer : '+q.n,q.cost?'coût : '+Object.keys(q.cost).map(k=>q.cost[k]+' '+DATA.res[k].split(' ')[0]).join(' '):'récompense',true,()=>{
if(q.cost)Object.keys(q.cost).forEach(k=>sv.res[k]-=q.cost[k]);s.s=2;const g=EX.gain(q.rew);EX.enter(EX.map,EX.x,EX.y);$('sayEl').innerHTML='<b>'+p.n+'</b> : '+q.fin;msg('Quête terminée !'+g);EX.ui();EX.draw();EX.log()},!afford])
else t+=' ('+q.n+' : '+s.n+'/'+q.need+')'}});
(p.trade||[]).forEach(tr=>{const lab=o=>Object.keys(o).map(k=>o[k]+' '+DATA.res[k].split(' ')[0]).join(' '),ok=Object.keys(tr.give).every(k=>sv.res[k]>=tr.give[k]);
B.push(['Échanger '+lab(tr.give),'contre '+lab(tr.get),false,()=>{Object.keys(tr.give).forEach(k=>sv.res[k]-=tr.give[k]);Object.keys(tr.get).forEach(k=>sv.res[k]+=tr.get[k]);store();EX.talk(p)},!ok])});
$('sayEl').innerHTML='<b>'+p.n+'</b> : '+t;EX.hud();$('bar').innerHTML='';B.forEach(b=>mk(b[0],b[1],b[2],b[3],b[4]));mk('Fermer','',false,()=>{EX.ui();EX.draw()},false);msg('')};
EX.click=e=>{if(EX.walking)return;const rc=cv.getBoundingClientRect(),a=(e.clientX-rc.left-ox)/(tw/2),b=(e.clientY-rc.top-oy)/(th/2),
x=Math.round((a+b)/2),y=Math.round((b-a)/2),N=DATA.taille,d=DATA.cartes[EX.map];
if(x<0||y<0||x>=N||y>=N||(x==EX.x&&y==EX.y))return;
if(d.rocks.some(r=>r[0]==x&&r[1]==y)){EX.pend=null;msg('Un rocher bloque le passage.');EX.draw();return}
const ent=exEnt(x,y);
if(ent&&ent.t=='e'&&(sv.renc<DATA.cartes[ent.o.to].need)){EX.pend=null;msg('Passage fermé : bats d\'abord les monstres de cette zone.');EX.draw();return}
const path=exPath(x,y,ent);if(!path){EX.pend=null;msg('Aucun chemin vers cette case.');EX.draw();return}
if(!EX.pend||EX.pend.x!=x||EX.pend.y!=y){EX.pend={x,y,ent,path};
msg(!ent?'Touche encore la case pour t\'y rendre ('+path.length+' cases).':ent.t=='g'?'Groupe de monstres : touche encore pour engager le combat.':ent.t=='n'?'Ressource : touche encore pour la récolter.':ent.t=='p'?'Touche encore pour parler à '+ent.o.n+'.':'Touche encore pour partir vers '+DATA.cartes[ent.o.to].n+'.');EX.draw();return}
EX.pend=null;EX.go(path,ent)};
EX.go=async(path,ent)=>{const t=++EX.tok;EX.walking=true;
for(const [px,py] of path){await new Promise(r=>setTimeout(r,130));if(t!=EX.tok)return;
EX.x=px;EX.y=py;EX.steps++;EX.draw()}
EX.walking=false;if(!ent){msg('');return}
if(ent.t=='n')EX.harvest(ent.o);else if(ent.t=='p')EX.talk(ent.o)
else if(ent.t=='e'){const e=ent.o;EX.enter(e.to,e.tx,e.ty);msg('Tu entres : '+DATA.cartes[e.to].n+'.');EX.ui();EX.draw()}
else EX.fight(ent.o)};
EX.harvest=n=>{if(n.pick){EX.nodes=EX.nodes.filter(z=>z!==n);EX.prog(n.quest,n.id);pop(n,'Trouvé !','#ffe08a');EX.draw();return}
if(n.until>EX.steps){msg('Déjà cueilli : ça repoussera bientôt.');return}
const k=n.res;sv.res[k]+=2;n.until=EX.steps+30;store();pop(n,'+2 '+DATA.res[k].split(' ')[0],'#7fd18b');msg('Récolte : +2 '+DATA.res[k]);EX.ui();EX.draw()};
EX.fight=q=>{EX.walking=false;EX.on=false;EX.pend=null;EX.group=q;cfg.renc=q.renc;$('setup').style.display='none';$('game').classList.remove('hide');init()};
EX.back=res=>{const g0=EX.group;if(res=='win'&&g0)g0.dead=true;if(res=='lose'){sv.map='village';store();EX.map=null}
EX.start();
if(res=='lose')msg('Tu te réveilles au village, sans rien avoir perdu.');
else if(g0){if(g0.hide)EX.prog(g0.quest,g0.id);
Object.keys(DATA.quetes).forEach(id=>{const q=DATA.quetes[id];if(q.kind=='win'&&q.renc==g0.renc&&!g0.hide)EX.prog(id)})}
EX.hud()};
EX.draw=()=>{const N=DATA.taille,d=DATA.cartes[EX.map];g.clearRect(0,0,W,H);
const rocks=new Set(d.rocks.map(r=>exK(r[0],r[1]))),pp={},ex={},E={};
if(EX.pend&&EX.pend.path)EX.pend.path.forEach(t=>pp[exK(t[0],t[1])]=1);
d.exits.forEach(e=>ex[exK(e.x,e.y)]=e);
EX.groups.forEach(q=>{if(!q.dead)E[exK(q.x,q.y)]=q.hide?{e:'🌿',b:'?'}:{e:DATA.rencontres[q.renc].m[0].e,b:'×'+DATA.rencontres[q.renc].m.length}});
EX.nodes.forEach(n=>E[exK(n.x,n.y)]={e:n.pick?'🏮':DATA.resE[n.res],a:n.until>EX.steps?.25:1});
d.npcs.forEach(n=>E[exK(n.x,n.y)]={e:n.e});
E[exK(EX.x,EX.y)]={e:DATA.classes[cfg.classe].e};
g.textAlign='center';g.textBaseline='middle';g.font=Math.round(tw*.7)+'px serif';
for(let s=0;s<=2*N-2;s++)for(let x=0;x<N;x++){const y=s-x;if(y<0||y>=N)continue;const k=exK(x,y);
const cx=(x-y)*tw/2+ox,cy=(x+y)*th/2+oy,l=Math.max(0,1-Math.hypot(x-EX.x,y-EX.y)/7)*((x+y)%2?.9:1);
dia(cx,cy,col(l));if(d.tint)dia(cx,cy,d.tint);
if(ex[k]){dia(cx,cy,sv.renc<DATA.cartes[ex[k].to].need?'rgba(120,120,140,.45)':'rgba(255,180,84,.45)');g.fillStyle='#fff';g.fillText(ex[k].x==0?'⬅️':'➡️',cx,cy-th*.1)}
if(pp[k])dia(cx,cy,'rgba(255,240,170,.55)');
if(EX.pend&&EX.pend.x==x&&EX.pend.y==y)dia(cx,cy,'rgba(255,240,170,.35)');
g.fillStyle='#fff';if(rocks.has(k)){g.fillText('🪨',cx,cy-th*.15);continue}
const u=E[k];if(u){g.globalAlpha=u.a??1;g.fillText(u.e,cx,cy-th*.3);g.globalAlpha=1;
if(u.b){g.font='bold '+Math.round(tw*.3)+'px Georgia,serif';g.lineWidth=3;g.strokeStyle='#120d1a';g.strokeText(u.b,cx+tw*.3,cy-th*.7);g.fillStyle='#ffb454';g.fillText(u.b,cx+tw*.3,cy-th*.7);g.font=Math.round(tw*.7)+'px serif'}}}
const hx=(EX.x-EX.y)*tw/2+ox,hy=(EX.x+EX.y)*th/2+oy,gr=g.createRadialGradient(hx,hy,0,hx,hy,tw*3);
gr.addColorStop(0,'rgba(255,180,84,.28)');gr.addColorStop(1,'rgba(255,180,84,0)');
g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';drawFx()};
