// =========================================================
// app.js : point d'entrée de l'application (fiche 3 : les modules)
// Il importe les autres modules, garde les données de l'application
// et relie les événements aux actions.
// =========================================================
import { rechercherSeries, chargerSerie, chargerDistribution } from "./api.js";
import { estFavori, ajouterAuxFavoris, retirerDesFavoris } from "./favoris.js";
import {
    afficherSeries,
    afficherFavoris,
    afficherDetail,
    fermerDetail,
    mettreAJourBoutonFavori,
} from "./dom.js";
import { initialiserEvenements } from "./events.js";

// ===== Données de l'application =====
let resultatsCourants = []; // les séries de la dernière recherche
let favoris = []; // les séries mises en favori (jamais modifié : remplacé)
let critereTri = "pertinence";

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
        // une série sans note (null) compte pour 0
        copie.sort((a, b) => (b.rating.average || 0) - (a.rating.average || 0));
    }
    return copie;
}

function afficherResultats() {
    afficherSeries(trierSeries(resultatsCourants, critereTri), favoris);
}

// ===== Actions déclenchées par les événements =====

function lancerRecherche(terme) {
    resultatsCourants = rechercherSeries(terme);
    journaliser("Recherche", terme, resultatsCourants.length);
    afficherResultats();
}

function changerTri(critere) {
    critereTri = critere;
    afficherResultats();
}

function ouvrirDetail(idSerie) {
    afficherDetail(chargerSerie(idSerie), chargerDistribution(idSerie));
}

function basculerFavori(idSerie) {
    if (estFavori(favoris, idSerie)) {
        favoris = retirerDesFavoris(favoris, idSerie);
        journaliser("Favori retiré", idSerie);
    } else {
        const serie = resultatsCourants.find(({ id }) => id === idSerie);
        favoris = ajouterAuxFavoris(favoris, serie);
        journaliser("Favori ajouté", serie.name, idSerie);
    }
    afficherFavoris(favoris);
    mettreAJourBoutonFavori(idSerie, estFavori(favoris, idSerie));
}

// ===== Démarrage =====
initialiserEvenements({
    surRecherche: lancerRecherche,
    surTri: changerTri,
    surDetail: ouvrirDetail,
    surFavori: basculerFavori,
    surFermer: fermerDetail,
});
lancerRecherche(""); // un texte vide : toutes les séries du jeu de données
afficherFavoris(favoris);
