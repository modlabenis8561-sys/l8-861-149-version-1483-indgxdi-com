(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", mobileNav.classList.contains("is-open"));
      });
    }

    var showcases = document.querySelectorAll(".hero-showcase");
    showcases.forEach(function (showcase) {
      var slides = Array.prototype.slice.call(showcase.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(showcase.querySelectorAll(".hero-dot"));
      var index = 0;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          show(index + 1);
        }, 5600);
      }
    });

    var grids = document.querySelectorAll(".searchable-grid");
    grids.forEach(function (grid) {
      var section = grid.closest(".content-section") || document;
      var searchInput = section.querySelector(".filter-search");
      var selects = Array.prototype.slice.call(section.querySelectorAll(".filter-select"));
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var empty = section.querySelector(".empty-state");

      if (searchInput) {
        try {
          var params = new URLSearchParams(window.location.search);
          var query = params.get("q");
          if (query && !searchInput.value) {
            searchInput.value = query;
          }
        } catch (error) {
        }
      }

      function applyFilters() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var values = {};
        selects.forEach(function (select) {
          values[select.getAttribute("data-filter")] = select.value;
        });
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }

          Object.keys(values).forEach(function (key) {
            if (values[key] && card.getAttribute("data-" + key) !== values[key]) {
              matched = false;
            }
          });

          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }

      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });

      applyFilters();
    });
  });
})();
