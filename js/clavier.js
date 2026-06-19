function genererClavier() {
    const lignes = ["AZERTYUIOP", "QSDFGHJKLM", "WXCVBN"];
    
    const autoriseApostrophe = motSolution.includes("'") || motSolution.includes("’");
    const autoriseEspace = motSolution.includes(" ");
    // const autoriseTiret =  motSolution.includes("-") || (!autoriseEspace && !autoriseApostrophe);
	// On affiche toujours le tiret
	const autoriseTiret = true;
	
    const divLigne0 = document.getElementById(`clavier-L0`);

	if (autoriseApostrophe) {
		divLigne0.innerHTML += `<button id="touche-APO" style="max-width: 150px; max-height:35px;" data-touche="'" data-etat="" onclick="clic(this.dataset.touche)">’</button>`;
	}
	if (autoriseEspace) {
		divLigne0.innerHTML += `<button id="touche-SPACE" style="max-width: 150px; max-height:35px;" data-touche=" " data-etat="" onclick="clic(this.dataset.touche)">Espace</button>`;
	}

    lignes.forEach((lettres, i) => {
        const div = document.getElementById(`clavier-L${i + 1}`);
        div.innerHTML = "";

        if (i === 2) {
			if (infosMots.aujourdhui[6]) {
				div.innerHTML += `<button id="touche-AIDE" onclick="afficherAide()">💡</button>`;
			}

            if (autoriseTiret) {
                div.innerHTML += `<button id="touche-DASH" data-touche="-" data-etat="" onclick="clic(this.dataset.touche)">-</button>`;
            }

        }

        lettres.split('').forEach(l => {
            div.innerHTML += `<button id="touche-${l}" data-touche="${l}" data-etat="" onclick="clic(this.dataset.touche)">${l}</button>`;
        });

        if (i === 2) {
            div.innerHTML += `<button id="touche-EFFACER" onclick="effacer()">⌫</button>`;
            div.innerHTML += `<button id="touche-ENTREE" onclick="valider()">↲</button>`;
        }
    });
}

/* --- mise à jour des couleurs de touches --- */
const PRIORITE_TOUCHE = { "": 0, absent: 1, present: 2, correct: 3 };

function idPourTouche(t) {
    if (t === " ") return "touche-SPACE";
    if (t === "-") return "touche-DASH";
    if (t === "'" || t === "’") return "touche-APO";
    return `touche-${t.toUpperCase()}`;
}

function mettreAJourTouche(t, etat) {
    const id = idPourTouche(t);
    const btn = document.getElementById(id);
    if (!btn) return;

    const actuel = btn.dataset.etat || "";
    if (PRIORITE_TOUCHE[actuel] >= PRIORITE_TOUCHE[etat]) return;

    btn.classList.remove("touche-absent", "touche-present", "touche-correct");
    btn.classList.add(`touche-${etat}`);
    btn.dataset.etat = etat;
}



function clic(l) {
    if (partieTerminee) return;
    if (essaiActuel.length < motSolution.length) {
        essaiActuel += l;
        majAffichage();
    }
}


function effacer() {
    essaiActuel = essaiActuel.slice(0, -1);
    majAffichage();
}
