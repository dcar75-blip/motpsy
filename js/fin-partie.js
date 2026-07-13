function messageVictoireSpecial(ligne, pourPartage = false) {
    if (ligne === 0) {
        return pourPartage
            ? "Attention Insight ! MotPsy trouvé en un coup, les voies du Sigmund sont avec moi !"
            : "Attention Insight ! MotPsy trouvé en un coup, les voies du Sigmund sont avec toi !";
    }
    if (ligne === CONFIG.maxEssais - 1) {
        return pourPartage
            ? "Un MotPsy en 6 coups : résistance vaincue pour moi aujourd'hui !"
            : "Un MotPsy en 6 coups c'est une résistance vaincue. Bravo !";
    }
    return null;
}
function terminer(victoire) {
    if (typeof window.varianteOnFinMot === "function") {
        const prisEnCharge = window.varianteOnFinMot(victoire);
        if (prisEnCharge) {
            afficherLienRejouer();
            return;
        }
    }
    partieTerminee = true;
    if (notifTimeout) clearTimeout(notifTimeout);
    const zoneMsg = document.getElementById('zone-message');
    const zoneFin = document.getElementById('zone-fin');
    const numeroMotpsy = infosMots.index + 1;

    const attribution = contributeurs[motSolution]
        ? `<br /><span style="font-size:0.85em;font-style:italic;color:#888;">Mot proposé par ${contributeurs[motSolution]}</span>`
        : '';

    function titreVictoire(coups) {
        return messageVictoireSpecial(coups - 1) || "Bien joué !";
    }
    let titre = victoire ? titreVictoire(ligneActuelle + 1) : `${CONFIG.textePerdu}`;
    const casSpecialSousTitre = victoire && messageVictoireSpecial(ligneActuelle) !== null;
    let sousTitre1 = victoire
        ? (casSpecialSousTitre ? "" : `Trouvé en ${ligneActuelle + 1} coup${(ligneActuelle + 1) > 1 ? "s" : ""}`)
        : `Le mot était ${motSolution}`;
    
    const texteAExporter = genererGrillePartage(victoire);
    const exemple = infosMots.aujourdhui[7] || "";
    const rebonds = infosMots.aujourdhui[8] || "";
    const blocExemple = exemple
        ? `<hr><div id="zone-exemple"><h3>Exemple</h3>${MarkdownVersHtml(exemple)}</div>`
        : "";
    function extraireIdYoutube(url) {
        const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
    }
    function rebondsVersHtml(texte) {
        return texte.replace(/(https?:\/\/[^\s<]+)/g, url => {
            const id = extraireIdYoutube(url);
            if (id) {
                return `<a href="${url}" target="_blank" rel="noopener">`
                    + `<img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" `
                    + `alt="Aperçu YouTube" style="max-width:100%;border-radius:6px;display:block;margin-bottom:6px;">`
                    + `</a><a href="${url}" target="_blank" rel="noopener">${url}</a>`;
            }
            const estPodcast = /radiofrance\.fr|slate\.fr|soundcloud\.com|spotify\.com|podcast/i.test(url);
            if (estPodcast) {
                const conteneurId = 'podcast-' + Math.random().toString(36).slice(2,8);
                setTimeout(() => {
                    const el = document.getElementById(conteneurId);
                    if (!el) return;
                    fetch(`/og-proxy.php?url=${encodeURIComponent(url)}`)
                        .then(r => r.json())
                        .then(data => {
                            if (data.image) {
                                el.innerHTML = `<a href="${url}" target="_blank" rel="noopener">`
                                    + `<img src="${data.image}" alt="Aperçu podcast" `
                                    + `style="max-width:100%;border-radius:6px;display:block;margin-bottom:6px;">`
                                    + `</a><a href="${url}" target="_blank" rel="noopener">${url}</a>`;
                            } else {
                                el.innerHTML = `🎧 <a href="${url}" target="_blank" rel="noopener" style="color:#1368B0;font-weight:600;">${url}</a>`;
                            }
                        })
                        .catch(() => {
                            const el2 = document.getElementById(conteneurId);
                            if (el2) el2.innerHTML = `🎧 <a href="${url}" target="_blank" rel="noopener">${url}</a>`;
                        });
                }, 0);
                return `<div id="${conteneurId}" style="background:#f0f7ff;border:1px solid #50BBF6;border-radius:8px;padding:10px 14px;margin:4px 0;">🎧 Chargement…</div>`;
            }
            return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
        });
    }
    const blocRebonds = rebonds
        ? `<hr><div id="zone-rebonds"><h3>Rebonds</h3>${rebondsVersHtml(rebonds)}</div>`
        : "";
    const partageActif =
        (typeof window.variantePartagerActif === "function")
            ? window.variantePartagerActif()
            : true;
    const blocPartage = partageActif
    ? `<p class="cliquable-partage" id="lien-partage">
            Cliquer pour copier et partager 🟥🟨🟦
        </p>`
    : "";
    zoneMsg.innerHTML = `
    <div class="resultat-final" style="text-align: center;">
        <span style="color:#e7002a; font-size:1.6rem; font-weight:bold;">${titre}</span><br>
        <p>${sousTitre1}</p>
        ${blocPartage}
    </div>
    `;
    if (partageActif) {
        const lienPartage = document.getElementById('lien-partage');
        if (lienPartage) {
            lienPartage.addEventListener('click', () => copierPartage(texteAExporter, lienPartage));
        }
    }
    zoneFin.innerHTML = `
        <div id="zone-messagefinal"></div>        
        <div id="zone-liens">
        <h3>Liens</h3>
            <div class="liens-grid">
                <a class="lien-carte"
                href="mailto:motpsy@motpsy.fr?subject=Suggestion%20MotPsy&body=Envoyez-nous%20vos%20suggestions%2C%20des%20mots%20%C3%A0%20trouver%2C%20des%20d%C3%A9finitions...">
                Écrivez à MotPsy&nbsp;!
                </a>
            </div>
        </div>
        <hr>
        <div id="zone-jour">
            <h3>Dans les livres psy</h3>
            <b>MotPsy n° ${numeroMotpsy} : ${infosMots.aujourdhui[0]}</b> <br /> ${MarkdownVersHtml(infosMots.aujourdhui[1])}${attribution}
        </div>
        ${blocExemple}
        ${blocRebonds}
        <hr>
        <div id="zone-image-def"></div>
    `;
    afficherImageDuMot();
    afficherMessageFinal();
    afficherLienRejouer();
}
// Graine fixe du parcours MotPsy54 : à rang égal, une date garde toujours
// la même place relative dans l'ordre mélangé, même quand le pool grossit
// (chaque nouvelle date passée s'insère selon son propre rang, sans
// rebrasser les dates déjà présentes).
const SEED_PARCOURS_54 = "motpsy54-v1";

function afficherLienRejouer() {
    const DEBUT_OFFICIEL = "2026-09-12";
    let cleJour = obtenirCleJourMarseille();
    const dateForcee = new URLSearchParams(location.search).get("date");
    if (dateForcee && /^\d{4}-\d{2}-\d{2}$/.test(dateForcee)) {
        cleJour = dateForcee;
    }

    const pool = LISTE_MOTS_A_TROUVER.filter(e => {
        const d = normaliserDate(e[5]);
        return d && d > DEBUT_OFFICIEL && d < cleJour;
    });

    // Garde-fou existant : avant le 12 septembre (ou tant qu'aucun mot n'est
    // encore passé), le pool est vide. On n'affiche simplement pas le lien.
    if (pool.length < 1) return;

    // Parcours sans répétition : ordre mélangé mais fixe (rang intrinsèque
    // par date), puis on avance d'un cran par jour écoulé depuis le
    // lancement — chaque mot repassé n'est revu qu'une fois le pool
    // entièrement parcouru.
    const dispo = pool.slice().sort((a, b) => {
        const rangA = hashChaine(SEED_PARCOURS_54 + normaliserDate(a[5]));
        const rangB = hashChaine(SEED_PARCOURS_54 + normaliserDate(b[5]));
        return rangA - rangB;
    });

    const [dy, dm, dd] = DEBUT_OFFICIEL.split('-').map(Number);
    const [cy, cm, cd] = cleJour.split('-').map(Number);
    const diffJours = Math.round((Date.UTC(cy, cm - 1, cd) - Date.UTC(dy, dm - 1, dd)) / 86400000);

    const dateChoisie = normaliserDate(dispo[diffJours % dispo.length][5]);

    const grille = document.querySelector('#zone-liens .liens-grid');
    if (!grille) return;


    const a = document.createElement('a');
    a.className = 'lien-carte';
    a.href = `/?date=${dateChoisie}`;
    a.innerHTML = '<span class="lien-carte-titre">🎲 MotPsy54</span>'
              + '<span class="lien-carte-sous-texte">Une ancienne partie au hasard</span>';
    grille.appendChild(a);
}
function afficherImageDuMot() {
    const cont = document.getElementById("zone-image-def");
    const nomFichier = motSolution
        .toUpperCase()
        .replaceAll(" ", "")
        .replaceAll("'", "")
        .replaceAll("'", "");
    const img = document.createElement("img");
    img.className = "image-def";
    img.alt = motSolution;
    img.onload = () => {
        cont.innerHTML = "";
        cont.appendChild(img);
    };
    img.onerror = () => {
        // rien : pas d'image
    };
    img.src = `images/${nomFichier}.jpg`; 
}
function genererGrillePartage(victoire) {
    const numeroMotpsy = infosMots.index + 1;
    let texte = `#MOTPSY n°${numeroMotpsy} - `;
    texte += victoire ? `${ligneActuelle + 1}/${CONFIG.maxEssais} \n`:`-/${CONFIG.maxEssais} \n`;
    if (victoire) {
        const special = messageVictoireSpecial(ligneActuelle, true);
        if (special) texte += special + "\n";
    }

    for (let i = 0; i <= ligneActuelle; i++) {
        const cases = document.querySelectorAll(`#ligne-${i} .case`);
        let ligneEmoji = "";
        
        cases.forEach(c => {
            if (c.classList.contains('correct')) ligneEmoji += "🟥";
            else if (c.classList.contains('present')) ligneEmoji += "🟨";
            else ligneEmoji += "🟦";
        });
        
        texte += ligneEmoji + "\n";
    }
    texte += "https://motpsy.fr\n";
    return texte;
}
function copierPartage(texte, element) {
    navigator.clipboard.writeText(texte).then(() => {
        if (element) {
            element.innerHTML = "Score copié dans le presse-papier";
            element.classList.remove("cliquable-partage");
            element.style.cursor = "default";
            element.onclick = null;
        }
    });
}
