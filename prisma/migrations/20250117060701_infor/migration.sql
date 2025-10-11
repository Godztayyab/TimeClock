/*
  Warnings:

  - You are about to drop the column `roleId` on the `employee_departments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `employee_departments_roleId_idx` ON `employee_departments`;

-- AlterTable
ALTER TABLE `departments` ADD COLUMN `info` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `employee_departments` DROP COLUMN `roleId`;
