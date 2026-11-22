-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "shopOpen" BOOLEAN NOT NULL DEFAULT false,
    "businessConfigured" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT NOT NULL DEFAULT '',
    "mapUrl" TEXT,
    "payeeName" TEXT NOT NULL DEFAULT 'Assam Tea Shop',
    "upiId" TEXT NOT NULL DEFAULT '',
    "staticQrUrl" TEXT,
    "deliveryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "deliveryFeePaise" INTEGER NOT NULL DEFAULT 0,
    "orderExpiryMinutes" INTEGER NOT NULL DEFAULT 15,
    "pickupIntervalMinutes" INTEGER NOT NULL DEFAULT 15,
    "starterDataMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BusinessSettings" ("address", "businessConfigured", "createdAt", "deliveryEnabled", "deliveryFeePaise", "id", "mapUrl", "orderExpiryMinutes", "payeeName", "pickupIntervalMinutes", "shopOpen", "starterDataMode", "staticQrUrl", "updatedAt") SELECT "address", "businessConfigured", "createdAt", "deliveryEnabled", "deliveryFeePaise", "id", "mapUrl", "orderExpiryMinutes", "payeeName", "pickupIntervalMinutes", "shopOpen", "starterDataMode", "staticQrUrl", "updatedAt" FROM "BusinessSettings";
DROP TABLE "BusinessSettings";
ALTER TABLE "new_BusinessSettings" RENAME TO "BusinessSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
