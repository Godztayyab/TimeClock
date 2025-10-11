/*
  Warnings:

  - You are about to drop the column `date` on the `department_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `shiftEnd` on the `department_schedules` table. All the data in the column will be lost.
  - You are about to drop the column `shiftStart` on the `department_schedules` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `department_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekEnd` to the `department_schedules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekStart` to the `department_schedules` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `department_schedules_date_idx` ON `department_schedules`;

-- AlterTable
ALTER TABLE `department_schedules` DROP COLUMN `date`,
    DROP COLUMN `shiftEnd`,
    DROP COLUMN `shiftStart`,
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL,
    ADD COLUMN `weekEnd` DATE NOT NULL,
    ADD COLUMN `weekStart` DATE NOT NULL;

-- AlterTable
ALTER TABLE `time_entries` MODIFY `status` ENUM('NOTSUBMITTED', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `time_off_requests` ADD COLUMN `replacementId` VARCHAR(191) NULL,
    MODIFY `status` ENUM('NOTSUBMITTED', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `work_shifts` (
    `id` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `startTime` TIME NOT NULL,
    `endTime` TIME NOT NULL,
    `isRecurring` BOOLEAN NOT NULL DEFAULT false,
    `scheduleId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `department_schedules_weekStart_weekEnd_idx` ON `department_schedules`(`weekStart`, `weekEnd`);

-- AddForeignKey
ALTER TABLE `time_off_requests` ADD CONSTRAINT `time_off_requests_replacementId_fkey` FOREIGN KEY (`replacementId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `department_schedules` ADD CONSTRAINT `department_schedules_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `work_shifts` ADD CONSTRAINT `work_shifts_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `department_schedules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
