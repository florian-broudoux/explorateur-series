// =========================================================
// events.js : les écouteurs d'événements
// Ce module n'importe pas app.js (pas d'import circulaire) : il reçoit
// les fonctions à appeler dans un objet, déstructuré dans les paramètres.
// =========================================================

const formRecherche = document.querySelector("#form-recherche");
const champRecherche = document.querySelector("#champ-recherche");
const choixTri = document.querySelector("#choix-tri");
const zoneResultats = document.querySelector("#zone-resultats");
const zoneDetail = document.querySelector("#zone-detail");
const zoneFavoris = document.querySelector("#zone-favoris");
const titreFavoris = document.querySelector("#favoris-titre");

export function initialiserEvenements({ surRecherche, surTri, surDetail, surFavori, surFermer }) {
    // Recherche
    formRecherche.addEventListener("submit", (event) => {
        event.preventDefault();
        surRecherche(champRecherche.value);
    });

    // Tri
    choixTri.addEventListener("change", () => {
        surTri(choixTri.value);
    });

    // Délégation : un seul écouteur pour tous les boutons des cartes
    zoneResultats.addEventListener("click", (event) => {
        const bouton = event.target.closest("button[data-action]");
        if (!bouton) {
            return;
        }
        const idSerie = Number(bouton.dataset.id);
        if (bouton.dataset.action === "detail") {
            surDetail(idSerie);
        } else if (bouton.dataset.action === "favori") {
            surFavori(idSerie);
        }
    });

    zoneDetail.addEventListener("click", (event) => {
        const bouton = event.target.closest("button[data-action]");
        if (!bouton) {
            return;
        }
        if (bouton.dataset.action === "fermer") {
            surFermer();
        } else if (bouton.dataset.action === "favori") {
            surFavori(Number(bouton.dataset.id));
        }
    });

    // Boutons « Retirer » de la liste des favoris
    zoneFavoris.addEventListener("click", (event) => {
        const bouton = event.target.closest("button[data-action='retirer']");
        if (bouton) {
            surFavori(Number(bouton.dataset.id));
            titreFavoris.focus(); // le bouton a disparu : on garde le focus dans les favoris
        }
    });
}
