'use client';

import { useState } from 'react';
import Link from 'next/link';

type Language = 'en' | 'af' | 'xh';

// Define the structure of an archive item
interface ArchiveItem {
  id: string;
  titleEn: string;
  titleAf: string;
  titleXh: string;
  images?: string[];          // array of image paths
  textEn?: string[];           // array of paragraphs (if any)
  textAf?: string[];
  textXh?: string[];
  pdf?: string;                 // path to PDF file (if any)
  imagesPerRow: number;         // how many images per row for this section
}

// Helper to generate sequential image paths
const range = (start: number, end: number, prefix: string, ext: string = 'jpg') => 
  Array.from({ length: end - start + 1 }, (_, i) => `${prefix}${start + i}.${ext}`);

const archiveData: ArchiveItem[] = [
  {
    id: 'crafts-alive',
    titleEn: "e'Bosch Crafts Alive Development Project",
    titleAf: "e'Bosch Crafts Alive Ontwikkelingsprojek",
    titleXh: 'Iprojekthi yoPhuhliso lweCrafts Alive ye-eBosch',
    // remove craftalive4
    images: [
      '/archives/craftsalive/craftalive1.jpg',
      '/archives/craftsalive/craftalive2.jpeg',
      '/archives/craftsalive/craftalive3.jpeg',
    ],
    textEn: [
      "The e'Bosch Craft Alive Development Project fostered collaboration across Stellenbosch's communities and sectors to strengthen the local craft industry as part of the town's socio-economic landscape. It promoted recognition and support for crafts as a way to empower skilled and motivated individuals, offering them job opportunities, sustainable income, and a deeper sense of belonging. The initiative contributed to positioning Stellenbosch as a true Centre for Entrepreneurship."
    ],
    textAf: [
      "Die e'Bosch Craft Alive-ontwikkelingsprojekt het samewerking oor Stellenbosch se gemeenskappe en sektore heen bevorder om die plaaslike kunsvlytbedryf as deel van die dorp se sosio-ekonomiese landskap te versterk. Dit het erkenning en ondersteuning vir kunsvlyt bevorder as 'n manier om bekwame en gemotiveerde individue te bemagtig, deur werksgeleenthede, volhoubare inkomste en 'n dieper gevoel van behoort aan hulle te bied. Die inisiatief het bygedra om Stellenbosch as 'n ware Sentrum vir Entrepreneurskap te posisioneer."
    ],
    textXh: [
      "Iprojekthi yoPhuhliso lweCrafts Alive ye-eBosch ikhuthaze intsebenziswano kwiindawo zoluntu zaseStellenbosch kunye namacandelo ukuqinisa ishishini lasekuhlaleni lezandla njengenxalenye yemeko yezoqoqosho lwedolophu. Ikhuthaze ukuqatshelwa kunye nenkxaso yemisebenzi yezandla njengendlela yokuxhobisa abantu abanezakhono nabakhuthazekileyo, ibanike amathuba emisebenzi, ingeniso ezinzileyo, kunye nemvakalelo enzulu yokuba yinxalenye. Eli nyathelo libe negalelo ekubekeni iStellenbosch njengeZiko loShishino lokwenene."
    ],
    pdf: '/archives/craftsalive/ebosch_crafts_alive_project.pdf',
    imagesPerRow: 3, // one row
  },
  {
    id: 'wildlands',
    titleEn: 'Wildlands celebrate Arbor Week',
    titleAf: 'Wildlands vier Boomplantweek',
    titleXh: 'I-Wildlands ibhiyozela iVeki yokuTyalwa kweMithi',
    images: range(1, 6, '/archives/wildlands/wildlands', 'jpg'),
    textEn: [
      "The lower Eerste River near Die Laan was the site of a collaborative tree-planting initiative to celebrate Arbor Week. Led by WILDLANDS and the e'Bosch Heritage Project, the event formed part of a broader ecological restoration effort involving Stellenbosch Municipality, Stellenbosch University, and the Stellenbosch Trail Fund. Indigenous trees were planted to rehabilitate the riverbanks where alien vegetation had been cleared, with residents donating commemorative trees marked by personalized plaques.",
      "Local partners, including Trees-SA and Stelkor medical professionals, contributed generously to the effort, reinforcing a shared commitment to environmental stewardship. The Willems family also honored their legacy by donating trees to the park and riverbank. The initiative highlighted the power of sustainable partnerships and community involvement in protecting Stellenbosch's natural heritage.",
      "@WildlandsSA #SustainableFutureforAll #ArborWeek #MakingADifference",
      "STELLENBOSCH MUNCIPALITY @StellenboschMunicipality @STBClimateChangeProject",
      "UNIVERSITY STELLENBOSCH @StellenboschUniversity",
      "TREES-SA: @TreesSouthAfrica",
      "WESTERN CAPE GOV. DEA &DP @WCGovEADP",
      "KaapAgri  https://www.instagram.com/agrimark  Facebook/agrimark",
      "@eBoschHeritageProject"
    ],
    textAf: [
      "Die laer Eersterivier naby Die Laan was die terrein van 'n gesamentlike boomplant-inisiatief om Boomplantweek te vier. Gelei deur WILDLANDS en die e'Bosch Erfenisprojek, het die geleentheid deel gevorm van 'n breër ekologiese restourasiepoging waarby Stellenbosch Munisipaliteit, Stellenbosch Universiteit en die Stellenbosch Trail Fund betrokke was. Inheemse bome is geplant om die rivierwalle waar uitheemse plantegroei verwyder is, te rehabiliteer, met inwoners wat herdenkingsbome geskenk het wat met persoonlike gedenkplate gemerk is.",
      "Plaaslike vennote, insluitend Trees-SA en Stelkor mediese professionele persone, het ruim bygedra tot die poging, wat 'n gedeelde verbintenis tot omgewingsbewaring versterk het. Die Willems-familie het ook hul nalatenskap vereer deur bome aan die park en rivieroewer te skenk. Die inisiatief het die krag van volhoubare vennootskappe en gemeenskapsbetrokkenheid by die beskerming van Stellenbosch se natuurlike erfenis beklemtoon.",
      "@WildlandsSA #SustainableFutureforAll #ArborWeek #MakingADifference",
      "STELLENBOSCH MUNISIPALITEIT @StellenboschMunicipality @STBClimateChangeProject",
      "UNIVERSITEIT STELLENBOSCH @StellenboschUniversity",
      "TREES-SA: @TreesSouthAfrica",
      "WES-KAAP REGERING. DEA &DP @WCGovEADP",
      "KaapAgri  https://www.instagram.com/agrimark  Facebook/agrimark",
      "@eBoschHeritageProject"
    ],
    textXh: [
      "Umlambo i-Eerste ongezantsi kufutshane ne-Die Laan wawuyindawo yenyathelo lentsebenziswano lokutyala imithi ukubhiyozela iVeki yokuTyalwa kweMithi. Ikhokelwa yi-WILDLANDS kunye neProjekthi yeLifa le-e'Bosch, umsitho wawuyinxalenye yeenzame zokubuyisela indalo ebandakanya uMasipala waseStellenbosch, iYunivesithi yaseStellenbosch, kunye neNgxowa-mali yeNdlela yaseStellenbosch. Kwatyalwa imithi yemveli ukuze kulungiswe iindonga zemilambo apho kususwe izityalo zasemzini, nabahlali banikela ngemithi yesikhumbuzo ephawulwe ngamacwecwe abucala.",
      "Amahlakani asekuhlaleni, kuquka i-Trees-SA kunye neengcali zonyango zaseStelkor, anikele ngesisa kulo mzamo, eqinisa ukuzinikela ekukhathaleleni okusingqongileyo. Usapho lakwaWillems luye lwawonga ilifa labo ngokunikela ngemithi epakini naselunxwemeni lomlambo. Eli nyathelo libalaselise amandla obuhlakani obuzinzileyo kunye nokubandakanyeka koluntu ekukhuseleni ilifa lemveli laseStellenbosch.",
      "@WildlandsSA #SustainableFutureforAll #ArborWeek #MakingADifference",
      "U MASIPALA WASE STELLENBOSCH @StellenboschMunicipality @STBClimateChangeProject",
      "IYUNIVESITHI YASE STELLENBOSCH @StellenboschUniversity",
      "TREES-SA: @TreesSouthAfrica",
      "WESTERN CAPE GOV. DEA &DP @WCGovEADP",
      "KaapAgri  https://www.instagram.com/agrimark  Facebook/agrimark",
      "@eBoschHeritageProject"
    ],
    imagesPerRow: 6, // one row
  },
  {
    id: 'land-art',
    titleEn: 'Land Art Gathering',
    titleAf: 'Land Art Byeenkoms',
    titleXh: 'Indibano yobuGcisa boMhlaba',
    images: range(1, 5, '/archives/landart/landart', 'jpg'),
    textEn: [
      "The Land Art Gathering successfully brought the community together through children's workshops, art, storytelling, and biking—all centered on reconnecting with rivers. A photographic exhibition at GUS showcased powerful river stories, while transport was arranged for Ida's Valley residents. The Kayamandi community played a key role by inviting participants with unique river experiences."
    ],
    textAf: [
      "Die Land Art-byeenkoms het die gemeenskap suksesvol byeengebring deur kinders se werkswinkels, kuns, storievertelling en fietsry – alles gerig op hereniging met riviere. 'n Foto-uitstalling by GUS het kragtige rivierstories ten toon gestel, terwyl vervoer vir inwoners van Ida-vallei gereël is. Die Kayamandi-gemeenskap het 'n sleutelrol gespeel deur deelnemers met unieke rivierervarings uit te nooi."
    ],
    textXh: [
      "Indibano yobuGcisa boMhlaba iye yadibanisa uluntu ngempumelelo ngee-workshops zabantwana, ubugcisa, ukubalisa amabali, kunye nokukhwela ibhayisekile—konke kugxile ekudibaniseni nemilambo. Umboniso weefoto eGUS ubonise amabali anamandla emilambo, ngelixa kwacwangciswa izithuthi kubahlali base-Ida's Valley. Uluntu lwaseKayamandi lube nendima ephambili ngokumema abathathi-nxaxheba abanamava akhethekileyo emilambo."
    ],
    imagesPerRow: 5, // one row
  },
  {
    id: 'biosphere',
    titleEn: 'Environment and the Cape Winelands Biosphere Reserve',
    titleAf: 'Omgewing en die Kaapse Wynland Biosfeerreservaat',
    titleXh: 'OkusiNgqongileyo kunye neNdawo yoLondolozo lweNdalo yaseCape Winelands',
    textEn: [
      "Stellenbosch Municipality revised its Integrated Development Plan (IDP) and Spatial Development Framework (SDF) with input from e'Bosch, reflecting their shared commitment to a sustainability culture rooted in cooperation and nation-building. The Cape Winelands Biosphere Reserve, part of Stellenbosch's jurisdiction, was recognized by UNESCO as an environmental asset. e'Bosch emphasized that culture alongside environmental, social, and economic factors are a key pillar of sustainable development.",
      "Prepared by Dennis Moss, thought leader of e'Bosch."
    ],
    textAf: [
      "Stellenbosch Munisipaliteit het sy Geïntegreerde Ontwikkelingsplan (GOP) en Ruimtelike Ontwikkelingsraamwerk (ROR) hersien met insette van e'Bosch, wat hul gedeelde verbintenis tot 'n volhoubaarheidskultuur wat in samewerking en nasiebou gewortel is, weerspieël. Die Kaapse Wynland Biosfeerreservaat, deel van Stellenbosch se jurisdiksie, is deur UNESCO as 'n omgewingsbate erken. e'Bosch het beklemtoon dat kultuur saam met omgewings-, sosiale en ekonomiese faktore 'n sleutelpilaar van volhoubare ontwikkeling is.",
      "Voorberei deur Dennis Moss, denkleier van e'Bosch."
    ],
    textXh: [
      "uMasipala waseStellenbosch uhlaziye iSicwangciso sawo soPhuhliso esiDityanisiweyo (IDP) kunye neSakhelo soPhuhliso lweNdawo (SDF) ngegalelo le-e'Bosch, ebonisa ukuzinikela kwabo ngokubambisanayo kwinkcubeko yozinzo esekwe kwintsebenziswano nasekwakheni uhlanga. INdawo yoLondolozo lweNdalo yaseCape Winelands, eyinxalenye yolawulo lwaseStellenbosch, yaqatshelwa yi-UNESCO njenge-asethi yokusingqongileyo. I-e'Bosch igxininise ukuba inkcubeko kunye nemiba yokusingqongileyo, yentlalo, nezoqoqosho yintsika ephambili yophuhliso oluzinzileyo.",
      "Iilungiswe nguDennis Moss, inkokheli yeengcinga ye-e'Bosch."
    ],
    pdf: '/archives/biosphere/ebosch_stb_idp_sdf_discussion_doc.pdf',
    imagesPerRow: 1, // no images
  },
  {
    id: '100-identities',
    titleEn: 'Stellenbosch Celebrates 100 Identities in Africa',
    titleAf: 'Stellenbosch vier 100 identiteite in Afrika',
    titleXh: 'IStellenbosch Ibhiyozela iiNkcukacha ezili-100 eAfrika',
    images: range(1, 5, '/archives/100identities/celebration', 'jpg'),
    textEn: [
      "Stellenbosch University's Transformation Office, in collaboration with the SU Museum, Woordfees, and the Department of Social Impact, hosted an event celebrating 100 African identities. Around 200 guests enjoyed local food and music from surrounding communities, highlighting the region's diversity.",
      "A panel discussion, moderated by Renee Hector-Kannemeyer of Matie Community Service, featured voices from across Stellenbosch: Yeki Mosomothane (SU student communities), Dennis Moss (town planner), Stephané Conradie (Visual Arts doctoral student), and Shirle Cornellisen (Faculty of Theology), each sharing unique perspectives to foster unity and shared purpose."
    ],
    textAf: [
      "Stellenbosch Universiteit se Transformasiekantoor, in samewerking met die SU Museum, Woordfees, en die Departement van Sosiale Impak, het 'n geleentheid aangebied wat 100 Afrika-identiteite vier. Ongeveer 200 gaste het plaaslike kos en musiek uit omliggende gemeenskappe geniet, wat die streek se diversiteit beklemtoon.",
      "'n Paneelbespreking, aangebied deur Renee Hector-Kannemeyer van Matie Community Service, het stemme van regoor Stellenbosch laat hoor: Yeki Mosomothane (SU-studentegemeenskappe), Dennis Moss (dorpsbeplanner), Stephané Conradie (doktorale student in Visuele Kunste), en Shirle Cornellisen (Fakulteit Teologie), wat elkeen unieke perspektiewe gedeel het om eenheid en gedeelde doel te bevorder."
    ],
    textXh: [
      "IOfisi yeNguculo yeYunivesithi yaseStellenbosch, ngentsebenziswano neMyuziyam ye-SU, iWoordfees, kunye neSebe leMpembelelo yeNtlalo, ibambe umsitho wokubhiyozela iinkcukacha ezili-100 zaseAfrika. Malunga ne-200 yeendwendwe zonwabele ukutya komthonyama kunye nomculo ovela kuluntu olungqongileyo, beqaqambisa iyantlukwano yommandla.",
      "Ingxoxo yeqela, eyayiququzelelwa nguRenee Hector-Kannemeyer weNkonzo yoLuntu yaseMatie, ibonise amazwi asuka kwiStellenbosch yonke: uYeki Mosomothane (imiphakathi yabafundi be-SU), uDennis Moss (ucwangcisi wedolophu), uStephané Conradie (umfundi wobugqirha kwiVisual Arts), kunye noShirle Cornellisen (iFakhalthi yeTheology), ngamnye wabelana ngeembono ezizodwa ukukhuthaza umanyano kunye nenjongo ekwabelwana ngayo."
    ],
    imagesPerRow: 5, // one row
  },
  {
    id: 'moore-run',
    titleEn: 'Moore Night Run',
    titleAf: 'Moore Naghardloop',
    titleXh: 'Umdyarho waseMoore waseBusuku',
    images: range(1, 8, '/archives/moorerun/moorerun', 'jpg'),
    textEn: [
      "The Moore Night Run once again brought vibrant energy to the streets of Stellenbosch, with athletes competing in a 10 km race and families, fun runners, and even pets enjoying the 5 km route. The event started and ended at Stellenbosch Primary, winding through nearby neighborhoods. Top runners delivered impressive performances across both distances, with repeat victories in the 10 km and strong finishes in the 5 km.",
      "As a flagship initiative of the e'Bosch Heritage Project, the Night Run exemplified the project's commitment to inclusivity and community development. It served as a dynamic platform for celebrating local talent and fostering unity across cultural, religious, and social groups through sport and shared experience."
    ],
    textAf: [
      "Die Moore Naghardloop het weer lewendige energie na die strate van Stellenbosch gebring, met atlete wat in 'n 10 km-wedloop meeding en gesinne, pretlopers en selfs troeteldiere wat die 5 km-roete geniet. Die geleentheid het by Stellenbosch Primêr begin en geëindig en deur nabygeleë woonbuurte geslinger. Topatlete het indrukwekkende vertonings oor beide afstande gelewer, met herhaalde oorwinnings in die 10 km en sterk eindes in die 5 km.",
      "As 'n vlagskip-inisiatief van die e'Bosch Erfenisprojek, het die Naghardloop die projek se verbintenis tot inklusiwiteit en gemeenskapsontwikkeling gedemonstreer. Dit het gedien as 'n dinamiese platform vir die viering van plaaslike talent en die bevordering van eenheid oor kulturele, godsdienstige en sosiale groepe heen deur sport en gedeelde ervaring."
    ],
    textXh: [
      "Umdyarho waseMoore waseBusuku uphinde wazisa amandla aphilileyo kwizitrato zaseStellenbosch, iimbaleki zikhuphisana kugqatso lwe-10 km kwaye iintsapho, iimbaleki ezonwabisayo, kunye nezilwanyana zasekhaya zonwabele umendo we-5 km. Lo msitho uqale waphela eStellenbosch Primary, ujikeleze iindawo ezikufutshane. Iimbaleki eziphambili zibonise ukusebenza okumangalisayo kuyo yomibini le migama, ziphumelele ngokuphindaphindiweyo kwi-10 km kwaye zagqiba ngamandla kwi-5 km.",
      "Njengenyathelo eliphambili leProjekthi yeLifa le-e'Bosch, uMdyarho waseBusuku ubonise ukuzinikela kweprojekthi ekubandakanyweni nakuphuhliso loluntu. Isebenze njengeqonga eliguquguqukayo lokubhiyozela iitalente zasekuhlaleni nokukhuthaza umanyano kumaqela enkcubeko, enkolo nezentlalo ngemidlalo namava ekwabelwana ngawo."
    ],
    imagesPerRow: 4, // 2 rows of 4
  },
  {
    id: 'cycling',
    titleEn: 'Cycling Events',
    titleAf: 'Fietsrygeleenthede',
    titleXh: 'Imisitho yokuKhwelwa kweBhayisekile',
    images: range(1, 6, '/archives/cyclingevents/cycling', 'jpg'),
    textEn: [
      "As part of the e'Bosch Heritage Festival, an early morning bike ride led by Carinus Lemmer took participants from the site of the e'Bosch River Festival to Spier Wine Estate. This energizing ride was complemented by the popular Plaastrap event on Spier farm, where neighborhood children enjoyed cycling on bikes generously provided by the Winelands District Municipality.",
      "The event was a joyful celebration of community, heritage, and outdoor fun bringing together families and fostering local pride."
    ],
    textAf: [
      "As deel van die e'Bosch Erfenisfees, het 'n vroegoggend-fietsrit onder leiding van Carinus Lemmer deelnemers van die terrein van die e'Bosch Rivierfees na Spier Wynlandgoed geneem. Hierdie energieke rit is aangevul deur die gewilde Plaastrap-geleentheid op die Spier-plaas, waar buurtkinders op fietse geniet het wat vrylik deur die Wynland Distriksmunisipaliteit verskaf is.",
      "Die geleentheid was 'n vreugdevolle viering van gemeenskap, erfenis en buitelugpret wat gesinne byeengebring en plaaslike trots bevorder het."
    ],
    textXh: [
      "Njengenxalenye yoMnyhadala weLifa le-e'Bosch, uhambo lwasekuseni ngebhayisekile olukhokelwa nguCarinus Lemmer luthabathe abathathi-nxaxheba besuka kwindawo yoMnyhadala woMlambo i-e'Bosch besiya eSpier Wine Estate. Olu hambo lunamandla luye lwandiswa ngumsitho odumileyo wePlaastrap kwifama yaseSpier, apho abantwana basebumelwaneni bonwabele ukukhwela iibhayisekile ezibonelelwe ngesisa nguMasipala weSithili saseWinelands.",
      "Lo msitho waba ngumbhiyozo ovuyisayo woluntu, ilifa lemveli, kunye nolonwabo lwangaphandle oludibanisa iintsapho kwaye lukhuthaza ikratshi lasekuhlaleni."
    ],
    imagesPerRow: 6, // one row
  },
  {
    id: 'sicmf',
    titleEn: 'SICMF Community Concert',
    titleAf: 'SICMF Gemeenskapskonsert',
    titleXh: 'Ikonsathi yoLuntu ye-SICMF',
    images: ['/archives/concert/sicmf.jpeg'],
    textEn: [
      "The Stellenbosch International Chamber Music Festival (SICMF), held annually, featured 39% of participants from previously disadvantaged communities. That year, SICMF hosted a Community Concert at Rietenbosch Primary in Cloetesville, led by conductor Xandi van Dijk and narrator Xola Ntshinga. It drew 100 orchestra members and 150 attendees from surrounding communities. With marketing support from the e'Bosch Heritage Project, the successful event was then set to be repeated in Jamestown in the following year."
    ],
    textAf: [
      "Die Stellenbosch Internasionale Kamermusiekfees (SICMF), wat jaarliks gehou word, het 39% van deelnemers uit voorheen benadeelde gemeenskappe gehad. Daardie jaar het SICMF 'n Gemeenskapskonsert by Rietenbosch Primêr in Cloetesville aangebied, gelei deur dirigent Xandi van Dijk en verteller Xola Ntshinga. Dit het 100 orkeslede en 150 bywoners uit omliggende gemeenskappe gelok. Met bemarkingsondersteuning van die e'Bosch Erfenisprojek, is die suksesvolle geleentheid toe die volgende jaar in Jamestown herhaal."
    ],
    textXh: [
      "Umnyhadala waMazwe ngaMazwe woMculo weGumbi waseStellenbosch (i-SICMF), obanjwa minyaka le, ubonise i-39% yabathathi-nxaxheba abavela kuluntu olwalusakuba lusilela. Ngaloo nyaka, i-SICMF ibambe iKonsathi yoLuntu eRietenbosch Primary eCloetesville, ikhokelwa ngumqhubi wekonsathi uXandi van Dijk kunye nombalisi uXola Ntshinga. I-100 yamalungu eokhestra kunye ne-150 yabazimasi abavela kuluntu olungqongileyo baye bazimasa. Ngenkxaso yentengiso evela kwiProjekthi yeLifa le-e'Bosch, lo msitho uphumeleleyo emva koko waphindwa eJamestown kunyaka olandelayo."
    ],
    imagesPerRow: 1, // one image, one row
  },
  {
    id: 'petanque',
    titleEn: 'Petanque Tournament',
    titleAf: 'Petanque Toernooi',
    titleXh: 'Ukhuphiswano lwePetanque',
    images: [
      '/archives/pentaque/pentaque1.jpg',
      '/archives/pentaque/pentaque2.jpg',
      '/archives/pentaque/pentaque3.jpeg',
      '/archives/pentaque/pentaque4.jpg',
      '/archives/pentaque/pentaque5.jpg',
      '/archives/pentaque/pentaque6.jpg',
    ],
    textEn: [
      "A friendly petanque tournament held in Pniël with support from the local Petanque Club, bringing together members of the e'Bosch Management Committee from various Stellenbosch communities. Residents of Pniël introduced the game to visiting participants, creating a lively and inclusive atmosphere where everyone connected and enjoyed the day together."
    ],
    textAf: [
      "'n Vriendelike petanque-toernooi wat in Pniël gehou is met ondersteuning van die plaaslike Petanque-klub, wat lede van die e'Bosch-bestuurskomitee uit verskeie Stellenbosch-gemeenskappe bymekaargebring het. Inwoners van Pniël het die spel aan besoekende deelnemers bekendgestel, wat 'n lewendige en inklusiewe atmosfeer geskep het waar almal kontak gemaak en die dag saam geniet het."
    ],
    textXh: [
      "Ukhuphiswano olunobuhlobo lwe-petanque olubanjelwe ePniël ngenkxaso yeKlabhu yePetanque yasekuhlaleni, ludibanise amalungu eKomiti yoLawulo ye-e'Bosch avela kwiindawo ezahlukeneyo zaseStellenbosch. Abahlali basePniël bazise umdlalo kwabo bathabatha inxaxheba abatyeleleyo, bedala umoya ophilileyo nobandakanyayo apho wonke umntu wanxibelelana kwaye bonwabela usuku kunye."
    ],
    imagesPerRow: 6, // one row
  },
  {
    id: 'stokbroodbraai',
    titleEn: 'Stokbroodbraai',
    titleAf: 'Stokbroodbraai',
    titleXh: 'I-Stokbroodbraai',
    images: [
      '/archives/braai/braai1.jpeg',
      '/archives/braai/braai2.jpeg',
      '/archives/braai/braai3.jpg',
      '/archives/braai/braai4.jpg',
      '/archives/braai/braai5.jpg',
      '/archives/braai/braai6.jpg',
      '/archives/braai/braai7.jpg',
      '/archives/braai/braai8.jpg',
      '/archives/braai/braai9.jpg',
      '/archives/braai/braai10.jpg',
    ],
    textEn: [
      "Stellenbosch Voortrekkers annual stokbroodbraai at the e'Bosch 10 Dorpies-Erfenisfees, held on the lawns beside the Eersterivier in Die Laan. This event is a festive opportunity to gather around the fires with friends and strangers alike, enjoy music and choir performances under the oak trees. Stokbrood demonstrations take place hourly from 10:00 to 13:00, accommodating 20 children per session at three braai stations. All materials including coals, dough, syrup, and sticks—are provided free of charge. Children must be supervised by adults."
    ],
    textAf: [
      "Stellenbosch Voortrekkers se jaarlikse stokbroodbraai by die e'Bosch 10 Dorpies-Erfenisfees, gehou op die grasperke langs die Eersterivier in Die Laan. Hierdie geleentheid is 'n feestelike geleentheid om saam met vriende en vreemdelinge om die vure te vergader, musiek en kooroptredes onder die eikebome te geniet. Stokbrooddemonstrasies vind uur langs van 10:00 tot 13:00 plaas, met 20 kinders per sessie by drie braaistasies. Alle materiaal, insluitend kole, deeg, stroop en stokke, word gratis verskaf. Kinders moet deur volwassenes opgepas word."
    ],
    textXh: [
      "I-stokbroodbraai yonyaka ye-Voortrekkers yaseStellenbosch kwi-e'Bosch 10 Dorpies-Erfenisfees, ebanjelwe kwingca esecaleni koMlambo i-Eersterivier eDie Laan. Lo msitho lithuba lomthendeleko lokuhlanganisana emlilweni nabahlobo nabantu ongabaziyo, ukonwabela umculo kunye neentsimbi zekwayala phantsi kwemithi ye-oki. Imiboniso ye-Stokbrood yenzeka rhoqo ngeyure ukusuka ngo-10:00 ukuya ku-13:00, ithatha abantwana abangama-20 kwiseshoni nganye kwizikhululo ezintathu ze-braai. Zonke izinto zibandakanya amalahle, intlama, isiraphu, kunye neentonga—zibonelelwa simahla. Abantwana kufuneka babekwe esweni ngabantu abadala."
    ],
    imagesPerRow: 5, // two rows of 5
  },
  {
    id: 'tube-race',
    titleEn: "e'Bosch Tube Race",
    titleAf: "e'Bosch Buiswedren",
    titleXh: "Udyarho lweTyhubhu ye-e'Bosch",
    images: [
      '/archives/tuberace/tube1.jpeg',
      '/archives/tuberace/tube2.jpg',
      '/archives/tuberace/tube3.jpg',
      '/archives/tuberace/tube4.jpg',
      '/archives/tuberace/tube5.jpg',
      '/archives/tuberace/tube6.jpg',
      '/archives/tuberace/tube7.jpg',
      '/archives/tuberace/tube8.jpg',
    ],
    textEn: [
      "The e'Bosch Heritage Festival featured the thrilling Eerste River Tube Race, where participants navigated 3km of fast-flowing rapids through Stellenbosch. With strong student turnout in the koshuis category and enthusiastic supporters lining the banks, the event was a lively celebration of adventure and community spirit."
    ],
    textAf: [
      "Die e'Bosch Erfenisfees het die opwindende Eersterivier-buiswedren ingesluit, waar deelnemers 3 km van vinnigvloeiende stroomversnellings deur Stellenbosch genavigeer het. Met sterk studente-opkoms in die koshuiskategorie en entoesiastiese ondersteuners wat die oewers langs gestaan het, was die geleentheid 'n lewendige viering van avontuur en gemeenskapsgees."
    ],
    textXh: [
      "Umnyhadala weLifa le-e'Bosch ubandakanye uMdyarho otyhityhisayo weTyhubhu yoMlambo i-Eersterivier, apho abathathi-nxaxheba bahamba i-3km yezidiphu eziphuthumayo ezinamanzi ngokukhawuleza eStellenbosch. Ngenani elikhulu labafundi elikudidi lwe-koshuis kunye nabaxhasi abanomdla abagudle iindonga zomlambo, lo msitho wawungumbhiyozo onamandla wobuganga nomoya woluntu."
    ],
    imagesPerRow: 4, // two rows of 4
  },
  {
    id: 'symposium',
    titleEn: 'Symposium',
    titleAf: 'Simposium',
    titleXh: 'ISimposium',
    textEn: [
      "The e'Bosch Heritage Project in collaboration with the Southern Regional Branch of the South African Society for Cultural History, successfully hosted the thought-provoking symposium Monuments: Fall, Stand or Build? at Erfurthuis in Stellenbosch.",
      "This landmark event brought together scholars, heritage practitioners, and community leaders to explore the evolving role of monuments in South African society. The symposium not only sparked meaningful dialogue but also underscored e'Bosch's commitment to cultural reflection and historical engagement."
    ],
    textAf: [
      "Die e'Bosch Erfenisprojek het in samewerking met die Suidelike Streekstak van die Suid-Afrikaanse Vereniging vir Kultuurgeskiedenis die prikkelende simposium Monuments: Fall, Stand or Build? by Erfurthuis in Stellenbosch suksesvol aangebied.",
      "Hierdie belangrike geleentheid het akademici, erfenispraktisyns en gemeenskapsleiers byeengebring om die ontwikkelende rol van monumente in die Suid-Afrikaanse samelewing te verken. Die simposium het nie net betekenisvolle dialoog ontlok nie, maar ook e'Bosch se verbintenis tot kulturele refleksie en historiese betrokkenheid onderstreep."
    ],
    textXh: [
      "IProjekthi yeLifa le-e'Bosch ngentsebenziswano neSebe leNgingqi yaseMazantsi yoMbutho woMbali weNkcubeko waseMzantsi Afrika, ibambe ngempumelelo i-simposium ekhuthaza iingcinga ethi Izikhumbuzo: Ukuwa, Ukuma okanye Ukwakha? e-Erfurthuis eStellenbosch.",
      "Lo msitho ubalulekileyo uhlanganise izifundiswa, iingcali zelifa lemveli, kunye neenkokeli zoluntu ukuhlola indima eguqukayo yezikhumbuzo kuluntu lwaseMzantsi Afrika. I-simposium ayikhange ivuselele nje kuphela iingxoxo ezinentsingiselo kodwa ikwagxininise ukuzinikela kwe-e'Bosch kwingcamango yenkcubeko kunye nokubandakanyeka kwimbali."
    ],
    pdf: '/archives/symposium/uitnodiging_na_simposium.pdf',
    imagesPerRow: 1, // no images
  },
  {
    id: 'projects',
    titleEn: 'eBosch Projects',
    titleAf: 'eBosch Projekte',
    titleXh: 'Iiprojekthi ze-eBosch',
    // remove project19
    images: [
      ...range(1, 18, '/archives/projects/project', 'jpg'),
      ...range(20, 21, '/archives/projects/project', 'jpg')
    ],
    imagesPerRow: 5, // 20 images -> 4 rows
  },
  {
    id: 'heritage-tour',
    titleEn: 'Museum Heritage Tour',
    titleAf: 'Museum Erfenis Toer',
    titleXh: 'Ukhenketho lweMnyuziyam yeLifa',
    images: range(1, 12, '/archives/heritagetour/tour', 'jpg'),
    imagesPerRow: 4, // 12 images -> 3 rows
  },
  {
    id: 'cohesion-workshop',
    titleEn: 'Social Cohesion Workshop',
    titleAf: 'Sosiale Samehorigheid Werkswinkel',
    titleXh: 'Ucweyo loManyano lweNtlalo',
    images: range(1, 10, '/archives/cohesionworkshop/workshop', 'jpg'),
    imagesPerRow: 4, // 10 images -> 3 rows (4+4+2)
  },
  {
    id: 'tree-planting',
    titleEn: 'Tree Planting Day',
    titleAf: 'Boomplant Dag',
    titleXh: 'USuku lokuTyalwa kweMithi',
    images: range(1, 12, '/archives/plant/plant', 'jpg'),
    imagesPerRow: 4, // 12 images -> 3 rows
  },
  {
    id: 'eerste-walk',
    titleEn: 'Eerste Water Walk Pilgrimage',
    titleAf: 'Eerste Water Walk Pelgrimstog',
    titleXh: 'Uhambo lwamanzi lwase-Eerste',
    images: range(1, 8, '/archives/eerstewalk/walk', 'jpg'),
    imagesPerRow: 4, // 8 images -> 2 rows
  },
  {
    id: 'legacy-concert',
    titleEn: 'Legacy Concert',
    titleAf: 'Erfenis Konsert',
    titleXh: 'Ikonsathi yeLifa',
    images: range(1, 6, '/archives/legacy/legacy', 'jpg'),
    imagesPerRow: 6, // one row
  },
  {
    id: 'art-competition',
    titleEn: 'PJ Olivier Art Competition',
    titleAf: 'PJ Olivier Kunswedstryd',
    titleXh: 'Ukhuphiswano lobuGcisa lwe-PJ Olivier',
    images: range(1, 4, '/archives/artcompetition/art', 'jpg'),
    imagesPerRow: 4, // one row
  },
];

export default function Archive() {
  const [language, setLanguage] = useState<Language>('en');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const navLinkStyle = {
    textDecoration: 'none',
    color: '#4b5563',
    fontSize: '16px',
    fontWeight: '500',
    paddingBottom: '4px',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease'
  };

  const activeNavLinkStyle = {
    ...navLinkStyle,
    color: '#2d5016',
    fontWeight: '600',
    borderBottom: '2px solid #2d5016',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.target as HTMLElement).style.color = '#2d5016';
    (e.target as HTMLElement).style.borderBottom = '2px solid #2d5016';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.target as HTMLElement).style.color = '#4b5563';
    (e.target as HTMLElement).style.borderBottom = '2px solid transparent';
  };

  const getTitle = (item: ArchiveItem) => {
    if (language === 'af') return item.titleAf;
    if (language === 'xh') return item.titleXh;
    return item.titleEn;
  };

  const getText = (item: ArchiveItem): string[] => {
    if (language === 'af' && item.textAf) return item.textAf;
    if (language === 'xh' && item.textXh) return item.textXh;
    if (item.textEn) return item.textEn;
    return [];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'white',
        boxShadow: 'none',
        transition: 'box-shadow 0.3s ease'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <Link href="/" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Home'}
                {language === 'af' && 'Tuis'}
                {language === 'xh' && 'Ikhaya'}
              </Link>
              <Link href="/about" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'About'}
                {language === 'af' && 'Oor'}
                {language === 'xh' && 'Malunga'}
              </Link>
              <Link href="/events" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Events'}
                {language === 'af' && 'Geleenthede'}
                {language === 'xh' && 'Iziganeko'}
              </Link>
              <Link href="/store" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && "e'Bosch Store"}
                {language === 'af' && "e'Bosch Winkel"}
                {language === 'xh' && "e'Bosch Inkolo"}
              </Link>
              <Link href="/membership" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Membership'}
                {language === 'af' && 'Lidmaatskap'}
                {language === 'xh' && 'Ubulungu'}
              </Link>
              <Link href="/publicity" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Publicity'}
                {language === 'af' && 'Publisiteit'}
                {language === 'xh' && 'Isaziso'}
              </Link>
              <Link href="/partners" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Our Partners'}
                {language === 'af' && 'Ons Vennote'}
                {language === 'xh' && 'Abalingani Bethu'}
              </Link>
              <Link href="/archive" style={activeNavLinkStyle}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.7'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}>
                {language === 'en' && 'Archive'}
                {language === 'af' && 'Argief'}
                {language === 'xh' && 'Ugcino'}
              </Link>
              <Link href="/contact" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {language === 'en' && 'Contact'}
                {language === 'af' && 'Kontak'}
                {language === 'xh' && 'Xhomekela'}
              </Link>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{
                  padding: '8px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '15px',
                  backgroundColor: 'white',
                  fontWeight: '500',
                  color: '#111827',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#2d5016';
                  (e.target as HTMLElement).style.boxShadow = '0 0 0 2px rgba(45, 80, 22, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#d1d5db';
                  (e.target as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="xh">Xhosa</option>
              </select>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-12" style={{ paddingTop: '100px' }}>
        {/* No main heading as requested */}

        {archiveData.map((item) => (
          <section key={item.id} style={{ marginBottom: '80px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#4b5563', // dark grey
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {getTitle(item)}
            </h2>

            {/* Text content – like about page but wider */}
            {getText(item).length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
                borderLeft: '4px solid #2d5016',
                borderRight: '4px solid #2d5016',
                borderRadius: '8px',
                padding: '30px',
                marginBottom: '30px',
                maxWidth: '1100px',
                margin: '0 auto 30px auto',
              }}>
                {getText(item).map((paragraph, idx) => (
                  <p key={idx} style={{
                    color: '#374151',
                    marginBottom: idx < getText(item).length - 1 ? '20px' : 0,
                    lineHeight: '1.8',
                    fontSize: '17px',
                  }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Image gallery – now centered with max-width */}
            {item.images && item.images.length > 0 && (
              <div style={{
                maxWidth: '1100px',
                margin: '0 auto',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${item.imagesPerRow}, 1fr)`,
                  gap: '20px',
                  marginBottom: item.pdf ? '20px' : 0,
                }}>
                  {item.images.map((src, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxSrc(src)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        aspectRatio: '1/1',
                        maxHeight: item.id === 'sicmf' ? '300px' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(45,80,22,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                    >
                      <img
                        src={src}
                        alt={`${getTitle(item)} image ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: item.id === 'sicmf' ? 'contain' : 'cover',
                          backgroundColor: '#f5f5f5',
                        }}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF link */}
            {item.pdf && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <a
                  href={item.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#2d5016',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a3009')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d5016')}
                >
                  {language === 'en' && 'Download PDF'}
                  {language === 'af' && 'Laai PDF af'}
                  {language === 'xh' && 'Khuphela iPDF'}
                </a>
              </div>
            )}
          </section>
        ))}
      </main>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightboxSrc}
            alt="Enlarged"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          />
          <button
            onClick={() => setLightboxSrc(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '28px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '36px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}