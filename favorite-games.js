
/* =====================================
   FAVOURITE GAMES SYSTEM
===================================== */

(() => {
    "use strict";

    const STORAGE_KEY = "cm8FavouriteGames";

    /* =====================================
       GET SAVED FAVOURITES
    ===================================== */

    function getFavourites() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Error loading favourites:", error);
            return [];
        }
    }

    /* =====================================
       SAVE FAVOURITES
    ===================================== */

    function saveFavourites(favourites) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(favourites)
            );

            return true;
        } catch (error) {
            console.error("Error saving favourites:", error);
            return false;
        }
    }

    /* =====================================
       GET GAME DATA
       HOT / NEW DEPENDS ON SOURCE SECTION
    ===================================== */

    function getGameData(card) {
        const img = card.querySelector("img");

        if (!img) return null;

        const imageUrl = img.getAttribute("src");
        const gameId = card.dataset.gameId || imageUrl;

        if (!gameId || !imageUrl) return null;

        const savedGame = getFavourites().find(
            game => game.id === gameId
        );

        let badges = [];

        // Favourite card: retain its saved badge
        if (card.closest(".fav-games")) {
            badges = savedGame?.badges || [];
        }

        // New Games: read NEW badge only
        else if (card.closest(".new-games")) {
            const badge = card.querySelector(".new-badge");

            if (badge) {
                badges.push({
                    className: "new-badge",
                    text: badge.textContent.trim()
                });
            }
        }

        // Hot Games: read HOT badge only
        else if (card.closest(".hot-games")) {
            const badge = card.querySelector(".hot-badge");

            if (badge) {
                badges.push({
                    className: "hot-badge",
                    text: badge.textContent.trim()
                });
            }
        }

        return {
            id: gameId,
            name: img.alt || "Game",
            image: imageUrl,
            url: card.getAttribute("href") || "#",
            badges: badges
        };
    }

    /* =====================================
       CREATE HEART BUTTONS
    ===================================== */

    function initFavouriteButtons() {
        document.querySelectorAll(".game-card").forEach(card => {
            if (card.querySelector(".game-fav-btn")) return;

            const button = document.createElement("button");

            button.type = "button";
            button.className = "game-fav-btn";

            button.setAttribute(
                "aria-label",
                "Add to favourites"
            );

            button.setAttribute("aria-pressed", "false");

            button.innerHTML =
                '<i class="fa-regular fa-heart"></i>';

            card.appendChild(button);
        });

        updateFavouriteStates();
    }

    /* =====================================
       UPDATE HEART STATE
    ===================================== */

    function updateFavouriteStates() {
        const favourites = getFavourites();

        const favouriteIds = new Set(
            favourites.map(game => game.id)
        );

        document.querySelectorAll(".game-card").forEach(card => {
            const button = card.querySelector(".game-fav-btn");
            const game = getGameData(card);

            if (!button || !game) return;

            const selected = favouriteIds.has(game.id);

            card.classList.toggle(
                "is-favourite",
                selected
            );

            button.setAttribute(
                "aria-pressed",
                String(selected)
            );

            button.setAttribute(
                "aria-label",
                selected
                    ? "Remove from favourites"
                    : "Add to favourites"
            );

            button.innerHTML = selected
                ? '<i class="fa-solid fa-heart"></i>'
                : '<i class="fa-regular fa-heart"></i>';
        });
    }

    /* =====================================
       RENDER FAVOURITE GAMES
       HOMEPAGE + FAVOURITE PAGE
    ===================================== */

    function renderFavouriteSections() {
        const favourites = getFavourites();

        document.querySelectorAll(
            ".fav-games .games-grid"
        ).forEach(grid => {
            grid.replaceChildren();

            // Empty state
            if (favourites.length === 0) {
                const empty = document.createElement("p");

                empty.className = "fav-empty-message";

                empty.textContent =
                    "No favourite games yet. Hover over a game and click the heart icon.";

                grid.appendChild(empty);
                return;
            }

            // Render saved games
            favourites.forEach(game => {
                const card = document.createElement("a");

                card.className = "game-card";
                card.href = game.url || "#";
                card.dataset.gameId = game.id;

                // Restore original HOT / NEW badge
                (game.badges || []).forEach(badgeData => {
                    if (
                        badgeData.className !== "hot-badge" &&
                        badgeData.className !== "new-badge"
                    ) {
                        return;
                    }

                    const badge = document.createElement("div");

                    badge.className = badgeData.className;
                    badge.textContent = badgeData.text;

                    card.appendChild(badge);
                });

                // Game image
                const img = document.createElement("img");

                img.src = game.image;
                img.alt = game.name;
                img.loading = "lazy";

                card.appendChild(img);
                grid.appendChild(card);
            });
        });

        initFavouriteButtons();
    }

    /* =====================================
       HANDLE HEART CLICK
    ===================================== */

    document.addEventListener("click", event => {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const button = target.closest(".game-fav-btn");

        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const card = button.closest(".game-card");

        if (!card) return;

        const game = getGameData(card);

        if (!game) return;

        let favourites = getFavourites();

        const exists = favourites.some(
            item => item.id === game.id
        );

        if (exists) {
            // Remove favourite
            favourites = favourites.filter(
                item => item.id !== game.id
            );
        } else {
            // Add favourite with source badge
            favourites.push(game);
        }

        if (!saveFavourites(favourites)) return;

        // Refresh homepage and favourite page
        renderFavouriteSections();

        // Refresh all heart icons
        updateFavouriteStates();
    });

    /* =====================================
       INITIALISE
    ===================================== */

    function init() {
        initFavouriteButtons();
        renderFavouriteSections();
        updateFavouriteStates();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
