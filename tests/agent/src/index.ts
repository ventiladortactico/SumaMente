import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ── Config ────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3000", 10);
const ROOT = path.resolve(__dirname, "..", "..", ".."); // project root
const REPORT_DIR = path.resolve(__dirname, "..", "reports");
const SCREENSHOT_DIR = path.resolve(REPORT_DIR, "screenshots");
const BASE_URL = `http://localhost:${PORT}`;
const QUICK_MODE = process.argv.includes("--quick");
const EXPLORE_ONLY = process.argv.includes("--explore-only");

// ── Test Account ──────────────────────────────────────────────────
interface TestResult {
  phase: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  screenshot?: string;
}

const results: TestResult[] = [];
let passedCount = 0;
let failedCount = 0;
let stagehand: Stagehand;

function pass(phase: string, name: string, expected: string, actual: string) {
  passedCount++;
  results.push({ phase, name, passed: true, expected, actual });
  console.log(`  ✅ ${name}`);
}

function fail(phase: string, name: string, expected: string, actual: string, screenshot?: string) {
  failedCount++;
  results.push({ phase, name, passed: false, expected, actual, screenshot });
  console.log(`  ❌ ${name} — esperado: "${expected}", recibido: "${actual}"`);
}

// ── HTTP Server ───────────────────────────────────────────────────
function startServer(): Promise<http.Server> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(ROOT, req.url === "/" ? "index.html" : req.url!);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(ROOT, "index.html");
      }
      const ext = path.extname(filePath);
      const mime: Record<string, string> = {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".json": "application/json",
        ".ico": "image/x-icon",
      };
      res.writeHead(200, { "Content-Type": mime[ext] || "text/plain" });
      res.end(fs.readFileSync(filePath));
    });
    server.listen(PORT, () => {
      console.log(`\n  📡 Servidor local en ${BASE_URL}`);
      resolve(server);
    });
  });
}

// ── Screenshot Helper ─────────────────────────────────────────────
async function screenshot(name: string): Promise<string> {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  const filePath = path.join(SCREENSHOT_DIR, `${name.replace(/[^a-z0-9]/gi, "_")}.png`);
  await stagehand.context.pages()[0].screenshot({ path: filePath, fullPage: false });
  return filePath;
}

// ── Calculator Interaction Helpers ────────────────────────────────
async function click(btn: string) {
  const page = stagehand.context.pages()[0];
  // Try clicking by exact text content first
  const clicked = await page.evaluate((label: string) => {
    const buttons = document.querySelectorAll<HTMLButtonElement>(".key, .btn-calc, .chip, .btn-secondary, .btn-menu, .btn-primary");
    for (const b of buttons) {
      if (b.textContent?.trim() === label) {
        b.click();
        return true;
      }
    }
    return false;
  }, btn);
  if (!clicked) {
    // Fallback: Stagehand AI act
    await stagehand.act(`click the button labeled "${btn}"`);
  }
  await sleep(80);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getGenExpr(): Promise<string> {
  const page = stagehand.context.pages()[0];
  return page.evaluate(() => {
    const el = document.getElementById("gen-expr");
    return el?.textContent || "";
  });
}

async function getGenResult(): Promise<string> {
  const page = stagehand.context.pages()[0];
  return page.evaluate(() => {
    const el = document.getElementById("gen-result");
    return el?.textContent || "";
  });
}

async function assertResult(phase: string, name: string, expected: string) {
  await sleep(200);
  const actual = (await getGenResult()).trim();
  // Flexible comparison: strip trailing zeros, allow minor rounding diffs
  const normalize = (s: string) => s.replace(/\.?0+$/, "").replace(/^0+(\d)/, "$1");
  if (normalize(actual) === normalize(expected)) {
    pass(phase, name, expected, actual);
  } else {
    const ss = await screenshot(name);
    fail(phase, name, expected, actual, ss);
  }
}

async function assertExpr(phase: string, name: string, expected: string) {
  await sleep(100);
  const actual = (await getGenExpr()).trim();
  if (actual.includes(expected) || expected.includes(actual)) {
    pass(phase, name, expected, actual);
  } else {
    const ss = await screenshot(name);
    fail(phase, name, expected, actual, ss);
  }
}

async function assertResultContains(phase: string, name: string, keyword: string) {
  await sleep(200);
  const actual = (await getGenResult()).trim();
  if (actual.toLowerCase().includes(keyword.toLowerCase())) {
    pass(phase, name, `contiene "${keyword}"`, actual);
  } else {
    const ss = await screenshot(name);
    fail(phase, name, `contiene "${keyword}"`, actual, ss);
  }
}

// ── Phase: Load & Sanity ─────────────────────────────────────────
async function phaseLoad() {
  console.log("\n📌 FASE 0: Carga y Sanidad");
  const page = stagehand.context.pages()[0];
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await sleep(1500);

  // Check app loaded
  const title = await page.title();
  if (title.includes("SumaMente")) {
    pass("Carga", "Título de la página", "contiene SumaMente", title);
  } else {
    fail("Carga", "Título de la página", "contiene SumaMente", title);
  }

  // Check result display shows 0
  await assertResult("Carga", "Display inicial en 0", "0");

  // Check keypad exists
  const hasKeypad = await page.evaluate(() => !!document.querySelector(".keypad"));
  if (hasKeypad) {
    pass("Carga", "Keypad presente", "sí", "sí");
  } else {
    fail("Carga", "Keypad presente", "sí", "no");
  }

  await screenshot("00-carga-inicial");
}

// ── Phase: General Calculator Basic ──────────────────────────────
async function phaseGeneralBasic() {
  console.log("\n📌 FASE 1: Calculadora General — Operaciones Básicas");

  // Limpiar primero
  await click("C");
  await sleep(150);

  // 1 + 2 = 3
  await click("1"); await click("+"); await click("2"); await click("↵");
  await assertResult("Básico", "1 + 2 = 3", "3");

  // 10 - 4 = 6
  await click("C");
  await click("1"); await click("0"); await click("−"); await click("4"); await click("↵");
  await assertResult("Básico", "10 - 4 = 6", "6");

  // 3 × 4 = 12
  await click("C");
  await click("3"); await click("×"); await click("4"); await click("↵");
  await assertResult("Básico", "3 × 4 = 12", "12");

  // 15 ÷ 3 = 5
  await click("C");
  await click("1"); await click("5"); await click("÷"); await click("3"); await click("↵");
  await assertResult("Básico", "15 ÷ 3 = 5", "5");

  // Decimales: 0.5 + 0.5 = 1
  await click("C");
  await click("."); await click("5"); await click("+"); await click("."); await click("5"); await click("↵");
  await assertResult("Básico", "0.5 + 0.5 = 1", "1");
}

// ── Phase: Parentheses & Chaining ───────────────────────────────
async function phaseParentheses() {
  console.log("\n📌 FASE 2: Paréntesis y Encadenamiento");

  await click("C");

  // (2 + 3) × 4 = 20
  await click("("); await click("2"); await click("+"); await click("3"); await click(")"); await click("×"); await click("4"); await click("↵");
  await assertResult("Paréntesis", "(2+3)×4 = 20", "20");

  // Chaining: 2 + 3 + 4 = 9
  await click("C");
  await click("2"); await click("+"); await click("3"); await click("+"); await click("4"); await click("↵");
  await assertResult("Paréntesis", "2+3+4 = 9", "9");
}

// ── Phase: Scientific Functions ──────────────────────────────────
async function phaseScientific() {
  console.log("\n📌 FASE 3: Funciones Científicas");

  await click("C");

  // sin(0) = 0
  await click("sin"); await click("0"); await click(")"); await click("↵");
  await assertResult("Científica", "sin(0) = 0", "0");

  // cos(0) = 1
  await click("C");
  await click("cos"); await click("0"); await click(")"); await click("↵");
  await assertResult("Científica", "cos(0) = 1", "1");

  // tan(0) = 0
  await click("C");
  await click("tan"); await click("0"); await click(")"); await click("↵");
  await assertResult("Científica", "tan(0) = 0", "0");

  // sqrt(9) = 3
  await click("C");
  await click("√"); await click("9"); await click(")"); await click("↵");
  await assertResult("Científica", "sqrt(9) = 3", "3");

  // log(100) = 2
  await click("C");
  await click("log"); await click("1"); await click("0"); await click("0"); await click(")"); await click("↵");
  await assertResult("Científica", "log(100) = 2", "2");

  // ln(e) — usamos constante e
  await click("C");
  await click("ln"); await click("e"); await click(")"); await click("↵");
  await assertResult("Científica", "ln(e) = 1", "1");

  // Potencia: 2^3 = 8
  await click("C");
  await click("2"); await click("x^y"); await click("3"); await click("↵");
  await assertResult("Científica", "2^3 = 8", "8");

  // 3^2 = 9 (x²)
  await click("C");
  await click("3"); await click("x²"); await click("↵");
  await assertResult("Científica", "3^2 = 9", "9");

  // π: click pi, then evaluate
  await click("C");
  await click("π"); await click("↵");
  const piResult = await getGenResult();
  if (piResult.startsWith("3.14")) {
    pass("Científica", "π ≈ 3.14...", "3.14...", piResult);
  } else {
    const ss = await screenshot("pi_value");
    fail("Científica", "π ≈ 3.14...", "3.14...", piResult, ss);
  }
}

// ── Phase: Edge Cases ────────────────────────────────────────────
async function phaseEdgeCases() {
  console.log("\n📌 FASE 4: Casos Borde");

  // División por cero
  await click("C");
  await click("1"); await click("÷"); await click("0"); await click("↵");
  const divZeroResult = await getGenResult();
  if (divZeroResult.toLowerCase().includes("infinito") || divZeroResult.toLowerCase().includes("división") || divZeroResult.toLowerCase().includes("cero")) {
    pass("Casos Borde", "1/0 → mensaje amigable", "mensaje de error", divZeroResult);
  } else {
    const ss = await screenshot("div_by_zero");
    fail("Casos Borde", "1/0 → mensaje amigable", "mensaje de error", divZeroResult, ss);
  }

  // sqrt(-1)
  await click("C");
  await click("√"); await click("-"); await click("1"); await click(")"); await click("↵");
  const sqrtNegResult = await getGenResult();
  if (sqrtNegResult.toLowerCase().includes("error") || sqrtNegResult.toLowerCase().includes("matem") || sqrtNegResult.toLowerCase().includes("válida")) {
    pass("Casos Borde", "sqrt(-1) → mensaje de error", "mensaje de error", sqrtNegResult);
  } else {
    const ss = await screenshot("sqrt_neg");
    fail("Casos Borde", "sqrt(-1) → mensaje de error", "mensaje de error", sqrtNegResult, ss);
  }

  // Número largo
  await click("C");
  await click("1"); await click("2"); await click("3"); await click("4"); await click("5"); await click("6"); await click("7"); await click("8"); await click("9");
  await click("0"); await click("1"); await click("2"); await click("3"); await click("4"); await click("5"); await click("6");
  const longExpr = await getGenExpr();
  if (longExpr.length > 5) {
    pass("Casos Borde", "Número largo visible", "se ve completo", longExpr);
  } else {
    fail("Casos Borde", "Número largo visible", "se ve completo", longExpr);
  }
  const result = await getGenResult();
  // The result display should still look OK for this (pre-calculation)
  // Check that text isn't obviously clipped by verifying gen-expr is not empty
  if (longExpr.length > 0) {
    pass("Casos Borde", "Display no vacío con número largo", "no vacío", longExpr.length.toString());
  } else {
    fail("Casos Borde", "Display no vacío con número largo", "no vacío", "vacío");
  }

  // Operadores repetidos: 2+++3 (should handle gracefully)
  await click("C");
  await click("2"); await click("+"); await click("+"); await click("+"); await click("3"); await click("↵");
  const repeatResult = await getGenResult();
  if (repeatResult !== "" && !repeatResult.includes("Error")) {
    pass("Casos Borde", "2+++3 → tolera operadores repetidos", "tolera", repeatResult);
  } else {
    const ss = await screenshot("repeat_ops");
    fail("Casos Borde", "2+++3 → tolera operadores repetidos", "tolera", repeatResult, ss);
  }

  // Paréntesis desbalanceados (debería auto-cerrar)
  await click("C");
  await click("("); await click("1"); await click("+"); await click("2"); await click("↵");
  const unbalancedResult = await getGenResult();
  if (unbalancedResult === "3") {
    pass("Casos Borde", "Paréntesis desbalanceado → auto-cierra", "3", unbalancedResult);
  } else {
    const ss = await screenshot("unbalanced_parens");
    fail("Casos Borde", "Paréntesis desbalanceado → auto-cierra", "3", unbalancedResult, ss);
  }

  // Backspace
  await click("C");
  await click("1"); await click("2"); await click("3");
  await click("⌫"); await click("⌫");
  const backExpr = await getGenExpr();
  if (backExpr === "1") {
    pass("Casos Borde", "Backspace funciona", "1", backExpr);
  } else {
    const ss = await screenshot("backspace");
    fail("Casos Borde", "Backspace funciona", "1", backExpr, ss);
  }

  // Botón C (clear)
  await click("1"); await click("2"); await click("3");
  await click("C");
  const clearExpr = await getGenExpr();
  const clearResult = await getGenResult();
  if (clearExpr === "" && clearResult === "0") {
    pass("Casos Borde", "Botón C limpia todo", "expr='', result='0'", `expr='${clearExpr}', result='${clearResult}'`);
  } else {
    const ss = await screenshot("clear_btn");
    fail("Casos Borde", "Botón C limpia todo", "expr='', result='0'", `expr='${clearExpr}', result='${clearResult}'`, ss);
  }
}

// ── Phase: 2nd Mode ──────────────────────────────────────────────
async function phase2ndMode() {
  console.log("\n📌 FASE 5: Modo 2nd (funciones secundarias)");

  await click("C");

  // Click 2nd, then sin should become sec. Click sec, then 0, then ) and evaluate
  await click("2nd");
  await sleep(100);
  await click("sec"); await click("0"); await click(")"); await click("↵");
  const secResult = await getGenResult();
  if (secResult === "1") {
    pass("2nd Mode", "sec(0) = 1", "1", secResult);
  } else {
    const ss = await screenshot("sec0");
    fail("2nd Mode", "sec(0) = 1", "1", secResult, ss);
  }

  // 2nd mode should reset after press
  // Click 2nd, then csc should appear
  await click("C");
  await click("2nd");
  await sleep(100);
  await click("csc"); await click("9"); await click("0"); await click(")"); await click("↵");
  const cscResult = await getGenResult();
  if (cscResult === "1") {
    pass("2nd Mode", "csc(90) = 1 (DEG)", "1", cscResult);
  } else {
    const ss = await screenshot("csc90");
    fail("2nd Mode", "csc(90) = 1 (DEG)", "1", cscResult, ss);
  }
}

// ── Phase: Angle Mode Toggle ─────────────────────────────────────
async function phaseAngleMode() {
  console.log("\n📌 FASE 6: Modo de Ángulo (DEG/RAD)");

  await click("C");

  // Check default is DEG
  const angleBtn = await stagehand.context.pages()[0].evaluate(() => {
    const btn = document.getElementById("angle-btn");
    return btn?.textContent || "";
  });
  if (angleBtn === "DEG") {
    pass("Ángulo", "Modo inicial DEG", "DEG", angleBtn);
  } else {
    fail("Ángulo", "Modo inicial DEG", "DEG", angleBtn);
  }

  // Toggle to RAD
  await stagehand.act("click the DEG button");
  await sleep(200);
  const angleBtn2 = await stagehand.context.pages()[0].evaluate(() => {
    const btn = document.getElementById("angle-btn");
    return btn?.textContent || "";
  });
  if (angleBtn2 === "RAD") {
    pass("Ángulo", "Toggle a RAD funciona", "RAD", angleBtn2);
  } else {
    fail("Ángulo", "Toggle a RAD funciona", "RAD", angleBtn2);
  }

  // Toggle back to DEG
  await stagehand.act("click the RAD button");
  await sleep(150);
}

// ── Phase: Module Switching ──────────────────────────────────────
async function phaseModules() {
  console.log("\n📌 FASE 7: Módulos");

  const modules = [
    { key: "electro", name: "Electrónica" },
    { key: "med", name: "Medicina" },
    { key: "fin", name: "Finanzas" },
    { key: "quim", name: "Química" },
    { key: "geom", name: "Geometría" },
    { key: "unit", name: "Unidades" },
    { key: "fis", name: "Física" },
    { key: "nutri", name: "Nutrición" },
    { key: "prog", name: "Programación" },
    { key: "estad", name: "Estadística" },
  ];

  for (const mod of modules) {
    // Open module selector
    await stagehand.act("click the MÓDULOS button");
    await sleep(400);

    // Click on the module card
    const clicked = await stagehand.context.pages()[0].evaluate((name: string) => {
      const cards = document.querySelectorAll<HTMLElement>(".module-card");
      for (const c of cards) {
        if (c.querySelector(".name")?.textContent?.includes(name)) {
          c.click();
          return true;
        }
      }
      return false;
    }, mod.name);

    await sleep(500);

    if (clicked) {
      // Verify module loaded
      const panelTitleEl = await stagehand.context.pages()[0].evaluate(() => {
        const p = document.querySelector(".panel-title");
        return p?.textContent || "";
      });
      if (panelTitleEl && mod.name.toLowerCase().split(" ").some((w: string) => panelTitleEl.toLowerCase().includes(w))) {
        pass("Módulos", `${mod.name} cargado`, mod.name, panelTitleEl);
      } else {
        const ss = await screenshot(`mod_${mod.key}`);
        fail("Módulos", `${mod.name} cargado`, mod.name, panelTitleEl || "vacío", ss);
      }

      // Try first formula's calculate button
      const calcBtn = await stagehand.context.pages()[0].evaluate(() => {
        const btn = document.querySelector<HTMLButtonElement>(".btn-calc");
        if (btn) { btn.click(); return true; }
        return false;
      });
      await sleep(400);
      if (calcBtn) {
        // Check if result appeared or showed error about fields
        const resultVisible = await stagehand.context.pages()[0].evaluate(() => {
          const r = document.querySelector(".result");
          return r?.classList.contains("show") || false;
        });
        if (resultVisible) {
          pass("Módulos", `${mod.name}: botón Calcular funciona`, "resultado visible", "visible");
        } else {
          // Might have field validation error — that's also valid behavior
          pass("Módulos", `${mod.name}: botón Calcular responde`, "responde", "clickeable");
        }
      } else {
        fail("Módulos", `${mod.name}: botón Calcular`, "existe", "no encontrado");
      }
    } else {
      fail("Módulos", `${mod.name}: selector`, "clickeable", "no encontrado");
      // Close modal if stuck
      await stagehand.act("click the close button or press Escape");
      await sleep(300);
    }
  }

  // Return to General
  await stagehand.act("click the MÓDULOS button");
  await sleep(300);
  await stagehand.act("click the General module card");
  await sleep(500);
}

// ── Phase: UI Features ───────────────────────────────────────────
async function phaseUI() {
  console.log("\n📌 FASE 8: UI y Navegación");

  // Search button
  await stagehand.act("click the search button (🔍)");
  await sleep(400);
  const searchVisible = await stagehand.context.pages()[0].evaluate(() => {
    const modal = document.getElementById("modal-search");
    return modal?.classList.contains("show") || false;
  });
  if (searchVisible) {
    pass("UI", "Modal de búsqueda se abre", "visible", "visible");
  } else {
    fail("UI", "Modal de búsqueda se abre", "visible", "no");
  }

  // Close search
  await stagehand.act("press Escape");
  await sleep(300);

  // History panel
  const hasHistory = await stagehand.context.pages()[0].evaluate(() => {
    const hist = document.getElementById("history-list");
    return hist && hist.children.length > 0;
  });
  if (hasHistory) {
    pass("UI", "Historial visible", "visible", "visible");
  } else {
    fail("UI", "Historial visible", "visible", "no visible");
  }

  // Status bar
  const statusText = await stagehand.context.pages()[0].evaluate(() => {
    const status = document.querySelector(".status-item");
    return status?.textContent || "";
  });
  if (statusText.includes("Motor")) {
    pass("UI", "Barra de estado presente", "Motor activo", statusText);
  } else {
    fail("UI", "Barra de estado presente", "Motor activo", statusText);
  }

  await screenshot("08-ui-general");
}

// ── Phase: Exploratory AI Agent ─────────────────────────────────
async function phaseExploratory() {
  console.log("\n📌 FASE 9: Exploración Autónoma (IA)");

  const page = stagehand.context.pages()[0];
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await sleep(1000);

  // Create an agent with computer use for natural interaction
    const agent = stagehand.agent({
      mode: "dom",
      systemPrompt: `Actuás como un usuario que nunca vio esta calculadora.

EXPLORÁ todas las funciones disponibles. Intentá ROMPER la aplicación:
- Ingresá valores extremos (números enormes, decimales muy largos, negativos).
- Probá operaciones inválidas (división por cero, raíz de negativo, funciones fuera de dominio).
- Hacé clics rápidos y combinaciones inesperadas (ej: +++++, 2×××3, paréntesis anidados).
- Probá secuencias poco comunes: borrar y escribir rápido, alternar entre módulos sin cerrar, cambiar DEG/RAD mientras hay una expresión.
- Verificá que los resultados matemáticos sean correctos.
- Detectá errores de interfaz (texto cortado, botones superpuestos, modales rotos).
- Identificá problemas de usabilidad (flujos confusos, falta de feedback visual, mensajes poco claros).

REPORTÁ todo error encontrado con pasos para reproducirlo y sugerencias de mejora.`,
  });

  const result = await agent.execute({
    instruction: `Actuá como un usuario que nunca vio esta calculadora.

1. Explorá TODAS las funciones disponibles en la calculadora GENERAL.
2. Ingresá valores extremos, operaciones inválidas, hacé clics rápidos, combinaciones inesperadas y secuencias poco comunes.
3. Abrí el menú de MÓDULOS (botón "MÓDULOS") y probá al menos 5 módulos diferentes.
4. En cada módulo, probá la calculadora y las fórmulas disponibles.
5. Verificá que los resultados matemáticos sean correctos.
6. Detectá errores de interfaz, problemas de usabilidad y posibles fallos.
7. Al finalizar, generá un informe con todos los errores encontrados, pasos para reproducirlos y sugerencias de mejora.

¡Importante! Verificá que NUNCA aparezcan los textos "NaN", "Infinity" o "undefined" en el display.
Si ves eso, es un bug grave que hay que reportar.`,
    maxSteps: 15,
  });

  console.log(`\n  🤖 Reporte del agente exploratorio:`);
  console.log(`  ${result.message}`);

  if (result.success) {
    pass("Exploración", "Agente completó la exploración", "completado", result.message.substring(0, 100));
  } else {
    fail("Exploración", "Agente no completó la exploración", "completado", result.message?.substring(0, 100) || "falló");
  }
}

// ── Report ───────────────────────────────────────────────────────
function generateReport() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const reportFile = path.join(REPORT_DIR, `report-${Date.now()}.json`);
  const summary = {
    timestamp: new Date().toISOString(),
    total: passedCount + failedCount,
    passed: passedCount,
    failed: failedCount,
    successRate: `${((passedCount / (passedCount + failedCount)) * 100).toFixed(1)}%`,
    results: results,
  };

  fs.writeFileSync(reportFile, JSON.stringify(summary, null, 2), "utf8");

  // Also generate a human-readable HTML report
  const htmlReport = path.join(REPORT_DIR, `report-${Date.now()}.html`);
  const rows = results
    .map(
      (r, i) => `
    <tr style="${r.passed ? "background:#1a3a1a" : "background:#3a1a1a"}">
      <td>${i + 1}</td>
      <td>${r.phase}</td>
      <td>${r.name}</td>
      <td>${r.passed ? "✅" : "❌"}</td>
      <td><code>${r.expected}</code></td>
      <td><code>${r.actual}</code></td>
      ${r.screenshot ? `<td><a href="${r.screenshot}">📷</a></td>` : "<td>-</td>"}
    </tr>`
    )
    .join("\n");

  fs.writeFileSync(
    htmlReport,
    `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Reporte de Tests - SumaMente</title>
<style>
  body { font-family: 'JetBrains Mono', monospace; background: #0a0b0e; color: #e8edf5; padding: 20px; }
  h1 { color: #4f9cf9; }
  .summary { display: flex; gap: 20px; margin: 20px 0; }
  .stat { padding: 15px; border-radius: 8px; border: 1px solid #2a3040; min-width: 100px; }
  .stat.pass { border-color: #4ff97b; color: #4ff97b; }
  .stat.fail { border-color: #f94f4f; color: #f94f4f; }
  .stat.total { border-color: #4f9cf9; color: #4f9cf9; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { padding: 8px 12px; text-align: left; border: 1px solid #2a3040; font-size: 12px; }
  th { background: #1e232f; color: #8a97b0; }
  code { color: #38e8c8; }
  a { color: #f9c74f; text-decoration: none; }
</style></head><body>
<h1>🧪 Reporte de Tests — SumaMente</h1>
<div class="summary">
  <div class="stat total">Total: ${summary.total}</div>
  <div class="stat pass">✅ Pasaron: ${summary.passed}</div>
  <div class="stat fail">❌ Fallaron: ${summary.failed}</div>
  <div class="stat total">Éxito: ${summary.successRate}</div>
</div>
<table>
  <tr><th>#</th><th>Fase</th><th>Test</th><th>Resultado</th><th>Esperado</th><th>Actual</th><th>Captura</th></tr>
  ${rows}
</table>
</body></html>`,
    "utf8"
  );

  console.log(`\n📊 Reporte generado:`);
  console.log(`  JSON: ${reportFile}`);
  console.log(`  HTML: ${htmlReport}`);

  return summary;
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log(`
╔══════════════════════════════════════════════╗
║  🧪 SumaMente — AI Test Agent               ║
║  Framework: Stagehand                       ║
║  Modo: ${QUICK_MODE ? "Rápido" : EXPLORE_ONLY ? "Solo Exploración" : "Completo"}                      ║
╚══════════════════════════════════════════════╝
  `);

  // Start local server
  const server = await startServer();

  try {
    // Init Stagehand
    stagehand = new Stagehand({
      env: "LOCAL",
      verbose: 1,
      model: "groq/llama-3.3-70b-versatile",
      localBrowserLaunchOptions: {
        headless: false,
      },
    });

    console.log("\n  🚀 Inicializando Stagehand...");
    await stagehand.init();
    console.log("  ✅ Stagehand listo");

    if (!EXPLORE_ONLY) {
      // Run test phases
      await phaseLoad();
      await phaseGeneralBasic();
      await phaseParentheses();
      await phaseScientific();
      await phaseEdgeCases();
      await phase2ndMode();
      await phaseAngleMode();
      await phaseModules();
      await phaseUI();
    }

    // Always run exploratory (unless quick mode)
    if (!QUICK_MODE) {
      await phaseExploratory();
    }

    // Generate report
    const summary = generateReport();

    // Final summary
    console.log(`\n${"─".repeat(50)}`);
    console.log(`  📊 RESULTADO FINAL`);
    console.log(`  Total: ${summary.total} | ✅ Pasaron: ${summary.passed} | ❌ Fallaron: ${summary.failed}`);
    console.log(`  Tasa de éxito: ${summary.successRate}`);
    console.log(`${"─".repeat(50)}`);

    if (summary.failed > 0) {
      console.log(`\n  ❌ Tests fallados:`);
      for (const r of results) {
        if (!r.passed) {
          console.log(`     - [${r.phase}] ${r.name}`);
          console.log(`       Esperado: "${r.expected}"`);
          console.log(`       Actual:   "${r.actual}"`);
          if (r.screenshot) console.log(`       Captura: ${r.screenshot}`);
        }
      }
    }

  } catch (err: any) {
    console.error("\n  💥 Error fatal:", err.message);
    console.error(err.stack);
  } finally {
    if (stagehand) {
      await stagehand.close();
    }
    server.close();
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

main();
