/* ============================================================
   cards.js — Comportamento das páginas de índice
   ------------------------------------------------------------
   Para cada grid .topic-grid[data-course]:
     • Busca por conteúdo (título, descrição, palavras-chave)
     • Favoritar cards (estrela) — fixa no topo
     • Reordenar por arrastar-e-soltar
   Persistência por disciplina via localStorage.
   Funciona sem dependências externas.
   ============================================================ */
(function () {
    "use strict";

    function init(grid) {
        var course = grid.getAttribute("data-course") || "default";
        var ORDER_KEY = "cards:order:" + course;
        var FAV_KEY = "cards:fav:" + course;

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".topic-card"));
        if (!cards.length) return;

        // ---------- Estado persistido ----------
        function load(key) {
            try { return JSON.parse(localStorage.getItem(key)) || []; }
            catch (e) { return []; }
        }
        function save(key, val) {
            try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
        }

        var savedOrder = load(ORDER_KEY);          // array de ids
        var favs = load(FAV_KEY);                   // array de ids favoritos

        function idOf(card) { return card.getAttribute("data-id"); }

        // ---------- Ordenação: salva primeiro, depois novos; favoritos no topo ----------
        function currentIds() {
            return Array.prototype.slice.call(grid.querySelectorAll(".topic-card")).map(idOf);
        }

        function applyOrder() {
            var byId = {};
            cards.forEach(function (c) { byId[idOf(c)] = c; });

            // ordem base = salva (mantendo só ids existentes) + ids novos no fim
            var ordered = savedOrder.filter(function (id) { return byId[id]; });
            currentIds().forEach(function (id) {
                if (ordered.indexOf(id) === -1) ordered.push(id);
            });

            // favoritos primeiro, preservando a ordem base (sort estável)
            ordered.sort(function (a, b) {
                var fa = favs.indexOf(a) !== -1 ? 0 : 1;
                var fb = favs.indexOf(b) !== -1 ? 0 : 1;
                return fa - fb;
            });

            ordered.forEach(function (id) {
                if (byId[id]) grid.appendChild(byId[id]);
            });
        }

        function persistOrder() {
            savedOrder = currentIds();
            save(ORDER_KEY, savedOrder);
        }

        // ---------- Favoritos ----------
        cards.forEach(function (card) {
            var btn = card.querySelector(".topic-card__fav");
            if (!btn) return;
            var id = idOf(card);
            if (favs.indexOf(id) !== -1) { btn.classList.add("is-fav"); setStar(btn, true); }

            btn.addEventListener("click", function (e) {
                e.preventDefault();
                var pos = favs.indexOf(id);
                if (pos === -1) { favs.push(id); btn.classList.add("is-fav"); setStar(btn, true); }
                else { favs.splice(pos, 1); btn.classList.remove("is-fav"); setStar(btn, false); }
                save(FAV_KEY, favs);
                applyOrder();
                applyFilters();
            });
        });

        function setStar(btn, on) {
            var i = btn.querySelector("i");
            if (!i) return;
            i.className = (on ? "fa-solid" : "fa-regular") + " fa-star";
        }

        // ---------- Arrastar para reordenar ----------
        var dragged = null;
        cards.forEach(function (card) {
            card.setAttribute("draggable", "true");

            card.addEventListener("dragstart", function (e) {
                dragged = card;
                card.classList.add("is-dragging");
                if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", idOf(card)); } catch (x) {} }
            });
            card.addEventListener("dragend", function () {
                card.classList.remove("is-dragging");
                clearMarkers();
                persistOrder();
                dragged = null;
            });
            card.addEventListener("dragover", function (e) {
                e.preventDefault();
                if (!dragged || dragged === card) return;
                clearMarkers();
                var rect = card.getBoundingClientRect();
                var before = (e.clientY - rect.top) < rect.height / 2;
                card.classList.add(before ? "drop-before" : "drop-after");
            });
            card.addEventListener("dragleave", function () {
                card.classList.remove("drop-before", "drop-after");
            });
            card.addEventListener("drop", function (e) {
                e.preventDefault();
                if (!dragged || dragged === card) return;
                var rect = card.getBoundingClientRect();
                var before = (e.clientY - rect.top) < rect.height / 2;
                grid.insertBefore(dragged, before ? card : card.nextSibling);
                clearMarkers();
            });
        });

        function clearMarkers() {
            cards.forEach(function (c) { c.classList.remove("drop-before", "drop-after"); });
        }

        // ---------- Busca + filtro de favoritos ----------
        var scope = grid.closest("main") || document;
        var search = scope.querySelector("[data-role='search']");
        var favFilter = scope.querySelector("[data-role='fav-filter']");
        var empty = scope.querySelector("[data-role='empty']");
        var onlyFavs = false;

        function applyFilters() {
            var q = (search && search.value || "").trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var hay = (card.getAttribute("data-keywords") || "") + " " +
                          (card.textContent || "");
                var matchText = !q || hay.toLowerCase().indexOf(q) !== -1;
                var matchFav = !onlyFavs || favs.indexOf(idOf(card)) !== -1;
                var show = matchText && matchFav;
                card.hidden = !show;
                if (show) visible++;
            });
            if (empty) empty.hidden = visible !== 0;
        }

        if (search) search.addEventListener("input", applyFilters);
        if (favFilter) {
            favFilter.addEventListener("click", function () {
                onlyFavs = !onlyFavs;
                favFilter.classList.toggle("is-active", onlyFavs);
                applyFilters();
            });
        }

        // ---------- Inicialização ----------
        applyOrder();
        applyFilters();
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".topic-grid[data-course]").forEach(init);
    });
})();
