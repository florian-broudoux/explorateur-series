// =========================================================
// api.js : l'accès aux données (fiche 3 : le jeu de données local)
// Les autres modules ne savent pas d'où viennent les séries : quand l'application
// interrogera TVmaze (fiche 7), seul ce fichier changera.
// =========================================================
import { series, distributions } from "./donnees.js";

const DELAI = 800;

// Les séries dont le titre contient le texte cherché (toutes si le texte est vide)
export function rechercherSeries(terme, quandPret) {
    setTimeout(() => {
        const motCle = terme.trim().toLowerCase();
        const resultats = series.filter(({ name }) => name.toLowerCase().includes(motCle));
        quandPret(resultats);
    }, DELAI);
}

// Une série d'après son identifiant
export function chargerSerie(idSerie, quandPret) {
    setTimeout(() => {
        quandPret(series.find(({ id }) => id === idSerie));
    }, DELAI);
}

// La distribution d'une série (un tableau vide si elle n'est pas renseignée)
export function chargerDistribution(idSerie, quandPret) {
    setTimeout(() => {
        quandPret(distributions[idSerie] || []);
    }, DELAI);
}
