import test from 'node:test';
import assert from 'node:assert/strict';
import { blankState, validateState, roomsForShift, overlap, validDate } from '../dist/model.js';

const teacher = id => ({ id, firstName: 'Anna', lastName: 'Rossi', email: '', phone: '', subject: '' });
const course = (id, shift = 'morning', teacherId = '') => ({ id, name: id, course: 'Formazione', shift, teacherId, roomId: 'r1', status: 'active', startDate: '', endDate: '' });
const student = (id, classId = 'c1') => ({ id, firstName: 'Mario', lastName: 'Rossi', email: '', phone: '', notes: '', status: 'active', classId });
const lesson = (id, classId = 'c1', roomId = 'r1', start = '09:00', end = '10:00') => ({ id, classId, roomId, date: '2026-10-19', start, end, notes: '' });
const fixture = () => { const db = blankState(); db.classes.push(course('c1')); return db; };

test('an empty school is valid and exposes 10 morning / 4 afternoon rooms', () => {
  assert.equal(validateState(blankState()), '');
  assert.equal(roomsForShift('morning').length, 10);
  assert.equal(roomsForShift('afternoon').length, 4);
});
test('15 students are accepted and a 16th is rejected, regardless of student status', () => {
  const db = fixture(); db.students = Array.from({ length: 15 }, (_, i) => student(`s${i}`));
  assert.equal(validateState(db), ''); db.students.push({ ...student('s16'), status: 'waiting' });
  assert.match(validateState(db), /limite di 15/);
});
test('moving an enrolled student to another class releases a place', () => {
  const db = fixture(); db.classes.push(course('c2')); db.students = Array.from({ length: 16 }, (_, i) => student(`s${i}`));
  db.students[0].classId = 'c2'; assert.equal(validateState(db), '');
});
test('afternoon room 5 is forbidden for classes and lessons', () => {
  const db = fixture(); db.classes[0].shift = 'afternoon'; db.classes[0].roomId = 'r5';
  assert.match(validateState(db), /aula/); db.classes[0].roomId = 'r1';
  db.lessons = [lesson('l1', 'c1', 'r5', '14:00', '15:00')]; assert.match(validateState(db), /massimo 4 aule/);
});
test('all 10 rooms can run at once in the morning; an 11th room is rejected', () => {
  const db = blankState(); for(let i=1;i<=10;i++){ db.classes.push(course(`c${i}`)); db.lessons.push(lesson(`l${i}`,`c${i}`,`r${i}`)); }
  assert.equal(validateState(db), ''); db.lessons.push(lesson('l11','c1','r11'));
  assert.match(validateState(db), /massimo 10 aule/);
});
test('four simultaneous afternoon classes are valid', () => {
  const db = blankState();for(let i=1;i<=4;i++){db.classes.push(course(`c${i}`,'afternoon'));db.lessons.push(lesson(`l${i}`,`c${i}`,`r${i}`,'14:00','15:00'));}
  assert.equal(validateState(db),'');
});
test('room conflicts are blocked, including partial containment', () => {
  const db = fixture();db.classes.push(course('c2'));db.lessons=[lesson('l1','c1','r1','09:00','11:00'),lesson('l2','c2','r1','10:00','10:30')];
  assert.match(validateState(db), /aula è già occupata/);
});
test('touching end/start times are allowed in the same room', () => {
  const db = fixture();db.classes.push(course('c2'));db.lessons=[lesson('l1'),lesson('l2','c2','r1','10:00','11:00')];
  assert.equal(validateState(db),'');assert.equal(overlap(db.lessons[0],db.lessons[1]),false);
});
test('a class cannot be double-booked even in different rooms', () => {
  const db=fixture();db.lessons=[lesson('l1'),lesson('l2','c1','r2')];assert.match(validateState(db),/classe ha già una lezione/);
});
test('a teacher cannot be double-booked, including after a class reassignment', () => {
  const db=fixture();db.teachers=[teacher('t1'),teacher('t2')];db.classes[0].teacherId='t1';db.classes.push(course('c2','morning','t2'));
  db.lessons=[lesson('l1'),lesson('l2','c2','r2')];assert.equal(validateState(db),'');db.classes[1].teacherId='t1';assert.match(validateState(db),/docente ha già una lezione/);
});
test('lessons respect shift boundaries, including custom settings', () => {
  const db=fixture();db.lessons=[lesson('l1','c1','r1','12:30','13:30')];assert.match(validateState(db),/fascia mattino/);
  db.hours.morningEnd='14:00';assert.equal(validateState(db),'');db.hours.afternoonStart='13:30';assert.match(validateState(db),/sovrapporsi/);
});
test('lesson dates stay inside course dates', () => {
  const db=fixture();db.classes[0].startDate='2026-10-20';db.lessons=[lesson('l1')];assert.match(validateState(db),/date della classe/);
});
test('completed courses can retain their lesson history', () => {
  const db=fixture();db.classes[0].status='finished';db.lessons=[lesson('l1')];assert.equal(validateState(db),'');
});
test('archive validation rejects orphan references and duplicate IDs', () => {
  const db=fixture();db.students=[student('s1','missing')];assert.match(validateState(db),/classe assegnata/);
  db.students=[student('s1'),student('s1')];assert.match(validateState(db),/duplicati/);
  db.students=[];db.classes[0].teacherId='missing';assert.match(validateState(db),/docente assegnato/);
});
test('invalid dates, time ranges, and malformed archives are rejected', () => {
  assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2028-02-29'),true);assert.ok(validateState({version:1}));
  const db=fixture();db.lessons=[lesson('l1','c1','r1','10:00','09:00')];assert.match(validateState(db),/data e gli orari/);
  db.lessons=[lesson('l1','c1','r1','25:00','26:00')];assert.match(validateState(db),/data e gli orari/);
});
