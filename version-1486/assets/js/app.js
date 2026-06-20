(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function activateMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var links = document.querySelector('.nav-links');
        var search = document.querySelector('.header-search');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            links.classList.toggle('open');
            if (search) {
                search.classList.toggle('open');
            }
        });
    }

    function activateHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function activateFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var root = panel.closest('[data-filter-root]') || document;
            var input = panel.querySelector('.movie-search');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('.filter-select'));
            var cards = Array.prototype.slice.call(root.querySelectorAll('.searchable-card'));
            var empty = root.querySelector('.empty-state');
            var params = new URLSearchParams(window.location.search);
            var queryValue = params.get('q');
            if (input && queryValue) {
                input.value = queryValue;
            }

            function apply() {
                var query = normalize(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-category')
                    ].join(' '));
                    var matched = !query || text.indexOf(query) !== -1;
                    selects.forEach(function (select) {
                        var key = select.getAttribute('data-filter-key');
                        var val = normalize(select.value);
                        if (val && normalize(card.getAttribute('data-' + key)) !== val) {
                            matched = false;
                        }
                    });
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    }

    function activatePlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var button = shell.querySelector('[data-play]');
            if (!video || !button) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var initialized = false;

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            function init() {
                if (!stream) {
                    playVideo();
                    return;
                }
                if (!initialized) {
                    initialized = true;
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        video._hls = hls;
                    } else {
                        video.src = stream;
                    }
                }
                shell.classList.add('is-playing');
                playVideo();
            }

            button.addEventListener('click', init);
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
        });
    }

    ready(function () {
        activateMenu();
        activateHero();
        activateFilters();
        activatePlayers();
    });
})();
