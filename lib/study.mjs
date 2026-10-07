export const LESSON_IDS = [
  ...Array.from({length:14},(_,i)=>`B${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:14},(_,i)=>`I${String(i+1).padStart(2,'0')}`),
  ...Array.from({length:12},(_,i)=>`A${String(i+1).padStart(2,'0')}`)
];
export function nextLesson(id, completed) {
  const later = LESSON_IDS.slice(LESSON_IDS.indexOf(id)+1).find(x=>!completed.includes(x));
  return later || LESSON_IDS.find(x=>!completed.includes(x)) || null;
}
export function sessionPlan(minutes=60) {
  const total = Math.max(5, Math.min(60, Math.round(minutes/Math.max(1,Math.ceil(minutes/30)))));
  const warmup = Math.max(1,Math.round(total*.2)), concept = Math.max(1,Math.round(total*.3));
  return {total,warmup,concept,play:total-warmup-concept};
}
export function reminderDue(user, now=new Date()) {
  if (!user.reminder_enabled) return false;
  if (user.reminder_snoozed_until && new Date(user.reminder_snoozed_until)>now) return false;
  const weekday = new Intl.DateTimeFormat('en-US',{weekday:'short',timeZone:user.time_zone || 'UTC'}).format(now);
  const day=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(weekday)+1;
  const last = user.last_reminder_at && new Date(user.last_reminder_at);
  const age = (now - new Date(user.created_at))/86400000;
  if (!last) return day===user.reminder_day || age>=7;
  const days = (now-last)/86400000;
  return days>=7 || (day===user.reminder_day && days>=6);
}
