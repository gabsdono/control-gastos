const assert = require('assert');
const { budgetLevel, isSameMonth } = require('./logic.js');

assert.strictEqual(budgetLevel(500, null), 'ok', 'sin límite siempre es ok');
assert.strictEqual(budgetLevel(79, 100), 'ok', '<80% es ok');
assert.strictEqual(budgetLevel(80, 100), 'warning', '80% es warning');
assert.strictEqual(budgetLevel(99, 100), 'warning', '99% es warning');
assert.strictEqual(budgetLevel(100, 100), 'over', '100% es over');
assert.strictEqual(budgetLevel(150, 100), 'over', '150% es over');

const ref = new Date('2026-08-15T00:00:00');
assert.strictEqual(isSameMonth('2026-08-01', ref), true);
assert.strictEqual(isSameMonth('2026-07-31', ref), false);
assert.strictEqual(isSameMonth('2026-09-01', ref), false);

console.log('OK: logic.js pasó todos los checks');
