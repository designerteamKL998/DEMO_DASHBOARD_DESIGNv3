//FREEPOINT HISTORY
document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       BACK BUTTON
    ========================================== */

    const backButton = document.querySelector(".fp-back-btn");

    backButton?.addEventListener("click", (e) => {

        // Kalau page freepoint.html memang wujud,
        // biarkan link HTML handle navigation.
        // JS ni hanya prevent double action.

    });


    /* =========================================
       TABLE ROW CLICK
    ========================================== */

    document.querySelectorAll(".fp-table tbody tr").forEach(row => {

        row.addEventListener("click", () => {

            document
                .querySelectorAll(".fp-table tbody tr")
                .forEach(item => item.classList.remove("fp-row-active"));

            row.classList.add("fp-row-active");

        });

    });

});