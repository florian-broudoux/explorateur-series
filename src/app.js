// =========================================================
// app.js : point d'entrée de l'application
// =========================================================
import { rechercherSeries, chargerSerie, chargerDistribution } from "./api.js";
import {
    chargerFavoris,
    sauvegarderFavoris,
    estFavori,
    ajouterAuxFavoris,
    retirerDesFavoris,
} from "./favoris.js";
import { rendu } from "./dom.js";
import { initialiserEvenements } from "./events.js";

// ===== L'état de l'application =====
let state = {
    terme: "",
    resultats: [],
    tri: "pertinence",
    chargement: false,
    erreur: null,
    detail: null,
    favoris: chargerFavoris(),
};

// Affiche dans la console une action et autant de détails qu'on veut (paramètre rest)
function journaliser(action, ...details) {
    console.log(`[Explorateur] ${action}`, ...details);
}

// Tri sur une copie, car .sort() modifie le tableau qu'il trie
function trierSeries(liste, critere) {
    const copie = [...liste];
    if (critere === "titre") {
        copie.sort((a, b) => a.name.localeCompare(b.name));
    } else if (critere === "note") {
        copie.sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0));
    }
    return copie;
}

// La seule façon de modifier l'état : un nouvel objet (spread), puis un nouveau rendu
function mettreAJourState(changements) {
    state = { ...state, ...changements };
    // les résultats sont affichés triés : une valeur calculée à partir de l'état
    rendu({ ...state, resultats: trierSeries(state.resultats, state.tri) });
}

// ===== Actions déclenchées par les événements =====

async function lancerRecherche(texte) {
    const terme = texte.trim();
    if (terme === "") {
        mettreAJourState({ terme: "", resultats: [], erreur: null });
        return;
    }
    mettreAJourState({ terme, chargement: true, erreur: null });
    try {
        const resultats = await rechercherSeries(terme);
        journaliser("Recherche", terme, resultats.length);
        mettreAJourState({ resultats, chargement: false });
    } catch (erreur) {
        mettreAJourState({ resultats: [], chargement: false, erreur: erreur.message });
    }
}

function changerTri(tri) {
    mettreAJourState({ tri });
}

// Les deux chargements sont indépendants : on les lance en même temps avec Promise.all
async function ouvrirDetail(idSerie) {
    mettreAJourState({ chargement: true, erreur: null });
    try {
        const [serie, distribution] = await Promise.all([
            chargerSerie(idSerie),
            chargerDistribution(idSerie),
        ]);
        mettreAJourState({ chargement: false, detail: { serie, distribution } });
    } catch (erreur) {
        mettreAJourState({ chargement: false, erreur: erreur.message });
    }
}

function fermerDetail() {
    mettreAJourState({ detail: null });
}

function basculerFavori(idSerie) {
    const { favoris, resultats, detail } = state;
    let nouveauxFavoris;
    if (estFavori(favoris, idSerie)) {
        nouveauxFavoris = retirerDesFavoris(favoris, idSerie);
        journaliser("Favori retiré", idSerie);
    } else {
        const serie = resultats.find(({ id }) => id === idSerie) ?? detail?.serie;
        nouveauxFavoris = ajouterAuxFavoris(favoris, serie);
        journaliser("Favori ajouté", serie.name, idSerie);
    }
    sauvegarderFavoris(nouveauxFavoris);
    mettreAJourState({ favoris: nouveauxFavoris });
}

// ===== Démarrage =====
initialiserEvenements({
    surRecherche: lancerRecherche,
    surTri: changerTri,
    surDetail: ouvrirDetail,
    surFavori: basculerFavori,
    surFermer: fermerDetail,
});

rendu(state);
