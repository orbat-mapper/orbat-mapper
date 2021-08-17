export interface ChapterView {
  center: [number, number] | [number, number, number];
  zoom: number;
  duration?: number;
}

export interface StoryChapter {
  startTime: number | string;
  content: string;
  view: ChapterView;
}

export interface StoryStateChange {
  time?: number | string;
  view?: ChapterView;
}

export const content = `# Invasion of South Georgia

::: scroll-step
[From Wikipedia, the free encyclopedia](https://en.wikipedia.org/wiki/Invasion_of_South_Georgia)

The Argentine invasion had begun on 19 March, when a group of civilian scrap metal workers arrived at Leith Harbour on board the transport ship ARA Bahía Buen Suceso without the required landing clearance and then raised the Argentine flag. The scrap workers had been infiltrated by Argentine marines posing as civilian scientists.

[![Leith whaling station](https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Leith_whaling_station.JPG/1024px-Leith_whaling_station.JPG)](https://commons.wikimedia.org/wiki/File:Leith_whaling_station.JPG "Markabq, Public domain, via Wikimedia Commons")
:::

::: scroll-step
The only British presence at Leith on 19 March was a British Antarctic Survey (BAS) team, whose leader Trefor Edwards handed a message from London to the commander of Buen Suceso, captain Briatore, demanding the removal of the Argentine flag and the departure of the party. At the same time, the Argentine crew had to report to the top BAS commander in Grytviken, Steve Martin. Briatore replied that the mission had the approval of the British embassy in Buenos Aires.
:::

Eventually, the Argentine captain ordered the lowering of the flag, but failed to report to Grytviken. The BAS commander sent a message to the Governor of the Falkland Islands, Rex Hunt (South Georgia being run as a dependency of the Falklands). After consulting London, Hunt was instructed to dispatch HMS Endurance to South Georgia with a detachment of 22 Royal Marines.

::: scroll-step
## Promissaque pluribus tigres ab enim semina decem
:::

[![Falklands War Memorial, Stanley (Falkland Islands)](https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Falklands_War_Memorial%2C_Stanley_%28Falkland_Islands%29.jpg/1024px-Falklands_War_Memorial%2C_Stanley_%28Falkland_Islands%29.jpg)](https://commons.wikimedia.org/wiki/File:Falklands_War_Memorial,_Stanley_(Falkland_Islands).jpg "Alex Petrenko, CC BY-SA 3.0
<https://creativecommons.org/licenses/by-sa/3.0>, via Wikimedia Commons")
Lorem markdownum Cereris protervis posses o domos sceleri flagrat. Signa illud
fit vicerat aversa minis non quidem *illa ait aversata*? Rerum et penitus
[cuncta dies sociam](http://multis.com/) dryades quod Paeonia vir libasse
meliore captare. Te eandem credita dabantur successor capillos lucem *utque
impetus*.

![Argentine soldiers in Stanley during Operation Rosario](https://upload.wikimedia.org/wikipedia/commons/d/d1/Operaci%C3%B3n_Rosario-Soldados_argentinos_en_Stanley.jpg "Argentine soldiers in Stanley during Operation Rosario. ")

> Hypaepis elabique faber. Quid neque sagittis viderat? Canis illa: tempus
> quamvis pretium est sedet tinctas in patitur pedes. Saturnus conlapsa
> [freta](http://non.com/), verum casus refert laborum *ad* silvis posset,
> Delius minoribus nomina patriae, est.

## Laetitiae aethera Leucothoen pectore praemia transformata fraxinus

Numina postquam cursus, *et prosunt* tales, felicia auras monuit succincta?
Pugnae repetenda efflant vexant, alii poma Virbius nudae, sentit, facinus.
Superbus ense poma; nox forte terribilem precibus capillos enim accipit, *et*.
Radicibus quod arquato. Non quam Assyrii tristis, Lelex ipse nec gravis
nobiscum.

![Super Etendard (SUE) of the Argentine Navy in 1982. The British Task Force South was attacked by several SUE armed with 'Exocet' AM 39 missile, during the Falklands War.](https://upload.wikimedia.org/wikipedia/commons/2/24/Etendard_en_1982.jpg "Super Etendard (SUE) of the Argentine Navy in 1982. The British Task Force South was attacked by several SUE armed with 'Exocet' AM 39 missile, during the Falklands War.")

- Condita omnes
- Iuvenis sed rauco
- Properant abire honesta patefecit picta nam terra
- Cum signatur ambit

## Qui in vocant procorum Pandione nec vacuis

Dixit comitante. A aurum trepidantem summo modo [aut costis
quoque](http://nutu-solum.org/quoniam). Iunguntur Meropis vivere tinnitibus unde
edidit valuit Balearica mores quidem mollia ducar primasque supinis. Abdita tabo
fortis vacat non; harenosae antiquique munus est. Serpens nemus commissaque
nostri succincta coepere nare.

Est maturior nomen nec imagine nam magna hastam parares descenderat ducunt
delectat, avoque manet nunc caput, dempserat. Hanc emisit oras corpore laetis
illa praedator circumdata tyranno quia tenet corpus dixit dignamur tenentem. In
ditem figuram et velle Alcithoe quid parce praebita *quaeque placare* ne
patrios?

Velut vela frigore. Cultuque meroque. Ipse simul **socios** vices concordia
draconi loca iuvenum, et licet admoti modo.
`;

export const chapter: StoryChapter = {
  startTime: "1982-03-19T12:00:00-04:00",
  content: content,
  // view: {
  //   center: [-36.68777893929655, -54.14052681464578],
  //   zoom: 16,
  // },
  // view: {
  //   center: [-59.551720366539094, -52.18537397937206],
  //   zoom: 7,
  // },
  view: {
    center: [-59.705733218869675, -51.850240848550705],
    zoom: 7,
  },
};

export const actions: StoryStateChange[] = [
  {
    view: {
      center: [-36.68397072927164, -54.1422473704292],
      zoom: 14,
      duration: 0,
    },
  },
  {
    time: "1982-03-31T20:00:00-04:00",
    view: {
      center: [-36.50224501450874, -54.28311900004093],
      zoom: 14,
    },
  },
  { time: "1982-04-02T20:00:00-04:00" },
];

export const chapter2: StoryChapter = {
  startTime: "1982-03-21T08:00:00-04:00",
  content: content,
  // view: {
  //   center: [-36.68777893929655, -54.14052681464578],
  //   zoom: 16,
  // },
  view: {
    center: [-59.551720366539094, -52.18537397937206],
    zoom: 7,
  },
};

export const chapters: StoryChapter[] = [chapter];
