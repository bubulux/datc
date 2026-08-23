/* DATC browser app — dependency-free re-implementation of the reference DC
 * prototype (reference/DATC.dc.html). Data comes from window.DATC_DATA, which
 * scripts/build.py generates from storage/. No framework, no build step.
 */
(function () {
  "use strict";

  var DATA = window.DATC_DATA || { concepts: [], words: [] };
  var WORDS = DATA.words;
  var CONCEPT_ORDER = DATA.concepts;

  var TYPE_COLORS = {
    Noun: { bg: "#12222e", fg: "#8fcdfb", dot: "#2fa1f2" },
    Verb: { bg: "#2a2410", fg: "#f2ce62", dot: "#e0b53c" },
    Adjective: { bg: "#221a2e", fg: "#c8a6f5", dot: "#9b6ff0" },
    "": { bg: "#17171c", fg: "#9a9aa5", dot: "#3a3a45" }
  };
  function typeColor(t) { return TYPE_COLORS[t] || TYPE_COLORS[""]; }

  // Concept counts, computed once from the data.
  var COUNTS = {};
  CONCEPT_ORDER.forEach(function (c) {
    COUNTS[c] = WORDS.filter(function (w) { return w.concepts.indexOf(c) >= 0; }).length;
  });

  var state = {
    screen: "browse",
    browseSel: null,
    concept: null,
    wordQuery: "",
    match: "Contains",
    randomN: 8,
    fTypes: [],
    fConcepts: [],
    fReq: [],
    results: [],      // list of word names
    queryLabel: "",
    listFilter: "",
    tabs: [],         // list of word names
    active: null,
    history: [],
    historyOpen: false
  };

  function find(name) {
    var k = String(name).toLowerCase();
    return WORDS.find(function (x) { return x.word.toLowerCase() === k; });
  }

  /* ---- state plumbing ---------------------------------------------------- */

  function setState(patch) {
    var next = typeof patch === "function" ? patch(state) : patch;
    Object.keys(next).forEach(function (k) { state[k] = next[k]; });
    render();
  }

  function toggle(key, val) {
    setState(function (s) {
      var arr = s[key];
      var next = arr.indexOf(val) >= 0
        ? arr.filter(function (x) { return x !== val; })
        : arr.concat([val]);
      var o = {}; o[key] = next; return o;
    });
  }

  function openWord(name) {
    var w = find(name);
    if (!w) return;
    setState(function (s) {
      var tabs = s.tabs.indexOf(w.word) >= 0 ? s.tabs : s.tabs.concat([w.word]).slice(-8);
      return { tabs: tabs, active: w.word, screen: "results", historyOpen: false };
    });
  }

  function search(label, list) {
    var entry = { label: label, count: list.length };
    setState(function (s) {
      return {
        screen: "results",
        results: list.map(function (w) { return w.word; }),
        queryLabel: label,
        listFilter: "",
        history: [entry].concat(s.history).slice(0, 12),
        historyOpen: false
      };
    });
  }

  function runSearch() {
    var s = state;
    var all = WORDS;
    if (s.browseSel === "Catalogue") {
      return search("Catalogue · all words",
        all.slice().sort(function (a, b) { return a.word.localeCompare(b.word); }));
    }
    if (s.browseSel === "Concepts") {
      if (!s.concept) return;
      var c = s.concept;
      return search("Concept · " + c,
        all.filter(function (w) { return w.concepts.indexOf(c) >= 0; }));
    }
    if (s.browseSel === "Random") {
      var pool = all.slice();
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
      }
      return search("Random · " + s.randomN, pool.slice(0, s.randomN));
    }
    if (s.browseSel === "Word") {
      var q = s.wordQuery.trim().toLowerCase();
      if (!q) return;
      var exact = s.match === "Exact";
      var hit = all.filter(function (w) {
        var hay = [w.word].concat(w.variants, w.synonyms).join(" ").toLowerCase();
        return exact ? w.word.toLowerCase() === q : hay.indexOf(q) >= 0;
      });
      return search("Word · " + (exact ? "exact " : "contains ") + "“" + s.wordQuery.trim() + "”", hit);
    }
    if (s.browseSel === "Filter") {
      var hit2 = all.filter(function (w) {
        if (s.fTypes.length && s.fTypes.indexOf(w.type) < 0) return false;
        if (s.fConcepts.length && !w.concepts.some(function (c) { return s.fConcepts.indexOf(c) >= 0; })) return false;
        if (s.fReq.indexOf("Variants") >= 0 && !w.variants.length) return false;
        if (s.fReq.indexOf("Synonyms") >= 0 && !w.synonyms.length) return false;
        if (s.fReq.indexOf("Antagonists") >= 0 && !w.antagonists.length) return false;
        return true;
      });
      var bits = [].concat(s.fTypes, s.fConcepts, s.fReq.map(function (r) { return "has " + r.toLowerCase(); }));
      return search("Filter · " + (bits.length ? bits.join(", ") : "all"), hit2);
    }
  }

  function chip(sel) {
    return sel
      ? { bg: "#12222e", fg: "#9fd4fb", bd: "#2fa1f2" }
      : { bg: "#17171c", fg: "#a9a9b4", bd: "#26262e" };
  }

  /* ---- handler registry + escaping --------------------------------------- */

  var handlers = {};
  var hid = 0;
  function reg(fn) { var id = "h" + (hid++); handlers[id] = fn; return id; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---- rendering --------------------------------------------------------- */

  var PANEL_COPY = {
    Catalogue: ["The entire catalogue", "Every mapped word, alphabetical.", "Continue"],
    Concepts: ["Search by concept", "Pick one recognizable concept to pull its words.", "Search"],
    Random: ["Draw at random", "How many unfamiliar words do you want served?", "Draw"],
    Word: ["Target a word", "Match the word itself, its variants and synonyms.", "Search"],
    Filter: ["Build a query", "Combine type, concept and required properties.", "Search"]
  };

  function rail() {
    var isB = state.screen === "browse";
    var isR = state.screen === "results";
    function btn(label, active, fn) {
      return '<button data-click="' + reg(fn) + '" class="datc-hoverable" title="' + esc(label) + '" ' +
        'style="width:36px;height:36px;border-radius:8px;border:1px solid #1f1f26;' +
        'background:' + (active ? "#12222e" : "#131317") + ';color:' + (active ? "#7cc6fb" : "#7e7e8a") + ';' +
        'font-family:\'JetBrains Mono\',monospace;font-size:13px;cursor:pointer;">' + esc(label) + '</button>';
    }
    return '<div style="width:60px;flex:none;border-right:1px solid #1c1c21;display:flex;flex-direction:column;align-items:center;padding:12px 0;gap:14px;background:#0e0e11;">' +
      '<div style="width:34px;height:34px;border-radius:8px;background:linear-gradient(135deg,#2fa1f2,#1b6fb0);display:flex;align-items:center;justify-content:center;font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:500;letter-spacing:0.02em;color:#04121d;">DATC</div>' +
      '<div style="width:22px;height:1px;background:#22222a;"></div>' +
      btn("Br", isB, function () { setState({ screen: "browse", historyOpen: false }); }) +
      btn("Re", isR, function () { setState({ screen: "results" }); }) +
      '<div style="flex:1;"></div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:#4a4a55;writing-mode:vertical-rl;letter-spacing:0.1em;">MVP 0.1</div>' +
      '</div>';
  }

  function browseScreen() {
    var s = state;
    var items = ["Catalogue", "Concepts", "Random", "Word", "Filter"].map(function (label) {
      var sel = s.browseSel === label;
      return '<div style="display:flex;align-items:center;gap:0;">' +
        '<div style="width:40px;height:1px;background:#2b2b33;"></div>' +
        '<button data-click="' + reg(function () { setState({ browseSel: label }); }) + '" ' +
        'style="display:flex;align-items:center;gap:12px;background:none;border:0;cursor:pointer;padding:10px 12px;font-family:inherit;">' +
        '<span style="width:3px;height:26px;border-radius:2px;background:' + (sel ? "#2fa1f2" : "transparent") + ';"></span>' +
        '<span style="font-size:34px;font-weight:600;letter-spacing:-0.02em;color:' + (sel ? "#ffffff" : "#9a9aa5") + ';">' + esc(label) + '</span>' +
        '</button></div>';
    }).join("");

    var panel = s.browseSel ? browsePanel() : "";

    return '<div style="flex:1;display:flex;align-items:center;padding:48px 56px;gap:56px;min-width:0;">' +
      '<div style="display:flex;align-items:center;flex:none;">' +
      '<div style="font-size:76px;font-weight:800;letter-spacing:-0.045em;line-height:1;">Browse</div>' +
      '<div style="width:56px;height:1px;background:#2b2b33;"></div></div>' +
      '<div style="border-left:1px solid #2b2b33;display:flex;flex-direction:column;gap:4px;padding:4px 0;flex:none;">' + items + '</div>' +
      panel + '</div>';
  }

  function browsePanel() {
    var s = state;
    var copy = PANEL_COPY[s.browseSel] || ["", "", "Search"];
    var body = "";

    if (s.browseSel === "Concepts") {
      var opts = CONCEPT_ORDER.map(function (c) {
        var sel = s.concept === c;
        return '<button data-click="' + reg(function () { setState({ concept: c }); }) + '" class="datc-row" ' +
          'style="width:100%;display:flex;align-items:center;gap:10px;padding:8px 10px;border:0;border-radius:6px;cursor:pointer;font-family:inherit;text-align:left;' +
          'background:' + (sel ? "#12222e" : "transparent") + ';color:' + (sel ? "#ffffff" : "#b4b4be") + ';">' +
          '<span style="width:8px;height:8px;border-radius:2px;flex:none;background:' + (sel ? "#2fa1f2" : "#3a3a45") + ';"></span>' +
          '<span style="font-size:14px;flex:1;">' + esc(c) + '</span>' +
          '<span style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#5f5f6b;">' + COUNTS[c] + '</span></button>';
      }).join("");
      body = '<div style="margin-top:18px;border:1px solid #23232a;border-radius:8px;padding:6px;max-height:260px;overflow:auto;">' + opts + '</div>';
    }

    if (s.browseSel === "Word") {
      var matchBtns = ["Exact", "Contains"].map(function (m) {
        var c = chip(s.match === m);
        return '<button data-click="' + reg(function () { setState({ match: m }); }) + '" ' +
          'style="flex:1;padding:9px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:13px;border:1px solid ' + c.bd + ';background:' + c.bg + ';color:' + c.fg + ';">' + esc(m) + '</button>';
      }).join("");
      body = '<div style="margin-top:18px;display:flex;flex-direction:column;gap:12px;">' +
        '<input id="wordQuery" data-input="' + reg(function (e) { state.wordQuery = e.target.value; }) + '" ' +
        'data-keydown="' + reg(function (e) { if (e.key === "Enter") runSearch(); }) + '" ' +
        'value="' + esc(s.wordQuery) + '" placeholder="e.g. &ldquo;Shard&rdquo; or &ldquo;Pre&rdquo;" ' +
        'style="width:100%;background:#0e0e12;border:1px solid #26262e;border-radius:8px;padding:11px 13px;color:#f1f1f3;font-size:14px;outline:none;" />' +
        '<div style="display:flex;gap:8px;">' + matchBtns + '</div></div>';
    }

    if (s.browseSel === "Random") {
      var randBtns = [5, 8, 20].map(function (n) {
        var c = chip(s.randomN === n);
        return '<button data-click="' + reg(function () { setState({ randomN: n }); }) + '" ' +
          'style="flex:1;padding:9px;border-radius:8px;cursor:pointer;font-family:\'JetBrains Mono\',monospace;font-size:13px;border:1px solid ' + c.bd + ';background:' + c.bg + ';color:' + c.fg + ';">' + n + '</button>';
      }).join("");
      body = '<div style="margin-top:18px;display:flex;gap:8px;">' + randBtns + '</div>';
    }

    if (s.browseSel === "Filter") {
      body = '<div style="margin-top:20px;display:flex;flex-direction:column;gap:18px;max-height:400px;overflow:auto;">' +
        filterGroup("Type", ["Noun", "Verb", "Adjective"], "fTypes") +
        filterGroup("Concepts", CONCEPT_ORDER, "fConcepts") +
        filterGroup("Must have", ["Variants", "Synonyms", "Antagonists"], "fReq") +
        '</div>';
    }

    var panelCount = "";
    if (s.browseSel === "Catalogue") panelCount = WORDS.length + " words";
    if (s.browseSel === "Concepts") panelCount = s.concept ? COUNTS[s.concept] + " words" : "select a concept";
    if (s.browseSel === "Random") panelCount = "of " + WORDS.length;
    if (s.browseSel === "Filter") panelCount = (s.fTypes.length + s.fConcepts.length + s.fReq.length) + " criteria";

    return '<div style="width:420px;flex:none;background:#131317;border:1px solid #24242b;border-radius:12px;padding:24px;animation:datcIn 180ms ease-out;">' +
      '<div style="font-size:19px;font-weight:600;letter-spacing:-0.01em;">' + esc(copy[0]) + '</div>' +
      '<div style="font-size:13px;color:#7e7e8a;margin-top:6px;line-height:1.45;">' + esc(copy[1]) + '</div>' +
      body +
      '<div style="display:flex;align-items:center;gap:12px;margin-top:22px;">' +
      '<div style="flex:1;font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#6d6d79;">' + esc(panelCount) + '</div>' +
      '<button data-click="' + reg(runSearch) + '" style="padding:11px 26px;border-radius:8px;border:0;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;background:#2fa1f2;color:#06131e;">' + esc(copy[2]) + '</button>' +
      '</div></div>';
  }

  function filterGroup(title, opts, key) {
    var chips = opts.map(function (o) {
      var c = chip(state[key].indexOf(o) >= 0);
      return '<button data-click="' + reg(function () { toggle(key, o); }) + '" ' +
        'style="padding:7px 12px;border-radius:999px;cursor:pointer;font-family:inherit;font-size:13px;border:1px solid ' + c.bd + ';background:' + c.bg + ';color:' + c.fg + ';">' + esc(o) + '</button>';
    }).join("");
    return '<div><div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;letter-spacing:0.12em;color:#6d6d79;text-transform:uppercase;">' + esc(title) + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">' + chips + '</div></div>';
  }

  function resultsScreen() {
    return '<div style="flex:1;display:flex;min-width:0;">' + resultsSidebar() + resultsMain() + '</div>';
  }

  function resultsSidebar() {
    var s = state;
    var lf = s.listFilter.trim().toLowerCase();
    var rows = s.results
      .map(function (n) { return find(n); })
      .filter(function (w) { return w && (!lf || w.word.toLowerCase().indexOf(lf) >= 0); })
      .map(function (w) {
        var sel = s.active === w.word;
        return '<button data-click="' + reg(function () { openWord(w.word); }) + '" class="datc-listrow" ' +
          'style="width:100%;display:flex;align-items:center;gap:10px;padding:8px 10px;border:0;border-radius:6px;cursor:pointer;font-family:inherit;text-align:left;background:' + (sel ? "#1b1b21" : "transparent") + ';">' +
          '<span style="width:6px;height:6px;border-radius:999px;flex:none;background:' + typeColor(w.type).dot + ';"></span>' +
          '<span style="font-size:14px;flex:1;color:' + (sel ? "#ffffff" : "#b4b4be") + ';">' + esc(w.word) + '</span>' +
          '<span style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:#55555f;">' + esc(w.type.slice(0, 3).toLowerCase()) + '</span></button>';
      });
    var list = rows.length
      ? rows.join("")
      : '<div style="padding:24px 12px;font-size:13px;color:#6d6d79;line-height:1.5;">No words match. Start a new search from Browse.</div>';

    var historyPopover = "";
    if (s.historyOpen) {
      var hitems = s.history.length
        ? s.history.map(function (h) {
            return '<button data-click="' + reg(function () { setState({ historyOpen: false }); }) + '" ' +
              'style="width:100%;display:flex;align-items:center;gap:8px;padding:8px 10px;border:0;background:none;border-radius:6px;cursor:pointer;font-family:inherit;text-align:left;">' +
              '<span style="font-size:13px;color:#b9b9c2;flex:1;">' + esc(h.label) + '</span>' +
              '<span style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:#2fa1f2;">' + h.count + '</span></button>';
          }).join("")
        : '<div style="padding:12px;font-size:12px;color:#6d6d79;">No searches yet.</div>';
      historyPopover = '<div style="position:absolute;bottom:56px;left:10px;right:10px;background:#17171c;border:1px solid #2a2a32;border-radius:10px;padding:6px;box-shadow:0 16px 40px rgba(0,0,0,0.55);animation:datcIn 140ms ease-out;max-height:260px;overflow:auto;">' + hitems + '</div>';
    }

    return '<div style="width:300px;flex:none;border-right:1px solid #1c1c21;display:flex;flex-direction:column;background:#0e0e11;">' +
      '<div style="padding:18px 16px 12px;">' +
      '<div style="display:flex;align-items:baseline;gap:8px;"><div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;">Results</div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#6d6d79;">' + (s.results.length ? s.results.length + " words" : "") + '</div></div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#6d6d79;margin-top:4px;">' + esc(s.queryLabel || "no search yet") + '</div>' +
      '<input id="listFilter" data-input="' + reg(function (e) { state.listFilter = e.target.value; render(); }) + '" value="' + esc(s.listFilter) + '" placeholder="filter these results…" ' +
      'style="width:100%;margin-top:12px;background:#131317;border:1px solid #24242b;border-radius:8px;padding:9px 12px;color:#f1f1f3;font-size:13px;outline:none;" /></div>' +
      '<div style="flex:1;overflow:auto;padding:0 8px 8px;">' + list + '</div>' +
      '<div style="border-top:1px solid #1c1c21;padding:10px;display:flex;gap:8px;position:relative;">' +
      '<button data-click="' + reg(function () { setState({ screen: "browse", historyOpen: false }); }) + '" class="datc-hoverable" style="flex:1;padding:9px;border-radius:8px;border:1px solid #24242b;background:#131317;color:#cfcfd6;font-family:inherit;font-size:13px;cursor:pointer;">New search</button>' +
      '<button data-click="' + reg(function () { setState(function (p) { return { historyOpen: !p.historyOpen }; }); }) + '" class="datc-hoverable" style="flex:1;padding:9px;border-radius:8px;border:1px solid #24242b;background:#131317;color:#cfcfd6;font-family:inherit;font-size:13px;cursor:pointer;">History</button>' +
      historyPopover + '</div></div>';
  }

  function resultsMain() {
    var s = state;
    var tabs = s.tabs.length
      ? s.tabs.map(function (w) {
          var sel = s.active === w;
          return '<div style="display:flex;align-items:center;gap:8px;padding:9px 10px 9px 14px;border-radius:8px 8px 0 0;flex:none;border:1px solid ' + (sel ? "#24242b" : "transparent") + ';border-bottom:0;background:' + (sel ? "#151519" : "transparent") + ';">' +
            '<button data-click="' + reg(function () { setState({ active: w }); }) + '" style="border:0;background:none;cursor:pointer;font-family:inherit;font-size:13px;padding:0;color:' + (sel ? "#ffffff" : "#8a8a95") + ';">' + esc(w) + '</button>' +
            '<button data-click="' + reg(function () {
              setState(function (p) {
                var t = p.tabs.filter(function (x) { return x !== w; });
                return { tabs: t, active: p.active === w ? (t[t.length - 1] || null) : p.active };
              });
            }) + '" style="border:0;background:none;cursor:pointer;font-family:\'JetBrains Mono\',monospace;font-size:12px;padding:0 2px;line-height:1;color:#5f5f6b;">✕</button></div>';
        }).join("")
      : '<div style="padding:10px 4px;font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#4d4d57;">no open words</div>';

    var content = s.active ? detail(find(s.active)) : emptyState();

    return '<div style="flex:1;display:flex;flex-direction:column;min-width:0;">' +
      '<div style="display:flex;align-items:stretch;gap:6px;padding:10px 12px 0;overflow-x:auto;border-bottom:1px solid #1c1c21;">' + tabs + '</div>' +
      '<div style="flex:1;overflow:auto;padding:40px 40px 64px;">' + content + '</div></div>';
  }

  function tagChip(name, kind) {
    var known = !!find(name);
    var fg, bd, bg;
    if (kind === "antagonist") {
      fg = known ? "#f2a9b3" : "#967077"; bd = known ? "#4a2a31" : "#2a1c20"; bg = "#1c1417";
    } else {
      fg = known ? "#dcdce3" : "#83838f"; bd = known ? "#2f2f3a" : "#1f1f26"; bg = "#17171c";
    }
    var click = known ? ' data-click="' + reg(function () { openWord(name); }) + '"' : "";
    return '<button' + click + ' class="datc-hoverable" style="padding:6px 12px;border-radius:6px;font-size:13px;font-family:inherit;cursor:' + (known ? "pointer" : "default") + ';border:1px solid ' + bd + ';background:' + bg + ';color:' + fg + ';">' + esc(name) + '</button>';
  }

  function detail(w) {
    if (!w) return emptyState();
    var tc = typeColor(w.type);
    var conceptChips = w.concepts.map(function (c) {
      return '<button data-click="' + reg(function () {
          setState({ browseSel: "Concepts", concept: c });
          search("Concept · " + c, WORDS.filter(function (x) { return x.concepts.indexOf(c) >= 0; }));
        }) + '" class="datc-hoverable" style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:6px;border:1px solid #2b3d4c;background:#12222e;color:#9fd4fb;font-family:inherit;font-size:13px;cursor:pointer;">' +
        '<span style="width:7px;height:7px;border-radius:2px;background:#2fa1f2;"></span>' + esc(c) + '</button>';
    }).join("");

    function variantRow() {
      if (!w.variants.length) return '<span style="font-size:13px;color:#55555f;">—</span>';
      return w.variants.map(function (v) {
        return '<span style="padding:6px 12px;border-radius:6px;background:#17171c;border:1px solid #24242b;color:#c6c6cf;font-size:13px;font-family:\'JetBrains Mono\',monospace;">' + esc(v) + '</span>';
      }).join("");
    }
    function tagRow(list, kind) {
      if (!list.length) return '<span style="font-size:13px;color:#55555f;">—</span>';
      return list.map(function (x) { return tagChip(x, kind); }).join("");
    }

    function row(label, inner, alignTop) {
      return '<div style="display:flex;gap:20px;padding:18px 0;border-bottom:1px solid #1f1f26;align-items:' + (alignTop ? "flex-start" : "center") + ';">' +
        '<div style="width:130px;flex:none;font-size:15px;font-weight:600;color:#8d8d99;' + (alignTop ? "padding-top:4px;" : "") + '">' + esc(label) + '</div>' + inner + '</div>';
    }

    var meta = w.concepts.join(" / ").toLowerCase() + " · " + w.variants.length + " variants · " + w.synonyms.length + " synonyms · " + w.antagonists.length + " antagonists";

    return '<div style="max-width:760px;margin:0 auto;">' +
      '<div style="text-align:center;font-size:60px;font-weight:800;letter-spacing:-0.04em;text-transform:uppercase;line-height:1;">' + esc(w.word) + '</div>' +
      '<div style="height:1px;background:#1f1f26;margin:32px 0 0;"></div>' +
      row("Type", '<div style="padding:5px 12px;border-radius:6px;font-size:13px;font-weight:600;background:' + tc.bg + ';color:' + tc.fg + ';">' + esc(w.type || "—") + '</div>', false) +
      row("Concepts", '<div style="display:flex;flex-wrap:wrap;gap:8px;">' + conceptChips + '</div>', true) +
      row("Variants", '<div style="display:flex;flex-wrap:wrap;gap:8px;flex:1;">' + variantRow() + '</div>', true) +
      row("Synonyms", '<div style="display:flex;flex-wrap:wrap;gap:8px;flex:1;">' + tagRow(w.synonyms, "synonym") + '</div>', true) +
      row("Antagonists", '<div style="display:flex;flex-wrap:wrap;gap:8px;flex:1;">' + tagRow(w.antagonists, "antagonist") + '</div>', true) +
      '<div style="margin-top:18px;font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#4d4d57;">' + esc(meta) + '</div>' +
      '</div>';
  }

  function emptyState() {
    return '<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#4d4d57;">' +
      '<div style="width:40px;height:40px;border:1px solid #26262e;border-radius:10px;"></div>' +
      '<div style="font-size:14px;">Pick a word from the list</div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;">it opens as a tab — keep several side by side</div></div>';
  }

  /* ---- render loop with focus preservation ------------------------------- */

  var root = document.getElementById("app");

  function render() {
    var focusId = document.activeElement && document.activeElement.id;
    var selStart = null, selEnd = null;
    if (focusId && document.activeElement.setSelectionRange) {
      selStart = document.activeElement.selectionStart;
      selEnd = document.activeElement.selectionEnd;
    }

    handlers = {}; hid = 0;
    var screen = state.screen === "browse" ? browseScreen() : resultsScreen();
    root.innerHTML = '<div style="height:100vh;display:flex;background:#0b0b0d;color:#f1f1f3;font-family:Archivo,\'Helvetica Neue\',Helvetica,sans-serif;overflow:hidden;">' +
      rail() + screen + '</div>';

    if (focusId) {
      var el = document.getElementById(focusId);
      if (el) {
        el.focus();
        if (selStart != null && el.setSelectionRange) {
          try { el.setSelectionRange(selStart, selEnd); } catch (e) {}
        }
      }
    }
  }

  function dispatch(attr, e) {
    var el = e.target.closest("[" + attr + "]");
    if (!el) return;
    var fn = handlers[el.getAttribute(attr)];
    if (fn) fn(e);
  }
  root.addEventListener("click", function (e) { dispatch("data-click", e); });
  root.addEventListener("input", function (e) { dispatch("data-input", e); });
  root.addEventListener("keydown", function (e) { dispatch("data-keydown", e); });

  render();
})();
