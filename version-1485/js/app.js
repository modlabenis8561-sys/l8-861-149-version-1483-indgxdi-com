(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function initSearch() {
        var form = document.querySelector("[data-search-form]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
        if (!form || cards.length === 0) {
            return;
        }
        var input = form.querySelector("[data-search-input]");
        var region = form.querySelector("[data-search-region]");
        var type = form.querySelector("[data-search-type]");
        var year = form.querySelector("[data-search-year]");
        var empty = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var searchText = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-year")
                ].join(" "));
                var matched = true;
                if (keyword && searchText.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (regionValue && normalize(card.getAttribute("data-region")).indexOf(regionValue) === -1) {
                    matched = false;
                }
                if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
                    matched = false;
                }
                if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
                    matched = false;
                }
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible === 0 ? "block" : "none";
            }
        }

        [input, region, type, year].forEach(function (field) {
            if (field) {
                field.addEventListener("input", apply);
                field.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        initNavigation();
        initHero();
        initSearch();
    });

    window.initMoviePlayer = function (videoUrl) {
        var video = document.querySelector("[data-player-video]");
        var veil = document.querySelector("[data-player-veil]");
        var button = document.querySelector("[data-player-button]");
        var bound = false;
        var hlsInstance = null;

        if (!video || !videoUrl) {
            return;
        }

        function bindSource() {
            if (bound) {
                return;
            }
            bound = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
        }

        function playVideo() {
            bindSource();
            if (veil) {
                veil.classList.add("is-hidden");
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }
        if (veil) {
            veil.addEventListener("click", playVideo);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
