/**
 * Le macchie di sfondo di ogni schermo, prese dai metadati del file Figma.
 *
 * Sono decorazione: non prendono tocchi e non spostano niente. Stanno qui e
 * non dentro agli schermi perche' cambiano per ogni frame ma non sono una
 * scelta di codice — sono un dato del disegno, e da li' vanno riletti se il
 * disegno cambia.
 *
 * `t` e' il tipo: teal, coral e lime sono i tre SVG morbidi, `deco` sono i
 * quadrati arrotondati quasi trasparenti. Il colore dei `deco` non sta nei
 * metadati: nel disegno seguono sempre lo stesso giro, lime, verde, corallo.
 */
export type Macchia = { t: 'teal' | 'coral' | 'lime' | 'deco'; x: number; y: number; d: number }

export const DECORO: Record<string, Macchia[]> = {
  "3771:2": [{t:"teal",x:-50,y:724,d:160}, {t:"coral",x:310,y:24,d:110}],
  "3771:104": [{t:"deco",x:340,y:440,d:30}, {t:"deco",x:-20,y:500,d:40}, {t:"deco",x:320,y:680,d:80}, {t:"teal",x:310,y:-30,d:140}, {t:"coral",x:-50,y:700,d:120}, {t:"lime",x:340,y:580,d:32}],
  "3771:14": [{t:"teal",x:-40,y:700,d:140}, {t:"coral",x:320,y:-20,d:100}],
  "3771:39": [{t:"deco",x:-20,y:120,d:50}, {t:"deco",x:330,y:740,d:80}, {t:"teal",x:-50,y:660,d:150}, {t:"coral",x:320,y:-10,d:100}, {t:"lime",x:340,y:400,d:32}],
  "3771:140": [{t:"deco",x:-25,y:400,d:55}, {t:"deco",x:330,y:700,d:70}, {t:"teal",x:300,y:650,d:120}, {t:"coral",x:-30,y:-10,d:100}, {t:"lime",x:-260,y:700,d:32}],
  "3771:122": [{t:"deco",x:340,y:200,d:50}, {t:"deco",x:-30,y:650,d:65}, {t:"teal",x:-40,y:500,d:130}, {t:"coral",x:320,y:30,d:100}, {t:"lime",x:40,y:640,d:32}],
  "3775:45": [{t:"deco",x:-30,y:200,d:50}, {t:"deco",x:330,y:710,d:70}, {t:"teal",x:-40,y:500,d:130}, {t:"coral",x:320,y:30,d:100}, {t:"lime",x:-260,y:490,d:32}],
  "3775:27": [{t:"deco",x:340,y:150,d:50}, {t:"deco",x:-20,y:650,d:60}, {t:"teal",x:310,y:-30,d:140}, {t:"coral",x:-50,y:700,d:120}, {t:"lime",x:40,y:445,d:32}],
  "3775:63": [{t:"deco",x:340,y:120,d:55}, {t:"deco",x:-25,y:680,d:65}, {t:"teal",x:300,y:650,d:120}, {t:"coral",x:-30,y:-10,d:100}, {t:"lime",x:340,y:535,d:32}],
  "3771:160": [{t:"deco",x:-20,y:380,d:45}, {t:"deco",x:330,y:710,d:75}, {t:"teal",x:-40,y:700,d:140}, {t:"coral",x:310,y:-20,d:110}, {t:"lime",x:340,y:420,d:32}],
  "3775:2": [{t:"deco",x:-25,y:300,d:45}, {t:"deco",x:330,y:680,d:75}, {t:"teal",x:-40,y:300,d:120}, {t:"coral",x:330,y:650,d:90}, {t:"lime",x:340,y:400,d:32}],
  "3775:83": [{t:"deco",x:-20,y:380,d:45}, {t:"deco",x:330,y:700,d:75}, {t:"teal",x:-40,y:700,d:140}, {t:"coral",x:310,y:-20,d:110}, {t:"lime",x:40,y:580,d:32}],
  "3775:116": [{t:"deco",x:340,y:160,d:50}, {t:"deco",x:-30,y:650,d:60}, {t:"teal",x:320,y:680,d:120}, {t:"coral",x:-30,y:10,d:100}, {t:"lime",x:-260,y:625,d:32}],
  "3772:223": [{t:"deco",x:-25,y:300,d:50}, {t:"deco",x:330,y:690,d:70}, {t:"teal",x:-50,y:400,d:130}, {t:"coral",x:300,y:700,d:100}, {t:"lime",x:-260,y:520,d:32}],
  "3772:193": [{t:"deco",x:340,y:160,d:50}, {t:"deco",x:-30,y:680,d:65}, {t:"teal",x:320,y:680,d:120}, {t:"coral",x:-30,y:10,d:100}, {t:"lime",x:40,y:470,d:32}],
  "3871:2": [{t:"deco",x:-25,y:200,d:45}, {t:"deco",x:330,y:710,d:70}, {t:"teal",x:-30,y:650,d:150}, {t:"coral",x:320,y:-30,d:100}, {t:"lime",x:40,y:620,d:32}],
  "3775:164": [{t:"deco",x:340,y:100,d:55}, {t:"deco",x:-20,y:710,d:65}, {t:"teal",x:-30,y:650,d:150}, {t:"coral",x:320,y:-30,d:100}],
  "3772:241": [{t:"deco",x:340,y:100,d:55}, {t:"deco",x:-20,y:700,d:60}, {t:"teal",x:310,y:-10,d:140}, {t:"coral",x:-40,y:680,d:110}, {t:"lime",x:340,y:570,d:32}],
  "3772:261": [{t:"deco",x:-25,y:200,d:45}, {t:"deco",x:330,y:710,d:70}, {t:"teal",x:-30,y:650,d:150}, {t:"coral",x:320,y:-30,d:100}, {t:"lime",x:40,y:620,d:32}],
  "3775:190": [{t:"deco",x:-30,y:350,d:50}, {t:"deco",x:330,y:660,d:70}, {t:"teal",x:300,y:700,d:130}, {t:"coral",x:-50,y:-10,d:120}, {t:"lime",x:-260,y:760,d:32}],
  "3907:2": [{t:"deco",x:-25,y:200,d:45}, {t:"deco",x:330,y:710,d:70}, {t:"teal",x:-30,y:650,d:150}, {t:"coral",x:320,y:-30,d:100}, {t:"lime",x:40,y:620,d:32}],
  "3775:146": [{t:"deco",x:-25,y:300,d:50}, {t:"deco",x:330,y:690,d:70}, {t:"teal",x:-50,y:400,d:130}, {t:"coral",x:300,y:700,d:100}, {t:"lime",x:340,y:670,d:32}],
  "3772:287": [{t:"deco",x:340,y:120,d:55}, {t:"deco",x:-30,y:650,d:65}, {t:"teal",x:300,y:700,d:130}, {t:"coral",x:-50,y:-10,d:120}, {t:"lime",x:-260,y:670,d:32}],
  "3771:81": [{t:"deco",x:-25,y:300,d:45}, {t:"deco",x:330,y:680,d:75}, {t:"teal",x:-40,y:300,d:120}, {t:"coral",x:330,y:650,d:90}, {t:"lime",x:-260,y:520,d:32}],
  "3772:308": [{t:"deco",x:-20,y:350,d:50}, {t:"deco",x:330,y:700,d:75}, {t:"teal",x:-40,y:680,d:150}, {t:"coral",x:320,y:-20,d:100}, {t:"lime",x:340,y:380,d:32}],
  "3772:338": [{t:"deco",x:-25,y:250,d:50}, {t:"deco",x:330,y:700,d:70}, {t:"teal",x:310,y:700,d:130}, {t:"coral",x:-30,y:-10,d:110}, {t:"lime",x:40,y:435,d:32}],
  "3772:361": [{t:"deco",x:340,y:150,d:55}, {t:"deco",x:-20,y:680,d:65}, {t:"teal",x:-50,y:350,d:140}, {t:"coral",x:300,y:680,d:100}, {t:"lime",x:-260,y:490,d:32}],
  "3958:1308": [{t:"deco",x:-25,y:200,d:45}, {t:"deco",x:330,y:710,d:70}, {t:"teal",x:-30,y:650,d:150}, {t:"coral",x:320,y:-30,d:100}, {t:"lime",x:40,y:620,d:32}],
  "3958:745": [{t:"deco",x:-25,y:300,d:50}, {t:"deco",x:330,y:690,d:70}, {t:"teal",x:-50,y:400,d:130}, {t:"coral",x:300,y:700,d:100}, {t:"lime",x:-260,y:520,d:32}],
  "3958:769": [{t:"deco",x:340,y:100,d:55}, {t:"deco",x:-20,y:700,d:60}, {t:"teal",x:310,y:-10,d:140}, {t:"coral",x:-40,y:680,d:110}, {t:"lime",x:340,y:570,d:32}],
  "3958:461": [{t:"teal",x:-50,y:724,d:160}, {t:"coral",x:310,y:24,d:110}],
  "3958:592": [{t:"deco",x:340,y:200,d:50}, {t:"deco",x:-30,y:650,d:65}, {t:"teal",x:-40,y:500,d:130}, {t:"coral",x:320,y:30,d:100}, {t:"lime",x:40,y:640,d:32}],
  "3958:709": [{t:"deco",x:340,y:160,d:50}, {t:"deco",x:-30,y:680,d:65}, {t:"teal",x:320,y:680,d:120}, {t:"coral",x:-30,y:10,d:100}, {t:"lime",x:40,y:470,d:32}],
  "3958:641": [{t:"deco",x:-20,y:380,d:45}, {t:"deco",x:330,y:710,d:75}, {t:"teal",x:-40,y:700,d:140}, {t:"coral",x:310,y:-20,d:110}, {t:"lime",x:340,y:420,d:32}],
  "3958:797": [{t:"deco",x:-25,y:200,d:45}, {t:"deco",x:330,y:710,d:70}, {t:"teal",x:-30,y:650,d:150}, {t:"coral",x:320,y:-30,d:100}, {t:"lime",x:40,y:620,d:32}],
  "3958:486": [{t:"teal",x:-40,y:700,d:140}, {t:"coral",x:320,y:-20,d:100}],
  "3958:616": [{t:"deco",x:-25,y:400,d:55}, {t:"deco",x:330,y:700,d:70}, {t:"teal",x:300,y:650,d:120}, {t:"coral",x:-30,y:-10,d:100}, {t:"lime",x:-260,y:700,d:32}],
  "3958:853": [{t:"deco",x:-20,y:350,d:50}, {t:"deco",x:330,y:700,d:75}, {t:"teal",x:-40,y:680,d:150}, {t:"coral",x:320,y:-20,d:100}, {t:"lime",x:340,y:380,d:32}],
  "3958:1437": [{t:"deco",x:-30,y:350,d:50}, {t:"deco",x:330,y:660,d:70}, {t:"teal",x:300,y:700,d:130}, {t:"coral",x:-50,y:-10,d:120}, {t:"lime",x:-260,y:760,d:32}],
  "3958:567": [{t:"deco",x:340,y:440,d:30}, {t:"deco",x:-20,y:500,d:40}, {t:"deco",x:320,y:680,d:80}, {t:"teal",x:310,y:-30,d:140}, {t:"coral",x:-50,y:700,d:120}, {t:"lime",x:340,y:580,d:32}],
  "3958:538": [{t:"deco",x:-25,y:300,d:45}, {t:"deco",x:330,y:680,d:75}, {t:"teal",x:-40,y:300,d:120}, {t:"coral",x:330,y:650,d:90}, {t:"lime",x:-260,y:520,d:32}],
  "3958:1248": [{t:"deco",x:-25,y:200,d:45}, {t:"deco",x:330,y:710,d:70}, {t:"teal",x:-30,y:650,d:150}, {t:"coral",x:320,y:-30,d:100}, {t:"lime",x:40,y:620,d:32}],
  "3958:941": [{t:"deco",x:-25,y:300,d:45}, {t:"deco",x:330,y:680,d:75}, {t:"teal",x:-40,y:300,d:120}, {t:"coral",x:330,y:650,d:90}, {t:"lime",x:340,y:400,d:32}],
  "3958:996": [{t:"deco",x:-30,y:200,d:50}, {t:"deco",x:330,y:710,d:70}, {t:"teal",x:-40,y:500,d:130}, {t:"coral",x:320,y:30,d:100}, {t:"lime",x:-260,y:490,d:32}],
  "3958:1020": [{t:"deco",x:340,y:120,d:55}, {t:"deco",x:-25,y:680,d:65}, {t:"teal",x:300,y:650,d:120}, {t:"coral",x:-30,y:-10,d:100}, {t:"lime",x:340,y:535,d:32}],
  "3958:1129": [{t:"deco",x:340,y:160,d:50}, {t:"deco",x:-30,y:650,d:60}, {t:"teal",x:320,y:680,d:120}, {t:"coral",x:-30,y:10,d:100}, {t:"lime",x:-260,y:625,d:32}],
  "3958:1058": [{t:"deco",x:-20,y:380,d:45}, {t:"deco",x:330,y:700,d:75}, {t:"teal",x:-40,y:700,d:140}, {t:"coral",x:310,y:-20,d:110}, {t:"lime",x:40,y:580,d:32}],
  "3958:1192": [{t:"deco",x:340,y:100,d:55}, {t:"deco",x:-20,y:710,d:65}, {t:"teal",x:-30,y:650,d:150}, {t:"coral",x:320,y:-30,d:100}],
  "3958:1168": [{t:"deco",x:-25,y:300,d:50}, {t:"deco",x:330,y:690,d:70}, {t:"teal",x:-50,y:400,d:130}, {t:"coral",x:300,y:700,d:100}, {t:"lime",x:340,y:670,d:32}],
  "3958:1221": [{t:"deco",x:-30,y:350,d:50}, {t:"deco",x:330,y:660,d:70}, {t:"teal",x:300,y:700,d:130}, {t:"coral",x:-50,y:-10,d:120}, {t:"lime",x:-260,y:760,d:32}],
  "3958:972": [{t:"deco",x:340,y:150,d:50}, {t:"deco",x:-20,y:650,d:60}, {t:"teal",x:310,y:-30,d:140}, {t:"coral",x:-50,y:700,d:120}, {t:"lime",x:40,y:445,d:32}],
  "3889:363": [{t:"deco",x:-20,y:300,d:45}, {t:"deco",x:330,y:700,d:75}, {t:"teal",x:300,y:650,d:140}, {t:"coral",x:-50,y:-20,d:110}, {t:"lime",x:-260,y:655,d:32}],
}
