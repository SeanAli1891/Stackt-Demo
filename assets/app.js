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
    membershipFrom: "welcome",
  };
  let timers = [];
  let ownerOpen = false;

  const plans = () => (Array.isArray(S.memberships) ? S.memberships : []);
  const drink = () => S.drinks[state.mode];
  const ingredients = () => drink().ingredients || [];
  const optIndex = (ing, label) => ing.options.findIndex((o) => same(o.label, label));
  const noneIndex = (ing) => ing.options.findIndex(isNone);
  const startIndex = (ing) => Math.max(0, optIndex(ing, ing.start));
  const pickOf = (i) => ingredients()[i].options[state.picks[i]];
  const included = () =>
    ingredients()
      .map((ing, i) => ({ ing, opt: ing.options[state.picks[i]], i }))
      .filter((x) => x.opt && !isNone(x.opt));

  function startBuild(mode) {
    state.mode = mode;
    state.picks = ingredients().map(startIndex);
  }

  function presetPicks(preset) {
    const picks = preset.picks || {};
    return ingredients().map((ing) => {
      const key = Object.keys(picks).find((k) => same(k, ing.name));
      if (key) {
        const idx = optIndex(ing, picks[key]);
        if (idx >= 0) return idx;
      }
      const n = noneIndex(ing);
      return n >= 0 ? n : startIndex(ing);
    });
  }
  const activePreset = () =>
    (drink().signatureStacks || []).findIndex((p) => presetPicks(p).every((v, i) => v === state.picks[i]));

  const hasCaffeine = () => ingredients().some((ing) => ing.options.some((o) => num(o.caffeineMg) > 0));
  const caffeineLimit = () => num(S.caffeineLimitMg, 300);
  const caffeineTotal = (picks) =>
    ingredients().reduce((sum, ing, i) => sum + num((ing.options[(picks || state.picks)[i]] || {}).caffeineMg), 0);
  const overLimit = (i, j) => {
    const picks = state.picks.slice();
    picks[i] = j;
    return caffeineTotal(picks) > caffeineLimit();
  };

  const price = () => num(drink().basePrice) + included().reduce((s, x) => s + num(x.opt.price), 0);

  // What the customer pays with the demo membership applied.
  function memberPrice(full) {
    const plan = plans()[state.plan];
    if (!plan) return { total: full, note: null };
    if (plan.kind === "discount") {
      const pct = num(plan.discountPercent);
      return { total: full * (1 - pct / 100), note: `${plan.name} −${pct}%`, plan };
    }
    return { total: 0, note: `Covered by ${plan.name}`, plan };
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
    const old = app.querySelector(".screen:not(.leaving)");
    app.appendChild(el);
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
    const layers = withLayers
      ? included().map((x) => layerHTML(x.i)).join("")
      : "";
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

  // 1. Welcome / attract
  SCREENS.welcome = {
    html() {
      const plan = plans()[state.plan];
      return `
        <div class="topbar">${logo(true)}</div>
        <div class="welcome-body">
          <div class="hero-stack" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <h1 class="display h1">${sloganHTML()}</h1>
          <p class="lead">Pre and post-workout drinks, mixed on the spot to your exact recipe.</p>
          ${plan ? `<p class="eyebrow" style="margin-top:16px">${esc(plan.name)} active (demo)</p>` : ""}
        </div>
        <div class="foot welcome-actions">
          <button class="btn btn-primary btn-start" data-act="start">Start ${icon("arrow")}</button>
          <button class="btn btn-ghost" data-act="memberships" data-from="welcome">Memberships</button>
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
      return `
        <div class="topbar"><button class="icon-btn" data-act="back" data-to="welcome" aria-label="Back">${icon("back")}</button>${logo()}</div>
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
      const presets = d.signatureStacks || [];
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
          <button class="icon-btn" data-act="back" data-to="choose" aria-label="Back">${icon("back")}</button>
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
          c.classList.toggle("on", on);
          c.classList.toggle("blocked", !on && overLimit(i, j));
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
      el.querySelector(".summary-count").textContent = inc.length + (inc.length === 1 ? " ingredient" : " ingredients");
      // caffeine meter
      const meter = el.querySelector(".meter");
      if (meter) {
        const caf = caffeineTotal();
        meter.querySelector(".caf").textContent = caf;
        meter.querySelector(".meter-fill").style.width = Math.min(100, (caf / caffeineLimit()) * 100) + "%";
        meter.classList.toggle("full", caf >= caffeineLimit());
      }
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
      const full = price();
      const mp = memberPrice(full);
      const caf = caffeineTotal();
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

      // "Members save" callout
      let callout;
      if (mp.plan) {
        callout = `<div class="callout"><p class="eyebrow">Member pricing applied</p>
          <p>${mp.plan.kind === "discount" ? `You save <b>${money(full - mp.total)}</b> on this stack with ${esc(mp.plan.name)}.` : `This stack is <b>covered</b> by your ${esc(mp.plan.name)} plan.`}</p>
          <button class="btn btn-ghost" data-act="memberships" data-from="review">Change plan</button></div>`;
      } else {
        const disc = plans().find((p) => p.kind === "discount");
        const flat = plans().find((p) => p.kind === "unlimited") || plans().find((p) => p.kind === "pack");
        const bits = [];
        if (disc) bits.push(`${esc(disc.name)} members pay <b>${money(full * (1 - num(disc.discountPercent) / 100))}</b> for this stack, ${num(disc.discountPercent)}% off.`);
        if (flat) bits.push(`On ${esc(flat.name)} it's <b>included</b>.`);
        callout = plans().length
          ? `<div class="callout"><p class="eyebrow">Members save</p><p>${bits.join(" ")}</p>
              <button class="btn btn-ghost" data-act="memberships" data-from="review">See membership options</button></div>`
          : "";
      }
      const payLabel = mp.plan && mp.total === 0 ? "Redeem" : "Pay " + money(mp.total);
      return `
        <div class="topbar"><button class="icon-btn" data-act="back" data-to="build" aria-label="Back">${icon("back")}</button>${logo()}</div>
        <div class="scroll">
          <div class="review-hero">
            ${cupHTML("", true)}
            <div><p class="eyebrow">Review your stack</p><h2 class="display h2">${esc(d.name)}</h2>
              <p class="muted" style="margin:8px 0 0">${inc.length} ingredients${hasCaffeine() ? ` · ${caf} mg caffeine` : ""}</p></div>
          </div>
          <div class="lines">${lines.join("")}</div>
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
      const mp = memberPrice(price());
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

  SCREENS.ready = {
    html() {
      return `
        <div class="topbar"></div>
        <div class="center-body">
          <div class="ready-check">${icon("check")}</div>
          <h2 class="display h2">Your Stackt<br>is <span class="lime">ready.</span></h2>
          <p class="lead">Grab it below.</p>
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
              <span class="plan-tag">${esc(p.tag)}</span>
              ${p.badge ? `<span class="plan-badge">${esc(p.badge)}</span>` : ""}
              <h3 class="display plan-name">${esc(p.name)}</h3>
              <div class="plan-price"><b>${moneyShort(price)}</b><span>/ month</span></div>
              ${value ? `<div class="plan-value">${value}</div>` : ""}
              <ul>${(p.perks || []).map((x) => `<li>${icon("check")}<span>${esc(x)}</span></li>`).join("")}</ul>
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
  function ownerHTML() {
    const o = S.owner || {};
    const gross = num(o.grossRevenue);
    const sharePct = num(o.revenueSharePercent);
    const share = (gross * sharePct) / 100;
    const sold = num(o.drinksSold);
    const days = Array.isArray(o.drinksPerDay) ? o.drinksPerDay.map((n) => num(n)) : [];
    const top = Array.isArray(o.topStacks) ? o.topStacks : [];
    const maxTop = Math.max(1, ...top.map((t) => num(t.sold)));
    const pre = Math.max(0, Math.min(100, num(o.preWorkoutPercent, 50)));
    const delta = num(o.changeVsLastMonthPercent);

    // clean y-axis ticks for the daily chart
    const maxDay = Math.max(1, ...days);
    const stepSize = [5, 10, 20, 25, 50, 100, 200, 500].find((s) => maxDay / s <= 4) || 1000;
    const yMax = Math.ceil(maxDay / stepSize) * stepSize;
    const ticks = [];
    for (let v = stepSize; v <= yMax; v += stepSize) ticks.push(v);

    return `
      <div class="topbar">
        <span class="owner-tag">Owner view</span>
        <button class="icon-btn" data-act="close-owner" aria-label="Close owner view" style="justify-self:end">${icon("x")}</button>
      </div>
      <div class="scroll">
        <div class="owner-head">
          <h2 class="display h3">${esc(o.gymName || S.gymName || "Your gym")}</h2>
          <p class="muted">${esc(o.monthLabel || "This month")} <span class="sample">Sample data</span></p>
        </div>

        <div class="card hero-card">
          <p class="card-title">Your share this month</p>
          <div class="hero-num">${moneyBig(share)}</div>
          <p class="hero-sub"><b>${sharePct}%</b> of <b>${moneyBig(gross)}</b> in Stackt sales at your gym</p>
        </div>

        <div class="kpis">
          <div class="kpi"><div class="kpi-label">Drinks sold</div><div class="kpi-value">${sold.toLocaleString("en-US")}</div>
            ${delta ? `<div class="kpi-delta">${delta > 0 ? "▲ +" : "▼ "}${delta}% vs last month</div>` : ""}</div>
          <div class="kpi"><div class="kpi-label">Gross revenue</div><div class="kpi-value">${moneyBig(gross)}</div></div>
          <div class="kpi"><div class="kpi-label">Active members</div><div class="kpi-value">${num(o.activeMembers).toLocaleString("en-US")}</div></div>
          <div class="kpi"><div class="kpi-label">Avg per drink</div><div class="kpi-value">${sold ? money(gross / sold) : "—"}</div></div>
        </div>

        ${days.length ? `<div class="card">
          <p class="card-title">Drinks per day, last ${days.length} days</p>
          <div class="chart-read"><span class="day-label">Today</span><b class="day-val">${days[days.length - 1]} drinks</b></div>
          <div class="cols">
            ${ticks.map((v) => `<div class="grid" style="bottom:${(v / yMax) * 100}%"><span>${v}</span></div>`).join("")}
            ${days.map((n, k) => `<button class="col${k === days.length - 1 ? " on" : ""}" data-act="day" data-k="${k}" aria-label="${n} drinks"><i style="height:${(n / yMax) * 100}%"></i></button>`).join("")}
          </div>
          <div class="col-axis"><span>${days.length} days ago</span><span>Today</span></div>
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

        ${Array.isArray(o.whatYouGet) && o.whatYouGet.length ? `<div class="card" style="margin-bottom:calc(var(--safe-bottom) + 24px)">
          <p class="card-title">What's in it for you</p>
          <ul class="checks">${o.whatYouGet.map((x) => `<li>${icon("check")}<span>${esc(x)}</span></li>`).join("")}</ul>
        </div>` : ""}
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
      case "back":
        go(t.dataset.to, { back: true });
        break;
      case "mode":
        startBuild(t.dataset.mode);
        go("build");
        break;
      case "pick": {
        const i = +t.dataset.i;
        const j = +t.dataset.j;
        if (state.picks[i] === j) break;
        if (overLimit(i, j)) {
          toast(`That would go over the ${caffeineLimit()} mg caffeine limit. Lower another caffeine source first.`, 3200);
          break;
        }
        state.picks[i] = j;
        B.update();
        break;
      }
      case "preset": {
        const p = drink().signatureStacks[+t.dataset.k];
        state.picks = presetPicks(p);
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
        const track = app.querySelector(".screen:not(.leaving) .plans");
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
      case "day": {
        const card = t.closest(".card");
        const days = S.owner.drinksPerDay;
        const k = +t.dataset.k;
        card.querySelectorAll(".col").forEach((c) => c.classList.toggle("on", c === t));
        const ago = days.length - 1 - k;
        card.querySelector(".day-label").textContent = ago === 0 ? "Today" : ago === 1 ? "Yesterday" : `${ago} days ago`;
        card.querySelector(".day-val").textContent = `${days[k]} drinks`;
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
