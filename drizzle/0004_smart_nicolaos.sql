ALTER TABLE `projects` ADD `projectSubtypes` json;--> statement-breakpoint
ALTER TABLE `projects` ADD `packagingTypes` json;--> statement-breakpoint
ALTER TABLE `projects` DROP COLUMN `projectSubtype`;