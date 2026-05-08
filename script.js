/* ============================================================
   JAVASCRIPT UTAMA — PORTFOLIO IMAN HILMAN FIRMANSYAH
   Semua kode dibungkus IIFE (Immediately Invoked Function Expression)
   agar tidak mengotori global scope.
   ============================================================ */
(function () {
  'use strict';

  // =============================================================
  // 1. AMBIL REFERENSI ELEMEN DOM
  //    Kita simpan elemen penting di awal agar mudah dibaca
  // =============================================================
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const navLinks = nav.querySelectorAll('a');
  const sections = document.querySelectorAll('section[id]');

  // Elemen yang akan di-animate saat di-scroll (reveal)
  const revealElements = document.querySelectorAll(
    '.section-about p, .about-stats .stat-card, .contact-card'
  );


  // =============================================================
  // 2. NAVIGASI — MOBILE MENU
  // =============================================================

  /**
   * Buka / tutup navigasi mobile
   */
  function toggleMenu() {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isOpen);
    nav.classList.toggle('open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  /**
   * Tutup navigasi mobile (dipanggil setelah klik link)
   */
  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Event: klik tombol hamburger
  menuToggle.addEventListener('click', toggleMenu);

  // Event: klik link navigasi → tutup menu
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Event: klik di luar menu → tutup menu
  document.addEventListener('click', function (e) {
    if (
      nav.classList.contains('open') &&
      !nav.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });


  // =============================================================
  // 3. ACTIVE LINK (highlight nav link based on scroll position)
  // =============================================================

  /**
   * Tandai link navigasi mana yang "active"
   * berdasarkan posisi scroll halaman
   */
  function setActiveLink() {
    const scrollPos = window.scrollY + 120;
    let current = '';

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', setActiveLink);
  setActiveLink(); // Panggil sekali di awal


  // =============================================================
  // 4. SCROLL REVEAL ANIMATION
  //    Munculkan elemen dengan efek fade-in saat terlihat
  // =============================================================

  /**
   * Tambah class 'reveal' dan 'visible' ke setiap elemen
   * yang sudah masuk ke dalam viewport
   */
  function revealOnScroll() {
    revealElements.forEach(function (el) {
      el.classList.add('reveal');
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight - 60) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('resize', revealOnScroll);
  revealOnScroll(); // Panggil sekali di awal


  // =============================================================
  // 5. CAROUSEL — PROJECT SLIDER
  // =============================================================

  const track = document.getElementById('carousel-track');

  // Hanya jalan kalau elemen carousel-track ada di halaman
  if (track) {
    const slides = track.querySelectorAll('.project-card');
    const prevBtn = document.querySelector('.carousel-btn--prev');
    const nextBtn = document.querySelector('.carousel-btn--next');
    const dotsContainer = document.querySelector('.carousel-dots');
    const carouselEl = track.closest('.carousel');

    let currentIndex = 0;
    let slidesPerView = getSlidesPerView();

    // Konfigurasi
    const AUTOPLAY_DELAY = 4000;
    const GAP_SIZE = 24; // gap antar slide dalam px
    let autoplayTimer = null;

    // -----------------------------------------------------------
    // 5a. Helper functions
    // -----------------------------------------------------------

    /**
     * Tentukan jumlah slide yang terlihat berdasarkan lebar layar
     */
    function getSlidesPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    /**
     * Hitung lebar satu slide (viewportWidth - totalGap) / slidesPerView
     */
    function getSlideWidth() {
      const totalGap = GAP_SIZE * (slidesPerView - 1);
      const viewportWidth = track.parentElement.offsetWidth;
      return (viewportWidth - totalGap) / slidesPerView;
    }

    /**
     * Index maksimal yang bisa digeser
     */
    function getMaxIndex() {
      return Math.max(0, slides.length - slidesPerView);
    }

    /**
     * Geser carousel ke index tertentu
     */
    function goTo(index) {
      currentIndex = index;
      const slideWidth = getSlideWidth();
      const offset = currentIndex * (slideWidth + GAP_SIZE);
      track.style.transform = 'translateX(-' + offset + 'px)';
      updateDots();
    }

    function goToNext() {
      if (currentIndex >= getMaxIndex()) {
        goTo(0);
      } else {
        goTo(currentIndex + 1);
      }
      restartAutoplay();
    }

    function goToPrev() {
      if (currentIndex <= 0) {
        goTo(getMaxIndex());
      } else {
        goTo(currentIndex - 1);
      }
      restartAutoplay();
    }

    // -----------------------------------------------------------
    // 5b. Dot indicators
    // -----------------------------------------------------------

    function createDots() {
      dotsContainer.innerHTML = '';
      const total = getMaxIndex() + 1;

      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.addEventListener('click', function (idx) {
          return function () {
            goTo(idx);
            restartAutoplay();
          };
        }(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    // -----------------------------------------------------------
    // 5c. Autoplay
    // -----------------------------------------------------------

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(goToNext, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
      clearInterval(autoplayTimer);
    }

    function restartAutoplay() {
      startAutoplay();
    }

    // -----------------------------------------------------------
    // 5d. Resize handler (with debounce)
    // -----------------------------------------------------------

    function onResize() {
      slidesPerView = getSlidesPerView();
      createDots();
      goTo(Math.min(currentIndex, getMaxIndex()));
    }

    let resizeTimer = null;

    // -----------------------------------------------------------
    // 5e. Register events
    // -----------------------------------------------------------

    prevBtn.addEventListener('click', goToPrev);
    nextBtn.addEventListener('click', goToNext);

    // Hentikan autoplay saat mouse di atas carousel
    carouselEl.addEventListener('mouseenter', stopAutoplay);
    carouselEl.addEventListener('mouseleave', startAutoplay);

    // Debounce resize biar tidak terlalu sering di-trigger
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 150);
    });

    // -----------------------------------------------------------
    // 5f. Init carousel
    // -----------------------------------------------------------

    createDots();
    goTo(0);
    startAutoplay();
  }

})();
