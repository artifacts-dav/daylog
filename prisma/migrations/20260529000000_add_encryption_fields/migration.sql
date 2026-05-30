-- AlterTable: add encryption fields to User (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='encryptionEnabled') THEN
    ALTER TABLE "User" ADD COLUMN "encryptionEnabled" BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='encryptionSalt') THEN
    ALTER TABLE "User" ADD COLUMN "encryptionSalt" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='encryptedDataLocked') THEN
    ALTER TABLE "User" ADD COLUMN "encryptedDataLocked" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- AlterTable: add encryptedKey to Session (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Session' AND column_name='encryptedKey') THEN
    ALTER TABLE "Session" ADD COLUMN "encryptedKey" TEXT;
  END IF;
END $$;
