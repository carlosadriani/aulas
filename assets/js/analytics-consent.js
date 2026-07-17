/* Ajuda Professor — Google Analytics 4 (GA4) + Consent Mode v2 (LGPD)
 * Os cookies de análise iniciam DESATIVADOS e só são ativados após o
 * consentimento do visitante no banner. A escolha fica salva no navegador.
 */
(function () {
  "use strict";

  var GA_ID = "G-ZHE86CNTZB";
  var STORAGE_KEY = "ap_cookie_consent"; // valores: "granted" | "denied"

  // --- gtag base ---
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // Consent Mode v2: tudo negado por padrão (antes do config)
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  gtag("js", new Date());
  gtag("config", GA_ID, { anonymize_ip: true });

  // Recupera escolha anterior
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  if (saved === "granted") {
    gtag("consent", "update", { analytics_storage: "granted" });
  }

  // --- Banner ---
  function persist(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function grant() {
    gtag("consent", "update", { analytics_storage: "granted" });
    persist("granted");
    removeBanner();
  }

  function deny() {
    gtag("consent", "update", { analytics_storage: "denied" });
    persist("denied");
    removeBanner();
  }

  function removeBanner() {
    var el = document.getElementById("ap-consent");
    if (el) el.parentNode.removeChild(el);
  }

  function injectStyles() {
    if (document.getElementById("ap-consent-style")) return;
    var css =
      "#ap-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;" +
      "background:#003366;color:#fff;border-radius:14px;padding:18px 20px;" +
      "box-shadow:0 12px 32px rgba(0,0,0,.28);border-top:4px solid #f59e0b;" +
      "font-family:'Inter','DM Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;" +
      "display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px;max-width:1040px;margin:0 auto;}" +
      "#ap-consent p{margin:0;flex:1 1 320px;font-size:14.5px;line-height:1.5;color:#e2e8f0;}" +
      "#ap-consent strong{color:#fff;}" +
      "#ap-consent .ap-actions{display:flex;gap:10px;flex:0 0 auto;}" +
      "#ap-consent button{cursor:pointer;border:0;border-radius:9px;padding:10px 18px;" +
      "font-size:14px;font-weight:600;font-family:inherit;transition:opacity .15s;}" +
      "#ap-consent button:hover{opacity:.9;}" +
      "#ap-consent .ap-accept{background:#f59e0b;color:#0f172a;}" +
      "#ap-consent .ap-reject{background:transparent;color:#cbd5e1;border:1px solid #475569;}" +
      "@media(max-width:640px){#ap-consent{flex-direction:column;align-items:stretch;}" +
      "#ap-consent .ap-actions{justify-content:flex-end;}}";
    var s = document.createElement("style");
    s.id = "ap-consent-style";
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  function showBanner() {
    if (document.getElementById("ap-consent")) return;
    injectStyles();
    var box = document.createElement("div");
    box.id = "ap-consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Aviso de cookies");
    box.innerHTML =
      '<p>Usamos cookies do <strong>Google Analytics</strong> para entender como o site é ' +
      'utilizado e melhorar o material das aulas. Você pode aceitar ou recusar. ' +
      'Nenhum cookie de análise é ativado sem o seu consentimento.</p>' +
      '<div class="ap-actions">' +
      '<button type="button" class="ap-reject">Recusar</button>' +
      '<button type="button" class="ap-accept">Aceitar</button>' +
      '</div>';
    box.querySelector(".ap-accept").addEventListener("click", grant);
    box.querySelector(".ap-reject").addEventListener("click", deny);
    (document.body || document.documentElement).appendChild(box);
  }

  // Reabrir o banner manualmente (ex.: link "Cookies" no rodapé)
  window.apOpenConsent = showBanner;

  // --- Links de rodapé: Privacidade + Preferências de cookies ---
  function injectFooterStyles() {
    if (document.getElementById("ap-footer-style")) return;
    var css =
      ".ap-footer-links{font-size:.82rem;line-height:1.5;margin:8px 0 0;" +
      "font-family:'Inter','DM Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;}" +
      ".ap-footer-links a{color:inherit;text-decoration:underline;text-underline-offset:2px;" +
      "opacity:.85;cursor:pointer;}" +
      ".ap-footer-links a:hover{opacity:1;}" +
      ".ap-footer-links.ap-standalone{background:#0f172a;color:#94a3b8;text-align:center;" +
      "padding:16px;margin:32px 0 0;}" +
      ".ap-support-btn{display:inline-flex;align-items:center;gap:6px;background:#f59e0b;" +
      "color:#0f172a !important;text-decoration:none !important;font-weight:700;" +
      "border-radius:999px;padding:7px 16px;font-size:.85rem;margin-bottom:8px;opacity:1 !important;}" +
      ".ap-support-btn:hover{opacity:.9 !important;}";
    var s = document.createElement("style");
    s.id = "ap-footer-style";
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  function addFooterLinks() {
    if (document.getElementById("ap-footer-links")) return;
    injectFooterStyles();
    var html =
      '<div><a class="ap-support-btn" href="/apoie.html">' +
      '<span aria-hidden="true">&#10084;</span> Apoie o projeto</a></div>' +
      '<div>' +
      '<a href="/privacidade.html">Privacidade</a>' +
      '<span aria-hidden="true"> &middot; </span>' +
      '<a href="#" class="ap-cookies-link">Preferências de cookies</a>' +
      '</div>';
    var footer = document.querySelector(".site-footer");
    var node;
    if (footer) {
      node = document.createElement("p");
      node.id = "ap-footer-links";
      node.className = "ap-footer-links";
      node.innerHTML = html;
      footer.appendChild(node);
    } else {
      node = document.createElement("div");
      node.id = "ap-footer-links";
      node.className = "ap-footer-links ap-standalone";
      node.innerHTML = html;
      (document.body || document.documentElement).appendChild(node);
    }
    var link = node.querySelector(".ap-cookies-link");
    if (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        showBanner();
      });
    }
  }

  function onReady() {
    addFooterLinks();
    // Mostra o banner apenas se ainda não houve escolha
    if (saved !== "granted" && saved !== "denied") showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
