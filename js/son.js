// son.js

const SON_KEY = "motchus_son"; // global (toutes pages)

function sonAssurerContexte() {
  if (!audioCtxSon) {
    audioCtxSon = new (window.AudioContext || window.webkitAudioContext)();
  }
}

/* --- storage (robuste navigation privée) --- */

function sonLireStorage() {
  try {
    const v = localStorage.getItem(SON_KEY);
    if (v === "1") sonActif = true;
    else if (v === "0") sonActif = false;
    // sinon: on garde le défaut (false)
  } catch (e) {
    // localStorage indisponible -> on garde le défaut
  }
}

function sonEcrireStorage() {
  try {
    localStorage.setItem(SON_KEY, sonActif ? "1" : "0");
  } catch (e) {}
}

/* --- état / UI --- */

function sonMajBouton() {
  const b = document.getElementById("btn-son");
  if (!b) return;
  b.textContent = sonActif ? "🔊" : "🔇";
}

function sonSetActif(on) {
  sonActif = !!on;
  sonEcrireStorage();
  sonMajBouton();
}

function sonToggle() {
  sonSetActif(!sonActif);
  return sonActif;
}

function sonEstActif() {
  return !!sonActif;
}

// Init calqué sur themeInit()
function sonInit() {
  sonLireStorage();
  sonMajBouton();

  const b = document.getElementById("btn-son");
  if (b) b.addEventListener("click", sonToggle);
}

/* --- API appelée par moteur.js : etat = 'correct'|'present'|'absent' --- */

function sonJouerEtat(etat) {
  if (!sonActif) return;
  sonAssurerContexte();

  const type = (etat === "correct") ? "C" : (etat === "present" ? "P" : "A");
  sonPlayTheme2(type);
}

/* -------- THEME 1 -------- */

function sonPlayTheme1(type) {
  const now = audioCtxSon.currentTime;
  sonTone(type === 'C' ? 1046 : type === 'P' ? 783 : 523, 0.10, 'sine', now);
  sonNoise(now, 0.05, 2000, 'highpass');
}

/* -------- THEME 2 Pixel -------- */

function sonPlayTheme2(type) {
  const now = audioCtxSon.currentTime;
  sonTone(type === 'C' ? 1000 : type === 'P' ? 800 : 400, 0.1, 'square', now, type === 'P' ? 1200 : null);
}

/* --- helpers --- */

function sonTone(f, d, s, start, fEnd = null, vol = 0.15) {
  const osc = audioCtxSon.createOscillator();
  const g = audioCtxSon.createGain();
  osc.type = s;
  osc.frequency.setValueAtTime(f, start);
  if (fEnd) osc.frequency.exponentialRampToValueAtTime(fEnd, start + d);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + d);
  osc.connect(g);
  g.connect(audioCtxSon.destination);
  osc.start(start);
  osc.stop(start + d);
}

function sonNoise(start, d, freq, fType) {
  const bSize = Math.floor(audioCtxSon.sampleRate * d);
  const buffer = audioCtxSon.createBuffer(1, bSize, audioCtxSon.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bSize; i++) data[i] = Math.random() * 2 - 1;

  const src = audioCtxSon.createBufferSource();
  src.buffer = buffer;

  const fil = audioCtxSon.createBiquadFilter();
  fil.type = fType;
  fil.frequency.value = freq;

  const g = audioCtxSon.createGain();
  g.gain.setValueAtTime(0.05, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + d);

  src.connect(fil);
  fil.connect(g);
  g.connect(audioCtxSon.destination);
  src.start(start);
}
