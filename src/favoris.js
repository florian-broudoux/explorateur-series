// =========================================================
// favoris.js : fonctions pures sur la liste des favoris
// Elles ne modifient jamais le tableau reçu : elles en renvoient un nouveau.
// =========================================================

export function estFavori(liste, idSerie) {
    return liste.some(({ id }) => id === idSerie);
}

export function ajouterAuxFavoris(liste, serie) {
    if (estFavori(liste, serie.id)) {
        return liste; // déjà présente : rien ne change
    }
    const { summary, ...serieLegere } = serie; // rest : tout sauf le long résumé
    return [...liste, serieLegere]; // spread : un nouveau tableau, l'ancien est intact
}

export function retirerDesFavoris(liste, idSerie) {
    return liste.filter(({ id }) => id !== idSerie);
}
