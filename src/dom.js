// =========================================================
// dom.js : tout ce qui touche à l'affichage
// Une seule fonction exportée, rendu(state)
// =========================================================

const champRecherche = document.querySelector("#champ-recherche");
const zoneMessage = document.querySelector("#zone-message");
const zoneDetail = document.querySelector("#zone-detail");
const zoneResultats = document.querySelector("#zone-resultats");
const zoneFavoris = document.querySelector("#zone-favoris");

const STATUTS = {
    Running: "En cours",
    Ended: "Terminée",
    "To Be Determined": "Suite incertaine",
    "In Development": "En préparation",
};

// Identifiant de la série dont la fiche est affichée (null : aucune)
let idDetailAffiche = null;

// ===== Petites fonctions utiles =====

// "2005-01-03" → "2005"
function extraireAnnee(date) {
    if (!date) {
        return "Année inconnue";
    }
    const [annee] = date.split("-"); // "2005-01-03" → ["2005", "01", "03"]
    return annee;
}

// ["Drama", "Comedy"] → "Drama, Comedy"
function texteGenres(genres) {
    if (genres.length === 0) {
        return "Genre non précisé";
    }
    return genres.join(", ");
}

// Le résumé de TVmaze contient des balises HTML (<p>, <b>…) : on n'en garde que le texte.
// DOMParser lit le HTML sans l'afficher ni l'exécuter ; textContent en extrait le texte.
function texteSansBalises(html) {
    if (!html) {
        return "Pas de résumé disponible.";
    }
    const documentLu = new DOMParser().parseFromString(html, "text/html");
    return documentLu.body.textContent;
}

// Le texte du message selon l'état : des return successifs, plus lisibles que des ternaires imbriqués
function texteDuMessage({ chargement, erreur, terme, resultats }) {
    if (chargement) {
        return "Chargement";
    }
    if (erreur) {
        return erreur;
    }
    if (terme === "") {
        return "Saisissez le titre d'une série, puis lancez la recherche.";
    }
    if (resultats.length === 0) {
        return `Aucune série ne correspond à « ${terme} ».`;
    }
    return `Séries trouvées : ${resultats.length}.`;
}

// Ajoute une ligne « terme : valeur » à une liste de définitions <dl>
function ajouterInfo(liste, terme, valeur) {
    const ligne = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = terme;
    dd.textContent = valeur;
    ligne.append(dt, dd);
    liste.append(ligne);
}

// Crée un bouton favori (dans une carte ou dans la fiche détaillée)
function creerBoutonFavori(id, titre, enFavori) {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "bouton bouton-principal";
    bouton.dataset.action = "favori";
    bouton.dataset.id = id;
    if (enFavori) {
        bouton.textContent = "★ Retirer des favoris";
        bouton.setAttribute("aria-label", `Retirer des favoris : ${titre}`);
    } else {
        bouton.textContent = "☆ Ajouter aux favoris";
        bouton.setAttribute("aria-label", `Ajouter aux favoris : ${titre}`);
    }
    return bouton;
}

// Crée la carte d'une série : uniquement createElement et textContent, jamais innerHTML
function creerCarteSerie(serie, enFavori) {
    const { id, name: titre, genres, premiered, rating, image } = serie;
    const note = rating?.average ?? null;
    const urlAffiche = image?.medium;

    const carte = document.createElement("article");
    carte.className = "carte";

    if (urlAffiche) {
        const affiche = document.createElement("img");
        affiche.className = "carte-affiche";
        affiche.src = urlAffiche;
        affiche.alt = `Affiche de ${titre}`;
        carte.append(affiche);
    } else {
        const sansAffiche = document.createElement("div");
        sansAffiche.className = "carte-affiche sans-affiche";
        sansAffiche.textContent = "Pas d'affiche";
        carte.append(sansAffiche);
    }

    const corps = document.createElement("div");
    corps.className = "carte-corps";

    const titreCarte = document.createElement("h3");
    titreCarte.className = "carte-titre";
    titreCarte.textContent = titre;

    const infos = document.createElement("p");
    infos.className = "carte-infos";
    infos.textContent = `${extraireAnnee(premiered)} · ${texteGenres(genres)}`;

    const texteNote = document.createElement("p");
    texteNote.className = "carte-note";
    texteNote.textContent = note === null ? "Pas encore notée" : `★ ${note} / 10`;

    const actions = document.createElement("div");
    actions.className = "carte-actions";

    const boutonDetail = document.createElement("button");
    boutonDetail.type = "button";
    boutonDetail.className = "bouton bouton-secondaire";
    boutonDetail.dataset.action = "detail";
    boutonDetail.dataset.id = id;
    boutonDetail.textContent = "Voir la fiche";
    boutonDetail.setAttribute("aria-label", `Voir la fiche de ${titre}`);

    actions.append(boutonDetail, creerBoutonFavori(id, titre, enFavori));
    corps.append(titreCarte, infos, texteNote, actions);
    carte.append(corps);
    return carte;
}

// ===== Les zones de la page, chacune dessinée à partir de l'état =====

function afficherMessage(state) {
    const texte = texteDuMessage(state);
    zoneMessage.classList.toggle("chargement", state.chargement);
    zoneMessage.classList.toggle("erreur", !state.chargement && Boolean(state.erreur));
    // on ne touche au texte que s'il change : le lecteur d'écran ne le relit pas pour rien
    if (zoneMessage.textContent !== texte) {
        zoneMessage.textContent = texte;
    }
}

function afficherSeries({ resultats, favoris, chargement }) {
    zoneResultats.setAttribute("aria-busy", String(chargement));
    zoneResultats.replaceChildren();
    resultats.forEach((serie) => {
        const enFavori = favoris.some(({ id }) => id === serie.id);
        zoneResultats.append(creerCarteSerie(serie, enFavori));
    });
}

function afficherFavoris({ favoris }) {
    zoneFavoris.replaceChildren();

    if (favoris.length === 0) {
        const vide = document.createElement("li");
        vide.className = "vide";
        vide.textContent = "Aucun favori pour l'instant.";
        zoneFavoris.append(vide);
        return;
    }

    favoris.forEach(({ id, name: titre, premiered }) => {
        const ligne = document.createElement("li");
        const texte = document.createElement("span");
        texte.textContent = `${titre} (${extraireAnnee(premiered)})`;

        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "bouton bouton-secondaire";
        bouton.dataset.action = "retirer";
        bouton.dataset.id = id;
        bouton.textContent = "Retirer";
        bouton.setAttribute("aria-label", `Retirer ${titre} des favoris`);

        ligne.append(texte, bouton);
        zoneFavoris.append(ligne);
    });
}

function afficherDetail({ detail, favoris }) {
    zoneDetail.replaceChildren();

    if (detail === null) {
        zoneDetail.hidden = true;
        return;
    }

    const { serie, distribution } = detail;
    const {
        id,
        name: titre,
        genres,
        premiered,
        ended,
        status,
        network,
        webChannel,
        rating,
        image,
        summary,
    } = serie;

    if (image?.medium) {
        const affiche = document.createElement("img");
        affiche.className = "detail-affiche";
        affiche.src = image.medium;
        affiche.alt = `Affiche de ${titre}`;
        zoneDetail.append(affiche);
    }

    const texte = document.createElement("div");

    const titreDetail = document.createElement("h2");
    titreDetail.id = "detail-titre";
    titreDetail.tabIndex = -1; // pour pouvoir y placer le focus
    titreDetail.textContent = titre;

    let periode = `depuis ${extraireAnnee(premiered)}`;
    if (ended) {
        periode = `${extraireAnnee(premiered)} – ${extraireAnnee(ended)}`;
    }
    const note = rating?.average ?? null;

    const infos = document.createElement("dl");
    infos.className = "detail-infos";
    ajouterInfo(infos, "Années", periode);
    ajouterInfo(infos, "Statut", STATUTS[status] ?? status);
    ajouterInfo(infos, "Diffusion", network?.name ?? webChannel?.name ?? "Diffuseur inconnu");
    ajouterInfo(infos, "Genres", texteGenres(genres));
    ajouterInfo(infos, "Note", note === null ? "Pas encore notée" : `${note} / 10`);

    const resume = document.createElement("p");
    resume.className = "detail-resume";
    resume.textContent = texteSansBalises(summary); // le texte seul, jamais le HTML reçu
    if (summary) {
        resume.lang = "en"; // les résumés de TVmaze sont en anglais
    }

    const titreDistribution = document.createElement("h3");
    titreDistribution.textContent = "Distribution";

    const listeRoles = document.createElement("ul");
    listeRoles.className = "detail-distribution";
    if (distribution.length === 0) {
        const vide = document.createElement("li");
        vide.textContent = "Distribution non renseignée.";
        listeRoles.append(vide);
    }
    // les 6 premiers rôles suffisent (certaines séries en ont des dizaines)
    const premiersRoles = distribution.slice(0, 6);
    premiersRoles.forEach(({ person, character }) => {
        const ligne = document.createElement("li");
        ligne.textContent = `${person?.name ?? "?"} (${character?.name ?? "rôle inconnu"})`;
        listeRoles.append(ligne);
    });

    const actions = document.createElement("div");
    actions.className = "detail-actions";
    const enFavori = favoris.some((favori) => favori.id === id);
    const boutonFermer = document.createElement("button");
    boutonFermer.type = "button";
    boutonFermer.className = "bouton bouton-secondaire";
    boutonFermer.dataset.action = "fermer";
    boutonFermer.textContent = "Fermer la fiche";
    actions.append(creerBoutonFavori(id, titre, enFavori), boutonFermer);

    texte.append(titreDetail, infos, resume, titreDistribution, listeRoles, actions);
    zoneDetail.append(texte);
    zoneDetail.hidden = false;
}

// ===== Le focus : tout reconstruire fait disparaître le bouton qui l'avait =====

// Note quel bouton a le focus (sa zone, son action, sa série)
function memoriserFocus() {
    const actif = document.activeElement;
    const zone = actif?.closest("#zone-resultats, #zone-detail, #zone-favoris");
    if (!zone || !actif.dataset.action) {
        return null;
    }
    return { zone, action: actif.dataset.action, id: actif.dataset.id };
}

// Après le rendu : la fiche qui vient de s'ouvrir, la recherche si elle s'est fermée,
// sinon le bouton équivalent dans la nouvelle interface. React fera ce travail pour vous.
function retablirFocus(focusAvant, detail) {
    const idDetail = detail?.serie.id ?? null;
    if (idDetail !== idDetailAffiche) {
        idDetailAffiche = idDetail;
        if (idDetail === null) {
            champRecherche.focus();
        } else {
            document.querySelector("#detail-titre").focus();
        }
        return;
    }
    if (focusAvant) {
        const { zone, action, id } = focusAvant;
        zone.querySelector(`[data-action="${action}"][data-id="${id}"]`)?.focus();
    }
}

// ===== La seule fonction exportée : l'interface entière, à partir de l'état =====
export function rendu(state) {
    const focusAvant = memoriserFocus();
    afficherMessage(state);
    afficherDetail(state);
    afficherSeries(state);
    afficherFavoris(state);
    retablirFocus(focusAvant, state.detail);
}
