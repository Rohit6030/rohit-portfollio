(() => {
  'use strict';

  let dispose = null;

  function initializeMotion() {
    const root = document.documentElement;
    const body = document.body;
    const one = selector => document.querySelector(selector);
    const all = selector => Array.from(document.querySelectorAll(selector));
    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const hero = one('#home');
    const canvas = one('#ambient-canvas');
    const context = canvas && typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
    const reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const finePointer = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;
    const listeners = [];
    const observers = [];
    const cards = all('.portrait-panel, .repo-card');
    const panels = all('.layer-panel');
    const motionItems = new Set();
    const visibleTargets = all('#home, .skills-marquee, .portrait-panel, .stack-explorer, .contact-shell, .featured-project, .about-photo-wrap');
    let heroVisible = false;
    let running = false;
    let destroyed = false;
    let frameId = null;
    let previousFrame = 0;
    let previousPaint = 0;
    let elapsed = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let heroTop = 0;
    let heroHeight = 1;
    let scrollRange = 1;
    let particles = [];

    function listen(target, event, callback, options) {
      target.addEventListener(event, callback, options);
      listeners.push(() => target.removeEventListener(event, callback, options));
    }

    function listenMedia(query, callback) {
      if (!query) return;
      if (typeof query.addEventListener === 'function') listen(query, 'change', callback);
      else if (typeof query.addListener === 'function') {
        query.addListener(callback);
        listeners.push(() => query.removeListener(callback));
      }
    }

    function motionAllowed() {
      if (body.classList.contains('motion-paused')) return false;
      return root.classList.contains('motion-enabled') || !(reducedMotion && reducedMotion.matches);
    }

    function clearCanvas() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
    }

    function stopCanvas() {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      previousFrame = 0;
      previousPaint = 0;
    }

    function drawNetwork() {
      clearCanvas();
      const points = particles.map(particle => ({
        x: particle.x * width + Math.sin(elapsed * 0.17 + particle.phase) * 12,
        y: particle.y * height + Math.cos(elapsed * 0.13 + particle.phase) * 10,
        radius: particle.radius
      }));
      const reach = width < 700 ? 115 : 170;
      const reachSquared = reach * reach;
      for (let index = 0; index < points.length; index += 1) {
        const point = points[index];
        for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
          const other = points[otherIndex];
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared >= reachSquared) continue;
          const opacity = (1 - Math.sqrt(distanceSquared) / reach) * 0.12;
          context.strokeStyle = `rgba(49,73,232,${opacity.toFixed(3)})`;
          context.lineWidth = 0.7;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
        context.fillStyle = 'rgba(49,73,232,0.27)';
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fill();
      }
    }

    function animateNetwork(timestamp) {
      frameId = null;
      if (!running || !heroVisible || !context || destroyed) return;
      if (previousFrame) elapsed += Math.min((timestamp - previousFrame) / 1000, 0.05);
      previousFrame = timestamp;
      if (!previousPaint || timestamp - previousPaint >= 32) {
        drawNetwork();
        previousPaint = timestamp;
      }
      frameId = window.requestAnimationFrame(animateNetwork);
    }

    function startCanvas() {
      if (!running || !heroVisible || !context || !width || !height || frameId !== null || destroyed) return;
      frameId = window.requestAnimationFrame(animateNetwork);
    }

    function resetCard(card) {
      card.classList.remove('is-tilting');
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--glow-x', '50%');
      card.style.setProperty('--glow-y', '50%');
    }

    function updateScroll() {
      if (!running || destroyed) return;
      const scrollY = window.scrollY || 0;
      root.style.setProperty('--scroll-fraction', clamp(scrollY / scrollRange, 0, 1).toFixed(4));
      if (hero && heroVisible) {
        const shift = clamp((scrollY - heroTop) / heroHeight, 0, 1) * 24;
        hero.style.setProperty('--hero-shift', `${shift.toFixed(2)}px`);
      }
    }

    function measure() {
      scrollRange = Math.max(1, root.scrollHeight - window.innerHeight);
      if (hero) {
        const rect = hero.getBoundingClientRect();
        heroTop = rect.top + (window.scrollY || 0);
        heroHeight = Math.max(1, rect.height);
        if (!('IntersectionObserver' in window)) heroVisible = rect.bottom > 0 && rect.top < window.innerHeight;
      }
      if (context) {
        const rect = canvas.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        const count = window.innerWidth < 700 ? 16 : 30;
        if (particles.length !== count) particles = Array.from({ length: count }, (_, index) => ({
          x: (0.11 + index * 0.61803398875) % 1,
          y: (0.08 + index * 0.38196601125 + Math.sin(index * 2.1) * 0.13 + 1) % 1,
          phase: index * 2.39996323,
          radius: 1 + (index % 3) * 0.25
        }));
        if (running && heroVisible) drawNetwork();
        else clearCanvas();
      }
      updateScroll();
      startCanvas();
    }

    function syncMotion() {
      if (destroyed) return;
      running = motionAllowed() && !document.hidden;
      if (!running) {
        stopCanvas();
        clearCanvas();
        cards.forEach(resetCard);
        panels.forEach(panel => panel.classList.remove('panel-enter'));
        if (hero) hero.style.setProperty('--hero-shift', '0px');
        if (!motionAllowed()) motionItems.forEach(element => element.classList.add('in-view'));
      } else {
        updateScroll();
        startCanvas();
      }
    }

    all('.reveal, .hero-meta, .focus-list').forEach(group => {
      Array.from(group.children).filter(element => !element.matches('.reveal, .layer-panel, .contact-orbits, script, style')).forEach((element, index) => {
        element.style.setProperty('--reveal-index', String(Math.min(index, 6)));
        element.classList.add('motion-item');
        motionItems.add(element);
      });
    });

    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      motionItems.forEach(element => revealObserver.observe(element));
      observers.push(revealObserver);
      const visibilityObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.target.dataset.motionVisible = String(entry.isIntersecting);
          if (entry.target === hero) {
            heroVisible = entry.isIntersecting;
            if (heroVisible) {
              updateScroll();
              startCanvas();
            } else stopCanvas();
          }
        });
      }, { threshold: 0 });
      visibleTargets.forEach(element => {
        element.dataset.motionVisible = 'false';
        visibilityObserver.observe(element);
      });
      observers.push(visibilityObserver);
    } else {
      motionItems.forEach(element => element.classList.add('in-view'));
      visibleTargets.forEach(element => { element.dataset.motionVisible = 'true'; });
    }

    cards.forEach(card => {
      card.classList.add('tilt-card');
      resetCard(card);
      listen(card, 'pointermove', event => {
        if (!running || !finePointer || !finePointer.matches || event.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        const strength = card.classList.contains('portrait-panel') ? 2.5 : 3.5;
        card.style.setProperty('--tilt-x', `${((0.5 - y) * strength * 2).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${((x - 0.5) * strength * 2).toFixed(2)}deg`);
        card.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
        card.classList.add('is-tilting');
      }, { passive: true });
      listen(card, 'pointerleave', () => resetCard(card));
      listen(card, 'pointercancel', () => resetCard(card));
    });

    const explorer = one('#stack-explorer');
    if (explorer && 'MutationObserver' in window) {
      const panelObserver = new MutationObserver(records => {
        const changedPanels = new Set(records.map(record => record.target));
        changedPanels.forEach(panel => {
          panel.classList.remove('panel-enter');
          if (!running || panel.hidden || !panel.classList.contains('layer-panel')) return;
          void panel.offsetWidth;
          panel.classList.add('panel-enter');
        });
      });
      panelObserver.observe(explorer, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
      observers.push(panelObserver);
      panels.forEach(panel => listen(panel, 'animationend', event => {
        if (event.target === panel) panel.classList.remove('panel-enter');
      }));
    }

    if ('MutationObserver' in window) {
      const preferenceObserver = new MutationObserver(syncMotion);
      preferenceObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
      preferenceObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
      observers.push(preferenceObserver);
    }

    listen(window, 'scroll', () => {
      if (!('IntersectionObserver' in window) && hero) {
        const rect = hero.getBoundingClientRect();
        heroVisible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!heroVisible) stopCanvas();
        else startCanvas();
      }
      updateScroll();
    }, { passive: true });
    listen(window, 'resize', measure, { passive: true });
    listen(window, 'load', measure, { once: true });
    listen(document, 'visibilitychange', () => {
      body.classList.toggle('motion-hidden', document.hidden);
      syncMotion();
    });
    listenMedia(reducedMotion, syncMotion);
    listenMedia(finePointer, () => cards.forEach(resetCard));
    if ('ResizeObserver' in window && hero) {
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(hero);
      observers.push(resizeObserver);
    }

    if (!motionAllowed()) motionItems.forEach(element => element.classList.add('in-view'));
    body.classList.toggle('motion-hidden', document.hidden);
    body.classList.add('motion-ready');
    syncMotion();
    measure();

    return () => {
      destroyed = true;
      running = false;
      stopCanvas();
      clearCanvas();
      observers.forEach(observer => observer.disconnect());
      listeners.forEach(removeListener => removeListener());
      cards.forEach(resetCard);
      panels.forEach(panel => panel.classList.remove('panel-enter'));
      motionItems.forEach(element => element.classList.add('in-view'));
      body.classList.remove('motion-ready');
    };
  }

  function start() {
    if (!dispose) dispose = initializeMotion();
  }

  window.addEventListener('pagehide', () => {
    if (dispose) dispose();
    dispose = null;
  });
  window.addEventListener('pageshow', start);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
