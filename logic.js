// Lógica pura (sin DOM) para poder probarla con Node sin abrir un navegador.

function parseLocalDate(isoDateOnly) {
  const [y, m, d] = isoDateOnly.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isSameMonth(isoDate, reference) {
  const d = parseLocalDate(isoDate);
  return d.getFullYear() === reference.getFullYear() && d.getMonth() === reference.getMonth();
}

function goalPaid(goal) {
  return (goal.entries || []).reduce((s, e) => s + e.amount, 0);
}
function goalRemaining(goal) {
  return Math.max(goal.target - goalPaid(goal), 0);
}
function goalPercent(goal) {
  if (!goal.target || goal.target <= 0) return 0;
  return Math.min(goalPaid(goal) / goal.target, 1) * 100;
}

function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Próxima fecha en que vence un recordatorio mensual (dueDay = día del mes, 1-31,
// se recorta al último día real del mes si hace falta).
function nextReminderDate(dueDay, today) {
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const day = Math.min(dueDay, lastDay);
  let d = new Date(today.getFullYear(), today.getMonth(), day);
  if (d < stripTime(today)) {
    const nextMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
    d = new Date(today.getFullYear(), today.getMonth() + 1, Math.min(dueDay, nextMonthLastDay));
  }
  return d;
}

// Saldo de una cuenta (efectivo, tarjeta...) = saldo inicial + todo lo que entró/salió
// de esa cuenta. Todos los movimientos tienen fecha (ya no hay "recurrentes" que
// contar aparte), así que es una suma directa.
function accountBalance(account, movements) {
  const delta = movements
    .filter(m => m.accountId === account.id)
    .reduce((s, m) => s + (m.kind === 'ingreso' ? m.amount : -m.amount), 0);
  return (account.startBalance || 0) + delta;
}

if (typeof module !== 'undefined') {
  module.exports = {
    parseLocalDate, isSameMonth, goalPaid, goalRemaining, goalPercent,
    nextReminderDate, accountBalance
  };
}
