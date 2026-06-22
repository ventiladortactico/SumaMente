// Integración AdMob para SumaMente (Capacitor)
// Requiere: @capacitor-community/admob v8

const AdManager = {
    initialized: false,
    bannerAdId: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy',

    async init(adUnitId) {
        if (this.initialized) return;
        if (adUnitId) this.bannerAdId = adUnitId;
        try {
            if (typeof Capacitor !== 'undefined' && Capacitor.Plugins?.AdMob) {
                const { AdMob } = Capacitor.Plugins;
                await AdMob.initialize({ initializeForTesting: true });
                this.initialized = true;
            }
        } catch (_) {}
    },

    async showBanner() {
        if (!this.initialized || !this.bannerAdId) return;
        if (LicenseManager.isPro || LicenseManager.isCollaborator) return;
        try {
            const { AdMob } = Capacitor.Plugins;
            await AdMob.showBanner({
                adId: this.bannerAdId,
                position: 'BOTTOM_CENTER',
                isTesting: true,
            });
        } catch (_) {}
    },

    async hideBanner() {
        try {
            const { AdMob } = Capacitor.Plugins;
            await AdMob.hideBanner();
        } catch (_) {}
    },

    async removeBanner() {
        try {
            const { AdMob } = Capacitor.Plugins;
            await AdMob.removeBanner();
        } catch (_) {}
    },
};
