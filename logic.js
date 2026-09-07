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

// Lunes de la semana que contiene `date` (semana lunes-domingo).
function startOfWeek(date) {
  const d = stripTime(date);
  const day = d.getDay(); // 0=domingo..6=sábado
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
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
// de esa cuenta. Una transferencia mueve plata entre dos cuentas propias (resta de una,
// suma a la otra) sin ser ingreso ni gasto real, así que no toca el total combinado.
function accountBalance(account, movements) {
  const delta = movements.reduce((s, m) => {
    if (m.kind === 'transferencia') {
      if (m.fromAccountId === account.id) return s - m.amount;
      if (m.toAccountId === account.id) return s + m.amount;
      return s;
    }
    if (m.accountId !== account.id) return s;
    return s + (m.kind === 'ingreso' ? m.amount : -m.amount);
  }, 0);
  return (account.startBalance || 0) + delta;
}

if (typeof module !== 'undefined') {
  module.exports = {
    parseLocalDate, isSameMonth, goalPaid, goalRemaining, goalPercent,
    nextReminderDate, accountBalance, startOfWeek
  };
}
