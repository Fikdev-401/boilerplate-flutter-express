-- AlterTable
ALTER TABLE `User` ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `verificationToken` VARCHAR(191) NULL;
