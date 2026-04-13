-- CreateTable
CREATE TABLE "room_type_images" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "bytes" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "room_type_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "room_type_images_roomTypeId_idx" ON "room_type_images"("roomTypeId");

-- AddForeignKey
ALTER TABLE "room_type_images" ADD CONSTRAINT "room_type_images_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
