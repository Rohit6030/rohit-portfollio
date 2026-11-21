(() => {
  'use strict';

  function initializePortfolio() {
    const one = (selector, parent = document) => parent.querySelector(selector);
    const all = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
    const clean = value => typeof value === 'string' ? value.trim() : '';
    const profile = window.PORTFOLIO || {};

    function safeUrl(value) {
      try {
        const url = new URL(clean(value));
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
      } catch (_) { return ''; }
    }

    all('[data-profile]').forEach(element => {
      const value = clean(profile[element.dataset.profile]);
      if (value) element.textContent = value;
    });
    all('[data-year]').forEach(element => { element.textContent = String(new Date().getFullYear()); });
    if (clean(profile.name)) document.title = `${clean(profile.name)} — ${clean(profile.role) || 'Portfolio'}`;
    all('a[data-social]').forEach(link => {
      const url = safeUrl(profile[link.dataset.social]);
      if (!url) return;
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });

    const menuToggle = one('#menu-toggle');
    const navigation = one('#site-nav');
    function setMenu(open) {
      if (menuToggle) menuToggle.setAttribute('aria-expanded', String(open));
      if (navigation) navigation.classList.toggle('is-open', open);
    }
    if (menuToggle) menuToggle.addEventListener('click', () => {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });
    if (navigation) all('a[href^="#"]', navigation).forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') setMenu(false);
    });

    const explorer = one('#stack-explorer');
    if (explorer) {
      const layerButtons = all('button[data-layer]', explorer);
      const tabs = all('.stack-tabs button[data-layer]', explorer);
      const panels = all('[data-layer-panel]', explorer);
      const layers = tabs.map(tab => tab.dataset.layer);
      function selectLayer(layer) {
        if (!layers.includes(layer)) return;
        explorer.dataset.active = layer;
        layerButtons.forEach(button => {
          const selected = button.dataset.layer === layer;
          button.classList.toggle('is-active', selected);
          if (!tabs.includes(button)) button.setAttribute('aria-pressed', String(selected));
          if (tabs.includes(button)) {
            button.setAttribute('aria-selected', String(selected));
            button.tabIndex = selected ? 0 : -1;
          }
        });
        panels.forEach(panel => { panel.hidden = panel.dataset.layerPanel !== layer; });
      }
      layerButtons.forEach(button => button.addEventListener('click', () => selectLayer(button.dataset.layer)));
      tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectLayer(tabs[next].dataset.layer);
        tabs[next].focus();
      }));
      const initial = layers.includes(explorer.dataset.active) ? explorer.dataset.active : layers[0];
      if (initial) selectLayer(initial);
    }

    const projectDialog = one('#project-dialog');
    let projectTrigger = null;
    function updateProjectLink(selector, value) {
      const link = one(selector);
      if (!link) return;
      const url = safeUrl(value);
      link.hidden = !url;
      if (url) {
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      } else link.removeAttribute('href');
    }
    if (projectDialog) {
      all('[data-project]').forEach(link => link.addEventListener('click', event => {
        const project = Array.isArray(profile.projects) ? profile.projects[Number(link.dataset.project)] : null;
        if (!project) return;
        event.preventDefault();
        [
          ['#project-title', project.title],
          ['#project-category', project.category],
          ['#project-description', project.description || project.summary],
          ['#project-footnote', project.footnote]
        ].forEach(([selector, value]) => {
          const element = one(selector, projectDialog);
          if (element) element.textContent = clean(value);
        });
        const tags = one('#project-tags', projectDialog);
        if (tags) {
          tags.replaceChildren();
          (Array.isArray(project.tags) ? project.tags : []).forEach(value => {
            const tag = document.createElement('span');
            tag.textContent = clean(value);
            tags.appendChild(tag);
          });
        }
        updateProjectLink('#project-live', project.live);
        updateProjectLink('#project-source', project.source);
        projectTrigger = link;
        if (typeof projectDialog.showModal === 'function') {
          if (!projectDialog.open) projectDialog.showModal();
        } else {
          projectDialog.setAttribute('open', '');
          projectDialog.setAttribute('aria-modal', 'true');
          const closeButton = one('[data-close-dialog]', projectDialog);
          if (closeButton) closeButton.focus();
        }
      }));
      function closeProject() {
        if (typeof projectDialog.close === 'function') projectDialog.close();
        else {
          projectDialog.removeAttribute('open');
          if (projectTrigger) projectTrigger.focus();
        }
      }
      all('[data-close-dialog]', projectDialog).forEach(button => button.addEventListener('click', closeProject));
      projectDialog.addEventListener('click', event => {
        if (event.target !== projectDialog) return;
        const rect = projectDialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject();
      });
    }

    const revealElements = all('.reveal');
    if ('IntersectionObserver' in window) {
      try {
        const revealObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          });
        }, { threshold: 0.08 });
        revealElements.forEach(element => revealObserver.observe(element));
        document.body.classList.add('js-ready');
      } catch (_) { revealElements.forEach(element => element.classList.add('is-visible')); }
    } else revealElements.forEach(element => element.classList.add('is-visible'));

    const navLinks = navigation ? all('a[href^="#"]', navigation).filter(link => link.hash.length > 1) : [];
    const navSections = navLinks.map(link => {
      try { return document.getElementById(decodeURIComponent(link.hash.slice(1))); }
      catch (_) { return null; }
    }).filter(Boolean);
    function markCurrent(id) {
      navLinks.forEach(link => {
        let matching = false;
        try { matching = decodeURIComponent(link.hash.slice(1)) === id; } catch (_) { /* Ignore malformed hashes. */ }
        if (matching) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    markCurrent('');
    if ('IntersectionObserver' in window && navSections.length) {
      const visibleSections = new Set();
      const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) visibleSections.add(entry.target);
          else visibleSections.delete(entry.target);
        });
        const active = Array.from(visibleSections).sort((a, b) => Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top))[0];
        markCurrent(active ? active.id : '');
      }, { rootMargin: '-15% 0px -50% 0px', threshold: 0 });
      navSections.forEach(section => sectionObserver.observe(section));
    }

    const motionToggle = one('#motion-toggle');
    const portrait = one('.portrait-panel');
    const reducedMotion = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const finePointer = typeof window.matchMedia === 'function' ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;
    let motionPreference = null;
    try {
      const saved = localStorage.getItem('portfolio-motion');
      if (saved === 'paused' || saved === 'running') motionPreference = saved;
    } catch (_) { /* Storage is optional for local previews. */ }
    let motionPaused = motionPreference ? motionPreference === 'paused' : Boolean(reducedMotion && reducedMotion.matches);
    const focusWord = one('#focus-word');
    const focusWords = ['interfaces', 'services', 'data'];
    let focusIndex = focusWord ? Math.max(0, focusWords.indexOf(focusWord.textContent.trim())) : 0;
    let focusTimer = null;
    function resetPointer() {
      if (!portrait) return;
      portrait.style.setProperty('--pointer-x', '0px');
      portrait.style.setProperty('--pointer-y', '0px');
    }
    function updateFocusTimer() {
      if (focusTimer !== null) {
        window.clearInterval(focusTimer);
        focusTimer = null;
      }
      if (!focusWord || motionPaused || document.hidden) return;
      focusTimer = window.setInterval(() => {
        focusIndex = (focusIndex + 1) % focusWords.length;
        focusWord.textContent = focusWords[focusIndex];
      }, 3000);
    }
    function applyMotion() {
      document.body.classList.toggle('motion-paused', motionPaused);
      document.documentElement.classList.toggle('motion-enabled', !motionPaused);
      if (motionToggle) {
        const label = one('[data-motion-label]', motionToggle);
        if (label) label.textContent = motionPaused ? 'Resume motion' : 'Pause motion';
        motionToggle.setAttribute('aria-pressed', String(motionPaused));
        motionToggle.setAttribute('aria-label', motionPaused ? 'Enable animations' : 'Pause animations');
      }
      if (motionPaused) resetPointer();
      updateFocusTimer();
    }
    if (motionToggle) motionToggle.addEventListener('click', () => {
      motionPaused = !motionPaused;
      motionPreference = motionPaused ? 'paused' : 'running';
      try { localStorage.setItem('portfolio-motion', motionPreference); } catch (_) { /* The current visit still honors the choice. */ }
      applyMotion();
    });
    if (reducedMotion) {
      const onMotionChange = event => {
        if (motionPreference !== null) return;
        motionPaused = event.matches;
        applyMotion();
      };
      if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', onMotionChange);
      else if (typeof reducedMotion.addListener === 'function') reducedMotion.addListener(onMotionChange);
    }
    if (portrait) {
      portrait.addEventListener('pointermove', event => {
        if (motionPaused || !finePointer || !finePointer.matches || event.pointerType === 'touch') return;
        const rect = portrait.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
        portrait.style.setProperty('--pointer-x', `${(x * 6).toFixed(2)}px`);
        portrait.style.setProperty('--pointer-y', `${(y * 6).toFixed(2)}px`);
      });
      portrait.addEventListener('pointerleave', resetPointer);
    }
    if (focusWord) focusWord.setAttribute('aria-hidden', 'true');
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) resetPointer();
      updateFocusTimer();
    });
    window.addEventListener('pagehide', () => {
      if (focusTimer !== null) window.clearInterval(focusTimer);
      focusTimer = null;
    });
    window.addEventListener('pageshow', updateFocusTimer);
    applyMotion();

    const scrollProgress = one('#scroll-progress');
    let scrollPending = false;
    function updateScroll() {
      scrollPending = false;
      if (!scrollProgress) return;
      const range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const fraction = range ? Math.max(0, Math.min(1, window.scrollY / range)) : 0;
      scrollProgress.style.transform = `scaleX(${fraction})`;
    }
    function queueScroll() {
      if (scrollPending) return;
      scrollPending = true;
      window.requestAnimationFrame(updateScroll);
    }
    window.addEventListener('scroll', queueScroll, { passive: true });
    window.addEventListener('resize', queueScroll, { passive: true });
    window.addEventListener('load', queueScroll, { once: true });
    updateScroll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializePortfolio, { once: true });
  else initializePortfolio();
})();
