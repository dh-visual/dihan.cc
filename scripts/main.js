// scripts/main.js

// === 英雄区背景图随滚动淡出 ===
(function () {
  const heroImage = document.querySelector(".hero-image");
  if (!heroImage) {
    console.warn("没有找到 .hero-image 元素");
    return;
  }

  function updateHeroImageOpacity() {
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    // 滚动约 0.9 屏高度时完全淡出
    const fadeDistance = viewportHeight * 0.9;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    let progress = scrollY / fadeDistance; // 0 ~ 1
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    const opacity = 1 - progress;

    heroImage.style.opacity = opacity;
    document.documentElement.style.setProperty(
      "--hero-image-opacity",
      opacity.toFixed(3)
    );
  }

  window.addEventListener("scroll", updateHeroImageOpacity);
  window.addEventListener("resize", updateHeroImageOpacity);
  updateHeroImageOpacity();
})();


// === 我的故事：标题到中心时变模糊，离开后变清晰 ===
(function () {
  const myStoryTitle = document.querySelector(".my-story-title");
  if (!myStoryTitle) return;

  function updateMyStoryBlur() {
    const rect = myStoryTitle.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    const titleCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;
    const distanceToCenter = Math.abs(titleCenter - viewportCenter);

    const blurThresholdPx = 8;
    const clearThresholdPx = viewportHeight * 0.05;

    if (distanceToCenter <= blurThresholdPx) {
      myStoryTitle.classList.add("is-blurred");
    } else if (distanceToCenter >= clearThresholdPx) {
      myStoryTitle.classList.remove("is-blurred");
    }
    // 中间的缓冲带保持当前状态，避免抖动
  }

  window.addEventListener("scroll", updateMyStoryBlur);
  window.addEventListener("resize", updateMyStoryBlur);
  updateMyStoryBlur();
})();


// === 我的故事：四张全屏图片，随滚动依次交替淡入淡出 ===
(function () {
  const section = document.querySelector(".my-story-section");
  if (!section) return;

  function updateStoryImages() {
    const rect = section.getBoundingClientRect();
    const vh =
      window.innerHeight || document.documentElement.clientHeight;

    const sectionHeight = rect.height;
    const visibleRange = sectionHeight - vh;
    let progress = 0; // 0~1，代表在「我的故事」区块里的滚动进度

    if (visibleRange <= 0) {
      progress = 1;
    } else {
      const scrolled = Math.min(
        visibleRange,
        Math.max(0, -rect.top)
      );
      progress = scrolled / visibleRange;
    }

    progress = Math.max(0, Math.min(progress, 1));

    // 旧变量随便给个值，避免其它地方引用报错
    document.documentElement.style.setProperty(
      "--story-image-scale",
      progress.toFixed(3)
    );

    // 先设一个默认值：只显示第一张
    let o1 = 1, o2 = 0, o3 = 0, o4 = 0;
    let s1 = 1, s2 = 1, s3 = 1, s4 = 1;

    // 三段淡入淡出区间：
    // 1 → 2  : 0.34 ~ 0.40
    // 2 → 3  : 0.58 ~ 0.64
    // 3 → 4  : 0.82 ~ 0.88
    // 三段淡入淡出区间（更短的过渡，更长的停留）
    const t12Start = 0.34, t12End = 0.40;  // 1 → 2
    const t23Start = 0.58, t23End = 0.64;  // 2 → 3
    const t34Start = 0.82, t34End = 0.88;  // 3 → 4


    if (progress < t12Start) {
      // 只显示第 1 张
      o1 = 1;
    } else if (progress < t12End) {
      // 第 1 → 第 2 的过渡
      const t = (progress - t12Start) / (t12End - t12Start);
      o1 = 1 - t;
      o2 = t;

      s1 = 1 + 0.05 * t;          // 旧图轻微放大后淡出
      s2 = 0.95 + 0.05 * t;       // 新图略小 → 正常
    } else if (progress < t23Start) {
      // 稳定显示第 2 张
      o2 = 1;
    } else if (progress < t23End) {
      // 第 2 → 第 3 的过渡
      const t = (progress - t23Start) / (t23End - t23Start);
      o2 = 1 - t;
      o3 = t;

      s2 = 1 + 0.05 * t;
      s3 = 0.95 + 0.05 * t;
    } else if (progress < t34Start) {
      // 稳定显示第 3 张
      o3 = 1;
    } else if (progress < t34End) {
      // 第 3 → 第 4 的过渡
      const t = (progress - t34Start) / (t34End - t34Start);
      o3 = 1 - t;
      o4 = t;

      s3 = 1 + 0.05 * t;
      s4 = 0.95 + 0.05 * t;
    } else {
      // 最后只显示第 4 张
      o4 = 1;
    }

    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--story-image1-opacity", o1.toFixed(3));
    rootStyle.setProperty("--story-image2-opacity", o2.toFixed(3));
    rootStyle.setProperty("--story-image3-opacity", o3.toFixed(3));
    rootStyle.setProperty("--story-image4-opacity", o4.toFixed(3));

    rootStyle.setProperty("--story-image1-scale", s1.toFixed(3));
    rootStyle.setProperty("--story-image2-scale", s2.toFixed(3));
    rootStyle.setProperty("--story-image3-scale", s3.toFixed(3));
    rootStyle.setProperty("--story-image4-scale", s4.toFixed(3));
  }

  window.addEventListener("scroll", updateStoryImages);
  window.addEventListener("resize", updateStoryImages);
  updateStoryImages();
})();

// === 目录页：点击右上角目录按钮，自上而下滑出纯黑整屏 ===
(function () {
  const menuBtn = document.querySelector("header .icon-menu");
  const overlay = document.querySelector("#menuOverlay");
  if (!menuBtn || !overlay) return;

  function openMenu() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function toggleMenu() {
    overlay.classList.contains("is-open") ? closeMenu() : openMenu();
  }

  menuBtn.addEventListener("click", toggleMenu);

  // ✅ 只允许点右上角关闭按钮关闭（不要点背景关闭）
  const closeBtn = overlay.querySelector(".menu-overlay__close");
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);

  // ESC 关闭（可保留）
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      closeMenu();
    }
  });

  // ✅ 点击目录里的链接：平滑滚动 + 关闭菜单
  overlay.querySelectorAll('a[data-close-menu]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

     // ✅ 页面跳转：about / contact 等
     if (href && !href.startsWith("#")) {
     // 先关菜单（避免视觉残留）
     closeMenu();

     // 然后正常跳转
      window.location.href = href;
      return;
    }

      // ✅ “主页”回到真正页面顶部（显示导航栏）
      if (href === "#top") {
        e.preventDefault();
        closeMenu();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // 其它锚点：正常滚动
      if (href && href.startsWith("#")) {
        e.preventDefault();
        closeMenu();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();

// === 目录页：自动高亮当前页面（给对应 .menu-link 加 is-active）===
(function () {
  const overlay = document.querySelector("#menuOverlay");
  if (!overlay) return;

  const links = overlay.querySelectorAll(".menu-panel .menu-link");
  if (!links.length) return;

  // 取得当前页面名：index / about / contact ...
  const pathname = window.location.pathname || "";
  const file = pathname.split("/").filter(Boolean).pop() || ""; // e.g. "about.html"
  const page =
    file === "" || file === "index.html" ? "home" :
    file === "about.html" ? "about" :
    file === "contact.html" ? "contact" :
    "other";

  function isMatch(link) {
    const href = (link.getAttribute("href") || "").trim();

    if (page === "home") {
      // 主页可能写成：#top / /#top / index.html / /
      return (
        href === "#top" ||
        href === "/#top" ||
        href === "/" ||
        href === "index.html" ||
        href === "/index.html"
      );
    }

    if (page === "about") return href.endsWith("about.html");
    if (page === "contact") return href.endsWith("contact.html");

    return false;
  }

  links.forEach((a) => {
    a.classList.remove("is-active");
    a.removeAttribute("aria-current");
  });

  const active = Array.from(links).find(isMatch);
  if (active) {
    active.classList.add("is-active");
    active.setAttribute("aria-current", "page");
  }
})();

// ===== i18n（中 / EN / IT）=====
const I18N = {
  "zh-CN": {
    menu_home: "主页",
    menu_about: "关于",
    menu_works: "作品",
    menu_notes: "杂谈",
    menu_contact: "联系",
    about_title: "我是邸涵，",
    about_tagline:
      "跨界的真实创作者，在生活与工作之间不断重塑自我。空间<br />平面、设计、建模、视频、网站、光伏……我把经历化为创作素材。<br />",
    about_p1:
      "我不追逐“艺术家”或“创业者”的头衔。我的使命是：用真实与创造<br />力，做出能帮到普通人的作品。",
    about_p2:
      "我分享：中意两地的生活、设计与建模知识、光伏项目管理、自我<br />提升方法，以及跨行业转型的经验。我希望陪伴那些和我一样重新<br />开始、努力改变生活的人。",
    about_p3: "让真实成为力量，让创造成为可能。",
    about_btn: "更多关于我",
  },
  en: {
    menu_home: "Home",
    menu_about: "About",
    menu_works: "Works",
    menu_notes: "Notes",
    menu_contact: "Contact",
    about_title: "I’m Dihan,",
    about_tagline:
  "A cross-disciplinary creator, constantly reshaping myself<br />between life and work.<br />Space, graphic design, 3D, video, web, solar PV…<br />I turn experience into creative material.",

about_p1:
  "I don’t chase labels like “artist” or “entrepreneur”.<br />My mission is to build work that truly helps ordinary people—<br />through reality and creation.",

about_p2:
  "I share life between China & Italy, design and 3D knowledge,<br />solar project management, methods for self-improvement,<br />and experience in switching industries.<br />I hope to support those who are starting over and changing their lives.",
about_p3:
  "Let reality become strength. Let creation become possible.",
  about_btn: "More about me",

    story_title: "My Story",
story_cap1: "2021.10–2024.2  Student of Visual Arts & Curatorial Practice",
story_cap2: "2023.1–2024.6  Visual / Graphic & Interior Spatial Designer",
story_cap3: "2024.10–2025.6  Restaurant Waiter",
story_cap4: "2025.7–Present  Solar PV Project Manager",

services_title: "One-Person Content Studio",
services_subtitle: "Independently creating, building, and communicating—turning a complex world into actionable work.",

svc1_title: "Real-life Documentation · Video",
svc1_desc: "I film real life and real work: designer, physical labor, cross-border living and learning.<br />No staged success—only the process, with weight.",

svc2_title: "3D & Visual Modeling",
svc2_desc: "Using tools like Blender for modeling and animation experiments—from space and structure to light and shadow,<br />turning abstract ideas into understandable forms.",

svc3_title: "Websites & Digital Presence",
svc3_desc: "I build personal and project websites end-to-end: structure, visuals, and code as one.<br />Not a template stack—an interface that expresses clarity.",

svc4_title: "Cross-Field Learning",
svc4_desc: "From design and video to languages and engineering sites, I rapidly build a mental model in new domains,<br />turning “I can’t” into the next executable step.",

svc5_title: "Cross-Cultural & Language Practice",
svc5_desc: "Living and learning in Italy long-term, I use language in real conversations—not only in textbooks.<br />For me, language is a tool to enter the world.",

svc6_title: "Long View & Self-Building",
svc6_desc: "I don’t chase quick identities or rush to be defined. Through continuous creation and learning,<br />I build my own system of skills—and my path.",

account_cta: "Find me here",
account_quote: "Across vast mountains and waters, lucky to meet you here.",

social_youtube: "YouTube",
social_instagram: "Instagram",
social_bilibili: "Bilibili",
social_more: "More links",

ext_youtube: "YOUTUBE",
ext_instagram: "INSTAGRAM",
ext_bilibili: "BILIBILI",
ext_more: "MORE LINKS",
  },
  it: {
  menu_home: "Home",
  menu_about: "Chi sono",
  menu_works: "Lavori",
  menu_notes: "Note",
  menu_contact: "Contatti",

  about_title: "Sono Dihan,",
  about_tagline:
    "Un creatore trasversale, in continua trasformazione tra vita e lavoro.<br />Spazio, grafica, 3D, video, web, fotovoltaico…<br />Trasformo l’esperienza in materiale creativo.",
  about_p1:
    "Non inseguo etichette come “artista” o “imprenditore”.<br />La mia missione è creare lavori che aiutino davvero le persone comuni—<br />attraverso la realtà e la creazione.",
  about_p2:
    "Condivido la vita tra Cina e Italia, conoscenze di design e 3D,<br />gestione di progetti fotovoltaici, metodi di crescita personale,<br />ed esperienza nel cambiare settore.<br />Vorrei sostenere chi sta ricominciando e cambiando la propria vita.",
  about_p3: "Che la realtà diventi forza. Che la creazione diventi possibile.",
  about_btn: "Più su di me",

  story_title: "La mia storia",
  story_cap1: "2021.10–2024.2  Studente di Arti Visive e Curatela",
  story_cap2: "2023.1–2024.6  Designer grafico e di spazi interni",
  story_cap3: "2024.10–2025.6  Cameriere",
  story_cap4: "2025.7–Oggi  Project manager nel fotovoltaico",

  services_title: "Studio di contenuti — one-person",
  services_subtitle:
    "Creo, costruisco e comunico in autonomia—trasformando un mondo complesso in lavori concreti.",

  svc1_title: "Documentazione reale · Video",
  svc1_desc:
    "Racconto la vita e il lavoro reali: designer, lavoro fisico, vita e studio tra paesi diversi.<br />Niente successo “messo in scena”—solo il processo, con peso.",

  svc2_title: "3D & modellazione visiva",
  svc2_desc:
    "Uso strumenti come Blender per modellazione e sperimentazioni di animazione—<br />dallo spazio e dalla struttura alla luce e all’ombra, rendendo le idee più comprensibili.",

  svc3_title: "Siti web & presenza digitale",
  svc3_desc:
    "Creo siti personali e di progetto end-to-end: struttura, visual e codice come un tutt’uno.<br />Non un template—un’interfaccia che esprime chiarezza.",

  svc4_title: "Apprendimento trasversale",
  svc4_desc:
    "Dal design e video alle lingue e ai cantieri tecnici, costruisco rapidamente un modello mentale in nuovi ambiti,<br />trasformando “non so” nel prossimo passo eseguibile.",

  svc5_title: "Pratica interculturale e linguistica",
  svc5_desc:
    "Vivo e studio in Italia a lungo termine, usando la lingua in conversazioni reali—non solo sui libri.<br />Per me la lingua è uno strumento per entrare nel mondo.",

  svc6_title: "Visione lunga & auto-costruzione",
  svc6_desc:
    "Non inseguo identità rapide né voglio essere definito in fretta. Con creazione e studio continui,<br />costruisco il mio sistema di competenze—e il mio percorso.",

  account_cta: "Mi trovi qui",
  account_quote: "Tra monti e acque lontane, che bello incontrarti qui.",

  social_youtube: "YouTube",
  social_instagram: "Instagram",
  social_bilibili: "Bilibili",
  social_more: "Altri link",

  ext_youtube: "YOUTUBE",
  ext_instagram: "INSTAGRAM",
  ext_bilibili: "BILIBILI",
  ext_more: "ALTRI LINK",
},
};

function applyTranslations(lang) {
  const dict = I18N[lang] || I18N["zh-CN"];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] != null) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (dict[key] != null) el.innerHTML = dict[key];
  });

  // 高亮当前语言项
  document.querySelectorAll(".lang-item").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });
}

// ===== 语言下拉交互 =====
(function initLangSwitch() {
  const langSwitch = document.getElementById("langSwitch");
  const langBtn = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");
  if (!langSwitch || !langBtn || !langMenu) return;

  const saved = localStorage.getItem("siteLang") || document.documentElement.lang || "zh-CN";
  document.documentElement.lang = saved;
  applyTranslations(saved);

  const open = () => langSwitch.classList.add("is-open");
  const close = () => langSwitch.classList.remove("is-open");
  const toggle = () => langSwitch.classList.toggle("is-open");

  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle();
  });

  langMenu.addEventListener("click", (e) => {
    const btn = e.target.closest(".lang-item");
    if (!btn) return;

    const lang = btn.dataset.lang || "zh-CN";
    document.documentElement.lang = lang;
    localStorage.setItem("siteLang", lang);
    applyTranslations(lang);
    close();
  });

  // 点击外部关闭（只关语言，不关你的目录页）
  document.addEventListener("click", () => close());

  // Esc 关闭
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

// === About Hero Image: Bottom-fixed linear breathing (NO side crop) ===
(function () {
  const box = document.querySelector(".motion-box");
  const img = document.querySelector(".motion-img");
  if (!box || !img) return;

  const RANGE = 14;        // 容器高度上下变化范围（px）
  const DURATION = 4000;   // 一次往返时长（ms）

  let start = null;
  let BASE_HEIGHT = 420;

  // 0→1→0 匀速三角波
  function triWave01(t01) {
    return t01 < 0.5 ? t01 * 2 : (1 - t01) * 2;
  }

  // 用“渲染后的真实高度”计算 baseHeight（和当前图片宽度匹配）
  function getRenderedImgHeight() {
    const rect = img.getBoundingClientRect();
    if (rect.height && rect.height > 0) return rect.height;

    // 兜底：用 natural 尺寸按宽度等比算高
    if (img.naturalWidth && img.naturalHeight) {
      const w = rect.width || img.clientWidth || 420;
      return (img.naturalHeight * w) / img.naturalWidth;
    }
    return 600;
  }

  function computeBaseHeight() {
    const imgH = getRenderedImgHeight();

    // 让容器“永远比图片矮”，从而只遮挡底部
    const GAP = 40; // 遮挡量：越大遮挡越多
    BASE_HEIGHT = Math.max(220, Math.round(imgH - GAP));

    box.style.height = `${BASE_HEIGHT}px`;
  }

  // 等图片渲染完成再算（两帧更稳）
  function recomputeSoon() {
    requestAnimationFrame(() => {
      computeBaseHeight();
      requestAnimationFrame(computeBaseHeight);
    });
  }

  if (img.complete) recomputeSoon();
  else img.addEventListener("load", recomputeSoon);

  function animate(ts) {
    if (!start) start = ts;

    const elapsed = (ts - start) % DURATION;
    const t01 = elapsed / DURATION;

    const wave = triWave01(t01); // 0→1→0
    const height = BASE_HEIGHT + (wave - 0.5) * 2 * RANGE;

    box.style.height = `${height}px`;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  window.addEventListener("resize", () => {
    recomputeSoon();
  });
})();

// === About Split Story: hard switch images (NO fade) ===
(function () {
  const root = document.querySelector("about.html-split-story");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll(".about-split-story__img"));
  if (slides.length <= 1) return;

  const HOLD = 2600; // 每张停留时间（ms）想慢就加大
  let idx = slides.findIndex((el) => el.classList.contains("is-active"));
  if (idx < 0) idx = 0;

  function show(next) {
    slides[idx].classList.remove("is-active");
    idx = next;
    slides[idx].classList.add("is-active");
  }

  setInterval(() => {
    show((idx + 1) % slides.length);
  }, HOLD);
})();

// ===== About Timeline hover preview (positioned) =====
(function () {
  const list = document.getElementById("timelineList");
  if (!list) return;

  const preview = document.querySelector(".about-timeline__preview");
  const img = document.querySelector(".about-timeline__preview-img");
  const rightCol = document.querySelector(".about-timeline__right");

  if (!preview || !img || !rightCol) return;

  // 移动端通常不做 hover 预览
  if (window.matchMedia("(max-width: 900px)").matches) return;

  function positionToItem(item) {
    const itemRect = item.getBoundingClientRect();
    const rightRect = rightCol.getBoundingClientRect();

    // 竖向：行中线
    const centerY = itemRect.top + itemRect.height / 2;

    // 横向：预览图的右边缘 = 右栏左边缘（紧贴）
    const previewW = preview.offsetWidth || 220;
    const leftX = rightRect.left - previewW - 1;

    preview.style.top = `${centerY}px`;
    preview.style.left = `${leftX}px`;
  }

  function showFor(item) {
    const src = item.dataset.img;
    if (src) img.src = src;
    preview.classList.add("is-visible");
    positionToItem(item);
  }

  function hide() {
    preview.classList.remove("is-visible");
  }

  list.addEventListener("mouseover", (e) => {
    const item = e.target.closest(".timeline-item");
    if (!item) return;
    showFor(item);
  });

  // 鼠标在列表内移动时，保持对齐（滚轮/字体渲染时更稳）
  list.addEventListener("mousemove", (e) => {
    const item = e.target.closest(".timeline-item");
    if (!item || !preview.classList.contains("is-visible")) return;
    positionToItem(item);
  });

  list.addEventListener("mouseleave", hide);

  // 滚动/缩放时如果仍在某行上，继续对齐
  window.addEventListener("scroll", () => {
    const hovered = list.querySelector(".timeline-item:hover");
    if (hovered && preview.classList.contains("is-visible")) positionToItem(hovered);
  }, { passive: true });

  window.addEventListener("resize", () => {
    const hovered = list.querySelector(".timeline-item:hover");
    if (hovered && preview.classList.contains("is-visible")) positionToItem(hovered);
  });
})();

// === Works: Multi-row delayed reveal (row-by-row) ===
(function () {
  const grid = document.querySelector(".works-grid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".work-card"));
  if (cards.length <= 2) return; // 只有一行就不用做

  // 读取当前 grid 的列数（支持你未来变成 1列/3列）
  function getColumnCount() {
    const cols = getComputedStyle(grid).gridTemplateColumns;
    // e.g. "1fr 1fr" / "repeat(2, minmax(0, 1fr))" 渲染后会变成多个长度值
    return cols.split(" ").filter(Boolean).length || 2;
  }

  // 按列数切成多行：[[row1...],[row2...],...]
  function buildRows() {
    const colCount = Math.max(1, getColumnCount());
    const rows = [];
    for (let i = 0; i < cards.length; i += colCount) {
      rows.push(cards.slice(i, i + colCount));
    }
    return { rows, colCount };
  }

  // 给“非首行”全部加控制类：is-reveal + 列标记（用于错峰）
  function markRevealTargets(rows, colCount) {
    rows.forEach((row, rIdx) => {
      row.forEach((card, cIdx) => {
        // 首行不隐藏
        if (rIdx === 0) return;
        card.classList.add("is-reveal", `is-col-${cIdx % colCount}`);
      });
    });
  }

  // 取某一行整体 bottom（包含图片+说明文字）
  function getRowBottom(row) {
    const bottoms = row.map((el) => el.getBoundingClientRect().bottom);
    return Math.max.apply(null, bottoms);
  }

  let unlockedRowIndex = 0; // 已解锁到第几行（0=首行默认可见）

  function unlockRow(rows, idx) {
    if (!rows[idx]) return;
    rows[idx].forEach((el) => el.classList.add("is-unlocked"));
  }

  function onScroll() {
    const { rows } = state;
    if (unlockedRowIndex >= rows.length - 1) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      return;
    }

    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const midline = vh / 2;

    // 触发条件：上一行整体底部 < 视窗中线
    const prevRow = rows[unlockedRowIndex];
    const prevBottom = getRowBottom(prevRow);

    if (prevBottom < midline) {
      unlockedRowIndex += 1;
      unlockRow(rows, unlockedRowIndex);
    }
  }

  // 初始化
  let state = buildRows();
  markRevealTargets(state.rows, state.colCount);

  // 等一帧再开启 transition，避免首帧误触发
  requestAnimationFrame(() => {
    document.body.classList.add("works-reveal-ready");
  });

  // 首次检查 + 监听
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    // 如果你未来会在 resize 时从 2列变 1列，这里重建 rows 更稳
    state = buildRows();
    // 注意：已解锁的行保持 unlockedRowIndex 不变即可
    onScroll();
  });

  onScroll();
})();