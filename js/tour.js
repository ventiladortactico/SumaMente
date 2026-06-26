const TourManager = {
    _steps: [
        {
            title: 'Bienvenido a SumaMente',
            text: 'Tu calculadora cientifica profesional. Mas de 340 formulas en 16 modulos especializados, con visualizaciones animadas.',
            center: true
        },
        {
            el: '.gen-display',
            title: 'Pantalla de Calculo',
            text: 'Ingresa tu expresion y presiona ↵ para obtener el resultado. Soporta seno, logaritmos, raices, potencias y mas.',
            place: 'bottom'
        },
        {
            el: '.keypad',
            title: 'Botonera 5×7',
            text: 'Funciones trigonometricas, logaritmos, constantes (pi, e) y operadores. Presiona 2nd para acceder a funciones secundarias.',
            place: 'top'
        },
        {
            el: '#btn-search',
            title: 'Busqueda Universal',
            text: 'Haz clic en la lupa para buscar entre las 340+ formulas al instante. Tambien muestra tus favoritos.',
            place: 'bottom',
            mobilePlace: 'bottom-screen'
        },
        {
            el: '.sidebar > .panel:first-child .panel-header',
            title: 'Base de Datos',
            text: 'Presiona aqui y se desplegara con todas las constantes de referencia del modulo activo.',
            place: 'left',
            action: () => { if (currentMode !== 'general') selectModule('general'); }
        },
        {
            el: '.sidebar > .panel:last-child .panel-header',
            title: 'Historial',
            text: 'Guarda automaticamente todos tus calculos anteriores. Puedes limpiarlo o exportarlo a PDF con la version PRO.',
            place: 'left',
            mobilePlace: 'top-screen'
        },
        {
            el: '.btn-menu',
            title: '16 Modulos Especializados',
            text: 'Electronica, Medicina, Finanzas, Quimica y mas. Cada modulo tiene 20 formulas con visualizaciones animadas.',
            place: 'bottom',
            action: () => {
                const db = document.getElementById('unified-db-panel');
                if (db && db.style.display === 'block') toggleDBPanel();
                selectModule('general');
            }
        },
        {
            title: 'Cada modulo tiene sus propias formulas',
            text: 'Al seleccionar un modulo aparecen sus formulas en forma de chips. El resultado se actualiza al instante con graficos y pasos de resolucion.',
            center: true,
            action: () => { if (typeof toggleModal === 'function') toggleModal(true); }
        },
        {
            el: '.mode-section.active .formula-chips',
            title: 'Formulas del Modulo',
            text: 'Este es el modulo de Electronica con 20 formulas. Cambia entre ellas y explora las visualizaciones animadas de cada una.',
            place: 'bottom',
            action: () => { if (typeof toggleModal === 'function') toggleModal(false); selectModule('electro'); }
        },
        {
            title: 'Listo para calcular',
            text: 'Todas las formulas y modulos son completamente gratis. Explora, calcula y guarda tus favoritos.',
            center: true
        }
    ],
    _idx: 0,
    _active: false,
    get _done() { return localStorage.getItem('SumaMente_tour') === 'done'; },
    start() {
        if (this._done || this._active) return;
        this._active = true;
        document.body.style.overflow = 'hidden';
        this._idx = 0;
        const r = document.createElement('div');
        r.id = 'tour-root';
        r.innerHTML = '<div class="tour-overlay"></div><div class="tour-highlight"></div><div class="tour-card"></div>';
        document.body.appendChild(r);
        this._overlay = r.querySelector('.tour-overlay');
        this._highlight = r.querySelector('.tour-highlight');
        this._card = r.querySelector('.tour-card');
        this._overlay.onclick = () => this.end();
        this._show();
    },
    end() {
        if (!this._active) return;
        this._active = false;
        document.body.style.overflow = '';
        if (typeof toggleModal === 'function') toggleModal(false);
        if (typeof toggleDBPanel === 'function') {
            const db = document.getElementById('unified-db-panel');
            if (db && db.style.display === 'block') toggleDBPanel();
        }
        if (currentMode !== 'general' && typeof selectModule === 'function') selectModule('general');
        localStorage.setItem('SumaMente_tour', 'done');
        const r = document.getElementById('tour-root');
        if (r) r.remove();
    },
    _show() {
        const s = this._steps[this._idx];
        if (s.action) s.action();
        const isCenter = s.center || !s.el || !document.querySelector(s.el);
        if (!isCenter) {
            const el = document.querySelector(s.el);
            if (el) {
                const r = el.getBoundingClientRect();
                this._highlight.style.display = 'block';
                const pad = 4;
                this._highlight.style.left = (r.left - pad) + 'px';
                this._highlight.style.top = (r.top - pad) + 'px';
                this._highlight.style.width = (r.width + pad * 2) + 'px';
                this._highlight.style.height = (r.height + pad * 2) + 'px';
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        } else {
            this._highlight.style.display = 'none';
        }
        const i = this._idx, n = this._steps.length;
        const dots = Array.from({ length: n }, (_, j) => `<span class="tour-dot${j === i ? ' active' : ''}"></span>`).join('');
        this._card.className = 'tour-card' + (isCenter ? ' tour-center' : '');
        this._card.innerHTML = `
            <div class="tour-header">
                <span class="tour-progress">${i + 1} / ${n}</span>
                <button class="tour-skip">Saltar</button>
            </div>
            <div class="tour-body">
                <h3 class="tour-title">${s.title}</h3>
                <p class="tour-text">${s.text}</p>
            </div>
            <div class="tour-dots">${dots}</div>
            <div class="tour-footer">
                ${i > 0 ? '<button class="tour-btn tour-prev">← Anterior</button>' : '<span></span>'}
                ${i < n - 1
                    ? '<button class="tour-btn tour-next">Siguiente →</button>'
                    : '<button class="tour-btn tour-done">¡Entendido!</button>'}
            </div>`;
        this._card.querySelector('.tour-skip').onclick = () => this.end();
        const nBtn = this._card.querySelector('.tour-next');
        if (nBtn) nBtn.onclick = () => { this._idx++; this._show(); };
        const pBtn = this._card.querySelector('.tour-prev');
        if (pBtn) pBtn.onclick = () => { this._idx--; this._show(); };
        const dBtn = this._card.querySelector('.tour-done');
        if (dBtn) dBtn.onclick = () => this.end();
        if (!isCenter) this._pos(window.innerWidth <= 640 ? (s.mobilePlace || s.place) : (s.place || 'bottom'));
        else { this._card.style.left = ''; this._card.style.top = ''; }
    },
    _pos(place) {
        const h = this._highlight.getBoundingClientRect();
        const c = this._card;
        c.style.left = 'auto'; c.style.top = 'auto';
        c.style.position = 'fixed';
        const cw = c.offsetWidth, ch = c.offsetHeight;
        const vw = window.innerWidth, vh = window.innerHeight;
        const gap = 16;
        let l, t;
        if (place === 'bottom-screen') { l = vw / 2 - cw / 2; t = vh - ch - 12; }
        else if (place === 'top-screen') { l = vw / 2 - cw / 2; t = 12; }
        else if (place === 'top') { l = h.left + h.width / 2 - cw / 2; t = h.top - ch - gap; }
        else if (place === 'left') { l = h.left - cw - gap; t = h.top + h.height / 2 - ch / 2; }
        else if (place === 'right') { l = h.right + gap; t = h.top + h.height / 2 - ch / 2; }
        else { l = h.left + h.width / 2 - cw / 2; t = h.bottom + gap; }
        if (place === 'top' && t + ch > h.top) { t = h.bottom + gap; }
        if (place === 'bottom' && t + ch > vh) { t = h.top - ch - gap; }
        if (place === 'left' && l + cw > h.left) { l = h.right + gap; }
        if (place === 'right' && l < 0) { l = h.left - cw - gap; }
        l = Math.max(12, Math.min(l, vw - cw - 12));
        t = Math.max(12, Math.min(t, vh - ch - 12));
        c.style.left = l + 'px';
        c.style.top = t + 'px';
    }
};

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && TourManager._active) TourManager.end();
});
window.addEventListener('resize', () => {
    if (TourManager._active) TourManager._show();
});
