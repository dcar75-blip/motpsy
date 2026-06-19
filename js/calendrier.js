// Le "jour" du jeu est défini en heure de Marseille,
// quel que soit le fuseau horaire de l'appareil du joueur.
const FUSEAU_MARSEILLE = 'Europe/Paris'; // identifiant technique IANA pour Marseille

// Retourne une clé de jour stable en heure de Marseille (YYYY-MM-DD).
function obtenirCleJourMarseille(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: FUSEAU_MARSEILLE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

// Normalise une date d'entrée de la liste en "YYYY-MM-DD"
function normaliserDate(valeur) {
    if (!valeur) return null;
    return String(valeur).slice(0, 10);
}

// Générateur pseudo-aléatoire déterministe à partir d'une chaîne
// (permet un tirage de secours STABLE sur toute la journée)
function hashChaine(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (h * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

// Choisit le mot du jour à partir de sa DATE (et non de sa position dans la liste).
// Format d'une entrée : [mot, définition, catégorie, photo, cacher1ereLettre, date]
function obtenirInfosMots() {
    const cleAujourdhui = obtenirCleJourMarseille();
    const cleHier = obtenirCleJourMarseille(new Date(Date.now() - 86400000));

    // Indexation des mots par date
    const parDate = {};
    for (const entree of LISTE_MOTS_A_TROUVER) {
        const d = normaliserDate(entree[5]);
        if (d) parDate[d] = entree;
    }

    // Mot du jour : on cherche la date d'aujourd'hui
    let aujourdhui = parDate[cleAujourdhui];

    if (!aujourdhui) {
        // Aucun mot prévu aujourd'hui : on rejoue un mot aléatoire (stable sur la journée)
        // parmi ceux dont la date est déjà passée (pour ne pas spoiler un mot futur).
        const passes = LISTE_MOTS_A_TROUVER.filter(e => {
            const d = normaliserDate(e[5]);
            return d && d < cleAujourdhui;
        });
        if (passes.length > 0) {
            aujourdhui = passes[hashChaine(cleAujourdhui) % passes.length];
        } else {
            aujourdhui = LISTE_MOTS_A_TROUVER[0];
        }
    }

    // Mot d'hier (par date) ; si absent, la section "mot d'hier" sera masquée.
    const hier = parDate[cleHier] || null;

    return { aujourdhui, hier };
}
