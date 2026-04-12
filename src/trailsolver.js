import { init } from 'z3-solver';

// One shared context for the lifetime of the page.
let ctx = null;

/**
 * Load z3-built.js as a classic script tag (sets window.initZ3),
 * then initialise the z3-solver high-level API.
 */
async function ensureCtx() {
  if (ctx) return ctx;

  // z3-built.js registers initZ3 as window.initZ3 when executed as a classic
  // script. Load it lazily, the first time the user hits the button.
  if (!globalThis.initZ3) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/js/z3-built.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load z3-built.js'));
      document.head.appendChild(script);
    });
  }

  const { Context } = await init();
  ctx = Context('main');
  return ctx;
}

/**
 * Returns a Z3 expression for the km-position of hut at symbolic index `idx`.
 * Implements the same nested-If lookup as the Python _hut_pos helper.
 */
function hutPos(c, hutKm, idx) {
  let expr = c.Int.val(hutKm[hutKm.length - 1]);
  for (let i = hutKm.length - 2; i >= 0; i--) {
    expr = c.If(idx.eq(i), c.Int.val(hutKm[i]), expr);
  }
  return expr;
}

/**
 * Validate inputs and throw descriptive errors before handing off to Z3.
 */
function validateInputs(huts, nDays, targetKm) {
  const hutNames = Object.keys(huts);
  const hutKm = Object.values(huts);
    if (hutNames.length < 2) throw new Error('Need at least a trailhead and one stop.');
  if (hutKm[0] !== 0) throw new Error('The first hut must be at km 0 (the trailhead).');
  for (let i = 0; i < hutKm.length - 1; i++) {
    if (hutKm[i] >= hutKm[i + 1])
      throw new Error('Hut distances must be strictly increasing.');
  }
  if (nDays < 1) throw new Error('Number of days must be at least 1.');
  if (nDays > hutNames.length - 1)
    throw new Error(`${nDays} days exceeds the number of possible stops (${hutNames.length - 1}).`);
  if (targetKm <= 0) throw new Error('Target km/day must be a positive number.');
}

/**
 * Solve the hiking planning problem with Z3.
 * Returns an array of plans (each plan is an array of day objects).
 */
async function solve({ huts, nDays, targetKm, numPlans, halfDayStart, halfDayFinish }) {
  validateInputs(huts, nDays, targetKm);

  const c = await ensureCtx();
  const { Int, Optimize, Or, Not } = c;

  const hutNames = Object.keys(huts);
  const hutKm = Object.values(huts);

  // Integer decision variables: which hut index to stop at on each day.
  const stops = Array.from({ length: nDays }, (_, d) => Int.const(`stop_${d}`));
  const opt = new Optimize();

  // --- Domain and ordering constraints ---
  for (let d = 0; d < nDays; d++) {
    opt.add(stops[d].ge(0));
    opt.add(stops[d].lt(hutKm.length));
  }
  // Must leave the start hut on day 1
  opt.add(stops[0].ge(1));
  // Must finish at the last hut
  opt.add(stops[nDays - 1].eq(hutKm.length - 1));
  // Stops must be strictly ordered (no revisiting)
  for (let d = 1; d < nDays; d++) {
    opt.add(stops[d].gt(stops[d - 1]));
  }

  // --- Deviation constraints (absolute deviation from daily target) ---
  const deviations = [];
  for (let d = 0; d < nDays; d++) {
    const dayDist =
      d === 0
        ? hutPos(c, hutKm, stops[0]).sub(hutKm[0])
        : hutPos(c, hutKm, stops[d]).sub(hutPos(c, hutKm, stops[d - 1]));

    const effTarget =
      (halfDayStart && d === 0) ? Math.floor(targetKm / 2)
      : (halfDayFinish && d === nDays - 1) ? Math.floor(targetKm / 2)
      : targetKm;

    const dev = Int.const(`dev_${d}`);
    opt.add(dev.ge(dayDist.sub(effTarget)));
    opt.add(dev.ge(Int.val(effTarget).sub(dayDist)));
    deviations.push(dev);
  }

  // Minimise the total deviation across all days
  const totalDev = deviations.reduce((acc, d) => acc.add(d));
  opt.minimize(totalDev);

  // --- Enumerate the top N plans ---
  const results = [];
  while (results.length < numPlans) {
    const status = await opt.check();
    if (status !== 'sat') break;

    const model = opt.model();
    const stopVals = stops.map(s => Number(model.eval(s).toString()));
    const devVals = deviations.map(d => Number(model.eval(d).toString()));

    // Build a human-readable day plan
    const plan = [];
    let prevKm = hutKm[0];
    let prevName = hutNames[0];
    for (let d = 0; d < nDays; d++) {
      const idx = stopVals[d];
      const currKm = hutKm[idx];
      const effTarget =
        (halfDayStart && d === 0) ? Math.floor(targetKm / 2)
        : (halfDayFinish && d === nDays - 1) ? Math.floor(targetKm / 2)
        : targetKm;
      plan.push({
        day: d + 1,
        from: prevName,
        to: hutNames[idx],
        distance: currKm - prevKm,
        target: effTarget,
        deviation: devVals[d],
      });
      prevKm = currKm;
      prevName = hutNames[idx];
    }
    results.push(plan);

    // Block this exact assignment so the next check() finds the next-best plan
    const clauses = stops.map((s, d) => Not(s.eq(stopVals[d])));
    const blocking = clauses.length === 1 ? clauses[0] : Or(...clauses);
    opt.add(blocking);
  }

  return results;
}

// ---------------------------------------------------------------------------
// HTML rendering
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderResults(results, container, unit = 'km') {
  container.innerHTML = '';
  if (results.length === 0) {
    container.innerHTML = '<p>No valid plans found. Check your inputs.</p>';
    return;
  }

  results.forEach((plan, i) => {
    const totalDist = plan.reduce((s, d) => s + d.distance, 0);
    const totalDev = plan.reduce((s, d) => s + d.deviation, 0);
    const notes = [];
    if (plan[0].target < plan[1]?.target || (plan.length === 1 && plan[0].target < plan[0].target))
      notes.push(`warm-up day (${plan[0].target}\u00a0${unit})`);
    if (plan[plan.length - 1].target < (plan[plan.length - 2]?.target ?? Infinity))
      notes.push(`wind-down day (${plan[plan.length - 1].target}\u00a0${unit})`);
    const noteStr = notes.length ? ` — ${notes.join(', ')}` : '';
    const title = i === 0
      ? `Optimal plan — ${plan[0].target === plan[plan.length-1].target ? plan[0].target : '~' + Math.max(...plan.map(d=>d.target))}\u00a0${unit}/day${noteStr}`
      : `Alternative ${i + 1}`;

    const section = document.createElement('div');
    section.innerHTML = `
      <h3>${escapeHtml(title)}</h3>
      <table>
        <thead>
          <tr>
            <th>Day</th><th>From</th><th>To</th>
            <th>Distance</th><th>Target</th><th>Deviation</th>
          </tr>
        </thead>
        <tbody>
          ${plan.map(d => `
            <tr>
              <td>${d.day}</td>
              <td>${escapeHtml(d.from)}</td>
              <td>${escapeHtml(d.to)}</td>
              <td>${d.distance} ${unit}</td>
              <td>${d.target} ${unit}</td>
              <td>${d.deviation} ${unit}</td>
            </tr>`).join('')}
          <tr class="total-row">
            <td colspan="3">Total</td>
            <td>${totalDist} ${unit}</td>
            <td></td>
            <td>${totalDev} ${unit}</td>
          </tr>
        </tbody>
      </table>`;
    container.appendChild(section);
  });
}

// ---------------------------------------------------------------------------
// Wire up the UI
// ---------------------------------------------------------------------------

function readHutsFromTable() {
  const huts = {};
  document.querySelectorAll('#hp-huts-table tbody tr').forEach(row => {
    const name = row.querySelector('.hp-hut-name').value.trim();
    const km = parseInt(row.querySelector('.hp-hut-km').value, 10);
    if (name && !isNaN(km)) huts[name] = km;
  });
  return huts;
}

function addStopRow(name = '', km = '') {
  const tbody = document.querySelector('#hp-huts-table tbody');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="hp-hut-name" value="${escapeHtml(String(name))}"></td>
    <td><input type="number" class="hp-hut-km" value="${escapeHtml(String(km))}" min="0" step="1"></td>
    <td><button type="button" class="hp-del-row">×</button></td>`;
  tbody.appendChild(tr);
  tr.querySelector('.hp-hut-name').focus();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('hp-wrap');
  if (!form) return;

  const solveBtn = document.getElementById('hp-solve-btn');
  const resultsDiv = document.getElementById('hp-results');
  const statusDiv = document.getElementById('hp-status');
  let currentUnit = 'km';

  // Unit toggle
  function setUnit(unit) {
    currentUnit = unit;
    document.getElementById('hp-unit-km').classList.toggle('active', unit === 'km');
    document.getElementById('hp-unit-mi').classList.toggle('active', unit === 'mi');
    document.getElementById('hp-col-dist').textContent = unit + ' from start';
    document.querySelectorAll('.hp-target-unit').forEach(el => el.textContent = unit);
    // Clear results so stale km/mi labels don't linger
    resultsDiv.innerHTML = '';
    statusDiv.textContent = '';
  }
  document.getElementById('hp-unit-km')?.addEventListener('click', () => setUnit('km'));
  document.getElementById('hp-unit-mi')?.addEventListener('click', () => setUnit('mi'));

  // Validate rows: flag missing km on named rows, and non-strictly-increasing km
  function validateTable() {
    const rows = [...document.querySelectorAll('#hp-huts-table tbody tr')];
    let prevKm = -Infinity;
    rows.forEach(row => {
      const name = row.querySelector('.hp-hut-name')?.value.trim();
      const kmInput = row.querySelector('.hp-hut-km');
      const km = parseInt(kmInput?.value, 10);
      const missingKm = !!name && isNaN(km);
      const outOfOrder = !isNaN(km) && km <= prevKm;
      row.classList.toggle('hp-row-error', missingKm || outOfOrder);
      if (!isNaN(km)) prevKm = km;
    });
  }

  let solveAttempted = false;

  // Auto-update days estimate from last stop km and target
  function updateDaysEstimate() {
    const kmValues = [...document.querySelectorAll('#hp-huts-table tbody .hp-hut-km')]
      .map(el => parseInt(el.value, 10))
      .filter(v => !isNaN(v) && v > 0);
    if (kmValues.length === 0) return;
    const totalKm = Math.max(...kmValues);
    const targetKm = parseInt(document.getElementById('hp-target').value, 10);
    if (!targetKm || targetKm <= 0) return;
    const days = Math.floor(totalKm / targetKm) + 1;
    document.getElementById('hp-days').value = days;
  }

  // Huts table: add row
  document.getElementById('hp-add-hut')?.addEventListener('click', () => addStopRow());

  // JSON file upload: populate table from { "Name": km, … }
  document.getElementById('hp-upload-json')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      let data;
      try { data = JSON.parse(ev.target.result); } catch {
        statusDiv.textContent = 'Error: Invalid JSON file.';
        return;
      }
      if (typeof data !== 'object' || Array.isArray(data)) {
        statusDiv.textContent = 'Error: JSON must be an object mapping stop names to distances.';
        return;
      }
      const entries = Object.entries(data);
      if (entries.length === 0) { statusDiv.textContent = 'Error: JSON file is empty.'; return; }

      // Clear existing rows except the first (Start / trailhead)
      const tbody = document.querySelector('#hp-huts-table tbody');
      [...tbody.querySelectorAll('tr')].slice(1).forEach(r => r.remove());

      // Overwrite the Start row name with the first entry, then add the rest
      const startRow = tbody.querySelector('tr');
      if (startRow) startRow.querySelector('.hp-hut-name').value = entries[0][0];

      for (let i = 1; i < entries.length; i++) {
        addStopRow(entries[i][0], entries[i][1]);
      }

      statusDiv.textContent = '';
      updateDaysEstimate();
      if (solveAttempted) validateTable();
    };
    reader.readAsText(file);
    // Reset so the same file can be re-loaded
    e.target.value = '';
  });

  // Huts table: delete row + km change (event delegation)
  document.getElementById('hp-huts-table')?.addEventListener('click', e => {
    if (e.target.classList.contains('hp-del-row') && !e.target.disabled) {
      e.target.closest('tr').remove();
      updateDaysEstimate();
      if (solveAttempted) validateTable();
    }
  });

  document.getElementById('hp-huts-table')?.addEventListener('input', e => {
    if (e.target.classList.contains('hp-hut-km')) {
      updateDaysEstimate();
      if (solveAttempted) validateTable();
    } else if (e.target.classList.contains('hp-hut-name')) {
      if (solveAttempted) validateTable();
    }
  });

  document.getElementById('hp-target')?.addEventListener('input', updateDaysEstimate);

  solveBtn.addEventListener('click', async () => {
    if (typeof SharedArrayBuffer === 'undefined') {
      statusDiv.textContent = 'Error: Your browser does not support SharedArrayBuffer, which is required by Z3. Try Chrome or Firefox (non-private).';
      return;
    }
    const huts = readHutsFromTable();
    const nDays = parseInt(document.getElementById('hp-days').value, 10);
    const targetKm = parseInt(document.getElementById('hp-target').value, 10);
    const numPlans = 3;
    const halfDayFinish = document.getElementById('hp-half-day').checked;
    const halfDayStart = document.getElementById('hp-half-day-start').checked;

    // Block on any highlighted row errors
    solveAttempted = true;
    validateTable();
    const errorRows = document.querySelectorAll('#hp-huts-table tbody tr.hp-row-error');
    if (errorRows.length > 0) {
      statusDiv.textContent = 'Error: Fix the highlighted rows before solving (missing or out-of-order distances).';
      return;
    }

    solveBtn.disabled = true;
    statusDiv.textContent = 'Loading Z3 WebAssembly…';
    resultsDiv.innerHTML = '';

    try {
      statusDiv.textContent = 'Solving…';
      const results = await solve({ huts, nDays, targetKm, numPlans, halfDayStart, halfDayFinish });
      statusDiv.textContent =
        results.length > 0 ? `Found ${results.length} plan(s).` : 'No valid plans found.';
      renderResults(results, resultsDiv, currentUnit);
    } catch (e) {
      statusDiv.textContent = `Error: ${e.message}`;
      console.error(e);
    } finally {
      solveBtn.disabled = false;
    }
  });
});
