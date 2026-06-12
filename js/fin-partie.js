function terminer(victoire) {
    if (typeof window.varianteOnFinMot === "function") {
        const prisEnCharge = window.varianteOnFinMot(victoire);
        if (prisEnCharge) return;
    }
    partieTerminee = true;
    const zoneMsg = document.getElementById('zone-message');
    const zoneFin = document.getElementById('zone-fin');
    const numeroMotpsy = infosMots.index + 1;
    
    let titre = victoire ? `${CONFIG.texteGagne}` : `${CONFIG.textePerdu}`;
    let sousTitre1 = victoire
        ? `Trouvé en ${ligneActuelle + 1} coup${(ligneActuelle + 1) > 1 ? "s" : ""}`
        : `Le mot était ${motSolution}`;
    
    const texteAExporter = genererGrillePartage(victoire);
    const partageActif =
        (typeof window.variantePartagerActif === "function")
            ? window.variantePartagerActif()
            : true;
    const blocPartage = partageActif
    ? `<p class="cliquable-partage" onclick='copierPartage(${JSON.stringify(texteAExporter)})'>
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
            <h3>Définition</h3>
            <b>MotPsy n° ${numeroMotpsy} :</b> <br /> ${MarkdownVersHtml(infosMots.aujourdhui[1])}
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
function copierPartage(texte) {
    navigator.clipboard.writeText(texte).then(() => {
        notifier("Score copié dans le presse-papier !");
    });
}
