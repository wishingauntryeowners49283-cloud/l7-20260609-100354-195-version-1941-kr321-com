(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    qsa('[data-hero-slider]').forEach(function (slider) {
      var slides = qsa('[data-slide]', slider);
      var dots = qsa('[data-slide-dot]', slider);
      var prev = qs('[data-slide-prev]', slider);
      var next = qs('[data-slide-next]', slider);
      var current = 0;
      var timer = null;
      if (!slides.length) {
        return;
      }
      function render(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      }
      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          render(current + 1);
        }, 5200);
      }
      if (prev) {
        prev.addEventListener('click', function () {
          render(current - 1);
          play();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          render(current + 1);
          play();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          render(index);
          play();
        });
      });
      render(0);
      play();
    });
  }

  function initForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (input && input.value.trim() === '') {
          event.preventDefault();
          input.focus();
        }
      });
    });
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var text = qs('[data-filter-text]', scope);
      var year = qs('[data-filter-year]', scope);
      var type = qs('[data-filter-type]', scope);
      var cards = qsa('[data-card]', scope);
      function render() {
        var key = text ? text.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.tags, card.textContent].join(' ').toLowerCase();
          var matchedText = key === '' || haystack.indexOf(key) !== -1;
          var matchedYear = selectedYear === '' || card.dataset.year === selectedYear;
          var matchedType = selectedType === '' || card.dataset.type === selectedType;
          card.classList.toggle('is-hidden', !(matchedText && matchedYear && matchedType));
        });
      }
      [text, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', render);
          control.addEventListener('change', render);
        }
      });
      render();
    });
  }

  function attachStream(video, url) {
    if (!video || !url) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = url;
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video', shell);
      var cover = qs('.player-cover', shell);
      var stream = shell.dataset.stream;
      var loaded = false;
      function start() {
        if (!loaded) {
          attachStream(video, stream);
          loaded = true;
        }
        shell.classList.add('is-playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!loaded) {
            start();
          }
        });
      }
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '</a>',
      '<div class="card-content">',
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    var results = qs('#search-results');
    var input = qs('#search-input');
    var title = qs('#search-title');
    if (!results || !window.__MOVIES__) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    if (input) {
      input.value = q;
    }
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    var movies = window.__MOVIES__;
    var list = movies.filter(function (movie) {
      if (!words.length) {
        return true;
      }
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    if (title) {
      title.textContent = q ? '“' + q + '”相关影片' : '推荐影片';
    }
    results.innerHTML = list.map(movieCard).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initForms();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
