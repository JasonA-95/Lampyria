// MOTEUR : les règles du combat. Aucun affichage ici (réutilisable côté serveur plus tard).
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
class Combat{
constructor(D,cfg){const c=D.classes[cfg.classe];this.N=D.taille;this.rocks=new Set(D.rochers.map(r=>r.join(',')));
this.S=[...c.sorts,...cfg.lueurs.map(id=>D.lueurs[id].sort)];
this.hero={x:D.heros.x,y:D.heros.y,hp:c.hp+8*(cfg.niv-1),max:c.hp+8*(cfg.niv-1),e:c.e,rage:false,mur:0};
this.foes=D.rencontres[cfg.renc].m.map(m=>({...m}));this.bonus=cfg.niv-1;this.PA=D.heros.pa;this.PM=D.heros.pm;this.pa=this.PA;this.pm=this.PM;
this.turn=1;this.cd=this.S.map(()=>0);this.result=null;this.noMove=0;this.malus=0;this.vuln=0}
bossInv(){return this.foes.some(g=>g.form&&g.hp>0)}
zone(i){const s=this.S[i],r=[];for(let x=0;x<this.N;x++)for(let y=0;y<this.N;y++){const m=this.dist(this.hero,{x,y});if(m>=s.r[0]&&m<=s.r[1]&&this.ok(x,y))r.push([x,y])}return r}
ok(x,y){return x>=0&&y>=0&&x<this.N&&y<this.N&&!this.rocks.has(x+','+y)}
at(x,y){const h=this.hero;return x==h.x&&y==h.y?h:this.foes.find(f=>f.hp>0&&f.x==x&&f.y==y)}
free(x,y){return this.ok(x,y)&&!this.at(x,y)}
dist(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
reach(){const h=this.hero,d={[h.x+','+h.y]:0},q=[[h.x,h.y]];
while(q.length){const [x,y]=q.shift(),k=d[x+','+y];if(k>=this.pm)continue;
for(const [a,b] of DIRS){const nx=x+a,ny=y+b;if(this.free(nx,ny)&&d[nx+','+ny]==null){d[nx+','+ny]=k+1;q.push([nx,ny])}}}return d}
los(a,b){let x=a.x,y=a.y;const dx=Math.abs(b.x-x),dy=Math.abs(b.y-y),sx=x<b.x?1:-1,sy=y<b.y?1:-1;let e=dx-dy;
while(x!=b.x||y!=b.y){const e2=2*e;if(e2>-dy){e-=dy;x+=sx}if(e2<dx){e+=dx;y+=sy}
if((x!=b.x||y!=b.y)&&this.rocks.has(x+','+y))return false}return true}
ranged(i){const s=this.S[i],h=this.hero,r=[];
for(let x=0;x<this.N;x++)for(let y=0;y<this.N;y++){const m=this.dist(h,{x,y}),u=this.at(x,y);
if(m<s.r[0]||m>s.r[1]||!this.ok(x,y)||(s.los&&!this.los(h,{x,y})))continue;
if(s.tp&&u)continue;if(((s.dmg&&s.aoe==null)||s.sleep||s.swap)&&!(u&&u!==h))continue;r.push([x,y])}return r}
move(x,y){const d=this.reach()[x+','+y];if(!(d>0))return{ok:false,tag:'loin'};
this.pm-=d;this.hero.x=x;this.hero.y=y;return{ok:true,tag:''}}
cast(i,x,y){const s=this.S[i],h=this.hero;if(this.pa<s.pa||this.cd[i]>0)return{ok:false,tag:'cout'};
if(!this.ranged(i).some(t=>t[0]==x&&t[1]==y))return{ok:false,tag:'cible'};
this.pa-=s.pa;this.cd[i]=s.cd||0;const r={ok:true,tag:s.say||'',dmg:0,hit:[]},inv0=this.bossInv();
if(s.dmg){const m=h.rage?2:1;h.rage=false;
const T=s.aoe!=null?this.foes.filter(f=>f.hp>0&&this.dist(f,{x,y})<=s.aoe):[this.at(x,y)];
const dm=s.dmg+this.bonus;for(const f of T){if(f.boss&&inv0){r.blocked=1;continue}f.hp-=dm*m;f.sleep=false;r.hit.push(f)}r.dmg=dm*m;
if(s.push)for(const f of T){if(f.boss||f.hp<=0)continue;const ax=f.x-h.x,ay=f.y-h.y,dx=Math.abs(ax)>=Math.abs(ay)?Math.sign(ax):0,dy=dx?0:Math.sign(ay);
for(let i=0;i<s.push;i++){const nx=f.x+dx,ny=f.y+dy;if(nx<0||ny<0||nx>=this.N||ny>=this.N){if(f.form){f.hp=0;r.out=1}break}if(this.free(nx,ny)){f.x=nx;f.y=ny}else break}}}
if(s.drain)h.hp=Math.min(h.max,h.hp+Math.round(s.dmg*(1-h.hp/h.max))+2);
if(s.heal)h.hp=Math.min(h.max,h.hp+s.heal);
if(s.tp){h.x=x;h.y=y}
if(s.rage){h.rage=true;this.malus=1}
if(s.mur){h.mur=2;this.noMove=1;this.pm=0}
if(s.sleep)this.at(x,y).sleep=true;
if(s.swap){const f=this.at(x,y);[f.x,h.x]=[h.x,f.x];[f.y,h.y]=[h.y,f.y]}
if(inv0&&!this.bossInv()){this.vuln=2;r.formDown=1}
if(this.foes.filter(f=>!f.form).every(f=>f.hp<=0))this.result='win';return r}
path(x,y){const h=this.hero,p={},d={[h.x+','+h.y]:0},q=[[h.x,h.y]];
while(q.length){const [a,b]=q.shift();if(a==x&&b==y)break;const k=d[a+','+b];if(k>=this.pm)continue;
for(const [i,j] of DIRS){const nx=a+i,ny=b+j,n=nx+','+ny;if(this.free(nx,ny)&&d[n]==null){d[n]=k+1;p[n]=[a,b];q.push([nx,ny])}}}
const r=[];let c=[x,y];while(c&&(c[0]!=h.x||c[1]!=h.y)){r.push(c);c=p[c[0]+','+c[1]]}return r}
followForm(b){const fm=this.foes.find(g=>g.form&&g.hp>0);if(!fm)return;const h=this.hero,db=this.dist(b,h);
const c=DIRS.map(([a,d])=>({x:b.x+a,y:b.y+d})).filter(p=>(p.x==fm.x&&p.y==fm.y)||this.free(p.x,p.y));
if(!c.length||c.some(p=>p.x==fm.x&&p.y==fm.y&&this.dist(p,b)==1))return;
c.sort((p,q)=>Math.abs(this.dist(p,h)-db)-Math.abs(this.dist(q,h)-db));fm.x=c[0].x;fm.y=c[0].y}
foeTurn(f){const h=this.hero;if(f.form||f.hp<=0)return 0;if(f.sleep){f.sleep=false;return -1}
for(let i=0;i<f.pm&&this.dist(f,h)>1;i++){const d={[h.x+','+h.y]:0},q=[[h.x,h.y]];
while(q.length){const [x,y]=q.shift();for(const [a,b] of DIRS){const nx=x+a,ny=y+b,k=nx+','+ny,u=this.at(nx,ny);
if(d[k]==null&&this.ok(nx,ny)&&(!u||u===f)){d[k]=d[x+','+y]+1;q.push([nx,ny])}}}
let best=null,bd=d[f.x+','+f.y]??99;
for(const [a,b] of DIRS){const nx=f.x+a,ny=f.y+b;if(this.free(nx,ny)&&d[nx+','+ny]<bd){bd=d[nx+','+ny];best=[nx,ny]}}
if(!best)break;f.x=best[0];f.y=best[1]}
if(f.boss)this.followForm(f);
if(this.dist(f,h)==1){const dm=h.mur>0?Math.ceil(f.d/2):f.d;h.hp-=dm;if(h.hp<=0){h.hp=0;this.result='lose'}return dm}return 0}
newTurn(){const h=this.hero;this.turn++;this.pa=this.PA;this.pm=this.noMove>0?0:this.PM-this.malus;this.malus=0;
if(this.vuln>0&&--this.vuln==0){const b=this.foes.find(f=>f.boss&&f.hp>0),fm=this.foes.find(f=>f.form);
if(b&&fm)for(const [a,c] of DIRS)if(this.free(b.x+a,b.y+c)){fm.x=b.x+a;fm.y=b.y+c;fm.hp=fm.max;break}}
if(this.noMove>0)this.noMove--;h.mur=Math.max(0,h.mur-1);this.cd=this.cd.map(c=>Math.max(0,c-1))}
}
