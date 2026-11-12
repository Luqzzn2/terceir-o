/* ============================================================
   PLAYER DE VÍDEO: o card do carrossel desliza até o centro, vira de frente e vira o player.
   Uso: window.abreVideo({ v: {arquivo|youtube, titulo}, card, asp }) — o carrossel de Vídeos (script.js) chama.
   Avisa a música de fundo com os eventos "video-abriu" / "video-fechou".
   ============================================================ */
(() => {
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mk = (tag, cls, props) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, props || {});
  let ov = null;
  window.abreVideo = ({ v, card, asp }) => {
    if (ov) return; dispatchEvent(new Event("video-abriu"));
    const r = card.getBoundingClientRect(); asp = asp || 9 / 16;
    ov = mk("div", "vp"); const caixa = mk("div", "vp-caixa");
    const x = mk("button", "vp-x", { type: "button", ariaLabel: "Fechar vídeo", textContent: "✕" });
    const tit = mk("div", "vp-tit", { textContent: v.titulo || "" });
    let media;
    if (v.youtube) media = mk("iframe", "vp-media", { sandbox: "allow-scripts allow-same-origin allow-presentation", referrerPolicy: "no-referrer", src: "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.youtube) + "?autoplay=1", allow: "autoplay; fullscreen", allowFullscreen: true });
    else media = mk("video", "vp-media", { src: v.arquivo, controls: true, playsInline: true, preload: "auto" });
    caixa.append(media); ov.append(caixa, x, tit); document.body.append(ov);
      const vw = innerWidth, vh = innerHeight, maxW = vw * 0.94, maxH = vh * 0.78;
      let w = maxH * asp, h = maxH; if (w > maxW) { w = maxW; h = w / asp; }
      const alvoR = { left: (vw - w) / 2, top: (vh - h) / 2 - 10, width: w, height: h };
      const ini = { left: r.left, top: r.top, width: r.width, height: r.height };
      const dur = calmo ? 1 : 1100, ease = "cubic-bezier(.65,0,.15,1)";
      Object.assign(caixa.style, { left: alvoR.left + "px", top: alvoR.top + "px", width: alvoR.width + "px", height: alvoR.height + "px" });
      const fx = ini.width / alvoR.width, fy = ini.height / alvoR.height, tx = ini.left + ini.width / 2 - (alvoR.left + alvoR.width / 2), ty = ini.top + ini.height / 2 - (alvoR.top + alvoR.height / 2);
      ov.animate([{ background: "rgba(2,4,24,0)" }, { background: "rgba(2,4,24,.93)" }], { duration: dur, easing: "ease", fill: "forwards" });
      media.style.opacity = 0;
      card.style.visibility = "hidden";
      const anim = caixa.animate([
        { transform: "translate(" + tx + "px," + ty + "px) scale(" + fx + "," + fy + ") perspective(900px) rotateY(-30deg)", borderRadius: "3px" },
        { transform: "translate(0,0) scale(1,1) perspective(900px) rotateY(0deg)", borderRadius: "10px" },
      ], { duration: dur, easing: ease, fill: "forwards" });
      const mostra = () => { media.animate([{ opacity: 0 }, { opacity: 1 }], { duration: calmo ? 1 : 500, fill: "forwards" }); x.classList.add("ver"); tit.classList.add("ver"); if (media.play) media.play().catch(() => {}); };
      anim.onfinish = mostra;
      const fecha = () => {
        if (!ov) return; const o = ov, cx = caixa; ov = null; card.style.pointerEvents = ""; removeEventListener("keydown", tecla); dispatchEvent(new Event("video-fechou"));
        if (media.pause) media.pause();
        x.classList.remove("ver"); tit.classList.remove("ver"); media.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
        // o card pode ter se movido: volta para onde ele está agora
        const r2 = card.getBoundingClientRect();
        const tx2 = r2.left + r2.width / 2 - (alvoR.left + alvoR.width / 2), ty2 = r2.top + r2.height / 2 - (alvoR.top + alvoR.height / 2);
        o.animate([{ background: "rgba(2,4,24,.93)" }, { background: "rgba(2,4,24,0)" }], { duration: dur, easing: "ease", fill: "forwards" });
        const volta = cx.animate([
          { transform: "translate(0,0) scale(1,1) perspective(900px) rotateY(0deg)", borderRadius: "10px" },
          { transform: "translate(" + tx2 + "px," + ty2 + "px) scale(" + r2.width / alvoR.width + "," + r2.height / alvoR.height + ") perspective(900px) rotateY(-30deg)", borderRadius: "3px" },
        ], { duration: dur, easing: ease, fill: "forwards" });
        volta.onfinish = () => { card.style.visibility = ""; o.remove(); };
      };
      const tecla = (e) => { if (e.key === "Escape") fecha(); };
      addEventListener("keydown", tecla);
      x.addEventListener("click", fecha); ov.addEventListener("click", (e) => { if (e.target === ov) fecha(); });
  };
})();
