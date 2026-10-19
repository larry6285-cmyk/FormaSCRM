export const CAPACITY = 15;
export const SHIFTS = { morning: 'Mattino', afternoon: 'Pomeriggio' };
export const ROOMS = Array.from({ length: 10 }, (_, i) => ({ id: `r${i + 1}`, name: `Aula ${String(i + 1).padStart(2, '0')}` }));
export const roomsForShift = shift => ROOMS.slice(0, shift === 'afternoon' ? 4 : 10);
export const minutes = time => /^\d{2}:\d{2}$/.test(time || '') && Number(time.slice(0, 2)) < 24 && Number(time.slice(3)) < 60 ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : NaN;
export const overlap = (a, b) => a.date === b.date && minutes(a.start) < minutes(b.end) && minutes(b.start) < minutes(a.end);
export function blankState() {
  return { version: 1, schoolName: 'Centro Formazione', hours: { morningStart: '08:00', morningEnd: '13:00', afternoonStart: '14:00', afternoonEnd: '19:00' }, students: [], classes: [], teachers: [], lessons: [], activities: [], demo: false };
}
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
const text = (v, max = 200) => typeof v === 'string' && v.length <= max;
const email = v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export function validateState(db) {
  if (!db || db.version !== 1 || !text(db.schoolName, 80) || !db.schoolName.trim()) return 'Il file non contiene un archivio Forma valido.';
  for (const key of ['students', 'classes', 'teachers', 'lessons', 'activities']) {
    if (!Array.isArray(db[key]) || db[key].length > 10000) return 'Formato o dimensione dell’archivio non valido.';
  }
  const h = db.hours;
  if (!h || Object.values(h).some(v => !Number.isFinite(minutes(v))) || !['morningStart', 'morningEnd', 'afternoonStart', 'afternoonEnd'].every(k => typeof h[k] === 'string') || minutes(h.morningStart) >= minutes(h.morningEnd) || minutes(h.morningEnd) > minutes(h.afternoonStart) || minutes(h.afternoonStart) >= minutes(h.afternoonEnd)) return 'Controlla gli orari: ogni fascia deve avere un inizio e una fine e le fasce non possono sovrapporsi.';
  for (const key of ['students', 'classes', 'teachers', 'lessons']) {
    const ids = new Set();
    for (const item of db[key]) {
      if (!item || !text(item.id, 100) || !item.id || ids.has(item.id)) return 'L’archivio contiene identificativi mancanti o duplicati.';
      ids.add(item.id);
    }
  }
  for (const t of db.teachers) {
    if (!text(t.firstName, 80) || !t.firstName.trim() || !text(t.lastName, 80) || !t.lastName.trim() || !text(t.subject, 120) || !text(t.email) || !email(t.email) || !text(t.phone, 40)) return 'Controlla nome, cognome e contatti del docente.';
  }
  for (const c of db.classes) {
    if (!text(c.name, 100) || !c.name.trim() || !text(c.course, 120) || !c.course.trim() || !SHIFTS[c.shift] || !['planned', 'active', 'finished'].includes(c.status) || !text(c.teacherId, 100) || !roomsForShift(c.shift).some(r => r.id === c.roomId)) return 'Controlla nome, corso, fascia e aula della classe.';
    if (c.teacherId && !db.teachers.some(t => t.id === c.teacherId)) return 'Il docente assegnato alla classe non esiste.';
    if (!text(c.startDate, 10) || !text(c.endDate, 10) || (c.startDate && !validDate(c.startDate)) || (c.endDate && !validDate(c.endDate)) || (c.startDate && c.endDate && c.endDate < c.startDate)) return 'Controlla le date di inizio e fine della classe.';
    if (db.students.filter(s => s.classId === c.id).length > CAPACITY) return `La classe “${c.name}” ha raggiunto il limite di 15 allievi. Scegli un’altra classe.`;
  }
  for (const s of db.students) {
    if (!text(s.firstName, 80) || !s.firstName.trim() || !text(s.lastName, 80) || !s.lastName.trim() || !text(s.email) || !email(s.email) || !text(s.phone, 40) || !text(s.notes, 2000) || !['active', 'waiting', 'inactive'].includes(s.status) || !text(s.classId, 100)) return 'Controlla nome, cognome e contatti dell’allievo.';
    if (s.classId && !db.classes.some(c => c.id === s.classId)) return 'La classe assegnata all’allievo non esiste.';
    if (s.createdAt !== undefined && !validDate(s.createdAt)) return 'Controlla la data di iscrizione dell’allievo.';
  }
  for (let i = 0; i < db.lessons.length; i++) {
    const l = db.lessons[i];
    const cls = db.classes.find(c => c.id === l.classId);
    if (!cls) return 'Seleziona una classe valida per la lezione.';
    if (!validDate(l.date) || !Number.isFinite(minutes(l.start)) || !Number.isFinite(minutes(l.end)) || minutes(l.start) >= minutes(l.end)) return 'Controlla la data e gli orari della lezione.';
    if ((cls.startDate && l.date < cls.startDate) || (cls.endDate && l.date > cls.endDate)) return `La lezione deve rientrare nelle date della classe “${cls.name}”.`;
    if (!roomsForShift(cls.shift).some(r => r.id === l.roomId)) return `Nella fascia ${SHIFTS[cls.shift].toLowerCase()} sono disponibili al massimo ${cls.shift === 'morning' ? 10 : 4} aule.`;
    const start = h[`${cls.shift}Start`], end = h[`${cls.shift}End`];
    if (minutes(l.start) < minutes(start) || minutes(l.end) > minutes(end)) return `La lezione deve rientrare nella fascia ${SHIFTS[cls.shift].toLowerCase()}: ${start}–${end}.`;
    if (!text(l.notes, 2000)) return 'La nota della lezione supera il limite consentito.';
    for (let j = 0; j < i; j++) {
      const other = db.lessons[j];
      if (!overlap(l, other)) continue;
      if (l.roomId === other.roomId) return 'L’aula è già occupata in questo orario. Scegli un’altra aula o un altro orario.';
      if (l.classId === other.classId) return 'La classe ha già una lezione in questo orario.';
      const otherClass = db.classes.find(c => c.id === other.classId);
      if (cls.teacherId && cls.teacherId === otherClass?.teacherId) return 'Il docente ha già una lezione in questo orario.';
    }
  }
  if (db.activities.some(a => !a || !text(a.text, 300) || !text(a.at, 40))) return 'Il registro attività non è valido.';
  return '';
}
