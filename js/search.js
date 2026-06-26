function toggleSearch(show) {
    const el = document.getElementById('modal-search');
    const showVal = show === undefined ? !el.classList.contains('show') : show;
    el.classList.toggle('show', showVal);
    if (showVal) {
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('search-results').classList.remove('show');
        renderFavorites();
        setTimeout(() => document.getElementById('search-input').focus(), 100);
    }
}

function selectSearchResult(mod, key) {
    toggleSearch(false);
    setMode(mod);
    setFormula(mod, key);
    const chips = document.querySelectorAll(`#mode-${mod} .chip`);
    chips.forEach(c => c.classList.remove('active'));
    chips.forEach(c => {
        const onclick = c.getAttribute('onclick') || '';
        if (onclick.includes(`'${key}'`)) c.classList.add('active');
    });
}

function doSearch(q) {
    AnalyticsManager.trackSearch(q);

    const results = document.getElementById('search-results');
    if (!q.trim()) { results.classList.remove('show'); results.innerHTML = ''; return; }
    const term = q.toLowerCase();
    const matches = formulaIndex.filter(f =>
        f.title.toLowerCase().includes(term) ||
        f.formula.toLowerCase().includes(term) ||
        f.modName.toLowerCase().includes(term) ||
        f.mod.toLowerCase().includes(term) ||
        f.key.toLowerCase().includes(term)
    ).slice(0, 30);
    if (matches.length === 0) {
        results.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3);font-size:13px">Sin resultados</div>';
    } else {
        results.innerHTML = matches.map(f => {
            const isFav = isFavorite(f.mod, f.key);
            return `<div class="search-item" onclick="selectSearchResult('${f.mod}','${f.key}')">
                <span class="dot" style="background:${f.modColor}"></span>
                <span class="si-mod">${f.modName}</span>
                <span class="si-name">${f.title}</span>
                <button class="si-star${isFav?' active':''}" onclick="event.stopPropagation();toggleFav('${f.mod}','${f.key}','${f.title.replace(/'/g,"\\'")}')">${isFav?'★':'☆'}</button>
            </div>`;
        }).join('');
    }
    results.classList.add('show');
}

function getFavorites() {
    try { return JSON.parse(localStorage.getItem('SumaMente_favorites')) || []; }
    catch(e) { return []; }
}
function isFavorite(mod, key) {
    return getFavorites().some(f => f.mod === mod && f.key === key);
}
function toggleFav(mod, key, title) {
    let favs = getFavorites();
    const idx = favs.findIndex(f => f.mod === mod && f.key === key);
    if (idx >= 0) favs.splice(idx, 1);
    else {
        if (!LicenseManager.isPro && favs.length >= 3) {
            showProUpgradeModal('Más favoritos', 'Podés tener hasta 3 fórmulas favoritas. Actualizá a PRO para favoritos ilimitados.');
            return;
        }
        favs.push({ mod, key, title: title || key });
    }
    try { localStorage.setItem('SumaMente_favorites', JSON.stringify(favs)); } catch(e) {}
    const q = document.getElementById('search-input');
    if (q) doSearch(q.value);
    renderFavorites();
    updateChipStars();
}

function renderFavorites() {
    const container = document.getElementById('search-favorites');
    const favs = getFavorites();
    if (favs.length === 0) {
        container.innerHTML = '<div class="fav-title">⭐ Favoritos</div><div class="fav-empty">Sin favoritos aún. Hacé clic en la estrella ⭐ de una fórmula para agregarla.</div>';
        return;
    }
    container.innerHTML = '<div class="fav-title">⭐ Favoritos</div>' + favs.map(f => {
        const col = MODE_COLORS[f.mod] || '#4f9cf9';
        const title = f.title || (FORMS[f.mod] && FORMS[f.mod][f.key] ? FORMS[f.mod][f.key].title : f.key);
        return `<div class="search-item" onclick="selectSearchResult('${f.mod}','${f.key}')">
            <span class="dot" style="background:${col}"></span>
            <span class="si-mod">${MODE_NAMES[f.mod] || f.mod}</span>
            <span class="si-name">${title}</span>
            <button class="si-star active" onclick="event.stopPropagation();toggleFav('${f.mod}','${f.key}','${(title||'').replace(/'/g,"\\'")}')">★</button>
        </div>`;
    }).join('');
}

function enhanceChips() {
    document.querySelectorAll('.formula-chips .chip').forEach(btn => {
        const m = btn.getAttribute('onclick');
        if (!m) return;
        const parts = m.match(/setFormula\(\s*'(\w+)'\s*,\s*'(\w+)'/);
        if (!parts) return;
        const mod = parts[1], key = parts[2];
        btn.dataset.mod = mod;
        btn.dataset.key = key;
        const star = document.createElement('span');
        star.className = 'chip-star';
        star.textContent = '☆';
        star.onclick = e => {
            e.stopPropagation();
            e.preventDefault();
            const def = FORMS[mod] && FORMS[mod][key];
            toggleFav(mod, key, def ? def.title : key);
        };
        btn.prepend(star);
        btn.style.paddingLeft = '6px';
    });
    updateChipStars();
}
function updateChipStars() {
    document.querySelectorAll('.formula-chips .chip').forEach(btn => {
        const star = btn.querySelector('.chip-star');
        if (!star) return;
        const isFav = isFavorite(btn.dataset.mod, btn.dataset.key);
        star.textContent = isFav ? '★' : '☆';
        star.classList.toggle('active', isFav);
    });
}
