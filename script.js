let andmed = {}; // Andmestiku failinimi
let vastus = ""; // Õige lahendussõna, mis tuleb ära arvata
let sisend = []; // Mängija hetkene sisend
let aktiivneSõna = null; // Lahendussõna kirje koos sõna, seoste ja tähendustega
let aktiivsedTähed = []; // Täheobjektid
let praegusedTähed = []; // Tähtede visuaalne järjekord renderdamiseks
let kasutatudTähed = new Set(); // Tähtede ID-d
let popupLahti = false; // Hüpikaken avatud?
let mängKäib = false; // Mäng käivitatud?
let mängLäbi = false; // Mäng lõppenud?
let elud = 5; // Mitu eksimust mängijal lubatud?
let skoor = 0; // Õiged vastused
let lahendatud = false;

/**
 * Käivitamisel ava koduleht ja laadi andmestik
 */
window.onload = function() {
    avaKodu();
    laadiAndmed();

    document.getElementById("kustuta").onclick = kustutaTäht;
    document.getElementById("jaga").onclick = segaTähed;
    document.getElementById("esita").onclick = kontrolliVastus;
};

/**
 * Funktsioonid lehtedele
 */
function avaKodu() {
    const popup = document.getElementById("popup");

    if (popupLahti) {
        popup.style.display = "none";
        popupLahti = false;
    }

    kuvaLeht("koduleht");
}

function avaMäng() {
    kuvaLeht("mänguleht");
    if (!mängKäib) {
        uusSõna();
        mängKäib = true;
    }
}

const juhised = {
    n: "",
    a: "",
    v: ""
};

function avaÕpetus() {
    // kuvaLeht("õpetus");
    const popup = document.getElementById("popup");
    const content = document.getElementById("popup-sisu");

    if (popupLahti) {
        popup.style.display = "none";
        popupLahti = false;
        return;
    }

    content.innerHTML = `
        <strong>
            Leia puuduv sõna graafist.<br>
            Igale mõistatusele on üks lahendus.<br>
        </strong>
        Mäng kestab viienda eksimuseni.<br><br>
        <strong>
            Graaf
        </strong><br>

        Sõna värv ja paigutus tähistab selle semantilist suhet lahendussõnaga.<br>
        Graafi kuju ja hierarhia sõltub sõnaliigist.<br><br>

        Uuri allolevas graafis võimalikke semantilisi suhteid.<br>
        Sõnale vajutades kuvatakse selle tähendus!
        <div id="graaf-näidis">
            <div class="näidis-tase">
                <div class="sõna-box hyper"
                    onclick="näitaSeletus('Ülemmõiste, näiteks [mööbliese] > kapp.')">
                    hüperonüüm
                </div>
                <div class="sõna-box holo"
                    onclick="näitaSeletus('Tervikut väljendav sõna, näiteks [käsi] > sõrm.')">
                    holonüüm
                </div>
            </div>

            <div class="näidis-tase kesk">
                <div class="sõna-box syn"
                    onclick="näitaSeletus('Samatähenduslik sõna, näiteks koer ja peni. NB! Sünonüümidel on ühine definitsioon - mängus seda piiluda ei saa!')">
                    sünonüüm
                </div>
                [otsitav sõna]
            </div>

            <div class="näidis-tase">
                <div class="sõna-box hypo"
                    onclick="näitaSeletus('Alammõiste, näiteks [kapp] < mööbliese.')">
                    hüponüüm
                </div>
                <div class="sõna-box mero"
                    onclick="näitaSeletus('Osa väljendav sõna, näiteks [sõrm] < käsi.')">
                    meronüüm
                </div>
            </div>
            <i><div id="seletus"></div></i><br>
        </div>

        <strong>Täheruudustik</strong><br>
        Graafi all on täheruudustik lahendussõna moodustamiseks.<br>
        Ruudustik sisaldab vajalikke tähti, kuid sekka on lisatud ka üleliigseid.<br><br>

        <strong>
            Abi
        </strong><br>
        ⌫ / Delete - Kustuta täht<br>
        ⇄ - Sega tähed<br>
        ➤ / Enter - Esita vastus<br>
    `;

    document.getElementById("popup").style.display = "flex";
    popupLahti = true;
    content.scrollTop = 0;
}

function näitaSeletus(tekst) {
    const väli = document.getElementById("seletus");

    if (väli.textContent === tekst) {
        väli.textContent = "";
        return;
    }

    väli.textContent = tekst;
}

function näitaJuhist(sõnaliik, nupp) {
    const container = document.getElementById("juhis-sisu");
    let sisu = "";

    if (sõnaliik === 1) sisu = juhisTekstid.nimisõna;
    else if (sõnaliik === 2) sisu = juhisTekstid.omadussõna;
    else if (sõnaliik === 3) sisu = juhisTekstid.tegusõna;

    container.innerHTML = `<p>${sisu}</p>`;

    const nupud = document.querySelectorAll("#juhis-nupud button");
    nupud.forEach(n => n.classList.remove("active"));
    nupp.classList.add("active");
}

const juhisTekstid = {
    nimisõna: `
        <p>
            <strong>Nimisõna</strong>
        </p>
    `,
    omadussõna: `
        <p>
            <strong>Omadussõna</strong>
        </p>
    `,
    tegusõna: `
        <p>
            <strong>Tegusõna</strong>
        </p>
    `
};

function kuvaLeht(id) {
    document.getElementById("koduleht").style.display = "none";
    document.getElementById("mänguleht").style.display = "none";
    document.getElementById("õpetus").style.display = "none";

    document.getElementById(id).style.display = "block";

    const koduNupp = document.getElementById("koduNupp");
    const õpetusNupp = document.getElementById("õpetusNupp");
    const nulliNupp = document.getElementById("nulliNupp");

    if (id === "koduleht") {
        koduNupp.style.display = "none";
        õpetusNupp.style.display = "none";
        nulliNupp.style.display = "none";
    } else {
        koduNupp.style.display = "inline-block";
        õpetusNupp.style.display = "inline-block";
        nulliNupp.style.display = "inline-block";
    }
}

/**
 * Andmete laadimine failist (antud juhul relations.json)
 */
function laadiAndmed() {
    fetch("relations.json")
        .then(res => res.json())
        .then(data => {
            andmed = data;
        })
}

function nulliMäng() {
    const popup = document.getElementById("popup");
    const content = document.getElementById("popup-sisu");

    content.innerHTML = `
        Kas oled kindel, et soovid alustada algusest?<br><br>
        <button onclick="nulliSeis()">Alusta uuesti</button>
    `;

    popup.style.display = "flex";
    popupLahti = true;
}

function nulliSeis() {
    sulgePopup();

    elud = 5;
    skoor = 0;

    sisend = [];
    kasutatudTähed = new Set();
    aktiivneSõna = null;
    vastus = "";

    muudaElud();
    muudaSkoor();

    mängKäib = false;
    mängLäbi = false;

    uusSõna();
}

/**
 * Juhusliku sõna valimine andmestikust
 * @returns Üks juhuslik sõna (kirje võti)
 */
function valiSõna() {
    const sõnastik = Object.keys(andmed);
    const juhuslik = sõnastik[Math.floor(Math.random() * sõnastik.length)];

    const kirjed = andmed[juhuslik];
    const kirje = kirjed[Math.floor(Math.random() * kirjed.length)];

    return kirje;
}

/**
 * Sõna määramine ja kuvamine
 * @returns Mitte midagi, kui andmestikust ei leitud sõna
 */
function uusSõna() {
    if (Object.keys(andmed).length === 0) {
        console.log("Ei leitud uut sõna");
        return;
    }
    document.getElementById("järgmine-nupp").style.display = "none";
    lahendatud = false;
    muudaElud();

    kuvaSõna(valiSõna());
}

function muudaElud() {
    const elu = document.getElementById("elud");
    let tekst = "";
    for (let i = 0; i < 5; i++) {
        tekst += i < elud ? "●" : "○"
    }
    elu.textContent = tekst.trim();
}

function muudaSkoor() {
    const punktid = document.getElementById("skoor");
    if (!punktid) return;
    punktid.textContent = `${skoor}`;
}


/**
 * Sõna ja selle juurde kuuluva graafi kuvamine
 * @param {*} kirje 
 */
function kuvaSõna(kirje) {
    // document.getElementById("sõna").textContent = kirje.sõna;
    // document.getElementById("definitsioon").textContent = kirje.tähendus;
    vastus = kirje.sõna;
    sisend = [];
    kasutatudTähed = new Set();
    aktiivneSõna = kirje;

    uuendaLünk();
    looTähed();
    tühjendaGraaf()

    lisaSõnad("ülemine", looÜlemised(kirje));
    lisaSõnad("alumine", looAlumised(kirje));

    const syn = looSünonüümid(kirje);
    lisaSõnad("vasak", syn.vasak, false);
    lisaSõnad("parem", syn.parem, false);
}

/**
 * Graafi tühjendamine uue sõna jaoks
 */
function tühjendaGraaf() {
    ["ülemine", "alumine", "vasak", "parem"].forEach(id => {
        document.getElementById(id).innerHTML = "";
    });
}

/**
 * Sõnade lisamine elementi
 * @param {*} containerId 
 * @param {*} sõnad 
 * @param {*} clickable 
 * @returns 
 */
function lisaSõnad(containerId, sõnad, clickable = true) {
    const container = document.getElementById(containerId);
    if (!sõnad) return;

    for (let sõna of sõnad) {
        const div = document.createElement("div");
        div.className = `sõna-box ${sõna.tüüp}`;
        div.textContent = sõna.s;

        // Klikkides sõnale näita definitsiooni
        if (clickable && sõna.d) {
            div.onclick = (e) => {
                // console.log("Click", sõna);
                e.stopPropagation();
                näitaDefinitsioon(sõna.s, sõna.d);
            }
        }

        container.appendChild(div);
    }
}

/**
 * Hüperonüümi ja holonüümi valimine
 * @param {*} kirje 
 * @returns Kaks hüperonüümi või 1 hüperonüüm ja 1 holonüüm
 */
function looÜlemised(kirje) {
    return valiKaks(
        kirje.hüperonüümid,
        kirje.holonüümid,
        "hyper",
        "holo"
    );
}

/**
 * Hüponüümi ja meronüümi valimine
 * @param {*} kirje 
 * @returns Kaks hüponüümi või 1 hüponüüm ja 1 meronüüm
 */
function looAlumised(kirje) {
    return valiKaks(
        kirje.hüponüümid,
        kirje.meronüümid,
        "hypo",
        "mero"
    );
}

/**
 * Sünonüümide valimine (max 2, juhuslik)
 * @param {*} kirje 
 * @returns Kaks sünonüümi (vasak ja parem)
 */
function looSünonüümid(kirje) {
    const syn = Object.keys(kirje.sünonüümid || {}).sort(() => 0.5 - Math.random()).slice(0, 2);

    return {
        vasak: syn[0] ? [{ s: syn[0], d: "", tüüp: "syn" }] : [],
        parem: syn[1] ? [{ s: syn[1], d: "", tüüp: "syn" }] : []
    };
}

/**
 * Kahe elemendi valimine kahest objektist (kaks sõna võtmesõna seostest)
 * @param {*} obj1 
 * @param {*} obj2 
 * @param {*} tüüp1 
 * @param {*} tüüp2 
 * @returns Kaks seotud sõna
 */
function valiKaks(obj1, obj2, tüüp1, tüüp2) {
    const keys1 = Object.keys(obj1 || {});
    const keys2 = Object.keys(obj2 || {});

    let tulemus = [];

    if (keys1.length > 0 && keys2.length > 0) {
        const key1 = juhuslik(keys1);
        const key2 = juhuslik(keys2);

        tulemus.push({
            s: key1,
            d: obj1[key1],
            tüüp: tüüp1
        });

        tulemus.push({
            s: key2,
            d: obj2[key2],
            tüüp: tüüp2
        });
    } else {
        const all = keys1.length ? keys1 : keys2;
        all.sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .forEach(sõna => {
                const onEsimeses = keys1.includes(sõna);
                tulemus.push({
                    s: sõna,
                    d: onEsimeses ? obj1[sõna] : obj2[sõna],
                    tüüp: onEsimeses ? tüüp1 : tüüp2
                });
            });
    }

    return tulemus;
}

/**
 * Juhuslikkuse abifunktsioon
 * @param {*} arr 
 * @returns Juhuslik väärtus
 */
function juhuslik(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Definitsiooni näitamise abifunktsioon
 * @param {*} sõna 
 * @param {*} definitsioon 
 */
function näitaDefinitsioon(sõna, definitsioon) {
    const popup = document.getElementById("popup");
    const content = document.getElementById("popup-sisu");

    content.innerHTML = `<strong>${sõna}</strong><br><br>${definitsioon || "Definitsioon puudub"}`;
    popup.style.display = "flex";
}

/**
 * Sulgeb hüpikakna hiirevajutusel
 */
const popup = document.getElementById("popup");
popup.addEventListener("click", () => {
    popup.style.display = "none";
    popupLahti = false;
});

/**
 * Takistab hüpikaknas olevale nupule vajutades hüpikakna sulgumise
 */
const popupsisu = document.getElementById("popup-sisu");
popupsisu.addEventListener("click", (e) => {
    e.stopPropagation();
});

/**
 * Klaviatuuri sisendi töötlemise abifunktsioon
 */
document.addEventListener("keydown", function(e) {
    if (document.getElementById("mänguleht").style.display !== "block") return;
    if (mängLäbi) return;

    if (e.key === "Delete") {
        const kustutatud = sisend.pop();
        if (kustutatud) kasutatudTähed.delete(kustutatud.id);
        uuendaLünk();
        näitaTähed(praegusedTähed);
        return;
    } else if (e.key.length === 1) {
        const täht = e.key.toLowerCase();
        const tähenupp = aktiivsedTähed.find(t => t.täht === täht && !kasutatudTähed.has(t.id));

        if (tähenupp && sisend.length < vastus.length) {
        sisend.push(tähenupp);
        kasutatudTähed.add(tähenupp.id);
        uuendaLünk();
        näitaTähed(praegusedTähed);
        }
    } else if (e.key === "Enter") {
        if (lahendatud && !mängLäbi) {
            uusSõna();
            sulgePopup();
            return;
        }
        kontrolliVastus();
    }

    uuendaLünk();
});

/**
 * Pakutud vastuse kontroll ja otsus
 */
function kontrolliVastus() {
    if (mängLäbi) return;
    const sisendString = sisend.map(t => t.täht).join("");

    if (lahendatud && sisendString === vastus) {
        näitaPopup(`
            <strong>Õige!</strong><br><br>
            ${aktiivneSõna.tähendus || "Definitsioon puudub"}<br><br>
            <button onclick="uusSõna(); sulgePopup();">
                Uus sõna
            </button>
        `, true);
        return;
    }

    if (sisendString === vastus) {
        skoor++;
        muudaSkoor();
        lahendatud = true;
        näitaPopup(
            `<strong>Õige!</strong><br><br>
            <strong>${vastus}</strong> - ${aktiivneSõna.tähendus || "Definitsioon puudub"}<br><br>
            <button onclick="uusSõna(); sulgePopup();">
                Uus sõna
            </button>
            `,
            true
        );
        document.getElementById("järgmine-nupp").style.display = "inline-block";
    } else {
        elud--;
        muudaElud();
        eludAnim();
    }

    if (elud <= 0) {
        mängLäbi = true;
        näitaPopup(
            `Mäng läbi!<br>
            Leidsid <strong>${skoor}</strong> õiget sõna.<br><br>
            Õige sõna oli <strong>${vastus}</strong>.<br><br>
            <button onclick="nulliSeis()">Alusta uuesti</button>`,
            false
        );
    }
}

function eludAnim() {
    const elu = document.getElementById("elud");

    elu.classList.remove("flash");
    void elu.offsetWidth;
    elu.classList.add("flash");

    setTimeout(() => {
        elu.classList.remove("flash");
    }, 400);
}

/**
 * Hüpikakna stiili määramine ja kuvamine
 * @param {*} tekst 
 * @param {*} success 
 */
function näitaPopup(tekst, success = null) {
    const popup = document.getElementById("popup");
    const content = document.getElementById("popup-sisu");

    let värv = "";
    if (success === true) värv = "color: green;";
    if (success === false) värv = "color: red;";

    content.innerHTML = `<div style="${värv}">${tekst}</div>`;
    popup.style.display = "flex";
}

function sulgePopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "none";
    popupLahti = false;
}

/**
 * Tähtede sektsiooni loomine
 * TODO: Valida suvaliselt lisanduvad tähed sageduse järgi?
 */
function looTähed() {
    // const tähestik = "abcdefghijklmnopqrstuvwxyzõäöü";
    const tähestik = "abdefghijklmnoprstuvõäöü";
    let tähed = vastus.split("");

    let lisatähed = 3;
    if (vastus.length >= 10) lisatähed = 2;
    if (vastus.length >= 15) lisatähed = 1;

    let tähevariandid = vastus.length + lisatähed;
    if (tähevariandid % 2 !== 0) tähevariandid--;

    while (tähed.length < tähevariandid) {
        const rand = tähestik[Math.floor(Math.random() * tähestik.length)];
        if (!tähed.includes(rand)) {
            tähed.push(rand);
        }
    }

    let loendur = 0;
    aktiivsedTähed = tähed.map(t => ({
        täht: t,
        id: loendur++
    }));

    praegusedTähed = [...aktiivsedTähed];
    segaTähed();
}

/**
 * Abifunktsioon alumise sektsiooni tähtede segamiseks
 */
function näitaTähed(tähelist) {
    const container = document.getElementById("tähed");
    container.innerHTML = "";

    for (let tähenupp of tähelist) {
        const div = document.createElement("div");
        div.className = "täht-box";
        div.textContent = tähenupp.täht;

        if (kasutatudTähed.has(tähenupp.id)) {
            div.classList.add("kasutatud");
        }

        div.onclick = () => {
            if (sisend.length < vastus.length && !kasutatudTähed.has(tähenupp.id)) {
                sisend.push(tähenupp);
                kasutatudTähed.add(tähenupp.id);
                uuendaLünk();
                näitaTähed(tähelist);
            }
        };

        container.appendChild(div);
    }
}

function segaTähed() {
    praegusedTähed = [...aktiivsedTähed].sort(() => Math.random() - 0.5);
    näitaTähed(praegusedTähed);
    tähedAnim();
}

function tähedAnim() {
    const tähed = document.querySelectorAll("#tähed .täht-box");

    tähed.forEach(täht => {
        täht.classList.remove("shuffle");
        void täht.offsetWidth;
        täht.classList.add("shuffle");
    });
}

/**
 * Tähe kustutamine
 */
function kustutaTäht() {
    const kustutatud = sisend.pop();

    if (kustutatud) kasutatudTähed.delete(kustutatud.id);

    uuendaLünk();
    näitaTähed(praegusedTähed);
}

/**
 * Vastuse lünga uuendamine
 */
function uuendaLünk() {
    const tekst = sisend.map(t => t.täht).join("").padEnd(vastus.length, "_");
    document.getElementById("sõna").textContent = tekst;
}
