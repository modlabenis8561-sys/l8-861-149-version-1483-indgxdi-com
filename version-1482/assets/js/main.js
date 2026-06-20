(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function norm(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSiteSearch() {
    var forms = document.querySelectorAll("[data-site-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("data-target") || "search.html";
        if (value) {
          window.location.href = target + "?q=" + encodeURIComponent(value);
        } else {
          window.location.href = target;
        }
      });
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
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        reset();
      });
    });
    hero.addEventListener("mouseenter", function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });
    hero.addEventListener("mouseleave", reset);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-page]");
    if (!panel) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var input = panel.querySelector("[data-filter-search]");
    var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
    var clear = panel.querySelector("[data-filter-clear]");
    var empty = document.querySelector("[data-empty]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }
    function matchesSelect(card, key, value) {
      if (!value) {
        return true;
      }
      return norm(card.getAttribute("data-" + key)) === norm(value);
    }
    function apply() {
      var text = input ? norm(input.value) : "";
      var shown = 0;
      cards.forEach(function (card) {
        var data = norm(card.getAttribute("data-search"));
        var ok = !text || data.indexOf(text) !== -1;
        selects.forEach(function (select) {
          ok = ok && matchesSelect(card, select.getAttribute("data-filter-select"), select.value);
        });
        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown > 0;
      }
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    if (clear) {
      clear.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        selects.forEach(function (select) {
          select.value = "";
        });
        apply();
      });
    }
    apply();
  }

  function setupPlayer() {
    var holder = document.querySelector("[data-player]");
    if (!holder) {
      return;
    }
    var video = holder.querySelector("video");
    var overlay = holder.querySelector("[data-play]");
    if (!video) {
      return;
    }
    var src = video.getAttribute("data-stream");
    var hls = null;
    function load() {
      if (!src || video.getAttribute("data-ready") === "1") {
        return;
      }
      video.setAttribute("data-ready", "1");
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        video.src = src;
      }
    }
    function play() {
      load();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupSiteSearch();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
