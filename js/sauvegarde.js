function sauvegardeActif() {
  return (typeof window.varianteSauvegardeActif === "function")
    ? window.varianteSauvegardeActif()
    : true;
}
function obtenirCleUnique() {
    const chemin = window.location.pathname;
    return `motpsy_sauvegarde_${chemin}`;
}
function sauvegarderPartie() {
    if (!sauvegardeActif()) return;
    const etat = {
        jourMarseille: obtenirCleJourMarseille(),
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
    if (!etat.jourMarseille || etat.jourMarseille !== obtenirCleJourMarseille()
        || etat.motSolution !== motSolution) {
        localStorage.removeItem(cle);
        return null;
    }
    return etat;
}
