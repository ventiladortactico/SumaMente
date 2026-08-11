# SumaMente CientificaPWA offline-first de calculo cientifico y profesional. Integra calculadora general, 16 modulos especializados con 340+ formulas y visualizaciones Canvas animadas en una sola aplicacion.---## Arquitectura```calculadora_cientifica/├── index.html              # Interfaz completa (HTML + CSS inline)├── manifest.json           # PWA manifest├── service-worker.js       # Cache offline├── js/│   ├── app.js              # Motor principal: calculadora, formularios, graficos SVG, historial, busqueda, favoritos, PDF export│   ├── data.js             # Constantes de referencia por modulo│   └── modulos/│       ├── {nombre}.js          # Formulas (FORMS.{key} = { ... })│       └── visuales/│           ├── {nombre}_visual.js  # Canvas animations ({Nombre}Visual = { ... })

---

## Portfolio del desarrollador

Este proyecto forma parte del portfolio de **Joaquín Emiliano Salgueiro**, Analista en Sistemas y desarrollador Full Stack.

🌐 **Portfolio:** https://joaquinsalgueiro.vercel.app/
