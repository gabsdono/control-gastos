const assert = require('assert');
const {
  isSameMonth, goalPaid, goalRemaining, goalPercent, nextReminderDate, accountBalance
} = require('./logic.js');

// isSameMonth (timezone-safe)
const ref = new Date('2026-08-15T00:00:00');
assert.strictEqual(isSameMonth('2026-08-01', ref), true);
assert.strictEqual(isSameMonth('2026-07-31', ref), false);
assert.strictEqual(isSameMonth('2026-09-01', ref), false);

// goal math
const goal = { target: 200, entries: [{ amount: 50 }, { amount: 30 }] };
assert.strictEqual(goalPaid(goal), 80);
assert.strictEqual(goalRemaining(goal), 120);
assert.strictEqual(goalPercent(goal), 40);
assert.strictEqual(goalPercent({ target: 200, entries: [{ amount: 250 }] }), 100, 'no debe pasar de 100%');
assert.strictEqual(goalRemaining({ target: 200, entries: [{ amount: 250 }] }), 0, 'no debe quedar negativo');

// nextReminderDate
const monday = new Date(2026, 7, 24); // 24 ago 2026
assert.strictEqual(nextReminderDate(15, monday).getDate(), 15, 'el 15 todavía no pasó en agosto');
const afterThe15th = new Date(2026, 7, 20);
const dueNextMonth = nextReminderDate(15, afterThe15th);
assert.strictEqual(dueNextMonth.getMonth(), 8, 'si ya pasó el 15, cae en septiembre');
assert.strictEqual(dueNextMonth.getDate(), 15);
const dueOn31 = nextReminderDate(31, new Date(2026, 1, 1));
assert.strictEqual(dueOn31.getMonth(), 1, 'febrero no tiene 31, se recorta dentro del mismo mes');

// accountBalance
const cash = { id: 'a1', startBalance: 20 };
const movs = [
  { accountId: 'a1', kind: 'ingreso', amount: 50 },
  { accountId: 'a1', kind: 'gasto', amount: 15 },
  { accountId: 'other', kind: 'gasto', amount: 999 }, // otra cuenta, no cuenta
];
assert.strictEqual(accountBalance(cash, movs), 55, '20 inicial + 50 ingreso - 15 gasto = 55');
assert.strictEqual(accountBalance({ id: 'a2', startBalance: 0 }, []), 0);

console.log('OK: logic.js pasó todos los checks');
