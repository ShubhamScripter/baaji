import 'dotenv/config';
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const coll = mongoose.connection.collection('subadmins');

  const docs = await coll
    .find({ $or: [{ email: { $exists: false } }, { email: null }, { email: '' }] })
    .toArray();

  console.log(`Found ${docs.length} sub-admin(s) missing email.\n`);

  for (const d of docs) {
    const email = `${d.userName}@aura444.com`;
    await coll.updateOne({ _id: d._id }, { $set: { email } });
    console.log(`Set ${d.userName} -> ${email}`);
  }

  // Verify none remain
  const remaining = await coll.countDocuments({
    $or: [{ email: { $exists: false } }, { email: null }, { email: '' }],
  });
  console.log(`\nRemaining without email: ${remaining}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
