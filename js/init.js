const infosMots = obtenirInfosMots();
const motSolution = infosMots.aujourdhui[0].toUpperCase();
const cacherPremiere = (infosMots.aujourdhui[4] === true ||
                        String(infosMots.aujourdhui[4]).trim().toLowerCase() === "oui");
function offrirPremiereLettre() {
    if (cacherPremiere) return false;
    return motSolution.length >= CONFIG.seuilOffrePremiere;
}
const nbLettres = motSolution.length;
document.documentElement.style.setProperty('--cols', nbLettres);
let essaiActuel = ""; 
let ligneActuelle = 0;
let partieTerminee = false;
let validationEnCours = false;
let notifTimeout = null;
let lettresAide = Array(motSolution.length).fill(null); 
let sonActif = false;        // Off par défaut 
let audioCtxSon = null;
let modeSombre = false;   // clair par défaut
themeInit();
window.onload = () => {
    // 0. Écran de pré-lancement : avant le 1ᵉʳ septembre 2026 (sauf si ?date= présent, pour tes tests)
    if (infosMots.index < 0 && !new URLSearchParams(location.search).has("date")) {
        afficherEcranPreLancement();
        return;
    }

    afficherBandeauVacances();

    // Photo Lacan : visible uniquement les jours de catégorie "lacan"
    if (infosMots.aujourdhui[2] && infosMots.aujourdhui[2].trim().toLowerCase() === "lacan") {
        const photoLacan = document.getElementById("photo-lacan");
        if (photoLacan) photoLacan.style.display = "block";
    }

    // 1. On affiche le mot d'hier dans le footer
    if (typeof afficherHier === "function") {
        afficherHier();
    }
    // 2. On dessine la grille vide
    initialiserGrille();
    // 3. On génère les touches du clavier avec les symboles de CONFIG
    genererClavier();
    // 4. On recharge la grille
    const etatPrecedent = chargerPartie();
    if (etatPrecedent) {
        rejouerPartie(etatPrecedent);
    }
    // 5. Message initial et Avertissement caractères spéciaux (uniquement)
    afficherMessageinitial();
    
    // 6. Écouteur global pour le clavier physique
    window.addEventListener('keydown', (e) => {
        if (partieTerminee) return;
        const touche = e.key.toUpperCase();
        if (touche === "ENTER") {
           e.preventDefault();
           e.stopPropagation();
            valider();
        } else if (touche === "BACKSPACE") {
            e.preventDefault();
            effacer();
        } else if (touche === "-" || touche === "'" || touche === " " || /^[A-Z]$/.test(touche)) {
            // Empêche le défilement de page avec la barre espace
            if (e.code === "Space") e.preventDefault();
            clic(touche);
        }
    });
    // 7. Intialialisation bouton son
    if (typeof sonInit() === "function") {
        sonInit();
        
    }
};
async function rejouerPartie(etat) {
    // 1. On remplit et on anime les essais sauvegardés
    for (let index = 0; index < etat.essais.length; index++) {
        const mot = etat.essais[index];
        ligneActuelle = index;
        const cases = document.querySelectorAll(`#ligne-${ligneActuelle} .case`);
        for (let i = 0; i < mot.length; i++) {
            cases[i].textContent = mot[i];
        }
        await colorerLigneAnimee(mot); 
    }
    
    // 2. Vérification de l'état de fin AVANT de passer à la ligne suivante
    const dernierMot = etat.essais[etat.essais.length - 1];
    
    if (dernierMot === motSolution) {
        // Si gagné, on reste sur cette ligne pour le décompte des points
        terminer(true);
    } else if (etat.essais.length >= CONFIG.maxEssais) {
        // Si perdu (tous les essais utilisés)
        terminer(false);
    } else {
        // 3. SEULEMENT si la partie continue, on avance d'une ligne
        ligneActuelle = etat.essais.length;
        essaiActuel = "";
        majAffichage();
    }
}
function messageCaracteresSpeciaux(mot) {
    const categorie = (infosMots && infosMots.aujourdhui && infosMots.aujourdhui[2])
        ? infosMots.aujourdhui[2].trim().toLowerCase()
        : "";
    const motDuJour = (infosMots && infosMots.aujourdhui && infosMots.aujourdhui[0])
        ? infosMots.aujourdhui[0].trim().toUpperCase()
        : "";
    const contientTiret = motDuJour.includes("-");

    let messages = [];

    // Message lié à la catégorie
    switch (categorie) {
        case "vip":
            messages.push('<b style="color:#e7002a;">On cherche aujourd\'hui une Very Important Personnalité de la psychanalyse... ou un cas clinique célèbre !</b>');
            break;
        case "vo":
            messages.push('<b style="color:#e7002a;">Achtung ! On cherche aujourd\'hui un mot allemand. Tu peux saisir des mots en allemand ou en français indifféremment.</b>');
            break;
        case "lacan":
            messages.push('<b style="color:#e7002a;">🛋️ Le Jour de Lacan ! On cherche aujourd\'hui une notion du vocabulaire lacanien.</b>');
            break;
    }

    // Attribut transversal : tiret
    if (contientTiret) {
        messages.push('<b style="color:#e7002a;">⚠️ Aujourd\'hui, MotPsy est un mot composé ou une expression de 2 mots. Dans les 2 cas, utilisez le tiret du clavier pour séparer les 2 parties (ex : PORTE-MANTEAU).</b>');
    }

    return messages.join("<br>");
}
// --- Périodes de vacances scolaires (hors été car jeu fermé avant le 1er sept) ---
function estEnVacances(date) {
  const d = date || new Date();
  const t = d.getTime();
  const v = [
    ['2026-10-17', '2026-11-02'],
    ['2026-12-19', '2027-01-04'],
    ['2027-02-06', '2027-02-22'],
    ['2027-04-10', '2027-04-26'],
  ];
  return v.some(([debut, fin]) =>
    t >= new Date(debut).getTime() && t <= new Date(fin + 'T23:59:59').getTime()
  );
}

// --- Bandeau vacances ---
function afficherBandeauVacances() {
  if (!estEnVacances()) return;
  const div = document.createElement('div');
  div.id = 'bandeau-vacances';
  div.style.cssText = 'background:#e8f4fd;border:1px solid #50BBF6;border-radius:8px;padding:12px 16px;margin:0 auto 16px auto;max-width:500px;text-align:center;font-size:0.95rem;line-height:1.5;';
  div.innerHTML = 'MotPsy est en supervision pendant les vacances 😎<br>En attendant la rentrée avec pléthore de nouveaux mots, rejoue chaque jour une ancienne partie et partage-la sur tes réseaux !';
  const header = document.querySelector('header');
  if (header) header.insertAdjacentElement('afterend', div);
}

function afficherEcranPreLancement() {
    const LANCEMENT = new Date("2026-09-01T00:00:00");
    const joursRestants = Math.max(0, Math.ceil((LANCEMENT - new Date()) / 86400000));
    const texteCompte = joursRestants > 0
        ? "dans " + joursRestants + " jour" + (joursRestants > 1 ? "s" : "")
        : "aujourd'hui !";

    const style = document.createElement("style");
    style.textContent = `
        #ecran-prelancement{position:fixed;inset:0;z-index:9999;display:flex;
            align-items:center;justify-content:center;background:#fff;padding:24px;
            font-family:system-ui,Arial,sans-serif;text-align:center;}
        #ecran-prelancement .pl-logo{width:200px;max-width:70%;aspect-ratio:1000/810;height:auto;margin-bottom:18px;}
        #ecran-prelancement .pl-titre{font-size:1.5rem;font-weight:700;color:#e7002a;margin-bottom:6px;}
        #ecran-prelancement .pl-compte{font-size:1.1rem;color:#F0C030;font-weight:700;margin-bottom:20px;}
        #ecran-prelancement .pl-texte{font-size:1rem;color:#333;line-height:1.5;max-width:440px;margin:0 auto 22px;}
        #ecran-prelancement .pl-contact{display:inline-block;padding:10px 22px;border-radius:8px;
            background:#60C0F0;color:#fff;text-decoration:none;font-weight:700;}
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "ecran-prelancement";
    overlay.innerHTML = `
        <div>
            <img class="pl-logo" src="images/motpsy-logo.svg?v=20260629" alt="MotPsy" width="200" height="162" decoding="async" />
            <div class="pl-titre">🚀 Ouverture le 1ᵉʳ septembre 2026</div>
            <div class="pl-compte">${texteCompte}</div>
            <p class="pl-texte">Un jeu psy, érudit et œcuménique : toutes les écoles y ont leur place.<br>Premier mot le jour J — à très bientôt&nbsp;!</p>
            <a class="pl-contact" href="mailto:motpsy@motpsy.fr">Écrivez-nous</a>
        </div>`;
    document.body.appendChild(overlay);
}
