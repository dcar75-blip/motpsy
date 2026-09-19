function sauvegardeActif() {
  return (typeof window.varianteSauvegardeActif === "function")
    ? window.varianteSauvegardeActif()
    : true;
}
function obtenirCleUnique() {
    const chemin = window.location.pathname;
    // Cloisonnement par jour de partie (?date= ou jour réel) : deux parties
    // différentes (partie du jour vs rejeu d'une ancienne) ne partagent plus
    // jamais la même case, donc l'une n'écrase plus l'autre.
    return `motpsy_sauvegarde_${chemin}_${obtenirJourPartie()}`;
}
function sauvegarderPartie() {
    if (!sauvegardeActif()) return;
    const etat = {
        jourMarseille: obtenirJourPartie(),
        motSolution: motSolution,
        ligneActuelle: ligneActuelle,
        essais: []
    };
    for (let i = 0; i <= ligneActuelle; i++) {
        const cases = document.querySelectorAll(`#ligne-${i} .case`);
        let mot = "";
        cases.forEach(c => mot += c.textContent);
        if (mot.length === motSolution.length && !mot.includes(".")) {
            etat.essais.push(mot);
        }
    }
    localStorage.setItem(obtenirCleUnique(), JSON.stringify(etat));
}
function chargerPartie() {
    if (!sauvegardeActif()) return null;
    const cle = obtenirCleUnique();
    const sauvegarde = localStorage.getItem(cle);
    if (!sauvegarde) return null;
    const etat = JSON.parse(sauvegarde);
    // On vérifie le jour ET que le mot n'a pas changé
    if (!etat.jourMarseille || etat.jourMarseille !== obtenirJourPartie()
        || etat.motSolution !== motSolution) {
        localStorage.removeItem(cle);
        return null;
    }
    return etat;
}

// --- Migration jetable (ajoutée 2026-09-19, à retirer après le ~2026-10-10) ---
// Avant le cloisonnement par date ci-dessus, la clé de sauvegarde était
// motpsy_sauvegarde_<pathname> : UNE SEULE case pour tous les jours/parties,
// écrasée à chaque rejeu (cause du bug de rejeu MotPsy). On la recopie vers
// la nouvelle clé cloisonnée UNIQUEMENT si elle correspond au jour réel (donc
// jamais une partie passée en cours de rejeu au moment de la mise à jour),
// puis on la supprime dans tous les cas.
function migrerAncienneSauvegarde() {
    const chemin = window.location.pathname;
    const ancienneCle = `motpsy_sauvegarde_${chemin}`;
    const brut = localStorage.getItem(ancienneCle);
    if (!brut) return;
    try {
        const etat = JSON.parse(brut);
        const jourReel = obtenirCleJourMarseille(); // vrai jour, sans override ?date=
        if (etat && etat.jourMarseille === jourReel) {
            localStorage.setItem(`motpsy_sauvegarde_${chemin}_${jourReel}`, brut);
        }
    } catch (e) {
        // clé corrompue : on ne migre pas, on nettoie quand même ci-dessous
    }
    localStorage.removeItem(ancienneCle);
}
