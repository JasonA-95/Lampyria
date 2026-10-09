// DONNEES : classes, Lueurs, monstres, textes. On modifie ici sans toucher aux règles.
const DATA={
taille:13,
rochers:[[5,4],[5,5],[6,8],[7,3],[8,6],[3,9],[9,7],[4,7],[10,5]],
heros:{x:1,y:6,pa:6,pm:3},
monstres:[
{x:10,y:3,hp:24,max:24,pm:3,d:8,e:'🪰',n:'La mouche à braise'},
{x:11,y:8,hp:24,max:24,pm:3,d:8,e:'🪰',n:'La mouche à braise'},
{x:9,y:10,hp:30,max:30,pm:2,d:10,e:'🍄',n:'Le champignon bavard'}],
classes:{
porte:{n:'Porte-Lanterne',e:'🏮',hp:70,info:'mêlée, résistant',sorts:[
{n:'Coup de lanterne',pa:2,r:[1,1],dmg:14,push:1},{n:'Balayage',pa:4,r:[0,0],dmg:10,aoe:1}]},
archer:{n:'Archer Farceur',e:'🏹',hp:45,info:'distance, fragile',sorts:[
{n:'Tir précis',pa:2,r:[2,6],los:1,dmg:11},{n:'Tir double',pa:4,r:[2,5],los:1,dmg:24}]},
mage:{n:'Mage Distrait',e:'🧙',hp:38,info:'zone, peu de vie',sorts:[
{n:'Éclair',pa:2,r:[2,6],los:1,dmg:9},{n:'Cendres',pa:4,r:[2,5],dmg:12,aoe:1}]}},
lueurs:{
colerique:{n:'Colérique',t:5,sort:{n:'Accès de rage',pa:1,r:[0,0],rage:1,cd:3,say:'rage'}},
peureuse:{n:'Peureuse',t:2,sort:{n:'Sauve-qui-peut',pa:2,r:[1,5],tp:1,cd:3,say:'fuite'}},
gourmande:{n:'Gourmande',t:3,sort:{n:'Festin',pa:4,r:[0,0],heal:20,cd:3,say:'soin'}},
reveuse:{n:'Rêveuse',t:3,sort:{n:'Somnolence',pa:3,r:[1,4],los:1,sleep:1,cd:2,say:'sommeil'}},
tetue:{n:'Têtue',t:4,sort:{n:"Mur d'entêtement",pa:2,r:[0,0],mur:1,cd:4,say:'mur'}},
farceuse:{n:'Farceuse',t:3,sort:{n:'Tour pendable',pa:3,r:[1,5],los:1,swap:1,cd:3,say:'farce'}},
melancolique:{n:'Mélancolique',t:4,sort:{n:'Ombre douce',pa:3,r:[1,4],los:1,dmg:12,drain:1,cd:2,say:'ombre'}}},
repliques:{
debut:['Gourmande','Ça se mange, ça ? On dirait un gros champignon.'],
soin:['Gourmande','À table ! Mange un morceau, tu en as besoin.'],
fuite:['Peureuse','On fuit ! On fuit !'],
rage:['Colérique','Frappe-le ! Frappe-le ! FRAPPE-LE !'],
sommeil:['Rêveuse','Chut… fais de beaux rêves…'],
mur:['Têtue',"Je ne bouge plus d'ici. Personne ne passe."],
farce:['Farceuse','Hop ! Qui est où ? Même moi je ne sais plus.'],
ombre:['Mélancolique',"Il paraît que le soleil était plus joli que ça."],
coup:['Gourmande','Aïe ! Pas sur la lanterne !'],
victoire:['Gourmande','Victoire ! On mange quoi ?'],
defaite:['Peureuse','On aurait dû faire demi-tour…'],
formulaire:['Gourmande',"C'est quoi ce papier qui flotte ? Il faut le déchirer… ou le jeter dehors !"]}
};
const mou=(x,y)=>({x,y,hp:24,max:24,pm:3,d:8,e:'🪰',n:'La mouche à braise'}),cha=(x,y)=>({x,y,hp:30,max:30,pm:2,d:10,e:'🍄',n:'Le champignon bavard'}),mot=(x,y)=>({x,y,hp:28,max:28,pm:3,d:9,e:'🐑',n:'Le mouton-fantôme'});
DATA.res={braise:'🔥 Braises',champi:'🍄 Champignons',laine:'🐑 Laine'};
DATA.rencontres=[
{n:'Village des Lanternes',xp:30,loot:{braise:4},m:[mou(10,3),mou(11,8)]},
{n:'Forêt des Champignons Lumineux',xp:55,loot:{champi:4,laine:2},m:[cha(10,3),cha(11,8),mot(9,10)]},
{n:'Collines aux Moutons-Fantômes',xp:90,loot:{laine:5,braise:3},m:[mot(10,3),mot(11,8),mot(9,10),cha(11,5)]}];
DATA.lampiste=[{cap:5,cout:{braise:4}},{cap:8,cout:{champi:4,laine:4}},{cap:12,cout:{braise:8,champi:6,laine:8}}];
const boss=(x,y)=>({x,y,hp:90,max:90,pm:2,d:12,e:'👻',n:'Le Chambellan Poussière',boss:1}),frm=(x,y)=>({x,y,hp:15,max:15,pm:0,d:0,e:'📜',n:'Le formulaire',form:1});
DATA.rencontres.push({n:'Manoir du Chambellan (boss)',xp:150,loot:{braise:8,laine:4,champi:4},say:'formulaire',m:[boss(11,7),frm(11,6),mou(9,3),mou(10,9)]});
DATA.resE={braise:'🔥',champi:'🍄',laine:'🧶'};
DATA.cartes={
village:{n:'Village des Lanternes',need:0,start:[3,6],tint:'rgba(255,170,80,.08)',
rocks:[[5,2],[5,3],[7,9],[8,9],[2,9],[10,3],[9,2],[6,10],[11,10]],
npcs:[{x:6,y:4,e:'🧓',n:'Maître Lampiste',quests:['q1','q2','q3'],txt:"Ta lanterne réagit à cette Lueur… fascinant ! Rapporte-moi des ressources et je lui ferai de la place (bouton Équipement)."},
{x:4,y:8,e:'🧔',n:'Le marchand',txt:"Je ne prends pas de braises en pièces, mais j'échange volontiers !",trade:[{give:{laine:2},get:{braise:1}},{give:{braise:2},get:{champi:1}},{give:{champi:2},get:{laine:1}},{give:{braise:1},get:{laine:1}}]}],
picks:[{x:1,y:2,quest:'q1'},{x:9,y:10,quest:'q1'},{x:12,y:2,quest:'q1'}],
groups:[{x:10,y:4,renc:0},{x:10,y:8,renc:0}],
nodes:[{x:7,y:2,res:'braise'},{x:3,y:10,res:'braise'}],
exits:[{x:12,y:6,to:'foret',tx:1,ty:6}]},
foret:{n:'Forêt des Champignons Lumineux',need:1,start:[1,6],tint:'rgba(60,150,90,.16)',
rocks:[[4,3],[4,4],[7,8],[8,8],[6,2],[9,3],[3,9],[10,10]],npcs:[],
hides:[{x:3,y:7,renc:1,quest:'q3'},{x:8,y:3,renc:1,quest:'q3'},{x:11,y:8,renc:1,quest:'q3'}],
groups:[{x:9,y:5,renc:1},{x:9,y:10,renc:1}],
nodes:[{x:2,y:3,res:'champi'},{x:5,y:10,res:'champi'},{x:10,y:2,res:'laine'}],
exits:[{x:0,y:6,to:'village',tx:11,ty:6},{x:12,y:6,to:'collines',tx:1,ty:6}]},
collines:{n:'Collines aux Moutons-Fantômes',need:2,start:[1,6],tint:'rgba(130,160,210,.14)',
rocks:[[3,3],[4,3],[6,8],[7,8],[9,5],[10,5],[2,9]],npcs:[],
groups:[{x:8,y:3,renc:2},{x:9,y:9,renc:2}],
nodes:[{x:2,y:2,res:'laine'},{x:5,y:10,res:'laine'},{x:11,y:10,res:'braise'}],
exits:[{x:0,y:6,to:'foret',tx:11,ty:6},{x:12,y:6,to:'manoir',tx:1,ty:6}]},
manoir:{n:'Manoir du Chambellan',need:3,start:[1,6],tint:'rgba(130,70,170,.2)',
rocks:[[4,2],[4,10],[8,2],[8,10],[6,4],[6,8]],npcs:[],
groups:[{x:10,y:6,renc:3}],
nodes:[{x:2,y:2,res:'braise'},{x:2,y:10,res:'champi'}],
exits:[{x:0,y:6,to:'collines',tx:11,ty:6}]}};
DATA.quetes={
q1:{n:'Lanternes perdues',desc:'Retrouve 3 lanternes égarées dans le village.',need:3,kind:'pick',say:"Trois lanternes ont roulé hors de ma boutique. Ouvre l'œil : elles brillent encore un peu.",fin:"Les voilà ! Tu es plus doué pour les retrouver que pour les livrer.",rew:{xp:40,res:{braise:3}}},
q2:{n:'Courrier volé',desc:'Repousse 2 groupes de voleurs de courrier devant le village.',need:2,kind:'win',renc:0,say:"Des monstres dévalisent mes livraisons. Repousse-en deux groupes, tu veux bien ?",fin:"Mon courrier est sauf. Enfin, ce qu'il en reste.",rew:{xp:50,res:{braise:2}}},
q3:{n:"La Lueur qui s'enfuit",desc:'Trouve les 3 cachettes (🌿) de la Peureuse dans la forêt, puis offre-lui une tarte (3 🍄).',need:3,kind:'hide',req:1,cost:{champi:3},say:"Une autre Lueur se cache dans la forêt. Elle a peur de tout. Cherche les buissons suspects.",fin:"Ta Gourmande a eu raison : une tarte aux champignons, et la Peureuse sort enfin. Elle te suit.",rew:{xp:80,lueur:'peureuse'}}};

