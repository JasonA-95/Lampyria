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
{n:'Coup de lanterne',pa:2,r:[1,1],dmg:14},{n:'Balayage',pa:4,r:[0,0],dmg:10,aoe:1}]},
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
defaite:['Peureuse','On aurait dû faire demi-tour…']}
};
