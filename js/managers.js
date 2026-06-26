const AdManager = {
    isInitialized: false,
    bannerId: 'ca-app-pub-8506144157862831/8793443400',

    async init() {
        if (this.isInitialized) return;
        try {
            const { AdMob } = await import('@capacitor-community/admob');
            await AdMob.initialize();
            this.isInitialized = true;
            console.log('AdMob inicializado');
        } catch (error) {
            console.log('AdMob no disponible (web o error):', error.message);
        }
    },

    async showBanner() {
        if (!this.isInitialized || LicenseManager.isPro || LicenseManager.isCollaborator) return;
        try {
            const { AdMob } = await import('@capacitor-community/admob');
            await AdMob.showBanner({ adId: this.bannerId, position: 'bottom', margin: 0, isTesting: false });
            console.log('Banner AdMob mostrado');
        } catch (error) {
            console.log('Error al mostrar banner:', error.message);
        }
    },

    async hideBanner() {
        try {
            const { AdMob } = await import('@capacitor-community/admob');
            await AdMob.hideBanner();
            console.log('Banner AdMob oculto');
        } catch (error) {
            console.log('Error al ocultar banner:', error.message);
        }
    }
};

const LicenseManager = {
    _data: null,

    load() {
        try { this._data = JSON.parse(localStorage.getItem('SumaMente_license')); } catch(e) {}
        if (!this._data || typeof this._data.tier !== 'string') {
            this._data = { tier: 'free', source: '', activatedAt: '', code: '', version: 1 };
            this.save();
        }
        return this;
    },

    save() { localStorage.setItem('SumaMente_license', JSON.stringify(this._data)); },

    get tier() { return this._data.tier; },
    get isPro() { return this._data.tier === 'pro' || this._data.tier === 'collaborator'; },
    get isCollaborator() { return this._data.tier === 'collaborator'; },

    activate(tier, source, code) {
        this._data.tier = tier;
        this._data.source = source;
        this._data.activatedAt = new Date().toISOString();
        if (code) this._data.code = code;
        this.save();
    },

    redeemCode(code) {
        const validCodes = [
            'SUMAMENTE-HELPER-2026',
            'SUMAMENTE-COLAB-001',
            'SUMAMENTE-BETA-001'
        ];
        if (validCodes.includes(code)) {
            this.activate('collaborator', 'gift', code);
            return true;
        }
        return false;
    },

    reset() {
        this._data = { tier: 'free', source: '', activatedAt: '', code: '', version: 1 };
        this.save();
    },

    export() { return JSON.parse(JSON.stringify(this._data)); }
};

const ThemeManager = {
    themes: {
        dark: {
            name: 'Dark', icon: '🌙',
            vars: {
                '--bg': '#0a0b0e', '--surface': '#111318', '--surface2': '#181c24',
                '--surface3': '#1e232f', '--border': '#2a3040', '--border2': '#3a4558',
                '--accent': '#4f9cf9', '--accent2': '#38e8c8', '--accent3': '#f97b4f',
                '--accent4': '#a78bfa', '--text': '#e8edf5', '--text2': '#8a97b0', '--text3': '#4a5570'
            }
        },
        ocean: {
            name: 'Océano', icon: '🌊',
            vars: {
                '--bg': '#0a0e1a', '--surface': '#0f1a2e', '--surface2': '#142240',
                '--surface3': '#1a2d52', '--border': '#1e3a6e', '--border2': '#2a5090',
                '--accent': '#5bc0eb', '--accent2': '#48e5c2', '--accent3': '#f9a84f',
                '--accent4': '#9b72cf', '--text': '#e0f0ff', '--text2': '#7ab0d4', '--text3': '#3a6080'
            }
        },
        forest: {
            name: 'Bosque', icon: '🌿',
            vars: {
                '--bg': '#0a1008', '--surface': '#111a10', '--surface2': '#1a2a18',
                '--surface3': '#243a20', '--border': '#2a4a28', '--border2': '#3a6a38',
                '--accent': '#6bc46e', '--accent2': '#4ade80', '--accent3': '#f9c74f',
                '--accent4': '#a78bfa', '--text': '#e0f0d8', '--text2': '#7aa878', '--text3': '#3a6838'
            }
        },
        midnight: {
            name: 'Midnight', icon: '🌃',
            vars: {
                '--bg': '#0d0d1a', '--surface': '#151528', '--surface2': '#1e1e3a',
                '--surface3': '#2a2a4a', '--border': '#3a3a5a', '--border2': '#4a4a7a',
                '--accent': '#818cf8', '--accent2': '#c084fc', '--accent3': '#f472b6',
                '--accent4': '#34d399', '--text': '#e8e0f5', '--text2': '#9890b0', '--text3': '#58507a'
            }
        }
    },
    _current: null,

    load() {
        try { this._current = localStorage.getItem('SumaMente_theme') || 'dark'; } catch(e) { this._current = 'dark'; }
        this.apply(this._current);
        return this;
    },

    get current() { return this._current; },

    apply(key) {
        const theme = this.themes[key];
        if (!theme) return;
        this._current = key;
        localStorage.setItem('SumaMente_theme', key);
        const root = document.documentElement;
        Object.entries(theme.vars).forEach(([prop, val]) => root.style.setProperty(prop, val));
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme.vars['--bg'];
    },

    applyThemeFromLicense() {
        if (LicenseManager.isPro) {
            const saved = localStorage.getItem('SumaMente_theme');
            if (saved && this.themes[saved]) { this.apply(saved); return; }
        }
        this.apply('dark');
    }
};

const AnalyticsManager = {
    _data: null,

    load() {
        try { this._data = JSON.parse(localStorage.getItem('SumaMente_analytics')); } catch(e) {}
        if (!this._data) {
            this._data = {
                modules: {}, formulas: {}, searches: {},
                firstOpen: new Date().toISOString(),
                lastOpen: new Date().toISOString(),
                sessionCount: 0
            };
            this.save();
        }
        return this;
    },

    save() { localStorage.setItem('SumaMente_analytics', JSON.stringify(this._data)); },
    trackModule(module) { this._data.modules[module] = (this._data.modules[module] || 0) + 1; this.save(); },
    trackFormula(module, formula) { const k = `${module}:${formula}`; this._data.formulas[k] = (this._data.formulas[k] || 0) + 1; this.save(); },
    trackSearch(query) {
        if (!query || query.length < 2) return;
        const n = query.toLowerCase().trim();
        this._data.searches[n] = (this._data.searches[n] || 0) + 1;
        this.save();
    },
    recordSession() { this._data.lastOpen = new Date().toISOString(); this._data.sessionCount++; this.save(); },
    getTopModules(limit = 5) { return Object.entries(this._data.modules).sort((a, b) => b[1] - a[1]).slice(0, limit); },
    getTopFormulas(limit = 5) { return Object.entries(this._data.formulas).sort((a, b) => b[1] - a[1]).slice(0, limit); },
    getTopSearches(limit = 5) { return Object.entries(this._data.searches).sort((a, b) => b[1] - a[1]).slice(0, limit); },
    export() { return JSON.parse(JSON.stringify(this._data)); }
};

const BillingManager = {
    isInitialized: false,
    productId: 'sumamente_pro_lifetime',

    async init() {
        if (this.isInitialized) return;
        try {
            const { CdvPurchase } = await import('capacitor-plugin-cdv-purchase');
            await CdvPurchase.initialize([{ id: this.productId, type: CdvPurchase.ProductType.NON_CONSUMABLE }]);
            this.isInitialized = true;
            console.log('Billing inicializado');
        } catch (error) {
            console.log('Billing no disponible (web o error):', error.message);
        }
    },

    async purchasePro() {
        if (!this.isInitialized) { console.log('Billing no inicializado'); return false; }
        try {
            const { CdvPurchase } = await import('capacitor-plugin-cdv-purchase');
            const offer = await CdvPurchase.getOffers([this.productId]);
            if (offer.length === 0) { console.log('No se encontraron ofertas'); return false; }
            const result = await CdvPurchase.purchase(offer[0]);
            if (result) { LicenseManager.activate('pro', 'playstore'); AdManager.hideBanner(); return true; }
            return false;
        } catch (error) {
            console.log('Error en compra PRO:', error.message);
            return false;
        }
    },

    async restorePurchases() {
        if (!this.isInitialized) { console.log('Billing no inicializado'); return false; }
        try {
            const { CdvPurchase } = await import('capacitor-plugin-cdv-purchase');
            await CdvPurchase.restorePurchases();
            const purchases = await CdvPurchase.getLatestPurchases();
            const hasPro = purchases.some(p => p.productId === this.productId);
            if (hasPro) { LicenseManager.activate('pro', 'playstore'); AdManager.hideBanner(); return true; }
            return false;
        } catch (error) {
            console.log('Error al restaurar compras:', error.message);
            return false;
        }
    }
};
