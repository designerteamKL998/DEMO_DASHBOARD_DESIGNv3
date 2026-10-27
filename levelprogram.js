/* Level Program only — no changes to header, navigation, or global styles. */
(function () {
const lpRoot = document.querySelector(".lp-page");
if (!lpRoot) return;
/* =========================================================
   LEVEL PROGRAM JAVASCRIPT
========================================================= */


/* =========================================================
   XP SYSTEM
========================================================= */

const lpMaxXP = 1000;

let lpCurrentXP = 0;

let lpCurrentLevel = 0;


function lpUpdateProgress(xp, percentageOverride) {

    /*
        Keep XP between 0 and 1000
    */

    lpCurrentXP =
        Math.min(
            Math.max(
                Number(xp) || 0,
                0
            ),
            lpMaxXP
        );


    const lpPercentage =
        percentageOverride === undefined || percentageOverride === null
            ? (lpCurrentXP / lpMaxXP) * 100
            : Math.min(Math.max(Number(percentageOverride) || 0, 0), 100);


    const lpProgressFill =
        lpRoot.querySelector(
            ".lp-progress-fill"
        );


    const lpPercentageText =
        lpRoot.querySelector(
            ".lp-progress-percent"
        );


    const lpXPText =
        lpRoot.querySelector(
            ".lp-xp-value"
        );


    if (lpProgressFill) {

        lpProgressFill.style.width =
            `${lpPercentage}%`;

    }


    if (lpPercentageText) {

        lpPercentageText.textContent =
            `${Math.floor(lpPercentage)}%`;

    }


    if (lpXPText) {

        lpXPText.textContent =
            `${lpCurrentXP.toLocaleString()} / ${lpMaxXP.toLocaleString()} XP`;

    }

}


/* Initial XP is applied when the selected category loads. */


/* =========================================================
   SIDEBAR
========================================================= */

const lpSideItems =
    lpRoot.querySelectorAll(
        ".lp-side-item"
    );


/* =========================================================
   CATEGORY DATA
========================================================= */

const lpCategoryData = {

    sport: {
        name: "Sport",
        level: 1,
        xp: 450,
        percent: 30,
        icon: "imgs/icon/header/head_0007_sports-ich.png",
        label: "PLAY MORE  EARN MORE",
        title: "LEVEL",
        highlight: "REWARDS",
        subtitle: "MORE PLAY  MORE XP  MORE REWARDS",
        button: "START EARNING NOW"
    },

    casino: {
        name: "Casino",
        level: 2,
        xp: 600,
        icon: "imgs/icon/header/head_0006_casino-ich.png",
        label: "PLAY MORE  EARN MORE",
        title: "CASINO",
        highlight: "REWARDS",
        subtitle: "MORE PLAY  MORE XP  MORE REWARDS",
        button: "START EARNING NOW"
    },

    lottery: {
        name: "Lottery",
        level: 0,
        xp: 150,
        icon: "imgs/icon/header/lotteryiconhead.png",
        label: "PLAY MORE  EARN MORE",
        title: "LOTTERY",
        highlight: "REWARDS",
        subtitle: "MORE PLAY  MORE XP  MORE REWARDS",
        button: "START EARNING NOW"
    },

    games: {
        name: "Games",
        level: 3,
        xp: 800,
        icon: "imgs/icon/header/head_0005_slot-ich.png",
        label: "PLAY MORE  EARN MORE",
        title: "GAMES",
        highlight: "REWARDS",
        subtitle: "MORE PLAY  MORE XP  MORE REWARDS",
        button: "START EARNING NOW"
    },

    p2p: {
        name: "P2P",
        level: 1,
        xp: 450,
        icon: "imgs/icon/header/head_0002_poker-ich.png",
        label: "PLAY MORE  EARN MORE",
        title: "P2P",
        highlight: "REWARDS",
        subtitle: "MORE PLAY  MORE XP  MORE REWARDS",
        button: "START EARNING NOW"
    }

};


/* =========================================================
   CHANGE CATEGORY CONTENT
========================================================= */

function lpChangeCategory(category) {

    const data =
        lpCategoryData[category];

    if (!data) {
        return;
    }


    const lpCategoryIcon =
        lpRoot.querySelector("#lpCategoryIcon");

    const lpCategory =
        lpRoot.querySelector("#lpCategory");

    const lpHeroLabel =
        lpRoot.querySelector("#lpHeroLabel");

    const lpHeroTitle =
        lpRoot.querySelector("#lpHeroTitle");

    const lpHeroHighlight =
        lpRoot.querySelector("#lpHeroHighlight");

    const lpHeroSubtitle =
        lpRoot.querySelector("#lpHeroSubtitle");

    const lpHeroButtonText =
        lpRoot.querySelector("#lpHeroButtonText");


    if (lpCategoryIcon) {
        lpCategoryIcon.src = data.icon;
        lpCategoryIcon.alt = data.name;
    }


    if (lpCategory) {
        lpCategory.textContent = data.name;
    }


    /* Update level and XP for the selected category */
    const lpLevelNumber = lpRoot.querySelector(".lp-level-number");
    const lpNextLevel = lpRoot.querySelector("#lpNextLevel");

    if (lpLevelNumber) {
        lpLevelNumber.textContent = `Lv. ${data.level}`;
    }

    if (lpNextLevel) {
        lpNextLevel.textContent = `Lv.${data.level + 1}`;
    }

    lpCurrentLevel = data.level;
    lpUpdateProgress(data.xp, data.percent);


    if (lpHeroLabel) {
        lpHeroLabel.textContent = data.label;
    }


    if (lpHeroTitle) {
        lpHeroTitle.textContent = data.title;
    }


    if (lpHeroHighlight) {
        lpHeroHighlight.textContent = data.highlight;
    }


    if (lpHeroSubtitle) {
        lpHeroSubtitle.textContent = data.subtitle;
    }


    if (lpHeroButtonText) {
        lpHeroButtonText.textContent = data.button;
    }


    /* =========================================
       CHANGE REWARD SECTION
    ========================================= */

    lpRoot.querySelectorAll(".lp-rewards-section").forEach(section => {

        section.style.display =
            section.dataset.category === category
                ? "block"
                : "none";

    });

}


/* =========================================================
   CATEGORY BUTTON CLICK
========================================================= */

lpSideItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                lpSideItems.forEach(
                    function (button) {

                        button.classList.remove(
                            "lp-active"
                        );

                    }
                );


                item.classList.add(
                    "lp-active"
                );


                const lpCategory =
                    item.dataset.lpCategory;


                lpChangeCategory(
                    lpCategory
                );

            }
        );

    }
);


/* INITIAL CATEGORY */

lpChangeCategory("sport");


/* =========================================================
   START EARNING
========================================================= */

const lpEarningButton =
    lpRoot.querySelector(
        ".lp-earning-button"
    );


const lpHeroButton =
    lpRoot.querySelector(
        ".lp-hero-button"
    );


function lpStartEarning() {

    /*
        Put your actual URL here.

        Example:

        window.location.href = "/sport";

    */

    console.log(
        "Start Earning clicked"
    );

}


if (lpEarningButton) {

    lpEarningButton.addEventListener(
        "click",
        lpStartEarning
    );

}


if (lpHeroButton) {

    lpHeroButton.addEventListener(
        "click",
        lpStartEarning
    );

}


/* =========================================================
   OPTIONAL:
   UPDATE XP FROM YOUR WEBSITE
========================================================= */

/*
    Example:

    lpSetXP(350);

    Result:

    35%
    350 / 1,000 XP
*/


function lpSetXP(xp) {

    lpUpdateProgress(xp);

}


/* =========================================================
   OPTIONAL:
   UPDATE MEMBER LEVEL
========================================================= */

function lpSetLevel(level) {

    const lpLevelElement =
        lpRoot.querySelector(
            ".lp-level-number"
        );


    if (lpLevelElement) {

        lpLevelElement.textContent =
            `Lv. ${level}`;

    }

}


/* =========================================================
   OPTIONAL:
   UPDATE CATEGORY
========================================================= */

function lpSetCategory(category) {

    const lpCategoryElement =
        lpRoot.querySelector(
            ".lp-member-category"
        );


    if (lpCategoryElement) {

        lpCategoryElement.textContent =
            category;

    }

}
window.lpSetXP = lpSetXP;
window.lpSetLevel = lpSetLevel;
window.lpSetCategory = lpSetCategory;
})();
