
/* =====================================
   RESPONSIVE REWARD SLIDER
===================================== */

const grid = document.querySelector(".reward-grid");
const prev = document.querySelector(".reward-prev");
const next = document.querySelector(".reward-next");
const dotsContainer = document.querySelector(".reward-dots");

if (grid && prev && next && dotsContainer) {

    let pagePositions = [0];
    let currentPage = 0;
    let resizeTimer;

    // Kira kedudukan setiap page berdasarkan card sebenar
    function calculatePages() {
        const cards = [...grid.querySelectorAll(".reward-card")];
        const maxScroll = Math.max(
            0,
            grid.scrollWidth - grid.clientWidth
        );

        pagePositions = [0];

        if (!cards.length || grid.clientWidth <= 0) return;

        const tolerance = 5;
        let lastPosition = 0;

        cards.forEach(card => {
            const position = Math.min(
                card.offsetLeft - grid.offsetLeft,
                maxScroll
            );

            if (
                position > lastPosition + tolerance &&
                position >= lastPosition + grid.clientWidth - tolerance
            ) {
                pagePositions.push(position);
                lastPosition = position;
            }
        });

        // Pastikan page terakhir boleh dicapai
        if (maxScroll > tolerance) {
            const lastPage = pagePositions.length - 1;

            if (maxScroll - pagePositions[lastPage] > tolerance) {
                pagePositions.push(maxScroll);
            } else {
                pagePositions[lastPage] = maxScroll;
            }
        }

        // Bina dot secara automatik ikut jumlah page
        dotsContainer.innerHTML = "";

        pagePositions.forEach((position, index) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "reward-dot";
            dot.setAttribute("aria-label", `Go to reward page ${index + 1}`);

            dot.addEventListener("click", () => {
                goToPage(index);
            });

            dotsContainer.appendChild(dot);
        });

        currentPage = findCurrentPage();
        updateSlider();
    }

    function findCurrentPage() {
        let closest = 0;
        let distance = Infinity;

        pagePositions.forEach((position, index) => {
            const difference = Math.abs(grid.scrollLeft - position);

            if (difference < distance) {
                distance = difference;
                closest = index;
            }
        });

        return closest;
    }

    function updateSlider() {
        currentPage = findCurrentPage();

        prev.style.display =
            currentPage === 0 ? "none" : "flex";

        next.style.display =
            currentPage >= pagePositions.length - 1
                ? "none"
                : "flex";

        dotsContainer.querySelectorAll(".reward-dot")
            .forEach((dot, index) => {
                dot.classList.toggle("active", index === currentPage);
            });
    }

    function goToPage(index) {
        const target = Math.max(
            0,
            Math.min(index, pagePositions.length - 1)
        );

        grid.scrollTo({
            left: pagePositions[target],
            behavior: "smooth"
        });
    }

    // Next
    next.addEventListener("click", () => {
        goToPage(findCurrentPage() + 1);
    });

    // Previous
    prev.addEventListener("click", () => {
        goToPage(findCurrentPage() - 1);
    });

    // Update semasa swipe atau scroll
    grid.addEventListener("scroll", updateSlider, {
        passive: true
    });

    // Kira semula bila saiz skrin berubah
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            calculatePages();
        }, 150);
    });

    // Tunggu layout siap
    window.addEventListener("load", calculatePages);

    calculatePages();
}


// ======================================
// REWARD MODAL
// ======================================

const rewardModal = document.getElementById("rewardModal");
const modalClose = document.getElementById("rewardModalClose");

const modalImage = document.getElementById("modalRewardImage");
const modalStatus = document.getElementById("modalRewardStatus");
const modalTitle = document.getElementById("modalRewardTitle");
const modalAmount = document.getElementById("modalRewardAmount");
const modalDescription = document.getElementById("modalRewardDescription");
const modalButton = document.getElementById("modalRewardButton");

let selectedRewardPage = "";

document.querySelectorAll(".reward-card").forEach(card => {
    card.addEventListener("click", function () {
        const title = card.querySelector("h3")?.textContent || "";
        const amount = card.querySelector("strong")?.textContent || "";
        const description = card.querySelector("p")?.textContent || "";
        const action =
            card.querySelector(".gold-btn")?.dataset.action || "Claim Now";
        const status = card.querySelector(".status")?.textContent || "";

        selectedRewardPage = card.dataset.page || "";

        const image = card.querySelector(".reward-small-image img");

        modalTitle.textContent = title;
        modalAmount.textContent = amount;
        modalDescription.textContent = description;
        modalStatus.textContent = status;
        modalButton.textContent = action;

        modalImage.src = image ? image.src : "";

        modalStatus.className =
            "status " +
            (status.toLowerCase() === "available"
                ? "available"
                : "eligibility");

        rewardModal.classList.add("show");
    });
});

if (modalButton) {
    modalButton.addEventListener("click", () => {
        if (selectedRewardPage) {
            window.location.href = selectedRewardPage;
        }
    });
}

if (modalClose) {
    modalClose.addEventListener("click", () => {
        rewardModal.classList.remove("show");
    });
}

if (rewardModal) {
    rewardModal.addEventListener("click", e => {
        if (e.target === rewardModal) {
            rewardModal.classList.remove("show");
        }
    });
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape" && rewardModal) {
        rewardModal.classList.remove("show");
    }
});
