(function () {
    var body = document.body;
    var menuButton = document.querySelector('[data-menu-button]');

    if (menuButton) {
        menuButton.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function nextSlide() {
            showSlide(current + 1);
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(nextSlide, 5000);
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                nextSlide();
                restartTimer();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', function () {
                showSlide(current - 1);
                restartTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartTimer();
            });
        });

        restartTimer();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function bindSearch(scope) {
        var input = scope.querySelector('[data-search-input]');
        var filters = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
        var root = scope;

        if (!scope.querySelector('[data-card]') && (input || filters.length)) {
            root = scope.closest('main') || document;
        }

        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
        var empty = root.querySelector('[data-empty-state]');
        var activeFilter = '全部';

        if (!cards.length) {
            return;
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-text'));
                var filterText = normalize([
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-category')
                ].join(' '));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesFilter = activeFilter === '全部' || filterText.indexOf(normalize(activeFilter)) !== -1 || text.indexOf(normalize(activeFilter)) !== -1;
                var show = matchesQuery && matchesFilter;

                card.classList.toggle('is-hidden', !show);

                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        filters.forEach(function (button) {
            button.addEventListener('click', function () {
                filters.forEach(function (item) {
                    item.classList.remove('is-active');
                });

                button.classList.add('is-active');
                activeFilter = button.getAttribute('data-filter') || '全部';
                applyFilter();
            });
        });

        applyFilter();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]')).forEach(bindSearch);

    function bindPlayer(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-player-button]');
        var hls = null;
        var started = false;

        if (!video) {
            return;
        }

        function startPlayer() {
            var streamUrl = video.getAttribute('data-m3u8');

            if (!streamUrl) {
                return;
            }

            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }

                started = true;
            }

            if (button) {
                button.classList.add('is-hidden');
            }

            var playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', startPlayer);
        }

        video.addEventListener('click', function () {
            if (!started) {
                startPlayer();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player-box]')).forEach(bindPlayer);
})();
