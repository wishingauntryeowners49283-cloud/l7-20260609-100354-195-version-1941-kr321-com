(function () {
  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    var next = carousel.querySelector('[data-hero-next]');
    var prev = carousel.querySelector('[data-hero-prev]');

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.parentElement || document;
    var keywordInput = panel.querySelector('[data-filter-keyword]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.filterable-card'));

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type')
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var visible = true;

        if (keyword && text.indexOf(keyword) === -1) {
          visible = false;
        }
        if (year && cardYear !== year) {
          visible = false;
        }
        if (type && cardType !== type) {
          visible = false;
        }

        card.classList.toggle('is-filter-hidden', !visible);
      });
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  var searchResults = document.getElementById('searchResults');
  var searchInput = document.getElementById('searchInput');

  if (searchResults && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (searchInput) {
      searchInput.value = query;
    }

    function buildCard(movie) {
      var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a href="' + escapeHtml(movie.url) + '" class="card-cover">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="category-pill">' + escapeHtml(movie.category) + '</span>',
        '    <span class="year-pill">' + escapeHtml(movie.year) + '</span>',
        '    <span class="play-button">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a href="' + escapeHtml(movie.url) + '" class="card-title">' + escapeHtml(movie.title) + '</a>',
        '    <p>' + escapeHtml(movie.description) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '    <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderSearch() {
      var term = String(searchInput && searchInput.value || query || '').toLowerCase().trim();
      var results = window.SITE_MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.description,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();
        return !term || haystack.indexOf(term) !== -1;
      }).slice(0, 120);

      if (!results.length) {
        searchResults.innerHTML = '<div class="empty-state">未找到相关影视内容</div>';
        return;
      }

      searchResults.innerHTML = results.map(buildCard).join('');
    }

    renderSearch();
  }
})();
