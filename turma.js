/* ============================================================
   ABA TURMA: árvore holográfica de partículas
   - a árvore se forma com milhares de partículas azuis e gira devagar
   - ao tocar num nome, as partículas voam até a "moldura" e montam a foto
   - nomes e fotos vêm de CONFIG.alunos (config.js)
   Feito em Canvas 2D (sem bibliotecas): leve e funciona em qualquer celular.
   ============================================================ */
(() => {
  const C = window.CONFIG;
  const $ = (s) => document.querySelector(s);
  const painel = $("#turma"), palco = $("#palco"), cv = $("#arvore"), ctx = cv.getContext("2d");
  const holo = $("#holo"), holoFoto = $("#holo-foto"), holoNome = $("#holo-nome"), holoInfo = $("#holo-info");
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pequeno = innerWidth < 700;
  const N = pequeno ? 7500 : 15000; // total de partículas
  const GRADE = pequeno ? 44 : 64; // a foto é montada com GRADE x GRADE "pixels" de partículas
  const todos = C.alunos || [], comFoto = todos.filter((a) => a.foto), alunos = comFoto.length ? comFoto : todos;

  /* ---------- utilidades ---------- */
  let semente = 20261219;
  const rnd = () => ((semente = (semente + 0x6d2b79f5) | 0), (((t = Math.imul(semente ^ (semente >>> 15), 1 | semente)) ^ (t + Math.imul(t ^ (t >>> 7), 61 | t))) ^ (t >>> 14)) >>> 0) / 4294967296;
  let t; // usado pelo rnd
  const sorte = Math.random;
  const suave = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
  const saida = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3); // ease-out
  const entradaSaida = (x) => { x = Math.min(1, Math.max(0, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

  /* ---------- gera a árvore (pontos 3D) ---------- */
  const tronco = [], folhas = [];
  const unit = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  function ramo(p, d, comp, raio, nivel) {
    const passos = Math.max(3, Math.round(comp * (nivel === 0 ? 1100 : nivel < 3 ? 520 : 330) * (0.6 + raio * 6)));
    let u = unit(cruz(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), v = cruz(d, u);
    for (let i = 0; i < passos; i++) {
      const s = i / passos, a = rnd() * 6.2832, r = raio * (1 - s * 0.35) * Math.sqrt(rnd());
      const c = [p[0] + d[0] * comp * s, p[1] + d[1] * comp * s, p[2] + d[2] * comp * s];
      tronco.push([c[0] + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r, c[1] + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r, c[2] + (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r]);
    }
    const fim = [p[0] + d[0] * comp, p[1] + d[1] * comp, p[2] + d[2] * comp];
    if (nivel >= 4) {
      const n = Math.round(70 + rnd() * 70);
      for (let i = 0; i < n; i++) {
        const g = 0.07 + 0.05 * (nivel - 3);
        folhas.push([fim[0] + (rnd() - 0.5) * g * 2, fim[1] + (rnd() - 0.4) * g * 1.6, fim[2] + (rnd() - 0.5) * g * 2]);
      }
    }
    if (nivel >= 6) return;
    const filhos = nivel === 0 ? 4 : nivel < 3 ? 3 : 2 + (rnd() < 0.45 ? 1 : 0);
    const base = rnd() * 6.2832;
    for (let k = 0; k < filhos; k++) {
      const ang = (0.42 + rnd() * 0.42) * (nivel === 0 ? 1.15 : 1), fi = base + (k / filhos) * 6.2832 + (rnd() - 0.5) * 0.7;
      const nu = unit(cruz(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), nv = cruz(d, nu);
      let nd = unit([d[0] * Math.cos(ang) + (nu[0] * Math.cos(fi) + nv[0] * Math.sin(fi)) * Math.sin(ang), d[1] * Math.cos(ang) + (nu[1] * Math.cos(fi) + nv[1] * Math.sin(fi)) * Math.sin(ang), d[2] * Math.cos(ang) + (nu[2] * Math.cos(fi) + nv[2] * Math.sin(fi)) * Math.sin(ang)]);
      nd = unit([nd[0], nd[1] + 0.22, nd[2]]); // os galhos tendem a subir
      ramo(fim, nd, comp * (0.74 + rnd() * 0.06), raio * 0.62, nivel + 1);
    }
  }
  ramo([0, -1, 0], [0, 1, 0], 0.62, 0.075, 0);
  for (let i = 0; i < 6; i++) { // raízes espalhadas no chão
    const a = (i / 6) * 6.2832 + rnd(), d = unit([Math.cos(a), -0.06, Math.sin(a)]);
    for (let k = 0; k < 90; k++) { const s = rnd(), e = 0.04 * (1 - s); tronco.push([d[0] * 0.34 * s + (rnd() - 0.5) * e, -1 + (rnd() - 0.5) * e * 0.6, d[2] * 0.34 * s + (rnd() - 0.5) * e]); }
  }

  /* ---------- partículas ---------- */
  // grupos: 0 galho, 1 folha, 2 anel do chão, 3 flutuando, 4 onda do chão
  const nAnel = Math.round(N * 0.07), nOnda = Math.round(N * 0.03), nFlut = Math.round(N * 0.05);
  const nArv = N - nAnel - nOnda - nFlut;
  const nGalho = Math.round(nArv * 0.72);
  const hx = new Float32Array(N), hy = new Float32Array(N), hz = new Float32Array(N); // posição "de casa" na árvore
  const grupo = new Uint8Array(N), cor = new Uint8Array(N), fase = new Float32Array(N), tam = new Float32Array(N);
  const sx = new Float32Array(N), sy = new Float32Array(N), prof = new Float32Array(N); // posição na tela
  const estado = new Uint8Array(N); // 0 árvore, 1 voando, 2 na foto, 3 voltando
  const x0 = new Float32Array(N), y0 = new Float32Array(N), x1 = new Float32Array(N), y1 = new Float32Array(N), cxc = new Float32Array(N), cyc = new Float32Array(N);
  const inicio = new Float32Array(N), dura = new Float32Array(N), celula = new Int16Array(N).fill(-1);
  const chegada = new Float32Array(N), atraso = new Float32Array(N), espalha = new Float32Array(N * 3);
  const embaralha = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  embaralha(tronco); embaralha(folhas);
  for (let i = 0; i < N; i++) {
    let p;
    if (i < nGalho) { p = tronco[i % tronco.length]; grupo[i] = 0; }
    else if (i < nArv) { p = folhas[(i - nGalho) % folhas.length]; grupo[i] = 1; }
    else if (i < nArv + nAnel) {
      const k = (i - nArv) % 3, ang = rnd() * 6.2832, r = [0.55, 0.88, 1.2][k] + (rnd() - 0.5) * 0.03;
      p = [Math.cos(ang) * r, -1.02, Math.sin(ang) * r]; grupo[i] = 2; fase[i] = k;
    } else if (i < nArv + nAnel + nOnda) { p = [rnd() * 6.2832, 0, 0]; grupo[i] = 4; }
    else { const a = rnd() * 6.2832, r = 0.5 + rnd() * 1.2; p = [Math.cos(a) * r, -0.9 + rnd() * 2.1, Math.sin(a) * r]; grupo[i] = 3; }
    hx[i] = p[0]; hy[i] = p[1]; hz[i] = p[2];
    const q = rnd(); cor[i] = q < 0.3 ? 0 : q < 0.58 ? 1 : q < 0.82 ? 2 : q < 0.96 ? 3 : 4;
    if (grupo[i] === 1 && rnd() < 0.35) cor[i] = 2 + ((rnd() * 3) | 0);
    fase[i] = fase[i] || rnd() * 6.2832;
    tam[i] = 0.8 + rnd() * 0.8;
    const a = rnd() * 6.2832, b = Math.acos(2 * rnd() - 1), r = 2.2 + rnd() * 1.8; // de onde cada partícula vem na animação inicial
    espalha[i * 3] = Math.sin(b) * Math.cos(a) * r; espalha[i * 3 + 1] = Math.cos(b) * r * 0.8; espalha[i * 3 + 2] = Math.sin(b) * Math.sin(a) * r;
    atraso[i] = rnd() * 1.7; chegada[i] = 1.9 + rnd() * 1.3;
  }
  const pool = []; // partículas que podem virar a foto
  for (let i = 0; i < nArv; i++) pool.push(i);
  embaralha(pool);

  // cores: [grupo de cor][brilho por profundidade]
  const PAL = [[40, 100, 255], [70, 160, 255], [120, 205, 255], [190, 232, 255], [255, 255, 255]];
  const ALFA = [0.42, 0.72, 1];
  const estilos = PAL.map((c) => ALFA.map((a) => "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"));

  /* ---------- tela ---------- */
  let W = 0, H = 0, dpr = 1, S = 1, cx0 = 0, cy0 = 0, fcx = 0, fcy = 0, fR = 0, cel = 1;
  function mede() {
    const r = palco.getBoundingClientRect();
    if (!r.width) return;
    W = r.width; H = r.height; dpr = Math.min(devicePixelRatio || 1, pequeno ? 1.6 : 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    S = Math.min(H * 0.33, W * 0.46); cx0 = W / 2; cy0 = H * 0.56;
    fR = Math.min(W * 0.34, H * 0.31); fcx = W / 2; fcy = H * 0.4; cel = (2 * fR) / GRADE;
    Object.assign(holoFoto.style, { width: 2 * fR + "px", height: 2 * fR + "px", left: fcx - fR + "px", top: fcy - fR + "px" });
    holoNome.style.top = fcy + fR + 16 + "px";
  }
  addEventListener("resize", mede);

  /* ---------- estado geral ---------- */
  let rodando = false, visivel = false, tIntro = 0, giro = 0, vel = 0.2, velAlvo = 0.2, pulso = 0, tPulso = -9, alfaArv = 1;
  let atual = -1, pendente = -1, modo = "arvore", t0Sel = 0, chegaram = 0, total = 0, progresso = 0, celulas = [];
  const orbita = Array.from({ length: pequeno ? 120 : 260 }, (_, i) => ({ a: (i / 260) * 6.2832 * 2.2, r: 1.1 + sorte() * 0.22, v: 0.25 + sorte() * 0.5, s: 0.6 + sorte() * 1.2 }));

  /* ---------- foto -> pixels (ou iniciais, se ainda não há foto) ---------- */
  const iniciais = (n) => n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  function placeholder(nome) {
    const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
    const gr = g.createRadialGradient(256, 200, 20, 256, 256, 330); gr.addColorStop(0, "#2a6bff"); gr.addColorStop(0.55, "#0b2a9a"); gr.addColorStop(1, "#050c3a");
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "rgba(160,215,255,.18)"; g.lineWidth = 2;
    for (let i = 0; i < 512; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
    g.fillStyle = "#fff"; g.font = "230px Anton, Impact, 'Arial Narrow', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.shadowColor = "rgba(124,196,255,.9)"; g.shadowBlur = 30; g.fillText(iniciais(nome), 256, 270);
    return c;
  }
  function carrega(a) {
    return new Promise((ok) => {
      if (!a.foto) return ok(placeholder(a.nome));
      const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(placeholder(a.nome)); im.src = a.foto;
    });
  }
  function amostra(img) { // devolve cor de cada célula da grade (só as dentro do círculo)
    const g = document.createElement("canvas"); g.width = g.height = GRADE; const gx = g.getContext("2d", { willReadFrequently: true });
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, l = Math.min(w, h);
    gx.drawImage(img, (w - l) / 2, (h - l) / 3 > 0 ? Math.max(0, (h - l) / 3) : 0, l, l, 0, 0, GRADE, GRADE); // recorte quadrado, puxando um pouco para cima (rosto)
    let dados = null;
    try { dados = gx.getImageData(0, 0, GRADE, GRADE).data; } catch (e) { /* arquivo aberto direto do disco: sem leitura de pixels */ }
    const out = [];
    for (let j = 0; j < GRADE; j++) for (let i = 0; i < GRADE; i++) {
      const dx = (i + 0.5) / GRADE - 0.5, dy = (j + 0.5) / GRADE - 0.5;
      if (dx * dx + dy * dy > 0.25) continue;
      const k = (j * GRADE + i) * 4;
      const rgb = dados ? [dados[k], dados[k + 1], dados[k + 2]] : [60 + 120 * (1 - j / GRADE), 130 + 90 * (1 - j / GRADE), 255];
      out.push({ i, j, rgb: "rgb(" + ((rgb[0] * 0.9 + 12) | 0) + "," + ((rgb[1] * 0.92 + 18) | 0) + "," + ((rgb[2] * 0.9 + 40) | 0) + ")" });
    }
    return out;
  }

  const ANEIS = [
    { r: 1.62, y: 0.5, v: 0.3, s: 30, t: ["TERCEIRÃO", "3º INFO 1", "2026", "</>", "SAUDADE", "★"] },
    { r: 1.3, y: -0.3, v: -0.4, s: 21, t: ["{ }", "PANTERA", "TURMA", "01011", "TERCEIRÃO", "</>"] },
  ];
  /* ---------- projeção 3D ---------- */
  const PITCH = 0.2, cp = Math.cos(PITCH), sp = Math.sin(PITCH), CAM = 3.4;
  function projeta(x, y, z, a) { // gira em Y, inclina em X e aplica perspectiva
    const ca = Math.cos(a), sa = Math.sin(a), xr = x * ca - z * sa, zr = x * sa + z * ca;
    const yr = y * cp - zr * sp, zz = y * sp + zr * cp, k = CAM / (CAM + zz);
    return [cx0 + xr * S * k, cy0 - yr * S * k, zz];
  }

  /* ---------- selecionar aluno ---------- */
  async function escolhe(idx) {
    if (idx === atual && modo !== "arvore") return;
    if (modo !== "arvore") { pendente = idx; solta(); return; }
    atual = idx; modo = "buscando"; t0Sel = performance.now() / 1000; chegaram = 0; progresso = 0;
    const a = alunos[idx], img = await carrega(a);
    if (atual !== idx) return;
    celulas = amostra(img); total = celulas.length;
    holoFoto.style.backgroundImage = "url(" + (img.toDataURL ? img.toDataURL("image/jpeg", 0.9) : img.src) + ")";
    holoFoto.setAttribute("aria-label", "Foto de " + a.nome);
    holoNome.textContent = a.nome; holoInfo.textContent = a.info || "";
    palco.classList.add("ativo"); holo.classList.remove("pronto");
    velAlvo = 0; tPulso = t0Sel;
    for (let k = 0; k < total; k++) { // cada pixel da foto recebe uma partícula da árvore
      const i = pool[k], c = celulas[k];
      estado[i] = 1; celula[i] = k; inicio[i] = t0Sel + 0.45 + Math.pow(sorte(), 1.5) * (calmo ? 0.4 : 2.1); dura[i] = calmo ? 0.5 : 1.3 + sorte() * 1.0;
      x1[i] = fcx - fR + (c.i + 0.5) * cel; y1[i] = fcy - fR + (c.j + 0.5) * cel; x0[i] = NaN;
      const lado = sorte() < 0.5 ? -1 : 1, d = 60 + sorte() * 160; cxc[i] = d * lado; cyc[i] = -(40 + sorte() * 140); // curva do voo
    }
  }
  function solta() { // as partículas voltam para a árvore
    const agora = performance.now() / 1000;
    for (let i = 0; i < N; i++) if (estado[i] === 1 || estado[i] === 2) {
      estado[i] = 3; x0[i] = sx[i]; y0[i] = sy[i]; inicio[i] = agora + sorte() * (calmo ? 0.1 : 0.7); dura[i] = calmo ? 0.4 : 0.8 + sorte() * 0.8;
    }
    modo = "voltando"; chegaram = 0; progresso = 0; holo.classList.remove("pronto"); palco.classList.remove("ativo"); velAlvo = 0.2;
    atual = -1;
  }
  let tLivre = 0, tPerfil = 0, proximo = 0;

  /* ---------- desenho ---------- */
  function quadro(agora) {
    const T = agora / 1000;
    const dt = Math.min(0.05, (agora - (quadro.ult || agora)) / 1000); quadro.ult = agora;
    vel += (velAlvo - vel) * (1 - Math.exp(-dt / 0.55)); giro += vel * dt * (calmo ? 0.15 : 1);
    alfaArv += ((modo === "arvore" ? 1 : 0.34) - alfaArv) * (1 - Math.exp(-dt / 0.4));
    const intro = T - tIntro;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const choque = Math.max(0, 1 - (T - tPulso) / 1.1); // onda de choque ao clicar
    const buckets = new Uint8Array(N);
    let fim = true;
    // 1) posição de cada partícula
    for (let i = 0; i < N; i++) {
      if (estado[i] === 0 || estado[i] === 3) {
        let x = hx[i], y = hy[i], z = hz[i];
        const g = grupo[i];
        if (g === 4) { // onda que sai do centro, no chão
          const r = ((T * 0.28 + x * 0.16) % 1.5), ang = x * 40; x = Math.cos(ang) * r; z = Math.sin(ang) * r; y = -1.02;
        } else if (g === 2) { const k = 1 + 0.025 * Math.sin(T * 1.3 + fase[i] * 2); x *= k; z *= k; }
        else { x += Math.sin(T * 0.9 + fase[i]) * 0.012; y += Math.cos(T * 0.7 + fase[i] * 1.3) * 0.012; z += Math.sin(T * 0.8 + fase[i] * 0.7) * 0.012; if (g === 3) y += Math.sin(T * 0.3 + fase[i]) * 0.05; }
        if (choque > 0 && g !== 2 && g !== 4) { const d = Math.hypot(x, z) + 0.001, e = choque * 0.07 * (1 + y * 0.4); x += (x / d) * e; z += (z / d) * e; y += choque * 0.015; }
        // animação inicial: vem de longe e se junta
        let a = 1;
        if (!calmo) { a = saida((intro - atraso[i]) / chegada[i]); if (a < 1) { fim = false; x = espalha[i * 3] * (1 - a) + x * a; y = espalha[i * 3 + 1] * (1 - a) + y * a; z = espalha[i * 3 + 2] * (1 - a) + z * a; } }
        const p = projeta(x, y, z, giro);
        if (estado[i] === 3) { // voltando para a árvore
          const u = (T - inicio[i]) / dura[i];
          if (u >= 1) { estado[i] = 0; celula[i] = -1; sx[i] = p[0]; sy[i] = p[1]; }
          else if (u <= 0) { sx[i] = x0[i]; sy[i] = y0[i]; } else {
            const e = entradaSaida(u), mx = (x0[i] + p[0]) / 2 + cxc[i] * 0.4, my = (y0[i] + p[1]) / 2 + cyc[i] * 0.4;
            sx[i] = (1 - e) * (1 - e) * x0[i] + 2 * (1 - e) * e * mx + e * e * p[0]; sy[i] = (1 - e) * (1 - e) * y0[i] + 2 * (1 - e) * e * my + e * e * p[1];
          }
          prof[i] = p[2];
        } else { sx[i] = p[0]; sy[i] = p[1]; prof[i] = p[2]; }
        const f = Math.max(0, Math.min(2, Math.round(((1 - p[2]) * 0.5 + 0.5) * 2 + (g === 3 ? -0.6 : 0) + choque * 1.2)));
        buckets[i] = cor[i] * 3 + f;
      } else if (estado[i] === 1) {
        const u = (T - inicio[i]) / dura[i];
        if (Number.isNaN(x0[i])) { x0[i] = sx[i]; y0[i] = sy[i]; } // começa de onde a partícula estava na tela
        if (u <= 0) { /* ainda parada na árvore: segue a árvore */ const p = projeta(hx[i], hy[i], hz[i], giro); sx[i] = p[0]; sy[i] = p[1]; x0[i] = p[0]; y0[i] = p[1]; buckets[i] = cor[i] * 3 + 2; }
        else if (u >= 1) { estado[i] = 2; sx[i] = x1[i]; sy[i] = y1[i]; chegaram++; }
        else {
          const e = entradaSaida(u), mx = (x0[i] + x1[i]) / 2 + cxc[i], my = (y0[i] + y1[i]) / 2 + cyc[i];
          const px = sx[i], py = sy[i];
          sx[i] = (1 - e) * (1 - e) * x0[i] + 2 * (1 - e) * e * mx + e * e * x1[i]; sy[i] = (1 - e) * (1 - e) * y0[i] + 2 * (1 - e) * e * my + e * e * y1[i];
          buckets[i] = 255; // desenhado como rastro
          x1c[i] = px; y1c[i] = py;
        }
      }
    }
    progresso = total ? chegaram / total : 0;
    chegaram = 0; for (let i = 0; i < N; i++) if (estado[i] === 2) chegaram++;
    progresso = total ? chegaram / total : 0;

    // 2) árvore (brilho aditivo)
    ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = alfaArv;
    for (let b = 0; b < 15; b++) {
      ctx.fillStyle = estilos[(b / 3) | 0][b % 3];
      for (let i = 0; i < N; i++) {
        if (buckets[i] !== b) continue;
        const s = tam[i] * (0.8 + (1 - prof[i]) * 0.35) * (1 + choque * 0.5) * (grupo[i] === 3 ? 0.9 : 1);
        ctx.fillRect(sx[i] - s / 2, sy[i] - s / 2, s, s);
      }
    }

    // 2b) letreiros holográficos do Terceirão girando em volta da árvore
    if (false) { // letreiros holográficos desligados
      const fade = suave(1.5, 3.5, intro) * Math.min(1, alfaArv + 0.05);
      ctx.globalCompositeOperation = "lighter"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (const R of ANEIS) {
        ctx.lineWidth = 1; ctx.strokeStyle = "rgba(120,190,255," + 0.16 * fade + ")"; ctx.beginPath();
        for (let s = 0; s <= 72; s++) { const q = (s / 72) * 6.2832, p = projeta(Math.cos(q) * R.r, R.y, Math.sin(q) * R.r, 0); s ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
        ctx.stroke();
        R.t.forEach((txt, k) => {
          const q = T * R.v + (k / R.t.length) * 6.2832, p = projeta(Math.cos(q) * R.r, R.y, Math.sin(q) * R.r, 0), esc = CAM / (CAM + p[2]);
          const prof_ = Math.max(0, Math.min(1, (1 - p[2]) * 0.5 + 0.5)), a = (0.2 + 0.8 * prof_) * fade * (0.86 + 0.14 * Math.sin(T * 17 + k * 3));
          const tam_ = R.s * esc, sq = Math.max(0.22, Math.abs(Math.sin(q)));
          ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(sq, 1);
          ctx.font = tam_ + "px Anton, Impact, 'Arial Narrow', sans-serif";
          ctx.shadowColor = "rgba(90,170,255," + a + ")"; ctx.shadowBlur = 14 * esc;
          ctx.fillStyle = "rgba(170,225,255," + a + ")"; ctx.fillText(txt, 0, 0);
          ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(190,235,255," + a * 0.7 + ")"; ctx.lineWidth = 1;
          const w = ctx.measureText(txt).width / 2 + 8 * esc; ctx.beginPath(); ctx.moveTo(-w, tam_ * 0.62); ctx.lineTo(w, tam_ * 0.62); ctx.stroke();
          ctx.fillStyle = "rgba(160,220,255," + a * 0.07 + ")"; ctx.fillRect(-w, -tam_ * 0.62, 2 * w, tam_ * 1.24);
          ctx.restore();
        });
      }
      ctx.globalCompositeOperation = "source-over";
    }
    // 3) partículas em voo, com rastro
    ctx.globalAlpha = 1; ctx.lineWidth = 1.1; ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(150,215,255,.55)"; ctx.beginPath();
    for (let i = 0; i < N; i++) if (buckets[i] === 255) { ctx.moveTo(x1c[i], y1c[i]); ctx.lineTo(sx[i], sy[i]); }
    ctx.stroke();
    ctx.fillStyle = "rgba(230,248,255,.95)";
    for (let i = 0; i < N; i++) if (buckets[i] === 255) ctx.fillRect(sx[i] - 1, sy[i] - 1, 2.2, 2.2);
    // 4) a foto sendo montada (mosaico de partículas) e a moldura viva
    ctx.globalCompositeOperation = "source-over";
    const reveal = suave(0.45, 0.98, progresso);
    if (modo !== "arvore") {
      const op = Math.min(1, progresso * 1.4) * (1 - reveal * 0.85);
      ctx.globalAlpha = op;
      for (let i = 0; i < N; i++) if (estado[i] === 2) { ctx.fillStyle = celulas[celula[i]].rgb; ctx.fillRect(sx[i] - cel / 2, sy[i] - cel / 2, cel + 0.6, cel + 0.6); }
    }
    holoFoto.style.opacity = modo === "voltando" ? 0 : reveal;
    ctx.globalAlpha = 1;
    if (modo !== "arvore") { // anel de partículas girando em volta da foto
      ctx.globalCompositeOperation = "lighter";
      const forca = suave(0.1, 0.7, progresso) * (modo === "voltando" ? 0 : 1);
      for (const o of orbita) {
        o.a += o.v * dt; const r = fR * (o.r + 0.03 * Math.sin(T * 2 + o.a * 3));
        ctx.fillStyle = "rgba(160,220,255," + (0.85 * forca) + ")"; ctx.fillRect(fcx + Math.cos(o.a) * r, fcy + Math.sin(o.a) * r, o.s * 1.6, o.s * 1.6);
      }
    }
    ctx.globalCompositeOperation = "source-over";
    if (modo === "buscando" && progresso > 0.985) { modo = "perfil"; tPerfil = T; holo.classList.add("pronto"); }
    if (modo === "voltando") {
      let ainda = false; for (let i = 0; i < N; i++) if (estado[i] === 3) { ainda = true; break; }
      if (!ainda) { modo = "arvore"; tLivre = T; }
    }
    if (alunos.length && !calmo || alunos.length) {
      if (modo === "arvore" && T - tLivre > 6.5 && intro > 5) escolhe(proximo++ % alunos.length);
      else if (modo === "perfil" && T - tPerfil > 4.8) solta();
    }
    if (rodando) requestAnimationFrame(quadro);
  }
  const x1c = new Float32Array(N), y1c = new Float32Array(N);

  /* ---------- liga e desliga conforme a aba está aberta ---------- */
  function vigia() {
    const aberta = !painel.hidden;
    if (aberta && !visivel) { visivel = true; mede(); tIntro = performance.now() / 1000; tLivre = tIntro; giro = 0; if (!rodando) { rodando = true; quadro.ult = 0; requestAnimationFrame(quadro); } }
    if (!aberta && visivel) { visivel = false; rodando = false; if (modo !== "arvore") { for (let i = 0; i < N; i++) estado[i] = 0; modo = "arvore"; atual = -1; palco.classList.remove("ativo"); holo.classList.remove("pronto"); holoFoto.style.opacity = 0; } }
  }
  new MutationObserver(vigia).observe(painel, { attributes: true, attributeFilter: ["hidden"] });
  new IntersectionObserver((e) => { if (!painel.hidden) { const on = e[0].isIntersecting; if (on && !rodando) { rodando = true; quadro.ult = 0; requestAnimationFrame(quadro); } else if (!on) rodando = false; } }).observe(palco);
  vigia();
})();
