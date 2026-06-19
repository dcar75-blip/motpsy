function messageCaracteresSpeciaux(mot) {
    const categorie = (infosMots && infosMots.aujourdhui && infosMots.aujourdhui[2])
        ? infosMots.aujourdhui[2].trim().toLowerCase()
        : "";
    const motDuJour = (infosMots && infosMots.aujourdhui && infosMots.aujourdhui[0])
        ? infosMots.aujourdhui[0].trim().toUpperCase()
        : "";
    const contientTiret = motDuJour.includes("-");

    let messages = [];

    // Message lié à la catégorie
    switch (categorie) {
        case "vip":
            messages.push('<b style="color:#e7002a;">Aujourd\'hui, une Very Important Personnalité de la psychanalyse... ou un cas clinique célèbre !</b>');
            break;
        case "vo":
            messages.push('<b style="color:#e7002a;">Achtung ! Aujourd\'hui un mot dans sa langue d\'origine (souvent l\'allemand).</b>');
            break;
        case "lacan":
            messages.push('<b style="color:#e7002a;">🛋️ Le Jour de Lacan ! Une notion du vocabulaire lacanien.</b>');
            break;
    }

    // Attribut transversal : tiret
    if (contientTiret) {
        messages.push('<b style="color:#e7002a;">⚠️ Attention, le mot comporte un ou des tirets.</b>');
    }

    return messages.join("<br>");
}
