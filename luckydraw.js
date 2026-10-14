        const popup = document.getElementById("lwPopup");
        const popupTitle = document.getElementById("lwPopupTitle");
        const popupBody = document.getElementById("lwPopupBody");
        const popupClose = document.getElementById("lwPopupClose");
        const popupConfetti = document.getElementById("lwPopupConfetti");

        const historyPanel = document.getElementById("lwHistoryPanel");
        const winnerHighlight = document.getElementById("lwWinnerHighlight");
        const wheelShell = document.querySelector(".lwWheelShell");

        const historyList = document.getElementById("lwHistoryList");

        document.querySelectorAll("[data-open-panel='history']").forEach((btn) => {
            btn.addEventListener("click", () => {
                popup.classList.remove("is-win", "is-lose");
                clearPopupConfetti();

                popupTitle.textContent = "Spin History";
                popupBody.innerHTML = historyPanel.querySelector(".lwHistoryList").outerHTML;

                popup.classList.add("is-open");
            });
        });

        const soundSpin = document.getElementById("lwSoundSpin");
        const soundWin = document.getElementById("lwSoundWin");
        const soundLose = document.getElementById("lwSoundLose");
        const soundPopup = document.getElementById("lwSoundPopup");

        function playSound(audio) {
            if (!audio) return;

            audio.currentTime = 0;

            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Browser may block audio before user interaction.
                });
            }
        }

        popup.addEventListener("click", (event) => {
            if (event.target === popup) {
                popup.classList.remove("is-open", "is-win", "is-lose");
                clearPopupConfetti();
            }
        });
        popupClose.addEventListener("click", () => {
            popup.classList.remove("is-open", "is-win", "is-lose");
            clearPopupConfetti();
        });

        const wheel = document.getElementById("lwWheelDisc");
        const centerSpinBtn = document.getElementById("lwCenterSpinBtn");
        const spinBtn = document.getElementById("lwSpinBtn");
        const spinAllBtn = document.getElementById("lwSpinAllBtn");

        const spinButtons = [centerSpinBtn, spinBtn, spinAllBtn].filter(Boolean);

        let currentRotation = 100;
        let isSpinning = false;

        const initialSpinChance = 23;
        let availableSpinChance = initialSpinChance;

        function setSpinButtonsDisabled(disabled) {
            spinButtons.forEach((btn) => {
                btn.disabled = disabled;
            });
        }
        function renderSpinChance() {
            const chanceNumber = document.querySelector(".lwChance__main strong");

            if (!chanceNumber) return;

            chanceNumber.textContent = availableSpinChance;
        }

        function getAvailableSpinCount() {
            return availableSpinChance;
        }

        function deductSpinChance(count = 1) {
            if (availableSpinChance < count) {
                return false;
            }

            availableSpinChance -= count;
            renderSpinChance();

            return true;
        }
        const wheelPrizes = [
            {
                index: 0,
                name: "Try Again",
                type: "lose",
                tag: "No Prize"
            },
            {
                index: 1,
                name: "Bonus RM 88",
                type: "win",
                tag: "Grand Prize"
            },
            {
                index: 2,
                name: "Mystery Gift",
                type: "win",
                tag: "Random Bonus"
            },
            {
                index: 3,
                name: "Bonus RM 18",
                type: "win",
                tag: "Lucky Bonus"
            },
            {
                index: 4,
                name: "VIP Point x100",
                type: "win",
                tag: "Member Reward"
            },
            {
                index: 5,
                name: "Bonus RM 8",
                type: "win",
                tag: "Lucky Bonus"
            },
            {
                index: 6,
                name: "Free Spin x5",
                type: "win",
                tag: "Extra Spin"
            },
            {
                index: 7,
                name: "iPhone 17 Pro Max 1TB (Silver)",
                type: "win",
                tag: "Extra Spin"
            }
        ];


        function shouldUseDarkText(index) {
            return false;
        }
        function getCssVar(name, target = document.documentElement) {
            return getComputedStyle(target).getPropertyValue(name).trim();
        }

        function getWheelSegmentPalettes() {
            return [
                {
                    start: getCssVar("--lw-wheel-seg-1-start"),
                    end: getCssVar("--lw-wheel-seg-1-end")
                },
                {
                    start: getCssVar("--lw-wheel-seg-2-start"),
                    end: getCssVar("--lw-wheel-seg-2-end")
                },
                {
                    start: getCssVar("--lw-wheel-seg-3-start"),
                    end: getCssVar("--lw-wheel-seg-3-end")
                }
            ];
        }

        function getLoseSegmentPalette() {
            return {
                start: getCssVar("--lw-wheel-lose-seg-start"),
                end: getCssVar("--lw-wheel-lose-seg-end")
            };
        }

        function updateWinnerHighlight(segmentAngle) {
            if (!winnerHighlight) return;

            const halfAngle = segmentAngle / 2;
            const softStart = segmentAngle * 0.10;
            const glowStart = segmentAngle * 0.28;
            const glowCenter = segmentAngle * 0.50;
            const glowEnd = segmentAngle * 0.72;
            const softEnd = segmentAngle * 0.90;

            winnerHighlight.style.setProperty(
                "--lw-winner-highlight-bg",
                `
                                            conic-gradient(
                                                from ${-halfAngle}deg,
                                                rgba(255, 241, 178, 0.00) 0deg,
                                                rgba(255, 224, 140, 0.08) ${softStart}deg,
                                                rgba(245, 206, 108, 0.22) ${glowStart}deg,
                                                rgba(255, 239, 178, 0.34) ${glowCenter}deg,
                                                rgba(245, 206, 108, 0.22) ${glowEnd}deg,
                                                rgba(255, 224, 140, 0.08) ${softEnd}deg,
                                                rgba(255, 241, 178, 0.00) ${segmentAngle}deg,
                                                transparent ${segmentAngle}deg 360deg
                                            )
                                        `
            );
        }
        function escapeHTML(value) {
            return String(value).replace(/[&<>"']/g, (char) => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#039;"
            }[char]));
        }

        function formatWheelLabel(name) {
            const labelLines = {
                "iPhone 17 Pro Max 1TB (Silver)": ["iPhone 17", "Pro Max", "1TB (Silver)"],
                "Try Again": ["Try Again"],
                "Bonus RM 88": ["Bonus", "RM 88"],
                "Mystery Gift": ["Mystery", "Gift"],
                "Bonus RM 18": ["Bonus", "RM 18"],
                "VIP Point x100": ["VIP", "Point x100"],
                "Bonus RM 8": ["Bonus", "RM 8"],
                "Free Spin x5": ["Free", "Spin x5"]
            };

            return (labelLines[name] || [name]).map((line) => `<span>${escapeHTML(line)}</span>`).join("");
        }

        function renderWheel() {
            const segmentAngle = 360 / wheelPrizes.length;
            const segmentPalettes = getWheelSegmentPalettes();
            const losePalette = getLoseSegmentPalette();

            updateWinnerHighlight(segmentAngle);

            const gradientParts = wheelPrizes.map((item, index) => {
                const palette = item.type === "lose"
                    ? getLoseSegmentPalette()
                    : getWheelSegmentPalettes()[index % getWheelSegmentPalettes().length];

                const startAngle = index * segmentAngle;
                const endAngle = (index + 1) * segmentAngle;

                return `${palette.start} ${startAngle}deg, ${palette.end} ${endAngle}deg`;
            });

            wheel.style.setProperty(
                "--wheel-segments",
                `conic-gradient(from 0deg, ${gradientParts.join(", ")})`
            );

            wheel.innerHTML = wheelPrizes.map((item, index) => {
                const labelAngle = index * segmentAngle + segmentAngle / 2;
                const labelText = item.name;
                const darkClass = shouldUseDarkText(index) ? " is-dark" : "";

                return `
            <div class="lwWheel__label${darkClass}" data-prize-index="${index}" style="transform: rotate(${labelAngle}deg) translateY(var(--lw-label-distance));">
                ${formatWheelLabel(labelText)}
            </div>
        `;
            }).join("");
        }

        function normalizeDegree(angle) {
            return ((angle % 360) + 360) % 360;
        }

        function setWinnerHighlightPosition(prize) {
            if (!winnerHighlight) return;

            const segmentAngle = 360 / wheelPrizes.length;
            const prizeCenterAngle = prize.index * segmentAngle + segmentAngle / 2;
            const visiblePrizeCenterAngle = normalizeDegree(currentRotation + prizeCenterAngle);

            winnerHighlight.style.setProperty(
                "--lw-winner-highlight-rotate",
                `${visiblePrizeCenterAngle}deg`
            );
        }

        function playWinnerHighlight(prize) {
            if (!winnerHighlight) return;

            setWinnerHighlightPosition(prize);

            if (prize.type === "win") {
                playSound(soundWin);
            }

            winnerHighlight.classList.remove("is-active");
            void winnerHighlight.offsetWidth;
            winnerHighlight.classList.add("is-active");
        }

        function playShellJackpot() {
            if (!wheelShell) return;

            wheelShell.classList.remove("is-jackpot");
            void wheelShell.offsetWidth;
            wheelShell.classList.add("is-jackpot");
        }


        const historyRecords = [];

        function formatHistoryDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hour = String(date.getHours()).padStart(2, "0");
            const minute = String(date.getMinutes()).padStart(2, "0");
            const second = String(date.getSeconds()).padStart(2, "0");

            return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        }

        function renderHistoryList() {
            if (!historyRecords.length) {
                historyList.innerHTML = `
                <div class="lwHistoryEmpty">
                    No spin records yet.<br>
                    Spin the wheel to create your first record.
                </div>
            `;
                return;
            }

            historyList.innerHTML = `
            <div class="lwHistoryTable">
                <div class="lwHistoryTable__head">
                    <div>No.</div>
                    <div>Date Time</div>
                    <div>Prize</div>
                </div>

                <div class="lwHistoryTable__body">
                    ${historyRecords.map((record, index) => {
                const recordNo = historyRecords.length - index;

                return `
                            <div class="lwHistoryTable__row">
                                <div class="lwHistoryTable__no">
                                    #${String(recordNo).padStart(2, "0")}
                                </div>

                                <div class="lwHistoryTable__time">
                                    ${record.time}
                                </div>

                                <div class="lwHistoryTable__prize">
                                    ${record.reward}
                                </div>
                            </div>
                        `;
            }).join("")}
                </div>
            </div>
        `;
        }


        function addHistoryItem(prize) {
            historyRecords.unshift({
                time: formatHistoryDate(new Date()),
                reward: prize.name
            });

            renderHistoryList();
        }

        renderWheel();
        renderHistoryList();
        renderSpinChance();

        const winPrizes = wheelPrizes.filter((item) => item.type === "win");
        const losePrize = wheelPrizes.find((item) => item.type === "lose");

        function getPrizeResult() {
            const random = Math.random();

            // rate for Try Again
            if (random < 0.6) {
                return losePrize;
            }

            return winPrizes[Math.floor(Math.random() * winPrizes.length)];
        }

        function getRotationForPrize(prize) {
            const segmentAngle = 360 / wheelPrizes.length;

            /*
              Keep the result away from segment borders.
              Example: if each segment is 45deg, this will stop somewhere between
              2deg and 43deg inside the selected segment.
            */
            const edgeSafeZone = 2;

            const minAngle = prize.index * segmentAngle + edgeSafeZone;
            const maxAngle = (prize.index + 1) * segmentAngle - edgeSafeZone;

            const prizeSafePoint = minAngle + Math.random() * (maxAngle - minAngle);

            return 360 - prizeSafePoint;
        }
        function clearPopupConfetti() {
            if (!popupConfetti) return;
            popupConfetti.innerHTML = "";
        }

        function launchPopupConfetti() {
            if (!popupConfetti) return;

            const colors = [
                "#ffd166",
                "#ff3b5c",
                "#ff006e",
                "var(--lw-text)fff",
                "#4cc9f0",
                "#80ff72",
                "#ff9f1c",
                "#b8f2ff",
                "#a855f7",
                "#00f5d4"
            ];

            const shapes = ["", "is-small", "is-long", "is-wide", "is-strip"];
            const pieces = 82;

            popupConfetti.innerHTML = Array.from({ length: pieces }).map((_, index) => {
                const angle = Math.random() * Math.PI * 2;

                /*
                  Larger burst so the pieces can escape from behind the popup card.
                  X is wider than Y because the card is wide.
                */
                const power = 360 + Math.random() * 520;
                const x = Math.cos(angle) * power;
                const y = Math.sin(angle) * (power * 0.72) - 80;

                const delay = Math.random() * 0.08;
                const duration = 0.72 + Math.random() * 0.42;
                const rotate = (Math.random() > 0.5 ? 1 : -1) * (420 + Math.random() * 900);
                const color = colors[index % colors.length];
                const shape = shapes[Math.floor(Math.random() * shapes.length)];

                return `
                                                    <span
                                                        class="lwPopupConfettiPiece ${shape}"
                                                        style="
                                                            animation-delay: ${delay}s;
                                                            animation-duration: ${duration}s;
                                                            --confetti-x: ${x}px;
                                                            --confetti-y: ${y}px;
                                                            --confetti-rotate: ${rotate}deg;
                                                            --confetti-color: ${color};
                                                        "
                                                    ></span>
                                                `;
            }).join("");

            window.setTimeout(() => {
                clearPopupConfetti();
            }, 1500);
        }
        function renderPopupPrizeVisual(prize, shouldShowVisual) {
            if (!shouldShowVisual) return "";

            if (prize.image) {
                return `
            <div class="lwResult__icon lwResult__icon--image">
                <img src="${escapeHTML(prize.image)}" alt="${escapeHTML(prize.name)}">
            </div>
        `;
            }

            if (prize.icon) {
                return `
            <div class="lwResult__icon">
                ${prize.icon}
            </div>
        `;
            }

            return "";
        }
        function openResultPopup(prize) {
            const isLose = prize.type === "lose";

            popup.classList.remove("is-win", "is-lose");
            popup.classList.add(isLose ? "is-lose" : "is-win");

            popupTitle.textContent = isLose ? "Result" : "You Won";

            popupBody.innerHTML = `
                                                        <div class="lwResult ${isLose ? "lwResult--lose" : "lwResult--win"}">
                                                           ${renderPopupPrizeVisual(prize, isLose)}

                                                            <h3 class="lwResult__title">
                                                                ${isLose ? "Good Luck" : "Congratulations!"}
                                                            </h3>

                                                            <div class="lwResult__reward">
                                                                ${prize.name}
                                                            </div>

                                                            <p class="lwResult__desc">
                                                                ${isLose
                    ? "Try again and your luck may come next."
                    : "Your reward has been selected. Please claim it according to the event rules."
                }
                                                            </p>

                                                            <button class="lwResult__action" type="button" data-close-result>
                                                                ${isLose ? "Close" : "Claim Now"}
                                                            </button>
                                                        </div>
                                                    `;

            popup.classList.add("is-open");
            playSound(isLose ? soundLose : soundPopup);
            clearPopupConfetti();

            if (!isLose) {
                launchPopupConfetti();
            }

            const closeResultBtn = popupBody.querySelector("[data-close-result]");

            closeResultBtn.addEventListener("click", () => {
                popup.classList.remove("is-open", "is-win", "is-lose");
                clearPopupConfetti();
            });
        }
        function stopSound(audio) {
            if (!audio) return;

            audio.pause();
            audio.currentTime = 0;
        }
        function getSpinAllDemoCount() {
            return getAvailableSpinCount();
        }
        function getAvailableSpinCount() {
            const chanceValue = document.querySelector(".lwChance__main strong")?.textContent.trim() || "0";
            const availableCount = Number(chanceValue.replace(/[^\d]/g, ""));

            return Number.isFinite(availableCount) ? availableCount : 0;
        }
        function openInsufficientSpinPopup() {
            popup.classList.remove("is-win");
            popup.classList.add("is-lose");

            popupTitle.textContent = "Notice";

            popupBody.innerHTML = `
                    <div class="lwResult lwResult--lose">
                        <div class="lwResult__icon">
                            ⚠️
                        </div>

                        <h3 class="lwResult__title">
                            Not Enough Spin Chance
                        </h3>

                        <p class="lwResult__desc">
                            You do not have enough spin chance to continue.
                        </p>

                        <button class="lwResult__action" type="button" data-close-result>
                            Close
                        </button>
                    </div>
                `;

            popup.classList.add("is-open");
            playSound(soundLose);
            clearPopupConfetti();

            const closeResultBtn = popupBody.querySelector("[data-close-result]");

            closeResultBtn.addEventListener("click", () => {
                popup.classList.remove("is-open", "is-win", "is-lose");
                clearPopupConfetti();
            });
        }
        function spinAll() {
            if (isSpinning) return;

            const spinCount = getSpinAllDemoCount();

            if (spinCount <= 0) {
                openInsufficientSpinPopup();
                return;
            }

            if (!deductSpinChance(spinCount)) {
                openInsufficientSpinPopup();
                return;
            }

            isSpinning = true;
            setSpinButtonsDisabled(true);

            playSound(soundSpin);

            const results = Array.from({ length: spinCount }).map(() => getPrizeResult());

            const baseSpin = 360 * 3;
            currentRotation = currentRotation + baseSpin;

            wheel.classList.add("is-spin-all");
            wheel.style.transform = `rotate(${currentRotation}deg)`;

            setTimeout(() => {
                results.forEach((prize) => {
                    addHistoryItem(prize);
                });

                playSound(soundWin);
                openSpinAllPopup(results);
            }, 450);

            setTimeout(() => {
                wheel.classList.remove("is-spin-all");

                isSpinning = false;
                setSpinButtonsDisabled(false);
            }, 1250);
        }

        spinAllBtn?.addEventListener("click", spinAll);

        function openSpinAllPopup(results) {
            stopSound(soundSpin);
            popup.classList.remove("is-lose");
            popup.classList.add("is-win");

            popupTitle.textContent = "Spin All Result";

            popupBody.innerHTML = `
                                    <div class="lwResult lwResult--win lwResult--spinAll">
                                        <h3 class="lwResult__title">
                                            Spin Completed
                                        </h3>

                                        <p class="lwResult__desc">
                                            Your spin results are listed below.
                                        </p>

                                        <div class="lwSpinAllList is-revealing" data-spin-all-list>
                                ${results.map((prize, index) => {
                return `
                                        <div
                                            class="lwSpinAllItem ${prize.type === "lose" ? "is-lose" : ""}"
                                            style="--reveal-index: ${index};"
                                        >
                                            <span class="lwSpinAllItem__index">#${String(index + 1).padStart(2, "0")}</span>
                                            <span class="lwSpinAllItem__name">${prize.name}</span>
                                        </div>
                                    `;
            }).join("")}
</div>

                                        <button class="lwResult__action" type="button" data-close-result>
                                            Close
                                        </button>
                                    </div>
                                `;

            popup.classList.add("is-open");
            const spinAllList = popupBody.querySelector("[data-spin-all-list]");

            popupBody.addEventListener("click", (event) => {
                if (event.target.closest("[data-close-result]")) return;
                if (!spinAllList) return;

                spinAllList.classList.remove("is-revealing");
                spinAllList.classList.add("is-revealed");
            }, { once: true });

            clearPopupConfetti();

            const closeResultBtn = popupBody.querySelector("[data-close-result]");

            closeResultBtn.addEventListener("click", () => {
                popup.classList.remove("is-open", "is-win", "is-lose");
                clearPopupConfetti();
            });
        }

        function spinOnce() {
            if (isSpinning) return;

            if (getAvailableSpinCount() <= 0) {
                openInsufficientSpinPopup();
                return;
            }
            if (!deductSpinChance(1)) {
                openInsufficientSpinPopup();
                return;
            }

            isSpinning = true;
            setSpinButtonsDisabled(true);


            playSound(soundSpin);


            const prize = getPrizeResult();

            const baseSpin = 360 * 6;
            const targetRotation = getRotationForPrize(prize);

            const currentAngle = ((currentRotation % 360) + 360) % 360;
            const angleToTarget = (targetRotation - currentAngle + 360) % 360;

            currentRotation = currentRotation + baseSpin + angleToTarget;

            wheel.style.transform = `rotate(${currentRotation}deg)`;

            setTimeout(() => {
                playWinnerHighlight(prize);
                playShellJackpot();

                setTimeout(() => {
                    isSpinning = false;
                    setSpinButtonsDisabled(false);

                    addHistoryItem(prize);
                    openResultPopup(prize);
                }, 850);
            }, 4200);
        }

        centerSpinBtn?.addEventListener("click", spinOnce);
        spinBtn?.addEventListener("click", spinOnce);