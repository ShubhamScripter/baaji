import 'dotenv/config';
import mongoose from 'mongoose';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const coll = mongoose.connection.collection('subadmins');

  const missing = await coll
    .find({ $or: [{ email: { $exists: false } }, { email: null }, { email: '' }] })
    .project({ userName: 1, name: 1, role: 1, email: 1, code: 1 })
    .toArray();

  console.log(`Total sub-admins: ${await coll.countDocuments()}`);
  console.log(`Missing/empty email: ${missing.length}\n`);
  missing.forEach((d) =>
    console.log(`- ${d.userName} | name=${d.name} | role=${d.role} | code=${d.code} | email=${JSON.stringify(d.email)}`)
  );

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
