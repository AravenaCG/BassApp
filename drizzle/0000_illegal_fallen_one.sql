CREATE TABLE `lesson_completions` (
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`points` integer NOT NULL,
	`completed_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`)
);
