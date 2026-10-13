/* Stackt kiosk demo. Everything here is pretend: no payments, no backend, no accounts.
   To change prices, ingredients, plans or dashboard numbers, edit settings.js (top folder). */
(function () {
  "use strict";

  const S = window.STACKT_SETTINGS;
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");
  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  // ---------------------------------------------------------------- helpers

  const esc = (v) =>
    String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const num = (v, fallback) => (typeof v === "number" && isFinite(v) ? v : fallback || 0);
  const cur = () => (S && S.currencySymbol) || "$";
  const money = (n) => cur() + num(n).toFixed(2);
  const moneyShort = (n) => (Math.round(n) === n ? cur() + n.toLocaleString("en-US") : money(n));
  const moneyBig = (n) => cur() + Math.round(n).toLocaleString("en-US");
  const isNone = (opt) => /^none$/i.test(String(opt.label).trim());
  const same = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  const list = (v) => (Array.isArray(v) ? v : []);

  const PATHS = {
    back: "M15 18l-6-6 6-6",
    arrow: "M5 12h14M13 6l6 6-6 6",
    check: "M5 12.5l4.5 4.5L19 7",
    x: "M6 6l12 12M18 6L6 18",
    reset: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
    down: "M12 4v16M5 13l7 7 7-7",
    share: "M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7",
    info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
    recover: "M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5M12 8v8M8 12h8",
    contactless: "M7 8.5a5 5 0 0 1 0 7M10.5 6.5a8.5 8.5 0 0 1 0 11M14 4.5a12 12 0 0 1 0 15M17.5 2.5a15.5 15.5 0 0 1 0 19",
    scan: "M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 9v6M11 9v6M14 9v6M17 9v6",
    star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
    phone: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2",
    flame: "M12 22c4 0 7-2.7 7-7 0-4-3-6-4-9-1 2-2 3-3.5 3.5C11 7 11 4 9 2c0 4-4 6.5-4 12 0 4.3 3 8 7 8z",
    alert: "M12 3l10 18H2zM12 10v5M12 18h.01",
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`;
  const BOLT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 2 4 14h7l-1.5 8L19 10h-7z"/></svg>`;

  const LOGO_MARK = `<svg class="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <path fill="#c8ff2e" d="M4 29h20l4-7H8z"/>
      <path fill="#c8ff2e" fill-opacity=".72" d="M8 19h17l4-7H12z"/>
      <path fill="#c8ff2e" fill-opacity=".45" d="M12 9h14l4-7H16z"/>
    </svg>`;
  const logo = (big) =>
    `<div class="logo${big ? " big" : ""}" data-logo aria-label="Stackt">${LOGO_MARK}<span class="logo-word">Stackt</span></div>`;

  function toast(msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => toastEl.classList.remove("show"), ms || 2600);
  }

  // Friendly message if settings.js has a typo and did not load.
  if (!S || !S.drinks || !S.drinks.pre || !S.drinks.post) {
    app.innerHTML = `<section class="screen"><div class="error-box">
      <h2>settings.js has a typo</h2>
      <p>The demo could not read its settings. Open <b>settings.js</b> and check the line you changed last.</p>
      <p>The usual cause is a missing comma at the end of a line, or a missing quote mark around a word.</p>
    </div></section>`;
    return;
  }

  // Make :active styles work on iPhone.
  document.addEventListener("touchstart", () => {}, { passive: true });

  // ---------------------------------------------------------------- state

  const state = {
    mode: null, // "pre" or "post"
    picks: [], // selected option index for each ingredient
    plan: null, // index into S.memberships chosen in the demo
    member: null, // the demo member after "Scan member tag"
    membershipFrom: "welcome",
    buildFrom: "choose",
  };
  let timers = [];
  let ownerOpen = false;

  const plans = () => list(S.memberships);
  const planOfKind = (kind) => plans().find((p) => p.kind === kind);
  const ingsOf = (mode) => list(S.drinks[mode].ingredients);
  const drink = () => S.drinks[state.mode];
  const ingredients = () => ingsOf(state.mode);
  const optIndex = (ing, label) => ing.options.findIndex((o) => same(o.label, label));
  const noneIndex = (ing) => ing.options.findIndex(isNone);
  const startIndex = (ing) => Math.max(0, optIndex(ing, ing.start));

  // Selected, non-"None" ingredients for a drink.
  const includedOf = (mode, picks) =>
    ingsOf(mode)
      .map((ing, i) => ({ ing, opt: ing.options[picks[i]], i }))
      .filter((x) => x.opt && !isNone(x.opt));
  const included = () => includedOf(state.mode, state.picks);

  function startBuild(mode) {
    state.mode = mode;
    state.picks = ingredients().map(startIndex);
  }

  // Turns { "Ingredient": "Option" } into option indexes. Missing ones become "None".
  function picksFrom(mode, named) {
    named = named || {};
    return ingsOf(mode).map((ing) => {
      const key = Object.keys(named).find((k) => same(k, ing.name));
      if (key) {
        const idx = optIndex(ing, named[key]);
        if (idx >= 0) return idx;
      }
      const n = noneIndex(ing);
      return n >= 0 ? n : startIndex(ing);
    });
  }
  const namedFrom = (mode, picks) => {
    const out = {};
    includedOf(mode, picks).forEach((x) => (out[x.ing.name] = x.opt.label));
    return out;
  };
  const samePicks = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
  const activePreset = () =>
    list(drink().signatureStacks).findIndex((p) => samePicks(picksFrom(state.mode, p.picks), state.picks));

  const caffeineLimit = () => num(S.caffeineLimitMg, 300);
  const hasCaffeine = () => ingredients().some((ing) => ing.options.some((o) => num(o.caffeineMg) > 0));
  const caffeineOf = (mode, picks) => includedOf(mode, picks).reduce((s, x) => s + num(x.opt.caffeineMg), 0);
  const caffeineTotal = (picks) => caffeineOf(state.mode, picks || state.picks);

  // ---------------------------------------------------------------- taste rules

  // A rule part looks like ["Ingredient", "option", "option"].
  function partMatches(part, mode, picks) {
    if (!Array.isArray(part) || part.length < 2) return false;
    const ings = ingsOf(mode);
    const i = ings.findIndex((ing) => same(ing.name, part[0]));
    if (i < 0) return false;
    const opt = ings[i].options[picks[i]];
    return !!opt && part.slice(1).some((l) => same(l, opt.label));
  }
  const rulesOf = (mode) => list(S.drinks[mode].tasteRules);
  const ruleHits = (mode, picks, blocking) =>
    rulesOf(mode).filter((r) => !!r.block === blocking && partMatches(r.when, mode, picks) && partMatches(r.with, mode, picks));

  // Why option j of ingredient i can't be picked right now (or null).
  function blockReason(i, j) {
    const picks = state.picks.slice();
    picks[i] = j;
    if (caffeineTotal(picks) > caffeineLimit()) {
      return { short: "over limit", long: `That would go over the ${caffeineLimit()} mg caffeine limit. Lower another caffeine source first.` };
    }
    const hit = ruleHits(state.mode, picks, true)[0];
    return hit ? { short: "doesn't mix", long: hit.message } : null;
  }

  // ---------------------------------------------------------------- prices & nutrition

  const priceOf = (mode, picks) => num(S.drinks[mode].basePrice) + includedOf(mode, picks).reduce((s, x) => s + num(x.opt.price), 0);
  const price = () => priceOf(state.mode, state.picks);

  // What the customer pays with a membership applied.
  function memberPriceOf(mode, picks, planIndex) {
    const full = priceOf(mode, picks);
    const plan = plans()[planIndex];
    if (!plan) return { total: full, full };
    if (plan.kind === "discount") {
      const pct = num(plan.discountPercent);
      return { total: full * (1 - pct / 100), full, note: `${plan.name} −${pct}%`, plan };
    }
    if (plan.kind === "unlimited") {
      const club = planOfKind("discount");
      const pct = club ? num(club.discountPercent) : 0;
      const premium = includedOf(mode, picks).filter((x) => x.opt.premium).reduce((s, x) => s + num(x.opt.price), 0);
      const total = premium * (1 - pct / 100);
      return { total, full, plan, premium, note: total > 0 ? `${plan.name} (premium upgrades extra)` : `Covered by ${plan.name}` };
    }
    return { total: 0, full, plan, note: `1 drink from your ${plan.name}` };
  }
  const memberPrice = () => memberPriceOf(state.mode, state.picks, state.plan);

  function nutritionOf(mode, picks) {
    const inc = includedOf(mode, picks);
    const allergens = [];
    inc.forEach((x) =>
      String(x.opt.allergens || "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
        .forEach((a) => allergens.includes(a) || allergens.push(a))
    );
    return {
      calories: Math.round(inc.reduce((s, x) => s + num(x.opt.calories), 0)),
      protein: Math.round(inc.reduce((s, x) => s + num(x.opt.proteinG), 0)),
      caffeine: caffeineOf(mode, picks),
      allergens,
    };
  }

  // ---------------------------------------------------------------- navigation

  function clearTimers() {
    timers.forEach((t) => clearTimeout(t) || cancelAnimationFrame(t));
    timers = [];
  }

  function go(name, opts) {
    opts = opts || {};
    clearTimers();
    const screen = SCREENS[name];
    const el = document.createElement("section");
    el.className = "screen " + name;
    el.innerHTML = screen.html();
    const old = app.querySelector(".screen:not(.leaving):not(.owner)");
    if (old) app.insertBefore(el, old.nextSibling);
    else app.appendChild(el);
    const dir = opts.back ? -1 : 1;
    if (old) {
      old.classList.add("leaving");
      old.style.pointerEvents = "none";
      const out = old.animate(
        [{ transform: "none", opacity: 1 }, { transform: `translateX(${-dir * 25}%)`, opacity: 0 }],
        { duration: 360, easing: EASE, fill: "forwards" }
      );
      out.onfinish = () => old.remove();
      el.animate(
        [{ transform: `translateX(${dir * 35}%)`, opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 420, easing: EASE }
      );
    }
    if (screen.mount) screen.mount(el);
  }

  // ---------------------------------------------------------------- cup graphic

  const LAYER_COLORS = ["#c8ff2e", "#9fd41f", "#e2ff94", "#83b518", "#b9f540", "#eeffc6", "#6f9e12", "#d5ff63"];
  const layerHeight = () => 84 / Math.max(ingredients().length, 4);

  function cupHTML(extraClass, withLayers) {
    const layers = withLayers ? included().map((x) => layerHTML(x.i)).join("") : "";
    return `<div class="cup ${extraClass || ""}" aria-hidden="true">
        <div class="cup-straw"></div><div class="cup-lid"></div>
        <div class="cup-body"><div class="layer base"></div>${layers}</div>
      </div>`;
  }
  const layerHTML = (i, grow) =>
    `<div class="layer${grow ? " grow" : ""}" data-k="${i}" style="--lh:${layerHeight()}%;background:${LAYER_COLORS[i % LAYER_COLORS.length]}"></div>`;

  // Adds or removes layers so the cup matches the current stack.
  function syncCup(body) {
    const want = included().map((x) => x.i);
    body.querySelectorAll(".layer[data-k]").forEach((l) => {
      if (!want.includes(+l.dataset.k)) l.remove();
    });
    want.forEach((i) => {
      if (body.querySelector(`.layer[data-k="${i}"]`)) return;
      const after = [...body.querySelectorAll(".layer[data-k]")].find((l) => +l.dataset.k > i);
      const tmp = document.createElement("div");
      tmp.innerHTML = layerHTML(i, true);
      body.insertBefore(tmp.firstChild, after || null);
    });
  }

  // ---------------------------------------------------------------- screens

  const SCREENS = {};

  function greeting() {
    const h = new Date().getHours();
    if (h < 11) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  // 1. Welcome / attract
  SCREENS.welcome = {
    html() {
      const plan = plans()[state.plan];
      const fotm = S.flavorOfTheMonth ? ` · New: ${esc(S.flavorOfTheMonth)}` : "";
      return `
        <div class="topbar">${logo(true)}
          <button class="icon-btn a11y-btn${app.classList.contains("a11y") ? " on" : ""}" data-act="a11y" aria-label="Larger text and higher contrast"><span class="aa">Aa</span></button>
        </div>
        <div class="welcome-body">
          <div class="hero-stack" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <p class="eyebrow">${greeting()}${fotm}</p>
          <h1 class="display h1">${sloganHTML()}</h1>
          <p class="lead">Pre and post-workout drinks, mixed on the spot to your exact recipe.</p>
          ${plan ? `<p class="eyebrow" style="margin-top:16px">${esc(plan.name)} active (demo)</p>` : ""}
        </div>
        <div class="foot welcome-actions">
          <button class="btn btn-primary btn-start" data-act="start">Start ${icon("arrow")}</button>
          <div class="btn-pair">
            <button class="btn btn-ghost" data-act="scan">${icon("scan")} Member tag</button>
            <button class="btn btn-ghost" data-act="memberships" data-from="welcome">Memberships</button>
          </div>
          ${installHint()}
        </div>`;
    },
    mount(el) {
      // Shrink the headline until its longest line fits the screen width.
      const h1 = el.querySelector(".h1");
      const fit = () => {
        h1.style.fontSize = "";
        let size = parseFloat(getComputedStyle(h1).fontSize);
        while (h1.scrollWidth > h1.clientWidth + 1 && size > 24) h1.style.fontSize = --size + "px";
      };
      fit();
      if (document.fonts) document.fonts.ready.then(fit);
      this.fit = fit;
    },
  };

  function sloganHTML() {
    const lines = Array.isArray(S.slogan) && S.slogan.length ? S.slogan : ["Fresh-mixed.", "Built by you."];
    return lines
      .map((l, k) => (k === lines.length - 1 && lines.length > 1 ? `<span class="lime">${esc(l)}</span>` : esc(l)))
      .join("<br>");
  }

  function installHint() {
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone = navigator.standalone || matchMedia("(display-mode: standalone)").matches;
    let dismissed = false;
    try { dismissed = localStorage.getItem("stackt-hint") === "1"; } catch (e) { /* private mode */ }
    if (!ios || standalone || dismissed) return "";
    return `<div class="install-hint">${icon("share")}
        <span>For full-screen kiosk mode, tap <b>Share</b>, then <b>Add to Home Screen</b>.</span>
        <button class="x" data-act="hide-hint" aria-label="Hide tip">${icon("x")}</button>
      </div>`;
  }

  // Member tag scan (pretend)
  SCREENS.scan = {
    html() {
      return `
        <div class="topbar"><button class="icon-btn" data-act="back" data-to="welcome" aria-label="Back">${icon("back")}</button>${logo()}</div>
        <div class="center-body">
          <p class="eyebrow">Members</p>
          <h2 class="display h2">Scan your<br>member tag</h2>
          <button class="scanner" data-act="do-scan" aria-label="Simulate a scan">
            <span class="scan-icon">${icon("scan")}</span>
            <span class="scan-line"></span>
            <span class="scan-label">Tap to simulate a scan</span>
          </button>
          <p class="lead" style="margin-top:0">Hold your gym key tag or the barcode in your gym app under the scanner.</p>
          <p class="fine">Demo only. Designed to read the same tag members use to check in.</p>
        </div>`;
    },
  };

  // Member home: saved stacks, rewards, order ahead
  SCREENS.member = {
    html() {
      const m = state.member;
      const plan = plans()[state.plan];
      const goal = Math.max(1, num(m.drinksForFreeOne, 10));
      const progress = Math.min(goal, num(m.rewardsProgress));
      const stacks = list(m.savedStacks)
        .map((st, k) => {
          if (!S.drinks[st.drink]) return "";
          const picks = picksFrom(st.drink, st.picks);
          const mp = memberPriceOf(st.drink, picks, state.plan);
          const summary = includedOf(st.drink, picks).map((x) => `${x.ing.name} ${x.opt.label}`).join(" · ");
          return `<div class="saved">
              <div class="saved-top"><div><div class="saved-kind">${esc(S.drinks[st.drink].name)}</div><div class="saved-name">${esc(st.name)}</div></div>
                <div class="saved-price">${mp.total === 0 ? "Included" : money(mp.total)}</div></div>
              <p class="saved-sum">${esc(summary)}</p>
              <button class="btn btn-primary" data-act="reorder" data-k="${k}">Reorder ${icon("arrow")}</button>
            </div>`;
        })
        .join("");
      return `
        <div class="topbar"><button class="icon-btn" data-act="back" data-to="welcome" aria-label="Sign out">${icon("back")}</button>${logo()}</div>
        <div class="scroll">
          <div class="pad">
            <p class="eyebrow">${plan ? esc(plan.name) : "Member"}</p>
            <h2 class="display h2">Welcome back,<br>${esc(m.name)}.</h2>
          </div>
          <div class="member-stats">
            <div class="mstat"><span class="mstat-ico">${icon("flame")}</span><div><b>${num(m.streakDays)}-day streak</b><span>Keep it going today</span></div></div>
            <div class="mstat"><span class="mstat-ico">${icon("star")}</span><div><b>${progress} of ${goal}</b><span>toward a free stack</span></div></div>
          </div>
          <div class="reward-track"><i style="width:${(progress / goal) * 100}%"></i></div>
          <div class="section-label">My stacks</div>
          <div class="saved-list">${stacks || `<p class="muted pad">No saved stacks yet.</p>`}</div>
          <div class="pad"><button class="btn btn-ghost" data-act="start-member">Build something new</button></div>
          <div class="section-label">Order ahead</div>
          <div class="notify">
            <span class="notify-ico">${icon("phone")}</span>
            <div><div class="notify-top"><b>Stackt</b><span>now</span></div>
              <p>Your Leg Day Rebuild is mixed and waiting at the kiosk.</p></div>
          </div>
          <p class="plans-note" style="text-align:left">Members can order from their phone mid-workout and grab it on the way out. Preview only.</p>
        </div>`;
    },
  };

  // 2. Choose pre or post
  SCREENS.choose = {
    html() {
      const card = (mode, when, ico) => {
        const d = S.drinks[mode];
        return `<button class="mode-card" data-act="mode" data-mode="${mode}">
            <span class="mode-top"><span class="mode-icon">${ico}</span><span class="mode-arrow">${icon("arrow")}</span></span>
            <span><span class="when">${when}</span>
            <span class="display">${esc(d.name)}</span>
            <p>${esc(d.tagline)}</p>
            <span class="from">From ${money(num(d.basePrice))}</span></span>
          </button>`;
      };
      const back = state.member ? "member" : "welcome";
      return `
        <div class="topbar"><button class="icon-btn" data-act="back" data-to="${back}" aria-label="Back">${icon("back")}</button>${logo()}</div>
        <div class="scroll"><div class="choose-body">
          <h2 class="display h2 choose-title">What are<br>we mixing?</h2>
          ${card("pre", "Before you lift", BOLT)}
          ${card("post", "After you lift", icon("recover"))}
        </div></div>`;
    },
  };

  // 3. Build your own stack
  SCREENS.build = {
    html() {
      const d = drink();
      const presets = list(d.signatureStacks);
      const rows = ingredients()
        .map(
          (ing, i) => `
          <div class="ing" data-i="${i}">
            <div class="ing-head">
              <div><div class="ing-name">${esc(ing.name)}</div><div class="ing-about">${esc(ing.about)}</div></div>
              <div class="ing-price"></div>
            </div>
            <div class="chips">
              ${ing.options
                .map(
                  (o, j) => `<button class="chip" data-act="pick" data-i="${i}" data-j="${j}">
                    <span class="c-label">${esc(o.label)}</span>
                    ${o.note ? `<span class="c-note">${esc(o.note)}</span>` : ""}
                    <span class="c-price">${num(o.price) > 0 ? "+" + money(o.price) : isNone(o) ? "Skip" : "Included"}</span>
                  </button>`
                )
                .join("")}
            </div>
          </div>`
        )
        .join("");
      return `
        <div class="topbar">
          <button class="icon-btn" data-act="back" data-to="${state.buildFrom}" aria-label="Back">${icon("back")}</button>
          ${logo()}
          <button class="icon-btn" data-act="reset-build" aria-label="Start over" style="justify-self:end">${icon("reset")}</button>
        </div>
        <div class="summary">
          ${cupHTML("", true)}
          <div class="summary-main">
            <div class="summary-head"><p class="eyebrow">Your stack</p><span class="summary-count"></span></div>
            <div class="pills"></div>
            ${hasCaffeine() ? `<div class="meter"><div class="meter-label"><span>Caffeine</span><span><b class="caf">0</b> / ${caffeineLimit()} mg max</span></div><div class="meter-track"><div class="meter-fill"></div></div></div>` : ""}
          </div>
        </div>
        <div class="scroll">
          <div class="pad" style="padding-top:12px"><p class="eyebrow">Build your</p><h2 class="display h2">${esc(d.name)}</h2></div>
          ${presets.length ? `<div class="section-label">Start from a signature stack</div>
            <div class="presets">${presets.map((p, k) => `<button class="preset" data-act="preset" data-k="${k}">${esc(p.name)}</button>`).join("")}</div>` : ""}
          <div class="section-label">Or pick every ingredient</div>
          <div class="ingredients">${rows}</div>
          ${hasCaffeine() && S.caffeineAdvisory ? `<p class="demo-note advisory">${icon("alert")}<span>${esc(S.caffeineAdvisory)}</span></p>` : ""}
          <p class="demo-note">${icon("info")}<span>${esc(S.demoNote || "Demo values only.")}</span></p>
        </div>
        <div class="pricebar">
          <div><div class="total-label">Total</div><div class="total">${money(price())}</div></div>
          <button class="btn btn-primary" data-act="review">Review ${icon("arrow")}</button>
        </div>`;
    },
    mount(el) {
      this.el = el;
      this.lastPrice = price();
      this.lastPills = [];
      this.lastTips = ruleHits(state.mode, state.picks, false);
      this.update(true);
    },
    update(first) {
      const el = this.el;
      const ings = ingredients();
      // chips and per-ingredient price
      ings.forEach((ing, i) => {
        const row = el.querySelector(`.ing[data-i="${i}"]`);
        const sel = ing.options[state.picks[i]];
        row.classList.toggle("active", !isNone(sel));
        row.querySelectorAll(".chip").forEach((c) => {
          const j = +c.dataset.j;
          const on = j === state.picks[i];
          const why = on ? null : blockReason(i, j);
          c.classList.toggle("on", on);
          c.classList.toggle("blocked", !!why);
          c.querySelector(".c-price").dataset.why = why ? why.short : "";
          c.setAttribute("aria-pressed", on);
        });
        const p = row.querySelector(".ing-price");
        p.textContent = isNone(sel) ? "Not added" : num(sel.price) > 0 ? "+" + money(sel.price) : "Included";
        p.classList.toggle("zero", isNone(sel) || !num(sel.price));
      });
      // summary pills
      const inc = included();
      const keys = inc.map((x) => x.i + ":" + state.picks[x.i]);
      const pills = el.querySelector(".pills");
      pills.innerHTML = inc.length
        ? inc
            .map((x, n) => `<span class="pill${!first && !this.lastPills.includes(keys[n]) ? " new" : ""}">${esc(x.ing.name)} <b>${esc(x.opt.label)}</b></span>`)
            .join("")
        : `<span class="pill empty">Tap ingredients below to add them</span>`;
      const fresh = pills.querySelector(".pill.new");
      if (fresh) pills.scrollTo({ left: fresh.offsetLeft - 40, behavior: "smooth" });
      this.lastPills = keys;
      const n = nutritionOf(state.mode, state.picks);
      el.querySelector(".summary-count").textContent = `${n.calories} cal` + (n.protein ? ` · ${n.protein} g protein` : "");
      // caffeine meter
      const meter = el.querySelector(".meter");
      if (meter) {
        const caf = caffeineTotal();
        meter.querySelector(".caf").textContent = caf;
        meter.querySelector(".meter-fill").style.width = Math.min(100, (caf / caffeineLimit()) * 100) + "%";
        meter.classList.toggle("full", caf >= caffeineLimit());
      }
      // taste tips that just became true
      const tips = ruleHits(state.mode, state.picks, false);
      if (!first) {
        const fresh = tips.find((t) => !this.lastTips.includes(t));
        if (fresh) toast("Taste tip: " + fresh.message, 3600);
      }
      this.lastTips = tips;
      // cup, presets, total
      syncCup(el.querySelector(".summary .cup-body"));
      const ap = activePreset();
      el.querySelectorAll(".preset").forEach((b) => b.classList.toggle("on", +b.dataset.k === ap));
      const total = el.querySelector(".total");
      const p = price();
      if (!first && p !== this.lastPrice) {
        tweenMoney(total, this.lastPrice, p);
        total.classList.remove("bump");
        void total.offsetWidth;
        total.classList.add("bump");
      }
      this.lastPrice = p;
    },
  };

  function tweenMoney(el, from, to) {
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 320);
      el.textContent = money(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // 4. Review
  SCREENS.review = {
    html() {
      const d = drink();
      const inc = included();
      const mp = memberPrice();
      const full = mp.full;
      const n = nutritionOf(state.mode, state.picks);
      const lines = [
        `<div class="line"><span class="l-name">Base <b>cup, cold water and mixing</b></span><span class="l-price">${money(d.basePrice)}</span></div>`,
        ...inc.map(
          (x) => `<div class="line"><span class="l-name">${esc(x.ing.name)} <b>${esc(x.opt.label)}</b></span>
            <span class="l-price">${num(x.opt.price) > 0 ? "+" + money(x.opt.price) : "Included"}</span></div>`
        ),
      ];
      if (mp.plan) {
        lines.push(`<div class="line member"><span class="l-name">${esc(mp.note)}</span><span class="l-price">−${money(full - mp.total)}</span></div>`);
      }
      lines.push(`<div class="line total-line"><span class="l-name">Total</span><span class="l-price">${mp.plan ? `<span class="was">${money(full)}</span>` : ""}${money(mp.total)}</span></div>`);

      const facts = `<div class="facts">
          <div><b>${n.calories}</b><span>Calories</span></div>
          <div><b>${n.protein} g</b><span>Protein</span></div>
          <div><b>${n.caffeine} mg</b><span>Caffeine</span></div>
        </div>
        <div class="allergens">
          <p><b>Allergens:</b> ${n.allergens.length ? esc(n.allergens.join(", ")) : "None of the major allergens in this recipe"}</p>
          ${S.allergenNote ? `<p class="muted">${esc(S.allergenNote)}</p>` : ""}
          ${n.caffeine > 0 && S.caffeineAdvisory ? `<p class="muted">${esc(S.caffeineAdvisory)}</p>` : ""}
        </div>`;

      const tips = ruleHits(state.mode, state.picks, false)
        .map((t) => `<p class="demo-note tip">${icon("info")}<span><b>Taste tip:</b> ${esc(t.message)}</span></p>`)
        .join("");

      // "Members save" callout
      let callout = "";
      if (mp.plan) {
        const what =
          mp.plan.kind === "discount"
            ? `You save <b>${money(full - mp.total)}</b> on this stack with ${esc(mp.plan.name)}.`
            : mp.total > 0
              ? `Your ${esc(mp.plan.name)} plan covers this stack. Premium upgrades are <b>${money(mp.total)}</b> at the Club price.`
              : `This stack is <b>covered</b> by your ${esc(mp.plan.name)} plan.`;
        callout = `<div class="callout"><p class="eyebrow">Member pricing applied</p><p>${what}</p>
          ${state.member ? "" : `<button class="btn btn-ghost" data-act="memberships" data-from="review">Change plan</button>`}</div>`;
      } else if (plans().length) {
        const disc = planOfKind("discount");
        const unl = planOfKind("unlimited");
        const bits = [];
        if (disc) bits.push(`${esc(disc.name)} members pay <b>${money(full * (1 - num(disc.discountPercent) / 100))}</b> for this stack, ${num(disc.discountPercent)}% off.`);
        if (unl) {
          const u = memberPriceOf(state.mode, state.picks, plans().indexOf(unl));
          bits.push(u.total > 0 ? `On ${esc(unl.name)} it's just <b>${money(u.total)}</b> for the premium upgrades.` : `On ${esc(unl.name)} it's <b>included</b>.`);
        }
        callout = `<div class="callout"><p class="eyebrow">Members save</p><p>${bits.join(" ")}</p>
            <button class="btn btn-ghost" data-act="memberships" data-from="review">See membership options</button></div>`;
      }
      const payLabel = mp.plan && mp.total === 0 ? "Redeem" : "Pay " + money(mp.total);
      return `
        <div class="topbar"><button class="icon-btn" data-act="back" data-to="build" aria-label="Back">${icon("back")}</button>${logo()}</div>
        <div class="scroll">
          <div class="review-hero">
            ${cupHTML("", true)}
            <div><p class="eyebrow">Review your stack</p><h2 class="display h2">${esc(d.name)}</h2>
              <p class="muted" style="margin:8px 0 0">${inc.length} ingredients</p></div>
          </div>
          <div class="lines">${lines.join("")}</div>
          ${facts}
          ${tips}
          ${callout}
        </div>
        <div class="foot btn-row">
          <button class="btn btn-ghost" data-act="back" data-to="build">Edit</button>
          <button class="btn btn-primary" data-act="pay">${payLabel}</button>
        </div>`;
    },
  };

  // 5. Fake checkout
  SCREENS.pay = {
    html() {
      const mp = memberPrice();
      const covered = mp.plan && mp.total === 0;
      return `
        <div class="topbar"><button class="icon-btn" data-act="back" data-to="review" aria-label="Back">${icon("back")}</button></div>
        <div class="center-body">
          <p class="eyebrow">${covered ? esc(mp.note) : "Total"}</p>
          <div class="pay-amount">${money(mp.total)}</div>
          <button class="tap-target" data-act="tap-pay" aria-label="Tap to pay">
            <span class="tap-inner">${icon("contactless")}<span>${covered ? "Tap member tag" : "Tap to pay"}</span></span>
          </button>
          <div class="pay-methods"><span>Apple Pay</span><span>Google Pay</span><span>Card</span><span>Member tag</span></div>
          <p class="fine">Demo only. No payment is taken.</p>
        </div>`;
    },
  };

  SCREENS.mix = {
    html() {
      return `
        <div class="topbar"></div>
        <div class="center-body">
          <p class="eyebrow">Mixing your stack</p>
          <h2 class="display h2">Fresh, right now.</h2>
          ${cupHTML("mix-cup", false)}
          <div class="progress"><div class="progress-fill"></div></div>
          <div class="mix-step"></div>
          <div class="mix-pct">0%</div>
        </div>`;
    },
    mount(el) {
      const inc = included();
      const steps = [
        { text: "Dispensing cold filtered water" },
        ...inc.map((x) => ({ text: `Adding ${x.ing.name}: ${x.opt.label}`, layer: x.i })),
        { text: "Blending" },
        { text: "Chilling and sealing" },
      ];
      const cup = el.querySelector(".cup");
      const body = el.querySelector(".cup-body");
      const bubbles = document.createElement("div");
      bubbles.className = "bubbles";
      bubbles.innerHTML = [18, 34, 52, 66, 80].map((x, n) => `<span style="left:${x}%;animation-delay:${n * 0.35}s"></span>`).join("");
      cup.appendChild(bubbles);
      const fill = el.querySelector(".progress-fill");
      const stepEl = el.querySelector(".mix-step");
      const pct = el.querySelector(".mix-pct");
      const DURATION = 5200;
      const t0 = performance.now();
      let shown = -1;
      const frame = (t) => {
        const k = Math.min(1, (t - t0) / DURATION);
        fill.style.width = k * 100 + "%";
        pct.textContent = Math.round(k * 100) + "%";
        const s = Math.min(steps.length - 1, Math.floor(k * steps.length));
        while (shown < s) {
          shown++;
          stepEl.textContent = steps[shown].text;
          stepEl.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 250 });
          if (steps[shown].layer != null) {
            const tmp = document.createElement("div");
            tmp.innerHTML = layerHTML(steps[shown].layer, true);
            body.appendChild(tmp.firstChild);
          }
        }
        if (k < 1) timers.push(requestAnimationFrame(frame));
        else timers.push(setTimeout(() => go("ready"), 450));
      };
      timers.push(requestAnimationFrame(frame));
    },
  };

  // Records a member's drink: rewards progress and saving the stack.
  function memberAfterDrink() {
    const m = state.member;
    if (!m) return "";
    const goal = Math.max(1, num(m.drinksForFreeOne, 10));
    m.rewardsProgress = num(m.rewardsProgress) + 1;
    let reward;
    if (m.rewardsProgress >= goal) {
      m.rewardsProgress = 0;
      reward = "Free stack unlocked! It's waiting on your next visit.";
    } else {
      reward = `+1 toward a free stack: ${m.rewardsProgress} of ${goal}`;
    }
    const saved = list(m.savedStacks).some((st) => st.drink === state.mode && samePicks(picksFrom(st.drink, st.picks), state.picks));
    let savedMsg = "";
    if (!saved) {
      m.savedStacks = list(m.savedStacks).concat({ name: `My ${drink().name}`, drink: state.mode, picks: namedFrom(state.mode, state.picks) });
      savedMsg = `<p class="member-note">${icon("check")}<span>Saved to My Stacks for one-tap reorder</span></p>`;
    }
    return `<p class="member-note">${icon("star")}<span>${reward}</span></p>${savedMsg}`;
  }

  SCREENS.ready = {
    html() {
      const extra = memberAfterDrink();
      return `
        <div class="topbar"></div>
        <div class="center-body">
          <div class="ready-check">${icon("check")}</div>
          <h2 class="display h2">Your Stackt<br>is <span class="lime">ready.</span></h2>
          <p class="lead">Grab it below.</p>
          ${extra}
          <div class="grab">${icon("down")}<span>Pickup</span></div>
        </div>
        <div class="foot">
          <p class="countdown">Back to start in <b class="secs">20</b>s</p>
          <button class="btn btn-primary" data-act="done">Done</button>
        </div>`;
    },
    mount(el) {
      let secs = 20;
      const out = el.querySelector(".secs");
      const tick = () => {
        if (!ownerOpen) secs--;
        out.textContent = secs;
        if (secs <= 0) return finish();
        timers.push(setTimeout(tick, 1000));
      };
      timers.push(setTimeout(tick, 1000));
    },
  };

  function finish() {
    state.mode = null;
    state.picks = [];
    state.plan = null;
    state.member = null;
    state.buildFrom = "choose";
    app.classList.remove("a11y");
    go("welcome", { back: true });
  }

  // 6. Memberships
  SCREENS.memberships = {
    html() {
      const cards = plans()
        .map((p, k) => {
          const price = num(p.monthlyPrice);
          let value = "";
          if (p.kind === "pack" && num(p.drinksPerMonth)) value = `${num(p.drinksPerMonth)} drinks · ${money(price / p.drinksPerMonth)} per stack`;
          if (p.kind === "unlimited" && num(p.typicalVisitsPerMonth)) value = `About ${money(price / p.typicalVisitsPerMonth)} per stack at ${p.typicalVisitsPerMonth} visits a month`;
          if (p.kind === "discount") value = `${num(p.discountPercent)}% off every stack`;
          const current = state.plan === k;
          return `<article class="plan${p.badge ? " featured" : ""}${current ? " current" : ""}">
              <div class="plan-tags"><span class="plan-tag">${esc(p.tag)}</span>
              ${p.badge ? `<span class="plan-badge">${esc(p.badge)}</span>` : ""}</div>
              <h3 class="display plan-name">${esc(p.name)}</h3>
              <div class="plan-price"><b>${moneyShort(price)}</b><span>/ month</span></div>
              ${value ? `<div class="plan-value">${value}</div>` : ""}
              <ul>${list(p.perks).map((x) => `<li>${icon("check")}<span>${esc(x)}</span></li>`).join("")}</ul>
              <button class="btn ${current ? "btn-ghost" : "btn-primary"}" data-act="choose-plan" data-k="${k}">${current ? "Selected " + icon("check") : "Choose " + esc(p.name)}</button>
            </article>`;
        })
        .join("");
      return `
        <div class="topbar"><button class="icon-btn" data-act="back" data-to="${state.membershipFrom}" aria-label="Back">${icon("back")}</button>${logo()}</div>
        <div class="scroll">
          <div class="pad"><p class="eyebrow">Stackt membership</p><h2 class="display h2">Pick your plan</h2>
            <p class="lead">Three ways to save. Swipe to compare.</p></div>
          <div class="plans">${cards}</div>
          <div class="dots">${plans().map((_, k) => `<button data-act="dot" data-k="${k}" aria-label="Plan ${k + 1}"><i></i></button>`).join("")}</div>
          <p class="plans-note">Demo pricing. Choosing a plan here is pretend: nothing is charged.</p>
        </div>`;
    },
    mount(el) {
      const track = el.querySelector(".plans");
      const dots = [...el.querySelectorAll(".dots button")];
      const sync = () => {
        const cards = [...track.children];
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = 0;
        cards.forEach((c, k) => {
          if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = k;
        });
        dots.forEach((d, k) => d.classList.toggle("on", k === best));
      };
      track.addEventListener("scroll", sync, { passive: true });
      const startAt = state.plan != null ? state.plan : plans().findIndex((p) => p.badge);
      if (startAt > 0) track.scrollLeft = track.children[startAt].offsetLeft - 20;
      sync();
    },
  };

  // 7. Owner dashboard (hidden overlay)
  function colsChart(values, labelFor, startIndex, axis) {
    const max = Math.max(1, ...values);
    const step = [5, 10, 20, 25, 50, 100, 200, 500].find((s) => max / s <= 4) || 1000;
    const yMax = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = step; v <= yMax; v += step) ticks.push(v);
    return `<div class="chart-read"><span class="col-label">${esc(labelFor(startIndex))}</span><b class="col-val">${values[startIndex]} drinks</b></div>
      <div class="cols">
        ${ticks.map((v) => `<div class="grid" style="bottom:${(v / yMax) * 100}%"><span>${v}</span></div>`).join("")}
        ${values.map((n, k) => `<button class="col${k === startIndex ? " on" : ""}" data-act="col" data-k="${k}" aria-label="${esc(labelFor(k))}: ${n} drinks"><i style="height:${(n / yMax) * 100}%"></i></button>`).join("")}
      </div>
      <div class="col-axis"><span>${esc(axis[0])}</span><span>${esc(axis[1])}</span></div>`;
  }
  const dayLabel = (days) => (k) => {
    const ago = days.length - 1 - k;
    return ago === 0 ? "Today" : ago === 1 ? "Yesterday" : `${ago} days ago`;
  };

  function ownerHTML() {
    const o = S.owner || {};
    const gross = num(o.grossRevenue);
    const sharePct = num(o.revenueSharePercent);
    const share = (gross * sharePct) / 100;
    const sold = num(o.drinksSold);
    const days = list(o.drinksPerDay).map((n) => num(n));
    const hours = list(o.drinksByHour);
    const hourVals = hours.map((h) => num(h.drinks));
    const peak = hourVals.indexOf(Math.max(...hourVals));
    const top = list(o.topStacks);
    const maxTop = Math.max(1, ...top.map((t) => num(t.sold)));
    const pre = Math.max(0, Math.min(100, num(o.preWorkoutPercent, 50)));
    const delta = num(o.changeVsLastMonthPercent);
    const gymMembers = num(o.gymMembers);
    const kpi = (label, value, sub) =>
      `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div>${sub ? `<div class="kpi-delta">${sub}</div>` : ""}</div>`;
    const checks = (items) => `<ul class="checks">${list(items).map((x) => `<li>${icon("check")}<span>${esc(x)}</span></li>`).join("")}</ul>`;

    const results = `
      <div class="card hero-card">
        <p class="card-title">Your share this month</p>
        <div class="hero-num">${moneyBig(share)}</div>
        <p class="hero-sub"><b>${sharePct}%</b> of <b>${moneyBig(gross)}</b> in Stackt sales at your gym</p>
      </div>
      <div class="kpis">
        ${kpi("Drinks sold", sold.toLocaleString("en-US"), delta ? `${delta > 0 ? "▲ +" : "▼ "}${delta}% vs last month` : "")}
        ${kpi("Gross revenue", moneyBig(gross))}
        ${gymMembers ? kpi("Revenue per member", money(gross / gymMembers), "per gym member, per month") : ""}
        ${gymMembers ? kpi("Members using Stackt", Math.round((num(o.monthlyUsers) / gymMembers) * 100) + "%", `${num(o.monthlyUsers)} of ${gymMembers.toLocaleString("en-US")}`) : ""}
        ${kpi("Repeat rate", num(o.repeatRatePercent) + "%", "came back for another")}
        ${kpi("Stackt memberships", num(o.activeMembers).toLocaleString("en-US"))}
      </div>
      ${days.length ? `<div class="card" data-chart="days">
        <p class="card-title">Drinks per day, last ${days.length} days</p>
        ${colsChart(days, dayLabel(days), days.length - 1, [`${days.length} days ago`, "Today"])}
      </div>` : ""}
      ${hours.length ? `<div class="card" data-chart="hours">
        <p class="card-title">Busiest hours</p>
        ${colsChart(hourVals, (k) => hours[k].time, peak, [hours[0].time, hours[hours.length - 1].time])}
      </div>` : ""}
      ${top.length ? `<div class="card">
        <p class="card-title">Most popular stacks</p>
        <div class="hbars">${top
          .map((t, k) => `<div><div class="hbar-top"><b>${esc(t.name)}</b><span>${num(t.sold).toLocaleString("en-US")}</span></div>
            <div class="hbar-track"><i style="width:${(num(t.sold) / maxTop) * 100}%;animation-delay:${k * 80}ms"></i></div></div>`)
          .join("")}</div>
      </div>` : ""}
      <div class="card">
        <p class="card-title">Pre vs post-workout</p>
        <div class="split"><i style="width:${pre}%"></i><i style="width:${100 - pre}%"></i></div>
        <div class="legend"><span><i></i>Pre-workout ${pre}%</span><span><i></i>Post-workout ${100 - pre}%</span></div>
      </div>
      <div class="card">
        <p class="card-title">Machine health</p>
        <div class="health-row"><span>Uptime this month</span><b>${num(o.uptimePercent)}%</b></div>
        <div class="health-row"><span>Last sanitized</span><b>${esc(o.lastSanitized || "Today")}</b></div>
        <div class="stock">${list(o.stockLevels)
          .map((s) => {
            const p = Math.max(0, Math.min(100, num(s.percent)));
            return `<div class="stock-row"><div class="hbar-top"><b>${esc(s.name)}</b><span>${p < 25 ? "Low · restock booked" : p + "%"}</span></div>
              <div class="meter-track"><div class="meter-fill${p < 25 ? " low" : ""}" style="width:${p}%"></div></div></div>`;
          })
          .join("")}</div>
      </div>`;

    const bonus = num(o.bonusSharePercent);
    const dealRows = [
      { label: "Your share", value: `${sharePct}% of sales after tax and refunds` },
      ...(bonus && num(o.bonusAboveMonthlySales) ? [{ label: "Busy-gym bonus", value: `${bonus}% on monthly sales above ${moneyBig(num(o.bonusAboveMonthlySales))}` }] : []),
      ...list(o.dealTerms),
    ];
    const deal = `
      <div class="card hero-card">
        <p class="card-title">The deal</p>
        <dl class="terms">${dealRows.map((r) => `<div><dt>${esc(r.label)}</dt><dd>${esc(r.value)}</dd></div>`).join("")}</dl>
      </div>
      ${o.pilot ? `<div class="card"><p class="card-title">Try it first</p><p class="card-text">${esc(o.pilot)}</p></div>` : ""}
      ${o.shakeBarAnswer ? `<div class="card"><p class="card-title">Have a shake bar already?</p><p class="card-text">${esc(o.shakeBarAnswer)}</p></div>` : ""}
      ${list(o.whatYouGet).length ? `<div class="card"><p class="card-title">What's in it for you</p>${checks(o.whatYouGet)}</div>` : ""}`;

    const setup = `
      <div class="card">
        <p class="card-title">What the kiosk needs</p>
        <dl class="terms">${list(o.siteRequirements)
          .map((r) => `<div><dt>${esc(r.label)}</dt><dd>${esc(r.value)}${r.confirmed ? "" : ` <span class="tbc">To be confirmed</span>`}</dd></div>`)
          .join("")}</dl>
      </div>
      ${list(o.compliance).length ? `<div class="card"><p class="card-title">Permits, insurance and safety: handled</p>${checks(o.compliance)}</div>` : ""}
      ${list(o.hygiene).length ? `<div class="card"><p class="card-title">Clean every time</p>${checks(o.hygiene)}
        <div class="health-row" style="margin-top:14px"><span>Last sanitized</span><b>${esc(o.lastSanitized || "Today")}</b></div></div>` : ""}
      <div class="card" style="margin-bottom:calc(var(--safe-bottom) + 24px)"><p class="card-title">Accessible</p>
        ${checks(["Larger text and high-contrast mode on the start screen", "Every control usable by touch, with big tap targets"])}</div>`;

    return `
      <div class="topbar">
        <span class="owner-tag">Owner view</span>
        <button class="icon-btn" data-act="close-owner" aria-label="Close owner view" style="justify-self:end">${icon("x")}</button>
      </div>
      <div class="scroll">
        <div class="owner-head">
          <h2 class="display h3">${esc(S.gymName || "Your gym")}</h2>
          <p class="muted">${esc(o.monthLabel || "This month")} <span class="sample">Sample data</span></p>
        </div>
        <div class="tabs" role="tablist">
          <button class="tab on" data-act="owner-tab" data-tab="results" role="tab">Results</button>
          <button class="tab" data-act="owner-tab" data-tab="deal" role="tab">The deal</button>
          <button class="tab" data-act="owner-tab" data-tab="setup" role="tab">Setup</button>
        </div>
        <div class="pane" data-pane="results">${results}</div>
        <div class="pane" data-pane="deal" hidden>${deal}</div>
        <div class="pane" data-pane="setup" hidden>${setup}</div>
      </div>`;
  }

  function openOwner() {
    if (ownerOpen) return;
    ownerOpen = true;
    const el = document.createElement("section");
    el.className = "screen owner";
    el.style.zIndex = 20;
    el.innerHTML = ownerHTML();
    app.appendChild(el);
    el.animate([{ transform: "translateY(100%)" }, { transform: "none" }], { duration: 450, easing: EASE });
  }
  function closeOwner() {
    const el = app.querySelector(".screen.owner");
    if (!el) return;
    el.style.pointerEvents = "none";
    el.animate([{ transform: "none" }, { transform: "translateY(100%)" }], { duration: 380, easing: EASE, fill: "forwards" }).onfinish = () => {
      el.remove();
      ownerOpen = false;
    };
  }

  // Secret gesture: tap the logo 3 times, or press and hold it.
  let taps = [];
  let hold = null;
  let holdFired = false;
  let holdStart = null;
  app.addEventListener("pointerdown", (e) => {
    if (!e.target.closest("[data-logo]")) return;
    holdFired = false;
    holdStart = { x: e.clientX, y: e.clientY };
    hold = setTimeout(() => {
      hold = null;
      holdFired = true;
      taps = [];
      openOwner();
    }, 700);
  });
  const cancelHold = () => { clearTimeout(hold); hold = null; };
  app.addEventListener("pointerup", cancelHold);
  app.addEventListener("pointercancel", cancelHold);
  app.addEventListener("pointermove", (e) => {
    if (hold && holdStart && Math.hypot(e.clientX - holdStart.x, e.clientY - holdStart.y) > 12) cancelHold();
  });
  app.addEventListener("contextmenu", (e) => { if (e.target.closest("[data-logo]")) e.preventDefault(); });

  // ---------------------------------------------------------------- taps

  app.addEventListener("click", (e) => {
    if (e.target.closest("[data-logo]")) {
      if (holdFired) return;
      const now = Date.now();
      taps = taps.filter((t) => now - t < 1200).concat(now);
      if (taps.length >= 3) {
        taps = [];
        openOwner();
      }
      return;
    }
    const t = e.target.closest("[data-act]");
    if (!t) return;
    const act = t.dataset.act;
    const B = SCREENS.build;

    switch (act) {
      case "start":
        go("choose");
        break;
      case "start-member":
        state.buildFrom = "choose";
        go("choose");
        break;
      case "back":
        go(t.dataset.to, { back: true });
        break;
      case "a11y":
        app.classList.toggle("a11y");
        t.classList.toggle("on", app.classList.contains("a11y"));
        if (SCREENS.welcome.fit) SCREENS.welcome.fit();
        toast(app.classList.contains("a11y") ? "Larger text and high contrast on" : "Standard display");
        break;
      case "scan":
        go("scan");
        break;
      case "do-scan": {
        if (t.classList.contains("reading")) break;
        t.classList.add("reading");
        t.querySelector(".scan-label").textContent = "Reading tag…";
        timers.push(
          setTimeout(() => {
            const m = S.demoMember || {};
            state.member = JSON.parse(JSON.stringify({ name: "Member", savedStacks: [], ...m }));
            const plan = planOfKind(m.plan);
            state.plan = plan ? plans().indexOf(plan) : null;
            go("member");
          }, 1300)
        );
        break;
      }
      case "reorder": {
        const st = state.member.savedStacks[+t.dataset.k];
        state.mode = st.drink;
        state.picks = picksFrom(st.drink, st.picks);
        state.buildFrom = "member";
        go("review");
        break;
      }
      case "mode":
        startBuild(t.dataset.mode);
        state.buildFrom = "choose";
        go("build");
        break;
      case "pick": {
        const i = +t.dataset.i;
        const j = +t.dataset.j;
        if (state.picks[i] === j) break;
        const why = blockReason(i, j);
        if (why) {
          toast(why.long, 3400);
          break;
        }
        state.picks[i] = j;
        B.update();
        break;
      }
      case "preset": {
        const p = drink().signatureStacks[+t.dataset.k];
        state.picks = picksFrom(state.mode, p.picks);
        B.update();
        toast(`${p.name} loaded. Tweak anything you like.`);
        break;
      }
      case "reset-build":
        state.picks = ingredients().map(startIndex);
        B.update();
        break;
      case "review":
        if (!included().length) {
          toast("Add at least one ingredient to your stack.");
          break;
        }
        go("review");
        break;
      case "memberships":
        state.membershipFrom = t.dataset.from || "welcome";
        go("memberships");
        break;
      case "dot": {
        const track = app.querySelector(".screen:not(.leaving):not(.owner) .plans");
        track.scrollTo({ left: track.children[+t.dataset.k].offsetLeft - 20, behavior: "smooth" });
        break;
      }
      case "choose-plan": {
        const k = +t.dataset.k;
        if (state.plan === k) break;
        state.plan = k;
        const p = plans()[k];
        if (state.membershipFrom === "review") {
          toast(`${p.name} applied (demo). Member pricing is on.`);
          go("review", { back: true });
        } else {
          toast(`Welcome to ${p.name} (demo). Now build your first stack.`, 3000);
          go("choose");
        }
        break;
      }
      case "pay":
        go("pay");
        break;
      case "tap-pay": {
        if (t.classList.contains("approved")) break;
        t.classList.add("approved", "check-pop");
        t.querySelector(".tap-inner").innerHTML = `${icon("check")}<span>Approved</span>`;
        timers.push(setTimeout(() => go("mix"), 900));
        break;
      }
      case "done":
        finish();
        break;
      case "hide-hint":
        try { localStorage.setItem("stackt-hint", "1"); } catch (err) { /* private mode */ }
        t.closest(".install-hint").remove();
        break;
      case "close-owner":
        closeOwner();
        break;
      case "owner-tab": {
        const owner = t.closest(".screen.owner");
        owner.querySelectorAll(".tab").forEach((b) => b.classList.toggle("on", b === t));
        owner.querySelectorAll(".pane").forEach((p) => (p.hidden = p.dataset.pane !== t.dataset.tab));
        owner.querySelector(".scroll").scrollTop = 0;
        break;
      }
      case "col": {
        const card = t.closest(".card");
        const o = S.owner;
        const k = +t.dataset.k;
        card.querySelectorAll(".col").forEach((c) => c.classList.toggle("on", c === t));
        const hours = card.dataset.chart === "hours";
        const days = list(o.drinksPerDay);
        card.querySelector(".col-label").textContent = hours ? o.drinksByHour[k].time : dayLabel(days)(k);
        card.querySelector(".col-val").textContent = `${hours ? o.drinksByHour[k].drinks : days[k]} drinks`;
        break;
      }
    }
  });

  // ---------------------------------------------------------------- go

  go("welcome");

  // Offline support once installed. Always tries the network first,
  // so edits to settings.js show up as soon as the phone is online.
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
