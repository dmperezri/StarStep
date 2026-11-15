(function () {
    "use strict";
    if (!window.StarFlow || !window.StarI18n) return;
    if (!StarFlow.canEnter("chapter_select")) {
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
            description: "Dos mundos, dos historias: las huellas del pasado. Conviértete en detective de rocas junto a Lito y explora los descubrimientos de Apollo 11 y Opportunity.",
            moon: "I · LUNA",
            mars: "II · MARTE",
            traces: "III · HUELLAS",
            start: "INICIAR CAPÍTULO",
            coming: "PRÓXIMAMENTE",
            future2: "RUEDAS Y POLVO",
            future3: "SEÑALES LEJANAS",
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
            description: "Two worlds, two stories: traces of the past. Become a rock detective with Lito and explore the discoveries of Apollo 11 and Opportunity.",
            moon: "I · MOON",
            mars: "II · MARS",
            traces: "III · TRACES",
            start: "START CHAPTER",
            coming: "COMING SOON",
            future2: "WHEELS & DUST",
            future3: "DISTANT SIGNALS",
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

    const selected=StarFlow.isStageCompleted("chapter_select");
    const finished=StarFlow.getEntryPoint().stage===null;

    function stateLabels(){
        const es=StarI18n.lang==="es";

        if(selected){
            start.textContent=finished
                ? (es?"VER PROGRESO":"VIEW PROGRESS")
                : (es?"CONTINUAR CAPÍTULO":"CONTINUE CHAPTER");

            const status=document.querySelector(
                ".chapter.available .status"
            );

            if(status) status.textContent=finished
                ? (es?"COMPLETADO":"COMPLETED")
                : (es?"EN PROGRESO":"IN PROGRESS");
        }

        const bar=document.getElementById("chapterProgress");

        if(bar){
            const exclude=[
                "lito_welcome","profile",
                "cadet_custom","chapter_select"
            ];

            const stages=StarFlow.getAvailableStages()
                .filter(s=>s.implemented&&!exclude.includes(s.id));

            const objectives=stages
                .flatMap(s=>StarFlow.getObjectives(s.id).objectives||[])
                .filter(o=>o.implemented);

            bar.value=objectives.filter(o=>o.done).length
                /Math.max(1,objectives.length);

            bar.setAttribute("aria-label",
                es?"Progreso del capítulo":"Chapter progress"
            );
        }
    }

    document.addEventListener("starstep:language",stateLabels);
    start.addEventListener("click", () => {
        if(selected){
            location.assign(StarFlow.getEntryPoint().page);
            return;
        }
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

        if(window.StarPlanets){
            StarPlanets.draw(ctx,"moon",39,55,20,time/1000);
            StarPlanets.draw(ctx,"mars",438,202,28,time/1000);
        }

        if (!reducedMotion.matches) {

            requestAnimationFrame(drawStars);

        }

    }

    changeLanguage(StarI18n.lang);
    stateLabels();


    const gallery = document.getElementById("chapterGallery");

    if (gallery) {

        const photos = [
            {
                src: "/static/assets/nasa/apollo-footprint.webp",
                title: "Apollo 11",
                world: "moon"
            },
            {
                src: "/static/assets/nasa/opportunity-eagle.webp",
                title: "Opportunity",
                world: "mars"
            }
        ];

        gallery.replaceChildren();
        gallery.classList.add("ss-photo-gallery");

        const heading = document.createElement("div");
        heading.className = "ss-photo-heading";

        const title = document.createElement("span");
        const counter = document.createElement("small");

        heading.append(title, counter);
        gallery.append(heading);

        const thumbnails = document.createElement("div");
        thumbnails.className = "ss-photo-grid";
        gallery.append(thumbnails);

        // Visor ampliado independiente del selector.

        const viewer = document.createElement("dialog");
        viewer.className = "ss-photo-viewer";
        viewer.setAttribute("aria-labelledby", "ssPhotoTitle");

        viewer.innerHTML = `
            <div class="ss-photo-viewer-header">
                <strong id="ssPhotoTitle"></strong>
                <button type="button"
                        class="ss-photo-close">✕</button>
            </div>
            <img alt="">
            <p class="ss-photo-credit">NASA</p>
        `;

        document.body.append(viewer);

        const close = viewer.querySelector(".ss-photo-close");
        const image = viewer.querySelector("img");
        const caption = viewer.querySelector("strong");

        close.addEventListener("click", () => viewer.close());

        viewer.addEventListener("click", event => {
            if (event.target === viewer) {
                const r = viewer.getBoundingClientRect();

                if (event.clientX < r.left ||
                    event.clientX > r.right ||
                    event.clientY < r.top ||
                    event.clientY > r.bottom) {
                    viewer.close();
                }
            }
        });

        photos.forEach(photo => {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "ss-photo-frame " + photo.world;

            const thumb = document.createElement("img");
            thumb.src = photo.src;
            thumb.alt = photo.title;
            thumb.loading = "lazy";

            const name = document.createElement("span");
            name.textContent = photo.title;

            button.append(thumb, name);

            button.addEventListener("click", () => {
                image.src = photo.src;
                image.alt = photo.title;
                caption.textContent = photo.title;
                viewer.showModal();
            });

            thumbnails.append(button);
        });

        function translateGallery() {
            const es = StarI18n.lang === "es";

            title.textContent = es
                ? "ARCHIVO FOTOGRÁFICO"
                : "PHOTO ARCHIVE";

            counter.textContent = es
                ? "2 fotografías"
                : "2 photographs";

            close.setAttribute("aria-label",
                es ? "Cerrar fotografía" : "Close photograph"
            );
        }

        document.addEventListener(
            "starstep:language",
            translateGallery
        );

        translateGallery();
    }

    drawStars();

})();
