const MP_LINK = 'https://mpago.la/2kZmDcB';

function isWebPlatform() {
    try { return !(window.Capacitor && window.Capacitor.isNative); } catch (e) { return true; }
}

function checkProPayment() {
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('collection_status') === 'approved' || params.get('status') === 'approved') {
            LicenseManager.activate('pro', 'mercadopago', '');
            updateProButton();
            try { history.replaceState(null, '', window.location.pathname + window.location.hash); } catch(e) {}
            const toast = document.createElement('div');
            toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:var(--accent2);color:#fff;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:700;z-index:9999;animation:proUpIn .25s ease;box-shadow:0 4px 20px rgba(0,0,0,0.4)';
            toast.textContent = '✓ ¡Pago recibido! PRO activado';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        }
    } catch(e) {}
}

function toggleProModal(show) {
    const el = document.getElementById('modal-pro');
    const showVal = show === undefined ? !el.classList.contains('show') : show;
    el.classList.toggle('show', showVal);
    if (showVal) {
        updateProModal();
    }
}

function showProUpgradeModal(feature, desc) {
    document.getElementById('up-feature-name').textContent = feature;
    document.getElementById('up-feature-desc').textContent = desc || 'Esta funcionalidad es exclusiva de PRO. Actualizá para acceder a todas las herramientas premium.';
    document.getElementById('pro-upgrade-overlay').classList.add('show');
}
function closeProUpgrade() {
    document.getElementById('pro-upgrade-overlay').classList.remove('show');
}
function openProFromUpgrade() {
    closeProUpgrade();
    toggleProModal(true);
}

function renderThemeOptions() {
    const container = document.getElementById('theme-options');
    if (!container) return;
    const current = ThemeManager.current;
    container.innerHTML = Object.entries(ThemeManager.themes).map(([key, t]) =>
        `<button class="chip${key === current ? ' active' : ''}" onclick="selectTheme('${key}')" style="font-size:11px;padding:4px 10px">${t.icon} ${t.name}</button>`
    ).join('');
}

function selectTheme(key) {
    ThemeManager.apply(key);
    renderThemeOptions();
}

function updateProModal() {
    const statusDiv = document.getElementById('pro-status');
    const buyBtn = document.getElementById('btn-buy-pro');
    const restoreBtn = document.getElementById('btn-restore-pro');
    const codeStatus = document.getElementById('code-status');
    const codeInput = document.getElementById('collab-code');
    const themeSection = document.getElementById('theme-section');
    if (codeStatus) codeStatus.innerHTML = '';
    if (codeInput) codeInput.value = '';

    if (LicenseManager.isPro || LicenseManager.isCollaborator) {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--accent2);font-size:13px;font-weight:700">✓ Ya tienes PRO activado</div>';
        buyBtn.style.display = 'none';
        restoreBtn.style.display = 'none';
        if (themeSection) { themeSection.style.display = 'block'; renderThemeOptions(); }
    } else {
        statusDiv.innerHTML = '';
        buyBtn.style.display = 'block';
        if (isWebPlatform()) {
            restoreBtn.style.display = 'none';
        } else {
            restoreBtn.style.display = 'block';
        }
        if (themeSection) themeSection.style.display = 'none';
    }
}

async function purchasePro() {
    const statusDiv = document.getElementById('pro-status');
    statusDiv.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:12px">Procesando compra...</div>';

    if (isWebPlatform()) {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:12px">Redirigiendo a Mercado Pago...</div>';
        setTimeout(() => { window.location.href = MP_LINK; }, 500);
        return;
    }

    const success = await BillingManager.purchasePro();

    if (success) {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--accent2);font-size:13px;font-weight:700">✓ ¡Compra exitosa! Ya eres PRO</div>';
        updateProButton();
        setTimeout(() => toggleProModal(false), 2000);
    } else {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--danger);font-size:12px">Error en la compra. Intenta nuevamente.</div>';
    }
}

async function restorePro() {
    const statusDiv = document.getElementById('pro-status');
    statusDiv.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:12px">Restaurando compra...</div>';

    const success = await BillingManager.restorePurchases();

    if (success) {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--accent2);font-size:13px;font-weight:700">✓ Compra restaurada</div>';
        updateProButton();
        setTimeout(() => toggleProModal(false), 2000);
    } else {
        statusDiv.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:12px">No se encontró ninguna compra previa.</div>';
    }
}

function updateProButton() {
    const btn = document.getElementById('btn-pro');
    if (LicenseManager.isPro || LicenseManager.isCollaborator) {
        btn.textContent = '⭐ PRO';
        btn.style.background = 'var(--accent2)';
        btn.style.borderColor = 'var(--accent2)';
    } else {
        btn.textContent = '⭐ PRO';
        btn.style.background = 'var(--accent)';
        btn.style.borderColor = 'var(--accent)';
    }
}

function redeemProCode() {
    const input = document.getElementById('collab-code');
    const status = document.getElementById('code-status');
    const code = input.value.trim();
    if (!code) {
        status.innerHTML = '<span style="color:var(--danger)">Ingresa un código</span>';
        return;
    }
    if (LicenseManager.redeemCode(code)) {
        status.innerHTML = '<span style="color:var(--accent2);font-weight:700">✓ Colaborador activado</span>';
        input.value = '';
        updateProButton();
        setTimeout(() => toggleProModal(false), 1500);
    } else {
        status.innerHTML = '<span style="color:var(--danger)">✗ Código inválido</span>';
    }
}
