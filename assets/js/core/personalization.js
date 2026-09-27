(function () {
  "use strict";
  var K = "books.settings.v1";

  var THEMES = [
    {
      id: "dark",
      label: "Padrão Escuro",
      family: "base",
      mode: "dark",
      swatch: ["#0b0f14", "#182430", "#eef3f8", "#76a9fa"],
    },
    {
      id: "light",
      label: "Padrão Claro",
      family: "base",
      mode: "light",
      colorScheme: "light",
      swatch: ["#f4f6f9", "#ffffff", "#10161c", "#2f6fe0"],
    },
    {
      id: "dracula",
      label: "Dracula",
      family: "dracula",
      mode: "dark",
      swatch: ["#282a36", "#44475a", "#f8f8f2", "#bd93f9"],
    },
    {
      id: "nord",
      label: "Nord",
      family: "nord",
      mode: "dark",
      swatch: ["#2e3440", "#3b4252", "#eceff4", "#88c0d0"],
    },
    {
      id: "catppuccin-mocha",
      label: "Catppuccin Mocha",
      family: "catppuccin",
      mode: "mocha",
      swatch: ["#1e1e2e", "#313244", "#cdd6f4", "#cba6f7"],
    },
    {
      id: "catppuccin-latte",
      label: "Catppuccin Latte",
      family: "catppuccin",
      mode: "latte",
      colorScheme: "light",
      swatch: ["#eff1f5", "#e6e9ef", "#4c4f69", "#1e66f5"],
    },
    {
      id: "gruvbox-dark",
      label: "Gruvbox Escuro",
      family: "gruvbox",
      mode: "dark",
      swatch: ["#282828", "#3c3836", "#ebdbb2", "#fe8019"],
    },
    {
      id: "gruvbox-light",
      label: "Gruvbox Claro",
      family: "gruvbox",
      mode: "light",
      colorScheme: "light",
      swatch: ["#fbf1c7", "#f2e5bc", "#3c3836", "#d65d0e"],
    },
    {
      id: "solarized-dark",
      label: "Solarized Escuro",
      family: "solarized",
      mode: "dark",
      swatch: ["#002b36", "#073642", "#93a1a1", "#268bd2"],
    },
    {
      id: "solarized-light",
      label: "Solarized Claro",
      family: "solarized",
      mode: "light",
      colorScheme: "light",
      swatch: ["#fdf6e3", "#eee8d5", "#586e75", "#268bd2"],
    },
    {
      id: "tokyo-night",
      label: "Tokyo Night",
      family: "tokyo-night",
      mode: "dark",
      swatch: ["#1a1b26", "#292e42", "#c0caf5", "#7aa2f7"],
    },
    {
      id: "monokai",
      label: "Monokai",
      family: "monokai",
      mode: "dark",
      swatch: ["#272822", "#3e3d32", "#f8f8f2", "#a6e22e"],
    },
    {
      id: "one-dark",
      label: "One Dark",
      family: "one-dark",
      mode: "dark",
      swatch: ["#282c34", "#2c313c", "#abb2bf", "#61afef"],
    },
    {
      id: "rose-pine",
      label: "Rosé Pine",
      family: "rose-pine",
      mode: "dark",
      swatch: ["#191724", "#1f1d2e", "#e0def4", "#c4a7e7"],
    },
    {
      id: "github-dark",
      label: "GitHub Escuro",
      family: "github",
      mode: "dark",
      swatch: ["#0d1117", "#161b22", "#c9d1d9", "#58a6ff"],
    },
    {
      id: "github-dimmed",
      label: "GitHub Dimmed",
      family: "github",
      mode: "dimmed",
      swatch: ["#22272e", "#2d333b", "#adbac7", "#539bf5"],
    },
    {
      id: "github-light",
      label: "GitHub Claro",
      family: "github",
      mode: "light",
      colorScheme: "light",
      swatch: ["#ffffff", "#f6f8fa", "#1f2328", "#0969da"],
    },
    {
      id: "everforest",
      label: "Everforest",
      family: "everforest",
      mode: "dark",
      swatch: ["#2d353b", "#343f44", "#d3c6aa", "#a7c080"],
    },
    {
      id: "amoled",
      label: "AMOLED",
      family: "amoled",
      mode: "dark",
      swatch: ["#000000", "#121212", "#f2f2f2", "#22d3ee"],
    },
    {
      id: "discord",
      label: "Discord",
      family: "discord",
      mode: "dark",
      swatch: ["#36393f", "#2f3136", "#dcddde", "#5865f2"],
    },
    {
      id: "miku",
      label: "Hatsune Miku",
      family: "miku",
      mode: "dark",
      swatch: ["#102a35", "#173f4a", "#e5fbfa", "#39c5bb"],
    },
    {
      id: "miku-light",
      label: "Hatsune Miku Claro",
      family: "miku",
      mode: "light",
      colorScheme: "light",
      swatch: ["#e9fbfa", "#ffffff", "#164b55", "#119b94"],
    },
    {
      id: "rock",
      label: "Rock",
      family: "rock",
      mode: "dark",
      swatch: ["#16161a", "#29252b", "#f4e9d8", "#d95d39"],
    },
    {
      id: "rock-light",
      label: "Rock Claro",
      family: "rock",
      mode: "light",
      colorScheme: "light",
      swatch: ["#f5efe8", "#fffaf4", "#302a2d", "#b6402a"],
    },
  ];

  var THEME_VARIANTS = {
    base: { dark: "dark", light: "light" },
    github: {
      dark: "github-dark",
      dimmed: "github-dimmed",
      light: "github-light",
    },
    solarized: { dark: "solarized-dark", light: "solarized-light" },
    catppuccin: { mocha: "catppuccin-mocha", latte: "catppuccin-latte" },
    gruvbox: { dark: "gruvbox-dark", light: "gruvbox-light" },
    miku: { dark: "miku", light: "miku-light" },
    rock: { dark: "rock", light: "rock-light" },
  };
  Object.keys(THEME_VARIANTS).forEach(function (family) {
    Object.keys(THEME_VARIANTS[family]).forEach(function (mode) {
      var theme = THEMES.find(function (item) {
        return item.id === THEME_VARIANTS[family][mode];
      });
      if (theme) {
        theme.family = family;
        theme.mode = mode;
      }
    });
  });

  var BACKGROUNDS = [
    { id: "none", label: "Nenhum (liso)" },
    { id: "dots", label: "Pontos" },
    { id: "grid", label: "Grade" },
    { id: "graph", label: "Papel milimetrado" },
    { id: "diagonal", label: "Linhas diagonais" },
    { id: "checker", label: "Xadrez" },
    { id: "honeycomb", label: "Favo de mel" },
    { id: "waves", label: "Ondas" },
    { id: "stars", label: "Estrelas" },
    { id: "aurora", label: "Aurora" },
    { id: "noise", label: "Textura granulada" },
  ];

  var FONTS = [
    {
      id: "system",
      label: "Padrão do projeto",
      cat: "Padrão",
      body: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
      display: "'Space Grotesk', 'IBM Plex Sans', system-ui, sans-serif",
    },
    {
      id: "inter",
      label: "Inter",
      cat: "Sans-serif",
      google: "Inter:wght@400;500;600;700",
      body: "'Inter', system-ui, sans-serif",
      display: "'Inter', system-ui, sans-serif",
    },
    {
      id: "nunito",
      label: "Nunito",
      cat: "Sans-serif arredondada",
      google: "Nunito:wght@400;600;700;800",
      body: "'Nunito', system-ui, sans-serif",
      display: "'Nunito', system-ui, sans-serif",
    },
    {
      id: "lora",
      label: "Lora",
      cat: "Serifada · leitura",
      google: "Lora:wght@400;500;600;700",
      body: "'Lora', Georgia, serif",
      display: "'Lora', Georgia, serif",
    },
    {
      id: "merriweather",
      label: "Merriweather",
      cat: "Serifada · leitura",
      google: "Merriweather:wght@400;700",
      body: "'Merriweather', Georgia, serif",
      display: "'Merriweather', Georgia, serif",
    },
    {
      id: "fira-code",
      label: "Fira Code",
      cat: "Monoespaçada",
      google: "Fira+Code:wght@400;500;600",
      body: "'Fira Code', 'SFMono-Regular', monospace",
      display: "'Fira Code', 'SFMono-Regular', monospace",
    },
    {
      id: "jetbrains-mono",
      label: "JetBrains Mono",
      cat: "Monoespaçada",
      google: "JetBrains+Mono:wght@400;500;700",
      body: "'JetBrains Mono', 'SFMono-Regular', monospace",
      display: "'JetBrains Mono', 'SFMono-Regular', monospace",
    },
    {
      id: "press-start",
      label: "Press Start 2P",
      cat: "Retrô · arcade",
      google: "Press+Start+2P",
      body: "'Press Start 2P', monospace",
      display: "'Press Start 2P', monospace",
    },
    {
      id: "pixelify",
      label: "Pixelify Sans (estilo Minecraft)",
      cat: "Estilo de jogo",
      google: "Pixelify+Sans:wght@400;500;600;700",
      body: "'Pixelify Sans', monospace",
      display: "'Pixelify Sans', monospace",
    },
    {
      id: "silkscreen",
      label: "Silkscreen (retrô · estilo Terraria)",
      cat: "Estilo de jogo",
      google: "Silkscreen:wght@400;700",
      body: "'Silkscreen', monospace",
      display: "'Silkscreen', monospace",
    },
    {
      id: "vt323",
      label: "VT323 (terminal pixelado)",
      cat: "Estilo de jogo",
      google: "VT323",
      body: "'VT323', monospace",
      display: "'VT323', monospace",
    },
  ];

  var defaults = {
    theme: "github-dark",
    themeMode: "dark",
    themeIntensity: 70,
    background: "none",
    font: "system",
    focus: {
      background: "solid",
      hideDock: true,
      hideToc: true,
      scale: 1.08,
      width: "comfortable",
    },
    keybinds: {
      next: "Alt+ArrowRight",
      previous: "Alt+ArrowLeft",
      focus: "Alt+f",
    },
  };
  var current = Object.assign({}, defaults);
  var loaded = {};

  function byId(list, id) {
    return (
      list.find(function (x) {
        return x.id === id;
      }) || list[0]
    );
  }
  function themeById(id) {
    return byId(THEMES, id);
  }
  function themeVariant(theme, mode) {
    var family = theme && theme.family;
    var variants = family && THEME_VARIANTS[family];
    var id = variants && variants[mode];
    if (!id && variants)
      id = variants[theme && theme.mode] || variants.dark || variants.light;
    return id ? themeById(id) : theme;
  }
  function backgroundById(id) {
    return byId(BACKGROUNDS, id);
  }
  function fontById(id) {
    return byId(FONTS, id);
  }

  var CUSTOM_THEME_KEY = "books.customThemes.v1";
  var CUSTOM_BG_KEY = "books.customBackgrounds.v1";
  var CUSTOM_FONT_KEY = "books.customFonts.v1";
  var THEME_VAR_NAMES = [
    "--bg",
    "--bg-elevated",
    "--panel",
    "--panel-2",
    "--panel-3",
    "--border",
    "--border-soft",
    "--text",
    "--text-dim",
    "--text-faint",
    "--accent",
  ];
  var BG_VAR_NAMES = ["--pattern-a", "--pattern-b", "--pattern-c"];

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      String(hex || "").trim(),
    );
    return m
      ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
      : [0, 0, 0];
  }
  function mix(hexA, hexB, t) {
    var a = hexToRgb(hexA),
      b = hexToRgb(hexB);
    return (
      "rgb(" +
      Math.round(a[0] + (b[0] - a[0]) * t) +
      "," +
      Math.round(a[1] + (b[1] - a[1]) * t) +
      "," +
      Math.round(a[2] + (b[2] - a[2]) * t) +
      ")"
    );
  }
  function rgbaHex(hex, alpha) {
    var c = hexToRgb(hex);
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + alpha + ")";
  }
  function luminance(hex) {
    var c = hexToRgb(hex);
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
  }

  function buildThemeVars(bg, panel, text, accent) {
    var vars = {};
    vars["--bg"] = bg;
    vars["--bg-elevated"] = mix(bg, panel, 0.5);
    vars["--panel"] = panel;
    vars["--panel-2"] = mix(panel, text, 0.05);
    vars["--panel-3"] = mix(panel, text, 0.11);
    vars["--border"] = mix(bg, text, 0.18);
    vars["--border-soft"] = mix(bg, text, 0.1);
    vars["--text"] = text;
    vars["--text-dim"] = mix(text, bg, 0.3);
    vars["--text-faint"] = mix(text, bg, 0.55);
    vars["--accent"] = accent;
    return vars;
  }

  function loadCustomList(key) {
    var v = Books.store.read(key, []);
    return Array.isArray(v) ? v : [];
  }
  var customThemes = loadCustomList(CUSTOM_THEME_KEY);
  var customBackgrounds = loadCustomList(CUSTOM_BG_KEY);
  var customFonts = loadCustomList(CUSTOM_FONT_KEY);
  customThemes.forEach(function (t) {
    t.custom = true;
    THEMES.push(t);
  });
  customBackgrounds.forEach(function (b) {
    b.custom = true;
    BACKGROUNDS.push(b);
  });
  customFonts.forEach(function (f) {
    f.custom = true;
    FONTS.push(f);
  });

  function createCustomTheme(label, colors) {
    var theme = {
      id: "custom-" + Books.util.uid(""),
      label: label || "Tema personalizado",
      custom: true,
      swatch: [colors.bg, colors.panel, colors.text, colors.accent],
      colorScheme: luminance(colors.bg) < 0.5 ? "dark" : "light",
      vars: buildThemeVars(colors.bg, colors.panel, colors.text, colors.accent),
    };
    THEMES.push(theme);
    customThemes.push(theme);
    Books.store.write(CUSTOM_THEME_KEY, customThemes);
    return theme;
  }
  function removeCustomTheme(id) {
    var idx = THEMES.findIndex(function (t) {
      return t.id === id;
    });
    if (idx > -1) THEMES.splice(idx, 1);
    var cidx = customThemes.findIndex(function (t) {
      return t.id === id;
    });
    if (cidx > -1) customThemes.splice(cidx, 1);
    Books.store.write(CUSTOM_THEME_KEY, customThemes);
    if (current.theme === id) set({ theme: defaults.theme });
  }
  function createCustomBackground(label, basePattern, tint) {
    var bg = {
      id: "custom-" + Books.util.uid(""),
      label: label || "Padrão personalizado",
      custom: true,
      basePattern: basePattern,
      tint: tint,
      vars: {
        "--pattern-a": rgbaHex(tint, 0.09),
        "--pattern-b": rgbaHex(tint, 0.18),
        "--pattern-c": rgbaHex(tint, 0.6),
      },
    };
    BACKGROUNDS.push(bg);
    customBackgrounds.push(bg);
    Books.store.write(CUSTOM_BG_KEY, customBackgrounds);
    return bg;
  }
  function createCustomImageBackground(label, src, mime) {
    var bg = {
      id: "custom-" + Books.util.uid(""),
      label: label || "Plano de fundo personalizado",
      custom: true,
      basePattern: "image",
      src: src,
      mime: mime || "",
      vars: {
        "--pattern-a": "color-mix(in srgb, var(--text) 10%, transparent)",
        "--pattern-b": "color-mix(in srgb, var(--accent) 18%, transparent)",
        "--pattern-c": "color-mix(in srgb, var(--text) 42%, transparent)",
      },
    };
    BACKGROUNDS.push(bg);
    customBackgrounds.push(bg);
    Books.store.write(CUSTOM_BG_KEY, customBackgrounds);
    return bg;
  }
  function removeCustomBackground(id) {
    var idx = BACKGROUNDS.findIndex(function (b) {
      return b.id === id;
    });
    if (idx > -1) BACKGROUNDS.splice(idx, 1);
    var cidx = customBackgrounds.findIndex(function (b) {
      return b.id === id;
    });
    if (cidx > -1) customBackgrounds.splice(cidx, 1);
    Books.store.write(CUSTOM_BG_KEY, customBackgrounds);
    if (current.background === id) set({ background: defaults.background });
  }
  function removeCustomFont(id) {
    var idx = FONTS.findIndex(function (f) {
      return f.id === id;
    });
    if (idx > -1) FONTS.splice(idx, 1);
    var cidx = customFonts.findIndex(function (f) {
      return f.id === id;
    });
    if (cidx > -1) customFonts.splice(cidx, 1);
    Books.store.write(CUSTOM_FONT_KEY, customFonts);
    if (current.font === id) set({ font: defaults.font });
  }
  function createCustomFont(label, src, format) {
    var family = "BooksCustom" + Books.util.uid("");
    var font = {
      id: "custom-" + Books.util.uid(""),
      label: label || "Fonte importada",
      cat: "Importada",
      custom: true,
      family: family,
      src: src,
      format: format || "truetype",
      body: "'" + family + "', sans-serif",
      display: "'" + family + "', sans-serif",
    };
    FONTS.push(font);
    customFonts.push(font);
    Books.store.write(CUSTOM_FONT_KEY, customFonts);
    return font;
  }
  function clearVars(names) {
    names.forEach(function (n) {
      document.documentElement.style.removeProperty(n);
    });
  }

  function resourceUrl(src) {
    if (!src) return "";
    if (/^(data:|https?:|blob:|\/)/i.test(src)) return src;
    if (/^content\//i.test(src)) return new URL(src, document.baseURI).href;
    return new URL("content/" + src, document.baseURI).href;
  }
  function ensureCustomFont(font) {
    if (!font || !font.src || loaded[font.id]) return;
    loaded[font.id] = true;
    try {
      var face = new FontFace(
        font.family || font.id,
        'url("' + resourceUrl(font.src) + '")',
        { style: "normal", weight: "400" },
      );
      face
        .load()
        .then(function (loadedFace) {
          document.fonts.add(loadedFace);
        })
        .catch(function (e) {
          console.warn(
            "[personalization] não foi possível carregar a fonte:",
            e,
          );
        });
    } catch (e) {
      console.warn("[personalization] FontFace indisponível:", e);
    }
  }
  function ensureGoogleFont(font) {
    if (font && font.custom) {
      ensureCustomFont(font);
      return;
    }
    if (!font || !font.google || loaded[font.id]) return;
    loaded[font.id] = true;
    try {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=" +
        font.google +
        "&display=swap";
      link.onerror = function () {
        console.warn(
          '[personalization] sem rede: fonte "' +
            font.id +
            '" cai no fallback da pilha CSS.',
        );
      };
      document.head.appendChild(link);
    } catch (e) {}
  }

  function apply(settings) {
    current = Object.assign({}, defaults, settings || {});
    var selected = themeById(current.theme);
    var theme = themeVariant(
      selected,
      current.themeMode || selected.mode || "dark",
    );
    current.theme = theme.id;
    if (theme.mode) current.themeMode = theme.mode;
    var bg = backgroundById(current.background);
    var font = fontById(current.font);
    var root = document.documentElement.style;
    document.documentElement.setAttribute("data-theme", theme.id);
    var intensity = Math.max(
      0,
      Math.min(
        100,
        Number(current.themeIntensity == null ? 70 : current.themeIntensity),
      ),
    );
    document.documentElement.setAttribute(
      "data-theme-intensity",
      String(intensity),
    );
    root.setProperty("--theme-intensity", String(intensity / 100));
    var themeVars = theme.vars;
    if (!themeVars && theme.swatch && theme.swatch.length >= 4) {
      var target = theme.colorScheme === "light" ? "#ffffff" : "#000000";
      var amount = intensity / 100;
      themeVars = buildThemeVars(
        mix(theme.swatch[0], target, amount),
        mix(theme.swatch[1], target, amount * 0.75),
        theme.swatch[2],
        theme.swatch[3],
      );
    }
    if (themeVars) {
      Object.keys(themeVars).forEach(function (k) {
        root.setProperty(k, themeVars[k]);
      });
      root.colorScheme = current.themeMode || theme.colorScheme || "dark";
    } else {
      clearVars(THEME_VAR_NAMES);
      root.removeProperty("color-scheme");
    }
    var accentBase = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();
    if (accentBase) {
      root.setProperty("--accent-base", accentBase);
      root.setProperty(
        "--accent",
        "color-mix(in srgb, var(--accent-base) " +
          intensity +
          "%, var(--text))",
      );
    }
    if (document.body)
      document.body.setAttribute("data-bg", bg.basePattern || bg.id);
    var layer = document.getElementById("bgLayer");
    if (layer) {
      layer.style.removeProperty("background-image");
      layer.style.removeProperty("background-size");
      layer.style.removeProperty("background-position");
      layer.style.removeProperty("background-color");
      layer.style.removeProperty("background-blend-mode");
      if (bg.basePattern === "image" && bg.src) {
        layer.style.backgroundImage =
          'url("' + resourceUrl(bg.src).replace(/"/g, '\\"') + '")';
        layer.style.backgroundColor = "var(--bg)";
        layer.style.backgroundBlendMode = "soft-light";
        layer.style.backgroundSize = "cover";
        layer.style.backgroundPosition = "center";
      }
    }
    if (bg.vars) {
      Object.keys(bg.vars).forEach(function (k) {
        root.setProperty(k, bg.vars[k]);
      });
    } else clearVars(BG_VAR_NAMES);
    ensureGoogleFont(font);
    root.setProperty("--font-body", font.body);
    root.setProperty("--font-display", font.display || font.body);
  }

  function load() {
    var local = Books.store.read(K, null);
    return Object.assign({}, defaults, local || {});
  }
  var persist = Books.util.debounce(function () {
    Books.store.write(K, current);
    Books.events.emit("settings:changed");
  }, 150);
  function set(patch) {
    apply(Object.assign({}, current, patch));
    persist();
  }
  function get() {
    return Object.assign({}, current, {
      customThemes: customThemes,
      customBackgrounds: customBackgrounds,
      customFonts: customFonts,
    });
  }
  function focusConfig() {
    return Object.assign({}, defaults.focus, current.focus || {});
  }
  function keybindConfig() {
    return Object.assign({}, defaults.keybinds, current.keybinds || {});
  }
  function setFocusConfig(patch) {
    set({ focus: Object.assign({}, focusConfig(), patch || {}) });
  }
  function setKeybindConfig(patch) {
    set({ keybinds: Object.assign({}, keybindConfig(), patch || {}) });
  }

  function hydrateCustoms(settings) {
    function merge(key, target, storageKey, collection) {
      (settings[key] || []).forEach(function (item) {
        if (
          !item ||
          !item.id ||
          target.some(function (x) {
            return x.id === item.id;
          })
        )
          return;
        item.custom = true;
        target.push(item);
        collection.push(item);
      });
      if ((settings[key] || []).length)
        Books.store.write(storageKey, collection);
    }
    merge("customThemes", THEMES, CUSTOM_THEME_KEY, customThemes);
    merge("customBackgrounds", BACKGROUNDS, CUSTOM_BG_KEY, customBackgrounds);
    merge("customFonts", FONTS, CUSTOM_FONT_KEY, customFonts);
  }

  function inheritFromProjectFile() {
    if (Books.store.read(K, null) || !Books.repo || Books.repo.isFile()) return;
    Books.repo
      .loadSettingsFile()
      .then(function (fromFile) {
        if (!fromFile || !Object.keys(fromFile).length) return;
        hydrateCustoms(fromFile);
        apply(Object.assign({}, defaults, fromFile));
        Books.store.write(K, current);
        Books.events.emit("settings:changed");
      })
      .catch(function () {});
  }

  function init() {
    apply(load());
    inheritFromProjectFile();
  }

  function ensureFont(id) {
    ensureGoogleFont(fontById(id));
  }

  Books.personalization = {
    THEMES: THEMES,
    BACKGROUNDS: BACKGROUNDS,
    FONTS: FONTS,
    init: init,
    apply: apply,
    set: set,
    get: get,
    themeById: themeById,
    backgroundById: backgroundById,
    fontById: fontById,
    ensureFont: ensureFont,
    themeVariant: themeVariant,
    themeVariants: THEME_VARIANTS,
    focusConfig: focusConfig,
    keybindConfig: keybindConfig,
    setFocusConfig: setFocusConfig,
    setKeybindConfig: setKeybindConfig,
    createCustomTheme: createCustomTheme,
    removeCustomTheme: removeCustomTheme,
    createCustomBackground: createCustomBackground,
    createCustomImageBackground: createCustomImageBackground,
    removeCustomBackground: removeCustomBackground,
    createCustomFont: createCustomFont,
    removeCustomFont: removeCustomFont,
    resourceUrl: resourceUrl,
    BACKGROUND_PATTERN_IDS: BACKGROUNDS.filter(function (b) {
      return b.id !== "none" && !b.custom;
    }).map(function (b) {
      return b.id;
    }),
  };
})();
