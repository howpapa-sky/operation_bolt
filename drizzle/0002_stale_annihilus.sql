ALTER TABLE `projects` ADD `brand` varchar(255);--> statement-breakpoint
ALTER TABLE `projects` ADD `manufacturer` varchar(255);--> statement-breakpoint
ALTER TABLE `projects` ADD `round` int;--> statement-breakpoint
ALTER TABLE `projects` ADD `sampleCode` varchar(100);--> statement-breakpoint
ALTER TABLE `projects` ADD `projectSubtype` varchar(100);--> statement-breakpoint
ALTER TABLE `projects` ADD `evaluationScores` json;--> statement-breakpoint
ALTER TABLE `projects` ADD `evaluatorId` int;