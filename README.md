# SumaMente Cientifica

PWA offline-first de calculo cientifico y profesional. Integra calculadora general, 16 modulos especializados con 340+ formulas y visualizaciones Canvas animadas en una sola aplicacion.

---

## Arquitectura

```
calculadora_cientifica/
├── index.html              # Interfaz completa (HTML + CSS inline)
├── manifest.json           # PWA manifest
├── service-worker.js       # Cache offline
├── js/
│   ├── app.js              # Motor principal: calculadora, formularios, graficos SVG, historial, busqueda, favoritos, PDF export
│   ├── data.js             # Constantes de referencia por modulo
│   └── modulos/
│       ├── {nombre}.js          # Formulas (FORMS.{key} = { ... })
│       └── visuales/
│           ├── {nombre}_visual.js  # Canvas animations ({Nombre}Visual = { ... })
│           └── app_visual.js       # Visuales globales (acústica, etc.)
```

### Convenciones

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Modulo formulas | `js/modulos/{nombre}.js` | `electro.js` |
| Visualizacion | `js/modulos/visuales/{nombre}_visual.js` | `electro_visual.js` |
| Objeto global formulas | `FORMS.{key}` | `FORMS.electro` |
| Objeto global visual | `{Nombre}Visual` | `ElectroVisual` |

---

## Modulos implementados

| Modulo | Key | Formulas | Visual |
|--------|-----|----------|--------|
| General | `general` | Calculadora cientifica + 20 formulas | — |
| Electronica | `electro` | 20 | `ElectroVisual` |
| Medicina | `med` | 20 | `MedicinaVisual` |
| Finanzas | `fin` | 20 | `FinanzasVisual` |
| Quimica | `quim` | 20 | `QuimicaVisual` |
| Arquitectura y Construccion | `civil` | 20 | `CivilVisual` |
| Mecanica | `mec` | 20 | `MecanicaVisual` |
| Geometria | `geom` | 20 | `GeometriaVisual` |
| Unidades | `unit` | 20 | `UnidadesVisual` |
| Fisica | `fis` | 20 | `FisicaVisual` |
| Diseno y Multimedia | `diseno` | 20 | `DisenoVisual` |
| Nutricion | `nutri` | 20 | `NutricionVisual` |
| Acustica | `acust` | 20 | `AcusticaVisual` |
| Programacion | `prog` | 20 | `ProgramacionVisual` |
| Estadistica | `estad` | 20 | `EstadisticaVisual` |
| Redes y Conectividad | `redes` | 20 | `RedesVisual` |

---

## Busqueda Universal

Accesible desde cualquier pantalla via:
- **Boton 🔍** en la barra superior
- **Atajo `Ctrl+K`** (o `Cmd+K` en macOS)

Al abrirse muestra:
- **Favoritos** (si existen) en la seccion superior
- **Resultados** filtrados en tiempo real al escribir

La busqueda recorre titulo, formula, modulo y key de las 320+ formulas. Se navega con flechas `↑` `↓` y se selecciona con `Enter`.

---

## Favoritos

Cada formula tiene una estrella `☆`/`★` que persiste en `localStorage` como `SumaMente_favorites`. Se puede marcar desde:
- La **busqueda universal** (resultados y favoritos)
- Los **chips** de cada modulo (estrella al inicio del boton)

Los favoritos aparecen automaticamente al abrir la busqueda y al escribir en el campo.

---

## Sistema de Formulas

Cada formula se registra como propiedad de `FORMS.{modulo}`:

```js
FORMS.electro.ohm = {
    title: 'Ley de Ohm',
    formula: 'V = I x R',
    fields: [
        { id: 'voltaje', label: 'Voltaje (V)', val: '12' },
        { id: 'corriente', label: 'Corriente (A)', val: '2' }
    ],
    calc(f) {
        const v = parseFloat(f.voltaje.value);
        const i = parseFloat(f.corriente.value);
        if (isNaN(v) || isNaN(i) || i === 0) return null;
        return {
            main: `${(v / i).toFixed(2)} ohm`,
            label: 'Resistencia',
            extras: [{ cls: 'info', txt: `V / I = ${v} / ${i}` }],
            steps: [`Ley de Ohm: R = V / I`, `R = ${v} / ${i}`],
            chart(canvas) { ElectroVisual.ohm(canvas, v, i); }
        };
    }
};
```

### Campos soportados

| Tipo | Descripcion |
|------|-------------|
| `{ id, label, val }` | Texto con valor default |
| `{ id, label, type: 'select', opts: [{v,l}] }` | Select desplegable |
| `{ id, label, val, type: 'number' }` | Numerico |

### Resultado de `calc()`

```js
{
    main: string,           // Valor principal (grande)
    label: string,          // Etiqueta del resultado
    extras: [{ cls, txt }], // Lineas adicionales (cls: 'ok'|'warn'|'info')
    steps: [string],        // Pasos de resolucion
    chart: function(canvas) // Opcional: animacion canvas
}
```

---

## Sistema de Visuales Canvas

Cada modulo visual usa el patron:

```js
const EjemploVisual = {
    initCanvas(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    },
    _loop: {},
    _startLoop(canvas, fn) {
        if (this._loop[canvas.id]) cancelAnimationFrame(this._loop[canvas.id]);
        const animate = () => { fn(); this._loop[canvas.id] = requestAnimationFrame(animate); };
        animate();
    },
    _stopLoop(canvas) {
        if (this._loop[canvas.id]) { cancelAnimationFrame(this._loop[canvas.id]); delete this._loop[canvas.id]; }
    },

    ejemplo(canvas, param1, param2) {
        this._stopLoop(canvas);
        const ctx = this.initCanvas(canvas);
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        let t = 0;
        this._startLoop(canvas, () => {
            t += 0.02;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, w, h);
            // ... dibujo animado con ctx ...
        });
    }
};
```

- Fondo oscuro: `#0d1117`
- `t` se incrementa en cada frame para animacion
- Se usa `requestAnimationFrame` para 60fps suaves

---

## Calculadora General

### Evaluador seguro (`safeMathEval`)

Dos caminos:

1. **Expresion simple** (contiene `x`): inyecta el valor de x con `eval()` limitado a expresiones aritmeticas. Incluye correccion de multiplicacion implicita (`5x` → `5*x`).
2. **Expresion completa** (sin `x`): parser Shunting-yard a RPN con soporte para:
- Operadores: `+ - * / ^`
- Funciones: `sin cos tan log ln sqrt`
- Constantes: `pi` (`π`), `e`
- Postfijo: `!` (factorial, 0-170)
- Parentesis automaticos

### Botonera

```
sin  cos  tan  log
ln   √    x^y  π
e    x!   x    ±
(    )    AC   ⌫
7    8    9    ×
4    5    6    -
1    2    3    +
0    .    = (wide)
```

| Tecla | Funcion | Descripcion |
|-------|---------|-------------|
| `AC` | `genClear()` | Reset completo (expresion, resultado, canvas) |
| `⌫` | `genBack()` | Borra ultimo caracter |
| `±` | `genNegate()` | Inserta signo menos |
| `=` | `genEval()` | Evalua expresion o grafica/ecuacion si contiene `x` |
| `x!` | `genFactorial()` | Factorial del resultado actual |

### Ecuaciones (auto-detection)

Si la expresion contiene `x`:
- Si tiene `=`: grafica la ecuacion + pasos algebraicos
- Si NO tiene `=`: grafica f(x)

### Historial

Cada calculo se guarda en `history` (array) y se renderiza en el sidebar. Se persiste en `localStorage`.

---

## Modal de Modulos

Selector de modulos categorizado:

- **Academico**: Estadistica, Fisica, Quimica, Geometria
- **Ingenieria**: Electronica, Mecanica, Arquitectura, Acustica
- **Tecnologia**: Programacion, Redes
- **Profesional**: Finanzas, Medicina, Nutricion
- **Creativo**: Diseno y Multimedia
- **Utilidades**: Conversor de Unidades
- **Destacado**: General

Cada modulo tiene chips para cambiar entre formulas y un panel de resultados + pasos.

---

## PWA

- `manifest.json` con icono, tema oscuro, standalone
- `service-worker.js` cachea todos los archivos estaticos (JS, HTML, iconos)
- Solo se registra en `http://` o `https://` (no en `file://`)

---

## Sistema de Monetización

### Licencias

La aplicación soporta tres tipos de licencias:

| Tipo | Descripción | Acceso |
|------|-------------|--------|
| **FREE** | Usuario gratuito | Todas las fórmulas y módulos, con publicidad |
| **PRO** | Usuario premium | Sin publicidad, historial ilimitado, exportación PDF, temas visuales |
| **COLABORADOR** | Colaborador del proyecto | Mismas ventajas que PRO (activado con código de regalo) |

### LicenseManager

Gestor de licencias implementado en `js/app.js`:

```js
LicenseManager.load()          // Carga desde localStorage
LicenseManager.save()          // Persiste a localStorage
LicenseManager.activate(tier, source, code)  // Activa licencia
LicenseManager.redeemCode(code) // Valida códigos de regalo
LicenseManager.reset()         // Vuelve a FREE (desarrollo)
LicenseManager.export()        // Exporta estado (debug)
```

Propiedades:
- `LicenseManager.tier` → string ('free', 'pro', 'collaborator')
- `LicenseManager.isPro` → boolean (incluye collaborator)
- `LicenseManager.isCollaborator` → boolean

### Códigos de regalo

Códigos válidos para activar licencia COLABORADOR:
- `SUMAMENTE-HELPER-2026`
- `SUMAMENTE-COLAB-001`
- `SUMAMENTE-BETA-001`
- `SUMAMENTE-TEST-2026`

### AnalyticsManager

Sistema de métricas de uso implementado en `js/app.js`:

```js
AnalyticsManager.trackModule(module)      // Rastrea uso de módulos
AnalyticsManager.trackFormula(module, formula)  // Rastrea uso de fórmulas
AnalyticsManager.trackSearch(query)        // Rastrea búsquedas
AnalyticsManager.recordSession()           // Registra sesión
AnalyticsManager.getTopModules(limit)      // Obtiene módulos más usados
AnalyticsManager.getTopFormulas(limit)     // Obtiene fórmulas más usadas
AnalyticsManager.getTopSearches(limit)     // Obtiene búsquedas más usadas
```

### BillingManager (Android)

Sistema de compras Google Play Billing implementado en `js/app.js`:

```js
BillingManager.init()          // Inicializa billing
BillingManager.purchasePro()   // Compra PRO
BillingManager.restorePurchases()  // Restaura compras previas
```

Producto ID: `sumamente_pro_lifetime` (compra única, no consumible)

### AdMob (Android)

Banner publicitario discreto implementado con plugin `@capacitor-community/admob`:

- Solo se muestra a usuarios FREE
- Se oculta automáticamente al activar PRO o COLLABORADOR
- Test Banner ID: `ca-app-pub-3940256099942544/6300978111`

### Exportación PDF

El exportador PDF (PRO) genera documentos con estilo del tema activo:

- **SVG inline**: los gráficos se renderizan como SVG con los colores del tema, no como Canvas dataURL
- **print-color-adjust: exact**: fuerza al navegador a mantener colores de fondo en el diálogo de impresión
- **Tema activo**: usa las variables CSS del tema actual (dark, ocean, forest, midnight)
- **Dos modos**: "Último cálculo" (resultado actual + gráfico) e "Historial completo" (todos los cálculos)
- **Historial con gráficos**: cada entrada del historial incluye su gráfico SVG regenerado desde la expresión

### UI Premium

- Botón **⭐ PRO** en nav-bar para abrir modal de compra
- Modal de compra con beneficios y opciones de compra/restauración
- Actualización automática del estado del botón según licencia

---

## Como agregar un modulo nuevo

1. Crear `js/modulos/{key}.js`:
```js
if (!FORMS.{key}) FORMS.{key} = {};
Object.assign(FORMS.{key}, { formula1: { ... }, formula2: { ... } });
```

2. Crear `js/modulos/visuales/{key}_visual.js`:
```js
const {Key}Visual = { initCanvas, _loop, _startLoop, _stopLoop, ... };
```

3. En `index.html`:
- Agregar `<script src="js/modulos/{key}.js"></script>`
- Agregar `<script src="js/modulos/visuales/{key}_visual.js"></script>`
- Agregar `<div class="mode-section" id="mode-{key}">` con chips
- Agregar chip en la barra lateral
- Agregar card en el modal

4. En `js/data.js`: agregar `{key}: [ ... ]` al objeto DB
5. En `js/app.js`: agregar `{key}: 'Nombre'` a `modeNames` y `modeColors`, y en los objetos globales `MODE_NAMES` y `MODE_COLORS`

---

## Estilos

- Tema oscuro con colores CSS variables (`--bg`, `--surface`, `--accent`, etc.)
- `--accent`: azul `#4f9cf9` (operadores, boton =)
- `--accent4`: purpura `#a78bfa` (funciones cientificas)
- Monospace en toda la UI
- Grid responsivo para chips y modulos
- Animaciones via `requestAnimationFrame` en canvas
- Transiciones suaves en hover/active de botones

---

## Ejecucion

```bash
# Servidor local (requerido para PWA)
python -m http.server 8765
# Abrir http://localhost:8765
```

Abrir `index.html` directamente funciona para calculos pero no registra el Service Worker.

---

**SumaMente** — Herramienta integral de calculo profesional.
