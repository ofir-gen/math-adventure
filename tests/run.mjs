// הרצת בדיקות הגנרטור מהטרמינל:  node tests/run.mjs [דגימות לשלב]
import { levels as noyaLevels, worlds as noyaWorlds, meta as noyaMeta } from '../js/curriculum/noya.js';
import { levels as alinLevels } from '../js/curriculum/alin.js';
import { checkLevel, checkExam } from './checks.js';

const N = Number(process.argv[2]) || 1000;
let failures = 0;

function report(id, title, errors) {
  if (errors.length === 0) {
    console.log(`✓ ${id} — ${title}`);
  } else {
    failures++;
    console.log(`✗ ${id} — ${title}\n    ${errors.slice(0, 5).join('\n    ')}`);
  }
}

console.log(`בדיקות גנרטור — ${N} דגימות לשלב\n`);
console.log('== נויה (כיתה ג׳) ==');
for (const level of noyaLevels) report(level.id, level.title, checkLevel(level, N));

console.log('\n== מבחנים ==');
for (const w of noyaWorlds) {
  const wl = noyaLevels.filter(l => l.world === w.n);
  report(`exam:${w.n}`, `מבחן ${w.name}`, checkExam(wl, noyaMeta.exam.questions));
}
report('exam:final', 'המבחן הגדול', checkExam(noyaLevels, noyaMeta.exam.finalQuestions));

console.log('\n== אלין ==');
for (const level of alinLevels) report(level.id, level.title, checkLevel(level, N));

console.log(failures ? `\n${failures} שלבים נכשלו` : '\nכל הבדיקות עברו ✓');
process.exit(failures ? 1 : 0);
