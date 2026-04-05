const loader = document.getElementById("page-loader");

const TRACKS = [
  {
    title: "Mortal",
    description: "A dark pulse-forward cut carried by tension and weight.",
    file: "assets/audio/Mortal.mp3"
  },
  {
    title: "Burn It Down",
    description: "Raw motion and pressure with a scorched edge.",
    file: "assets/audio/Burn it Down.mp3"
  },
  {
    title: "Hey There Fellas My Name Is Death",
    description: "A theatrical, grin-through-the-dark kind of track.",
    file: "assets/audio/Hey there fellas my name is Death.mp3"
  },
  {
    title: "Redline Heart",
    description: "Momentum, ache, and movement welded together.",
    file: "assets/audio/Redline Heart.mp3"
  },
  {
    title: "Love Is Not Theirs to Murder",
    description: "Brooding, heavy, and unashamedly cinematic.",
    file: "assets/audio/Love Is Not Theirs to Murder.mp3"
  },
  {
    title: "Sinful Love",
    description: "A darker romantic current with teeth beneath the surface.",
    file: "assets/audio/Sinful Love.mp3"
  },
  {
    title: "Whispers and Webstrings",
    description: "A haunted, tension-laced piece built on texture and pull.",
    file: "assets/audio/Whispers and Webstrings.mp3"
  },
  {
    title: "Help",
    description: "Urgent, stripped down, and emotionally direct.",
    file: "assets/audio/Help.mp3"
  },
  {
    title: "Darker Than the Devil",
    description: "Heavy atmosphere with a sharper shadow line.",
    file: "assets/audio/Darker Than the Devil.mp3"
  },
  {
    title: "My Name is Death",
    description: "A separate cut carrying the Death motif in a more direct form.",
    file: "assets/audio/My Name is Death.mp3"
  },
  {
    title: "Bleeding Different (Requiem for the Living)",
    description: "Elegiac, cinematic, and built with a funeral pulse.",
    file: "assets/audio/Bleeding Different (Requiem for the Living).mp3"
  },
  {
    title: "The Pebble (Version 1)",
    description: "A first take from the Pebble line kept as its own vault entry.",
    file: "assets/audio/The Pebble (1).mp3"
  },
  {
    title: "The Pebble",
    description: "The main Pebble version kept as a separate track entry.",
    file: "assets/audio/The Pebble.mp3"
  },
  {
    title: "The New",
    description: "A transition piece pointed toward a newer shape of the project.",
    file: "assets/audio/The New (1).mp3"
  },
  {
    title: "Fuck you!",
    description: "Confrontational and blunt by design.",
    file: "assets/audio/Fuck you!.mp3"
  }
];

window.addEventListener("load", () => {
  setTimeout(() => loader.classList.add("loaded"), 700);
  renderTracks();
  initAudioPlayers();
  initAmbientCanvas();
  initGallery();
  initLightbox();
});

window.addEventListener("resize", initAmbientCanvas);

function renderTracks() {
  const grid = document.getElementById("track-grid");
  if (!grid) return;

  grid.innerHTML = TRACKS.map((track, index) => {
    const id = `audio-${index + 1}`;
    const roman = toRoman(index + 1);

    return `
      <article class="track-card">
        <div class="headstone-top">
          <span class="track-index">Track ${roman}</span>
          <span class="track-time" data-duration-for="${id}">--:--</span>
        </div>

        <h3>${escapeHtml(track.title)}</h3>
        <p>${escapeHtml(track.description)}</p>

        <audio
          data-audio-id="${id}"
          preload="metadata"
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablepictureinpicture
          disableremoteplayback
        >
          <source src="${track.file}" type="audio/mpeg">
        </audio>

        <div class="player-shell">
          <button class="play-toggle" data-target="${id}" aria-label="Play ${escapeHtml(track.title)}">
            <span class="icon-play">▶</span>
            <span class="icon-pause">❚❚</span>
          </button>
          <div class="progress-wrap" data-seek="${id}">
            <div class="progress-bar">
              <span class="progress-fill" data-progress="${id}"></span>
            </div>
            <div class="time-row">
              <span data-current-for="${id}">00:00</span>
              <span>${escapeHtml(track.title)}</span>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function initAudioPlayers() {
  const audios = [...document.querySelectorAll("audio[data-audio-id]")];

  const fmt = (secs) => {
    if (!isFinite(secs)) return "--:--";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const stopOthers = (currentId) => {
    audios.forEach((audio) => {
      if (audio.dataset.audioId !== currentId) {
        audio.pause();
        const btn = document.querySelector(`button[data-target="${audio.dataset.audioId}"]`);
        if (btn) btn.classList.remove("playing");
      }
    });
  };

  audios.forEach((audio) => {
    const id = audio.dataset.audioId;
    const durationEl = document.querySelector(`[data-duration-for="${id}"]`);
    const currentEl = document.querySelector(`[data-current-for="${id}"]`);
    const progressEl = document.querySelector(`[data-progress="${id}"]`);
    const btn = document.querySelector(`button[data-target="${id}"]`);
    const seek = document.querySelector(`[data-seek="${id}"]`);

    audio.addEventListener("loadedmetadata", () => {
      if (durationEl) durationEl.textContent = fmt(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      if (currentEl) currentEl.textContent = fmt(audio.currentTime);
      if (progressEl) {
        const ratio = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progressEl.style.width = `${ratio}%`;
      }
    });

    audio.addEventListener("ended", () => {
      if (btn) btn.classList.remove("playing");
      if (progressEl) progressEl.style.width = "0%";
      if (currentEl) currentEl.textContent = "00:00";
    });

    if (btn) {
      btn.addEventListener("click", () => {
        if (audio.paused) {
          stopOthers(id);
          audio.play();
          btn.classList.add("playing");
        } else {
          audio.pause();
          btn.classList.remove("playing");
        }
      });
    }

    if (seek) {
      seek.addEventListener("click", (e) => {
        const rect = seek.getBoundingClientRect();
        const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        if (audio.duration) audio.currentTime = audio.duration * ratio;
      });
    }
  });
}

let ambientInitialized = false;

function initAmbientCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  const ctx = canvas.getContext("2d");

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.max(150, Math.floor((w * h) / 12000));
  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.6 + 0.35,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    a: Math.random() * 0.50 + 0.12,
    hue:
      Math.random() > 0.74
        ? "warm"
        : Math.random() > 0.5
        ? "violet"
        : "cool",
  }));

  if (ambientInitialized) cancelAnimationFrame(window.__ambientRAF);
  ambientInitialized = true;

  const render = () => {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -3) p.x = w + 3;
      if (p.x > w + 3) p.x = -3;
      if (p.y < -3) p.y = h + 3;
      if (p.y > h + 3) p.y = -3;

      ctx.beginPath();

      const fill =
        p.hue === "warm"
          ? `rgba(176,72,47,${p.a})`
          : p.hue === "violet"
          ? `rgba(139,89,178,${p.a})`
          : `rgba(198,220,255,${p.a})`;

      ctx.fillStyle = fill;
      ctx.shadowBlur = 12;
      ctx.shadowColor = fill;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    window.__ambientRAF = requestAnimationFrame(render);
  };

  render();
}

function initGallery() {
  const galleryGrid = document.getElementById("gallery-grid");
  if (!galleryGrid) return;

  const baseImages = [
    { src: "assets/images/studio-guitar.png", title: "Studio Guitar" },
    { src: "assets/images/live-black-guitar.jpg", title: "Live Black Guitar" },
    { src: "assets/images/live-stage-full.jpg", title: "Live Stage" },
    { src: "assets/images/les-paul-close-1.jpg", title: "Les Paul Close I" },
    { src: "assets/images/les-paul-close-2.jpg", title: "Les Paul Close II" },
    { src: "assets/images/logo-skull-floral.jpg", title: "Skull Floral" },
    { src: "assets/images/graveyard-red-moon.png", title: "Graveyard Red Moon" },
    { src: "assets/images/graveyard-blue-moon.png", title: "Graveyard Blue Moon" },
    { src: "assets/images/banner-dark-1.png", title: "Dark Banner I" },
    { src: "assets/images/banner-dark-2.png", title: "Dark Banner II" },
    { src: "assets/images/voodoo-portrait.png", title: "Voodoo Portrait" }
  ];

  const galleryFolder = "assets/images/gallery/";
  const galleryImages = [
    "mrvoodoo_Alien_with_unique_and_expressive_features_set_in_a_p_e6c1f175-6cd9-43dc-971f-bc5d42edbf9c_2.png",
    "mrvoodoo_generate_a_rock_band_logo._Dark_modern_look_and_styl_b9154b05-1d35-4372-a7fa-cb73d0b74056_0.png",
    "mrvoodoo_httpss.mj.run-F8Y9mJYOyQ_generate_a_rock_band_logo.__62568f0a-c9ce-4b7a-84c5-0c943f828536_0.png",
    "mrvoodoo_httpss.mj.run-L56rUvVUvY_blurred_people_from_dark_in_8fdea697-b87e-4778-b2b7-cea09a0ec922_1.png",
    "mrvoodoo_httpss.mj.run-hGRBZcZDDY_A_dark_intense_nightclub_sc_a3c2dc66-6ec8-49a9-9c8d-ff48ba294d87_0.png",
    "mrvoodoo_httpss.mj.run-hGRBZcZDDY_A_dark_intense_nightclub_sc_a3c2dc66-6ec8-49a9-9c8d-ff48ba294d87_1.png",
    "mrvoodoo_httpss.mj.run-hGRBZcZDDY_A_dark_intense_nightclub_sc_a3c2dc66-6ec8-49a9-9c8d-ff48ba294d87_2.png",
    "mrvoodoo_httpss.mj.run22FCoiN4hrg_one_vertical_line_in_an_ori_a2fcb6e2-79ba-4868-b8a0-29cc6786fe33_1.png",
    "mrvoodoo_httpss.mj.run22FCoiN4hrg_one_vertical_line_in_an_ori_a2fcb6e2-79ba-4868-b8a0-29cc6786fe33_2.png",
    "mrvoodoo_httpss.mj.run3FxHwTE3YF0_gothic_mysterious_gravedigg_89d4df66-0066-4410-b098-a8ea4b4ac643_0.png",
    "mrvoodoo_httpss.mj.run9yVe4KywMoU_pink_technology_background__765e6e55-0887-47b0-b17a-74b4a1a300fc_0.png",
    "mrvoodoo_httpss.mj.runChhiwltbQbw_a_tipography_for_my_Modern__70c28d29-2a08-4d39-a4f4-1e14254f6ecf_0.png",
    "mrvoodoo_httpss.mj.runE3zO9Trp0Lo_black_and_white_image_close_9d881c66-d9fe-4123-b453-a0ff95838443_0.png",
    "mrvoodoo_httpss.mj.runHTRAfoBQzEk_The_Masked_Maestro_-_A_circ_0a21cb44-d97f-4091-ad2b-06f562ba1c26_1.png",
    "mrvoodoo_httpss.mj.runK-1LFzHyxg4_highly_detailed_illustratio_226cb360-382b-415d-b603-943c9db8c5a4_0.png",
    "mrvoodoo_httpss.mj.runMWSC4TgYrMA_generate_a_rock_band_logo.__3f39cd9e-b73b-46ef-a262-20ab9a15bf1f_3.png",
    "mrvoodoo_httpss.mj.runQbSlVMwTRqI_a_band_plays_onstage_but_ev_ecac231e-3ac2-43fe-aa4c-91f6dc16d766_0.png",
    "mrvoodoo_httpss.mj.runS546hBe2HCo_a_empty_electronic_music_ve_9ecced12-817b-4670-877d-748a8d47b470_0.png",
    "mrvoodoo_httpss.mj.runSuIe7GG2ks8_Create_a_hyper-realistic_im_25b097b7-7a83-4373-973d-2f3412e910c8_1.png",
    "mrvoodoo_httpss.mj.runSuIe7GG2ks8_Create_a_hyper-realistic_im_25b097b7-7a83-4373-973d-2f3412e910c8_2.png",
    "mrvoodoo_httpss.mj.runSuIe7GG2ks8_Create_a_hyper-realistic_im_25b097b7-7a83-4373-973d-2f3412e910c8_3.png",
    "mrvoodoo_httpss.mj.runUJCpBfF_KIc_Artwork_vintage_rock_music__b02ee841-176b-4135-8113-018e831673a3_0.png",
    "mrvoodoo_httpss.mj.runUJCpBfF_KIc_Artwork_vintage_rock_music__b02ee841-176b-4135-8113-018e831673a3_1.png",
    "mrvoodoo_httpss.mj.runUjKH22M8Ti8_create_a_simple_Lissajous_i_746db23b-de08-46b5-b2f1-ddcb0043a3da_1.png",
    "mrvoodoo_httpss.mj.runXKwUulUjl10_science_--ar_32_--raw_--sre_870cfde6-cbcb-46e4-bcb1-4f19af3f7682_0.png",
    "mrvoodoo_httpss.mj.runXKwUulUjl10_science_--ar_32_--raw_--sre_d37f41d1-8391-412f-86a2-1a7f793e4201_1.png",
    "mrvoodoo_httpss.mj.runXKwUulUjl10_science_--ar_32_--raw_--sre_d37f41d1-8391-412f-86a2-1a7f793e4201_3.png",
    "mrvoodoo_httpss.mj.run_Fs1-kOzGIg_sacred_geometry__Love_Insta_45deda39-d474-4bb1-ae8a-3cc814b2f8d0_2.png",
    "mrvoodoo_httpss.mj.run_KwUJMAQeGc_A_glowing_geometric_pyramid_5332daf2-eafb-4554-ac98-8633d8369744_0.png",
    "mrvoodoo_httpss.mj.run_gLvbtqnmZk_open_shot_photorealistic_ni_9eff2b2f-78d7-4baa-8dc2-550b1cc27186_0.png",
    "mrvoodoo_httpss.mj.run_gLvbtqnmZk_open_shot_photorealistic_ni_9eff2b2f-78d7-4baa-8dc2-550b1cc27186_1.png",
    "mrvoodoo_httpss.mj.run_gLvbtqnmZk_open_shot_photorealistic_ni_9eff2b2f-78d7-4baa-8dc2-550b1cc27186_2.png",
    "mrvoodoo_httpss.mj.run_gLvbtqnmZk_open_shot_photorealistic_ni_9eff2b2f-78d7-4baa-8dc2-550b1cc27186_3.png",
    "mrvoodoo_httpss.mj.runbrNCtko4Jl0_minimalistic_oval_geometric_fc482b20-70d2-41da-81c8-fe1ddfdc63ec_1.png",
    "mrvoodoo_httpss.mj.rund6_z5b33JgQ_Una_persona_al_centro_di_un_2400bca8-fad6-4d19-ac2e-c605ae358a34_0.png",
    "mrvoodoo_httpss.mj.runefFBp8tJ8z0_darklordLove_Instagood_Phot_6cb54e61-2c13-4260-a847-2a4aa2449bae_1.png",
    "mrvoodoo_httpss.mj.runefFBp8tJ8z0_darklordLove_Instagood_Phot_6cb54e61-2c13-4260-a847-2a4aa2449bae_2.png",
    "mrvoodoo_httpss.mj.runefFBp8tJ8z0_darklordLove_Instagood_Phot_6cb54e61-2c13-4260-a847-2a4aa2449bae_3.png",
    "mrvoodoo_httpss.mj.runfae_tvGagoA_logomarca_com_as_letras_DD__dca404b1-e45a-41c6-98d0-6dfb424e9813_0.png",
    "mrvoodoo_httpss.mj.runnI5M8UFwrL0_Ultra_Detailed_very_complex_a543a575-7281-4527-b45c-fe19dd8d8571_0.png",
    "mrvoodoo_httpss.mj.runsJO0zENoJX0_male_wearing_purple_dia_de__c5743c70-026d-4e88-a4f5-73f03608f9db_0.png",
    "mrvoodoo_httpss.mj.runvehaZUAQoNc_logo_for_clothing_brand_foc_eccab13a-1400-4ae0-96c1-58efeff18c40_1.png",
    "mrvoodoo_httpss.mj.runvehaZUAQoNc_logo_for_clothing_brand_foc_eccab13a-1400-4ae0-96c1-58efeff18c40_2.png",
    "mrvoodoo_httpss.mj.runvehaZUAQoNc_logo_for_clothing_brand_foc_eccab13a-1400-4ae0-96c1-58efeff18c40_3.png",
    "mrvoodoo_httpss.mj.runwSiwFjMoY2g_Abstract_scene_with_lazer_l_22f6d671-ceda-41d5-b17e-e41f1b4ad6c5_2.png",
    "mrvoodoo_the_DMT_psychedelic_3d_render_of_meditator_and_the_r_69daa734-4856-410b-a2fd-4177c4963935_2.png",
    "mrvoodoo_the_DMT_psychedelic_3d_render_of_meditator_and_the_r_8e8bc25a-e996-4625-82b7-d5be6bc7655f_1.png",
    "mrvoodoo_voodoo_themed_banner_for_rock_band_New_Voodoo._Dark__444023f2-5973-4a58-a651-da16304a5da3_1.png",
    "mrvoodoo_voodoo_themed_banner_for_rock_band_New_Voodoo._Dark__444023f2-5973-4a58-a651-da16304a5da3_2.png",
    "mrvoodoo_voodoo_themed_banner_for_rock_band_New_Voodoo._Dark__444023f2-5973-4a58-a651-da16304a5da3_3.png",
    "mrvoodoo_voodoo_themed_banner_for_rock_band_New_Voodoo._Dark__ada37d55-3105-4165-87b6-44af7befd03a_2.png",
    "mrvoodoo_voodoo_themed_banner_for_rock_band_New_Voodoo._Dark__ada37d55-3105-4165-87b6-44af7befd03a_3.png",
    "mrvoodoo_voodoo_themed_banner_for_rock_band_New_Voodoo._Dark__de7d241b-e148-41e2-a5b4-d6dc40f1fac7_0.png",
    "mrvoodoo_voodoo_themed_banner_for_rock_band_New_Voodoo._Dark__de7d241b-e148-41e2-a5b4-d6dc40f1fac7_1.png",
    "mrvoodoo_voodoo_themed_banner_for_rock_band_New_Voodoo._Dark__de7d241b-e148-41e2-a5b4-d6dc40f1fac7_2.png",
    "mrvoodoo_voodoo_themed_banner_for_rock_band_New_Voodoo._Dark__de7d241b-e148-41e2-a5b4-d6dc40f1fac7_3.png",
    "mrvoodoo_voodoo_themed_banner_for_rock_band_New_Voodoo._New_V_3cb81308-5578-4e94-a30f-1eb91c8b74f5_2.png"
  ];

  const images = [
    ...baseImages,
    ...galleryImages.map((file) => ({
      src: galleryFolder + file,
      title: file.replace(/\.[^/.]+$/, "").replace(/[_\.]+/g, " ")
    }))
  ];

  galleryGrid.innerHTML = images.map((img) => `
    <button class="gallery-card" type="button" data-lightbox="${img.src}" data-title="${escapeHtml(img.title)}" aria-label="Open ${escapeHtml(img.title)}">
      <img src="${img.src}" alt="${escapeHtml(img.title)}" loading="lazy">
    </button>
  `).join("");
}

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-image");
  const caption = document.getElementById("lightbox-caption");
  const closeBtn = document.querySelector(".lightbox-close");

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    image.src = "";
    image.alt = "";
    caption.textContent = "";
  };

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-lightbox]");
    if (opener) {
      image.src = opener.dataset.lightbox;
      image.alt = opener.dataset.title || "Expanded gallery image";
      caption.textContent = opener.dataset.title || "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    }

    if (e.target === lightbox || e.target === closeBtn) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

function toRoman(num) {
  const map = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
  ];
  let result = "";
  for (const [value, numeral] of map) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}