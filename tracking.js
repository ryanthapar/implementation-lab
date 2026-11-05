/* Meta Pixel + cookie consent for the Implementation Lab pages.
   The pixel only loads after a visitor clicks Accept. */
(function () {
  var PIXEL_ID = "560295672672335";
  var CONSENT_KEY = "il_consent";
  var CURRENCY = "CAD";
  // Values are before HST. Edit here if you want different amounts reported.
  var PLANS = {
    monthly: { value: 139, name: "Implementation Lab - Monthly" },
    full: { value: 1390, name: "Implementation Lab - Paid in full" }
  };

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) {}
    return null;
  }

  var loaded = false, pending = [];
  function loadPixel() {
    if (loaded) return;
    loaded = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
    pending.splice(0).forEach(function (p) { window.fbq("track", p[0], p[1]); });
  }

  // Track an event; it is sent once consent is given, and dropped if declined.
  function track(name, params) {
    var c = store(CONSENT_KEY);
    if (c === "granted") { loadPixel(); window.fbq("track", name, params || {}); }
    else if (c !== "denied") pending.push([name, params || {}]);
  }
  window.ilTrack = track;
  window.ilPlans = PLANS;
  window.ilCurrency = CURRENCY;

  // Clicks on register buttons: <a data-plan="monthly|full">
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-plan]");
    if (!a) return;
    var plan = PLANS[a.getAttribute("data-plan")];
    if (plan) track("InitiateCheckout", { value: plan.value, currency: CURRENCY, content_name: plan.name });
  });

  function injectBanner() {
    var css = document.createElement("style");
    css.textContent =
      "#il-consent{position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:760px;margin:0 auto;background:#2a1060;color:#fff;border-radius:14px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.35);font:15px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;gap:14px;align-items:center;flex-wrap:wrap}" +
      "#il-consent p{margin:0;flex:1 1 320px}#il-consent a{color:#ffd23f}" +
      "#il-consent .il-btns{display:flex;gap:8px;flex-wrap:wrap}" +
      "#il-consent button{font:inherit;font-weight:800;border-radius:999px;padding:9px 20px;cursor:pointer;border:2px solid #ffd23f}" +
      "#il-accept{background:#ffd23f;color:#2a1060}#il-decline{background:transparent;color:#fff}";
    document.head.appendChild(css);
    var d = document.createElement("div");
    d.id = "il-consent"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Cookie consent");
    d.innerHTML = '<p>We use the Meta Pixel to measure how our ads perform. It uses cookies and shares your activity on this page with Meta. It only loads if you accept. <a href="privacy.html">Privacy details</a></p>' +
      '<div class="il-btns"><button id="il-accept" type="button">Accept</button><button id="il-decline" type="button">Decline</button></div>';
    document.body.appendChild(d);
    function choose(v) {
      store(CONSENT_KEY, v);
      d.remove();
      if (v === "granted") loadPixel(); else pending.length = 0;
    }
    document.getElementById("il-accept").addEventListener("click", function () { choose("granted"); });
    document.getElementById("il-decline").addEventListener("click", function () { choose("denied"); });
  }

  // Footer link: <a data-cookie-settings>
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-cookie-settings]");
    if (!a) return;
    e.preventDefault();
    store(CONSENT_KEY, "");
    if (!document.getElementById("il-consent")) injectBanner();
  });

  function init() {
    var c = store(CONSENT_KEY);
    if (c === "granted") loadPixel();
    else if (c !== "denied") injectBanner();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
