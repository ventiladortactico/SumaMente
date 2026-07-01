# FAQ Schema - Especificaciones para Rich Snippets

## Objetivo

Implementar FAQ Schema en todos los artículos para obtener rich snippets en Google, aumentando el CTR y la visibilidad en los resultados de búsqueda.

---

## Qué es FAQ Schema

FAQ Schema es un tipo de datos estructurados que le dice a Google que una página contiene preguntas frecuentes con respuestas. Google puede mostrar estas preguntas directamente en los resultados de búsqueda como un rich snippet expandible.

### Beneficios
- **Aumento de CTR:** Ocupa más espacio en SERP
- **Autoridad:** Muestra expertise en el tema
- **UX:** Usuario obtiene respuesta sin clic
- **Voice Search:** Optimizado para búsquedas por voz

---

## Estructura de FAQ Schema

### JSON-LD Básico

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es Bitcoin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bitcoin es una criptomoneda descentralizada creada en 2009 por Satoshi Nakamoto. Funciona sin un banco central y utiliza tecnología blockchain para registrar transacciones."
      }
    }
  ]
}
```

---

## FAQs por Cluster

### Cluster BITCOIN

#### Pilar: Guía Completa de Bitcoin
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es Bitcoin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bitcoin es una criptomoneda descentralizada creada en 2009 por Satoshi Nakamoto. Funciona sin un banco central y utiliza tecnología blockchain para registrar transacciones de forma segura y transparente."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo funciona Bitcoin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bitcoin funciona a través de una red peer-to-peer donde los nodos validan transacciones. Estas transacciones se agrupan en bloques y se añaden a una cadena (blockchain) mediante minería, que usa criptografía para asegurar la red."
      }
    },
    {
      "@type": "Question",
      "name": "¿Es seguro invertir en Bitcoin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bitcoin es una inversión de alto riesgo debido a su volatilidad. Solo deberías invertir dinero que puedas permitirte perder. Es importante investigar, entender los riesgos y considerar diversificar tu portafolio."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto dinero necesito para comprar Bitcoin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Puedes comprar Bitcoin con muy poco dinero, desde $10 USD o menos en muchas plataformas. No necesitas comprar un Bitcoin entero, puedes comprar fracciones (satoshis). Lo ideal es empezar con una cantidad que te sientas cómodo perdiendo."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo declaro Bitcoin a AFIP?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "En Argentina, las criptomonedas deben declararse en el Bienes Personales si superan cierto monto. Las ganancias por venta de cripto están sujetas a Impuesto a las Ganancias. Se recomienda consultar con un contador especializado en criptoactivos."
      }
    }
  ]
}
```

#### Sub-página: Cómo Comprar Bitcoin en Argentina
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cómo comprar Bitcoin en Argentina?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Puedes comprar Bitcoin en Argentina a través de exchanges como Binance (P2P), Buenbit, Lemon, o casas de cambio. El método más común es Binance P2P donde transfieres pesos a otro usuario y recibes Bitcoin directamente."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es Binance P2P?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Binance P2P es un mercado donde puedes comprar y vender criptomonedas directamente con otros usuarios usando métodos de pago locales como transferencia bancaria, MercadoPago o Rapipago. Es seguro porque Binance actúa como escrow hasta que se complete la transacción."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta comprar Bitcoin en Argentina?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El costo depende del tipo de cambio del dólar blue (aprox. $1.000 ARS/USD) más las comisiones del exchange (generalmente 0.1-1%). Binance P2P suele tener las mejores tasas del mercado argentino."
      }
    },
    {
      "@type": "Question",
      "name": "¿Necesito verificar mi identidad?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, la mayoría de exchanges requieren verificación KYC (Know Your Customer) con documento de identidad. Esto es obligatorio por regulaciones anti-lavado de dinero. El proceso suele tomar 10-30 minutos."
      }
    },
    {
      "@type": "Question",
      "name": "¿Es legal comprar Bitcoin en Argentina?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, comprar Bitcoin es legal en Argentina. No hay prohibición, pero debes declarar tus criptoactivos en Bienes Personales si superan ciertos montos y pagar impuestos sobre las ganancias."
      }
    }
  ]
}
```

---

### Cluster PLAZO FIJO

#### Pilar: Guía Completa del Plazo Fijo
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es un plazo fijo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un plazo fijo es una inversión donde depositas dinero en un banco por un período determinado a cambio de una tasa de interés. Al final del plazo, recuperas tu capital más los intereses generados."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuál es la tasa de plazo fijo hoy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Las tasas de plazo fijo varían según el banco y el tipo (tradicional o UVA). En 2026, las tasas tradicionales rondan el 40-50% TNA y las UVA alrededor de UVA + 1-2%. Consulta nuestro comparador de tasas actualizado."
      }
    },
    {
      "@type": "Question",
      "name": "¿Conviene invertir en plazo fijo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Depende de la inflación. Si la tasa del plazo fijo es mayor que la inflación, ganas en términos reales. Actualmente, los plazos fijos UVA suelen ganar a la inflación, mientras que los tradicionales pueden no hacerlo."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es un plazo fijo UVA?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El plazo fijo UVA es una inversión donde el capital se ajusta por el índice UVA (que sigue la inflación) más una tasa adicional. Es ideal para proteger tu dinero de la inflación a largo plazo."
      }
    },
    {
      "@type": "Question",
      "name": "¿Puedo retirar mi dinero antes del vencimiento?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, pero perderás los intereses ganados y podrías pagar una penalización. Algunos bancos ofrecen plazos fijos precancelables con condiciones específicas. Lo ideal es elegir un plazo que coincida con tus necesidades de liquidez."
      }
    }
  ]
}
```

---

### Cluster DÓLAR

#### Pilar: Guía Completa del Dólar en Argentina
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es el dólar blue?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El dólar blue es el tipo de cambio del dólar estadounidense en el mercado paralelo argentino. Se negocia en casas de cambio y cuevas fuera del sistema oficial. Suele tener una brecha significativa con el dólar oficial."
      }
    },
    {
      "@type": "Question",
      "name": "¿Es legal comprar dólar blue?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Comprar dólar blue no es ilegal, pero existe un límite legal de USD 200 mensuales para compras de dólar ahorro y tarjeta. Comprar más de ese límite en el mercado paralelo no está prohibido pero no tiene protección legal."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es el dólar MEP?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El dólar MEP (Mercado Electrónico de Pagos) es un tipo de cambio legal donde compras bonos en pesos y los vendes en dólares. Es una forma de acceder al dólar oficial con un spread más bajo que el blue, pero requiere tener cuenta comitente en un broker."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta el dólar tarjeta?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El dólar tarjeta tiene un recargo del 30% (Impuesto País) más 35% (Impuesto a las Ganancias), totalizando un 65% sobre el dólar oficial. Por ejemplo, si el oficial está a $800, el tarjeta costará aproximadamente $1.320."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuál es el límite de dólar ahorro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El límite de compra de dólar ahorro es de USD 200 mensuales por persona. Para acceder, debes tener ingresos formales, no ser monotributista y no haber comprado dólar oficial en los últimos 90 días."
      }
    }
  ]
}
```

---

### Cluster CEDEARs

#### Pilar: Guía Completa de CEDEARs
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué son los CEDEARs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los CEDEARs (Certificados de Depósito Argentinos) son instrumentos que representan acciones de empresas extranjeras que cotizan en la bolsa argentina. Cada CEDEAR equivale a una acción de la empresa original (ej: Apple, Tesla, Coca-Cola)."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo comprar CEDEARs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Para comprar CEDEARs necesitas una cuenta comitente en un broker argentino (Bull Market, Balanz, PPI, etc.). Una vez abierta la cuenta, puedes comprar CEDEARs como si fueran acciones argentinas, pagando en pesos."
      }
    },
    {
      "@type": "Question",
      "name": "¿Los CEDEARs pagan dividendos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, los CEDEARs pagan los mismos dividendos que las acciones originales, convertidos a pesos al tipo de cambio del día. Los dividendos se acreditan en tu cuenta comitente y están sujetos a retenciones."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta comprar CEDEARs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El costo incluye el precio del CEDEAR más comisiones del broker (generalmente 0.5-1%) e impuestos. Algunos brokers tienen comisiones fijas por operación. Compara brokers para encontrar la mejor opción."
      }
    },
    {
      "@type": "Question",
      "name": "¿Son los CEDEARs una buena inversión?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los CEDEARs son una excelente forma de dolarizar el portafolio sin salir del país. Te permiten invertir en empresas de calidad global (Apple, Microsoft, etc.) protegiéndote de la devaluación. Sin embargo, están sujetos al riesgo de mercado y al tipo de cambio."
      }
    }
  ]
}
```

---

### Cluster INVERSIÓN PARA PRINCIPIANTES

#### Pilar: Guía de Inversión para Principiantes
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cómo empezar a invertir con poco dinero?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Puedes empezar a invertir con tan solo $10.000 ARS o USD 100. Comienza con inversiones simples como plazo fijo, FCI de bajo riesgo, o CEDEARs fraccionados. Lo importante es empezar y aprender con pequeñas cantidades."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es un perfil de inversor?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El perfil de inversor define tu tolerancia al riesgo: conservador (prioriza seguridad, bajo riesgo), moderado (equilibrio entre riesgo y retorno), o agresivo (busca máximo retorno, acepta alto riesgo). Conocer tu perfil es clave para elegir inversiones adecuadas."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto debería invertir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La regla general es invertir solo dinero que no necesites en el corto plazo. Muchos expertos recomiendan el 10-20% de tus ingresos, pero depende de tu situación financiera. Primero asegúrate de tener un fondo de emergencia."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es la diversificación?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La diversificación es distribuir tu dinero en diferentes tipos de inversiones (acciones, bonos, cripto, inmobiliario) para reducir el riesgo. Si una inversión pierde valor, las otras pueden compensar. No pongas todos tus huevos en una canasta."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cuándo es buen momento para invertir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El mejor momento para invertir es ahora, con consistencia. Intentar timing el mercado suele fallar. Una estrategia efectiva es invertir una cantidad fija cada mes (DCA - Dollar Cost Averaging), independientemente del precio."
      }
    }
  ]
}
```

---

### Cluster EDUCACIÓN FINANCIERA

#### Pilar: Guía de Educación Financiera
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es la educación financiera?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La educación financiera es el conjunto de conocimientos y habilidades para gestionar el dinero efectivamente. Incluye entender conceptos como interés, inflación, presupuesto, inversión y riesgo, permitiéndote tomar decisiones financieras informadas."
      }
    },
    {
      "@type": "Question",
      "name": "¿Por qué es importante la educación financiera?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La educación financiera te ayuda a evitar deudas, ahorrar más, invertir sabiamente y alcanzar tus metas financieras. Las personas con educación financiera tienen menos estrés económico y mayor seguridad financiera a largo plazo."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo puedo mejorar mi educación financiera?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Empieza con libros básicos como 'Padre Rico, Padre Pobre', sigue blogs financieros, usa herramientas como calculadoras de presupuesto, y practica con pequeñas inversiones. La clave es aprender constantemente y aplicar lo aprendido."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es la regla 50/30/20?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La regla 50/30/20 es un método de presupuesto donde destinas el 50% de tus ingresos a necesidades básicas, 30% a deseos, y 20% al ahorro e inversión. Es una guía simple para balancear tus finanzas personales."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es la independencia financiera?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La independencia financiera es tener suficientes activos e ingresos pasivos para cubrir tus gastos de vida sin necesidad de trabajar. Se logra mediante ahorro consistente, inversión inteligente y tiempo. El número varía depende de tu estilo de vida."
      }
    }
  ]
}
```

---

## Implementación Técnica

### Dónde Colocar el FAQ Schema

El FAQ Schema debe ir en el `<head>` de cada página, preferiblemente después de otros datos estructurados.

```html
<head>
  <!-- Otros meta tags -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...]
  }
  </script>
</head>
```

### FAQ Visible en la Página

Además del Schema, las FAQs deben ser visibles en el contenido del artículo para los usuarios.

```html
<section class="faq-section">
  <h2>Preguntas Frecuentes</h2>
  
  <div class="faq-item">
    <h3>¿Qué es Bitcoin?</h3>
    <p>Bitcoin es una criptomoneda descentralizada...</p>
  </div>
  
  <div class="faq-item">
    <h3>¿Cómo funciona?</h3>
    <p>Bitcoin funciona a través de una red peer-to-peer...</p>
  </div>
</section>
```

### CSS para FAQs

```css
.faq-section {
  margin: 40px 0;
  padding: 24px;
  background: var(--surface2);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.faq-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.faq-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.faq-item h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: var(--accent);
}

.faq-item p {
  color: var(--text2);
  line-height: 1.6;
}
```

---

## Mejores Prácticas

### 1. Cantidad de FAQs
- **Mínimo:** 3 preguntas
- **Ideal:** 5-7 preguntas
- **Máximo:** 10 preguntas (Google puede no mostrar todas)

### 2. Calidad de las Preguntas
- Deben ser preguntas reales que la gente hace
- Usar lenguaje natural (como hablaría un usuario)
- Incluir la keyword principal cuando sea posible
- Evitar preguntas demasiado técnicas

### 3. Calidad de las Respuestas
- Respuestas directas y concisas (50-100 palabras)
- Incluir información útil y actionable
- Evitar respuestas vagas como "depende"
- Citar fuentes cuando sea relevante

### 4. Actualización
- Revisar FAQs cada 3-6 meses
- Actualizar si cambian tasas, regulaciones o información
- Eliminar preguntas obsoletas
- Agregar nuevas preguntas según tendencias

### 5. Evitar Duplicación
- No copiar FAQs de otros sitios (Google lo penaliza)
- Escribir respuestas originales
- Adaptar al contexto argentino cuando sea relevante

---

## Validación

### Google Rich Results Test
1. Ve a https://search.google.com/test/rich-results
2. Ingresa la URL de tu página
3. Verifica que el FAQ Schema sea detectado
4. Corrige errores si los hay

### Schema.org Validator
1. Ve a https://validator.schema.org/
2. Pega tu JSON-LD
3. Verifica que no haya errores de sintaxis
4. Revisa warnings

---

## Ejemplo Completo de Implementación

### Artículo: "Cómo Comprar Bitcoin en Argentina"

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cómo Comprar Bitcoin en Argentina - Guía Paso a Paso</title>
  
  <!-- FAQ Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cómo comprar Bitcoin en Argentina?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Puedes comprar Bitcoin en Argentina a través de exchanges como Binance (P2P), Buenbit, Lemon, o casas de cambio."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué es Binance P2P?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Binance P2P es un mercado donde puedes comprar y vender criptomonedas directamente con otros usuarios usando métodos de pago locales."
        }
      }
    ]
  }
  </script>
</head>
<body>
  <!-- Contenido del artículo -->
  
  <!-- Sección de FAQs visible -->
  <section class="faq-section">
    <h2>Preguntas Frecuentes</h2>
    
    <div class="faq-item">
      <h3>¿Cómo comprar Bitcoin en Argentina?</h3>
      <p>Puedes comprar Bitcoin en Argentina a través de exchanges como Binance (P2P), Buenbit, Lemon, o casas de cambio. El método más común es Binance P2P donde transfieres pesos a otro usuario y recibes Bitcoin directamente.</p>
    </div>
    
    <div class="faq-item">
      <h3>¿Qué es Binance P2P?</h3>
      <p>Binance P2P es un mercado donde puedes comprar y vender criptomonedas directamente con otros usuarios usando métodos de pago locales como transferencia bancaria, MercadoPago o Rapipago. Es seguro porque Binance actúa como escrow hasta que se complete la transacción.</p>
    </div>
  </section>
</body>
</html>
```

---

## Checklist de FAQ Schema

### Antes de Publicar
- [ ] FAQ Schema en formato JSON-LD
- [ ] Mínimo 3 preguntas, máximo 10
- [ ] Preguntas son naturales y relevantes
- [ ] Respuestas son directas y útiles
- [ ] FAQs visibles en el contenido
- [ ] Validado con Google Rich Results Test
- [ ] Sin errores de sintaxis JSON
- [ ] Sin duplicación de contenido

### Mensual
- [ ] Revisar FAQs por obsolescencia
- [ ] Actualizar información cambiante (tasas, regulaciones)
- [ ] Agregar nuevas preguntas según tendencias
- [ ] Verificar rich snippets en Google
- [ ] Analizar CTR de rich snippets

---

## Métricas de Éxito

### Rich Snippets
- **Porcentaje de páginas con FAQ Schema:** Objetivo 100%
- **Porcentaje de páginas con rich snippets:** Objetivo 70%
- **CTR de rich snippets vs sin rich snippets:** Objetivo +30%

### Engagement
- **Tiempo en página con FAQs:** Objetivo +20%
- **Tasa de rebote con FAQs:** Objetivo -15%
- **Scroll depth con FAQs:** Objetivo +25%

---

## Herramientas

### Generación de FAQ Schema
- **Schema Markup Generator:** https://www technicalseo.com/tools/schema-markup-generator/
- **Merkle Schema Generator:** https://merkle.com/tech/seo/schema-generator/
- **JSON-LD Generator:** https://json-ld.org/jsonld-generator/

### Validación
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/
- **Google Search Console:** Monitorear errores de datos estructurados

---

## Errores Comunes

### 1. FAQs No Relevantes
- **Error:** Preguntas que nadie hace
- **Solución:** Investigar "People Also Ask" en Google, usar herramientas como AnswerThePublic

### 2. Respuestas Demasiado Largas
- **Error:** Respuestas de 300+ palabras
- **Solución:** Mantener respuestas concisas (50-100 palabras), enlazar a artículo completo para más detalle

### 3. Schema Incorrecto
- **Error:** Usar @type "Question" sin "FAQPage"
- **Solución:** Usar estructura correcta con FAQPage como contenedor

### 4. FAQs No Visibles
- **Error:** Solo Schema sin FAQs visibles
- **Solución:** Siempre incluir sección de FAQs visible en el contenido

### 5. Contenido Duplicado
- **Error:** Copiar FAQs de otros sitios
- **Solución:** Escribir respuestas originales adaptadas a tu audiencia

---

## Resumen

Implementar FAQ Schema en todos los artículos es una estrategia de alto retorno:

- **Fácil de implementar:** Solo requiere agregar JSON-LD
- **Alto impacto:** Aumenta CTR y visibilidad
- **Mejora UX:** Responde dudas del usuario
- **SEO friendly:** Google favorece datos estructurados

Con esta especificación, cada artículo de SumaMente puede tener FAQs optimizadas para rich snippets, aumentando el tráfico orgánico y la autoridad del sitio.
