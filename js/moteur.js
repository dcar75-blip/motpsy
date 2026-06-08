async function valider() {
  if (validationEnCours) return;
  validationEnCours = true;

  try {
    const motSaisi = reconstituerMotFinal();

    if (motSaisi.length < motSolution.length) {
      notifier(CONFIG.texteTropCourt);
      essaiActuel = "";
      majAffichage();
      return;
    }

    if (!DICTIONNAIRE.includes(motSaisi)) {
      notifier(CONFIG.textePasDico);
      essaiActuel = "";
      majAffichage();
      return;
    }

    await colorerLigneAnimee(motSaisi);

    sauvegarderPartie();

    if (motSaisi === motSolution) {
      terminer(true);
    } else if (ligneActuelle === CONFIG.maxEssais - 1) {
      terminer(false);
    } else {
      ligneActuelle++;
      essaiActuel = "";
      majAffichage();
    }
  } finally {
    validationEnCours = false;
  }
}


function reconstituerMotFinal() {
    let final = "";
    let curseur = 0;
    const offrePremiere = (motSolution.length >= CONFIG.seuilOffrePremiere);
    const aTapePremiere = offrePremiere && essaiActuel[0] === motSolution[0];

    for (let i = 0; i < motSolution.length; i++) {
        if (i === 0 && offrePremiere) {
            final += motSolution[0];
            if (aTapePremiere) curseur++;
        } else {
            final += essaiActuel[curseur] || "";
            curseur++;
        }
    }
    return final.toUpperCase();
}

// Cette fonction anime la révélation lettre par lettre
async function colorerLigneAnimee(saisie) {
    const cases = document.querySelectorAll(`#ligne-${ligneActuelle} .case`);
    let solArr = motSolution.split('');
    let result = Array(motSolution.length).fill('absent');

    // 1. Calcul des couleurs 
    for (let i = 0; i < motSolution.length; i++) {
        if (saisie[i] === motSolution[i]) {
            result[i] = 'correct';
            solArr[i] = null;
        }
    }
    // Ajoute (cumul) les lettres bien placées dans l'aide (ne retire jamais celles déjà trouvées)
    for (let i = 0; i < motSolution.length; i++) {
        if (result[i] === 'correct') {
            lettresAide[i] = motSolution[i];
        }
    }
    for (let i = 0; i < motSolution.length; i++) {
        if (result[i] !== 'correct' && solArr.includes(saisie[i])) {
            result[i] = 'present';
            solArr[solArr.indexOf(saisie[i])] = null;
        }
    }

    // 2. Révélation lettre à lettre avec un petit délai
    for (let i = 0; i < motSolution.length; i++) {
        cases[i].className = `case ${result[i]}`;

        mettreAJourTouche(saisie[i], result[i]);

        if (typeof sonJouerEtat === "function") {
          sonJouerEtat(result[i]); // 'correct'|'present'|'absent'
        }

        // On attend 200 millisecondes entre chaque lettre
        await new Promise(resolve => setTimeout(resolve, 230));
    }
    
    // On attend un petit peu à la fin avant de passer à la suite
    await new Promise(resolve => setTimeout(resolve, 300));
}