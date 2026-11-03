// Adds 10 sample gyms in the Phoenix, AZ area, owned by one sample owner account.
// Run it with: npm run seed
// It is safe to run again: it replaces the sample owner's gyms and passes only.

import crypto from "node:crypto";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";

const OWNER_EMAIL = "seed-owner@example.com";

const gyms = [
  [
    "Desert Iron Fitness",
    "2201 N Central Ave",
    "Phoenix",
    "85004",
    "602-555-0101",
    15,
  ],
  [
    "Camelback Strength Club",
    "4350 E Camelback Rd",
    "Phoenix",
    "85018",
    "602-555-0102",
    20,
  ],
  [
    "Sun Valley Gym",
    "1802 W Indian School Rd",
    "Phoenix",
    "85015",
    "602-555-0103",
    0,
  ],
  [
    "Tempe Lakeside Fitness",
    "700 S Mill Ave",
    "Tempe",
    "85281",
    "480-555-0104",
    12,
  ],
  [
    "Old Town Athletic",
    "7330 E Main St",
    "Scottsdale",
    "85251",
    "480-555-0105",
    25,
  ],
  ["Mesa Power House", "55 W Main St", "Mesa", "85201", "480-555-0106", 10],
  [
    "Chandler Flex Studio",
    "250 E Chandler Blvd",
    "Chandler",
    "85225",
    "480-555-0107",
    18,
  ],
  [
    "Glendale Peak Performance",
    "5750 W Glendale Ave",
    "Glendale",
    "85301",
    "623-555-0108",
    14,
  ],
  [
    "Arcadia Wellness Lab",
    "3920 E Indian School Rd",
    "Phoenix",
    "85018",
    "602-555-0109",
    null,
  ],
  [
    "Paradise Valley Fit",
    "12801 N Tatum Blvd",
    "Phoenix",
    "85032",
    "602-555-0110",
    null,
  ],
].map(([name, street, city, zipCode, phone, price]) => ({
  name,
  address: { street, city, state: "AZ", zipCode },
  phone,
  // A null price means the gym does not offer a day pass.
  daypass: { available: price !== null, price: price ?? 0 },
}));

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
if (!uri || !dbName) {
  console.error(
    "MONGODB_URI and DB_NAME are required. Run this with: npm run seed",
  );
  process.exit(1);
}

await mongoose.connect(uri, { dbName });
try {
  const db = mongoose.connection.db;
  const now = new Date();

  const password = crypto.randomBytes(9).toString("base64url");
  const hashed = await bcryptjs.hash(password, 10);
  await db.collection("users").updateOne(
    { email: OWNER_EMAIL },
    {
      $set: { password: hashed, role: "owner", updatedAt: now },
      $setOnInsert: { email: OWNER_EMAIL, createdAt: now },
    },
    { upsert: true },
  );
  const owner = await db.collection("users").findOne({ email: OWNER_EMAIL });

  const old = await db
    .collection("gyms")
    .find({ ownerId: owner._id })
    .toArray();
  await db
    .collection("passes")
    .deleteMany({ gymId: { $in: old.map((gym) => gym._id) } });
  await db.collection("gyms").deleteMany({ ownerId: owner._id });

  await db.collection("gyms").insertMany(
    gyms.map((gym) => ({
      ...gym,
      ownerId: owner._id,
      createdAt: now,
      updatedAt: now,
    })),
  );

  console.log(`Added ${gyms.length} gyms to the "${dbName}" database.`);
  console.log(`Sample owner login: ${OWNER_EMAIL} / ${password}`);
} finally {
  await mongoose.disconnect();
}
