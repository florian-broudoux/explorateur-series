// =========================================================
// api.js : l'accès aux données (fiche 3 : le jeu de données local)
// Les autres modules ne savent pas d'où viennent les séries : quand l'application
// interrogera TVmaze (fiche 7), seul ce fichier changera.
// =========================================================
import { series, distributions } from "./donnees.js";

const URL_API = "https://api.tvmaze.com";
const MODE_DEMO = false;
const DELAI_DEMO = 800;

function attendre(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function messageErreurHTTP(statut) {
    if (statut === 404) {
        return "Série introuvable";
    }
    if (statut === 429) {
        return "Trop de requêtes : TVmaze en accepte au plus 20 toutes les 10 secondes";
    }
    if (statut >= 500) {
        return "TVMaze a un problème";
    }
    return `Erreur ${statut}`;
}

async function lireJSON(chemin) {
    let reponse;
    try {
        reponse = await fetch(URL_API + chemin);
    } catch (erreur) {
        if (erreur instanceof TypeError) {
            throw new Error("Impossible de joindre TVmaze : vérifiez votre connexion Internet.");
        }
        throw erreur;
    }
    if (!reponse.ok) {
        throw new Error(messageErreurHTTP(reponse.status));
    }
    return reponse.json();
}

// Les séries dont le titre contient le texte cherché (toutes si le texte est vide)
export async function rechercherSeries(terme) {
    const motCle = terme.trim().toLowerCase();
    if (MODE_DEMO) {
        await attendre(DELAI_DEMO);
        if (motCle === "panne") {
            throw new Error("Le serveur ne répond pas (panne simulée).");
        }
        return series.filter(({ name }) => name.toLowerCase().includes(motCle));
    }

    const resultats = await lireJSON(`/search/shows?q=${encodeURIComponent(motCle)}`);
    return resultats.map(({ show }) => show);
}

// Une série d'après son identifiant
export async function chargerSerie(idSerie) {
    if (MODE_DEMO) {
        await attendre(DELAI_DEMO);
        const serie = series.find(({ id }) => id === idSerie);
        if (serie) {
            return serie;
        } else {
            throw new Error("Cette série est introuvable.");
        }
    }
    return lireJSON(`/shows/${idSerie}`);
}

// La distribution d'une série (un tableau vide si elle n'est pas renseignée)
export async function chargerDistribution(idSerie) {
    if (MODE_DEMO) {
        await attendre(DELAI_DEMO);
        return distributions[idSerie] || [];
    }
    return lireJSON(`/shows/${idSerie}/cast`);
}
