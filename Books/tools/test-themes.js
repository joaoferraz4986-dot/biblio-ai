const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/core/personalization.js'), 'utf8');
const attributes = {};
const inline = {};
const base = {
  'github-dark': { '--bg': '#0d1117', '--bg-elevated': '#010409', '--panel': '#0d1117', '--panel-2': '#161b22', '--panel-3': '#010409', '--text': '#c9d1d9' },
  'github-light': { '--bg': '#ffffff', '--bg-elevated': '#f6f8fa', '--panel': '#ffffff', '--panel-2': '#f6f8fa', '--panel-3': '#eaeef2', '--text': '#1f2328' },
  'solarized-dark': { '--bg': '#002b36', '--bg-elevated': '#00212a', '--panel': '#073642', '--panel-2': '#05303a', '--panel-3': '#00212a', '--text': '#93a1a1' },
  'solarized-light': { '--bg': '#fdf6e3', '--bg-elevated': '#eee8d5', '--panel': '#fdf6e3', '--panel-2': '#eee8d5', '--panel-3': '#e4ddc9', '--text': '#586e75' },
  'catppuccin-latte': { '--bg': '#eff1f5', '--bg-elevated': '#e6e9ef', '--panel': '#ffffff', '--panel-2': '#e6e9ef', '--panel-3': '#dce0e8', '--text': '#4c4f69' },
  'catppuccin-frappe': { '--bg': '#303446', '--bg-elevated': '#292c3c', '--panel': '#414559', '--panel-2': '#383c50', '--panel-3': '#292c3c', '--text': '#c6d0f5' },
  'catppuccin-macchiato': { '--bg': '#24273a', '--bg-elevated': '#1e2030', '--panel': '#363a4f', '--panel-2': '#2d3147', '--panel-3': '#1e2030', '--text': '#cad3f5' },
  'catppuccin-mocha': { '--bg': '#1e1e2e', '--bg-elevated': '#181825', '--panel': '#313244', '--panel-2': '#232435', '--panel-3': '#181825', '--text': '#cdd6f4' }
};

const root = {
  style: {
    colorScheme: '',
    setProperty(name, value) { inline[name] = value; },
    removeProperty(name) { delete inline[name]; }
  },
  setAttribute(name, value) { attributes[name] = value; },
  getAttribute(name) { return attributes[name]; }
};
const document = {
  documentElement: root,
  body: { setAttribute() {} },
  getElementById() { return null; }
};
const Books = {
  store: { read(_key, fallback) { return fallback; }, write() {} },
  util: { debounce(fn) { return fn; }, uid() { return 'test'; } },
  events: { emit() {} }
};

vm.runInNewContext(source, {
  Books,
  document,
  getComputedStyle() {
    const theme = attributes['data-theme'];
    return { getPropertyValue(name) { return inline[name] || (base[theme] || {})[name] || ''; } };
  },
  console,
  URL,
  FontFace: function () {}
});

const p = Books.personalization;
for (const [family, variants] of Object.entries(p.themeVariants)) {
  assert.ok(p.THEME_FAMILIES[family], `família ausente: ${family}`);
  for (const [variant, id] of Object.entries(variants)) {
    const theme = p.themeById(id);
    assert.equal(theme.family, family, `${id} não pertence à família ${family}`);
    assert.equal(theme.mode, variant, `variante inválida: ${id}`);
  }
}
assert.deepEqual(Object.keys(p.themeVariants.catppuccin).sort(), ['frappe', 'latte', 'macchiato', 'mocha']);
assert.equal(p.themeById('github-dimmed').family, 'github');
assert.equal(p.themeById('github-dimmed').mode, 'dimmed');
p.apply({ theme: 'github-dimmed', themeMode: 'dark', themeIntensity: 50 });
assert.equal(attributes['data-theme'], 'github-dimmed');

p.apply({ theme: 'github-dark', themeMode: 'dark', themeIntensity: 0 });
const soft = inline['--bg'];
p.apply({ theme: 'github-dark', themeMode: 'dark', themeIntensity: 50 });
const original = base['github-dark']['--bg'];
assert.equal(inline['--bg'], undefined, '50% deve preservar a cor oficial original');
p.apply({ theme: 'github-dark', themeMode: 'dark', themeIntensity: 100 });
const deep = inline['--bg'];
const channel = color => Number(/^(?:#)([\da-f]{2})/i.exec(color)?.[1] ? parseInt(color.slice(1, 3), 16) : /^(?:rgb)\((\d+)/i.exec(color)?.[1]);
assert.ok(channel(soft) > channel(original), '0% deve suavizar o fundo escuro');
assert.ok(channel(deep) < channel(original), '100% deve aprofundar o fundo escuro');

p.apply({ theme: 'github-light', themeMode: 'light', themeIntensity: 0 });
assert.equal(inline['--bg'], undefined, 'variantes claras não devem receber intensidade escura');
assert.equal(root.style.colorScheme, 'light');
console.log('OK: famílias, variantes, compatibilidade legada e intensidade dos temas.');
