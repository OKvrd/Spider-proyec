document.addEventListener("DOMContentLoaded", () => {
    const loaderWrapper = document.getElementById("loader-wrapper");
    const spiderRunner = document.getElementById("spider-runner");
    const progressPercent = document.getElementById("progress-percent");
    const spiderTrackContainer = document.getElementById("spider-track-container");
    const loadingInfo = document.getElementById("loading-info");
    
    const interactivePrompt = document.getElementById("interactive-prompt");
    const dynamicText = document.getElementById("dynamic-text");
    const actionBtn = document.getElementById("action-btn");
    
    const mainContent = document.getElementById("main-content");
    const tutorialBtn = document.getElementById("tutorial-btn");
    const tutorialSection = document.getElementById("tutorial-section");
    const startBuildingBtn = document.getElementById("start-building-btn");
    const buildingSection = document.getElementById("building-section");
    const finishProjectBtn = document.getElementById("finish-project-btn");
    
    const optionsSection = document.getElementById("options-section");
    const playGameBtn = document.getElementById("play-game-btn");
    const exitBtn = document.getElementById("exit-btn");

    // Elementos del Minijuego
    const gameSection = document.getElementById("game-section");
    const gameBoard = document.getElementById("game-board");
    const gameSpider = document.getElementById("game-spider");
    const hudScore = document.getElementById("hud-score");
    const hudTime = document.getElementById("hud-time");
    const hudRecord = document.getElementById("hud-record");
    const gameOverScreen = document.getElementById("game-over-screen");
    const finalScoreText = document.getElementById("final-score-text");
    const restartGameBtn = document.getElementById("restart-game-btn");
    const backToMenuBtn = document.getElementById("back-to-menu-btn");

    let progress = 0;

    const flyImages = [
        "https://i.postimg.cc/HccJKw3R/Whats-App-Image-2026-11-17-at-9-04-21-PM-2.jpg",
        "https://i.postimg.cc/cggKjRXN/Whats-App-Image-2026-11-17-at-9-04-22-PM.jpg",
        "https://i.postimg.cc/MMMc47dJ/Whats-App-Image-2026-11-17-at-9-04-22-PM-1.jpg",
        "https://i.postimg.cc/2bbqJQ2R/Whats-App-Image-2026-11-17-at-9-04-22-PM-2.jpg"
    ];

    let score = 0;
    let secondsElapsed = 0;
    let highScore = localStorage.getItem("spider_highscore") || 0;
    let gameInterval = null;
    let spawnTimeout = null;
    let activeFlies = [];
    let spiderX = window.innerWidth / 2;
    let isPlaying = false;

    hudRecord.textContent = `Récord: ${highScore}`;

    // Pantalla de carga
    const loadingInterval = setInterval(() => {
        const increment = Math.floor(Math.random() * 3) + 1;
        progress += increment;

        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(showWelcomeSequence, 400);
        }

        spiderRunner.style.left = `${progress}%`;
        progressPercent.textContent = `${progress}%`;
    }, 80);

    function showWelcomeSequence() {
        spiderTrackContainer.style.opacity = "0";
        loadingInfo.style.opacity = "0";

        setTimeout(() => {
            spiderTrackContainer.style.display = "none";
            loadingInfo.style.display = "none";

            interactivePrompt.classList.remove("prompt-hidden");
            interactivePrompt.classList.add("prompt-visible");

            setTimeout(() => {
                dynamicText.style.opacity = "0";
                dynamicText.style.transform = "translateY(-8px)";

                setTimeout(() => {
                    dynamicText.textContent = "¿Quieres saber de qué va nuestro proyecto?";
                    dynamicText.style.opacity = "1";
                    dynamicText.style.transform = "translateY(0)";
                    actionBtn.classList.remove("btn-hidden");
                }, 400);
            }, 2200);

        }, 450);
    }

    actionBtn.addEventListener("click", () => {
        loaderWrapper.classList.add("fade-out");
        mainContent.classList.remove("hidden");
        setTimeout(() => { loaderWrapper.style.display = "none"; }, 800);
    });

    tutorialBtn.addEventListener("click", () => {
        mainContent.classList.add("hidden");
        tutorialSection.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    startBuildingBtn.addEventListener("click", () => {
        tutorialSection.classList.add("hidden");
        buildingSection.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    finishProjectBtn.addEventListener("click", () => {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
        });

        setTimeout(() => {
            buildingSection.classList.add("hidden");
            optionsSection.classList.remove("hidden");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 1000);
    });

    exitBtn.addEventListener("click", () => {
        alert("¡Gracias por visitar el proyecto de la Araña Robot!");
    });

    playGameBtn.addEventListener("click", () => {
        optionsSection.classList.add("hidden");
        gameSection.classList.remove("hidden");
        startMiniGame();
    });

    // --- LÓGICA DEL MINIJUEGO (JUSTO Y CON GAME OVER AL DEJAR PASAR 1 MOSCA) ---
    function startMiniGame() {
        score = 0;
        secondsElapsed = 0;
        isPlaying = true;
        hudScore.textContent = `Puntos: ${score}`;
        hudTime.textContent = `Tiempo: ${secondsElapsed}s`;
        gameOverScreen.classList.add("hidden");
        
        document.querySelectorAll(".falling-fly").forEach(f => f.remove());
        activeFlies = [];

        // Cronómetro de tiempo transcurrido
        const timerInterval = setInterval(() => {
            if (!isPlaying) {
                clearInterval(timerInterval);
                return;
            }
            secondsElapsed++;
            hudTime.textContent = `Tiempo: ${secondsElapsed}s`;
        }, 1000);

        // Generador de moscas con velocidad amigable y justa
        function scheduleSpawn() {
            if (!isPlaying) return;
            spawnFly();
            // Intervalo más cómodo para atraparlas (entre 1.5 y 2.2 segundos)
            let nextSpawn = 1500 + Math.random() * 700;
            spawnTimeout = setTimeout(scheduleSpawn, nextSpawn);
        }
        scheduleSpawn();

        gameInterval = requestAnimationFrame(updateGame);
    }

    function spawnFly() {
        if (!isPlaying) return;
        const fly = document.createElement("div");
        fly.className = "falling-fly";
        
        const randomImg = flyImages[Math.floor(Math.random() * flyImages.length)];
        fly.innerHTML = `<img src="${randomImg}" alt="Mosca">`;

        const maxX = gameBoard.clientWidth - 50;
        const startX = Math.random() * maxX;
        fly.style.left = `${startX}px`;
        
        // Velocidad constante, moderada y fácil de seguir
        let speed = 2.2 + (Math.random() * 0.8);
        
        gameBoard.appendChild(fly);
        activeFlies.push({ element: fly, x: startX, y: -50, speed: speed });
    }

    function updateGame() {
        if (!isPlaying) return;

        gameSpider.style.left = `${spiderX}px`;
        let spiderRect = gameSpider.getBoundingClientRect();

        for (let i = activeFlies.length - 1; i >= 0; i--) {
            let f = activeFlies[i];
            f.y += f.speed;
            f.element.style.top = `${f.y}px`;

            let flyRect = f.element.getBoundingClientRect();

            // Colisión (Atrapada con éxito)
            if (
                flyRect.left < spiderRect.right &&
                flyRect.right > spiderRect.left &&
                flyRect.top < spiderRect.bottom &&
                flyRect.bottom > spiderRect.top
            ) {
                score++;
                hudScore.textContent = `Puntos: ${score}`;
                f.element.remove();
                activeFlies.splice(i, 1);
                continue;
            }

            // Si la mosca toca el fondo (GAME OVER inmediato)
            if (f.y > window.innerHeight) {
                f.element.remove();
                activeFlies.splice(i, 1);
                endGame();
                return;
            }
        }

        gameInterval = requestAnimationFrame(updateGame);
    }

    function handleMove(clientX) {
        let boardRect = gameBoard.getBoundingClientRect();
        let x = clientX - boardRect.left;
        if (x < 35) x = 35;
        if (x > boardRect.width - 35) x = boardRect.width - 35;
        spiderX = x;
    }

    gameBoard.addEventListener("mousemove", (e) => {
        if (isPlaying) handleMove(e.clientX);
    });

    gameBoard.addEventListener("touchmove", (e) => {
        if (isPlaying && e.touches.length > 0) {
            handleMove(e.touches[0].clientX);
        }
    }, { passive: true });

    function endGame() {
        isPlaying = false;
        cancelAnimationFrame(gameInterval);
        clearTimeout(spawnTimeout);
        document.querySelectorAll(".falling-fly").forEach(f => f.remove());

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("spider_highscore", highScore);
            hudRecord.textContent = `Récord: ${highScore}`;
            finalScoreText.textContent = `¡Nuevo Récord! Atrapaste ${score} moscas 🕷️`;
        } else {
            finalScoreText.textContent = `Atrapaste ${score} moscas antes de dejar escapar una.`;
        }

        gameOverScreen.classList.remove("hidden");
    }

    restartGameBtn.addEventListener("click", () => {
        startMiniGame();
    });

    backToMenuBtn.addEventListener("click", () => {
        gameSection.classList.add("hidden");
        optionsSection.classList.remove("hidden");
    });
});
