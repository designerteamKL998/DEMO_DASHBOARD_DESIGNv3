/* =========================================================
   LEVEL PROGRAM JAVASCRIPT
========================================================= */


/* =========================================================
   REWARD DATA
========================================================= */

const lpRewardData = [

    {
        level: 1,
        reward: "MYR/SGD 9"
    },

    {
        level: 2,
        reward: "MYR/SGD 19"
    },

    {
        level: 3,
        reward: "MYR/SGD 39"
    },

    {
        level: 4,
        reward: "MYR/SGD 99"
    },

    {
        level: 5,
        reward: "MYR/SGD 199"
    },

    {
        level: 6,
        reward: "MYR/SGD 219"
    },

    {
        level: 7,
        reward: "MYR/SGD 269"
    },

    {
        level: 8,
        reward: "5 STAR HOTEL<br>ROOM 4D3N"
    },

    {
        level: 9,
        reward: "MYR/SGD 319"
    },

    {
        level: 10,
        reward: "MYR/SGD 1,999"
    }

];


/* =========================================================
   DOM
========================================================= */

const lpRewardGrid =
    document.getElementById(
        "lpRewardGrid"
    );


/* =========================================================
   RENDER REWARDS
========================================================= */

function lpRenderRewards() {

    if (!lpRewardGrid) {
        return;
    }


    lpRewardGrid.innerHTML = "";


    lpRewardData.forEach(
        function (item) {

            const lpCard =
                document.createElement(
                    "div"
                );


            lpCard.className =
                "lp-reward-card";


            lpCard.dataset.lpLevel =
                item.level;


            lpCard.innerHTML = `

                <div class="lp-reward-level">
                    Lv. ${item.level}
                </div>


                <div class="lp-reward-value">
                    ${item.reward}
                </div>


                <div class="lp-reward-lock">

                    <i class="fa-solid fa-lock"></i>

                    <span>
                        Locked
                    </span>

                </div>

            `;


            lpRewardGrid.appendChild(
                lpCard
            );

        }
    );

}


/* INITIALIZE */

lpRenderRewards();


/* =========================================================
   XP SYSTEM
========================================================= */

const lpMaxXP = 1000;

let lpCurrentXP = 0;


function lpUpdateProgress(xp) {

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
        (lpCurrentXP / lpMaxXP) * 100;


    const lpProgressFill =
        document.querySelector(
            ".lp-progress-fill"
        );


    const lpPercentageText =
        document.querySelector(
            ".lp-progress-percent"
        );


    const lpXPText =
        document.querySelector(
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


/* Initial XP */

lpUpdateProgress(0);


/* =========================================================
   SIDEBAR
========================================================= */

const lpSideItems =
    document.querySelectorAll(
        ".lp-side-item"
    );


/* =========================================================
   CATEGORY DATA
========================================================= */

const lpCategoryData = {

    sport: {
        name: "Sport",
        icon: "imgs/icon/header/head_0007_sports-ich.png",
        label: "PLAY MORE  EARN MORE",
        title: "LEVEL",
        highlight: "REWARDS",
        subtitle: "MORE PLAY  MORE XP  MORE REWARDS",
        button: "START EARNING NOW"
    },

    casino: {
        name: "Casino",
        icon: "imgs/icon/header/head_0006_casino-ich.png",
        label: "PLAY MORE  EARN MORE",
        title: "CASINO",
        highlight: "REWARDS",
        subtitle: "MORE PLAY  MORE XP  MORE REWARDS",
        button: "START EARNING NOW"
    },

    lottery: {
        name: "Lottery",
        icon: "imgs/icon/header/lotteryiconhead.png",
        label: "PLAY MORE  EARN MORE",
        title: "LOTTERY",
        highlight: "REWARDS",
        subtitle: "MORE PLAY  MORE XP  MORE REWARDS",
        button: "START EARNING NOW"
    },

    games: {
        name: "Games",
        icon: "imgs/icon/header/head_0005_slot-ich.png",
        label: "PLAY MORE  EARN MORE",
        title: "GAMES",
        highlight: "REWARDS",
        subtitle: "MORE PLAY  MORE XP  MORE REWARDS",
        button: "START EARNING NOW"
    },

    p2p: {
        name: "P2P",
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
        document.getElementById("lpCategoryIcon");

    const lpCategory =
        document.getElementById("lpCategory");

    const lpHeroLabel =
        document.getElementById("lpHeroLabel");

    const lpHeroTitle =
        document.getElementById("lpHeroTitle");

    const lpHeroHighlight =
        document.getElementById("lpHeroHighlight");

    const lpHeroSubtitle =
        document.getElementById("lpHeroSubtitle");

    const lpHeroButtonText =
        document.getElementById("lpHeroButtonText");


    if (lpCategoryIcon) {
        lpCategoryIcon.src = data.icon;
        lpCategoryIcon.alt = data.name;
    }


    if (lpCategory) {
        lpCategory.textContent = data.name;
    }


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

    document.querySelectorAll(".lp-rewards-section").forEach(section => {

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
    document.querySelector(
        ".lp-earning-button"
    );


const lpHeroButton =
    document.querySelector(
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
        document.querySelector(
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
        document.querySelector(
            ".lp-member-category"
        );


    if (lpCategoryElement) {

        lpCategoryElement.textContent =
            category;

    }

}