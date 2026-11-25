// =========================================================
// api.js : l'accès aux données (fiche 3 : le jeu de données local)
// Les autres modules ne savent pas d'où viennent les séries : quand l'application
// interrogera TVmaze (fiche 7), seul ce fichier changera.
// =========================================================
import { series, distributions } from "./donnees.js";

const DELAI = 800;

// Les séries dont le titre contient le texte cherché (toutes si le texte est vide)
export function rechercherSeries(terme) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const motCle = terme.trim().toLowerCase();
            if (motCle === "panne") {
                reject(new Error("Le serveur ne répond pas (panne simulée)."));
                return;
            }
            resolve(series.filter(({ name }) => name.toLowerCase().includes(motCle)));
        }, DELAI);
    });
}

// Une série d'après son identifiant
export function chargerSerie(idSerie) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const serie = series.find(({ id }) => id === idSerie);
            if (serie) {
                resolve(serie);
            } else {
                reject(new Error("Cette série est introuvable."));
            }
        }, DELAI);
    });
}

// La distribution d'une série (un tableau vide si elle n'est pas renseignée)
export function chargerDistribution(idSerie) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(distributions[idSerie] || []);
        }, DELAI);
    });
}
