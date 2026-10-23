/* =========================================================
   LAST PLAYED — TEMPORARY DEMO MODE
   Copies visible game cards from Hot Games and New Games.
   Does not record actual gameplay.
========================================================= */
(() => {
    "use strict";

    function initLastPlayedDemo() {
        const section = document.querySelector(".last-played-section");
        if (!section) {
            console.warn("[Last Played] Section not found. Add .last-played-section to the homepage HTML.");
            return;
        }

        const grid = section.querySelector(".games-grid");
        if (!grid) {
            console.warn("[Last Played] .games-grid not found inside Last Played section.");
            return;
        }

        function collectSourceCards() {
            // Select broadly, then exclude Last Played and Favourite sections in JS.
            const allCards = document.querySelectorAll(".hot-games .game-card, .new-games .game-card");
            return Array.from(allCards).filter(card => {
                if (card.closest(".last-played-section")) return false;
                if (card.closest(".fav-games")) return false;
                return Boolean(card.querySelector("img"));
            });
        }

        function getVisibleCount() {
            if (window.matchMedia("(max-width: 1024px)").matches) {
                const width = grid.clientWidth || section.clientWidth || window.innerWidth - 30;
                const cardWidth = 84;
                const gap = 20;
                const fittingCount = Math.max(
                    1,
                    Math.floor((width + gap) / (cardWidth + gap))
                );

                // Tablet: show as many cards as fit in one row, up to 9.
                return Math.min(9, fittingCount);
            }

            // Desktop follows the existing 8-column Hot/New Games layout.
            const columns = getComputedStyle(grid).gridTemplateColumns
                .split(/\s+/)
                .filter(Boolean).length;
            return Math.min(8, Math.max(1, columns || 8));
        }
        function render() {
            const seen = new Set();
            const uniqueCards = [];

            collectSourceCards().forEach(card => {
                const img = card.querySelector("img");
                if (!img) return;

                const key = card.dataset.gameId || img.getAttribute("src") || img.currentSrc || img.alt;
                if (!key || seen.has(key)) return;

                seen.add(key);
                uniqueCards.push(card);
            });

            grid.replaceChildren();

            const count = getVisibleCount();
            uniqueCards.slice(0, count).forEach(sourceCard => {
                const clone = sourceCard.cloneNode(true);
                clone.removeAttribute("id");
                clone.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
                grid.appendChild(clone);
            });

            console.info(`[Last Played demo] Found ${uniqueCards.length} unique source games; showing ${Math.min(count, uniqueCards.length)}.`);
        }

        render();
        window.addEventListener("resize", render);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLastPlayedDemo, { once: true });
    } else {
        initLastPlayedDemo();
    }
})();
