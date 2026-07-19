function initialiserGrille() {
    const grille = document.getElementById('grille-jeu');
    grille.innerHTML = "";
    for (let i = 0; i < CONFIG.maxEssais; i++) {
        const ligneDiv = document.createElement('div');
        ligneDiv.className = 'ligne';
        ligneDiv.id = `ligne-${i}`;
        for (let j = 0; j < motSolution.length; j++) {
            const caseDiv = document.createElement('div');
            caseDiv.className = 'case';
            ligneDiv.appendChild(caseDiv);
        }
        grille.appendChild(ligneDiv);
    }
    majAffichage();
}

function majAffichage() {
    const cases = document.querySelectorAll(`#ligne-${ligneActuelle} .case`);
const offrePremiere = offrirPremiereLettre();
    let curseurSaisie = 0;
    const aTapePremiere = offrePremiere && essaiActuel[0] === motSolution[0];
    const dernierCoup = ligneActuelle === CONFIG.maxEssais - 1;

    for (let i = 0; i < motSolution.length; i++) {

        // Première lettre offerte
        if (i === 0 && offrePremiere) {
            cases[i].textContent = motSolution[0];
            cases[i].className = "case correct";
            if (!aTapePremiere) continue;
        }

        // Affichage des lettres d'aide (+ filet du 6e coup, mots longs) uniquement si aucune saisie
        const filetActif = dernierCoup && offrirSondeCourte() && i < 3;
        if (
            !(i === 0 && offrePremiere) &&
            essaiActuel.length === 0 &&
            (lettresAide[i] || filetActif)
        ) {
            cases[i].textContent = lettresAide[i] || motSolution[i];
            cases[i].className = filetActif ? "case correct" : "case";
            continue; // IMPORTANT : empêche l'effacement juste après
        }

        // Affichage de la saisie utilisateur
        if (curseurSaisie < essaiActuel.length) {
            cases[i].textContent = essaiActuel[curseurSaisie];
            if (!(i === 0 && offrePremiere)) cases[i].className = "case";
            curseurSaisie++;
        } else if (!(i === 0 && offrePremiere)) {
            cases[i].textContent = "";
            cases[i].className = "case";
        }
    }
}



function notifier(msg, duree = 3000) {
    
    const zone = document.getElementById('zone-message');
    if (notifTimeout) clearTimeout(notifTimeout);
    
    zone.innerHTML = msg;
    notifTimeout=setTimeout(() => { zone.innerHTML = ""; }, duree);
}

function afficherHier() {
    const conteneurHier = document.getElementById('zone-hier');
    if (!conteneurHier) return;

    if (infosMots.index === 0) {
        // Jour du lancement : il n'y a pas de mot d'hier
        conteneurHier.style.display = "";
        conteneurHier.innerHTML =
            `<h3>Le MotPsy d'hier</h3><p>🎉 Premier jour de MotPsy : pas encore de mot d'hier&nbsp;!</p>`;
    } else if (infosMots.hier && infosMots.hier[0]) {
        conteneurHier.style.display = "";
        conteneurHier.innerHTML =
            `<h3>Le MotPsy d'hier</h3><p><b>${infosMots.hier[0]}</b> <br/> ${MarkdownVersHtml(infosMots.hier[1])}</p>`;
    } else {
        conteneurHier.style.display = "none";
    }
}

let indiceTimeoutMasquage = null;
let indiceTimeoutSuppression = null;

function afficherAide() {
    const complement = infosMots.aujourdhui[6];
    if (!complement || !complement.trim()) return;
    const zone = document.getElementById('zone-indice');
    if (!zone) return;

    if (indiceTimeoutMasquage) clearTimeout(indiceTimeoutMasquage);
    if (indiceTimeoutSuppression) clearTimeout(indiceTimeoutSuppression);

    zone.style.opacity = "1";
    zone.innerHTML = `<p class="indice-vignette">L'analyste dit un simple « oui ». Le visage du patient s'éclaira.</p><p class="aide">${MarkdownVersHtml(complement)}</p>`;

    indiceTimeoutMasquage = setTimeout(() => {
        zone.style.opacity = "0";
        indiceTimeoutSuppression = setTimeout(() => {
            zone.innerHTML = "";
            zone.style.opacity = "1";
        }, 500);
    }, CONFIG.dureeMessageAide);
}

function afficherMessageFinal() {
    
    const zone = document.getElementById("zone-messagefinal");
    if (!zone) return;

    if (typeof MESSAGE_FINAL === "undefined") {
        zone.innerHTML = "";
        return;
    }

    const [texte, debut, fin] = MESSAGE_FINAL;
    if (!texte) { zone.innerHTML = ""; return; }

    const today = obtenirCleJourMarseille().replaceAll("-", "");

  
    if (debut && today < debut) { zone.innerHTML = ""; return; }
     
    if (fin && today > fin) { zone.innerHTML = ""; return; }

    zone.innerHTML = `<p>${MarkdownVersHtml(texte)}</p>`;
}

function afficherMessageinitial() {
    let message = "";

    const avert = messageCaracteresSpeciaux(motSolution);
    if (avert) message = avert;

    if (typeof MESSAGE_INITIAL !== "undefined") {
        const [texte, debut, fin] = MESSAGE_INITIAL;

        if (texte) {
            const today = obtenirCleJourMarseille().replaceAll("-", "");

            // Si pas dans la fenêtre, on n'ajoute pas le texte (mais on garde l'avert)
            if (!(debut && today < debut) && !(fin && today > fin)) {
                const texteInitial = MarkdownVersHtml(texte);
                message = message ? message + "<br>" + texteInitial : texteInitial;
            }
        }
    }

    if (message) {
        
        notifier(message, CONFIG.dureeMessageInitial);
    }
}


function MarkdownVersHtml(s) {
  // **texte** -> <b>texte</b>
  // *texte*   -> <i>texte</i>
  return s
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>");
}
