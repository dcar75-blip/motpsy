const infosMots = obtenirInfosMots();
const motSolution = infosMots.aujourdhui[0].toUpperCase();
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
    // Récupère la catégorie du mot du jour : [mot, définition, catégorie, photo]
    const categorie = (infosMots && infosMots.aujourdhui && infosMots.aujourdhui[2])
        ? infosMots.aujourdhui[2].trim().toLowerCase()
        : "";

    switch (categorie) {
        case "composé":
        case "compose":
            return "Aujourd'hui, un mot composé (avec un ou des tirets).";
        case "vip":
            return "Aujourd'hui, une Very Important Personnalité de la psychanalyse (format Initiale du prénom-Nom en entier).";
        case "vo":
            return "Achtung ! Aujourd'hui un mot dans sa langue d'origine (souvent l'allemand).";
        case "lacan":
            return "🛋️ Le Jour de Lacan ! Une notion du vocabulaire lacanien.";
        default:
            // Classique ou catégorie inconnue : pas de message
            return "";
    }
}
