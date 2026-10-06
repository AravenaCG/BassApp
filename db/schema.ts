import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const lessonCompletions = sqliteTable("lesson_completions", {
  userId: text("user_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  points: integer("points").notNull(),
  completedAt: text("completed_at").notNull(),
}, table => [primaryKey({ columns: [table.userId, table.lessonId] })]);
