/*
  Warnings:

  - You are about to alter the column `requestType` on the `time_off_requests` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(6))`.

*/
-- AlterTable
ALTER TABLE `time_off_requests` MODIFY `requestType` ENUM('VACATION', 'SICK', 'PERSONAL', 'UNPAID', 'OTHER') NOT NULL DEFAULT 'PERSONAL';
