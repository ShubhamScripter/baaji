# Sports API — Full Flow (Provider C / 81club.fun)

This document explains the complete end-to-end flow for sports betting in the Baaji project when **Provider C** is active: how data is fetched from the external API, transformed in the backend, pushed to the frontend, how bets are placed per market type, and how results are settled.

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Configuration & Provider Selection](#2-configuration--provider-selection)
3. [Sport ID Mapping](#3-sport-id-mapping)
4. [Phase 1 — Fetching Match List from Provider C](#4-phase-1--fetching-match-list-from-provider-c)
5. [Phase 2 — Fetching Market/Odds Data](#5-phase-2--fetching-marketodds-data)
6. [Phase 3 — Backend → Frontend Delivery](#6-phase-3--backend--frontend-delivery)
7. [Phase 4 — Frontend Display](#7-phase-4--frontend-display)
8. [Phase 5 — Placing Bets (All Market Types)](#8-phase-5--placing-bets-all-market-types)
9. [Phase 6 — Result APIs & Bet Settlement](#9-phase-6--result-apis--bet-settlement)
10. [End-to-End Diagram](#10-end-to-end-diagram)
11. [Key File Reference](#11-key-file-reference)

---

## 1. Overview & Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Provider C (81club.fun)                              │
│   GET /esid          → match list                                           │
│   GET /getPriveteData → markets & odds per match                            │
│   POST /bet-incoming  → notify provider of new bets                         │
│   POST /get-result    → match-odds / bookmaker results                       │
│   GET  /fancyresult   → fancy market results                                │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     aura-backend (Node.js)                                  │
│   providerC.js      → fetch + normalize                                     │
│   *Controller.js    → REST endpoints for list + betting                     │
│   bettingSocket.js  → WebSocket poll (1s) + push live odds                  │
│   betController.js  → place bet, validate, settle                           │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
              REST (/api/cricket, /api/soccer, /api/tennis, /api/user/place-bet)
              WebSocket (bettingData, balance_update, exposure_update)
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     frontend (React + Redux)                                │
│   *Slice.js         → match list via REST                                   │
│   Fullmarket*.jsx   → markets via REST + WebSocket                          │
│   BetCard.jsx       → place bet via REST                                    │
│   wsClient.js       → shared WebSocket connection                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Configuration & Provider Selection

Provider C is activated via environment variable in `aura-backend/.env`:

| Variable | Purpose | Default |
|----------|---------|---------|
| `API_PROVIDER` | Set to `providerC` or `provider_c` | `providerA` |
| `PROVIDER_C_API_URL` | Base URL for 81club API | `https://81club.fun/api/v1` |
| `PROVIDER_C_API_KEY` | API key (sent as `key` query param) | Falls back to `API_KEY` |
| `PROVIDER_C_RESULT_API_URL` | Result API base (usually same as API URL) | Falls back to `RESULT_API_URL` → `API_URL` |
| `BASE_SCORE_URL` | Live score socket upstream | Falls back to `API_URL` |
| `DEV_MOCK_API` | `1` = use mock settlement results in dev | — |
| `APP_TYPE` | `dashboard` skips settlement cron registration | — |

**Provider factory:** `aura-backend/services/matchApi/index.js`

```js
// When API_PROVIDER=providerC, all calls route through createProviderC()
export const fetchMatchList = (sportId) => activeProvider.fetchMatchList(sportId);
export const fetchMatchData = (gameId, sportId) => activeProvider.fetchMatchData(gameId, sportId);
export const getResult = (payload) => activeProvider.getResult(payload);
export const sendBetIncoming = (payload) => activeProvider.sendBetIncoming(payload);
```

**Frontend media URLs** also use Provider C via `VITE_PROVIDER_C_API_URL` in `frontend/src/utils/sportsMediaUrls.js`.

---

## 3. Sport ID Mapping

The app uses internal sport IDs. Provider C API uses different IDs for cricket.

| App `sid` | Sport | Provider C API `sid` | Frontend `gameName` |
|-----------|-------|----------------------|---------------------|
| `4` | Cricket | `3` | `"Cricket Game"` |
| `1` | Soccer/Football | `1` | `"Soccer Game"` |
| `2` | Tennis | `2` | `"Tennis Game"` |

Conversion happens in `providerC.js` via `toApiSportId()` before every HTTP call to 81club. **Bets and frontend always use app IDs (1, 2, 4).**

---

## 4. Phase 1 — Fetching Match List from Provider C

### External API Call

```
GET {PROVIDER_C_API_URL}/esid?sid={apiSid}&key={API_KEY}
```

| Sport | App sid passed to controller | API sid sent to 81club |
|-------|------------------------------|------------------------|
| Cricket | 4 | 3 |
| Soccer | 1 | 1 |
| Tennis | 2 | 2 |

**Code:** `aura-backend/services/matchApi/providerC.js` → `fetchMatchList(sportId)`

### Raw Response Shapes (from 81club)

Provider C `/esid` can return three different formats:

1. **Flat cricket array** — `[{ gameId, eventName, back1, lay1, ... }, ...]`
2. **Wrapped tennis/soccer** — `{ body: [...] }`
3. **Already normalized** — `{ success, data: { t1, t2 } }`

### Normalization (`normalizeEsidMatch`)

All formats are converted to a unified structure:

```js
{
  success: true,
  data: {
    t1: [ /* active matches */ ],
    t2: [ /* secondary list, usually empty */ ]
  }
}
```

**Per-match normalized fields:**

| Output field | Source |
|--------------|--------|
| `gmid` | `gameId` or `gmid` |
| `oldgmid` | `oldgmid` or `gameId` or `gmid` |
| `beventId` | `beventId` or `oldgmid` |
| `ename` | `ename` / `eventName` (parsed from `"Team A / Team B / May 25..."`) |
| `stime` | `stime` or parsed from eventName → `"M/D/YYYY H:MM:SS AM/PM"` |
| `cname` | Competition/league name |
| `iplay` | `inPlay` or `iplay` (boolean) |
| `tv` | TV stream available |
| `bm` | Bookmaker available (`m1` or `bm`) |
| `f` | Fancy available |
| `section` | Structured odds array (see below) |

**Flat odds → structured section** (when provider sends `back1`/`lay1` instead of `section[]`):

```js
section: [
  {
    sid: 0,
    nat: "Team 1",
    odds: [
      { odds: 1.85, oname: "back1", otype: "back" },
      { odds: 1.90, oname: "lay1",  otype: "lay" }
    ]
  },
  {
    sid: 0,
    nat: "Team 2",
    odds: [
      { odds: 2.10, oname: "back1", otype: "back" },
      { odds: 2.15, oname: "lay1",  otype: "lay" }
    ]
  }
]
```

### Controller → Frontend List Format

Each sport controller maps normalized data to a frontend-friendly shape.

**Cricket** — `GET /api/cricket/matches` (`cricketController.js`):

```js
{
  success: true,
  matches: [{
    id: beventId || oldgmid || gmid,   // used in URL navigation
    beventId,
    match: ename,                       // "Team A v Team B"
    date: stime,
    cname,                              // league name
    channels: [],
    odds: [
      { home: back1, away: lay1, gstatus },
      { home: "0", away: "0", gstatus },  // spacer
      { home: back1_team2, away: lay1_team2, gstatus }
    ],
    inplay: iplay,
    status
  }]
}
```

**Soccer** — `GET /api/soccer` (`soccerController.js`):

```js
{
  success: true,
  data: [{
    id: gmid,
    beventId,
    match: ename,
    date: stime,
    cname,
    iplay,
    channels: f ? ["F"] : [],
    odds: [{ home, away }, { home: "0", away: "0" }, ...]
  }]
}
```

**Tennis** — `GET /api/tennis` — same pattern as soccer.

> **Important ID note:** Cricket list uses `beventId` as `id`. Soccer/Tennis use `gmid`. The full-market page passes this `id` as `gameid` in the URL.

---

## 5. Phase 2 — Fetching Market/Odds Data

### External API Call

```
GET {PROVIDER_C_API_URL}/getPriveteData?key={API_KEY}&gmid={gmid}&sid={apiSid}
```

**Code:** `providerC.js` → `fetchMatchData(gameId, sportId)`

### GMID Resolution Logic

The UI may pass `beventId`, `oldgmid`, or `gmid` as `gameId`. Provider C needs the correct `gmid`:

1. Check 5-minute cache for `apiSid:gameId` → use cached `gmid`
2. Try `gameId` directly against `/getPriveteData`
3. On 404, re-fetch `/esid`, find match where `gmid` / `oldgmid` / `beventId` matches
4. Retry `/getPriveteData` with resolved `gmid`
5. Cache resolved `gmid` for 5 minutes

### Raw Provider Response (markets)

```js
{
  success: true,
  data: [
    {
      mname: "Match Odds",       // market name
      mid: "12345678",           // market id
      gmid: "987654",
      status: "OPEN",
      gstatus: "ACTIVE",
      max: 500000,
      min: 100,
      section: [
        {
          sid: "1234",           // selection/runner id (used as fancyId for fancy markets)
          nat: "India",          // runner/selection name
          gstatus: "ACTIVE",
          status: "ACTIVE",
          odds: [
            { odds: 1.85, size: 0, oname: "back1", otype: "back", tno: 0 },
            { odds: 1.90, size: 0, oname: "lay1",  otype: "lay",  tno: 0 }
          ]
        },
        {
          sid: "5678",
          nat: "Australia",
          odds: [ ... ]
        }
      ]
    },
    {
      mname: "Bookmaker",
      section: [ ... ]
    },
    {
      mname: "Normal",           // fancy market
      mtype: "INNINGS_RUNS",
      section: [
        {
          sid: "fancy123",
          nat: "6 over runs IND",
          odds: [
            { odds: 45, size: 100, oname: "back1", otype: "back" },  // Yes
            { odds: 45, size: 100, oname: "lay1",  otype: "lay" }    // No
          ]
        }
      ]
    }
  ]
}
```

### Common Market Names (`mname` / `mtype`)

| Market | `mname` / `mtype` values | Used for |
|--------|--------------------------|----------|
| Match Odds | `Match Odds`, `MATCH_ODDS` | Standard match winner |
| Bookmaker | `Bookmaker`, `BOOKMAKER` | Bookmaker odds (percentage-based) |
| Tied Match | `Tied Match`, `TIED_MATCH` | Cricket tied match |
| Fancy | `Normal`, `INNINGS_RUNS` | Session/runs fancy |
| Odd/Even | `oddeven` | Odd/even runs |
| Fancy1 | `fancy1` | Yes/No proposition |
| Over/Under | `Total`, id contains `total=0.5` etc. | Soccer goals |
| Sportbook | `MATCH_ODDS_SB` | Sportsbook odd/even |

---

## 6. Phase 3 — Backend → Frontend Delivery

### 6.1 REST Endpoints (initial load)

| Route | Controller | Provider call |
|-------|------------|---------------|
| `GET /api/cricket/matches` | `getCricketData` | `fetchMatchList(4)` |
| `GET /api/cricket/betting?gameid=` | `fetchCrirketBettingData` | `fetchMatchData(gameid, 4)` |
| `GET /api/soccer` | `fetchSoccerData` | `fetchMatchList(1)` |
| `GET /api/soccer/betting?gameid=` | `fetchsoccerBettingData` | `fetchMatchData(gameid, 1)` |
| `GET /api/tennis` | `fetchTennisData` | `fetchMatchList(2)` |
| `GET /api/tannis/betting?gameid=` | `fetchTannisBettingData` | `fetchMatchData(gameid, 2)` |

**Betting REST response shape:**

```js
{
  success: true,
  data: {
    success: true,
    data: [ /* array of market objects from getPriveteData */ ]
  }
}
```

Frontend `normalizeBettingMarkets()` in `cricketSlice.js` unwraps nested `data.data` to the markets array.

**Cricket betting cache:** 4-second in-memory cache in `cricketController.js`.

### 6.2 WebSocket (live odds updates)

**File:** `aura-backend/socket/bettingSocket.js`

**Client → Server messages:**

| `type` | Fields | Purpose |
|--------|--------|---------|
| `subscribe` | `gameid`, `apitype` (`cricket`/`soccer`/`tennis`), optional `userId` | Subscribe to live odds for a match |
| `register` | `userId` | Account-level updates (balance, exposure) |

**Server → Client messages (sports odds):**

```js
{
  type: "bettingData",
  gameid: "12345678",
  apitype: "cricket",   // or "soccer" | "tennis"
  data: [ /* markets array — same shape as getPriveteData data */ ]
}
```

**Polling:** `setInterval(pollBettingData, 1000)` — every **1 second** per unique `gameid_apitype` subscription. Only sends when JSON payload changes (deduplication via cache).

**On subscribe:** Immediate `fetchMatchData()` + push (no wait for first poll tick).

**Account events after bet placement/settlement:**

| Event | Payload |
|-------|---------|
| `balance_update` | `{ type, userId, newBalance }` |
| `exposure_update` | `{ type, userId, newExposure }` |
| `open_bets_update` | `{ type, userId, newOpenBets }` |
| `cashout_update` | `{ type, userId, bets: [{ betId, cashoutValue }] }` |
| `user_refresh_needed` | `{ type, userId }` |

**Frontend WebSocket client:** `frontend/src/utils/wsClient.js` — singleton at `ws://localhost:3000` (or `VITE_API_BASE_URL` host).

```js
// Subscribe on full market page mount
wsClient.send({ type: "subscribe", gameid, apitype: "cricket" });

// Listen for updates
wsClient.subscribe((message) => {
  if (message.type === "bettingData" && String(message.gameid) === String(gameid)) {
    setBettingData(message.data);
  }
});
```

---

## 7. Phase 4 — Frontend Display

### 7.1 Sports List Pages

| Page | Redux state | REST endpoint | Navigate to |
|------|-------------|---------------|-------------|
| `Sports.jsx` | dispatches all three | — | tab filter |
| `Cricket.jsx` | `state.cricket.matches` | `GET /cricket/matches` | `/sports/fullmarket/{match}/{id}` |
| `Soccer.jsx` | `state.soccer.soccerData` | `GET /soccer` | `/sports/soccer/{match}/{id}` |
| `Tennis.jsx` | `state.tennis.data` | `GET /tennis` | `/sports/tennis/{match}/{id}` |

**Display fields:** `title` (league), `match` (teams), `date`, `inplay` badge.

### 7.2 Full Market Pages

| Route | Component | Sport | `sid` | `apitype` |
|-------|-----------|-------|-------|-----------|
| `/sports/fullmarket/:match/:gameid` | `Fullmarkett.jsx` | Cricket | 4 | `cricket` |
| `/sports/soccer/:match/:gameid` | `Fullmarket1.jsx` | Soccer | 1 | `soccer` |
| `/sports/tennis/:match/:gameid` | `Fullmarket2.jsx` | Tennis | 2 | `tennis` |

### Load Sequence (all full market pages)

```
1. Mount page with gameid from URL
2. wsClient.send({ type: "subscribe", gameid, apitype })
3. REST: dispatch(fetch*BattingData(gameid))  → seeds Redux battingData
4. WebSocket: on bettingData → setBettingData(local state)
5. dataSource = bettingData.length > 0 ? bettingData : battingData  (socket preferred)
6. Filter dataSource into market lists by mname/mtype
7. normalizeRunnersToSection() if runners[] format detected
8. Render market components (Matchodds, Bookmakers, Fancybet, etc.)
```

### Market Segmentation by Page

**Cricket (`Fullmarkett.jsx`):**
- `matchOddsList` — `mname` = Match Odds / MATCH_ODDS
- `tiedMatchList` — Tied Match / TIED_MATCH
- `BookmakerList` — BOOKMAKER / Bookmaker
- `fancy1Data` — `mtype === "INNINGS_RUNS"` or `mname === "Normal"`
- `sportsbookData` — `mtype === "MATCH_ODDS_SB"`
- `oddevenData` — `mname === "oddeven"`

**Soccer (`Fullmarket1.jsx`):**
- `matchOddsList` — Match Odds
- `soccerOver05List` — `name === "Total"` and `id` contains `"total=0.5"`
- `soccerOver15List` — id contains `"total=1.5"`
- `soccerOver25List` — id contains `"total=2.5"`
- `BookmakerList` — `name === "BOOKMAKER"`

**Tennis (`Fullmarket2.jsx`):**
- `matchOddsList` — Match Odds
- `BookmakerList` — BOOKMAKER

### Live Stream & Scorecard

`frontend/src/utils/sportsMediaUrls.js` builds URLs directly against 81club:

| Media | URL pattern |
|-------|-------------|
| Live stream | `/live-stream?gmid={gmid}&key={key}` |
| Cricket score | `/live-score?key=&gmid=` |
| Soccer scorecard | `/live-scorecard?key=&gmid=&sportid=1` |
| Tennis scorecard | `/live-scorecard?key=&gmid=&sportid=2` |

---

## 8. Phase 5 — Placing Bets (All Market Types)

### 8.1 Bet Flow

```
User clicks odds cell
    → openBetSlip(betData) on Fullmarket page
    → BetCard modal opens with odds prop
    → User enters stake
    → handlePlaceBet() builds formData
    → dispatch(createBet) or dispatch(createfancyBet)
    → POST /api/user/place-bet or /api/user/place-fancy-bet
    → Backend validates against live Provider C data
    → Saves to betModel, notifies Provider C (first bet per market)
    → WebSocket: balance_update, exposure_update, open_bets_update
```

### 8.2 API Endpoints

| Endpoint | Handler | Used for |
|----------|---------|----------|
| `POST /api/user/place-bet` | `placeBetUnified` → `placeBet` | Match Odds, Bookmaker, Over/Under, fancy1, oddeven, Toss, etc. |
| `POST /api/user/place-fancy-bet` | `placeFancyBet` | Normal, meter, line, ball, khado |

Both require `authMiddleware` (Bearer token / cookie).

### 8.3 Request Body Format (Frontend → Backend)

Built in `BetCard.jsx` → `handlePlaceBet()`:

```js
{
  gameId: "12345678",           // from URL params
  sid: 4,                       // 4=cricket, 1=soccer, 2=tennis
  otype: "back",                // "back" | "lay"
  price: 100,                   // stake amount
  xValue: 1.85,                 // odds OR size (see rules below)
  gameType: "Match Odds",       // market type string
  gameName: "Cricket Game",     // sport lock check
  teamName: "India",            // selection/runner name
  marketName: "Match Odds",     // market label
  eventName: "India v Australia", // match name from URL
  marketId: "12345678",         // provider market id (optional)
  fancyScore: "45",             // line/score for fancy bets (null for bookmaker)
  oname: "back1"                // "back1" | "lay1" (fancy markets)
}
```

### 8.4 `xValue` Rules (Frontend)

| Market type | `xValue` sent | Meaning |
|-------------|---------------|---------|
| Fancy (`Normal`, `meter`, `line`, `ball`, `khado`) | `odds.xValue` (the **size**, not displayed score) | Liability multiplier |
| Bookmaker | `String(betOdds)` — user-adjustable | Percentage odds |
| Match Odds, Over/Under, Sportbook, fancy1, oddeven | `parseFloat(betOdds)` | Decimal odds |

### 8.5 Endpoint Routing (Frontend)

```js
const fancyGameTypes = new Set(['Normal', 'meter', 'line', 'ball', 'khado']);
if (fancyGameTypes.has(formData.gameType)) {
  dispatch(createfancyBet(formData));   // POST /user/place-fancy-bet
} else {
  dispatch(createBet(formData));        // POST /user/place-bet
}
```

### 8.6 Market Type Reference Table

| Market | `gameType` | `marketName` | Endpoint | `xValue` | Liability formula (backend) |
|--------|-----------|--------------|----------|----------|----------------------------|
| Match Odds | `"Match Odds"` | `"Match Odds"` | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |
| Tied Match | `"Tied Match"` | `"Tied Match"` | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |
| Bookmaker | `"Bookmaker"` | `"Bookmaker"` | place-bet | percentage odds | back: `p*(x/100)`, lay: `p` |
| Bookmaker IPL CUP | `"Bookmaker IPL CUP"` | same | place-bet | percentage | same as bookmaker |
| Toss | `"Toss"` | `"Toss"` | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |
| 1st 6 over | `"1st 6 over"` | same | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |
| Over 0.5 | `"OVER_UNDER_05"` | `"OVER_UNDER_05"` | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |
| Over 1.5 | `"OVER_UNDER_15"` | `"OVER_UNDER_15"` | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |
| Over 2.5 | `"OVER_UNDER_25"` | `"OVER_UNDER_25"` | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |
| Winner | `"Winner"` | same | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |
| Fancy Normal | `"Normal"` | runner title | place-fancy-bet | size | back: `p*(x/100)`, lay: `p` |
| Fancy meter | `"meter"` | same | place-fancy-bet | size | back: `p*(x/100)`, lay: `p` |
| Fancy line | `"line"` | same | place-fancy-bet | size | back: `p*(x/100)`, lay: `p` |
| Fancy ball | `"ball"` | same | place-fancy-bet | size | back: `p*(x/100)`, lay: `p` |
| Fancy khado | `"khado"` | same | place-fancy-bet | size | back: `p*(x/100)`, lay: `p` |
| Fancy1 (yes/no) | `"fancy1"` | proposition name | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |
| Odd/Even | `"oddeven"` | section title | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |
| Sportbook | `"MATCH_ODDS_SB"` | section title | place-bet | decimal odds | back: `p*(x-1)`, lay: `p` |

### 8.7 Backend Validation Pipeline (`placeBet`)

**File:** `aura-backend/controllers/betController.js`

```
1. Required fields check: gameId, sid, price, xValue, gameName, teamName
2. checkMarketVisibilityLock() — admin match/market locks
3. validateSportsMarket() — fresh fetchMatchData() from Provider C:
   - Find market by mname (with alias: "Match Odds" ↔ "MATCH_ODDS")
   - Check status/gstatus not SUSPENDED
   - Match selection nat to teamName
   - Verify live odds match xValue within ±0.01
   - Return marketMeta: { mid, gmid, fancyId: section.sid, runners }
4. User exists + sport not locked (user.gamelock)
5. user.secret === 0 → fake success (demo mode)
6. Min odds: xValue >= 1.01
7. Balance + exposure limit checks
8. Save bet to betModel
9. Notify Provider C (first bet only per gameId+eventName+marketName)
10. WebSocket balance/exposure/open_bets updates
```

### 8.8 Saved Bet Document (`betModel`)

Key fields stored in MongoDB:

```js
{
  userId: ObjectId,
  gameId: "12345678",
  sid: 4,
  price: 100,              // stake
  betAmount: 85,           // liability/exposure amount
  xValue: 1.85,
  otype: "back",
  fancyScore: "45",        // fancy line (or null)
  gameType: "Match Odds",
  eventName: "India v Australia",
  marketName: "Match Odds",
  gameName: "Cricket Game",
  teamName: "India",
  market_id: "87654321",   // random or from provider meta.mid
  fancyId: "1234",         // section.sid for fancy/fancy1/oddeven
  status: 0,               // 0=open, 1=won, 2=lost, 3=void
  betType: "sports",       // or "fancy"
  isCashedOut: false,
  createdAt: Date
}
```

### 8.9 Provider C Bet Notification (`sendBetIncoming`)

Called only on the **first bet** for a unique `{ gameId, eventName, marketName }` combination.

**Standard markets** → `POST /bet-incoming?key=`:

```js
{
  api_key: "...",
  event_id: "987654",           // meta.gmid || gameId
  event_name: "India v Australia",
  market_id: "12345678",        // meta.mid
  market_name: "MATCH_ODDS",    // toApiMarketName() converts "Match Odds" → "MATCH_ODDS"
  market_type: "Match Odds",    // gameType
  client_ref: null,
  sport_id: "3",                // API sid (cricket 4→3)
  fancyId: null,
  fancymid: "12345678",
  bevent_id: "12345678",
  runners: [{ selectionId, selectionName }]
}
```

**Fancy / fancy1 / oddeven** → same endpoint, different payload:

```js
{
  api_key: "...",
  sport_id: "3",
  sportName: "Cricket",
  event_id: "987654",
  beventId: "12345678",
  event_name: "India v Australia",
  fancyId: "1234",              // section.sid from market validation
  market_name: "6 over runs IND",
  fancyType: "Normal"           // or "fancy1", "oddeven", "meter", etc.
}
```

> API failures for standard bets are logged but do **not** block bet save. Fancy bet first-notification failure returns HTTP 502.

---

## 9. Phase 6 — Result APIs & Bet Settlement

### 9.1 Provider C Result Endpoints

| Endpoint | Method | Used for |
|----------|--------|----------|
| `/cricket/fancybyevent?eventId=&key=` | GET | Cricket fancy results lookup |
| `/stfancybyevent?eventId=&key=` | GET | Soccer fancy results |
| `/tennis/fancybyevent?eventId=&key=` | GET | Tennis fancy results |
| `/get-result?key=` | POST | Match odds, bookmaker, over/under results |
| `/fancyresult?key=&eventId=&fancyId=` | GET | Individual fancy result by fancyId |
| `/fancyresultbyeventId?eventId=&key=` | GET | Bulk cricket fancy results |
| `/stfancyresultbyeventId?eventId=&key=` | GET | Bulk soccer fancy results |

### 9.2 Sports Result API — Request Format

Called by `updateResultOfBets` via `providerC.getResult(payload)`:

**Request payload (sent to Provider C):**

```js
{
  event_id: 12345678,           // Number(bet.gameId)
  event_name: "India v Australia",
  market_id: "87654321",        // bet.market_id
  market_name: "MATCH_ODDS",    // toApiMarketName(bet.marketName)
  client_ref: null,
  sport_id: 4                   // app sid (4=cricket, 1=soccer, 2=tennis)
}
```

**Provider C `getResult()` flow:**

```
1. Try sport-specific fancy-by-event GET:
   - Cricket (sid=4): GET /cricket/fancybyevent?eventId={event_id}
   - Soccer  (sid=1): GET /stfancybyevent?eventId={event_id}
   - Tennis  (sid=2): GET /tennis/fancybyevent?eventId={event_id}

2. Search results array for entry where:
   - isResult === true
   - fancyType OR fancyName matches market_name (case-insensitive)

3. If found → return { final_result: match.result }

4. Else fallback → POST /get-result?key= with full payload above
```

**Response format you receive from result API:**

```js
// Standard sports markets (Match Odds, Bookmaker, Over/Under, etc.)
{
  final_result: "India"          // winning team/selection name
}

// Special values (case-insensitive):
{
  final_result: "void"           // all bets voided, stake returned
}
{
  final_result: "tied"           // tied match settlement
}
```

### 9.3 Fancy Result API — Request & Response

**Request (Provider C path when bet has `fancyId`):**

```
GET /fancyresult?key={API_KEY}&eventId={gameId}&fancyId={fancyId}
```

**Response format:**

```js
{
  result: "47"                   // actual score/runs (number as string)
}

// Or for fancy1 yes/no markets:
{
  result: "1"                    // "1" = Yes won, "0" = No won
}

// Void:
{
  result: "void"
}
```

**Fancy-by-event bulk response** (from `/cricket/fancybyevent`):

```js
[
  {
    fancyId: "1234",
    fancyName: "6 over runs IND",
    fancyType: "Normal",
    result: "47",
    isResult: true
  },
  {
    fancyId: "5678",
    fancyName: "10 over runs AUS",
    fancyType: "Normal",
    result: null,
    isResult: false
  }
]
```

### 9.4 Sports Settlement — `updateResultOfBets`

**File:** `aura-backend/controllers/betController.js`

**Settles these `gameType` values:**
`Toss`, `1st 6 over`, `Match Odds`, `Tied Match`, `Bookmaker`, `Bookmaker IPL CUP`, `OVER_UNDER_05`, `OVER_UNDER_15`, `OVER_UNDER_25`

**Settlement flow:**

```
1. Find all betModel where status=0 and gameType in list above
2. Group bets by gameId_marketName (one API call per group)
3. For each group, call apiGetResult(payload)
4. If final_result present:
   - "void"  → voidSportsBet() — return stake
   - "tied"  → tiedSportsBet() — special tied logic
   - else    → settleSportsBet() — compare bet.teamName to final_result
5. Atomic findOneAndUpdate({ status: 0 }) prevents double settlement
6. $inc user balance + bettingProfitLoss
7. Update betHistoryModel rows
8. Recalculate exposure
9. WebSocket: balance_update, exposure_update, open_bets_update
10. updateAllUplines() for agent hierarchy P/L
```

**Win/loss logic (`settleSportsBet`):**
- `bet.teamName === winner` → status=1 (won), credit profit
- `bet.teamName !== winner` → status=2 (lost), debit liability
- Back bet profit: `price * (xValue - 1)` for match odds; `price * (xValue/100)` for bookmaker
- Lay bet profit: `price` if selection loses

### 9.5 Fancy Settlement — `updateFancyBetResult`

**Settles these `gameType` values:**
`Normal`, `meter`, `line`, `ball`, `khado`, `fancy1`, `oddeven`

**Settlement flow per bet:**

```
1. If bet.fancyId present (Provider C):
   GET /fancyresult?eventId={gameId}&fancyId={fancyId}
   → score = response.result

2. Else fallback:
   apiGetResult(payload) → score = response.final_result

3. Settlement by gameType:
   - "void"           → voidFancyBet (stake returned)
   - "fancy1"         → settleFancy1Bet: result "1"=Yes, "0"=No vs teamName
   - "oddeven"        → settleOddEvenBet: parity of result vs "Odd"/"Even"
   - Normal/meter/line/ball/khado:
       back wins if actualScore >= fancyScore (bet line)
       lay wins if actualScore < fancyScore
```

**Example fancy settlement:**
- Bet: back on "6 over runs IND", fancyScore=45, xValue=100, price=100
- Result API returns: `{ result: "47" }`
- 47 >= 45 → back bet WINS
- Profit = price * (xValue/100) = 100 * 1 = 100

### 9.6 Cron Jobs (Automatic Settlement)

**File:** `aura-backend/controllers/cronJobs.js`

| Cron | Interval | Function | Current status |
|------|----------|----------|----------------|
| Sports | Every 1 minute | `updateResultOfBets` | **DISABLED** (`return;` at line 36) |
| Fancy | Every 10 seconds | `updateFancyBetResult` | **DISABLED** (`return;` at line 43) |
| Casino | Every 2 seconds | `updateResultOfCasinoBets` | **DISABLED** |
| Reconcile | Every 60 seconds | `reconcileOrphanedBetHistory` | **ACTIVE** |

> **Important:** Settlement crons are currently disabled. Results must be triggered manually or by re-enabling the crons.

**Manual triggers:**
- Dev: `POST /api/dev/settle-now` (when `DEV_TEST_GAMES_ENABLED=1`)
- Admin panel: `POST /api/manual-result/settle` — admin enters winner manually

### 9.7 Manual Settlement (Admin)

**Routes:** `aura-backend/routes/admin/manualResultRoutes.js`

| Route | Purpose |
|-------|---------|
| `GET /api/manual-result/pending-games` | List games with unsettled bets |
| `GET /api/manual-result/unsettled-bets` | Bet details per game/market |
| `POST /api/manual-result/settle` | Admin enters winner/score, settles all bets |
| `POST /api/manual-result/void` | Void all bets for a game/market |

Uses `sportsSettlementService` / `fancyBetSettlementService` directly — **no Provider C API call**.

### 9.8 Post-Settlement WebSocket Events

After any settlement, affected users receive:

```js
{ type: "balance_update",    userId, newBalance }
{ type: "exposure_update",   userId, newExposure }
{ type: "open_bets_update", userId, newOpenBets }
```

Frontend `HeaderLogin.jsx` listens and refreshes balance display.

---

## 10. End-to-End Diagram

```
┌──────────┐     GET /esid          ┌──────────────┐
│ 81club   │◄──────────────────────│  providerC   │
│  .fun    │     GET /getPriveteData│  .js         │
│          │◄──────────────────────│              │
│          │     POST /bet-incoming │              │
│          │◄──────────────────────│              │
│          │     POST /get-result   │              │
│          │◄──────────────────────│              │
│          │     GET /fancyresult   │              │
│          │◄──────────────────────│              │
└──────────┘                        └──────┬───────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
            cricketController      bettingSocket.js        betController.js
            soccerController       (1s poll + WS push)     (place + settle)
            tennisController
                    │                      │                      │
                    ▼                      ▼                      ▼
            GET /api/cricket/*     WS bettingData           POST /api/user/place-bet
            GET /api/soccer/*        WS balance_update        POST /api/user/place-fancy-bet
            GET /api/tennis/*        WS exposure_update       updateResultOfBets (cron)
                    │                      │                 updateFancyBetResult (cron)
                    └──────────────────────┼──────────────────────┘
                                           ▼
                              ┌────────────────────────┐
                              │      frontend React     │
                              │  Redux slices (lists)   │
                              │  Fullmarket*.jsx (odds) │
                              │  BetCard.jsx (place bet)│
                              │  wsClient.js (live WS)  │
                              └────────────────────────┘
```

### Complete User Journey

```
1. User opens /sports
   → Redux fetches GET /cricket/matches, /soccer, /tennis
   → Match list displayed

2. User clicks a cricket match
   → Navigate to /sports/fullmarket/{matchName}/{gameId}
   → REST: GET /cricket/betting?gameid={gameId} (initial markets)
   → WS: subscribe { gameid, apitype: "cricket" }
   → WS: receive bettingData every ~1s (live odds)
   → Markets rendered: Match Odds, Bookmaker, Fancy, etc.

3. User clicks Back on "India" at 1.85 in Match Odds
   → BetCard opens with selection="India", odds=1.85, gameType="Match Odds"
   → User enters stake 100, clicks Place Bet
   → POST /api/user/place-bet with formData
   → Backend fetches live data, validates odds=1.85, checks balance
   → Saves bet (status=0), notifies 81club /bet-incoming (if first bet)
   → WS: balance_update, exposure_update

4. Match ends — settlement runs (cron or manual)
   → updateResultOfBets groups bets by gameId+marketName
   → POST /get-result { event_id, market_name: "MATCH_ODDS", sport_id: 4 }
   → Response: { final_result: "India" }
   → bet.teamName "India" === winner → status=1 (WON)
   → User balance credited with profit
   → WS: balance_update, exposure_update, open_bets_update
```

---

## 11. Key File Reference

### Backend

| File | Role |
|------|------|
| `aura-backend/services/matchApi/providerC.js` | All Provider C HTTP calls + data normalization |
| `aura-backend/services/matchApi/index.js` | Provider factory (A/B/C switch) |
| `aura-backend/controllers/cricketController.js` | Cricket list + betting REST |
| `aura-backend/controllers/soccerController.js` | Soccer list + betting REST |
| `aura-backend/controllers/tennisController.js` | Tennis list + betting REST |
| `aura-backend/socket/bettingSocket.js` | WebSocket subscribe/poll/push live odds |
| `aura-backend/controllers/betController.js` | Place bet, validate, settle results |
| `aura-backend/utils/marketValidation.js` | Live odds validation against Provider C |
| `aura-backend/services/sportsSettlementService.js` | Match-odds P/L calculation |
| `aura-backend/services/fancyBetSettlementService.js` | Fancy P/L calculation |
| `aura-backend/controllers/cronJobs.js` | Settlement scheduler (currently disabled) |
| `aura-backend/controllers/admin/manualResultController.js` | Manual admin settlement |
| `aura-backend/routes/betRoute.js` | Bet API routes |

### Frontend

| File | Role |
|------|------|
| `frontend/src/features/sports/cricketSlice.js` | Cricket match list + betting REST |
| `frontend/src/features/sports/soccerSlice.js` | Soccer match list + betting REST |
| `frontend/src/features/sports/tennisSlice.js` | Tennis match list + betting REST |
| `frontend/src/features/sports/betReducer.js` | Bet placement + history REST |
| `frontend/src/pages/sports/Sports.jsx` | Sports hub page |
| `frontend/src/pages/sports/Fullmarkett.jsx` | Cricket full market |
| `frontend/src/pages/sports/Fullmarket1.jsx` | Soccer full market |
| `frontend/src/pages/sports/Fullmarket2.jsx` | Tennis full market |
| `frontend/src/pages/sports/BetCard.jsx` | Bet slip modal + place bet |
| `frontend/src/components/leaguescomp/Matchodds.jsx` | Match odds UI component |
| `frontend/src/components/leaguescomp/Bookmakers.jsx` | Bookmaker UI component |
| `frontend/src/components/leaguescomp/Fancybet.jsx` | Fancy bets UI component |
| `frontend/src/utils/wsClient.js` | Shared WebSocket client |
| `frontend/src/utils/sportsMediaUrls.js` | Live stream + scorecard URLs |
| `frontend/src/utils/axiosConfig.js` | API base URL + WS host config |

---

## Appendix: Market Name Aliasing

Backend converts display names to API names via `toApiMarketName()`:

| Display name | API name |
|--------------|----------|
| `Match Odds` | `MATCH_ODDS` |
| `Tied Match` | `TIED_MATCH` |
| `Bookmaker` | `BOOKMAKER` |
| Others | sent as-is |

---

## Appendix: Bet Status Codes

| status | Meaning |
|--------|---------|
| `0` | Open / pending |
| `1` | Won |
| `2` | Lost |
| `3` | Void (stake returned) |

---

*Generated from codebase analysis. Last updated: June 2026.*
