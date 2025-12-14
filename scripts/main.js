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
  const menuBtn = document.querySelector(".icon-menu");
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

      // ✅ “关于”暂时不跳转：只关菜单
      if (href === "#about") {
        e.preventDefault();
        closeMenu();
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

// ===== i18n（中 / EN / IT）=====
const I18N = {
  "zh-CN": {
    menu_home: "主页",
    menu_about: "关于",
    menu_works: "作品",
    menu_notes: "杂谈",
    menu_contact: "联络",
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
