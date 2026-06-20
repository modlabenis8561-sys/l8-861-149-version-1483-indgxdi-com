(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNav() {
    var toggle = qs('.nav-toggle');
    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', function () {
      var opened = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });

    qsa('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stop();
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        stop();
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        stop();
        show(index + 1);
        play();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function initFilters() {
    var page = qs('[data-filter-page]');
    if (!page) {
      return;
    }

    var search = qs('#siteSearch', page);
    var year = qs('#yearFilter', page);
    var region = qs('#regionFilter', page);
    var category = qs('#categoryFilter', page);
    var cards = qsa('.movie-card', page);
    var params = new URLSearchParams(window.location.search);

    if (search && params.get('q')) {
      search.value = params.get('q');
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
    }

    function applyFilters() {
      var q = normalize(search && search.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var c = normalize(category && category.value);

      cards.forEach(function (card) {
        var matches = true;
        var text = cardText(card);

        if (q && text.indexOf(q) === -1) {
          matches = false;
        }

        if (y && normalize(card.getAttribute('data-year')).indexOf(y) === -1) {
          matches = false;
        }

        if (r && normalize(card.getAttribute('data-region')).indexOf(r) === -1) {
          matches = false;
        }

        if (c && normalize(card.getAttribute('data-category')) !== c) {
          matches = false;
        }

        card.classList.toggle('is-hidden', !matches);
      });
    }

    [search, year, region, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function initPlayers() {
    qsa('.player-shell').forEach(function (shell) {
      var video = qs('.movie-player', shell);
      var overlay = qs('.play-overlay', shell);

      if (!video || !overlay) {
        return;
      }

      var sourceUrl = video.getAttribute('data-video-url');
      var hls = null;
      var started = false;

      function attachSource() {
        if (started) {
          return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
      }

      function playVideo() {
        attachSource();
        overlay.classList.add('is-hidden');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      overlay.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
      });
      shell.addEventListener('click', function (event) {
        if (event.target === shell) {
          playVideo();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
