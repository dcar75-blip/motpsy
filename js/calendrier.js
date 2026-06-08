const DATE_DEBUT_JEU = '2022-01-20T00:00:00';

// Le "jour" du jeu est défini en heure de Marseille,
// quel que soit le fuseau horaire de l'appareil du joueur.
const FUSEAU_MARSEILLE = 'Europe/Paris'; // identifiant technique IANA pour Marseille

// Retourne une clé de jour stable en heure de Marseille (YYYY-MM-DD).
// Exemple : "2026-01-10"
function obtenirCleJourMarseille(date = new Date()) {
    // "en-CA" formate en YYYY-MM-DD.
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: FUSEAU_MARSEILLE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

// Convertit une date en "numéro de jour" (entier) basé sur la date civile à Marseille.
// On parse la clé YYYY-MM-DD en UTC pour obtenir un compteur stable, indépendant du DST.
function numeroJourMarseille(date = new Date()) {
    const cle = obtenirCleJourMarseille(date);
    return Math.floor(Date.parse(`${cle}T03:00:00Z`) / (1000 * 60 * 60 * 24));
}

function obtenirInfosMots() {
    const debut = numeroJourMarseille(new Date(DATE_DEBUT_JEU));
    const maintenant = numeroJourMarseille(new Date());
    let index = maintenant - debut;

    if (index >= LISTE_MOTS_A_TROUVER.length) {
        index = index % LISTE_MOTS_A_TROUVER.length;
    }

    return {
        aujourdhui: LISTE_MOTS_A_TROUVER[index],
        hier: index > 0 ? LISTE_MOTS_A_TROUVER[index - 1] : null,
        index: index
    };
}
