
"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const tr = (es,en) =>
        window.StarI18n?.lang === "en" ? en : es;

    let current = null;
    let spoken = "";
    let timer = 0;
    let interacted = false;
    let voiceOwned = false;

    const visible = el =>
        el && !el.closest("[hidden]") &&
        el.getClientRects().length > 0;

    function speak(text, manual=false) {

        const audio = window.StarSound;

        if (!text || !audio || document.hidden) return;

        if (document.querySelector(
            ".ss-mars-departure[open]"
        )) return;

        if (manual) {
            audio.init?.();
            if (!audio.voiceOn) audio.setVoice?.(true);
        }

        if (!audio.voiceOn || (!interacted && !manual))
            return;

        if (!manual && spoken === text) return;

        if (!manual &&
            window.speechSynthesis?.speaking &&
            !voiceOwned) return;

        spoken = text;
        voiceOwned = true;

        audio.speak?.(text, {
            lito:true,
            onEnd:()=>{voiceOwned=false;}
        });
    }

    function activePanel() {

        if (document.querySelector(
            ".cine-host:not([hidden])," +
            ".ss-mars-departure[open]"
        )) return null;

        const nodes = [...document.querySelectorAll(
            ".mg:not([hidden]) .mg-panel," +
            ".enigma:not([hidden]) .enigma-panel"
        )].filter(p =>
            visible(p) && !p.closest("#creditsDialog")
            && !p.closest("[data-instrument-map]")
        );

        return nodes.at(-1) || null;
    }

    function message(panel) {

        if (!panel) return "";

        const candidates = [
            ".enigma-feedback",
            ".mg-feedback",
            ".mars-storm-guide",
            ".enigma-question",
            ".mg-text"
        ];

        for (const selector of candidates) {

            const e = panel.querySelector(selector);

            if (visible(e) && e.textContent.trim())
                return e.textContent.trim();
        }

        return "";
    }

    function prepareGuide() {

        const panel = activePanel();

        if (panel !== current) {
            current = panel;
            spoken = "";
        }

        if (!panel) return;

        let guide = panel.querySelector(".ss-final-lito");

        if (!guide) {

            guide = document.createElement("div");
            guide.className = "ss-final-lito";

            guide.innerHTML = `
                <canvas width="64" height="64"
                        aria-hidden="true"></canvas>
                <div>
                    <strong>LITO</strong>
                    <span></span>
                </div>
                <button type="button">▶</button>
            `;

            const title = panel.querySelector(
                ".mg-title,.enigma-head"
            );

            if (title) title.after(guide);
            else panel.prepend(guide);

            const canvas = guide.querySelector("canvas");
            const ctx = canvas.getContext("2d");

            ctx.fillStyle="#262C66";
            ctx.fillRect(0,0,64,64);
            ctx.imageSmoothingEnabled=false;

            const world = document.body.classList
                .contains("mars-page") ? "mars" : "moon";

            window.StarArt?.lito?.(
                ctx,32,31,0,world,"happy"
            );

            const button = guide.querySelector("button");

            button.addEventListener("click",()=>{
                interacted=true;
                speak(message(panel),true);
            });
        }

        const text = message(panel);

        const caption = guide.querySelector("span");

        const label = tr(
            "Tu compañero de misión",
            "Your mission companion"
        );

        if (caption.textContent !== label)
            caption.textContent=label;

        guide.querySelector("button").setAttribute(
            "aria-label",
            tr("Escuchar a Lito","Listen to Lito")
        );

        // No narrar constantemente los indicadores
        // numericos ni cada movimiento del rover.

        if (text && text !== spoken)
            speak(text);
    }

    function schedule() {
        clearTimeout(timer);
        timer=setTimeout(prepareGuide,180);
    }

    document.addEventListener("pointerdown",()=>{
        interacted=true;
    },{once:true});

    document.addEventListener("keydown",()=>{
        interacted=true;
    },{once:true});

    const observer = new MutationObserver(schedule);

    observer.observe(document.body,{
        childList:true,
        characterData:true,
        subtree:true,
        attributes:true,
        attributeFilter:["hidden"]
    });

    document.addEventListener("starstep:language",()=>{
        spoken="";
        schedule();
    });

    document.addEventListener("visibilitychange",()=>{
        if(document.hidden && voiceOwned){
            window.StarSound?.stopVoice?.();
            voiceOwned=false;
        }
    });

    window.addEventListener("pagehide",()=>{
        observer.disconnect();
        clearTimeout(timer);
        if(voiceOwned) window.StarSound?.stopVoice?.();
    });

    // Fotografias originales ampliables.

    const viewer=document.createElement("dialog");
    viewer.className="ss-final-photo-viewer";

    viewer.innerHTML=`
        <header>
            <strong>NASA</strong>
            <button type="button">✕</button>
        </header>
        <img alt="">
        <p></p>
    `;

    document.body.append(viewer);

    viewer.querySelector("button").onclick=()=>{
        viewer.close();
    };

    function openPhoto(image) {

        const source=image.closest(
            ".evidence-photo,.science-card,.sci-photo"
        );

        if(!source || viewer.open) return;

        const display=viewer.querySelector("img");
        display.src=image.currentSrc||image.src;
        display.alt=image.alt;

        viewer.querySelector("p").textContent=
            source.querySelector(
                "figcaption,small"
            )?.textContent||image.alt||"NASA";

        viewer.querySelector("button").setAttribute(
            "aria-label",
            tr("Cerrar fotografía","Close photograph")
        );

        viewer.showModal();
    }

    document.addEventListener("click",event=>{

        const target=event.target.closest?.(
            ".evidence-photo img,.science-card img,.sci-photo img"
        );

        if(target) openPhoto(target);
    });

    viewer.addEventListener("click",event=>{
        if(event.target===viewer){

            const r=viewer.getBoundingClientRect();

            if(event.clientX<r.left ||
               event.clientX>r.right ||
               event.clientY<r.top ||
               event.clientY>r.bottom)
                viewer.close();
        }
    });

    // Recuperar salida automatica si la partida se
    // interrumpio al completar el laboratorio.

    if(document.body.classList.contains("moon-page")){

        const departure=window.StarMarsDeparture;

        if(departure?.ready?.()){

            setTimeout(()=>{
                if(departure.ready())
                    departure.start();
            },900);
        }
    }

    schedule();
});
