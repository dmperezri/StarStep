(function () {
    "use strict";
    if (!window.StarFlow || !window.StarI18n) return;
    if (StarFlow.getCurrentStage() !== "chapter_select") {
        const entry = StarFlow.getEntryPoint();
        const target = !StarFlow.isStageCompleted("lito_welcome") ? "/" : entry.page;
        if (target !== location.pathname) location.replace(target);
        return;
    }
    window.addEventListener("pageshow", event => { if (event.persisted) location.reload(); });

    const translations = {

        es: {
            title: "ELEGÍ TU AVENTURA",
            subtitle: "El universo está lleno de historias por descubrir.",
            chapter1: "CAPÍTULO 01",
            chapter2: "CAPÍTULO 02",
            chapter3: "CAPÍTULO 03",
            available: "● DISPONIBLE",
            description: "Dos mundos, dos historias. Explorá la Luna y Marte y descubrí sus secretos científicos.",
            moon: "I · LUNA",
            mars: "II · MARTE",
            traces: "III · HUELLAS",
            start: "INICIAR CAPÍTULO",
            coming: "PRÓXIMAMENTE",
            locked: "BLOQUEADO",
            lockedDescription: "Una nueva aventura te espera.",
            notice: "ROCK & ROLL seleccionado. La conexión con StarFlow se realizará después de integrar la presentación.",
            preview: "VISTA DE DESARROLLO · NO MODIFICA TU PARTIDA"
        },

        en: {
            title: "CHOOSE YOUR ADVENTURE",
            subtitle: "The universe is full of stories to discover.",
            chapter1: "CHAPTER 01",
            chapter2: "CHAPTER 02",
            chapter3: "CHAPTER 03",
            available: "● AVAILABLE",
            description: "Two worlds, two stories. Explore the Moon and Mars and discover their scientific secrets.",
            moon: "I · MOON",
            mars: "II · MARS",
            traces: "III · TRACES",
            start: "START CHAPTER",
            coming: "COMING SOON",
            locked: "LOCKED",
            lockedDescription: "A new adventure awaits you.",
            notice: "ROCK & ROLL selected. StarFlow integration will follow the introduction sequence.",
            preview: "DEVELOPMENT PREVIEW · DOES NOT MODIFY YOUR SAVE"
        }

    };

    let currentLanguage = StarI18n.lang;

    const notice =
        document.getElementById("chapterNotice");

    function changeLanguage(lang) {

        if (!translations[lang]) {
            return;
        }

        currentLanguage = lang;

        document.documentElement.lang = lang;

        document.querySelectorAll("[data-text]")
            .forEach(element => {

                const key = element.dataset.text;

                element.textContent =
                    translations[lang][key];

            });

        document.querySelectorAll("[data-lang]")
            .forEach(button => {

                const active =
                    button.dataset.lang === lang;

                button.classList.toggle(
                    "active", active
                );

                button.setAttribute(
                    "aria-pressed",
                    String(active)
                );

            });

        if (!notice.hidden) {

            notice.textContent =
                StarI18n.t("flow.notice.locked");

        }

    }

    document.addEventListener("starstep:language", () => changeLanguage(StarI18n.lang));
    const start = document.getElementById("startChapter");
    start.disabled = false;
    start.addEventListener("click", () => {
        const result = StarFlow.recordObjective("chapter_select.chapter1", {source:"chapter_menu"});
        if (result.ok) {
            start.disabled = true;
            location.assign(StarFlow.getEntryPoint().page);
        } else {
            notice.textContent = StarI18n.t("flow.notice.locked");
            notice.hidden = false;
        }
    });

    // FONDO ESPACIAL PIXEL ART

    const canvas =
        document.getElementById("stars");

    const ctx =
        canvas.getContext("2d");

    const stars = Array.from(
        { length: 160 },
        (_, i) => ({
            x: (i * 131 + 17) % 480,
            y: (i * 67 + 31) % 270,
            size: i % 13 === 0 ? 2 : 1
        })
    );

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    function drawStars(time = 0) {

        ctx.fillStyle = "#0E1233";
        ctx.fillRect(0, 0, 480, 270);

        stars.forEach((star, i) => {

            ctx.globalAlpha =
                .45 + .55 *
                ((Math.sin(time * .001 + i) + 1) / 2);

            ctx.fillStyle =
                i % 7 === 0
                    ? "#8FF0D8"
                    : "#FFF8E7";

            ctx.fillRect(
                star.x,
                star.y,
                star.size,
                star.size
            );

        });

        ctx.globalAlpha = 1;

        if (!reducedMotion.matches) {

            requestAnimationFrame(drawStars);

        }

    }

    changeLanguage(StarI18n.lang);
    drawStars();

})();
