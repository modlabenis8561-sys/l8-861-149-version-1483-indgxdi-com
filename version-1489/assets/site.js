document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initHeroCarousel();
  initFilters();
  initPlayer();
});

function initMobileMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', function () {
    var isHidden = menu.hasAttribute('hidden');
    if (isHidden) {
      menu.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
    } else {
      menu.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initHeroCarousel() {
  var root = document.querySelector('[data-hero-carousel]');

  if (!root) {
    return;
  }

  var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
  var prev = root.querySelector('[data-hero-prev]');
  var next = root.querySelector('[data-hero-next]');
  var index = 0;
  var timer = null;

  function show(target) {
    index = (target + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === index);
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
    }
  }

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

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      show(dotIndex);
      start();
    });
  });

  show(0);
  start();
}

function initFilters() {
  var panel = document.querySelector('[data-filter-panel]');

  if (!panel) {
    return;
  }

  var input = panel.querySelector('[data-search-input]');
  var genre = panel.querySelector('[data-genre-filter]');
  var type = panel.querySelector('[data-type-filter]');
  var year = panel.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var empty = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function apply() {
    var keyword = normalize(input && input.value);
    var selectedGenre = normalize(genre && genre.value);
    var selectedType = normalize(type && type.value);
    var selectedYear = normalize(year && year.value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var cardGenre = normalize(card.getAttribute('data-genre'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
        matched = false;
      }

      if (selectedType && cardType !== selectedType) {
        matched = false;
      }

      if (selectedYear && cardYear !== selectedYear) {
        matched = false;
      }

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  [input, genre, type, year].forEach(function (control) {
    if (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    }
  });

  apply();
}

function initPlayer() {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var overlay = player.querySelector('[data-player-overlay]');
  var url = player.getAttribute('data-hls');
  var loaded = false;
  var hls = null;

  if (!video || !url) {
    return;
  }

  function attach() {
    if (loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    loaded = true;
  }

  function play() {
    attach();
    video.controls = true;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('ended', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
      hls = null;
      loaded = false;
    }
  });
}
