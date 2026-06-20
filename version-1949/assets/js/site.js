(() => {
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', () => {
            mobilePanel.classList.toggle('open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const setSlide = (nextIndex) => {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === index);
            });
        };

        const start = () => {
            timer = window.setInterval(() => setSlide(index + 1), 5200);
        };

        const restart = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                setSlide(Number(dot.dataset.heroDot || 0));
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                setSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                setSlide(index + 1);
                restart();
            });
        }

        start();
    }

    const cardContainers = Array.from(document.querySelectorAll('[data-card-container]'));
    const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));
    const yearFilters = Array.from(document.querySelectorAll('[data-year-filter]'));
    const categoryButtons = Array.from(document.querySelectorAll('[data-filter-category]'));
    let query = '';
    let year = '';
    let category = '';

    const applyFilters = () => {
        const normalized = query.trim().toLowerCase();
        const cards = Array.from(document.querySelectorAll('[data-card]'));
        cards.forEach((card) => {
            const haystack = card.dataset.title || '';
            const cardCategory = card.dataset.category || '';
            const cardYear = card.dataset.year || '';
            const matchedQuery = !normalized || haystack.includes(normalized);
            const matchedCategory = !category || cardCategory.split(' ').includes(category);
            const matchedYear = !year || cardYear === year;
            card.classList.toggle('is-hidden', !(matchedQuery && matchedCategory && matchedYear));
        });
    };

    searchInputs.forEach((input) => {
        input.addEventListener('input', () => {
            query = input.value;
            searchInputs.forEach((other) => {
                if (other !== input && other.value !== input.value) {
                    other.value = input.value;
                }
            });
            applyFilters();
        });
    });

    yearFilters.forEach((select) => {
        select.addEventListener('change', () => {
            year = select.value;
            yearFilters.forEach((other) => {
                if (other !== select) {
                    other.value = select.value;
                }
            });
            applyFilters();
        });
    });

    categoryButtons.forEach((button) => {
        button.addEventListener('click', () => {
            category = button.dataset.filterCategory || '';
            categoryButtons.forEach((item) => {
                item.classList.toggle('active', item.dataset.filterCategory === category);
            });
            applyFilters();
        });
    });

    document.querySelectorAll('[data-search-form]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            applyFilters();
            const catalog = document.querySelector('.catalog-section');
            if (catalog) {
                catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const player = document.querySelector('[data-player]');

    if (player) {
        const video = player.querySelector('[data-player-video]');
        const cover = player.querySelector('[data-player-cover]');
        let hls = null;
        let initialized = false;

        const initVideo = () => {
            if (!video || initialized) {
                return;
            }
            const source = video.dataset.src;
            if (!source) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
            video.controls = true;
            initialized = true;
        };

        const play = () => {
            initVideo();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video) {
                const result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(() => {});
                }
            }
        };

        if (cover) {
            cover.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', () => {
                if (!initialized) {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
