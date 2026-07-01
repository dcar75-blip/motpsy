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
    
    function titreVictoire(coups) {
        if (coups === 1) return "Bravo ! Les voies du Sigmund sont avec toi !";
        if (coups === 6) return "Résistance vaincue à la dernière minute. Bien joué !";
        return "Bien joué !";
    }
    let titre = victoire ? titreVictoire(ligneActuelle + 1) : `${CONFIG.textePerdu}`;
    let sousTitre1 = victoire
        ? `Trouvé en ${ligneActuelle + 1} coup${(ligneActuelle + 1) > 1 ? "s" : ""}`
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
    ? `<p class="cliquable-partage" onclick='copierPartage(${JSON.stringify(texteAExporter)}, this)'>
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
            <b>MotPsy n° ${numeroMotpsy} : ${infosMots.aujourdhui[0]}</b> <br /> ${MarkdownVersHtml(infosMots.aujourdhui[1])}
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

    if (pool.length < 1) return;

    const cleLs = `motpsy_rejoue_ancien_${cleJour}`;
    let dateChoisie = localStorage.getItem(cleLs);

    if (!dateChoisie) {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("motpsy_rejoue_ancien_") && k !== cleLs) {
                localStorage.removeItem(k);
                i--;
            }
        }
        dateChoisie = normaliserDate(pool[hashChaine(cleJour) % pool.length][5]);
        localStorage.setItem(cleLs, dateChoisie);
    }

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
            element.style.cursor = "default";
        }
    });
}
