(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const whatsappMessage = 'Olá! Gostaria de agendar uma avaliação com a Dra. Carmen Pitol para conhecer as lentes Lumini.';
  document.querySelectorAll('[data-whatsapp]').forEach(link => {
    link.href = 'https://wa.me/5547991412072?text=' + encodeURIComponent(whatsappMessage);
  });
  document.querySelector('#current-year').textContent = String(new Date().getFullYear());

  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.navigation');
  const menuToggle = document.querySelector('.menu-toggle');
  const closeMenu = () => {
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
  };
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open) menu.querySelector('a').focus();
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
      menuToggle.focus();
    }
    if (event.key === 'Tab' && menu.classList.contains('open')) {
      const focusable = Array.from(header.querySelectorAll('a, button')).filter(element => element.getClientRects().length);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 15);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if ('IntersectionObserver' in window) {
    document.body.classList.add('js-ready');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  }

  document.querySelectorAll('[data-comparison]').forEach(comparison => {
    const input = comparison.querySelector('input');
    const update = () => {
      comparison.style.setProperty('--position', input.value + '%');
      input.setAttribute('aria-valuetext', input.value + '% da imagem antes do tratamento');
    };
    input.addEventListener('input', update);
    update();
  });

  const carousel = document.querySelector('.review-carousel');
  const track = carousel.querySelector('.review-track');
  const cards = Array.from(track.children);
  const count = cards.length;
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
  const pauseButton = document.querySelector('.review-pause');
  const status = document.querySelector('.review-current');
  const progress = document.querySelector('.carousel-progress i');
  let index = 0;
  let paused = reducedMotion.matches;
  let hoverPaused = false;
  let focusPaused = false;
  let inViewport = !('IntersectionObserver' in window);
  let animating = false;
  let timer;
  let transitionTimer;
  const cardStep = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
  const position = (animate = true) => {
    track.style.transition = animate && !reducedMotion.matches ? 'transform .7s cubic-bezier(.22,1,.36,1)' : 'none';
    track.style.transform = 'translateX(-' + index * cardStep() + 'px)';
    status.textContent = String(index % count + 1).padStart(2, '0');
    progress.style.width = ((index % count + 1) / count * 100) + '%';
  };
  const resetTimer = () => {
    clearInterval(timer);
    if (!paused && !hoverPaused && !focusPaused && inViewport && !document.hidden) timer = setInterval(() => move(1), 6000);
  };
  const move = direction => {
    if (animating) return;
    animating = true;
    if (direction < 0 && index === 0) {
      index = count;
      position(false);
      void track.offsetWidth;
    }
    index += direction;
    position();
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => {
      if (index >= count) { index = 0; position(false); }
      animating = false;
    }, reducedMotion.matches ? 0 : 720);
  };
  const updatePauseButton = () => {
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Reproduzir carrossel' : 'Pausar carrossel');
    pauseButton.querySelector('span').textContent = paused ? '▷' : 'Ⅱ';
  };
  document.querySelector('.review-next').addEventListener('click', () => { move(1); resetTimer(); });
  document.querySelector('.review-prev').addEventListener('click', () => { move(-1); resetTimer(); });
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    if (!paused) focusPaused = false;
    updatePauseButton();
    resetTimer();
  });
  carousel.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hoverPaused = true; resetTimer(); } });
  carousel.addEventListener('pointerleave', () => { hoverPaused = false; resetTimer(); });
  document.querySelector('.reviews').addEventListener('focusin', () => { focusPaused = true; resetTimer(); });
  document.querySelector('.reviews').addEventListener('focusout', event => {
    if (!document.querySelector('.reviews').contains(event.relatedTarget)) { focusPaused = false; resetTimer(); }
  });
  let pointerStart;
  carousel.addEventListener('pointerdown', event => { pointerStart = { x: event.clientX, y: event.clientY }; });
  carousel.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) { move(deltaX < 0 ? 1 : -1); resetTimer(); }
    pointerStart = null;
  });
  carousel.addEventListener('pointercancel', () => { pointerStart = null; });
  document.addEventListener('visibilitychange', resetTimer);
  reducedMotion.addEventListener('change', event => { paused = event.matches; updatePauseButton(); resetTimer(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => position(false)).observe(carousel);
  else window.addEventListener('resize', () => position(false));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inViewport = entries[0].isIntersecting;
      resetTimer();
    }, { threshold: 0.15 }).observe(carousel);
  }
  position(false);
  updatePauseButton();
  resetTimer();

  document.querySelectorAll('.faq details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (detail.open) document.querySelectorAll('.faq details').forEach(other => { if (other !== detail) other.open = false; });
    });
  });
})();
