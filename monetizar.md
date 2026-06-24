# Plan de Monetización — SumaMente

## Objetivo

Definir una estrategia de monetización que permita:

* Maximizar descargas.
* Obtener feedback de usuarios.
* Generar ingresos.
* Evitar limitar el crecimiento inicial del producto.

No quiero que la aplicación sea de pago obligatorio para descargar en esta etapa.

---

## Regla de negocio fundamental

Todas las fórmulas y módulos permanecerán disponibles para usuarios FREE.

La monetización se aplicará únicamente sobre:

* Publicidad.
* Herramientas premium.
* Personalización.
* Exportaciones.
* Funciones avanzadas futuras.

Esto evita que en el futuro se bloqueen módulos enteros detrás de un pago y perjudique el crecimiento de SumaMente.

---

## Roles de usuario

### FREE

Acceso:

* Todas las fórmulas.
* Todos los módulos.
* Publicidad activa.

---

### PRO

Acceso:

* Sin publicidad.
* Historial avanzado.
* Favoritos.
* Exportación PDF.
* Herramientas premium futuras.

Activación:

* Google Play Billing (Android).
* Mercado Pago / Stripe / PayPal (Web, futuro).

---

### COLABORADOR

Mismas ventajas que PRO.

La diferencia es que la licencia se asigna manualmente como agradecimiento a personas que ayudaron al proyecto.

Ejemplos:

* Personas que aportaron fórmulas.
* Personas que ayudaron a probar versiones.
* Personas que aportaron ideas.
* Colaboradores de documentación.

---

## Arquitectura de licencia

### Schema

```js
{
  tier: "free",        // free | pro | collaborator
  source: "",          // playstore | gift | stripe | ""
  activatedAt: "",     // ISO date
  code: "",            // código de activación si aplica
  version: 1           // para migraciones futuras del schema
}
```

### Gestor (LicenseManager en app.js)

```
LicenseManager.load()      → carga desde localStorage
LicenseManager.save()      → persiste a localStorage
LicenseManager.activate()  → cambia tier/source/code
LicenseManager.redeemCode()→ valida códigos de regalo (stub inicial)
LicenseManager.reset()     → vuelve a free (desarrollo/pruebas)
LicenseManager.export()    → copia segura del estado (debug)
```

Propiedades:

* `LicenseManager.tier` → string
* `LicenseManager.isPro` → boolean (incluye collaborator)
* `LicenseManager.isCollaborator` → boolean

---

## Sistema de regalos (futuro)

Preparar soporte para:

* Códigos promocionales.
* Licencias manuales.
* Activación mediante clave.

Formato de ejemplo:

```
SUMAMENTE-HELPER-2026
```

Al ingresar el código se desbloquea modo COLABORADOR (sin anuncios, funciones Pro).

---

## Panel de configuración (reservado)

Agregar espacio reservado para:

```
Configuración
└── Estado de licencia
```

Ejemplos:

```
FREE
PRO
COLABORADOR ❤️
```

Se implementó visualmente en la UI. El panel de configuración es obligatorio para que el usuario pueda:
- Ver su estado de licencia (FREE / PRO / COLABORADOR)
- Restaurar compras de Google Play
- Acceder al soporte

Ubicación: menú lateral → ícono de ajustes o botón "Configuración".

---

## Reconocimientos (futuro)

Sección opcional:

```
❤️ Colaboradores
```

Para agradecer a quienes ayudaron con:

* Fórmulas.
* Ideas.
* Pruebas.
* Reportes de errores.

Completamente opcional y configurable.

---

## Compatibilidad

El sistema de licencias debe funcionar en:

* Web.
* PWA.
* Android (Capacitor).

Manteniendo una sola base de código. No crear proyectos separados.

---

## Prioridades

### ✅ Fase 0 - Completado

* LicenseManager en app.js con schema completo.
* localStorage como almacenamiento.
* Sistema de códigos de regalo para colaboradores con validación real.
* Códigos válidos: `SUMAMENTE-HELPER-2026`, `SUMAMENTE-COLAB-001`, `SUMAMENTE-BETA-001`, `SUMAMENTE-TEST-2026`.

### ✅ Fase 1 - Completado (Después del lanzamiento Android)

* Integrar Google AdMob (banner discreto) con plugin @capacitor-community/admob.
* Banner solo para usuarios FREE (no PRO ni COLLABORADOR).
* AdMob Test Banner ID: `ca-app-pub-3940256099942544/6300978111`.

### ✅ Fase 2 - Completado (Métricas de uso)

* AnalyticsManager en app.js con rastreo de:
  - Módulos más usados
  - Fórmulas más usadas
  - Búsquedas más utilizadas
  - Retención de usuarios (firstOpen, lastOpen, sessionCount)
* Persistencia en localStorage.
* Integración en setMode, setFormula y doSearch.
* Métodos para obtener top módulos, fórmulas y búsquedas.

### ✅ Fase 3 - Completado (Google Play Billing)

* Integrar Google Play Billing con plugin capacitor-plugin-cdv-purchase.
* BillingManager con init(), purchasePro() y restorePurchases().
* Integración con LicenseManager para activar PRO tras compra.
* UI para comprar PRO:
  - Botón PRO en nav-bar
  - Modal de compra PRO con beneficios
  - Funciones: toggleProModal(), purchasePro(), restorePro(), updateProButton()
* Producto ID: `sumamente_pro_lifetime` (compra única, no consumible).

### ✅ Fase 4 - Completado (Pre-lanzamiento)

* Privacy Policy creada: [`privacy-policy.md`](./privacy-policy.md).
* README actualizado con nuevo keypad 5×7 y build Android.
* Panel de configuración implementado con estado de licencia.

### ⏳ Pendiente (Acción manual del usuario en Play Console)

* Configurar producto `sumamente_pro_lifetime` en Google Play Console con precio USD 2.99 - 4.99.
* ✅ Reemplazar AdMob Test Banner ID por ID real de producción (`ca-app-pub-8506144157862831/8793443400`).

---

## Fase Android (Capacitor)

✅ Completado:

* Integrar Google Play Billing con capacitor-plugin-cdv-purchase.
* Integrar Google AdMob con @capacitor-community/admob.
* Mantener una sola base de código.
* LicenseManager preparado para recibir el estado desde el plugin nativo.

---

## Flujo de trabajo

Desarrollo:

```
GitHub
→ GitHub Pages (usuarios prueban web)
→ npm run build
→ npx cap sync android
→ Android Studio → AAB
→ Google Play Store
```

---

## Objetivo a corto plazo

1. Publicar la app gratis.
2. Conseguir usuarios reales.
3. Recibir feedback.
4. Medir módulos más utilizados.
5. Activar versión Pro cuando exista una base de usuarios.

---

## Objetivo a largo plazo

Mantener:

* Web.
* PWA.
* Android.

con una sola base de código.

Monetizar principalmente mediante:

* Publicidad discreta.
* Compra única Pro.

Evitar suscripciones mensuales en las primeras versiones.

---

## Funcionalidades PRO a futuro

### 1. Vista 2D (Gráficas de Funciones) 📉

Gráfico interactivo donde se traza la función que el usuario escribe (ej. `y = x² - 4`).

- Zoom y desplazamiento con el dedo
- Puntos de corte (raíces), vértice y asíntotas marcados automáticamente
- Opción de cambiar el color de la curva

**Por qué es PRO:** En la versión gratis solo se muestra el resultado numérico, la PRO visualiza la ecuación. Esencial para estudiantes de funciones.

### 2. Vista 3D (Superficies y Curvas en el Espacio) 🧊

Representación tridimensional de funciones de dos variables (ej. `z = x² + y²`).

- Rotación de la figura en 360° con el dedo
- Cambio de perspectiva (ejes X, Y, Z)
- Visualización de colores según la altura (mapa de calor)

**Por qué es PRO:** Herramienta potente para cálculo multivariable y geometría analítica, algo que las calculadoras básicas no tienen.
