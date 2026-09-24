/*
 * Realce de sintaxe leve e sem dependências. Não é um parser completo: cobre o que
 * um livro técnico precisa (C/C++, assembly, shell, Python, JS/TS, JSON, SQL, Rust, Go, Java).
 * Cada regra tem uma classe CSS `tok-<classe>`; ver assets/css/blocks/code.css.
 */
(function () {
  'use strict';

  function words(s) { var o = {}; s.split(/\s+/).forEach(function (w) { if (w) o[w] = true; }); return o; }

  var CPP_KW = words('alignas alignof asm auto break case catch class concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do dynamic_cast else enum explicit export extern false final for friend goto if inline mutable namespace new noexcept nullptr operator override private protected public register reinterpret_cast requires return sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union using virtual volatile while');
  var CPP_TYPES = words('void bool char char8_t char16_t char32_t wchar_t short int long float double signed unsigned size_t ssize_t ptrdiff_t uint8_t uint16_t uint32_t uint64_t int8_t int16_t int32_t int64_t uintptr_t intptr_t nullptr_t string vector map set unordered_map unique_ptr shared_ptr weak_ptr array span optional variant atomic mutex thread');
  var PY_KW = words('and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield True False None self');
  var JS_KW = words('as async await break case catch class const continue debugger default delete do else enum export extends false finally for from function if implements import in instanceof interface let new null of private protected public readonly return static super switch this throw true try type typeof undefined var void while with yield');
  var RUST_KW = words('as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while i8 i16 i32 i64 u8 u16 u32 u64 usize isize f32 f64 bool str String Vec Option Result Box');
  var GO_KW = words('break case chan const continue default defer else fallthrough false for func go goto if import interface map nil package range return select struct switch true type var int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 string bool byte rune error float32 float64');
  var JAVA_KW = words('abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for if implements import instanceof int interface long native new null package private protected public return short static super switch synchronized this throw throws true false try void volatile while var String');
  var SQL_KW = words('select from where group by order having insert into values update set delete create table alter drop index join left right inner outer on as and or not null is in like limit offset distinct union all primary key foreign references default check unique case when then else end');
  var BASH_KW = words('if then else elif fi for while until do done case esac function in select time export local readonly return exit break continue set unset source alias cd echo printf test');
  var ASM_MNEMONIC_SKIP = words('');

  var STR_DQ = '"(?:\\\\.|[^"\\\\\\n])*"';
  var STR_SQ = "'(?:\\\\.|[^'\\\\\\n])*'";
  var NUM = '\\b(?:0[xX][0-9a-fA-F][0-9a-fA-F\']*|0[bB][01][01\']*|\\d[\\d\']*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)[uUlLfF]*\\b';
  var IDENT = '[A-Za-z_$][\\w$]*';

  /** Definição de linguagem: lista de [classe, regex-fonte] + função de classificação de identificadores. */
  var LANGS = {};
  function cLike(kw, types, extra) {
    return {
      rules: [['comment', '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/'], ['pre', '^[ \\t]*#[ \\t]*\\w+(?:[ \\t]*<[^>\\n]*>)?'],
        ['string', STR_DQ + '|' + STR_SQ]].concat(extra || []).concat([['number', NUM], ['ident', IDENT]]),
      ident: function (w, after) { return kw[w] ? 'kw' : types && types[w] ? 'type' : /^\s*\(/.test(after) ? 'fn' : /^[A-Z][A-Za-z0-9]*$/.test(w) && w.length > 1 ? 'type' : ''; }
    };
  }
  LANGS.cpp = cLike(CPP_KW, CPP_TYPES, [['string', 'R"\\(?[\\s\\S]*?\\)?"']].slice(0, 0));
  LANGS.c = LANGS.cpp;
  LANGS.java = cLike(JAVA_KW, null);
  LANGS.rust = cLike(RUST_KW, null, [['attr', '#!?\\[[^\\]\\n]*\\]']]);
  LANGS.go = cLike(GO_KW, null, [['string', '`[^`]*`']]);
  LANGS.js = {
    rules: [['comment', '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/'], ['string', STR_DQ + '|' + STR_SQ + '|`(?:\\\\.|[^`\\\\])*`'], ['number', NUM], ['ident', IDENT]],
    ident: function (w, after) { return JS_KW[w] ? 'kw' : /^\s*\(/.test(after) ? 'fn' : /^[A-Z][A-Za-z0-9]*$/.test(w) && w.length > 1 ? 'type' : ''; }
  };
  LANGS.python = {
    rules: [['comment', '#[^\\n]*'], ['string', '[rbfRBF]{0,2}(?:"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\')|[rbfRBF]{0,2}(?:' + STR_DQ + '|' + STR_SQ + ')'],
      ['attr', '@[A-Za-z_][\\w.]*'], ['number', NUM], ['ident', IDENT]],
    ident: function (w, after) { return PY_KW[w] ? 'kw' : /^\s*\(/.test(after) ? 'fn' : ''; }
  };
  LANGS.json = {
    rules: [['key', STR_DQ + '(?=\\s*:)'], ['string', STR_DQ], ['number', '-?\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b'], ['ident', '\\b(?:true|false|null)\\b']],
    ident: function () { return 'kw'; }
  };
  LANGS.sql = {
    rules: [['comment', '--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/'], ['string', STR_SQ], ['number', NUM], ['ident', IDENT]],
    ident: function (w) { return SQL_KW[w.toLowerCase()] ? 'kw' : ''; }
  };
  LANGS.bash = {
    rules: [['comment', '(?:^|(?<=\\s))#[^\\n]*'], ['string', STR_DQ + '|' + STR_SQ], ['var', '\\$(?:\\{[^}\\n]*\\}|\\([^)\\n]*\\)|[A-Za-z_@#?*!$0-9-][\\w]*)'],
      ['flag', '(?<=\\s)--?[A-Za-z][\\w-]*'], ['prompt', '^[ \\t]*[$#>](?=\\s)'], ['number', NUM], ['ident', IDENT]],
    ident: function (w) { return BASH_KW[w] ? 'kw' : ''; }
  };
  LANGS.asm = {
    rules: [['comment', '(?:#|;|\\/\\/)[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/'], ['string', STR_DQ],
      ['label', '^[ \\t]*[A-Za-z_.$][\\w.$@]*:'], ['dir', '\\.[A-Za-z_][\\w.]*'],
      ['reg', '%[a-z][a-z0-9]*|\\b(?:[re]?[abcd]x|[abcd][lh]|[re]?[sd]il?|[re]?[sb]pl?|[re]?ip|r(?:8|9|1[0-5])[dwb]?|[xyz]mm\\d+|[cdefgs]s)\\b'],
      ['imm', '\\$-?(?:0[xX][0-9a-fA-F]+|\\d+)'], ['number', '-?\\b(?:0[xX][0-9a-fA-F]+|\\d+)\\b'],
      ['mnemonic', '^[ \\t]+[a-z][a-z0-9.]*(?=[ \\t]|$)'], ['ident', IDENT]],
    ident: function () { return ''; }
  };

  var ALIASES = { 'c++': 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', h: 'c', s: 'asm', assembly: 'asm', x86: 'asm', att: 'asm', nasm: 'asm',
    sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash', terminal: 'bash', py: 'python', javascript: 'js', typescript: 'js', ts: 'js', jsx: 'js',
    rs: 'rust', golang: 'go', jsonc: 'json' };

  var compiled = {};
  function compile(lang) {
    if (compiled[lang]) return compiled[lang];
    var def = LANGS[lang];
    var src = def.rules.map(function (r) { return '(' + r[1] + ')'; }).join('|');
    compiled[lang] = { def: def, re: new RegExp(src, 'gm') };
    return compiled[lang];
  }

  function normalize(lang) {
    var l = String(lang || '').toLowerCase().trim();
    l = ALIASES[l] || l;
    return LANGS[l] ? l : '';
  }

  /** Devolve lista de tokens [{c: classe|'', v: texto}]. */
  function tokenize(code, langName) {
    var lang = normalize(langName);
    if (!lang) return [{ c: '', v: code }];
    var comp = compile(lang), re = comp.re, rules = comp.def.rules, out = [], last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(code)) !== null) {
      if (m[0] === '') { re.lastIndex += 1; continue; }
      if (m.index > last) out.push({ c: '', v: code.slice(last, m.index) });
      var idx = 1;
      while (idx <= rules.length && m[idx] === undefined) idx += 1;
      var rule = rules[idx - 1], cls = rule[0], text = m[0];
      if (cls === 'ident') cls = comp.def.ident(text, code.slice(re.lastIndex, re.lastIndex + 40));
      if ((cls === 'mnemonic' || cls === 'label') && /^[ \t]+/.test(text)) {
        var lead = /^[ \t]+/.exec(text)[0];
        out.push({ c: '', v: lead }); text = text.slice(lead.length);
      }
      if (cls === 'pre' && /^[ \t]+/.test(text)) {
        var lead2 = /^[ \t]+/.exec(text)[0];
        out.push({ c: '', v: lead2 }); text = text.slice(lead2.length);
      }
      out.push({ c: cls, v: text });
      last = re.lastIndex;
    }
    if (last < code.length) out.push({ c: '', v: code.slice(last) });
    return out;
  }

  /** Renderiza o código em um DocumentFragment, linha a linha (permite números e destaque de linhas). */
  function renderLines(code, langName) {
    var tokens = tokenize(code, langName);
    var lines = [document.createDocumentFragment()];
    tokens.forEach(function (t) {
      t.v.split('\n').forEach(function (part, i) {
        if (i > 0) lines.push(document.createDocumentFragment());
        if (!part) return;
        var target = lines[lines.length - 1];
        if (t.c) { var span = document.createElement('span'); span.className = 'tok-' + t.c; span.textContent = part; target.appendChild(span); }
        else target.appendChild(document.createTextNode(part));
      });
    });
    return lines;
  }

  Books.highlight = { tokenize: tokenize, renderLines: renderLines, normalize: normalize,
    languages: ['cpp', 'c', 'asm', 'bash', 'python', 'js', 'json', 'rust', 'go', 'java', 'sql'] };
})();
