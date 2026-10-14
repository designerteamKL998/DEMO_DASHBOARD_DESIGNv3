const grid = document.querySelector(".reward-grid");
const prev = document.querySelector(".reward-prev");
const next = document.querySelector(".reward-next");
const dots = document.querySelectorAll(".reward-dot");

function updateSlider() {
    const max = grid.scrollWidth - grid.clientWidth;

    // Arrow
    prev.style.display = grid.scrollLeft <= 5 ? "none" : "flex";
    next.style.display = grid.scrollLeft >= max - 5 ? "none" : "flex";

    // Dot
    const page = Math.round(grid.scrollLeft / grid.clientWidth);

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === page);
    });
}

// Next
next.onclick = () => {
    grid.scrollBy({
        left: grid.clientWidth,
        behavior: "smooth"
    });
};

// Previous
prev.onclick = () => {
    grid.scrollBy({
        left: -grid.clientWidth,
        behavior: "smooth"
    });
};

// Dot click
dots.forEach((dot, i) => {
    dot.onclick = () => {
        grid.scrollTo({
            left: grid.clientWidth * i,
            behavior: "smooth"
        });
    };
});

// Bila scroll
grid.addEventListener("scroll", updateSlider);

// Mula
updateSlider();

const rewardModal = document.getElementById("rewardModal");
const modalClose = document.getElementById("rewardModalClose");

const modalImage = document.getElementById("modalRewardImage");
const modalStatus = document.getElementById("modalRewardStatus");
const modalTitle = document.getElementById("modalRewardTitle");
const modalAmount = document.getElementById("modalRewardAmount");
const modalDescription = document.getElementById("modalRewardDescription");
const modalButton = document.getElementById("modalRewardButton");

document.querySelectorAll(".reward-card").forEach(card => {

    card.addEventListener("click", function () {

        const title = card.querySelector("h3")?.textContent || "";
        const amount = card.querySelector("strong")?.textContent || "";
        const description = card.querySelector("p")?.textContent || "";
        const action = card.querySelector(".gold-btn")?.dataset.action || "Claim Now";
        const status = card.querySelector(".status")?.textContent || "";

        const image = card.querySelector(".reward-small-image img");

        modalTitle.textContent = title;
        modalAmount.textContent = amount;
        modalDescription.textContent = description;
        modalStatus.textContent = status;
        modalButton.innerHTML = `${action}`;

        if (image) {
            modalImage.src = image.src;
        } else {
            modalImage.src = "";
        }

        modalStatus.className =
            "status " +
            (status.toLowerCase() === "available"
                ? "available"
                : "eligibility");

        rewardModal.classList.add("show");
    });

});

modalClose.addEventListener("click", () => {
    rewardModal.classList.remove("show");
});

rewardModal.addEventListener("click", (e) => {
    if (e.target === rewardModal) {
        rewardModal.classList.remove("show");
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        rewardModal.classList.remove("show");
    }
});