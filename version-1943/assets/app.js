(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-main-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initSearchForms() {
        selectAll('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = './search.html';
                }
            });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function next() {
            show(current + 1);
        }

        function start() {
            stop();
            timer = window.setInterval(next, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        var prevButton = hero.querySelector('[data-hero-prev]');
        var nextButton = hero.querySelector('[data-hero-next]');
        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function applyFilter(root) {
        var input = root.querySelector('[data-filter-input]');
        var select = root.querySelector('[data-sort-select]');
        var list = root.querySelector('[data-card-list]');
        var empty = root.querySelector('[data-empty-state]');
        if (!list) {
            return;
        }
        var cards = selectAll('.movie-card', list);
        var keyword = normalize(input && input.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-meta'),
                card.getAttribute('data-year')
            ].join(' '));
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (select && select.value) {
            var sorted = cards.slice().sort(function (a, b) {
                if (select.value === 'popular') {
                    return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                }
                if (select.value === 'year') {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                }
                return String(b.getAttribute('data-date')).localeCompare(String(a.getAttribute('data-date')));
            });
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
        }

        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    function initFilters() {
        selectAll('[data-filter-root]').forEach(function (root) {
            var input = root.querySelector('[data-filter-input]');
            var select = root.querySelector('[data-sort-select]');
            if (input) {
                input.addEventListener('input', function () {
                    applyFilter(root);
                });
            }
            if (select) {
                select.addEventListener('change', function () {
                    applyFilter(root);
                });
            }
            applyFilter(root);
        });
    }

    function initSearchPage() {
        var root = document.querySelector('[data-search-root]');
        if (!root) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var input = root.querySelector('[data-filter-input]');
        if (input) {
            input.value = query;
        }
        var form = root.querySelector('[data-search-main-form]');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                applyFilter(root);
                var value = input ? input.value.trim() : '';
                var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
                history.replaceState(null, '', nextUrl);
            });
        }
        applyFilter(root);
    }

    function showPlayerMessage(shell, text) {
        var message = shell.querySelector('[data-player-message]');
        if (!message) {
            return;
        }
        message.textContent = text;
        message.classList.add('show');
    }

    window.initMoviePlayer = function (config) {
        var video = document.querySelector(config.videoSelector);
        var button = document.querySelector(config.buttonSelector);
        var shell = video ? video.closest('.player-shell') : null;
        var streamUrl = config.streamUrl;
        var player = null;
        var initialized = false;
        var pendingPlay = false;

        if (!video || !button || !shell || !streamUrl) {
            return;
        }

        function markReady() {
            shell.classList.add('is-ready');
        }

        function playWhenReady() {
            pendingPlay = false;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    button.classList.remove('fade-out');
                });
            }
        }

        function attach() {
            if (initialized) {
                return;
            }
            initialized = true;
            if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                player.loadSource(streamUrl);
                player.attachMedia(video);
                player.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    markReady();
                    if (pendingPlay) {
                        playWhenReady();
                    }
                });
                player.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal && player) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            player.startLoad();
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            player.recoverMediaError();
                            return;
                        }
                        showPlayerMessage(shell, '当前视频暂时无法播放，请稍后重试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.addEventListener('loadedmetadata', function () {
                    markReady();
                    if (pendingPlay) {
                        playWhenReady();
                    }
                }, { once: true });
            } else {
                showPlayerMessage(shell, '当前浏览器无法加载该视频');
            }
        }

        function requestPlay() {
            pendingPlay = true;
            button.classList.add('fade-out');
            attach();
            if (video.readyState >= 2) {
                playWhenReady();
            }
        }

        button.addEventListener('click', requestPlay);
        video.addEventListener('click', function () {
            if (!initialized) {
                requestPlay();
                return;
            }
            if (video.paused) {
                playWhenReady();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
            button.classList.remove('fade-out');
        });
        window.addEventListener('pagehide', function () {
            if (player) {
                player.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initSearchForms();
        initHero();
        initFilters();
        initSearchPage();
    });
})();
