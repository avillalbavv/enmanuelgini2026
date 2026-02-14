// Normaliza rutas para que funcione tanto con URLs tipo ".../trayectoria.html"
// como con rutas limpias tipo ".../trayectoria" o ".../trayectoria/" (Netlify).
const currentPage = () => {
  const parts = (location.pathname || "")
    .split("/")
    .filter(Boolean);

  let last = (parts.pop() || "index").toLowerCase();
  // Si viene sin extensión ("/trayectoria"), asumimos HTML.
  if (!last.includes(".")) last = last + ".html";
  return last;
};

/* Año + fecha */
(() => {
  const d = new Date();
  const anio = document.getElementById("anio");
  if (anio) anio.textContent = d.getFullYear();
  // Soporta múltiples ubicaciones de fecha (clase ".fecha") sin IDs duplicados.
  const fechas = document.querySelectorAll(".fecha, #fecha");
  fechas.forEach((el) => (el.textContent = d.toLocaleDateString("es-ES")));
})();

/* (footer fijo) — sin JS de “footerSpace” para evitar saltos y scroll fantasma */

/* Barra roja superior: texto por pestaña */
(() => {
  const header = document.querySelector("header");
  if (!header) return;

  const map = {
    "index.html": "INICIO",
    "biografia.html": "BIOGRAFÍA",
    "trayectoria.html": "TRAYECTORIA",
    "propuestas.html": "PROPUESTAS",
    "noticias.html": "NOTICIAS",
    "equipo.html": "MI EQUIPO",
    "contacto.html": "CONTACTO",
    "padron.html": "PADRÓN",
    "info-electoral.html": "INFO ELECTORAL"
  };

  const key = currentPage();
  let label = map[key];

  // Si no coincide (rutas limpias/redirects), intentamos inferir desde el contenido.
  if (!label) {
    const h = document.querySelector("main h1, main h2");
    label = (h && h.textContent ? h.textContent.trim() : "MANUCA GINI");
    label = label.toUpperCase();
  }

  header.setAttribute("data-strip", label);
})();

/* Header: logo grande que se achica al scrollear (sin “saltos”) */
(() => {
  const header = document.querySelector("header");
  if (!header) return;

  let ticking = false;
  let isCompact = false;
  let lastH = 0;
  let maxH = 0;
  let heightTimer = null;

  const setHeaderH = () => {
    const headerRect = header.getBoundingClientRect();
    if (!headerRect.height) return;

    // ✅ Altura visual real (incluye overflow/transform del logo)
    // Así podemos tener logo grande sin “inflar” el header, pero sin tapar contenido.
    let bottom = headerRect.bottom;
    header.querySelectorAll(".brandLogo, .candidateLogo").forEach(el => {
      const r = el.getBoundingClientRect();
      if (r && r.bottom && r.bottom > bottom) bottom = r.bottom;
    });

    const h = Math.ceil(bottom - headerRect.top);
    if (!h) return;

    // Alto actual (útil si querés usarlo en el futuro)
    if (h !== lastH) {
      document.documentElement.style.setProperty("--headerH", h + "px");
      lastH = h;
    }

    // ✅ Alto MÁXIMO visto: se usa para que el header nunca tape el contenido
    if (h > maxH) {
      maxH = h;
      document.documentElement.style.setProperty("--headerHMax", maxH + "px");
    }
  };

  // Histeresis: evita que “tiemble” justo en el umbral
  const COMPACT_ON = 48;
  const COMPACT_OFF = 10;

  const update = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;

    if (!isCompact && y > COMPACT_ON) {
      header.classList.add("compact");
      isCompact = true;
    } else if (isCompact && y < COMPACT_OFF) {
      header.classList.remove("compact");
      isCompact = false;
    }

    // Mantener el contenido alineado: actualiza el alto real del header
    setHeaderH();

    // Re-medir al finalizar la transición para que nunca tape contenido
    if (heightTimer) clearTimeout(heightTimer);
    heightTimer = setTimeout(setHeaderH, 320);

    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("resize", () => requestAnimationFrame(update));

  window.addEventListener("scroll", onScroll, { passive: true });

  // Si el header cambia por transiciones/carga de imágenes, recalcular alto
  header.addEventListener("transitionend", () => requestAnimationFrame(setHeaderH));
  window.addEventListener("load", () => requestAnimationFrame(setHeaderH));

  // ✅ Si el header cambia de tamaño (menú móvil, wrap de líneas, etc.)
  // recalculamos automáticamente para que nunca tape contenido.
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => requestAnimationFrame(setHeaderH));
    ro.observe(header);
  }

  update();
})();

/* Pestaña activa */
(() => {
  const path = currentPage();
  document.querySelectorAll("nav a[data-page]").forEach(a => {
    if ((a.getAttribute("data-page") || "").toLowerCase() === path) a.classList.add("active");
  });
})();

/* Menú mobile */
(() => {
  const btn = document.querySelector(".menuBtn");
  const nav = document.querySelector("nav");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();

/* Dropdown desktop: estable */
(() => {
  const drops = Array.from(document.querySelectorAll("details.drop"));
  if (!drops.length) return;

  drops.forEach(d => {
    const summary = d.querySelector("summary");
    const menu = d.querySelector(".dropMenu");

    summary?.addEventListener("click", (e) => {
      e.stopPropagation();
      drops.forEach(other => { if (other !== d) other.removeAttribute("open"); });
    });

    menu?.addEventListener("click", (e) => e.stopPropagation());
  });

  document.addEventListener("click", () => drops.forEach(d => d.removeAttribute("open")));
  window.addEventListener("pageshow", () => drops.forEach(d => d.removeAttribute("open")));
})();

/* Loader + entrada */
(() => {
  document.body.classList.add("pageEnter");
  const loader = document.getElementById("pageLoader");
  if (!loader) return;

  // Mostrar loader al entrar (y cuando venimos de transición)
  loader.classList.remove("hide");

  // ✅ No bloquear contenido esperando imágenes/embeds.
  // Ocultamos apenas el DOM está listo (y mantenemos un mínimo para que no “parpadee”).
  const MIN_SHOW_MS = 140;
  const t0 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();

  const doHide = () => loader.classList.add("hide");

  const hide = () => {
    const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    const elapsed = now - t0;
    const wait = Math.max(0, MIN_SHOW_MS - elapsed);
    setTimeout(doHide, wait);
  };

  const quickHide = () => requestAnimationFrame(() => setTimeout(hide, 60));

  // Si el DOM ya está listo, ocultar ya; si no, esperar DOMContentLoaded.
  if (document.readyState === "complete" || document.readyState === "interactive") {
    quickHide();
  } else {
    document.addEventListener("DOMContentLoaded", quickHide, { once: true });
  }

  // Fallback: igual ocultar al load.
  window.addEventListener("load", hide, { once: true });

  // Cache bfcache
  window.addEventListener("pageshow", (e) => { if (e.persisted) hide(); });
})();
/* Transición entre páginas (aplica también a links del dropdown) */
(() => {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    /* no interferir con el summary del details */
    if (e.target.closest("summary")) return;

    const href = a.getAttribute("href");
    if (!href) return;
    if (href.startsWith("#")) return;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if (a.target === "_blank") return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    let url;
    try { url = new URL(href, location.href); } catch { return; }
    if (url.origin !== location.origin) return;

    const target = (url.pathname.split("/").pop() || "index.html").toLowerCase();
    if (target === currentPage()) return;

    document.querySelector("nav")?.classList.remove("open");
    document.querySelectorAll("details.drop").forEach(d => d.removeAttribute("open"));

    e.preventDefault();

    const loader = document.getElementById("pageLoader");
    if (loader) loader.classList.remove("hide");

    document.body.classList.add("isLeaving");
    setTimeout(() => { location.href = href; }, 220);
  });
})();

/* Fade candidato */
const revealCandidate = () => setTimeout(() => document.body.classList.add("revealCandidate"), 80);

/* Intro (bloquea scroll de fondo + sin marco negro) */
(() => {
  const intro = document.getElementById("intro");
  if (!intro) { revealCandidate(); return; }

  // Bloquear scroll del fondo mientras el intro está abierto
  document.documentElement.classList.add("noScroll");
  document.body.classList.add("noScroll");

  const enter = document.getElementById("introEnter");
  const skip = document.getElementById("introSkip");

  const close = () => {
    intro.classList.add("fadeOut");

    setTimeout(() => {
      intro.remove();
      document.documentElement.classList.remove("noScroll");
      document.body.classList.remove("noScroll");
      revealCandidate();
    }, 450);
  };

  enter?.addEventListener("click", close);
  skip?.addEventListener("click", close);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  setTimeout(close, 7500);
})();

/* Fade de textos/bloques a medida que scroleas */
(() => {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const nodes = Array.from(document.querySelectorAll(
    "main .section, main .panel, main .card, main .banner, main .spotText, main .spotImg, main .notice"
  ));

  nodes.forEach(n => n.classList.add("revealItem"));

  if (!("IntersectionObserver" in window)) {
    nodes.forEach(n => n.classList.add("isVisible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("isVisible");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -12% 0px" });

  nodes.forEach(n => io.observe(n));

  // ✅ Safety: si el IntersectionObserver tarda o falla, no dejamos contenido invisible.
  const forceVisible = () => {
    const vh = window.innerHeight || 0;
    nodes.forEach(n => {
      if (n.classList.contains("isVisible")) return;
      const r = n.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh * 0.98) n.classList.add("isVisible");
    });
  };

  // Entra rápido (evita “no se ven las propuestas hasta después”)
  setTimeout(forceVisible, 220);
  window.addEventListener("load", forceVisible, { once: true });
  window.addEventListener("resize", () => requestAnimationFrame(forceVisible), { passive: true });
})();

/* Datos: publicaciones + noticias (sin backend; se edita en data.js) */
(() => {
  const DATA = window.SITE_DATA || {};
  const posts = Array.isArray(DATA.posts) ? DATA.posts.slice() : [];
  const news = Array.isArray(DATA.news) ? DATA.news.slice() : [];

  const parseDate = (s) => {
    if (!s) return new Date(0);
    const d = new Date(String(s).trim() + "T00:00:00");
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const fmtDate = (s) => {
    const d = parseDate(s);
    try { return d.toLocaleDateString("es-ES"); } catch { return String(s || ""); }
  };

  const byDateDesc = (a, b) => parseDate(b.date) - parseDate(a.date);

  /* ───────────── Inicio · Publicaciones (carrusel) ───────────── */
  const track = document.getElementById("postsTrack");
  if (track) {
    const wrap = document.getElementById("postsWidget");
    const meta = document.getElementById("postsMeta");
    const btnPrev = wrap?.querySelector('.carBtn.prev');
    const btnNext = wrap?.querySelector('.carBtn.next');

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ICONS = {
      facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 22v-8h3l1-4h-4V7.5c0-1 .3-1.5 1.7-1.5H18V2.2c-.6-.1-2-.2-3.6-.2-3.2 0-5.4 2-5.4 5.6V10H6v4h3v8h4z"/></svg>`,
      instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-2.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`
    };

    const items = posts.sort(byDateDesc);

    const normIgUrl = (u) => {
      try {
        const url = new URL(String(u || "").trim());
        url.search = "";
        url.hash = "";
        // Canonical: /p/.../ o /reel/.../
        const p = url.pathname.replace(/\/+/g, "/");
        const m = p.match(/\/(p|reel)\/[^\/]+\/?/i);
        if (m) url.pathname = m[0].endsWith("/") ? m[0] : (m[0] + "/");
        return url.toString();
      } catch {
        return String(u || "").split("?")[0];
      }
    };

    const ensureInstagramEmbeds = () => {
      const process = () => {
        try { window.instgrm?.Embeds?.process?.(); } catch {}
      };

      // Ya cargado
      if (window.instgrm?.Embeds?.process) {
        setTimeout(process, 50);
        return;
      }

      // Cargar script una sola vez
      if (document.getElementById("ig-embed-script")) return;

      const s = document.createElement("script");
      s.id = "ig-embed-script";
      s.async = true;
      s.src = "https://www.instagram.com/embed.js";
      s.onload = () => setTimeout(process, 50);
      document.body.appendChild(s);
    };

    const render = () => {
      track.innerHTML = "";

      if (!items.length) {
        track.classList.add("centered");
        if (meta) meta.textContent = "Todavía no hay publicaciones cargadas.";
        btnPrev && (btnPrev.style.display = "none");
        btnNext && (btnNext.style.display = "none");
        return;
      }

      let needsIg = false;

      items.forEach(p => {
        const platform = (p.platform || "").toLowerCase();

        const isIgEmbed = platform === "instagram" && !!p.embed && !!p.url;
        if (isIgEmbed) needsIg = true;

        if (isIgEmbed) {
          const card = document.createElement("div");
          card.className = `postTile ${platform} embed`;
          card.setAttribute("aria-label", (p.title || "Publicación") + " (Instagram)");

          const permalink = normIgUrl(p.url);

          card.innerHTML = `
            <div class="pTop">
              <span class="pPlat">${ICONS[platform] || ""}<span>Instagram</span></span>
              <span class="pDate">${fmtDate(p.date)}</span>
            </div>
            <div class="pTitle">${(p.title || "").trim()}</div>
            <div class="igEmbedWrap">
              <blockquote class="instagram-media" data-instgrm-permalink="${permalink}" data-instgrm-version="14"></blockquote>
            </div>
            <div class="actions" style="margin-top:10px; justify-content:center;">
              <a class="btn soft" href="${permalink}" target="_blank" rel="noopener">Abrir en Instagram</a>
            </div>
          `;
          track.appendChild(card);
          return;
        }

        const a = document.createElement("a");
        a.className = `postTile ${platform}`;
        a.href = p.url || "#";
        if (p.url) { a.target = "_blank"; a.rel = "noopener"; }
        a.setAttribute("aria-label", (p.title || "Publicación") + " (" + platform + ")");

        a.innerHTML = `
          <div class="pTop">
            <span class="pPlat">${ICONS[platform] || ""}<span>${platform === "facebook" ? "Facebook" : platform === "instagram" ? "Instagram" : "Red"}</span></span>
            <span class="pDate">${fmtDate(p.date)}</span>
          </div>
          <div class="pTitle">${(p.title || "").trim()}</div>
        `;
        track.appendChild(a);
      });

      // Simetría: si hay 3 o menos, queda centrado y sin auto-scroll
      // Carrusel: 1 publicación por vista (siempre deslizable)
      track.classList.add("singleSlide");

      // Botones de navegación si hay más de 1 publicación
      const canNav = items.length > 1;
      if (btnPrev) btnPrev.style.display = canNav ? "inline-flex" : "none";
      if (btnNext) btnNext.style.display = canNav ? "inline-flex" : "none";

      // Auto-scroll SOLO si hay más de 3 (como pediste)
      const canAuto = items.length > 3;

      // Ya no usamos centrado, porque mostramos 1 por vista
      track.classList.remove("centered");

      if (meta) {
        meta.textContent = canAuto
          ? `Mostrando ${items.length} publicaciones. Se desplaza automáticamente.`
          : `Mostrando ${items.length} publicación${items.length === 1 ? "" : "es"}. Deslizá para ver más.`;
      }

      // Volver al inicio del carrusel al re-render
      track.scrollLeft = 0;

      // Auto-scroll SOLO si hay más de 3
      stopAuto();
      if (canAuto && !reduce) startAuto();

      // Instagram embeds (si corresponde)
      if (needsIg) ensureInstagramEmbeds();
    };

    const stepSize = () => {
      // En modo singleSlide el paso es el ancho visible del carrusel
      const r = track.getBoundingClientRect();
      return Math.ceil(r.width);
    };

    const scrollByStep = (dir) => {
      const step = stepSize();
      if (!step) return;

      const max = track.scrollWidth - track.clientWidth;
      if (dir > 0) {
        if (track.scrollLeft >= max - 4) {
          track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          track.scrollBy({ left: step, behavior: "smooth" });
        }
      } else {
        if (track.scrollLeft <= 4) {
          track.scrollTo({ left: max, behavior: "smooth" });
        } else {
          track.scrollBy({ left: -step, behavior: "smooth" });
        }
      }
    };

    btnPrev?.addEventListener("click", () => { stopAuto(); scrollByStep(-1); });
    btnNext?.addEventListener("click", () => { stopAuto(); scrollByStep(1); });

    let autoTimer = null;
    const startAuto = () => {
      stopAuto();
      if (items.length <= 3) return;
      autoTimer = setInterval(() => scrollByStep(1), 4200);
    };
    const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };

    // Pausar si el usuario interactúa (hover/touch)
    wrap?.addEventListener("mouseenter", stopAuto);
    wrap?.addEventListener("mouseleave", () => { if (items.length > 3 && !reduce) startAuto(); });
    wrap?.addEventListener("pointerdown", stopAuto, { passive:true });

    render();
  }

  /* ───────────── Inicio · Noticias (preview) ───────────── */
  const newsPreview = document.getElementById("newsPreview");
  if (newsPreview) {
    const items = news.sort(byDateDesc).slice(0, 3);

    if (!items.length) {
      newsPreview.innerHTML = `
        <div class="panel" style="text-align:center;">
          <p class="lead" style="margin:0;">Próximamente</p>
          <p class="meta" style="margin-top:10px;">Esta sección se irá completando con actividades del candidato y novedades de Piribebuy.</p>
        </div>
      `;
    } else {
      newsPreview.innerHTML = "";
      items.forEach(n => {
        const cat = (n.category || "").toLowerCase();
        const card = document.createElement("div");
        card.className = "panel newsCard";
        card.innerHTML = `
          <div class="newsTop">
            <span class="chip">${cat === "campaña" ? "Campaña" : cat === "ciudad" ? "Ciudad" : cat === "deporte" ? "Deporte" : "Noticias"}</span>
            <span class="meta">${fmtDate(n.date)}</span>
          </div>
          <h3 style="margin-top:10px;">${(n.title || "").trim()}</h3>
          <p class="meta">${(n.excerpt || "").trim()}</p>
          <div class="actions" style="margin-top:10px;">
            ${n.url ? `<a class="btn soft" href="${n.url}" target="_blank" rel="noopener">Leer más</a>` : `<a class="btn soft" href="noticias.html">Ver detalle</a>`}
          </div>
        `;
        newsPreview.appendChild(card);
      });
    }
  }

  /* ───────────── Noticias · Página completa ───────────── */
  const newsList = document.getElementById("newsList");
  if (newsList) {
    let current = "all";

    const render = () => {
      const items = news
        .sort(byDateDesc)
        .filter(n => current === "all" ? true : (String(n.category || "").toLowerCase() === current));

      newsList.innerHTML = "";
      if (!items.length) {
        newsList.innerHTML = news.length
          ? `<div class="panel" style="text-align:center;"><p class="meta" style="margin:0;">No hay noticias para esta categoría.</p></div>`
          : `
              <div class="panel" style="text-align:center;">
                <p class="lead" style="margin:0;">Próximamente</p>
                <p class="meta" style="margin-top:10px;">Apenas tengamos novedades, vas a verlas acá, ordenadas por fecha y por categoría.</p>
              </div>
            `;
        return;
      }

      items.forEach(n => {
        const cat = (n.category || "").toLowerCase();
        const el = document.createElement("article");
        el.className = "panel newsItem";
        el.innerHTML = `
          <div class="newsTop">
            <span class="chip">${cat === "campaña" ? "Campaña" : cat === "ciudad" ? "Ciudad" : cat === "deporte" ? "Deporte" : "Noticias"}</span>
            <span class="meta">${fmtDate(n.date)}</span>
          </div>
          <h3 style="margin-top:10px;">${(n.title || "").trim()}</h3>
          <p class="meta">${(n.excerpt || "").trim()}</p>
          <div class="actions" style="margin-top:10px;">
            ${n.url ? `<a class="btn soft" href="${n.url}" target="_blank" rel="noopener">Leer más</a>` : ``}
          </div>
        `;
        newsList.appendChild(el);
      });
    };

    document.querySelectorAll(".newsFilter").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".newsFilter").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        current = String(btn.getAttribute("data-cat") || "all").toLowerCase();
        render();
      });
    });

    render();
  }
})();




/* Contacto: ventana de agradecimiento al enviar */
(() => {
  // ⚠️ Importante: en el sitio hay otros formularios (p. ej. Padrón).
  // Este modal solo debe dispararse en la página de Contacto.
  if (currentPage() !== "contacto.html") return;

  const form = document.querySelector("form[data-contact-form], #contactForm");
  if (!form) return;

  const openThankYou = () => {
    const overlay = document.createElement("div");
    overlay.className = "thankOverlay";
    overlay.innerHTML = `
      <div class="thankCard" role="dialog" aria-label="Mensaje enviado">
        <div class="thankTop">
          <div class="thankIcon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M9.2 16.6 4.9 12.3l1.4-1.4 2.9 2.9 8.5-8.5 1.4 1.4-9.9 9.9z"/></svg>
          </div>
          <div>
            <h3>¡Gracias por contactarnos!</h3>
            <p>Recibimos tu mensaje. Un integrante del equipo se va a comunicar con vos a la brevedad.</p>
            <p class="meta" style="margin-top:8px;">Si dejaste tu número, te escribimos por WhatsApp o llamada.</p>
          </div>
        </div>
        <div class="thankActions">
          <button type="button" class="btn primary" id="thankClose">Entendido</button>
          <a class="btn soft" href="index.html">Volver al inicio</a>
        </div>
      </div>
    `;

    const close = () => {
      overlay.remove();
      document.documentElement.classList.remove("noScroll");
      document.body.classList.remove("noScroll");
    };

    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    overlay.querySelector("#thankClose")?.addEventListener("click", close);

    window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); }, { once:true });

    document.documentElement.classList.add("noScroll");
    document.body.classList.add("noScroll");
    document.body.appendChild(overlay);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.reset();
    openThankYou();
  });
})();


(() => {

  /* ───────────── Padrón · Consulta por cédula ───────────── */
  const padronForm = document.getElementById("padronForm");
  const padronCi = document.getElementById("padronCi");
  const padronClear = document.getElementById("padronClear");
  const padronStatus = document.getElementById("padronStatus");
  const padronResult = document.getElementById("padronResult");

  const showStatus = (msg, kind = "info") => {
    if (!padronStatus) return;
    padronStatus.style.display = msg ? "block" : "none";
    padronStatus.className = "notice" + (kind === "error" ? " danger" : kind === "ok" ? " success" : "");
    padronStatus.textContent = msg || "";
  };

  const showResult = (html) => {
    if (!padronResult) return;
    if (!html) {
      padronResult.style.display = "none";
      padronResult.innerHTML = "";
      return;
    }
    padronResult.style.display = "block";
    padronResult.innerHTML = html;
  };

  const sanitizeCI = (v) => String(v || "").replace(/[^\d]/g, "");

  // Pequeño "cooldown" en el cliente para evitar spam accidental (la defensa real es del servidor).
  let lastQueryAt = 0;

  const fetchWithTimeout = async (url, ms = 9000) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { "Accept": "application/json" } });
      return res;
    } finally {
      clearTimeout(t);
    }
  };

  if (padronForm && padronCi && padronResult) {
    // Enter en móvil: mantener el foco limpio
    padronCi.addEventListener("input", () => {
      const clean = sanitizeCI(padronCi.value);
      if (padronCi.value !== clean) padronCi.value = clean;
    });

    if (padronClear) {
      padronClear.addEventListener("click", () => {
        padronCi.value = "";
        showStatus("", "info");
        showResult("");
        padronCi.focus();
      });
    }

    padronForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastQueryAt < 1200) return; // 1.2s
      lastQueryAt = now;

      const ci = sanitizeCI(padronCi.value);
      showResult("");

      if (!ci || ci.length < 4) {
        showStatus("Ingresá una cédula válida (solo números).", "error");
        padronCi.focus();
        return;
      }

      const base = (window.APP_CONFIG && typeof window.APP_CONFIG.padronApiBase === "string")
        ? window.APP_CONFIG.padronApiBase.replace(/\/+$/, "")
        : "";
      const url = (base ? base : "") + `/api/padron?ci=${encodeURIComponent(ci)}`;

      showStatus("Buscando…", "info");

      try {
        const res = await fetchWithTimeout(url, 12000);

        if (res.status === 429) {
          showStatus("Demasiadas consultas en poco tiempo. Probá de nuevo en unos segundos.", "error");
          return;
        }
        if (!res.ok) {
          showStatus("No se pudo completar la consulta en este momento. Probá nuevamente o usá el padrón oficial.", "error");
          return;
        }

        const data = await res.json();

        if (!data || !data.found) {
          showStatus("No encontramos esa cédula en la base consultada. Verificá el número o consultá el padrón oficial.", "error");
          return;
        }

        showStatus("Resultado encontrado.", "ok");

        const safe = (s) => String(s || "").replace(/[<>&]/g, c => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"));
        const fullName = `${safe(data.apellido)} ${safe(data.nombre)}`.trim();

        const html = `
          <div class="resultHeader">
            <div>
              <div class="badge">Cédula</div>
              <h3 style="margin:8px 0 0;">${safe(data.ci)}</h3>
              <p class="meta" style="margin-top:8px;"><strong>${fullName}</strong></p>
            </div>
            <div class="resultBadges">
              <span class="badge" title="Mesa">Mesa: <strong>${safe(data.mesa)}</strong></span>
              <span class="badge" title="Orden">Orden: <strong>${safe(data.orden)}</strong></span>
            </div>
          </div>

          <div class="resultGrid">
            <div class="resultItem"><div class="meta">Departamento</div><div class="value">${safe(data.departamento)}</div></div>
            <div class="resultItem"><div class="meta">Distrito</div><div class="value">${safe(data.distrito)}</div></div>
            <div class="resultItem"><div class="meta">Sección</div><div class="value">${safe(data.seccion)}</div></div>
            <div class="resultItem"><div class="meta">Seccional</div><div class="value">${safe(data.seccional)}</div></div>
          </div>

          <div class="panel" style="margin-top:12px;">
            <div class="meta">Local de votación</div>
            <div style="font-weight:900; margin-top:6px;">${safe(data.local_votacion)}</div>
            ${data.direccion_local ? `<div class="meta" style="margin-top:6px;">${safe(data.direccion_local)}</div>` : ``}
          </div>

          <p class="meta" style="margin-top:12px;">
            Si necesitás verificar en el sitio oficial, usá el botón “Abrir padrón oficial” debajo.
          </p>
        `;

        showResult(html);
      } catch (err) {
        const msg = (err && err.name === "AbortError")
          ? "La consulta tardó demasiado. Probá nuevamente o usá el padrón oficial."
          : "Error de conexión. Probá nuevamente o usá el padrón oficial.";
        showStatus(msg, "error");
      }
    });
  }

})();
