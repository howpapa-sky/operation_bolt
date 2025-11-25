CREATE TABLE `ad_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('메타','네이버') NOT NULL,
	`campaignId` varchar(255) NOT NULL,
	`campaignName` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`impressions` int,
	`clicks` int,
	`spend` int,
	`conversions` int,
	`revenue` int,
	`roas` int,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automation_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`triggerType` enum('시간','이벤트','조건') NOT NULL,
	`triggerConfig` text,
	`actionType` enum('이메일','알림','태스크생성','리포트') NOT NULL,
	`actionConfig` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastRun` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automation_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencer_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencerId` int NOT NULL,
	`projectId` int,
	`campaignName` varchar(255) NOT NULL,
	`productName` varchar(255),
	`contractAmount` int,
	`postType` enum('피드','릴스','스토리','기타'),
	`postUrl` varchar(500),
	`postDate` timestamp,
	`likes` int,
	`comments` int,
	`views` int,
	`reach` int,
	`status` enum('계획','진행중','완료','취소') NOT NULL DEFAULT '계획',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `influencer_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`instagramHandle` varchar(255),
	`instagramId` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`followerCount` int,
	`category` varchar(100),
	`notes` text,
	`status` enum('활성','비활성','계약종료') NOT NULL DEFAULT '활성',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `influencers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('정보','경고','에러','성공') NOT NULL DEFAULT '정보',
	`title` varchar(255) NOT NULL,
	`message` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`relatedType` varchar(50),
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('대기','진행중','완료','보류') NOT NULL DEFAULT '대기',
	`priority` enum('높음','보통','낮음') DEFAULT '보통',
	`assignedTo` int,
	`dependsOn` int,
	`dueDate` timestamp,
	`completedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('샘플링','인플루언서','제품발주','상세페이지') NOT NULL,
	`status` enum('진행전','진행중','완료','보류') NOT NULL DEFAULT '진행전',
	`priority` enum('높음','보통','낮음') DEFAULT '보통',
	`description` text,
	`startDate` timestamp,
	`dueDate` timestamp,
	`completedDate` timestamp,
	`assignedTo` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('카페24','쿠팡','스마트스토어') NOT NULL,
	`orderId` varchar(255) NOT NULL,
	`orderDate` timestamp NOT NULL,
	`productName` varchar(255),
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`totalAmount` int NOT NULL,
	`status` enum('주문완료','배송중','배송완료','취소','환불') NOT NULL,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_data_id` PRIMARY KEY(`id`)
);
