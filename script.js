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
}

function avaÕpetus() {
    document.getElementById("koduleht").style.display = "none";
    document.getElementById("mänguleht").style.display = "none";
    document.getElementById("õpetus").style.display = "block";
}