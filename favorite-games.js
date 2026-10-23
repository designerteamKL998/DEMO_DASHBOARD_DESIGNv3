
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
       LOTTERY / POKER / SPORTS PAGE SUPPORT: category .slot-card
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
       FAVOURITE VENDORS
       Uses the existing .lc-games .slot-card vendor cards.
       Kept separate from Favourite Games data and button class.
    ===================================== */

    const VENDOR_STORAGE_KEY = "cm8FavouriteVendors";

    function getFavouriteVendors() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(VENDOR_STORAGE_KEY) || "[]"
            );
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Error loading favourite vendors:", error);
            return [];
        }
    }

    function saveFavouriteVendors(vendors) {
        try {
            localStorage.setItem(
                VENDOR_STORAGE_KEY,
                JSON.stringify(vendors)
            );
            return true;
        } catch (error) {
            console.error("Error saving favourite vendors:", error);
            return false;
        }
    }


    /* =====================================
       REPAIR OLD MIXED FAVOURITES
       Older versions may have saved casino vendor cards as games.
       Move casino artwork paths to the separate vendor storage.
    ===================================== */

    function migrateLegacyVendorFavourites() {
        const games = getFavourites();
        const vendors = getFavouriteVendors();
        const vendorIds = new Set(vendors.map(vendor => vendor.id));

        const isLegacyVendor = item => {
            const image = String(item.image || "").toLowerCase();
            const name = String(item.name || "").toLowerCase();

            return (
                image.includes("/casino/") ||
                image.includes("/games/lotto/") ||
                image.includes("/games/poker/") ||
                image.includes("/games/sports/") ||
                /(^|\/)casino-[^/]+\.(png|jpe?g|webp|gif)(\?.*)?$/.test(image) ||
                name.includes("cq9 gaming") ||
                name.includes("fa chai")
            );
        };

        const legacyVendors = games.filter(isLegacyVendor);
        if (!legacyVendors.length) return;

        const remainingGames = games.filter(item => !isLegacyVendor(item));
        const movedVendors = legacyVendors.map(game => ({
            id: game.id || game.image,
            name: game.name || "Vendor",
            image: game.image,
            url: game.url || "#"
        })).filter(vendor => {
            if (vendorIds.has(vendor.id)) return false;
            vendorIds.add(vendor.id);
            return true;
        });

        if (saveFavourites(remainingGames) && movedVendors.length) {
            saveFavouriteVendors([...vendors, ...movedVendors]);
        }
    }

    function getVendorData(card) {
        const img = card.querySelector("img");
        if (!img) return null;

        const image = img.getAttribute("src");
        if (!image) return null;

        const href = card.getAttribute("href") || "#";
        const id = card.dataset.vendorId || (href !== "#" ? href : image);

        const sectionTitle = card.closest(".lottery-games, .poker-games, .sport-games")?.querySelector(".slot-section-text h2")?.textContent?.trim();
        const altName = (img.alt || "").trim();
        const name = (!altName || altName.toLowerCase() === "slot game")
            ? (sectionTitle || image.split("/").pop().replace(/\.[^.]+$/, ""))
            : altName;

        return {
            id,
            name,
            image,
            url: href
        };
    }

    function initVendorFavouriteButtons() {
        document.querySelectorAll(".slot-games .slot-card, .lc-games .slot-card, .lottery-games .slot-card, .poker-games .slot-card, .sport-games .slot-card").forEach(card => {
            if (card.querySelector(".vendor-fav-btn")) return;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "vendor-fav-btn";
            button.setAttribute("aria-label", "Add vendor to favourites");
            button.setAttribute("aria-pressed", "false");
            button.innerHTML = '<i class="fa-regular fa-heart"></i>';
            card.appendChild(button);
        });

        updateVendorFavouriteStates();
    }

    function updateVendorFavouriteStates() {
        const savedIds = new Set(
            getFavouriteVendors().map(vendor => vendor.id)
        );

        document.querySelectorAll(
            ".slot-games .slot-card, .lc-games .slot-card, .lottery-games .slot-card, .poker-games .slot-card, .sport-games .slot-card, .fav-home-vendors-grid .slot-card"
        ).forEach(card => {
            const vendor = getVendorData(card);
            const button = card.querySelector(".vendor-fav-btn");
            if (!vendor || !button) return;

            const selected = savedIds.has(vendor.id);
            card.classList.toggle("is-vendor-favourite", selected);
            button.setAttribute("aria-pressed", String(selected));
            button.setAttribute(
                "aria-label",
                selected ? "Remove vendor from favourites" : "Add vendor to favourites"
            );
            button.innerHTML = selected
                ? '<i class="fa-solid fa-heart"></i>'
                : '<i class="fa-regular fa-heart"></i>';
        });
    }

    function renderFavouriteVendors() {
        const grid = document.querySelector(".fav-home-vendors-grid");
        if (!grid) return;

        const vendors = getFavouriteVendors();
        grid.replaceChildren();

        if (!vendors.length) {
            const empty = document.createElement("p");
            empty.className = "fav-home-vendors-empty";
            empty.textContent =
                "No favourite vendors yet. Open Battle and click the heart on a vendor.";
            grid.appendChild(empty);
            return;
        }

        vendors.forEach(vendor => {
            const card = document.createElement("a");
            card.className = "slot-card";
            card.href = vendor.url || "#";
            card.dataset.vendorId = vendor.id;

            const img = document.createElement("img");
            img.src = vendor.image;
            img.alt = vendor.name || "Vendor";
            img.loading = "lazy";
            card.appendChild(img);

            const button = document.createElement("button");
            button.type = "button";
            button.className = "vendor-fav-btn";
            button.setAttribute("aria-label", "Remove vendor from favourites");
            button.setAttribute("aria-pressed", "true");
            button.innerHTML = '<i class="fa-solid fa-heart"></i>';
            card.appendChild(button);

            grid.appendChild(card);
        });

        updateVendorFavouriteStates();
    }

    function initFavouriteHomeSwitch() {
        const section = document.querySelector(".fav-games");
        if (!section) return;

        const gamesButton = section.querySelector(".fav-home-switch__games");
        const vendorsButton = section.querySelector(".fav-home-switch__vendors");
        const gamesGrid = section.querySelector(".fav-home-games-grid");
        const vendorsGrid = section.querySelector(".fav-home-vendors-grid");
        const title = section.querySelector(".slot-section-text h2");
        const subtitle = section.querySelector(".slot-section-text p");

        if (!gamesButton || !vendorsButton || !gamesGrid || !vendorsGrid) return;

        const originalTitle = title ? title.textContent : "Favourite Games";
        const originalSubtitle = subtitle ? subtitle.textContent : "Most loved games";

        function selectType(type) {
            const showGames = type === "games";

            // Set both hidden and inline display so existing grid CSS
            // cannot force the inactive panel to remain visible.
            gamesGrid.hidden = !showGames;
            vendorsGrid.hidden = showGames;

            gamesGrid.style.setProperty(
                "display",
                showGames ? "" : "none",
                showGames ? "" : "important"
            );
            vendorsGrid.style.setProperty(
                "display",
                showGames ? "none" : "",
                showGames ? "important" : ""
            );

            gamesButton.classList.toggle(
                "fav-home-switch__games--active", showGames
            );
            vendorsButton.classList.toggle(
                "fav-home-switch__vendors--active", !showGames
            );
            gamesButton.setAttribute("aria-pressed", String(showGames));
            vendorsButton.setAttribute("aria-pressed", String(!showGames));

            if (title) title.textContent = showGames
                ? originalTitle
                : "Favourite Vendors";
            if (subtitle) subtitle.textContent = showGames
                ? originalSubtitle
                : "Your preferred providers";

            if (!showGames) renderFavouriteVendors();
        }

        gamesButton.addEventListener("click", () => selectType("games"));
        vendorsButton.addEventListener("click", () => selectType("vendors"));
        selectType("games");
    }

    document.addEventListener("click", event => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const button = target.closest(".vendor-fav-btn");
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const card = button.closest(".slot-card");
        const vendor = card && getVendorData(card);
        if (!vendor) return;

        let vendors = getFavouriteVendors();
        const alreadySaved = vendors.some(item => item.id === vendor.id);

        vendors = alreadySaved
            ? vendors.filter(item => item.id !== vendor.id)
            : [vendor, ...vendors];

        if (!saveFavouriteVendors(vendors)) return;

        renderFavouriteVendors();
        updateVendorFavouriteStates();
    });

    /* =====================================
       INITIALISE
    ===================================== */

    function init() {
        migrateLegacyVendorFavourites();
        initFavouriteButtons();
        renderFavouriteSections();
        updateFavouriteStates();
        initVendorFavouriteButtons();
        renderFavouriteVendors();
        initFavouriteHomeSwitch();
        window.addEventListener("storage", event => {
            if (event.key === VENDOR_STORAGE_KEY) {
                renderFavouriteVendors();
                updateVendorFavouriteStates();
            }
        });
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
