(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function safeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[match];
    });
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initSearchForms() {
    selectAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q'], input[type='search']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = target + (value ? "?q=" + encodeURIComponent(value) : "");
      });
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", slider);
    var dots = selectAll("[data-hero-dot]", slider);
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  }

  function initCardFilters() {
    var input = document.querySelector("[data-card-filter]");
    var cards = selectAll("[data-card-list] .movie-card");
    var buttons = selectAll("[data-type-filter]");
    if (!cards.length) {
      return;
    }
    var type = "all";
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var matchText = !query || keywords.indexOf(query) !== -1;
        var matchType = type === "all" || cardType.indexOf(type) !== -1;
        card.classList.toggle("hidden-card", !(matchText && matchType));
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        type = button.getAttribute("data-type-filter") || "all";
        apply();
      });
    });
  }

  function buildSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + safeText(tag) + "</span>";
    }).join("");
    return "<article class='movie-card glass-effect card-hover'>" +
      "<a class='card-cover' href='./" + safeText(item.file) + "'>" +
      "<img src='" + safeText(item.cover) + "' alt='" + safeText(item.title) + "' loading='lazy'>" +
      "<span class='card-year'>" + safeText(item.year) + "</span>" +
      "<span class='card-type'>" + safeText(item.type) + "</span>" +
      "</a>" +
      "<div class='card-body'>" +
      "<h2 class='card-title'><a href='./" + safeText(item.file) + "'>" + safeText(item.title) + "</a></h2>" +
      "<p class='card-desc'>" + safeText(item.oneLine) + "</p>" +
      "<div class='card-meta'><span>" + safeText(item.region) + "</span><span>" + safeText(item.genre) + "</span></div>" +
      "<div class='tag-row'>" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-results]");
    if (!root || !Array.isArray(window.SEARCH_MOVIES)) {
      return;
    }
    var summary = document.querySelector("[data-search-summary]");
    var input = document.querySelector("[data-search-input]");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (item) {
      if (!normalized) {
        return true;
      }
      return [item.title, item.region, item.type, item.year, item.genre, item.oneLine, (item.tags || []).join(" ")]
        .join(" ")
        .toLowerCase()
        .indexOf(normalized) !== -1;
    }).slice(0, normalized ? 200 : 80);
    root.innerHTML = results.map(buildSearchCard).join("");
    if (summary) {
      summary.textContent = normalized ? "找到 " + results.length + " 个相关影片" : "推荐影片";
    }
  }

  initMenu();
  initSearchForms();
  initHero();
  initCardFilters();
  initSearchPage();
})();
