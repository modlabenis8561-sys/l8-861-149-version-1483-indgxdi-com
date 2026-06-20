(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function setSlide(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        }

        if (slides.length > 1) {
            if (prev) {
                prev.addEventListener("click", function () {
                    setSlide(index - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    setSlide(index + 1);
                    restart();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    setSlide(Number(dot.getAttribute("data-hero-dot")));
                    restart();
                });
            });
            restart();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function filterCards() {
        const list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        const cards = Array.from(list.querySelectorAll(".movie-card, .rank-row"));
        const input = document.querySelector("[data-search-input]") || document.querySelector("[data-local-search]");
        const category = document.querySelector("[data-category-filter]");
        const year = document.querySelector("[data-year-filter]");
        const q = normalize(input ? input.value : "");
        const categoryValue = normalize(category ? category.value : "");
        const yearValue = normalize(year ? year.value : "");

        cards.forEach(function (card) {
            const haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-category"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-tags")
            ].join(" "));
            const sameCategory = !categoryValue || normalize(card.getAttribute("data-category")) === categoryValue;
            const sameYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
            const sameText = !q || haystack.indexOf(q) >= 0;
            card.classList.toggle("is-filtered-out", !(sameCategory && sameYear && sameText));
        });
    }

    const searchInput = document.querySelector("[data-search-input]");
    const localSearch = document.querySelector("[data-local-search]");
    const categoryFilter = document.querySelector("[data-category-filter]");
    const yearFilter = document.querySelector("[data-year-filter]");
    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get("q");

    if (searchInput && queryValue) {
        searchInput.value = queryValue;
    }

    [searchInput, localSearch, categoryFilter, yearFilter].forEach(function (element) {
        if (element) {
            element.addEventListener("input", filterCards);
            element.addEventListener("change", filterCards);
        }
    });

    filterCards();
}());
