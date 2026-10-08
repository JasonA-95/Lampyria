// MOTEUR : les règles du combat. Aucun affichage ici (réutilisable côté serveur plus tard).
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
class Combat{
constructor(D){this.N=D.taille;this.rocks=new Set(D.rochers.map(r=>r.join(',')));this.S=D.sorts;
this.hero={...D.heros};this.foes=D.monstres.map(m=>({...m}));
this.PA=D.heros.pa;this.PM=D.heros.pm;this.pa=this.PA;this.pm=this.PM;this.turn=1;
this.cd=this.S.map(()=>0);this.result=null}
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
if(s.tp&&u)continue;if(s.dmg&&!(u&&u!==h))continue;r.push([x,y])}return r}
move(x,y){const d=this.reach()[x+','+y];if(!(d>0))return{ok:false,tag:'loin'};
this.pm-=d;this.hero.x=x;this.hero.y=y;return{ok:true,tag:'move'}}
cast(i,x,y){const s=this.S[i];if(this.pa<s.pa||this.cd[i]>0)return{ok:false,tag:'cout'};
if(!this.ranged(i).some(t=>t[0]==x&&t[1]==y))return{ok:false,tag:'cible'};
this.pa-=s.pa;this.cd[i]=s.cd||0;const r={ok:true,tag:s.tag};
if(s.dmg){const f=this.at(x,y);f.hp-=s.dmg;r.target=f;r.dmg=s.dmg}
if(s.heal)this.hero.hp=Math.min(this.hero.max,this.hero.hp+s.heal);
if(s.tp){this.hero.x=x;this.hero.y=y}
if(this.foes.every(f=>f.hp<=0))this.result='win';return r}
foeTurn(f){const h=this.hero;
for(let i=0;i<f.pm&&this.dist(f,h)>1;i++){const d={[h.x+','+h.y]:0},q=[[h.x,h.y]];
while(q.length){const [x,y]=q.shift();for(const [a,b] of DIRS){const nx=x+a,ny=y+b,k=nx+','+ny,u=this.at(nx,ny);
if(d[k]==null&&this.ok(nx,ny)&&(!u||u===f)){d[k]=d[x+','+y]+1;q.push([nx,ny])}}}
let best=null,bd=d[f.x+','+f.y]??99;
for(const [a,b] of DIRS){const nx=f.x+a,ny=f.y+b;if(this.free(nx,ny)&&d[nx+','+ny]<bd){bd=d[nx+','+ny];best=[nx,ny]}}
if(!best)break;f.x=best[0];f.y=best[1]}
if(this.dist(f,h)==1){h.hp-=f.d;if(h.hp<=0){h.hp=0;this.result='lose'}return f.d}return 0}
newTurn(){this.turn++;this.pa=this.PA;this.pm=this.PM;this.cd=this.cd.map(c=>Math.max(0,c-1))}
}
