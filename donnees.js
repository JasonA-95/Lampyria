// DONNEES : tout ce qu'on peut modifier sans toucher aux règles (sorts, monstres, textes).
const DATA={
taille:13,
rochers:[[5,4],[5,5],[6,8],[7,3],[8,6],[3,9],[9,7],[4,7],[10,5]],
heros:{x:1,y:6,hp:60,max:60,pa:6,pm:3,e:'🏮'},
monstres:[
{x:10,y:3,hp:24,max:24,pm:3,d:8,e:'🪰',n:'La mouche à braise'},
{x:11,y:8,hp:24,max:24,pm:3,d:8,e:'🪰',n:'La mouche à braise'},
{x:9,y:10,hp:30,max:30,pm:2,d:10,e:'🍄',n:'Le champignon bavard'}],
sorts:[
{n:'Coup de lanterne',pa:2,r:[1,1],dmg:12,tag:'coup'},
{n:'Éclat',pa:3,r:[2,5],dmg:14,los:1,tag:'tir'},
{n:'Festin (Gourmande)',pa:4,r:[0,0],heal:20,cd:3,tag:'soin'},
{n:'Sauve-qui-peut (Peureuse)',pa:2,r:[1,5],tp:1,cd:3,tag:'fuite'}],
lanterne:'Lanterne 5/5 (Gourmande 3, Peureuse 2)',
repliques:{
debut:['Gourmande','Ça se mange, ça ? On dirait un gros champignon.'],
soin:['Gourmande','À table ! Mange un morceau, tu en as besoin.'],
fuite:['Peureuse','On fuit ! On fuit !'],
coup:['Gourmande','Aïe ! Pas sur la lanterne !'],
victoire:['Gourmande','Victoire ! On mange quoi ?'],
defaite:['Peureuse','On aurait dû faire demi-tour…']}
};
