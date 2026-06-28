// Ctrl+K abre busqueda + teclado calculadora general
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
        return;
    }
    if (e.key === 'Escape') {
        const searchModal = document.getElementById('modal-search');
        if (searchModal && searchModal.classList.contains('show')) { toggleSearch(false); return; }
        const proModal = document.getElementById('modal-pro');
        if (proModal && proModal.classList.contains('show')) { toggleProModal(false); return; }
        const upOverlay = document.getElementById('pro-upgrade-overlay');
        if (upOverlay && upOverlay.classList.contains('show')) { closeProUpgrade(); return; }
    }

    const generalSection = document.getElementById('mode-general');
    if (!generalSection || !generalSection.classList.contains('active')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const k = e.key;
    if (k >= '0' && k <= '9') { genKey(k); e.preventDefault(); }
    else if (k === '+' || k === '-' || k === '*' || k === '/' || k === '^') { genKey(k); e.preventDefault(); }
    else if (k === '.') { genKey('.'); e.preventDefault(); }
    else if (k === '(' || k === ')') { genKey(k); e.preventDefault(); }
    else if (k === 'Enter') { genEval(); e.preventDefault(); }
    else if (k === 'Backspace') { genBack(); e.preventDefault(); }
    else if (k === 'Delete') { genClear(); e.preventDefault(); }
    else if (k === 'e') { genKey('e'); e.preventDefault(); }
    else if (k === 'x') { genKey('x'); e.preventDefault(); }
    else if (k === 'y') { genKey('y'); e.preventDefault(); }
    else if (k === ',') { genKey(','); e.preventDefault(); }
    else if (k === '=') { genKey('='); e.preventDefault(); }
    else if (k === '!') { genKey('!'); e.preventDefault(); }
    else if (k === 'p') { genKey('π'); e.preventDefault(); }
    else if (k.length === 1) { e.preventDefault(); }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    LicenseManager.load();
    AnalyticsManager.load().recordSession();
    ThemeManager.load();
    if (!LicenseManager.isPro) ThemeManager.apply('dark');
    updateProButton();
    checkProPayment();

    BillingManager.init();

    AdManager.showBanner();
    AdManager.init();

    renderUnifiedDB('general');
    renderHistory();

    document.querySelector('#mode-general .gen-display')?.addEventListener('paste', e => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        if (text) {
            genExpr += text.replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi');
            document.getElementById('gen-expr').textContent = genExpr;
        }
    });

    buildFormulaIndex();
    enhanceChips();
    document.getElementById('search-input').addEventListener('input', e => doSearch(e.target.value));
    document.getElementById('search-input').addEventListener('keydown', e => {
        const items = document.querySelectorAll('#search-results .search-item');
        if (!items.length) return;
        const active = document.querySelector('#search-results .search-item.hover');
        let idx = active ? Array.from(items).indexOf(active) : -1;
        if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, items.length - 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); }
        else if (e.key === 'Enter') { e.preventDefault(); if (active) active.click(); return; }
        else return;
        items.forEach(el => el.classList.remove('hover'));
        items[idx].classList.add('hover');
        items[idx].scrollIntoView({ block: 'nearest' });
    });

    Object.keys(activeFormula).forEach(mode => {
        setFormula(mode, activeFormula[mode]);
    });

    if ('serviceWorker' in navigator && (location.protocol === 'http:' || location.protocol === 'https:')) {
        navigator.serviceWorker.register('./service-worker.js', { scope: './' })
            .catch(() => {});
    }

    setTimeout(() => TourManager.start(), 800);

    let _tapCount = 0, _tapTimer;
    const vTap = document.getElementById('version-tap');
    if (vTap) vTap.addEventListener('click', () => {
        _tapCount++;
        if (_tapTimer) clearTimeout(_tapTimer);
        if (_tapCount >= 5) {
            _tapCount = 0;
            localStorage.removeItem('SumaMente_tour');
            window.location.reload();
        } else {
            _tapTimer = setTimeout(() => { _tapCount = 0; }, 1500);
        }
    });

    // Ripple effect, locale decimal, backspace long-press (keypad)
    document.querySelector('.keypad')?.addEventListener('click', e => {
        const btn = e.target.closest('.key');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-el';
        const d = Math.max(rect.width, rect.height) * 1.2;
        ripple.style.width = ripple.style.height = d + 'px';
        ripple.style.left = (e.clientX - rect.left - d / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - d / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
    });
    const dec = document.getElementById('btn-decimal');
    if (dec && /^es/.test(navigator.language)) dec.textContent = ',';
    const bs = document.getElementById('btn-backspace');
    if (bs) {
        let holdTimer = null;
        function startHold() { holdTimer = setTimeout(genClear, 600); }
        function endHold() { if (holdTimer) clearTimeout(holdTimer); holdTimer = null; }
        bs.addEventListener('mousedown', startHold);
        bs.addEventListener('mouseup', endHold);
        bs.addEventListener('mouseleave', endHold);
        bs.addEventListener('touchstart', startHold, {passive: true});
        bs.addEventListener('touchend', endHold);
        bs.addEventListener('touchcancel', endHold);
    }
});
