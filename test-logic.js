const assert = require('assert');
const {
  budgetLevel, isSameMonth, appliesThisMonth, monthlyEquivalent, occurrencesOfWeekdayInMonth,
  goalPaid, goalRemaining, goalPercent, nextOccurrence, accountBalance
} = require('./logic.js');

// budgetLevel
assert.strictEqual(budgetLevel(500, null), 'ok');
assert.strictEqual(budgetLevel(79, 100), 'ok');
assert.strictEqual(budgetLevel(80, 100), 'warning');
assert.strictEqual(budgetLevel(99, 100), 'warning');
assert.strictEqual(budgetLevel(100, 100), 'over');
assert.strictEqual(budgetLevel(150, 100), 'over');

// isSameMonth (timezone-safe)
const ref = new Date('2026-08-15T00:00:00');
assert.strictEqual(isSameMonth('2026-08-01', ref), true);
assert.strictEqual(isSameMonth('2026-07-31', ref), false);
assert.strictEqual(isSameMonth('2026-09-01', ref), false);

// appliesThisMonth
assert.strictEqual(appliesThisMonth({ recurring: true, active: true }, ref), true);
assert.strictEqual(appliesThisMonth({ recurring: true, active: false }, ref), false);
assert.strictEqual(appliesThisMonth({ recurring: false, date: '2026-08-10' }, ref), true);
assert.strictEqual(appliesThisMonth({ recurring: false, date: '2026-07-10' }, ref), false);

// monthlyEquivalent
assert.strictEqual(monthlyEquivalent({ recurring: false, amount: 20 }), 20);
assert.strictEqual(monthlyEquivalent({ recurring: true, frequency: 'monthly', amount: 20 }), 20);
// sin día de vencimiento definido: promedio 52/12 (fallback, no hay de qué día contar)
assert.ok(Math.abs(monthlyEquivalent({ recurring: true, frequency: 'weekly', amount: 20 }, ref) - 86.67) < 0.1);
// CON día de vencimiento: cuenta lunes reales de agosto 2026 (hay 5), no un promedio
assert.strictEqual(occurrencesOfWeekdayInMonth(1, 2026, 7), 5, 'agosto 2026 tiene 5 lunes');
assert.strictEqual(
  monthlyEquivalent({ recurring: true, frequency: 'weekly', amount: 20, dueDay: 1 }, ref), 100,
  '$20/semana los lunes, 5 lunes en agosto = $100, no $86.67'
);
// septiembre 2026 en cambio tiene 4 lunes: el mismo gasto semanal da un total distinto
assert.strictEqual(occurrencesOfWeekdayInMonth(1, 2026, 8), 4, 'septiembre 2026 tiene 4 lunes');

// goal math
const goal = { target: 200, entries: [{ amount: 50 }, { amount: 30 }] };
assert.strictEqual(goalPaid(goal), 80);
assert.strictEqual(goalRemaining(goal), 120);
assert.strictEqual(goalPercent(goal), 40);
assert.strictEqual(goalPercent({ target: 200, entries: [{ amount: 250 }] }), 100, 'no debe pasar de 100%');
assert.strictEqual(goalRemaining({ target: 200, entries: [{ amount: 250 }] }), 0, 'no debe quedar negativo');

// nextOccurrence
const monday = new Date(2026, 7, 24); // 24 ago 2026 es lunes
assert.strictEqual(
  nextOccurrence({ recurring: true, frequency: 'weekly', dueDay: 1 }, monday).getDate(), 24,
  'si hoy es el día de vencimiento semanal, es hoy'
);
assert.strictEqual(
  nextOccurrence({ recurring: true, frequency: 'weekly', dueDay: 3 }, monday).getDate(), 26,
  'miércoles después de un lunes'
);
assert.strictEqual(
  nextOccurrence({ recurring: true, frequency: 'monthly', dueDay: 15 }, monday).getDate(), 15,
  'el 15 todavía no pasó en agosto'
);
const afterThe15th = new Date(2026, 7, 20);
const dueNextMonth = nextOccurrence({ recurring: true, frequency: 'monthly', dueDay: 15 }, afterThe15th);
assert.strictEqual(dueNextMonth.getMonth(), 8, 'si ya pasó el 15, cae en septiembre');
assert.strictEqual(dueNextMonth.getDate(), 15);
// día 31 en un mes corto se recorta al último día real
const dueOn31 = nextOccurrence({ recurring: true, frequency: 'monthly', dueDay: 31 }, new Date(2026, 1, 1));
assert.strictEqual(dueOn31.getMonth(), 1, 'febrero no tiene 31, se recorta dentro del mismo mes');

// accountBalance
const cash = { id: 'a1', startBalance: 20 };
const movs = [
  { recurring: false, accountId: 'a1', kind: 'ingreso', amount: 50 },
  { recurring: false, accountId: 'a1', kind: 'gasto', amount: 15 },
  { recurring: false, accountId: 'other', kind: 'gasto', amount: 999 }, // otra cuenta, no cuenta
  { recurring: true, accountId: 'a1', kind: 'gasto', amount: 999 }, // recurrente, no cuenta
];
assert.strictEqual(accountBalance(cash, movs), 55, '20 inicial + 50 ingreso - 15 gasto = 55');
assert.strictEqual(accountBalance({ id: 'a2', startBalance: 0 }, []), 0);

console.log('OK: logic.js pasó todos los checks');
