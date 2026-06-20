(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                show(index);
                start();
            });
        });

        start();
    }

    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupFilters() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        areas.forEach(function (area) {
            var section = area.closest("section") || document;
            var input = area.querySelector("[data-search-input]");
            var chips = Array.prototype.slice.call(area.querySelectorAll("[data-filter]"));
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
            var empty = section.querySelector("[data-empty-state]");
            var activeType = "all";

            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");
            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function apply() {
                var query = normalizeText(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalizeText(card.getAttribute("data-search"));
                    var type = card.getAttribute("data-type") || "movie";
                    var typeMatched = activeType === "all" || type === activeType;
                    var queryMatched = !query || text.indexOf(query) !== -1;
                    var matched = typeMatched && queryMatched;
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeType = chip.getAttribute("data-filter") || "all";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function setupImages() {
        Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            });
        });
    }

    window.initMoviePlayer = function (videoId, streamUrl, overlaySelector) {
        var video = document.getElementById(videoId);
        var overlay = document.querySelector(overlaySelector);
        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = streamUrl;
            }
            video.setAttribute("data-ready", "1");
        }

        function playVideo() {
            attachStream();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (video.getAttribute("data-ready") !== "1" || video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupImages();
    });
})();
