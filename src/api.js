// =========================================================
// api.js : l'accès aux données (fiche 3 : le jeu de données local)
// Les autres modules ne savent pas d'où viennent les séries : quand l'application
// interrogera TVmaze (fiche 7), seul ce fichier changera.
// =========================================================
import { series, distributions } from "./donnees.js";

const DELAI = 800;

function attendre(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Les séries dont le titre contient le texte cherché (toutes si le texte est vide)
export async function rechercherSeries(terme) {
    await attendre(DELAI);
    const motCle = terme.trim().toLowerCase();
    if (motCle === "panne") {
        throw new Error("Le serveur ne répond pas (panne simulée).");
    }
    return series.filter(({ name }) => name.toLowerCase().includes(motCle));
}

// Une série d'après son identifiant
export async function chargerSerie(idSerie) {
    await attendre(DELAI);
    const serie = series.find(({ id }) => id === idSerie);
    if (serie) {
        return serie;
    } else {
        throw new Error("Cette série est introuvable.");
    }
}

// La distribution d'une série (un tableau vide si elle n'est pas renseignée)
export async function chargerDistribution(idSerie) {
    await attendre(DELAI);
    return distributions[idSerie] || [];
}
