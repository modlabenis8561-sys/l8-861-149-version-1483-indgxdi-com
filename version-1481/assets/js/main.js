(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-header-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
      }
    });
  });

  const heroSlider = document.querySelector('[data-hero-slider]');
  if (heroSlider) {
    const slides = Array.from(heroSlider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(heroSlider.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 4800);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const searchInput = scope.querySelector('[data-filter-search]');
    const typeSelect = scope.querySelector('[data-filter-type]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const cards = Array.from(scope.querySelectorAll('.movie-card'));
    const emptyState = scope.querySelector('[data-empty-state]');
    const query = new URLSearchParams(window.location.search).get('q') || '';

    if (searchInput && query) {
      searchInput.value = query;
    }

    const normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    const applyFilters = function () {
      const keyword = normalize(searchInput ? searchInput.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.type,
          card.dataset.year,
          card.dataset.region,
          card.dataset.keywords,
          card.textContent
        ].join(' '));
        const cardType = normalize(card.dataset.type);
        const cardYear = normalize(card.dataset.year);
        const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchedType = !type || cardType === type;
        const matchedYear = !year || cardYear === year;
        const matched = matchedKeyword && matchedType && matchedYear;

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    };

    [searchInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });
})();
