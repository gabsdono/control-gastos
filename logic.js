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

// ¿Este movimiento cuenta para el mes de `reference`?
// Recurrente (fijo, semanal o mensual) = cuenta todos los meses mientras esté activo.
// Puntual = solo si su fecha cae en ese mes.
function appliesThisMonth(movement, reference) {
  if (movement.recurring) return movement.active !== false;
  return isSameMonth(movement.date, reference);
}

// Cuántas veces cae ese día de la semana dentro de un mes (0=domingo..6=sábado).
// Un mes tiene 4 o 5 lunes, nunca un número fraccionario — así el total mensual
// de un gasto semanal se puede verificar contando en un calendario real.
function occurrencesOfWeekdayInMonth(weekday, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (new Date(year, month, d).getDay() === weekday) count++;
  }
  return count;
}

// Promedio de semanas por mes (52/12), usado solo si un gasto semanal no tiene
// día de vencimiento definido (no hay de qué día contar ocurrencias).
const WEEKS_PER_MONTH = 52 / 12;

function monthlyEquivalent(movement, reference) {
  reference = reference || new Date();
  if (movement.recurring && movement.frequency === 'weekly') {
    if (movement.dueDay !== null && movement.dueDay !== undefined) {
      return movement.amount * occurrencesOfWeekdayInMonth(movement.dueDay, reference.getFullYear(), reference.getMonth());
    }
    return movement.amount * WEEKS_PER_MONTH;
  }
  return movement.amount;
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

// Próxima fecha en que toca pagar un movimiento recurrente.
// frequency 'monthly': dueDay es día del mes (1-31, se recorta al último día real del mes).
// frequency 'weekly': dueDay es día de semana (0=domingo..6=sábado).
function nextOccurrence(movement, today) {
  if (!movement.recurring || !movement.dueDay && movement.dueDay !== 0) return null;
  if (movement.frequency === 'monthly') {
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const day = Math.min(movement.dueDay, lastDay);
    let d = new Date(today.getFullYear(), today.getMonth(), day);
    if (d < stripTime(today)) {
      const nextMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
      d = new Date(today.getFullYear(), today.getMonth() + 1, Math.min(movement.dueDay, nextMonthLastDay));
    }
    return d;
  }
  if (movement.frequency === 'weekly') {
    const start = stripTime(today);
    const diff = (movement.dueDay - start.getDay() + 7) % 7;
    const d = new Date(start);
    d.setDate(d.getDate() + diff);
    return d;
  }
  return null;
}
function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Saldo de una cuenta (efectivo, banco...) en tiempo real.
// Solo los movimientos puntuales (no recurrentes) mueven el saldo: un gasto/ingreso
// recurrente es un plan mensual, no un hecho con fecha concreta, así que no se resta solo.
function accountBalance(account, movements) {
  const delta = movements
    .filter(m => !m.recurring && m.accountId === account.id)
    .reduce((s, m) => s + (m.kind === 'ingreso' ? m.amount : -m.amount), 0);
  return (account.startBalance || 0) + delta;
}

if (typeof module !== 'undefined') {
  module.exports = {
    budgetLevel, isSameMonth, parseLocalDate, appliesThisMonth, occurrencesOfWeekdayInMonth,
    monthlyEquivalent, goalPaid, goalRemaining, goalPercent, nextOccurrence, accountBalance
  };
}
