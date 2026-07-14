import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import http from 'http';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { cronJobGame1p } from './controllers/cronJobs.js';
import downlineRoutes from './routes/admin/downlineRoutes.js';
import manualResultRoutes from './routes/admin/manualResultRoutes.js';
import marketAnalizeRoutes from './routes/admin/marketAnalizeRoutes.js';
import matchSettingsRoutes from './routes/admin/matchSettingsRoute.js';
import riskRoutes from './routes/admin/riskRoutes.js';
import manualDepositRoutes from './routes/manualDepositRoutes.js';
import subRouteRoutes from './routes/admin/subAdminRoutes.js';
import betRoute from './routes/betRoute.js';
import casinoRoutes from './routes/casinoRoutes.js';
import crickeRoute from './routes/cricketRoutes.js';
import horseRacingRoutes from './routes/horseRacingRoutes.js';
import soccerRoutes from './routes/soccerRoutes.js';
import tennisRoutes from './routes/tennisRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cashoutRoute from './routes/cashoutRoute.js';
import { setupWebSocket } from './socket/bettingSocket.js';
import casinoRoutesNew from './routes/casinoRoutesNew.js'


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDistExists = fs.existsSync(path.join(__dirname, '../frontend/dist/index.html'));
const adminDistExists = fs.existsSync(path.join(__dirname, '../admin/dist/index.html'));

let APP_TYPE;
if (frontendDistExists && adminDistExists) {
  APP_TYPE = 'unified';
} else if (adminDistExists) {
  APP_TYPE = 'dashboard';
} else {
  APP_TYPE = 'frontend';
}

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'https://baajihub.com',
      'https://ag.baajihub.com',
      'http://baajihub.com',
      'http://ag.baajihub.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', true);
app.use(morgan('dev'));

// Additional settlement tracking middleware
app.use((req, res, next) => {
  const url = req.url;
  const method = req.method;

  next();
});

// Routes
app.use('/api', subRouteRoutes);
app.use('/api', downlineRoutes);
app.use('/api', userRoutes);
app.use('/api', betRoute);
app.use('/api', crickeRoute);
app.use('/api', soccerRoutes);
app.use('/api', tennisRoutes);
app.use('/api', horseRacingRoutes);
app.use('/api', casinoRoutes);
app.use('/api', marketAnalizeRoutes);
app.use('/api', matchSettingsRoutes);
app.use('/api', riskRoutes);
app.use('/api', manualResultRoutes);
app.use('/api', cashoutRoute);
app.use('/api', manualDepositRoutes);
app.use("/api/casino", casinoRoutesNew);
// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const ADMIN_PREFIX = process.env.ADMIN_SUBDOMAIN || 'ag.';
const frontendDist = path.join(__dirname, '../frontend/dist');
const adminDist = path.join(__dirname, '../admin/dist');

const serveFrontendStatic = express.static(frontendDist);
const serveAdminStatic = express.static(adminDist);

if (APP_TYPE === 'unified') {
  app.use((req, res, next) => {
    const hostname = req.hostname || '';
    if (hostname.startsWith(ADMIN_PREFIX)) {
      serveAdminStatic(req, res, next);
    } else {
      serveFrontendStatic(req, res, next);
    }
  });

  app.get('*', (req, res) => {
    const hostname = req.hostname || '';
    if (hostname.startsWith(ADMIN_PREFIX)) {
      res.sendFile(path.join(adminDist, 'index.html'));
    } else {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
} else if (APP_TYPE === 'dashboard') {
  app.use(serveAdminStatic);
  app.get('*', (req, res) =>
    res.sendFile(path.join(adminDist, 'index.html'))
  );
} else {
  app.use(serveFrontendStatic);
  app.get('*', (req, res) =>
    res.sendFile(path.join(frontendDist, 'index.html'))
  );
}

setupWebSocket(server);

// Settlement crons run in unified mode and in frontend-only mode
if (APP_TYPE !== 'dashboard') {
  cronJobGame1p();
  console.log('[CRON] Settlement crons started');
} else {
  console.log('[CRON] Settlement crons SKIPPED (dashboard-only process)');
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`[${APP_TYPE.toUpperCase()}] Server running on port ${PORT}`);
  if (APP_TYPE === 'unified') {
    console.log(`  Frontend: served on default hostname`);
    console.log(`  Admin:    served on ag.* subdomain`);
  }
});


// import express from "express";
// import http from "http";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import cookieParser from "cookie-parser";
// import bodyParser from "body-parser";
// import { fileURLToPath } from "url";
// import morgan from 'morgan'
// // import { updateAdmin } from "./controllers/admin/adminController.js";
// // import { updateAdmin } from "./controllers/cronJobs.js";
// import connectDB from "./config/db.js";
// import userRoutes from "./routes/userRoutes.js";
// import subRouteRoutes from "./routes/admin/subAdminRoutes.js";
// import downlineRoutes from "./routes/admin/downlineRoutes.js";
// import marketAnalizeRoutes from "./routes/admin/marketAnalizeRoutes.js";
// import crickeRoute from "./routes/cricketRoutes.js";
// import soccerRoutes from "./routes/soccerRoutes.js";
// import tennisRoutes from "./routes/tennisRoutes.js";
// import casinoRoutes from './routes/casinoRoutes.js'
// import betRoute from "./routes/betRoute.js";
// import matchOverrideRoutes from './routes/matchOverrideRoutes.js';

// import casinoRoutesNew from './routes/casinoRoutesNew.js'

// import streamingRoutes from "./routes/streamingRoutes.js";

// //For dev mode only
// import devRoutes from './routes/devRoutes.js'

// import { cronJobGame1p } from "./controllers/cronJobs.js";
// import { setupWebSocket } from "./socket/bettingSocket.js"; // ✅ New file for WebSocket

// dotenv.config();
// connectDB();
// cronJobGame1p();

// // updateAdmin()

// const app = express();
// const server = http.createServer(app);

// // Middleware
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "http://localhost:5174","http://localhost:5175","https://baajilive.com/","https://decision-least-hour-metres.trycloudflare.com/"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cookieParser());
// app.set("trust proxy", true);
// app.use(morgan('dev'))

// // Routes
// app.use("/api/stream", streamingRoutes);
// app.use("/api/casino", casinoRoutesNew);
// app.use("/api", subRouteRoutes);
// app.use("/api", downlineRoutes);
// app.use("/api", userRoutes);
// app.use("/api", betRoute);
// app.use("/api", crickeRoute);
// app.use("/api", soccerRoutes);
// app.use("/api", tennisRoutes);
// app.use("/api",casinoRoutes);
// app.use("/api",matchOverrideRoutes);

// app.use("/api", marketAnalizeRoutes); // Ensure this import is defined
// if (process.env.DEV_TEST_GAMES_ENABLED === "1") {
//   app.use("/api/dev", devRoutes);
// }

// // Static file serving
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use(express.static(path.join(__dirname, "../frontend/dist")));
// app.get("*", (req, res) =>
//   res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
// );
// // app.use(express.static(path.join(__dirname, "../client/dist")));
// // app.get("*", (req, res) =>
// //   res.sendFile(path.join(__dirname, "../client/dist/index.html"))
// // );

// //  Setup WebSocket
// setupWebSocket(server); // 🧠 Pass server to WebSocket file

// const PORT = process.env.PORT || 8000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

