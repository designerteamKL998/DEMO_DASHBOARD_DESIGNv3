
/* ===========  FAVOURITE GAMES SYSTEM  ============ */

(() => {
    "use strict";

    const STORAGE_KEY = "cm8FavouriteGames";

    /* ===========  GET SAVED FAVOURITES  ============ */

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

    /* ==========  SAVE FAVOURITES  ========== */

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

    /* =========  GET GAME DATA HOT / NEW DEPENDS ON SOURCE SECTION  ========= */

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
        document.querySelectorAll(".game-card:not(.favourite-vendor-card)").forEach(card => {
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

    /* ==========  UPDATE HEART STATE  ========== */

    function updateFavouriteStates() {
        const favourites = getFavourites();

        const favouriteIds = new Set(
            favourites.map(game => game.id)
        );

        document.querySelectorAll(".game-card:not(.favourite-vendor-card)").forEach(card => {
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

    /* ========== RENDER MIXED FAVOURITE GAMES + VENDORS ========== */

    function createFavouriteGameCard(game) {
        const card = document.createElement("a");
        card.className = "game-card";
        card.href = game.url || "#";
        card.dataset.gameId = game.id;

        (game.badges || []).forEach(badgeData => {
            if (badgeData.className !== "hot-badge" &&
                badgeData.className !== "new-badge") return;

            const badge = document.createElement("div");
            badge.className = badgeData.className;
            badge.textContent = badgeData.text;
            card.appendChild(badge);
        });

        const img = document.createElement("img");
        img.src = game.image;
        img.alt = game.name || "Game";
        img.loading = "lazy";
        card.appendChild(img);

        return card;
    }

    function createFavouriteVendorCard(vendor) {
        const card = document.createElement("a");
        // game-card ensures vendor artwork uses the same size and grid layout as games.
        card.className = "game-card slot-card favourite-vendor-card";
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

        return card;
    }

    function renderMixedFavouriteGrid(grid) {
        if (!grid) return;

        const games = getFavourites();
        const vendors = getFavouriteVendors();
        grid.replaceChildren();

        if (!games.length && !vendors.length) {
            const empty = document.createElement("p");
            empty.className = "fav-empty-message";
            empty.textContent =
                "No favourites yet. Click the heart on a game or vendor to add it here.";
            grid.appendChild(empty);
            return;
        }

        // Alternate game and vendor cards so both types appear in one mixed grid.
        const mixedItems = [];
        const total = Math.max(games.length, vendors.length);

        for (let i = 0; i < total; i++) {
            if (games[i]) mixedItems.push({ type: "game", item: games[i] });
            if (vendors[i]) mixedItems.push({ type: "vendor", item: vendors[i] });
        }

        mixedItems.forEach(entry => {
            grid.appendChild(
                entry.type === "game"
                    ? createFavouriteGameCard(entry.item)
                    : createFavouriteVendorCard(entry.item)
            );
        });
    }

    function renderFavouriteSections() {
        document.querySelectorAll(".fav-games .games-grid").forEach(grid => {
            renderMixedFavouriteGrid(grid);
        });

        initFavouriteButtons();
        updateFavouriteStates();
        updateVendorFavouriteStates();
    }

    /* =========  HANDLE HEART CLICK  ======== */

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
        // Compatibility wrapper: games and vendors now render together in one grid.
        renderFavouriteSections();
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

        renderFavouriteSections();
        updateVendorFavouriteStates();
    });

    /* ========  INITIALISE  ======== */

    function init() {
        migrateLegacyVendorFavourites();
        initFavouriteButtons();
        renderFavouriteSections();
        updateFavouriteStates();
        initVendorFavouriteButtons();
        renderFavouriteVendors();
        window.addEventListener("storage", event => {
            if (event.key === VENDOR_STORAGE_KEY || event.key === STORAGE_KEY) {
                renderFavouriteSections();
                updateFavouriteStates();
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
