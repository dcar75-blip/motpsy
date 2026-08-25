#!/usr/bin/env python3
"""Régénère motsatrouver.js depuis MotPsy_V57_APA_dates_corrigees.xlsx (onglet Motpsy, lignes 3-138)."""
import openpyxl
import sys

XLSX = "MotPsy_V57_APA_dates_corrigees.xlsx"
SHEET = "Motpsy"
HEADER_ROW = 2
FIRST_ROW = 3
LAST_ROW = 138

# Recherche des colonnes par en-tête (ligne HEADER_ROW) plutôt que par index
# fixe, pour résister à une future insertion/suppression de colonne.
# "prefix" = l'en-tête commence par ce texte ; "exact" = l'en-tête est
# exactement ce texte (utilisé pour distinguer "Exemple" de "Exemple
# (proposition Claude...)", et "Rebonds" de "Rebonds (proposition Claude...)").
COL_SPECS = {
    "mot": {"prefix": "MotPsy à deviner"},
    "citation": {"prefix": "Dans les livres"},
    "cat": {"prefix": "Catégorie"},
    "exemple": {"exact": "Exemple"},
    "rebonds": {"exact": "Rebonds"},
    "photo": {"prefix": "Image du rebond"},
    "cacher": {"prefix": "Cacher 1ère lettre"},
    "date": {"prefix": "Date"},
    "indice": {"prefix": "Indice"},
}


def trouver_colonne(ws, spec):
    for col in range(1, ws.max_column + 1):
        val = ws.cell(row=HEADER_ROW, column=col).value
        if val is None:
            continue
        s = str(val).strip()
        if "exact" in spec:
            if s == spec["exact"]:
                return col
        elif "prefix" in spec:
            if s.startswith(spec["prefix"]):
                return col
    return None


def resoudre_colonnes(ws):
    cols = {}
    manquants = []
    for champ, spec in COL_SPECS.items():
        col = trouver_colonne(ws, spec)
        if col is None:
            manquants.append(champ)
        else:
            cols[champ] = col

    print("Colonnes résolues (champ -> lettre) :")
    for champ, col in cols.items():
        lettre = openpyxl.utils.get_column_letter(col)
        print(f"  {champ:10s} -> {lettre}")

    if manquants:
        print(f"ERREUR : colonne(s) introuvable(s) pour : {', '.join(manquants)}")
        sys.exit(1)

    return cols

HEADER = """// Liste des mots Motpsy
// Format : [mot, définition, catégorie, photo, cacher1ereLettre, date, indice, exemple, rebonds]
// Catégories : Classique, VO, VIP, Lacan  (le tiret est détecté automatiquement)
// La date (YYYY-MM-DD) détermine le jour de diffusion. Fallback aléatoire si aucune date ne correspond.
// L'indice (si présent) fait apparaître le bouton 💡 ; vide = pas de bouton.

"""


def echapper(valeur):
    """Échappe une valeur de cellule pour un littéral JS entre apostrophes."""
    if valeur is None:
        return ""
    s = str(valeur)
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    s = s.replace("\\", "\\\\")
    s = s.replace("'", "\\'")
    s = s.replace("\n", "\\n")
    return s


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb[SHEET]

    COLS = resoudre_colonnes(ws)

    lignes_js = []
    total = 0
    for r in range(FIRST_ROW, LAST_ROW + 1):
        mot = ws.cell(row=r, column=COLS["mot"]).value
        if mot is None or str(mot).strip() == "":
            continue
        total += 1

        definition = echapper(ws.cell(row=r, column=COLS["citation"]).value)
        categorie = echapper(ws.cell(row=r, column=COLS["cat"]).value)
        photo = echapper(ws.cell(row=r, column=COLS["photo"]).value)

        cacher_val = ws.cell(row=r, column=COLS["cacher"]).value
        cacher = isinstance(cacher_val, str) and cacher_val.strip().lower() == "oui"

        date_val = ws.cell(row=r, column=COLS["date"]).value
        date_str = date_val.strftime("%Y-%m-%d")

        indice = echapper(ws.cell(row=r, column=COLS["indice"]).value)
        exemple = echapper(ws.cell(row=r, column=COLS["exemple"]).value)
        rebonds = echapper(ws.cell(row=r, column=COLS["rebonds"]).value)
        mot_echappe = echapper(mot)

        champs = [
            mot_echappe, definition, categorie, photo,
            "true" if cacher else "false", date_str, indice, exemple, rebonds,
        ]
        parties = []
        for i, champ in enumerate(champs):
            if i == 4:
                parties.append(champ)  # true/false, pas de quotes
            else:
                parties.append(f"'{champ}'")
        lignes_js.append("  [" + ", ".join(parties) + "],")

    contenu = HEADER + "const LISTE_MOTS_A_TROUVER = [\n" + "\n".join(lignes_js) + "\n];\n"

    with open("motsatrouver.js.new", "w", encoding="utf-8") as f:
        f.write(contenu)

    print(f"{total} entrées écrites dans motsatrouver.js.new")


if __name__ == "__main__":
    main()
