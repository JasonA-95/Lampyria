// EXPLORATION : cartes du monde, déplacement, récolte, rencontres. Utilise la grille et le style de affichage.js.
const EX={on:false,map:null,x:0,y:0,groups:[],nodes:[],pend:null,tok:0,steps:0,group:null,walking:false};
const exK=(x,y)=>x+','+y;
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
EX.x=x??d.start[0];EX.y=y??d.start[1];EX.groups=d.groups.map(q=>({...q}));EX.nodes=d.nodes.map(n=>({...n,until:0}));EX.pend=null}
EX.start=()=>{EX.on=true;EX.tok++;EX.walking=false;EX.group=null;$('setup').style.display='none';$('game').classList.remove('hide');size();
if(EX.map!==(sv.map||'village'))EX.enter(sv.map||'village');
$('tip').textContent='Touche une case, puis touche-la encore pour y aller. Rochers et monstres bloquent le passage.';
msg('Tu es : '+DATA.cartes[EX.map].n+'.');EX.ui();EX.draw()};
EX.ui=()=>{const R=DATA.res;$('hud').innerHTML='Niv <b>'+sv.niv+'</b> '+DATA.cartes[EX.map].n+' '+Object.keys(R).map(k=>R[k].split(' ')[0]+' <b>'+sv.res[k]+'</b>').join(' ');
$('bar').innerHTML='';mk('Équipement','classe, Lueurs, lampiste',false,showSetup,false)};
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
EX.x=px;EX.y=py;EX.steps++;EX.draw();
const q=EX.groups.find(q=>!q.dead&&Math.abs(q.x-px)+Math.abs(q.y-py)==1);if(q){EX.walking=false;return EX.fight(q)}}
EX.walking=false;if(!ent){msg('');return}
if(ent.t=='n')EX.harvest(ent.o);else if(ent.t=='p'){$('sayEl').innerHTML='<b>'+ent.o.n+'</b> : '+ent.o.txt;msg('Ouvre Équipement pour améliorer ta lanterne.')}
else if(ent.t=='e'){const e=ent.o;EX.enter(e.to,e.tx,e.ty);msg('Tu entres : '+DATA.cartes[e.to].n+'.');EX.ui();EX.draw()}
else EX.fight(ent.o)};
EX.harvest=n=>{if(n.until>EX.steps){msg('Déjà cueilli : ça repoussera bientôt.');return}
const k=n.res;sv.res[k]+=2;n.until=EX.steps+30;store();pop(n,'+2 '+DATA.res[k].split(' ')[0],'#7fd18b');msg('Récolte : +2 '+DATA.res[k]);EX.ui();EX.draw()};
EX.fight=q=>{EX.walking=false;EX.on=false;EX.pend=null;EX.group=q;cfg.renc=q.renc;$('setup').style.display='none';$('game').classList.remove('hide');init()};
EX.back=res=>{if(res=='win'&&EX.group)EX.group.dead=true;
if(res=='lose'){sv.map='village';store();EX.map=null}
const g0=EX.group;EX.start();if(res=='lose')msg('Tu te réveilles au village, sans rien avoir perdu.');else if(g0)EX.ui()};
EX.draw=()=>{const N=DATA.taille,d=DATA.cartes[EX.map];g.clearRect(0,0,W,H);
const rocks=new Set(d.rocks.map(r=>exK(r[0],r[1]))),pp={},ex={},E={};
if(EX.pend&&EX.pend.path)EX.pend.path.forEach(t=>pp[exK(t[0],t[1])]=1);
d.exits.forEach(e=>ex[exK(e.x,e.y)]=e);
EX.groups.forEach(q=>{if(!q.dead)E[exK(q.x,q.y)]={e:DATA.rencontres[q.renc].m[0].e,b:'×'+DATA.rencontres[q.renc].m.length}});
EX.nodes.forEach(n=>E[exK(n.x,n.y)]={e:DATA.resE[n.res],a:n.until>EX.steps?.25:1});
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
