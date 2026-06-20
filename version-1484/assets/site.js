(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        showSlide(0);
        startHero();
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startHero();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startHero();
            });
        });
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
    grids.forEach(function (grid) {
        var scope = grid.closest('[data-filter-scope]') || document;
        var search = scope.querySelector('[data-local-search]');
        var type = scope.querySelector('[data-filter-type]');
        var year = scope.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-search]'));

        function applyFilter() {
            var keyword = normalize(search ? search.value : '');
            var selectedType = normalize(type ? type.value : '');
            var selectedYear = normalize(year ? year.value : '');
            cards.forEach(function (card) {
                var hay = normalize(card.getAttribute('data-search'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var ok = true;
                if (keyword && hay.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (selectedType && cardType !== selectedType) {
                    ok = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
            });
        }

        [search, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    var searchRoot = document.getElementById('searchResults');
    var searchInput = document.getElementById('siteSearchInput');
    var searchForm = document.getElementById('siteSearchForm');

    function movieCard(movie) {
        return '' +
            '<article class="movie-card">' +
            '<a href="' + movie.url + '" class="movie-card-link" aria-label="' + escapeHtml(movie.title) + '">' +
            '<figure class="movie-cover">' +
            '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="movie-type">' + escapeHtml(movie.type) + '</span>' +
            '</figure>' +
            '<div class="movie-card-body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="movie-meta-row"><span>★ ' + movie.score + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
            '<div class="movie-tags"><span>' + escapeHtml(movie.genre) + '</span></div>' +
            '</div>' +
            '</a>' +
            '</article>';
    }

    function escapeHtml(value) {
        return (value || '').toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function renderSearch() {
        if (!searchRoot || typeof SITE_MOVIES === 'undefined') {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var keyword = normalize(searchInput ? searchInput.value : params.get('q'));
        if (searchInput && !searchInput.value && params.get('q')) {
            searchInput.value = params.get('q');
        }
        var results = SITE_MOVIES.filter(function (movie) {
            var hay = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' '));
            return !keyword || hay.indexOf(keyword) !== -1;
        });
        if (!results.length) {
            searchRoot.innerHTML = '<div class="empty-state">没有找到匹配的影视内容，请更换关键词重新搜索。</div>';
            return;
        }
        searchRoot.innerHTML = results.map(movieCard).join('');
    }

    if (searchRoot) {
        renderSearch();
    }

    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            renderSearch();
        });
    }
})();
