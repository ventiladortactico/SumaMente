# Arquitectura de Categorías - SumaMente Blog

## Estructura Principal

### 1. Inicio (/)
- Landing page con artículos destacados
- Herramientas más populares
- Últimas noticias del día
- Newsletter signup

### 2. Noticias (/noticias/)
- Noticias de última hora sobre economía y cripto
- Actualizaciones del mercado argentino
- Cambios regulatorios
- **Frecuencia:** 2-3 artículos por semana
- **Longitud:** 500-800 palabras
- **Objetivo:** Captar tráfico de búsquedas recientes

### 3. Guías (/guias/)
- Guías completas y detalladas
- Tutoriales paso a paso
- **Frecuencia:** 1 artículo por semana
- **Longitud:** 2000-3000 palabras
- **Objetivo:** Contenido evergreen

### 4. Herramientas (/herramientas/)
- Todas las calculadoras y herramientas interactivas
- Cada herramienta tiene su propia página
- Incluye: descripción, cómo funciona, FAQs, herramientas relacionadas
- **Objetivo:** 50 herramientas interactivas

### 5. Criptomonedas (/criptomonedas/)
- Bitcoin, Ethereum, Altcoins
- Trading, Staking, Mining
- Wallets, Seguridad
- DeFi, NFTs

### 6. Inversiones (/inversiones/)
- Plazo fijo, Bonos, Acciones
- FCI, ETFs, Cedears
- Estrategias de inversión
- Análisis de riesgo

### 7. Ahorro (/ahorro/)
- Presupuesto mensual
- Eliminación de deudas
- Hábitos de ahorro
- Metas financieras

### 8. Dólar (/dolar/)
- Dólar blue, oficial, MEP, CCL
- Dólar ahorro, tarjeta
- Impuestos (30%, 35%)
- Brecha cambiaria

### 9. Bolsa (/bolsa/)
- Mercado argentino (Merval, BYMA)
- Acciones argentinas (YPF, Galicia, Pampa, etc.)
- Cedears
- Análisis técnico y fundamental

### 10. Educación Financiera (/educacion-financiera/)
- Conceptos básicos
- Psicología del dinero
- Libros y cursos
- Errores comunes

## Jerarquía de URLs

```
/
├── /noticias/
│   ├── /noticias/dolar/
│   ├── /noticias/cripto/
│   └── /noticias/economia/
├── /guias/
│   ├── /guias/bitcoin/
│   ├── /guias/inversion/
│   └── /guias/ahorro/
├── /herramientas/
│   ├── /herramientas/calculadora-plazo-fijo/
│   ├── /herramientas/calculadora-bitcoin/
│   └── /herramientas/conversor-dolar/
├── /criptomonedas/
│   ├── /criptomonedas/bitcoin/
│   ├── /criptomonedas/ethereum/
│   └── /criptomonedas/trading/
├── /inversiones/
│   ├── /inversiones/plazo-fijo/
│   ├── /inversiones/bonos/
│   └── /inversiones/acciones/
├── /ahorro/
│   ├── /ahorro/presupuesto/
│   └── /ahorro/deudas/
├── /dolar/
│   ├── /dolar/blue/
│   └── /dolar/oficial/
├── /bolsa/
│   ├── /bolsa/acciones/
│   └── /bolsa/cedears/
└── /educacion-financiera/
    ├── /educacion-financiera/conceptos/
    └── /educacion-financiera/psicologia/
```

## Taxonomía de Tags

### Tags Principales
- bitcoin
- ethereum
- dolar
- plazo-fijo
- inversion
- ahorro
- bolsa
- cedears
- trading
- staking

### Tags Secundarios
- principiantes
- avanzado
- tutorial
- noticias
- guia
- calculadora
- argentina
- internacional

## Breadcrumb Schema

Cada página debe tener breadcrumbs estructurados:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://suma-mente.vercel.app/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Criptomonedas",
      "item": "https://suma-mente.vercel.app/criptomonedas/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Bitcoin",
      "item": "https://suma-mente.vercel.app/criptomonedas/bitcoin/"
    }
  ]
}
```

## Páginas de Categoría

Cada categoría principal debe tener:
1. Página de categoría con descripción
2. Lista de artículos en esa categoría
3. Herramientas relacionadas
4. Artículos destacados
5. Enlaces a subcategorías

## Enlazado Interno

### Desde Inicio
- 3 artículos destacados
- 3 herramientas populares
- 1 noticia reciente
- 1 guía destacada

### Desde Artículos
- 3 artículos relacionados
- 2 herramientas relacionadas
- Enlace a categoría
- Enlace a inicio

### Desde Herramientas
- 2 artículos relacionados
- 3 herramientas relacionadas
- Enlace a categoría
- Enlace a inicio

## Prioridad de Desarrollo

### Fase 1 (Mes 1)
- Crear estructura de categorías
- Páginas de categorías principales
- 15 artículos
- 5 herramientas

### Fase 2 (Mes 2-3)
- Subcategorías
- 35 artículos más
- 15 herramientas más

### Fase 3 (Mes 4-6)
- Optimización de estructura
- 65 artículos más
- 20 herramientas más

### Fase 4 (Mes 7-12)
- Expansión de categorías
- 85 artículos más
- 10 herramientas más
