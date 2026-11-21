(() => {
  'use strict';

  let dispose = null;

  function initializeUX() {
    const body = document.body;
    const root = document.documentElement;
    const one = selector => document.querySelector(selector);
    const all = selector => Array.from(document.querySelectorAll(selector));
    const listeners = [];
    const observers = [];
    const pressed = new Set();
    const ripples = new Map();
    const panelTimers = new Map();
    const reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let destroyed = false;
    let headerFrame = null;
    let headerScrolled = body.classList.contains('ux-scrolled');
    let copyAttempt = 0;
    let labelTimer = null;
    let statusTimer = null;

    function listen(target, event, callback, options) {
      target.addEventListener(event, callback, options);
      listeners.push(() => target.removeEventListener(event, callback, options));
    }

    function motionAllowed() {
      return !body.classList.contains('motion-paused') &&
        (root.classList.contains('motion-enabled') || !(reducedMotion && reducedMotion.matches));
    }

    function release(control) {
      control.classList.remove('is-pressed');
      pressed.delete(control);
    }

    function releaseAll() { Array.from(pressed).forEach(release); }

    function removeRipple(control) {
      const ripple = ripples.get(control);
      if (!ripple) return;
      window.clearTimeout(ripple.timer);
      ripple.element.remove();
      ripples.delete(control);
    }

    function addRipple(control, event) {
      if (!motionAllowed() || document.hidden) return;
      removeRipple(control);
      const rect = control.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
      const ripple = document.createElement('span');
      ripple.className = 'ux-ripple';
      ripple.setAttribute('aria-hidden', 'true');
      [control, ripple].forEach(element => {
        element.style.setProperty('--press-x', `${x.toFixed(1)}px`);
        element.style.setProperty('--press-y', `${y.toFixed(1)}px`);
      });
      control.appendChild(ripple);
      const timer = window.setTimeout(() => removeRipple(control), 1000);
      ripples.set(control, { element: ripple, timer });
      ripple.addEventListener('animationend', () => {
        if (ripples.get(control)?.element === ripple) removeRipple(control);
      }, { once: true });
    }

    all('.btn, .stack-node, .demo-tab, #menu-toggle').forEach(control => {
      listen(control, 'pointerdown', event => {
        if (event.button !== 0 || !motionAllowed() || document.hidden) return;
        control.classList.add('is-pressed');
        pressed.add(control);
        if (control.classList.contains('btn')) addRipple(control, event);
      }, { passive: true });
      listen(control, 'pointerleave', () => release(control));
      listen(control, 'pointercancel', () => release(control));
      listen(control, 'blur', () => release(control));
      listen(control, 'keydown', event => {
        if ((event.key !== 'Enter' && event.key !== ' ') || event.repeat || !motionAllowed()) return;
        control.classList.add('is-pressed');
        pressed.add(control);
      });
      listen(control, 'keyup', event => {
        if (event.key === 'Enter' || event.key === ' ') release(control);
      });
    });
    listen(document, 'pointerup', releaseAll, { passive: true });
    listen(document, 'pointercancel', releaseAll, { passive: true });
    listen(window, 'blur', releaseAll);

    const menuToggle = one('#menu-toggle');
    const navigation = one('#site-nav');
    if (menuToggle && navigation) listen(document, 'pointerdown', event => {
      if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
      if (menuToggle.contains(event.target) || navigation.contains(event.target)) return;
      menuToggle.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
    }, { passive: true });

    function updateHeader() {
      headerFrame = null;
      if (destroyed) return;
      const next = window.scrollY > 24;
      if (next === headerScrolled) return;
      headerScrolled = next;
      body.classList.toggle('ux-scrolled', next);
    }

    function queueHeader() {
      if (headerFrame !== null || document.hidden || destroyed) return;
      headerFrame = window.requestAnimationFrame(updateHeader);
    }
    listen(window, 'scroll', queueHeader, { passive: true });
    updateHeader();

    const demoTabs = all('[data-demo-tab]');
    const demoPanels = all('[data-demo-panel]');
    function clearPanelEntry(panel) {
      const timer = panelTimers.get(panel);
      if (timer !== undefined) window.clearTimeout(timer);
      panelTimers.delete(panel);
      panel.classList.remove('is-entering');
    }
    function selectDemo(name, animate = false) {
      if (!demoPanels.some(panel => panel.dataset.demoPanel === name)) return;
      demoTabs.forEach(tab => {
        const selected = tab.dataset.demoTab === name;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        tab.classList.toggle('is-active', selected);
      });
      demoPanels.forEach(panel => {
        const selected = panel.dataset.demoPanel === name;
        const wasHidden = panel.hidden;
        clearPanelEntry(panel);
        panel.hidden = !selected;
        if (selected && wasHidden && animate && motionAllowed() && !document.hidden) {
          panel.classList.add('is-entering');
          panelTimers.set(panel, window.setTimeout(() => clearPanelEntry(panel), 1000));
        }
      });
    }
    demoTabs.forEach((tab, index) => {
      listen(tab, 'click', () => selectDemo(tab.dataset.demoTab, true));
      listen(tab, 'keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % demoTabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + demoTabs.length) % demoTabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = demoTabs.length - 1;
        else return;
        event.preventDefault();
        selectDemo(demoTabs[next].dataset.demoTab, true);
        demoTabs[next].focus();
      });
    });
    demoPanels.forEach(panel => listen(panel, 'animationend', event => {
      if (event.target === panel) clearPanelEntry(panel);
    }));
    const selectedDemo = demoTabs.find(tab => tab.getAttribute('aria-selected') === 'true') || demoTabs[0];
    if (selectedDemo) selectDemo(selectedDemo.dataset.demoTab);

    const copyButton = one('#copy-profile-link');
    const copyLabel = copyButton ? copyButton.querySelector('[data-copy-label]') : null;
    const originalCopyLabel = copyLabel ? copyLabel.textContent : '';
    const status = one('#ux-status');
    function showStatus(message) {
      if (!status || destroyed) return;
      if (statusTimer !== null) window.clearTimeout(statusTimer);
      status.textContent = message;
      status.classList.add('is-visible');
      statusTimer = window.setTimeout(() => {
        status.classList.remove('is-visible');
        statusTimer = null;
      }, 3000);
    }

    function fallbackCopy(value) {
      if (typeof document.execCommand !== 'function') return false;
      const previousFocus = document.activeElement;
      const selection = window.getSelection ? window.getSelection() : null;
      const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : [];
      const input = document.createElement('textarea');
      input.value = value;
      input.readOnly = true;
      input.tabIndex = -1;
      input.setAttribute('aria-hidden', 'true');
      input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none';
      body.appendChild(input);
      let copied = false;
      try {
        input.focus({ preventScroll: true });
        input.select();
        input.setSelectionRange(0, input.value.length);
        copied = document.execCommand('copy') === true;
      } catch (_) { copied = false; }
      finally {
        input.remove();
        if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll: true });
        if (selection && ranges.length) {
          selection.removeAllRanges();
          ranges.forEach(range => selection.addRange(range));
        }
      }
      return copied;
    }

    if (copyButton) listen(copyButton, 'click', async () => {
      const attempt = ++copyAttempt;
      let url = '';
      try {
        const candidate = new URL(copyButton.dataset.copyUrl || '');
        if (candidate.protocol === 'https:' || candidate.protocol === 'http:') url = candidate.href;
      } catch (_) { /* An incomplete link must not claim to have copied. */ }
      let copied = false;
      if (url && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(url);
          copied = true;
        } catch (_) { /* Use the selection fallback when permission is unavailable. */ }
      }
      if (destroyed || attempt !== copyAttempt) return;
      if (url && !copied) copied = fallbackCopy(url);
      if (labelTimer !== null) window.clearTimeout(labelTimer);
      if (copied) {
        if (copyLabel) copyLabel.textContent = 'Link copied';
        showStatus('LinkedIn profile link copied.');
        labelTimer = window.setTimeout(() => {
          if (copyLabel) copyLabel.textContent = originalCopyLabel;
          labelTimer = null;
        }, 2000);
      } else {
        if (copyLabel) copyLabel.textContent = originalCopyLabel;
        labelTimer = null;
        showStatus('Use LinkedIn link to connect');
      }
    });

    function cancelMotionFeedback() {
      releaseAll();
      Array.from(ripples.keys()).forEach(removeRipple);
      demoPanels.forEach(clearPanelEntry);
    }
    if ('MutationObserver' in window) {
      const preferenceObserver = new MutationObserver(() => {
        if (!motionAllowed()) cancelMotionFeedback();
      });
      preferenceObserver.observe(body, { attributes: true, attributeFilter: ['class'] });
      preferenceObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
      observers.push(preferenceObserver);
    }
    if (reducedMotion && typeof reducedMotion.addEventListener === 'function') listen(reducedMotion, 'change', () => {
      if (!motionAllowed()) cancelMotionFeedback();
    });
    listen(document, 'visibilitychange', () => {
      if (document.hidden) {
        if (headerFrame !== null) window.cancelAnimationFrame(headerFrame);
        headerFrame = null;
        cancelMotionFeedback();
      } else queueHeader();
    });

    return () => {
      destroyed = true;
      copyAttempt += 1;
      if (headerFrame !== null) window.cancelAnimationFrame(headerFrame);
      if (labelTimer !== null) window.clearTimeout(labelTimer);
      if (statusTimer !== null) window.clearTimeout(statusTimer);
      cancelMotionFeedback();
      observers.forEach(observer => observer.disconnect());
      listeners.forEach(removeListener => removeListener());
      if (copyLabel) copyLabel.textContent = originalCopyLabel;
      if (status) status.classList.remove('is-visible');
    };
  }

  function start() {
    if (!dispose) dispose = initializeUX();
  }
  window.addEventListener('pagehide', () => {
    if (dispose) dispose();
    dispose = null;
  });
  window.addEventListener('pageshow', start);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
