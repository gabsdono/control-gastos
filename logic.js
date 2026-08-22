// Lógica pura (sin DOM) para poder probarla con Node sin abrir un navegador.
function budgetLevel(spent, limit) {
  if (!limit || limit <= 0) return 'ok';
  const ratio = spent / limit;
  if (ratio >= 1) return 'over';
  if (ratio >= 0.8) return 'warning';
  return 'ok';
}

// new Date('YYYY-MM-DD') parses as UTC, which shifts a day off in negative
// UTC offsets (e.g. Ecuador, UTC-5) right at month boundaries. Parse locally instead.
function parseLocalDate(isoDateOnly) {
  const [y, m, d] = isoDateOnly.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isSameMonth(isoDate, reference) {
  const d = parseLocalDate(isoDate);
  return d.getFullYear() === reference.getFullYear() && d.getMonth() === reference.getMonth();
}

if (typeof module !== 'undefined') {
  module.exports = { budgetLevel, isSameMonth, parseLocalDate };
}
