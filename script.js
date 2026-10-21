// SLIDER
document.querySelectorAll('.promo-slider').forEach(slider => {

    const track = slider.querySelector('.promo-track');
    const dots = slider.querySelectorAll('.promo-dot');

    let i = 0;

    function slide(n) {
        i = n;
        track.style.transform = `translateX(-${i * 100}%)`;

        dots.forEach((dot, x) => {
            dot.classList.toggle('active', x === i);
        });
    }

    dots.forEach((dot, x) => {
        dot.onclick = () => slide(x);
    });

    setInterval(() => {
        slide((i + 1) % dots.length);
    }, 5000);

});


document.querySelectorAll(".mobile-game-btn").forEach(button => {

    button.addEventListener("click", () => {

        const target = button.dataset.game;

        document.querySelectorAll(".mobile-game-btn")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        document.querySelectorAll(
            ".slot-games, .lc-games, .sport-games, .lottery-games, .battle-games, .poker-games"
        ).forEach(section => {
            section.style.display = "none";
        });

        document.querySelector("." + target).style.display = "block";

        // CLOSE HOME MENU
        const homeWrap = document.querySelector(".bottom-home-wrap");

        if (homeWrap) {
            homeWrap.classList.remove("game-open");
        }

    });

});

// HOME GAME MENU
const homeWrap = document.querySelector(".bottom-home-wrap");
const homeBtn = document.querySelector(".home-btn");

if (homeWrap && homeBtn) {

    homeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Buka/tutup game menu, dan tutup dropdown user supaya tak overlap.
        const moreMenu = document.querySelector(".mobile-more-menu");
        const profileWrap = document.querySelector(".user-profile-wrap");

        if (moreMenu) moreMenu.classList.remove("active");
        if (profileWrap) profileWrap.classList.remove("active");

        homeWrap.classList.toggle("game-open");
    });

}


// profile-mobile
const moreBtn = document.querySelector(".mobile-more-btn");
const moreMenu = document.querySelector(".mobile-more-menu");

if (moreBtn && moreMenu) {
    moreBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const homeWrap = document.querySelector(".bottom-home-wrap");
        if (homeWrap) {
            homeWrap.classList.remove("game-open");
        }

        const isOpen = moreMenu.classList.contains("active");

        moreMenu.classList.toggle("active", !isOpen);
    });

    moreMenu.addEventListener("click", function (e) {
        e.stopPropagation();
    });
}


// refresh-header
const refreshBtn = document.querySelector(".refresh");

if (refreshBtn) {

    refreshBtn.addEventListener("click", () => {
        // refresh balance
        console.log("Balance refreshed");
    });

}


/* =========================================================
   MOBILE BOTTOM MENU SCROLL
========================================================= */

const mobileBottomNav = document.querySelector(".mobile-bottom-nav");
const floatingMenuBtn = document.querySelector(".floating-menu-btn");
const bottomHomeWrap = document.querySelector(".bottom-home-wrap");

function updateMobileMenuScroll() {

    if (window.innerWidth > 1030) return;

    const scrolled = window.scrollY > 80;

    if (mobileBottomNav) {
        mobileBottomNav.classList.toggle("scrolled", scrolled);
    }

    document.body.classList.toggle("menu-scrolled", scrolled);

    /* Bila scroll, tutup game menu */
    if (scrolled && bottomHomeWrap) {
        bottomHomeWrap.classList.remove("game-open");
    }
}

window.addEventListener("scroll", updateMobileMenuScroll);
updateMobileMenuScroll();


/* =========================================================
   FLOATING MENU BUTTON
========================================================= */

if (floatingMenuBtn) {

    floatingMenuBtn.addEventListener("click", function () {

        /* Show bottom menu */
        if (mobileBottomNav) {
            mobileBottomNav.classList.remove("scrolled");
        }

        /* Hide floating circle */
        document.body.classList.remove("menu-scrolled");

        /* Optional: terus buka game menu */
        if (bottomHomeWrap) {
            bottomHomeWrap.classList.add("game-open");
        }

    });

}
/* =========================================================
   MOBILE HEADER STICKY STATE
========================================================= */

window.addEventListener("scroll", () => {

    if (window.innerWidth > 1030) return;

    const header =
        document.querySelector(".main-header");

    if (!header) return;

    header.classList.toggle(
        "is-sticky",
        window.scrollY > 0
    );

});


//profile-dropdown
const userProfileBtn = document.getElementById("userProfileBtn");
const userProfileWrap = document.querySelector(".user-profile-wrap");

if (userProfileBtn && userProfileWrap) {

    userProfileBtn.addEventListener("click", function (e) {

        if (window.innerWidth > 1030) return;

        e.stopPropagation();

        // Bila buka user dropdown, tutup Menu game terlebih dahulu.
        const homeWrap = document.querySelector(".bottom-home-wrap");
        const moreMenu = document.querySelector(".mobile-more-menu");
        if (homeWrap) homeWrap.classList.remove("game-open");
        if (moreMenu) moreMenu.classList.remove("active");

        userProfileWrap.classList.toggle("active");

    });

}

//eye-balance hide out
const btns = document.querySelectorAll(".balance-view, .balance-eye");
const balances = document.querySelectorAll(".balance-amount");

btns.forEach(btn => btn.onclick = () => {
    const hide = balances[0].textContent !== "**.**";

    balances.forEach(b => b.textContent = hide ? "**.**" : "0.00");
    btns.forEach(b => b.querySelector("i").className =
        `fa-solid fa-eye${hide ? "-slash" : ""}`
    );
});

//user dropdown


/* USER DROPDOWN - MOBILE MORE MENU */

/* USER DROPDOWN - MOBILE MORE MENU */
function initUserDropdownMove() {
    const dropdown = document.getElementById("userDropdown");
    const mobileMenu = document.querySelector(".mobile-more-menu");

    if (!dropdown || !mobileMenu) return;

    const originalParent = dropdown.parentElement;
    const placeholder = document.createComment("userDropdown-position");

    if (originalParent) {
        originalParent.insertBefore(placeholder, dropdown);
    }

    function moveDropdown() {
        if (window.innerWidth <= 1030) {
            if (!mobileMenu.contains(dropdown)) {
                mobileMenu.appendChild(dropdown);
            }
        } else if (
            placeholder.parentNode &&
            !placeholder.parentNode.contains(dropdown)
        ) {
            placeholder.parentNode.insertBefore(dropdown, placeholder);
        }
    }

    moveDropdown();
    window.addEventListener("resize", moveDropdown);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUserDropdownMove, {
        once: true
    });
} else {
    initUserDropdownMove();
}


// =========================================
// LANGUAGE POPUP
// =========================================

const languageBtn = document.getElementById("languageBtn");
const languagePopup = document.getElementById("languagePopup");
const languageClose = document.getElementById("languageClose");


// OPEN
if (languageBtn) {
    languageBtn.addEventListener("click", function () {
        languagePopup.classList.add("show");

        document.body.classList.add("language-open");
    });
}


// CLOSE
function closeLanguagePopup() {
    languagePopup.classList.remove("show");

    document.body.classList.remove("language-open");
}


if (languageClose) {
    languageClose.addEventListener("click", closeLanguagePopup);
}


// CLICK OUTSIDE
languagePopup.addEventListener("click", function (e) {

    if (e.target === languagePopup) {
        closeLanguagePopup();
    }

});


// =========================================
// SELECT LANGUAGE
// =========================================

const languageItems = document.querySelectorAll(".language-item");

languageItems.forEach(function (item) {

    item.addEventListener("click", function () {

        // Remove active from all
        languageItems.forEach(function (language) {
            language.classList.remove("active");
        });

        // Add active to selected
        this.classList.add("active");

        // Get selected language
        const selectedLanguage = this.dataset.language;

        console.log("Selected language:", selectedLanguage);

        /*
         * Kalau nak terus tukar language website,
         * letak function/API translation kat sini.
         */

    });

});


// =========================================
// ESC KEY
// =========================================

document.addEventListener("keydown", function (e) {

    if (e.key === "Escape" &&
        languagePopup.classList.contains("show")) {

        closeLanguagePopup();

    }

});

// =========================================
// CLOSE ALL FLOATING MENU WHEN CLICK OUTSIDE
// =========================================

document.addEventListener("click", function (e) {

    const homeWrap = document.querySelector(".bottom-home-wrap");
    const moreMenu = document.querySelector(".mobile-more-menu");
    const profileWrap = document.querySelector(".user-profile-wrap");

    // Floating elements
    const floatingElements = [
        homeWrap,
        moreMenu,
        profileWrap
    ].filter(Boolean);

    // Check kalau click dalam floating menu
    const clickedInside = floatingElements.some(el =>
        el.contains(e.target)
    );

    // Kalau click luar floating menu → tutup semua
    if (!clickedInside) {

        if (homeWrap) {
            homeWrap.classList.remove("game-open");
        }

        if (moreMenu) {
            moreMenu.classList.remove("active");
        }

        if (profileWrap) {
            profileWrap.classList.remove("active");
        }

        document.body.classList.remove("menu-scrolled");
    }

});

// =========================================
// NOTIFICATION
// =========================================

const notificationButtons = document.querySelectorAll(
    ".notification-btn, .notification-bottom-btn"
);

notificationButtons.forEach(button => {

    button.addEventListener("click", function () {

        document.querySelectorAll(".notification-dot").forEach(dot => {
            dot.style.display = "none";
        });

    });

});

// =========================================
// CLOSE MOBILE MENUS WHEN SCROLL OUTSIDE
// =========================================

let scrollingInsideFloatingMenu = false;

// Detect scroll/touch bermula dalam floating menu
document.addEventListener("touchstart", function (e) {

    scrollingInsideFloatingMenu = !!e.target.closest(
        ".mobile-more-menu, .user-profile-wrap, .bottom-home-wrap"
    );

}, { passive: true });

document.addEventListener("pointerdown", function (e) {

    scrollingInsideFloatingMenu = !!e.target.closest(
        ".mobile-more-menu, .user-profile-wrap, .bottom-home-wrap"
    );

}, { passive: true });


// Bila PAGE scroll
window.addEventListener("scroll", function () {

    if (window.innerWidth > 1030) return;

    // Kalau scroll bermula dalam menu,
    // jangan close menu
    if (scrollingInsideFloatingMenu) {
        return;
    }

    // Close More menu
    const moreMenu = document.querySelector(".mobile-more-menu");

    if (moreMenu) {
        moreMenu.classList.remove("active");
    }


    // Close Profile menu
    const profileWrap = document.querySelector(".user-profile-wrap");

    if (profileWrap) {
        profileWrap.classList.remove("active");
    }


    // Close Home menu
    const homeWrap = document.querySelector(".bottom-home-wrap");

    if (homeWrap) {
        homeWrap.classList.remove("game-open");
    }

}, { passive: true });


// Reset selepas jari/mouse dilepaskan
document.addEventListener("touchend", function () {
    scrollingInsideFloatingMenu = false;
}, { passive: true });

document.addEventListener("pointerup", function () {
    scrollingInsideFloatingMenu = false;
}, { passive: true });



//BACK-TO-TOP
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", function () {
    if (window.scrollY > 400) {
        backToTop.classList.add("show");
    } else {
        backToTop.classList.remove("show");
    }
});

backToTop.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

//PROMO
document.addEventListener("DOMContentLoaded", function () {

    const promoCategories = document.querySelectorAll(".cm8-promo-category");
    const promoCards = document.querySelectorAll(".cm8-promo-card");

    if (!promoCategories.length || !promoCards.length) {
        return;
    }

    promoCategories.forEach(function (categoryButton) {

        categoryButton.addEventListener("click", function () {

            const selectedCategory = this.dataset.promoCategory;

            // Remove active from all buttons
            promoCategories.forEach(function (button) {
                button.classList.remove("active");
            });

            // Add active to clicked button
            this.classList.add("active");


            // Filter promotion cards
            promoCards.forEach(function (card) {

                const promoType = card.dataset.promoType;

                if (
                    selectedCategory === "all" ||
                    promoType === selectedCategory
                ) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }

            });

        });

    });

});