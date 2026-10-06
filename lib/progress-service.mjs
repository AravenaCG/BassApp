export const LESSON_IDS = [
  ...Array.from({ length: 14 }, (_, i) => `B${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 14 }, (_, i) => `I${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 12 }, (_, i) => `A${String(i + 1).padStart(2, "0")}`),
];
export const LESSON_POINTS = 100;

export async function readProgress(db, userId) {
  const { results } = await db.prepare(
    "SELECT lesson_id AS lessonId, points, completed_at AS completedAt FROM lesson_completions WHERE user_id = ? ORDER BY completed_at, lesson_id"
  ).bind(userId).all();
  return {
    completed: results.map(row => row.lessonId),
    totalPoints: results.reduce((sum, row) => sum + row.points, 0),
    pointsPerLesson: LESSON_POINTS,
  };
}

export async function completeLesson(db, userId, lessonId) {
  if (!LESSON_IDS.includes(lessonId)) throw new Error("INVALID_LESSON");
  const result = await db.prepare(
    "INSERT INTO lesson_completions (user_id, lesson_id, points, completed_at) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, lesson_id) DO NOTHING"
  ).bind(userId, lessonId, LESSON_POINTS, new Date().toISOString()).run();
  return {
    ...(await readProgress(db, userId)),
    awardedPoints: result.meta.changes === 1 ? LESSON_POINTS : 0,
    nextLessonId: LESSON_IDS[LESSON_IDS.indexOf(lessonId) + 1] ?? null,
  };
}
