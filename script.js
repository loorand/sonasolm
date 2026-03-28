let andmed = {}; // Andmest failist
let vastus = ""; // Õige vastus
let sisend = ""; // Mängija sisend
let aktiivneSõna = null; // Vastus
let aktiivsedTähed = []; // Tähed ekraanil

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
    kuvaLeht("koduleht");
}

function avaMäng() {
    kuvaLeht("mänguleht");
    uusSõna();
}

function avaÕpetus() {
    kuvaLeht("õpetus");
}

function kuvaLeht(id) {
    document.getElementById("koduleht").style.display = "none";
    document.getElementById("mänguleht").style.display = "none";
    document.getElementById("õpetus").style.display = "none";

    document.getElementById(id).style.display = "block";
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

    kuvaSõna(valiSõna());
}


/**
 * Sõna ja selle juurde kuuluva graafi kuvamine
 * @param {*} kirje 
 */
function kuvaSõna(kirje) {
    // document.getElementById("sõna").textContent = kirje.sõna;
    // document.getElementById("definitsioon").textContent = kirje.tähendus;
    vastus = kirje.sõna;
    sisend = "";
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
});

/**
 * Klaviatuuri sisendi töötlemise abifunktsioon
 */
document.addEventListener("keydown", function(e) {
    if (document.getElementById("mänguleht").style.display !== "block") return;

    if (e.key === "Delete") {
        sisend = sisend.slice(0, -1);
    } 
    else if (e.key.length === 1) {
        const täht = e.key.toLowerCase();
        if (aktiivsedTähed.includes(täht) && sisend.length < vastus.length) {
            sisend += täht;
        }
    }
    else if (e.key === "Enter") {
        kontrolliVastus();
    }

    uuendaLünk();
});

/**
 * Pakutud vastuse kontroll ja otsus
 */
function kontrolliVastus() {
    if (sisend === vastus) {
        näitaPopup(
            `<strong>Õige!</strong><br><br>${aktiivneSõna.tähendus || "Definitsioon puudub"}`,
            true
        );
    } else {
        näitaPopup("Vale! Õige sõna oli: " + vastus, false);
    }
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

/**
 * Tähtede sektsiooni loomine
 * TODO: Valida suvaliselt lisanduvad tähed sageduse järgi?
 */
function looTähed() {
    const tähestik = "abcdefghijklmnopqrstuvwxyzõäöü";
    let tähed = Array.from(new Set(vastus.split("")));

    while (tähed.length < new Set(vastus).size + 3) {
        const rand = tähestik[Math.floor(Math.random() * tähestik.length)];
        if (!tähed.includes(rand)) {
            tähed.push(rand);
        }
    }

    aktiivsedTähed = tähed;
    segaTähed();
}

/**
 * Abifunktsioon alumise sektsiooni tähtede segamiseks
 */
function segaTähed() {
    const container = document.getElementById("tähed");
    container.innerHTML = "";

    const segatud = [...aktiivsedTähed].sort(() => Math.random() - 0.5);

    for (let täht of segatud) {
        const div = document.createElement("div");
        div.className = "täht-box";
        div.textContent = täht;

        div.onclick = () => {
            if (sisend.length < vastus.length) {
                sisend += täht;
                uuendaLünk();
            }
        };

        container.appendChild(div);
    }
}

/**
 * Tähe kustutamine
 */
function kustutaTäht() {
    sisend = sisend.slice(0, -1);
    uuendaLünk(); 
}

/**
 * Vastuse lünga uuendamine
 */
function uuendaLünk() {
    const tekst = sisend.padEnd(vastus.length, "_");
    document.getElementById("sõna").textContent = tekst;
}