(() => {
    function qs(selector, scope = document) {
        return scope.querySelector(selector);
    }

    function qsa(selector, scope = document) {
        return Array.from(scope.querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMobileNav() {
        const toggle = qs('[data-mobile-toggle]');
        const panel = qs('[data-nav-panel]');
        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener('click', () => {
            const isOpen = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-label', isOpen ? '关闭导航' : '打开导航');
        });
    }

    function initHeroCarousel() {
        const carousel = qs('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        const slides = qsa('[data-hero-slide]', carousel);
        const dots = qsa('[data-hero-dot]', carousel);
        const prev = qs('[data-hero-prev]', carousel);
        const next = qs('[data-hero-next]', carousel);
        if (slides.length <= 1) {
            return;
        }

        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(() => show(index + 1), 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener('click', () => {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', () => {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', () => {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function initFilters() {
        const scope = qs('[data-filter-scope]');
        const cards = qsa('[data-movie-card]');
        if (!scope || !cards.length) {
            return;
        }

        const keywordInput = qs('[data-filter-keyword]', scope);
        const typeSelect = qs('[data-filter-type]', scope);
        const yearSelect = qs('[data-filter-year]', scope);
        const regionSelect = qs('[data-filter-region]', scope);
        const result = qs('[data-filter-result]', scope);
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (initialQuery && keywordInput) {
            keywordInput.value = initialQuery;
        }

        function update() {
            const keyword = normalize(keywordInput && keywordInput.value);
            const type = normalize(typeSelect && typeSelect.value);
            const year = normalize(yearSelect && yearSelect.value);
            const region = normalize(regionSelect && regionSelect.value);
            let visible = 0;

            cards.forEach((card) => {
                const text = normalize(card.dataset.search);
                const cardType = normalize(card.dataset.type);
                const cardYear = normalize(card.dataset.year);
                const cardRegion = normalize(card.dataset.region);
                const matched = (!keyword || text.includes(keyword))
                    && (!type || cardType === type)
                    && (!year || cardYear === year)
                    && (!region || cardRegion === region);

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (result) {
                result.textContent = `显示 ${visible} 部`;
            }
        }

        [keywordInput, typeSelect, yearSelect, regionSelect].forEach((control) => {
            if (control) {
                control.addEventListener('input', update);
                control.addEventListener('change', update);
            }
        });

        update();
    }

    function markCurrentYear() {
        document.documentElement.dataset.generatedAt = new Date().getFullYear().toString();
    }

    document.addEventListener('DOMContentLoaded', () => {
        initMobileNav();
        initHeroCarousel();
        initFilters();
        markCurrentYear();
    });
})();
