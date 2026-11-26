// =========================================================
// dom.js : tout ce qui touche à l'affichage
// Seules les fonctions précédées de export sont utilisables ailleurs ;
// les autres restent internes au module.
// =========================================================

const champRecherche = document.querySelector("#champ-recherche");
const zoneMessage = document.querySelector("#zone-message");
const zoneDetail = document.querySelector("#zone-detail");
const zoneResultats = document.querySelector("#zone-resultats");
const zoneFavoris = document.querySelector("#zone-favoris");

// Statuts de TVmaze traduits en français
const STATUTS = {
    Running: "En cours",
    Ended: "Terminée",
    "To Be Determined": "Suite incertaine",
    "In Development": "En préparation",
};

// ===== Petites fonctions utiles (internes) =====

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

// Texte et nom accessible du bouton favori, selon que la série est en favori ou non
function actualiserBoutonFavori(bouton, titre, enFavori) {
    if (enFavori) {
        bouton.textContent = "★ Retirer des favoris";
        bouton.setAttribute("aria-label", `Retirer des favoris : ${titre}`);
    } else {
        bouton.textContent = "☆ Ajouter aux favoris";
        bouton.setAttribute("aria-label", `Ajouter aux favoris : ${titre}`);
    }
}

// Crée la carte d'une série : uniquement createElement et textContent, jamais innerHTML
function creerCarteSerie(serie, enFavori) {
    const {
        id,
        name: titre,
        genres,
        premiered,
        rating: { average: note },
        image,
    } = serie;
    const annee = extraireAnnee(premiered);

    const carte = document.createElement("article");
    carte.className = "carte";

    if (image) {
        const affiche = document.createElement("img");
        affiche.className = "carte-affiche";
        affiche.src = image.medium;
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
    infos.textContent = `${annee} · ${texteGenres(genres)}`;

    const texteNote = document.createElement("p");
    texteNote.className = "carte-note";
    texteNote.textContent = note !== null ? `★ ${note} / 10` : "Pas encore notée";

    const actions = document.createElement("div");
    actions.className = "carte-actions";

    const boutonDetail = document.createElement("button");
    boutonDetail.type = "button";
    boutonDetail.className = "bouton bouton-secondaire";
    boutonDetail.dataset.action = "detail";
    boutonDetail.dataset.id = id;
    boutonDetail.textContent = "Voir la fiche";
    boutonDetail.setAttribute("aria-label", `Voir la fiche de ${titre}`);

    const boutonFavori = document.createElement("button");
    boutonFavori.type = "button";
    boutonFavori.className = "bouton bouton-principal";
    boutonFavori.dataset.action = "favori";
    boutonFavori.dataset.id = id;
    actualiserBoutonFavori(boutonFavori, titre, enFavori);

    actions.append(boutonDetail, boutonFavori);
    corps.append(titreCarte, infos, texteNote, actions);
    carte.append(corps);
    return carte;
}

// ===== Fonctions exportées =====

export function afficherErreur(texte) {
    zoneMessage.textContent = texte;
    zoneMessage.classList.add("erreur");
    zoneMessage.classList.remove("chargement");
}

export function marqueOccupe(occupe) {
    zoneResultats.setAttribute("aria-busy", String(occupe));
}

export function afficherChargement(texte) {
    zoneMessage.classList.add("chargement");
    zoneMessage.classList.remove("erreur");
    zoneMessage.textContent = texte;
}

// Affiche un message dans la zone prévue (role="status" : lu par les lecteurs d'écran)
export function afficherMessage(texte) {
    zoneMessage.classList.remove("chargement");
    zoneMessage.classList.remove("erreur");
    zoneMessage.textContent = texte;
}

// Affiche une liste de séries dans la grille ; favoris sert à choisir le texte des boutons
export function afficherSeries(liste, favoris) {
    zoneResultats.replaceChildren(); // vide la grille

    liste.forEach((serie) => {
        const enFavori = favoris.some(({ id }) => id === serie.id);
        zoneResultats.append(creerCarteSerie(serie, enFavori));
    });

    if (liste.length === 0) {
        afficherMessage("Aucune série ne correspond à votre recherche.");
    } else {
        afficherMessage(`Séries affichées : ${liste.length}.`);
    }
}

// Met à jour le bouton favori d'une carte, s'il est affiché
export function mettreAJourBoutonFavori(idSerie, enFavori) {
    const bouton = zoneResultats.querySelector(`[data-action="favori"][data-id="${idSerie}"]`);
    if (bouton) {
        const titre = bouton.closest(".carte").querySelector(".carte-titre").textContent;
        actualiserBoutonFavori(bouton, titre, enFavori);
    }
}

// Affiche la liste des favoris
export function afficherFavoris(liste) {
    zoneFavoris.replaceChildren();

    if (liste.length === 0) {
        const vide = document.createElement("li");
        vide.className = "vide";
        vide.textContent = "Aucun favori pour l'instant.";
        zoneFavoris.append(vide);
        return;
    }

    liste.forEach(({ id, name: titre, premiered }) => {
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

// Remplit et affiche la fiche détaillée d'une série
export function afficherDetail(serie, distribution) {
    const {
        name: titre,
        genres,
        premiered,
        ended,
        status,
        network,
        webChannel,
        rating: { average: note },
        image,
        summary,
    } = serie;

    zoneDetail.replaceChildren();

    if (image) {
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

    let diffuseur = "Diffuseur inconnu";
    if (network) {
        diffuseur = network.name;
    } else if (webChannel) {
        diffuseur = webChannel.name;
    }

    let periode = `depuis ${extraireAnnee(premiered)}`;
    if (ended) {
        periode = `${extraireAnnee(premiered)} – ${extraireAnnee(ended)}`;
    }

    const infos = document.createElement("dl");
    infos.className = "detail-infos";
    ajouterInfo(infos, "Années", periode);
    ajouterInfo(infos, "Statut", STATUTS[status] || status);
    ajouterInfo(infos, "Diffusion", diffuseur);
    ajouterInfo(infos, "Genres", texteGenres(genres));
    ajouterInfo(infos, "Note", note !== null ? `${note} / 10` : "Pas encore notée");

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
    const premierRoles = distribution.slice(0, 6);
    premierRoles.forEach(({ person: { name: acteur }, character: { name: personnage } }) => {
        const ligne = document.createElement("li");
        ligne.textContent = `${acteur} (${personnage})`;
        listeRoles.append(ligne);
    });

    const actions = document.createElement("div");
    actions.className = "detail-actions";
    const boutonFermer = document.createElement("button");
    boutonFermer.type = "button";
    boutonFermer.className = "bouton bouton-secondaire";
    boutonFermer.dataset.action = "fermer";
    boutonFermer.textContent = "Fermer la fiche";
    actions.append(boutonFermer);

    texte.append(titreDetail, infos, resume, titreDistribution, listeRoles, actions);
    zoneDetail.append(texte);
    zoneDetail.hidden = false;
    titreDetail.focus(); // on amène le lecteur (et le lecteur d'écran) sur la fiche
}

// Cache la fiche et ramène le focus sur la recherche
export function fermerDetail() {
    zoneDetail.hidden = true;
    zoneDetail.replaceChildren();
    champRecherche.focus();
}
