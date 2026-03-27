window.onload = avaKodu;

function avaKodu() {
    document.getElementById("koduleht").style.display = "block";
    document.getElementById("mänguleht").style.display = "none";
    document.getElementById("õpetus").style.display = "none";
}

function avaMäng() {
    document.getElementById("koduleht").style.display = "none";
    document.getElementById("mänguleht").style.display = "block";
    document.getElementById("õpetus").style.display = "none";

    uusSõna();
}

function avaÕpetus() {
    document.getElementById("koduleht").style.display = "none";
    document.getElementById("mänguleht").style.display = "none";
    document.getElementById("õpetus").style.display = "block";
}

// Laadi sõnad andmestikust
let andmed = {};
fetch("relations.json")
    .then(res => res.json())
    .then(data => {
        andmed = data;
    })

function valiSõna() {
    const võti = Object.keys(andmed);

    const juhuslik = võti[Math.floor(Math.random() * võti.length)];

    const tähendused = andmed[juhuslik];
    const kirje = tähendused[Math.floor(Math.random() * tähendused.length)];

    return kirje;
}

function kuvaSõna(kirje) {
    document.getElementById("sõna").textContent = kirje.sõna;
    // document.getElementById("definitsioon").textContent = kirje.tähendus;

    document.getElementById("ülemine").innerHTML = "";
    document.getElementById("alumine").innerHTML = "";
    document.getElementById("vasak").innerHTML = "";
    document.getElementById("parem").innerHTML = "";

    function lisaSõnad(containerId, sõnad, clickable = true) {
        const container = document.getElementById(containerId);
        if (!sõnad) return;

        for (let sõna of sõnad) {
            const div = document.createElement("div");
            div.className = `sõna-box ${sõna.tüüp}`;
            div.textContent = sõna.s;

            if (clickable && sõna.d) {
                div.onclick = (e) => {
                    // console.log("Click", sõna);
                    e.stopPropagation();
                    näitaDef(sõna.s, sõna.d);
                }
            }

            container.appendChild(div);
        }
    }

    let ülemised = [];

    const hyperKeys = Object.keys(kirje.hüperonüümid || {});
    const holoKeys = Object.keys(kirje.holonüümid || {});

    if (hyperKeys.length > 0 && holoKeys.length > 0) {
        const h1 = hyperKeys[Math.floor(Math.random() * hyperKeys.length)];
        const ho1 = holoKeys[Math.floor(Math.random() * holoKeys.length)];
        ülemised.push({ s: h1, d: kirje.hüperonüümid[h1], tüüp: "hyper" });
        ülemised.push({ s: ho1, d: kirje.holonüümid[ho1], tüüp: "holo" });
    } else {
        const all = hyperKeys.length > 0 ? hyperKeys : holoKeys;
        all.sort(() => 0.5 - Math.random());
        all.slice(0, 2).forEach(sõna => {
            const tüüp = hyperKeys.includes(sõna) ? "hyper" : "holo";
            ülemised.push({ s: sõna, d: (hyperKeys.includes(sõna) ? kirje.hüperonüümid[sõna] : kirje.holonüümid[sõna]), tüüp });
        });
    }

    let alumised = [];

    const hypoKeys = Object.keys(kirje.hüponüümid || {});
    const meroKeys = Object.keys(kirje.meronüümid || {});

    if (hypoKeys.length > 0 && meroKeys.length > 0) {
        const h1 = hypoKeys[Math.floor(Math.random() * hypoKeys.length)];
        const m1 = meroKeys[Math.floor(Math.random() * meroKeys.length)];
        alumised.push({ s: h1, d: kirje.hüponüümid[h1], tüüp: "hypo" });
        alumised.push({ s: m1, d: kirje.meronüümid[m1], tüüp: "mero" });
    } else {
        const all = hypoKeys.length > 0 ? hypoKeys : meroKeys;
        all.sort(() => 0.5 - Math.random());
        all.slice(0, 2).forEach(sõna => {
            const tüüp = hypoKeys.includes(sõna) ? "hypo" : "mero";
            alumised.push({ s: sõna, d: (hypoKeys.includes(sõna) ? kirje.hüponüümid[sõna] : kirje.meronüümid[sõna]), tüüp });
        });
    }

    const synKeys = Object.keys(kirje.sünonüümid || {}).sort(() => 0.5 - Math.random()).slice(0, 2);
    let vasak = [], parem = [];

    if (synKeys.length === 1) {
        vasak.push({ s: synKeys[0], d: "", tüüp: "syn" });
    } else if (synKeys.length === 2) {
        vasak.push({ s: synKeys[0], d: "", tüüp: "syn" });
        parem.push({ s: synKeys[1], d: "", tüüp: "syn" });
    }

    lisaSõnad("vasak", vasak, false);
    lisaSõnad("parem", parem, false);

    lisaSõnad("ülemine", ülemised, true);
    lisaSõnad("alumine", alumised, true);
}

function valiKaks(obj1, obj2) {
    const arr1 = Object.entries(obj1 || {});
    const arr2 = Object.entries(obj2 || {});

    let tulemus = [];

    if (arr1.length > 0 && arr2.length > 0) {
        tulemus.push(arr1[Math.floor(Math.random() * arr1.length)]);
        tulemus.push(arr2[Math.floor(Math.random() * arr2.length)]);
    } else {
        const all = arr1.length > 0 ? arr1 : arr2;
        tulemus = all
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
    }

    return Object.fromEntries(tulemus);
}

function valiÜks(obj) {
    const arr = Object.entries(obj || {});
    if (arr.length === 0) return [];
    return [arr[Math.floor(Math.random() * arr.length)]];
}

function uusSõna() {
    if (Object.keys(andmed).length === 0) {
        console.log("Ei saadud uut sõna");
        return;
    }

    const kirje = valiSõna();
    kuvaSõna(kirje);
}

function näitaDef(sõna, definitsioon) {
    const popup = document.getElementById("popup");
    const content = document.getElementById("popup-content");

    content.innerHTML = `<strong>${sõna}</strong><br><br>${definitsioon || "Definitsioon puudub"}`;
    popup.style.display = "flex";
}

document.addEventListener("click", function (e) {
    const popup = document.getElementById("popup");
    if (popup.style.display === "flex") {
        popup.style.display = "none";
    }
});