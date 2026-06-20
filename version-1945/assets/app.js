document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;

    function activate(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        activate(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        activate(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    window.setInterval(function () {
      activate(current + 1);
    }, 5600);
  }

  var queryValue = new URLSearchParams(window.location.search).get("q") || "";
  var searchFields = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));

  searchFields.forEach(function (input) {
    if (queryValue) {
      input.value = queryValue;
    }
  });

  var lists = Array.prototype.slice.call(document.querySelectorAll("[data-movie-list]"));

  lists.forEach(function (list) {
    var block = list.closest("section") || document;
    var keywordInput = block.querySelector("[data-card-search]");
    var yearSelect = block.querySelector("[data-year-filter]");
    var typeSelect = block.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

    function getText(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" ").toLowerCase();
    }

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";

      cards.forEach(function (card) {
        var matchedKeyword = !keyword || getText(card).indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute("data-year") === year;
        var typeText = (card.getAttribute("data-type") || "") + " " + (card.getAttribute("data-genre") || "") + " " + (card.getAttribute("data-tags") || "");
        var matchedType = !type || typeText.indexOf(type) !== -1;
        card.hidden = !(matchedKeyword && matchedYear && matchedType);
      });
    }

    if (keywordInput) {
      keywordInput.addEventListener("input", applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilters);
    }

    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilters);
    }

    applyFilters();
  });
});
