(() => {
  const C = window.CONFIG;
  const $ = (s) => document.querySelector(s);
  // Cria elemento sem innerHTML: texto vindo do banco nunca vira HTML.
  const el = (tag, props = {}, ...kids) => {
    const n = Object.assign(document.createElement(tag), props);
    kids.flat().forEach((k) => n.append(k));
    return n;
  };
  const empty = (txt) =>
    el("div", { className: "empty" }, el("img", { src: "assets/img/garras.png", alt: "" }), el("p", { textContent: txt }));

  /* ---------- textos da config ---------- */
  $("#ano-f").textContent = C.ano;

  /* ---------- abas ---------- */
  // sem momentos na config, a aba some
  if (!C.momentos.length) document.querySelectorAll('a[href="#momentos"], #momentos').forEach((n) => n.remove());
  const panels = [...document.querySelectorAll(".panel")];
  const links = [...document.querySelectorAll("#tabs a")];
  function showTab() {
    const id = panels.some((p) => p.id === location.hash.slice(1)) ? location.hash.slice(1) : "inicio";
    panels.forEach((p) => (p.hidden = p.id !== id));
    document.body.dataset.tab = id;
    $(".bgvideo")?.play().catch(() => {});
    links.forEach((a) => (a.getAttribute("href") === "#" + id ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    // espera o navegador terminar o scroll nativo da âncora (#id) e volta ao topo
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
  }
  addEventListener("hashchange", showTab);
  addEventListener("load", () => requestAnimationFrame(() => scrollTo(0, 0)));
  showTab();

  /* ---------- contagem regressiva ---------- */
  const alvo = new Date(C.formatura).getTime();
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    const falta = alvo - Date.now();
    if (isNaN(alvo)) return;
    if (falta <= 0) {
      $("#countdown").replaceChildren(el("p", { className: "count-done", textContent: "Somos formados! Obrigado por tudo, Terceirão." }));
      return clearInterval(timer);
    }
    const s = Math.floor(falta / 1000);
    $("#cd-d").textContent = pad(Math.floor(s / 86400));
    $("#cd-h").textContent = pad(Math.floor((s % 86400) / 3600));
    $("#cd-m").textContent = pad(Math.floor((s % 3600) / 60));
    const seg = $("#cd-s");
    seg.textContent = pad(s % 60);
    seg.classList.remove("pulso"); void seg.offsetWidth; seg.classList.add("pulso");
  }
  const timer = setInterval(tick, 1000);
  tick();

  /* ---------- alunos ---------- */
  /* ---------- fotos + lightbox (serve à aba Fotos e à da Madrinha) ---------- */
  const lb = $("#lightbox");
  let fotosAtuais = [], atual = 0;
  const abrir = async (i, de) => {
    atual = (i + fotosAtuais.length) % fotosAtuais.length;
    const im = $("#lb-img"), cap = $("#lb-cap");
    im.src = fotosAtuais[atual].src; im.alt = cap.textContent = fotosAtuais[atual].legenda || "";
    try { await im.decode(); } catch (_) {}
    const primeira = !lb.open; if (primeira) lb.showModal();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dur = 650, ease = "cubic-bezier(.16,1,.3,1)";
    if (primeira) lb.animate([{ backgroundColor: "rgba(4,2,28,0)" }, { backgroundColor: "rgba(4,2,28,0)" }], { duration: 1 });
    if (de && primeira) {
      const r = im.getBoundingClientRect(), fx = de.width / r.width, fy = de.height / r.height;
      im.animate([{ transformOrigin: "center", transform: "translate(" + (de.left + de.width / 2 - r.left - r.width / 2) + "px," + (de.top + de.height / 2 - r.top - r.height / 2) + "px) scale(" + fx + "," + fy + ")", opacity: 0.2 }, { transform: "none", opacity: 1 }], { duration: dur, easing: ease });
    } else im.animate([{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }], { duration: 450, easing: ease });
    if (primeira) { const f = lb.querySelector("figcaption"); if (f) f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: "ease" }); }
  };
  const galeria = (box, lista, vazio) => {
    if (!lista.length) box.append(empty(vazio));
    lista.forEach((f, i) =>
      box.append(el("button", { className: "foto", onclick: () => { fotosAtuais = lista; abrir(i); }, ariaLabel: f.legenda || "Abrir foto" },
        el("img", { src: f.src, alt: f.legenda || "", loading: "lazy" }),
        f.legenda ? el("span", { className: "leg", textContent: f.legenda }) : ""))
    );
  };
  /* ---------- fotos: carrossel circular 3D (arraste, gire, toque na da frente para ampliar) ---------- */
  const carrossel = (box, lista, vazio = "Em breve: as fotos da turma vão aparecer aqui.") => {
    const n = lista.length;
    if (!n) return box.append(empty(vazio));
    const calmoC = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const passo = 360 / n, P = 1100, cw = 360, ch = 480, gap = 30;
    const R = Math.max(((cw + gap) / (2 * Math.sin(Math.PI / Math.max(n, 3)))), cw * 0.6);
    const stage = el("div", { className: "cc-stage" }), cam = el("div", { className: "cc-camera" }), ring = el("div", { className: "cc-ring" });
    const cap = el("div", { className: "cc-cap" }), tit = el("span", { className: "cc-tit" }), cnt = el("span", { className: "cc-cnt" });
    cap.append(tit, cnt);
    const cards = lista.map((f, i) => {
      const c = el("div", { className: "cc-card", role: "group", ariaLabel: (f.legenda || "Foto " + (i + 1)) + ", " + (i + 1) + " de " + n },
        f.v ? el("video", { className: "cc-m", src: f.src + "#t=0.1", muted: true, preload: "metadata", playsInline: true, draggable: false })
          : el("img", { className: "cc-m", src: f.src, alt: f.legenda || "", draggable: false }), el("i", { className: "cc-sombra" }));
      c.dataset.i = i; ring.append(c); return c;
    });
    cam.append(ring); stage.append(cam); box.replaceChildren(stage, cap);
    const S = { a: 0, v: 0, alvo: null, dir: -1, hover: false, drag: null, seguro: 0, fit: 1, t0: 0, ult: 0, raf: 0, ativo: -1, prox: 0, visivel: false, clique: false };
    const volta = (d) => ((((d + 180) % 360) + 360) % 360) - 180, sai = (x) => 1 - Math.pow(1 - x, 5);
    const mede = () => {
      const w = box.clientWidth; if (!w) return;
      S.fit = Math.min(1.1, Math.max(0.8, w / 900)); stage.style.perspective = P + "px"; stage.style.setProperty("--fit", S.fit);
    };
    new ResizeObserver(mede).observe(box); mede();
    const desenha = (now) => {
      const el_ = S.t0 ? now - S.t0 : 0;
      cam.style.transform = "translate3d(0,0," + -R + "px) rotateX(-6deg)"; ring.style.transform = "rotateY(" + S.a + "deg)";
      cards.forEach((c, i) => {
        const base = i * passo, w = volta(base + S.a), face = Math.cos((w * Math.PI) / 180);
        const p = calmoC ? 1 : sai(Math.min(1, Math.max(0, (el_ - (Math.abs(w) / 180) * 520) / 950)));
        c.style.transform = "rotateY(" + base + "deg) translateZ(" + R + "px) translateY(" + (1 - p) * 520 + "px)";
        c.style.setProperty("--d", (0.55 * Math.pow((1 - face) / 2, 1.25)).toFixed(3));
        c.style.opacity = p;
      });
      const k = (((Math.round(-S.a / passo) % n) + n) % n) || 0;
      if (k !== S.ativo) { S.ativo = k; tit.textContent = lista[k].legenda || "Terceirão"; cnt.textContent = String(k + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0"); }
    };
    const perto = (a) => Math.round(a / passo) * passo;
    const quadroC = (now) => {
      S.raf = 0; const dt = S.ult ? Math.min((now - S.ult) / 1000, 0.05) : 1 / 60; S.ult = now;
      const pausa = (S.hover && !S.drag) || S.drag || now < S.seguro, intro = S.t0 && now - S.t0 < 1500;
      const cruzeiro = 0;
      if (!calmoC && !pausa && !intro && S.alvo === null && Math.abs(S.v) < 9 && now >= S.prox) { S.alvo = perto(S.a) + S.dir * passo; S.prox = now + 3200; }
      if (!S.drag) {
        if (S.alvo !== null) { S.a += (S.alvo - S.a) * (1 - Math.exp(-dt * 4.2)); if (Math.abs(S.alvo - S.a) < 0.03) { S.a = S.alvo; S.alvo = null; S.v = 0; } }
        else { S.v += (cruzeiro - S.v) * (1 - Math.exp(-dt / 0.9)); S.a += S.v * dt; if (cruzeiro === 0 && !intro && Math.abs(S.v) < 9) S.alvo = perto(S.a); }
      }
      desenha(now);
      if (S.visivel && !document.hidden) S.raf = requestAnimationFrame(quadroC); else S.ult = 0;
    };
    const acorda = () => { if (!S.raf && S.visivel && !document.hidden) S.raf = requestAnimationFrame(quadroC); };
    new IntersectionObserver(([e]) => { S.visivel = e.isIntersecting; if (S.visivel && !S.t0) S.t0 = performance.now(); S.prox = S.t0 + 3800; acorda(); }).observe(box);
    document.addEventListener("visibilitychange", acorda);
    const foca = (i) => { let alvo = -i * passo; alvo += 360 * Math.round((S.a - alvo) / 360); S.alvo = alvo; S.seguro = performance.now() + 2800; acorda(); };
    box.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { S.hover = true; acorda(); } });
    box.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { S.hover = false; acorda(); } });
    box.addEventListener("pointerdown", (e) => { if (e.button === 0) S.drag = { id: e.pointerId, x: e.clientX, a: S.a, mov: false, am: [[performance.now(), S.a]] }; });
    box.addEventListener("pointermove", (e) => {
      const d = S.drag; if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x;
      if (!d.mov) { if (Math.abs(dx) < 6) return; d.mov = true; S.alvo = null; S.v = 0; try { box.setPointerCapture(e.pointerId); } catch (_) {} box.classList.add("arrastando"); }
      S.a = d.a + (dx * 180) / (Math.PI * R * S.fit);
      const t = performance.now(); d.am.push([t, S.a]); while (d.am.length > 2 && t - d.am[0][0] > 110) d.am.shift();
      acorda();
    });
    const solta = (e) => {
      const d = S.drag; if (!d || d.id !== e.pointerId) return; S.drag = null; box.classList.remove("arrastando");
      if (!d.mov) return; S.clique = true;
      const f = d.am[0], l = d.am[d.am.length - 1], dt = (l[0] - f[0]) / 1000;
      S.v = dt > 0.008 ? Math.max(-1400, Math.min(1400, (l[1] - f[1]) / dt)) : 0; if (Math.abs(S.v) > 60) S.dir = Math.sign(S.v);
      acorda();
    };
    box.addEventListener("pointerup", solta); box.addEventListener("pointercancel", solta);
    box.addEventListener("click", (e) => {
      if (S.clique) { S.clique = false; return; }
      const c = e.target.closest(".cc-card"); if (!c) return;
      const i = +c.dataset.i, m = c.querySelector(".cc-m");
      const abreItem = () => { if (lista[i].v) window.abreVideo({ v: lista[i].v, card: m, asp: m.videoWidth && m.videoHeight ? m.videoWidth / m.videoHeight : 9 / 16 }); else { fotosAtuais = lista; abrir(i, m.getBoundingClientRect()); } };
      if (i === S.ativo && !S.alvo) abreItem(); else { foca(i); setTimeout(abreItem, 520); }
    });
    box.tabIndex = 0;
    box.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") foca((S.ativo + 1) % n); else if (e.key === "ArrowLeft") foca((S.ativo - 1 + n) % n);
      else if (e.key === "Enter") { const m = cards[S.ativo].querySelector(".cc-m"); if (lista[S.ativo].v) window.abreVideo({ v: lista[S.ativo].v, card: m, asp: m.videoWidth ? m.videoWidth / m.videoHeight : 9 / 16 }); else { fotosAtuais = lista; abrir(S.ativo); } } else return;
      e.preventDefault();
    });
    desenha(performance.now());
  };
  $("#nomes-turma").append(...(C.alunos || []).map((a) => el("li", { textContent: a.nome })));
  carrossel($("#galeria"), C.fotos);
  const listaV = [...(C.videoEspecial && C.videoEspecial.arquivo ? [{ arquivo: C.videoEspecial.arquivo, titulo: "★ " + (C.videoEspecial.titulo || "Vídeo especial") }] : []), ...(C.videos || []).map((v, i) => ({ ...v, titulo: v.titulo || "Vídeo " + String(i + 1).padStart(2, "0") }))]
    .filter((v) => v.arquivo).map((v) => ({ src: v.arquivo, legenda: v.titulo, v }));
  carrossel($("#galeria-v"), listaV, "Em breve: os vídeos da turma.");
  const fechaLb = () => { if (matchMedia("(prefers-reduced-motion: reduce)").matches) return lb.close(); const a = lb.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: "ease" }); a.onfinish = () => lb.close(); };
  lb.querySelector(".lb-x").onclick = fechaLb;
  lb.querySelector(".prev").onclick = () => abrir(atual - 1);
  lb.querySelector(".next").onclick = () => abrir(atual + 1);
  lb.addEventListener("click", (e) => e.target === lb && fechaLb());
  addEventListener("keydown", (e) => {
    if (!lb.open) return;
    if (e.key === "ArrowLeft") abrir(atual - 1);
    if (e.key === "ArrowRight") abrir(atual + 1);
  });

  /* ---------- vídeos ---------- */
  const videos = (box, lista, vazio) => {
    if (!lista.length) box.append(empty(vazio));
    lista.forEach((v) =>
      box.append(
        el("div", { className: "video card" },
          v.youtube
            ? el("iframe", { sandbox: "allow-scripts allow-same-origin allow-presentation", referrerPolicy: "no-referrer", src: "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.youtube), title: v.titulo || "Vídeo", loading: "lazy", allowFullscreen: true })
            : el("video", {
                // #t=0.1 faz o celular mostrar o primeiro quadro; o formato (em pé ou deitado) vem do próprio vídeo
                src: v.arquivo + "#t=0.1", controls: true, preload: "metadata", playsInline: true,
                onloadedmetadata: (e) => (e.target.style.aspectRatio = e.target.videoWidth + "/" + e.target.videoHeight),
              }),
          v.titulo ? el("h3", { textContent: v.titulo }) : "")
      )
    );
  };

  /* ---------- madrinha ---------- */
  const M = C.madrinha;
  $("#mad-nome").textContent = M.nome;
  if (M.foto) Object.assign($("#mad-img"), { src: M.foto, alt: M.nome + ", nossa madrinha" });
  else $("#mad-img").remove();
  if (M.fotoFofa) Object.assign($("#mad-fofa"), { src: M.fotoFofa, alt: M.nome + " com bolo no rosto" });
  else $("#mad-fofa").remove();
  $("#mad-frase").textContent = M.frase || "";
  M.mensagem.split(/\n\s*\n/).forEach((p) => $("#mad-msg").append(el("p", { textContent: p.trim() })));
  galeria($("#mad-fotos"), M.fotos, "Em breve: as fotos com a nossa madrinha.");
  videos($("#mad-videos"), M.videos, "Em breve: os vídeos para a nossa madrinha.");

  /* ---------- música de fundo ---------- */
  // Navegadores só deixam tocar com som depois de um toque/clique: tenta já ao entrar e, se bloquear, começa no primeiro gesto.
  const mus = C.musica;
  if (mus && mus.arquivo) {
    const au = $("#musica"), btn = $("#p-btn"), vol = $("#p-vol");
    let pausadoPeloUsuario = false;
    au.src = mus.arquivo;
    au.volume = mus.volume ?? 0.35;
    $("#player").hidden = false;
    btn.title = mus.titulo || "Música";
    const marca = () => {
      btn.classList.toggle("tocando", !au.paused);
      btn.setAttribute("aria-label", au.paused ? "Tocar música" : "Pausar música");
    };
    au.addEventListener("play", marca);
    au.addEventListener("pause", marca);
    const iniciar = () => { if (!pausadoPeloUsuario && au.paused) au.play().catch(() => {}); };
    au.play().catch(() => {});
    addEventListener("abertura-fim", iniciar, { once: true }); // acabou a abertura: a música entra junto com o site
    ["pointerdown", "touchend", "click", "keydown"].forEach((ev) => addEventListener(ev, function f() {
      iniciar();
      if (!au.paused) removeEventListener(ev, f);
    }, { passive: true }));
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      pausadoPeloUsuario = !au.paused;
      au.paused ? au.play().catch(() => {}) : au.pause();
    });
    // volume: slider elástico (estica quando você puxa além das pontas e volta quebrando de leve)
    const hit = vol.querySelector(".es-hit"), fill = vol.querySelector(".es-fill"), num = vol.querySelector(".es-val");
    const ponha = (v) => { v = Math.max(0, Math.min(1, v)); au.volume = v; fill.style.width = v * 100 + "%"; num.textContent = Math.round(v * 100); vol.setAttribute("aria-valuenow", Math.round(v * 100)); };
    const borracha = (d, lim) => 2 * (1 / (1 + Math.exp(-d / lim)) - 0.5) * lim;
    let seg = false;
    const move = (e) => {
      const r = hit.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      ponha(x);
      const fora = x < 0 ? e.clientX - r.left : x > 1 ? e.clientX - r.right : 0, esq = x < 0;
      hit.style.transformOrigin = esq ? "right center" : "left center";
      hit.style.transform = fora ? "scaleX(" + (1 + borracha(Math.abs(fora), 50) / r.width) + ") scaleY(" + (1 - borracha(Math.abs(fora), 50) / r.width * 0.5) + ")" : "";
    };
    vol.addEventListener("pointerdown", (e) => { seg = true; vol.classList.add("ativo"); hit.style.transition = "none"; vol.setPointerCapture(e.pointerId); move(e); });
    vol.addEventListener("pointermove", (e) => seg && move(e));
    const larga = () => { seg = false; vol.classList.remove("ativo"); hit.style.transition = ""; hit.style.transform = ""; };
    vol.addEventListener("pointerup", larga); vol.addEventListener("pointercancel", larga);
    vol.addEventListener("keydown", (e) => { const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? 0.05 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -0.05 : 0; if (d) { ponha(au.volume + d); e.preventDefault(); } });
    ponha(au.volume);
    marca();
    // vídeo aberto (pilha, YouTube ou <video> com som): a música para e volta quando ele fecha
    let porVideo = false;
    const paraMusica = () => { if (!au.paused) { au.pause(); porVideo = true; } };
    const voltaMusica = () => { if (porVideo) { porVideo = false; if (!pausadoPeloUsuario) au.play().catch(() => {}); } };
    addEventListener("video-abriu", paraMusica); addEventListener("video-fechou", voltaMusica);
    document.addEventListener("play", (e) => { if (e.target.tagName === "VIDEO" && !e.target.muted) paraMusica(); }, true);
    ["pause", "ended"].forEach((ev) => document.addEventListener(ev, (e) => { if (e.target.tagName === "VIDEO" && !e.target.muted) voltaMusica(); }, true));
  }

  /* ---------- kit: clique amplia (usa o mesmo lightbox) ---------- */
  const kitFotos = [...document.querySelectorAll(".kit-zoom img")].map((i) => ({ src: i.src, legenda: i.alt }));
  document.querySelectorAll(".kit-zoom").forEach((b, i) =>
    b.addEventListener("click", () => { fotosAtuais = kitFotos; abrir(i); })
  );

  /* ---------- momentos (sem itens na config, a aba some) ---------- */
  const tl = $("#timeline");
  C.momentos.forEach((m) =>
    tl.append(el("li", { className: "card momento" },
      el("time", { textContent: m.data }),
      el("h3", { textContent: m.titulo }),
      el("p", { textContent: m.texto }),
      m.foto ? el("img", { src: m.foto, alt: m.titulo, loading: "lazy" }) : "",
      m.video ? el("video", { src: m.video + "#t=0.1", controls: true, preload: "metadata", playsInline: true,
        onloadedmetadata: (e) => (e.target.style.aspectRatio = e.target.videoWidth + "/" + e.target.videoHeight) }) : ""))
  );

  /* ---------- mural (Supabase) ---------- */
  const status = $("#mural-status"), form = $("#form-mural"), msg = $("#m-msg"), lista = $("#mensagens");
  const configurado = C.supabaseUrl && !C.supabaseUrl.startsWith("COLE");
  const sb = configurado && window.supabase ? window.supabase.createClient(C.supabaseUrl, C.supabaseKey) : null;

  const setStatus = (aberto) => {
    status.className = "status " + (aberto ? "aberto" : "fechado");
    status.textContent = aberto ? "Mural aberto" : "Mural fechado: não aceita mais mensagens";
    $(".mural-form").classList.toggle("fechado", !aberto);
  };
  const quando = (d) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  async function carregar() {
    const { data, error } = await sb.from("mensagens").select("nome,texto,criado_em").order("criado_em", { ascending: false }).limit(300);
    lista.replaceChildren();
    if (error) return lista.append(empty("Não consegui carregar as mensagens: " + error.message));
    if (!data.length) return lista.append(empty("Ainda não tem mensagens. Seja o primeiro!"));
    // cada recado ganha cor e inclinação pela posição (sempre igual para a mesma mensagem)
    data.forEach((m, i) =>
      lista.append(el("article", { className: "recado cor" + (i % 3), style: "--giro:" + [-2.2, 1.6, -1, 2.4, -1.8, .8][i % 6] + "deg" },
        el("p", { textContent: m.texto }),
        el("footer", {}, el("b", { textContent: m.nome }), el("span", { textContent: quando(m.criado_em) }))))
    );
  }

  if (!sb) {
    status.textContent = configurado
      ? "Não consegui carregar o Supabase (internet ou bloqueio?). Tente recarregar."
      : "Mural ainda não conectado ao Supabase (veja o LEIAME).";
    form.querySelectorAll("input,textarea,button").forEach((x) => (x.disabled = true));
  } else {
    sb.rpc("mural_aberto").then(({ data }) => setStatus(data === true));
    carregar();
  }

  $("#m-texto").addEventListener("input", (e) => ($("#m-count").textContent = e.target.value.length + " / 500"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!sb) return;
    const btn = $("#m-enviar");
    btn.disabled = true;
    msg.className = "form-msg";
    msg.textContent = "Enviando…";
    let { data, error } = await sb.rpc("enviar_mensagem", {
      p_codigo: $("#m-codigo").value,
      p_nome: $("#m-nome").value,
      p_texto: $("#m-texto").value,
    });
    btn.disabled = false;
    // versão reforçada do SQL devolve 'ok' ou o motivo; a antiga devolve vazio (sucesso) ou lança erro
    if (!error && typeof data === "string" && data !== "ok") error = { message: data };
    if (error) {
      const m = error.message || "";
      msg.className = "form-msg erro";
      if (m.includes("codigo_invalido")) msg.textContent = "Código da turma incorreto.";
      else if (m.includes("muitas_")) msg.textContent = "Muitas tentativas agora. Espere alguns minutos e tente de novo.";
      else if (m.includes("dados_invalidos")) msg.textContent = "Confira o nome (2 a 60 letras) e a mensagem (até 500).";
      else if (m.includes("mural_fechado")) { msg.textContent = "O mural foi fechado."; setStatus(false); }
      else msg.textContent = "Não foi possível enviar: " + (m || "erro desconhecido");
      return;
    }
    msg.className = "form-msg ok";
    msg.textContent = "Mensagem publicada! Obrigado por fazer parte.";
    $("#m-texto").value = "";
    $("#m-count").textContent = "0 / 500";
    carregar();
  });


  /* ---------- hero: título gigante ajustado à largura, entrada e ímã da pantera ---------- */
  const medeMenu = () => document.documentElement.style.setProperty("--nav-h", $(".topbar").offsetHeight + "px");
  medeMenu(); addEventListener("resize", medeMenu);
  const gFit = $("#gigante-fit"), gBox = $("#gigante"), semMov = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const palavra = "Terceirão";
  gFit.replaceChildren(...[...palavra].map((ch, i) => el("span", { className: "l", textContent: ch, style: "--i:" + i })));
  const ajustaTitulo = () => {
    gFit.style.fontSize = "100px";
    const livre = gBox.clientWidth - 2 * parseFloat(getComputedStyle(gBox).paddingLeft);
    gFit.style.fontSize = (100 * livre) / gFit.offsetWidth + "px"; // offsetWidth ignora scale/transform (o getBoundingClientRect encolhia o título ao rolar)
    posicionaAnel();
  };
  // no computador, o anel começa logo abaixo do título (qualquer que seja a altura da fonte)
  const posicionaAnel = () => {
    const hero = $("#hero"), wrap = $(".anel-wrap");
    if (!wrap) return;
    if (innerWidth <= 760) return (wrap.style.top = "");
    const hb = hero.getBoundingClientRect(), tb = gBox.getBoundingClientRect().bottom - hb.top;
    const B = parseFloat(getComputedStyle(wrap).bottom), TOPO = 330 / 820; // o topo do anel fica a 40,2% da altura do conjunto
    const T = Math.max(0, (tb - 4 - TOPO * (hb.height - B)) / (1 - TOPO));
    wrap.style.top = T + "px";
  };
  ajustaTitulo();
  document.fonts?.ready.then(ajustaTitulo);
  let larg = innerWidth; // no celular a barra do navegador dispara "resize" só de altura: não refaz o cálculo à toa
  addEventListener("resize", () => { if (innerWidth !== larg) { larg = innerWidth; ajustaTitulo(); } });
  addEventListener("load", ajustaTitulo);
  // a entrada só começa com as fontes prontas (senão o título "pula")
  const go1 = () => document.documentElement.classList.add("go");
  const entrar = () => (document.documentElement.classList.contains("ab") ? addEventListener("abertura-fim", go1, { once: true }) : go1());
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]).then(() => requestAnimationFrame(entrar));

  // ímã: o anel (com pantera, correntes e grafite) acompanha o mouse de leve, balançando pelo topo
  const anel = $("#anel"), bal = $("#balanco");
  if (anel && !semMov && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let alvo = { x: 0, y: 0, r: 0 }, atual = { x: 0, y: 0, r: 0 }, t0 = performance.now(), rodando = false;
    const lim = (v) => Math.max(-1, Math.min(1, v));
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const b = anel.getBoundingClientRect(), w = b.width;
      const dx = e.clientX - (b.left + b.width * 0.5), dy = e.clientY - (b.top + b.height * 0.66);
      let f = 1 - Math.hypot(dx, dy) / w; // força some além da largura do anel
      f = Math.max(0, f); f = f * f * (3 - 2 * f);
      const nx = lim(dx / (w * 0.35)), ny = lim(dy / (w * 0.35));
      alvo = { x: 34 * f * nx, y: 34 * 0.45 * f * ny, r: -3.5 * f * nx }; // ponteiro à direita: a base vai para a direita
      if (!rodando) { rodando = true; t0 = performance.now(); requestAnimationFrame(passo); }
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => (alvo = { x: 0, y: 0, r: 0 }));
    const passo = (agora) => {
      const dt = agora - t0; t0 = agora;
      const k = 1 - Math.exp(-dt / 140); // suave e igual em qualquer taxa de quadros
      for (const p of ["x", "y", "r"]) atual[p] += (alvo[p] - atual[p]) * k;
      bal.style.transform = "translate3d(" + atual.x.toFixed(2) + "px," + atual.y.toFixed(2) + "px,0) rotate(" + atual.r.toFixed(3) + "deg)";
      const parado = Math.abs(atual.x - alvo.x) + Math.abs(atual.y - alvo.y) + Math.abs(atual.r - alvo.r) < 0.01;
      parado && !alvo.x && !alvo.y && !alvo.r ? ((rodando = false), (bal.style.transform = "")) : requestAnimationFrame(passo);
    };
  }

  /* ---------- rolagem inteligente ---------- */
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches; // celular com "reduzir movimento": só aparece suave
  const barra = el("div", { className: "progresso", ariaHidden: "true" });
  document.body.append(barra);
  // vídeo flutuante do início: sobe e cresce conforme a rolagem (sem som, sem fundo)
  const voo = $("#voo"), vooV = voo && voo.querySelector("video");
  const vooAtualiza = () => {
    if (!voo || voo.offsetParent === null) return;
    const r = voo.getBoundingClientRect(), tot = r.height - innerHeight, p = Math.max(0, Math.min(1, -r.top / tot));
    const k = (x) => Math.max(0, Math.min(1, x)), ent = k(p / 0.38), ease = 1 - Math.pow(1 - ent, 3), sai = k((1 - p) / 0.2);
    voo.style.setProperty("--vp", p.toFixed(3)); voo.style.setProperty("--ent", ease.toFixed(3)); voo.style.setProperty("--sai", sai.toFixed(3)); voo.style.setProperty("--vo", Math.min(1, p * 9) .toFixed(3));
    const perto = r.top < innerHeight * 1.2 && r.bottom > -innerHeight * 0.2;
    if (perto && vooV.paused) vooV.play().catch(() => {}); else if (!perto && !vooV.paused) vooV.pause();
  };

  const menu = $(".topbar"), tigreC = $("#tigre-centro");
  const alvosSc = [...document.querySelectorAll(".title,.sub,.tile,.kit-card,.lista-turma,.mad-hero,.carta-card,.papel,.lema,.countdown,.cc,.palco,.mural-form,.mural-lista,.momento,.mad-carta")];
  const fotosPar = new Set(); // fotos visíveis com paralaxe
  let quadro = false, ultimo = 0;
  const aoRolar = () => {
    quadro = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    menu.classList.toggle("vidro", y > 40);
    menu.classList.toggle("escondida", y > 160 && !menu.contains(document.activeElement)); // o menu só aparece no topo do site
    ultimo = y;
    vooAtualiza();
    const hp = Math.min(1, y / (innerHeight * 0.8)).toFixed(3);
    tigreC.style.setProperty("--p", hp); document.documentElement.style.setProperty("--hp", hp);
    // scroll inteligente: cada bloco desliza em ritmos diferentes (profundidade) conforme a posição na tela
    for (const e of alvosSc) {
      const r = e.getBoundingClientRect(); if (r.bottom < -150 || r.top > innerHeight + 150) continue;
      e.style.setProperty("--sc", ((r.top + r.height / 2 - innerHeight / 2) / innerHeight).toFixed(3));
    }
    document.documentElement.style.setProperty("--sy", y);
    fotosPar.forEach((im) => {
      const r = im.parentElement.getBoundingClientRect();
      im.style.translate = "0 " + ((r.top + r.height / 2 - innerHeight / 2) / innerHeight) * -26 + "px";
    });
  };
  addEventListener("scroll", () => quadro || ((quadro = true), requestAnimationFrame(aoRolar)), { passive: true });
  aoRolar();

  if ("IntersectionObserver" in window) {
    const R = document.documentElement;
    R.classList.add("js-anim");
    if (calmo) R.classList.add("suave");
    const ALVOS = ".title,.sub,.subtitle,.hero-text,.hero-art,.tile,.countdown-title,.countdown-date,.kit-card,.lema,.papel,.nomes li,.mad-hero,.carta-card," +
      ".galeria .foto,.videos .video,.especial,.timeline li,.mural-form,.recado,.empty,.footer";
    const TIPO = { ".hero-text": "esq", ".hero-art": "dir", ".tile": "pop", ".nomes li": "esq", ".kit-card": "img", ".galeria .foto": "img", ".lema": "pop",
      ".especial": "img", ".videos .video": "img", ".papel": "img", ".recado": "pop" };
    const io = new IntersectionObserver((itens) => itens.forEach((it) => {
      if (!it.isIntersecting) return;
      const n = it.target;
      io.unobserve(n);
      n.classList.add("in");
      setTimeout(() => n.classList.remove("rv", "in"), 2600); // depois volta aos estilos normais (hover etc.)
    }), { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    // paralaxe só enquanto a foto está na tela
    const ioPar = new IntersectionObserver((itens) => itens.forEach((it) => (it.isIntersecting ? fotosPar.add(it.target) : fotosPar.delete(it.target))), { rootMargin: "100px" });
    const marca = (raiz) => {
      const lista = [...(raiz.matches?.(ALVOS) ? [raiz] : []), ...(raiz.querySelectorAll?.(ALVOS) ?? [])];
      lista.forEach((n) => {
        if (n.dataset.vis) return;
        n.dataset.vis = 1;
        const irmaos = n.parentElement ? [...n.parentElement.children].filter((c) => c.matches(ALVOS)) : [];
        n.style.setProperty("--d", (Math.max(irmaos.indexOf(n), 0) % 6) * 100 + "ms");
        const t = Object.keys(TIPO).find((q) => n.matches(q));
        if (t) n.dataset.rv = TIPO[t];
        if (t && TIPO[t] === "img" && !calmo) n.append(el("i", { className: "brilho" }));
        n.classList.add("rv");
        io.observe(n);
        const im = n.matches("#galeria .foto") && n.querySelector("img");
        if (im && !calmo) ioPar.observe(im);
        // inclina em 3D com o mouse
        if (!calmo && n.matches(".kit-card,.galeria .foto,.videos .video")) {
          n.classList.add("tilt");
          n.addEventListener("pointermove", (e) => {
            if (e.pointerType !== "mouse") return;
            const r = n.getBoundingClientRect();
            n.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 9 + "deg");
            n.style.setProperty("--rx", (0.5 - (e.clientY - r.top) / r.height) * 9 + "deg");
          });
          n.addEventListener("pointerleave", () => { n.style.setProperty("--rx", "0deg"); n.style.setProperty("--ry", "0deg"); });
        }
      });
    };
    marca(document.body);
    // mensagens, fotos e vídeos criados depois (Supabase etc.) também entram animados
    new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && marca(n)))).observe($("main"), { childList: true, subtree: true });
  }

  /* ---------- partículas azuis flutuando atrás do site ---------- */
  if (!calmo) {
    const cv = el("canvas", { className: "particulas", ariaHidden: "true" });
    $(".bg").after(cv);
    const cx = cv.getContext("2d");
    let W, H, ps = [];
    const ajusta = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
      const n = Math.round(Math.min(46, innerWidth / 26));
      ps = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (0.8 + Math.random() * 2.6) * d, v: (0.12 + Math.random() * 0.4) * d, o: Math.random() * 6.28, a: 0.15 + Math.random() * 0.45 }));
    };
    addEventListener("resize", ajusta);
    ajusta();
    const anda = () => {
      cx.clearRect(0, 0, W, H);
      if (!document.hidden)
        ps.forEach((p) => {
          p.y -= p.v; p.o += 0.01;
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
          const x = p.x + Math.sin(p.o) * 18;
          const g = cx.createRadialGradient(x, p.y, 0, x, p.y, p.r * 4);
          g.addColorStop(0, "rgba(190,225,255," + p.a + ")"); g.addColorStop(1, "rgba(124,196,255,0)");
          cx.fillStyle = g; cx.beginPath(); cx.arc(x, p.y, p.r * 4, 0, 6.28); cx.fill();
        });
      requestAnimationFrame(anda);
    };
    anda();
  }
})();
