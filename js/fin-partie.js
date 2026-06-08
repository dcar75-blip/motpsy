function terminer(victoire) {

    if (typeof window.varianteOnFinMot === "function") {
        const prisEnCharge = window.varianteOnFinMot(victoire);
        if (prisEnCharge) return;
    }

    partieTerminee = true;
    const zoneMsg = document.getElementById('zone-message');
    const zoneFin = document.getElementById('zone-fin');

    const numeroMotchus = infosMots.index +1;
    
    let titre = victoire ? `${CONFIG.texteGagne}` : `${CONFIG.textePerdu}`;
    let sousTitre1 = victoire
        ? `Trouvé en ${ligneActuelle + 1} coup${(ligneActuelle + 1) > 1 ? "s" : ""}`
        : `Le mot était ${motSolution}`;
    
    const texteAExporter = genererGrillePartage(victoire);
// 0. On prépare les modes laive et série
    const partageActif =
        (typeof window.variantePartagerActif === "function")
            ? window.variantePartagerActif()
            : true;

    const blocPartage = partageActif
    ? `<p class="cliquable-partage" onclick='copierPartage(${JSON.stringify(texteAExporter)})'>
            Cliquer pour copier et partager 🟥🟨🟦
        </p>`
    : "";


    // 1. Le message de victoire/défaite + Bouton de partage
    zoneMsg.innerHTML = `
    <div class="resultat-final" style="text-align: center;">
        <span style="color:#e7002a; font-size:1.6rem; font-weight:bold;">${titre}</span><br>
        <p>${sousTitre1}</p>
        ${blocPartage}
    </div>
    
    `;

    // 2. La définition en dessous
    zoneFin.innerHTML = `
        <div id="zone-messagefinal"></div>        

        <div id="zone-liens">
        <h3>Liens</h3>
            <div class="liens-grid">
                <a class="lien-carte" href="https://motchus.fr/51"><span>Motchus 51</span><br>Rejouez le Motchus d’il y a 51 jours</a>
                <a class="lien-carte"
                href="mailto:suggestions@motchus.fr?subject=Suggestion%20Motchus&body=Envoyez-nous%20vos%20suggestions%2C%20des%20id%C3%A9es%20de%20mots%20%C3%A0%20trouver%2C%20des%20variantes%2C%20des%20d%C3%A9finitions...">
                Ecrivez à Motchus&nbsp;!
                </a>

            </div>
        </div>
        <hr>
        <div id="zone-jour">
            <h3>Définition</h3>
            <b>MOTCHUS n° ${numeroMotchus} :</b> <br /> ${MarkdownVersHtml(infosMots.aujourdhui[1])}
        </div>
        <hr>
        <div id="zone-image-def"></div>
    `;

    afficherImageDuMot();
    afficherMessageFinal();

}




function afficherImageDuMot() {
    const cont = document.getElementById("zone-image-def");
    const nomFichier = motSolution
        .toUpperCase()
        .replaceAll(" ", "")
        .replaceAll("'", "")
        .replaceAll("’", "");

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
    const numeroMotchus = infosMots.index +1;
    let texte = `#MOTCHUS n°${numeroMotchus} - `; 
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
    texte += "https://motchus.fr\n";
    return texte;
}

function copierPartage(texte) {
    // Utilise l'API moderne pour copier dans le presse-papier
    navigator.clipboard.writeText(texte).then(() => {
        notifier("Score copié dans le presse-papier !");
    });
}