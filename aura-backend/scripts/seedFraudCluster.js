// scripts/seedFraudCluster.js
// Dev-only seeder for the Risk & Fraud page. Fakes "the same physical device
// logged into N player accounts" so the multi-account detector produces a real
// cluster to click through, without needing N browsers.
//
//   node scripts/seedFraudCluster.js              # 3 accounts, device + IP link
//   node scripts/seedFraudCluster.js --count 4
//   node scripts/seedFraudCluster.js --users alice,bob
//   node scripts/seedFraudCluster.js --clean      # remove everything it seeded
//
// Seeded rows are all tagged with SEED_DEVICE_ID / SEED_IP so --clean is exact.

import dotenv from 'dotenv';
import mongoose from 'mongoose';

import FraudCluster from '../models/fraudClusterModel.js';
import LoginHistory from '../models/loginHistory.js';
import SubAdmin from '../models/subAdminModel.js';
import UserDevice from '../models/userDeviceModel.js';
import { evaluateKey } from '../services/fraudDetection.js';

dotenv.config();

// TEST-NET-3 (RFC 5737) — guaranteed never to be a real player's IP.
const SEED_DEVICE_ID = 'seed-device-multiacct-0001';
const SEED_IP = '203.0.113.77';
const SEED_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const flag = (name) => process.argv.includes(`--${name}`);

const connect = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing — run this from aura-backend/ with .env present');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to ${mongoose.connection.name}`);
};

const clean = async () => {
  const devices = await UserDevice.deleteMany({ deviceId: SEED_DEVICE_ID });
  const logins = await LoginHistory.deleteMany({ deviceId: SEED_DEVICE_ID });
  const clusters = await FraudCluster.deleteMany({
    $or: [
      { keyType: 'device', keyValue: SEED_DEVICE_ID },
      { keyType: 'ip', keyValue: SEED_IP },
    ],
  });
  console.log(
    `Removed ${devices.deletedCount} device link(s), ${logins.deletedCount} login row(s), ${clusters.deletedCount} cluster(s)`
  );
};

const pickAccounts = async () => {
  const names = arg('users');
  const query = { role: 'user', status: { $ne: 'delete' } };
  if (names) query.userName = { $in: names.split(',').map((n) => n.trim()) };

  const accounts = await SubAdmin.find(query)
    .select('userName email phone status')
    .limit(names ? 50 : Number(arg('count', 3)));

  if (accounts.length < 2) {
    console.error(
      `Need at least 2 player accounts (role: "user"), found ${accounts.length}.` +
        (names ? ' Check the --users names.' : ' Create some players first.')
    );
    process.exit(1);
  }
  return accounts;
};

const seed = async () => {
  const accounts = await pickAccounts();
  console.log(
    `Linking ${accounts.length} account(s) to one device:`,
    accounts.map((a) => a.userName).join(', ')
  );

  const now = Date.now();

  for (const [i, account] of accounts.entries()) {
    // Stagger lastSeen so the drawer's ordering is visibly meaningful.
    const lastSeen = new Date(now - i * 7 * 60 * 1000);

    await UserDevice.updateOne(
      { userId: account._id, deviceId: SEED_DEVICE_ID },
      {
        $set: {
          userName: account.userName,
          role: 'user',
          // 'client' scores +10: it means the browser actually reported this UUID.
          deviceSource: 'client',
          userAgent: SEED_UA,
          lastIp: SEED_IP,
          lastSeen,
          loginCount: 3 + i,
        },
        $addToSet: { ips: SEED_IP },
        $setOnInsert: { firstSeen: new Date(now - 3 * 24 * 60 * 60 * 1000) },
      },
      { upsert: true }
    );

    await LoginHistory.create({
      userName: account.userName,
      userId: account._id.toString(),
      status: 'success',
      dateTime: lastSeen.toISOString(),
      ip: SEED_IP,
      isp: 'Seeded ISP',
      city: 'Dhaka',
      region: 'Dhaka',
      country: 'Bangladesh',
      deviceId: SEED_DEVICE_ID,
      deviceSource: 'client',
      userAgent: SEED_UA,
    });
  }

  const byDevice = await evaluateKey('device', SEED_DEVICE_ID);
  const byIp = await evaluateKey('ip', SEED_IP);

  for (const result of [byDevice, byIp]) {
    if (!result) continue;
    const { cluster } = result;
    console.log(
      `  ${cluster.keyType.padEnd(6)} cluster ${cluster.clusterId}: ` +
        `${cluster.memberCount} members, risk ${cluster.riskScore}, signals [${cluster.signals}]`
    );
  }

  if (!byDevice && !byIp) {
    console.log('No cluster formed — accounts may not all have role "user".');
  }
};

const main = async () => {
  await connect();
  if (flag('clean')) await clean();
  else await seed();
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
