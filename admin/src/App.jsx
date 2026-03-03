// import React from 'react';
// import { Toaster } from "react-hot-toast";
// import ProtectedRoute from './components/ProctedRoute';
// import { Routes, Route } from 'react-router-dom';
// import RoleRedirect from './components/navbar/RoleRedirected';
// import Login from './pages/auth/Login';
// import DownLineList from './pages/downlineList/admin/DownLineList';
// import MainLayout from './layouts/MainLayout';
// import AccountSummary from './pages/downlineList/admin/AccountSummary';
// import CurrentBets from './pages/downlineList/admin/CurrentBets';
// import BettingHistory from './pages/downlineList/admin/BettingHistory';
// import BettingProfitLoss from './pages/downlineList/admin/BettingProfitLoss';
// import TransactionHistory from './pages/downlineList/admin/TransactionHistory';
// import ActivityLog from './pages/downlineList/admin/ActivityLog';

// import SubAdminDownList from "./pages/downlineList/subAdmin/DownLineList"
// import SubAdminAccountSummary from './pages/downlineList/subAdmin/AccountSummary';
// import SubAdminCurrentBets from './pages/downlineList/subAdmin/CurrentBets';
// import SubAdminBettingHistory from './pages/downlineList/subAdmin/BettingHistory';
// import SubAdminBettingProfitLoss from './pages/downlineList/subAdmin/BettingProfitLoss';
// import SubAdminTransactionHistory from './pages/downlineList/subAdmin/TransactionHistory';
// import SubAdminActivityLog from './pages/downlineList/subAdmin/ActivityLog';

// import SeniorSuperDownLineList from './pages/downlineList/seniorSuper/DownLineList';
// import SeniorSuperAccountSummary from './pages/downlineList/seniorSuper/AccountSummary';
// import SeniorSuperCurrentBets from './pages/downlineList/seniorSuper/CurrentBets';
// import SeniorSuperBettingHistory from './pages/downlineList/seniorSuper/BettingHistory';
// import SeniorSuperBettingProfitLoss from './pages/downlineList/seniorSuper/BettingProfitLoss';
// import SeniorSuperTransactionHistory from './pages/downlineList/seniorSuper/TransactionHistory';
// import SeniorSuperActivityLog from './pages/downlineList/seniorSuper/ActivityLog';

// import SuperAgentDownLineList from './pages/downlineList/superAgent/DownLineList';
// import SuperAgentAccountSummary from './pages/downlineList/superAgent/AccountSummary';
// import SuperAgentCurrentBets from './pages/downlineList/superAgent/CurrentBets';
// import SuperAgentBettingHistory from './pages/downlineList/superAgent/BettingHistory';
// import SuperAgentBettingProfitLoss from './pages/downlineList/superAgent/BettingProfitLoss';
// import SuperAgentTransactionHistory from './pages/downlineList/superAgent/TransactionHistory';
// import SuperAgentActivityLog from './pages/downlineList/superAgent/ActivityLog';

// import AgentDownLineList from './pages/downlineList/agent/DownLineList';
// import AgentAccountSummary from './pages/downlineList/agent/AccountSummary';
// import AgentCurrentBets from './pages/downlineList/agent/CurrentBets';
// import AgentBettingHistory from './pages/downlineList/agent/BettingHistory';
// import AgentBettingProfitLoss from './pages/downlineList/agent/BettingProfitLoss';
// import AgentTransactionHistory from './pages/downlineList/agent/TransactionHistory';
// import AgentActivityLog from './pages/downlineList/agent/ActivityLog';


// import MyAccountSummary from './pages/myAccount/MyAccountSummary';
// import MyAccountStatement from './pages/myAccount/MyAccountStatement';
// import MyProfile from './pages/myAccount/MyProfile';
// import MyActivityLog from './pages/myAccount/MyActivityLog';

// import AprofitByDownline from './pages/myReport/profitLossReportByDownline/AprofitByDownline';

// import AprofitDownline from './pages/myReport/profitLossByDownline/AprofitDownline';
// import AprofitDownlineSubAdmin from './pages/myReport/profitLossByDownline/SubAdmin';
// import AprofitDownlineSeniorSuper from './pages/myReport/profitLossByDownline/SeniorSuper';
// import AprofitDownlineSuperAgent from './pages/myReport/profitLossByDownline/SuperAgent';
// import AprofitDownlineAgent from './pages/myReport/profitLossByDownline/Agent';


// import AprofitMarket from './pages/myReport/profitLossByMarket/AprofitMarket';
// import MatchMarketBets from './pages/myReport/profitLossByMarket/MatchMarketBets';

// import CasinoProfitLoss from './pages/myReport/profitLossSportsWise/CasinoProfitLoss';

// import ACdownlinesportspl from './pages/myReport/AllCasinoProfitLoss/ACdownlinesportspl';
// import ACdownlinesportsplSubAdmin from './pages/myReport/AllCasinoProfitLoss/SubAdmin';
// import ACdownlinesportsplSeniorSuper from './pages/myReport/AllCasinoProfitLoss/SeniorSuper';
// import ACdownlinesportsplSuperAgent from './pages/myReport/AllCasinoProfitLoss/SuperAgent';
// import ACdownlinesportsplAgent from './pages/myReport/AllCasinoProfitLoss/Agent';


// import AprofitCasino from './pages/myReport/CasinoProfitLossByDate/AprofitCasino';

// import DownlineNew from './pages/myReport/casinoProfitLossMonthly/DownlineNew';
// import DownlineNewSubAdmin from './pages/myReport/casinoProfitLossMonthly/SubAdmin';
// import DownlineNewSeniorSuper from './pages/myReport/casinoProfitLossMonthly/SeniorSuper';
// import DownlineNewSuperAgent from './pages/myReport/casinoProfitLossMonthly/SuperAgent';
// import DownlineNewAgent from './pages/myReport/casinoProfitLossMonthly/Agent';

// import InternationalDownlineNew from './pages/myReport/InternationalCasinoDownline/DownlineNew';

// import BetList from './pages/BetList/BetList';
// import BetListLive from './pages/BetListLive/BetListLive';
// import RiskManagement from './pages/riskManagement/RiskManagement';
// import MatchedAll from './pages/riskManagement/MatchedAll';

// import Banking from './pages/banking/Banking';
// import BlockMarket from './pages/blockMarket/BlockMarket';

// import GeneralSetting from './pages/generalSetting/GeneralSetting';
// import SearchUser from './pages/generalSetting/SearchUser';
// import Surveillance from './pages/generalSetting/Surveillance';
// import BetLockeduser from './pages/generalSetting/BetLockeduser';
// import PlayerBalance from './pages/generalSetting/PlayerBalance';
// import ActiveMatch from './pages/generalSetting/ActiveMatch';
// import InActiveMatch from './pages/generalSetting/InActiveMatch';
// import UpdateFancyStatus from './pages/generalSetting/UpdateFancyStatus';
// import SuspendedResult from './pages/generalSetting/SuspendedResult';
// import SuspendedFancyResult from './pages/generalSetting/SuspendedFancyResult';
// import SuspendedMarketResult from './pages/generalSetting/SuspendedMarketResult';
// import ViewBets from './pages/generalSetting/ViewBets';
// import InactiveUsers from './pages/generalSetting/InactiveUsers';
// import BetLockedUsers from './pages/generalSetting/BetLockedUsers';

// import DownLineView from './pages/downlineList/DownLineView';
// import protectedRoute from './components/ProtectedRoute'
// function App() {
//   return (
//     <>
//     <Toaster position="top-right" reverseOrder={false} />
//     <Routes>
//       <Route path="/admin/login" element={<Login />} />
//       <Route element={<ProtectedRoute />}>
//       <Route path="/logout" element={<Login />} />
//       <Route path='/match-market-bets' element={<MatchMarketBets/>}/>

//       <Route element={<MainLayout />}>
//         {/* <Route path="/downline-list" element={<RoleRedirect />}/> */}
//         {/** DownlineList       Admin Routes */}
        
//         <Route path="/" element={<DownLineList />} />
//         {/* <Route path='/downline-list' element={<DownLineList/> } />
//         <Route path='/account-summary' element={<AccountSummary/> }/>
//         <Route path='/current-bets' element={ <CurrentBets/> }/>
//         <Route path='/betting-history' element={<BettingHistory/> }/>
//         <Route path='/betting-profit-loss' element={ <BettingProfitLoss/> }/>
//         <Route path='/transaction-history' element={ <TransactionHistory/> }/>
//         <Route path='/activity-log' element={<ActivityLog/> }/> */}
        
        
//         {/**DownlineList         SubAdmin Routes */}
//         {/* <Route path='/subadmin/:userId' element={<ProtectedRoute allowedRoles={['admin','subadmin']}><SubAdminDownList/></ProtectedRoute>}/> */}
//         {/* <Route path='/account-summary/senior_super' element={<ProtectedRoute allowedRoles={['admin','subadmin']}><SubAdminAccountSummary/></ProtectedRoute>}/>
//         <Route path='/current-bets/senior_super' element={<ProtectedRoute allowedRoles={['admin','subadmin']}><SubAdminCurrentBets/></ProtectedRoute>}/>
//         <Route path='/betting-history/senior_super' element={ <ProtectedRoute allowedRoles={['admin','subadmin']}><SubAdminBettingHistory/></ProtectedRoute>}/>
//         <Route path='/betting-profit-loss/senior_super' element={<ProtectedRoute allowedRoles={['admin','subadmin']}><SubAdminBettingProfitLoss/></ProtectedRoute>}/>
//         <Route path='/transaction-history/senior_super' element={<ProtectedRoute allowedRoles={['admin','subadmin']}><SubAdminTransactionHistory/></ProtectedRoute>}/>
//         <Route path='/activity-log/senior_super' element={<ProtectedRoute allowedRoles={['admin','subadmin']}><SubAdminActivityLog/></ProtectedRoute>}/> */}
//         {/**DownlineList           senoirSuper Routes */}
//         {/* <Route path='/seniorsuper/:userId' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper']}><SeniorSuperDownLineList/></ProtectedRoute>}/> */}
//         {/* <Route path='/account-summary/super_agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper']}><SeniorSuperAccountSummary/></ProtectedRoute>}/>
//         <Route path='/current-bets/super_agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper']}><SeniorSuperCurrentBets/></ProtectedRoute>}/>
//         <Route path='/betting-history/super_agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper']}><SeniorSuperBettingHistory/></ProtectedRoute>}/>
//         <Route path='/betting-profit-loss/super_agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper']}><SeniorSuperBettingProfitLoss/></ProtectedRoute>}/>
//         <Route path='/transaction-history/super_agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper']}><SeniorSuperTransactionHistory/></ProtectedRoute>}/>
//         <Route path='/activity-log/super_agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper']}><SeniorSuperActivityLog/></ProtectedRoute>}/> */}
//         {/**DownlineList           Super Agent Routes */}
//         {/* <Route path='/superagent/:userId' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent']}><SuperAgentDownLineList/></ProtectedRoute>}/> */}
//         {/* <Route path='/account-summary/agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent']}><SuperAgentAccountSummary/></ProtectedRoute>}/>
//         <Route path='/current-bets/agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent']}><SuperAgentCurrentBets /></ProtectedRoute>}/>
//         <Route path='/betting-history/agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent']}><SuperAgentBettingHistory/></ProtectedRoute>}/>
//         <Route path='/betting-profit-loss/agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent']}><SuperAgentBettingProfitLoss/></ProtectedRoute>}/>
//         <Route path='/transaction-history/agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent']}><SuperAgentTransactionHistory/></ProtectedRoute>}/>
//         <Route path='/activity-log/agent' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent']}><SuperAgentActivityLog/></ProtectedRoute>}/> */}
//         {/**DownlineList          Agent Routes */}
//         {/* <Route path='/agent/:userId' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent', 'agent']}><AgentDownLineList/></ProtectedRoute>}/> */}
//         {/* <Route path='/account-summary/user' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent', 'agent']}><AgentAccountSummary/></ProtectedRoute>}/>
//         <Route path='/current-bets/user' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent', 'agent']}><AgentCurrentBets /></ProtectedRoute>}/>
//         <Route path='/betting-history/user' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent', 'agent']}><AgentBettingHistory/></ProtectedRoute>}/>
//         <Route path='/betting-profit-loss/user' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent', 'agent']}><AgentBettingProfitLoss/></ProtectedRoute>}/>
//         <Route path='/transaction-history/user' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent', 'agent']}><AgentTransactionHistory/></ProtectedRoute>}/>
//         <Route path='/activity-log/user' element={<ProtectedRoute allowedRoles={['admin','subadmin','seniorSuper', 'superAgent', 'agent']}><AgentActivityLog/></ProtectedRoute>}/> */}
       
//        {/* === NEW: Dynamic Downline View === */}
//         <Route path='/:role/:userId' element={<DownLineView />} />
//         <Route path='/account-summary/:role/:userId' element={<AccountSummary/> }/>
//         <Route path='/activity-log/:role/:userId' element={<ActivityLog/> }/>
//         <Route path='/current-bets/:role/:userId' element={ <CurrentBets/> }/>
//         <Route path='/betting-history/:role/:userId' element={<BettingHistory/> }/>
//         <Route path='/betting-profit-loss/:role/:userId' element={ <BettingProfitLoss/> }/>
//         <Route path='/transaction-history/:role/:userId' element={ <TransactionHistory/> }/>
//         {/**My Account Route */}
//         <Route path='/my-account-summary' element={<MyAccountSummary/>}/>
//         <Route path='/my-account-statement' element={<MyAccountStatement/>}/>
//         <Route path='/my-profile' element={<MyProfile/>}/>
//         <Route path='/my-activity-log' element={<MyActivityLog/>}/>

//         <Route path='/AprofitByDownline' element={<AprofitByDownline/>}/>

//         {/**My Report Routes */}
//         <Route path='/AprofitDownline' element={<AprofitDownline/>}/>
//         <Route path='/AprofitDownline/sub_admin' element={<AprofitDownlineSubAdmin/>}/>
//         <Route path='/AprofitDownline/senior_super' element={<AprofitDownlineSeniorSuper/>}/>
//         <Route path='/AprofitDownline/super_agent' element={<AprofitDownlineSuperAgent/>}/>
//         <Route path='/AprofitDownline/agent' element={<AprofitDownlineAgent/>}/>

//         <Route path='/AprofitMarket' element={<AprofitMarket/>}/>

//         <Route path='/Adownlinesportspl' element={<CasinoProfitLoss/>}/>

//         <Route path='/ACdownlinesportspl' element={<ACdownlinesportspl/>}/>
//         <Route path='/ACdownlinesportspl/sub_admin' element={<ACdownlinesportsplSubAdmin/>}/>
//         <Route path='/ACdownlinesportspl/senior_super' element={<ACdownlinesportsplSeniorSuper/>}/>
//         <Route path='/ACdownlinesportspl/super_agent' element={<ACdownlinesportsplSuperAgent/>}/>
//         <Route path='/ACdownlinesportspl/agent' element={<ACdownlinesportsplAgent/>}/>

//         <Route path='/AprofitCasino' element={<AprofitCasino/>}/>

//         <Route path='/ACasinoprofitAndLossDownlineNew' element={<DownlineNew/>}/>
//         <Route path='/ACasinoprofitAndLossDownlineNew/sub_admin' element={<DownlineNewSubAdmin/>}/>
//         <Route path='/ACasinoprofitAndLossDownlineNew/senior_super' element={<DownlineNewSeniorSuper/>}/>
//         <Route path='/ACasinoprofitAndLossDownlineNew/super_agent' element={<DownlineNewSuperAgent/>}/>
//         <Route path='/ACasinoprofitAndLossDownlineNew/agent' element={<DownlineNewAgent/>}/>

//         <Route path='/ICasinoprofitAndLossDownlineNew' element={<InternationalDownlineNew/>}/>

//         <Route path='/Betlist' element={<BetList/>}/>
//         <Route path='/BetListLive' element={<BetListLive/>}/>
//         <Route path='/RiskManagement' element={<RiskManagement/>}/>
//         <Route path='/matchedAll' element={<MatchedAll/>}/>


//         <Route path='/banking' element= {<Banking/>}/>
//         <Route path='/block-market' element={<BlockMarket/>}/>

//         <Route path='/general-setting' element={<GeneralSetting/>}/>
//         <Route path='/searchuser' element={<SearchUser/>}/>
//         <Route path='/SurveillanceSetting' element={<Surveillance/>}/>
//         <Route path='/BetLockUser' element={<BetLockeduser/>}/>
//         <Route path='/PlayerBalance' element={<PlayerBalance/>}/>
//         <Route path='/active-match' element={<ActiveMatch/>}/>
//         <Route path='/in-active-match' element={<InActiveMatch/>}/>
//         <Route path='/updateFancyStatus' element={<UpdateFancyStatus/>}/>
//         <Route path='/SuspendedResult' element={<SuspendedResult/>}/>
//         <Route path='/SuspendedFancyResult' element={<SuspendedFancyResult/>}/>
//         <Route path='/SuspendedMarketResult' element={<SuspendedMarketResult/>}/>
//         <Route path='/viewBets' element={<ViewBets/>}/>
//         <Route path='/inactive-users' element={<InactiveUsers/>}/>
//         <Route path='/BetLockUser' element={<BetLockedUsers/>}/>

//         </Route>
//       </Route>
//     </Routes>
//     </>
//   );
// }

// export default App;

import React from 'react';
import { Toaster } from "react-hot-toast";
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // <-- Correct import
import RoleRedirect from './components/navbar/RoleRedirected';
import Login from './pages/auth/Login';
import DownLineList from './pages/downlineList/admin/DownLineList';
import MainLayout from './layouts/MainLayout';
import AccountSummary from './pages/downlineList/admin/AccountSummary';
import CurrentBets from './pages/downlineList/admin/CurrentBets';
import BettingHistory from './pages/downlineList/admin/BettingHistory';
import BettingProfitLoss from './pages/downlineList/admin/BettingProfitLoss';
import TransactionHistory from './pages/downlineList/admin/TransactionHistory';
import TransactionHistory2 from './pages/downlineList/admin/TransactionHistory2';
import ActivityLog from './pages/downlineList/admin/ActivityLog';

import SubAdminDownList from "./pages/downlineList/subAdmin/DownLineList"
import SubAdminAccountSummary from './pages/downlineList/subAdmin/AccountSummary';
import SubAdminCurrentBets from './pages/downlineList/subAdmin/CurrentBets';
import SubAdminBettingHistory from './pages/downlineList/subAdmin/BettingHistory';
import SubAdminBettingProfitLoss from './pages/downlineList/subAdmin/BettingProfitLoss';
import SubAdminTransactionHistory from './pages/downlineList/subAdmin/TransactionHistory';
import SubAdminActivityLog from './pages/downlineList/subAdmin/ActivityLog';

import SeniorSuperDownLineList from './pages/downlineList/seniorSuper/DownLineList';
import SeniorSuperAccountSummary from './pages/downlineList/seniorSuper/AccountSummary';
import SeniorSuperCurrentBets from './pages/downlineList/seniorSuper/CurrentBets';
import SeniorSuperBettingHistory from './pages/downlineList/seniorSuper/BettingHistory';
import SeniorSuperBettingProfitLoss from './pages/downlineList/seniorSuper/BettingProfitLoss';
import SeniorSuperTransactionHistory from './pages/downlineList/seniorSuper/TransactionHistory';
import SeniorSuperActivityLog from './pages/downlineList/seniorSuper/ActivityLog';

import SuperAgentDownLineList from './pages/downlineList/superAgent/DownLineList';
import SuperAgentAccountSummary from './pages/downlineList/superAgent/AccountSummary';
import SuperAgentCurrentBets from './pages/downlineList/superAgent/CurrentBets';
import SuperAgentBettingHistory from './pages/downlineList/superAgent/BettingHistory';
import SuperAgentBettingProfitLoss from './pages/downlineList/superAgent/BettingProfitLoss';
import SuperAgentTransactionHistory from './pages/downlineList/superAgent/TransactionHistory';
import SuperAgentActivityLog from './pages/downlineList/superAgent/ActivityLog';

import AgentDownLineList from './pages/downlineList/agent/DownLineList';
import AgentAccountSummary from './pages/downlineList/agent/AccountSummary';
import AgentCurrentBets from './pages/downlineList/agent/CurrentBets';
import AgentBettingHistory from './pages/downlineList/agent/BettingHistory';
import AgentBettingProfitLoss from './pages/downlineList/agent/BettingProfitLoss';
import AgentTransactionHistory from './pages/downlineList/agent/TransactionHistory';
import AgentActivityLog from './pages/downlineList/agent/ActivityLog';

import MyAccountSummary from './pages/myAccount/MyAccountSummary';
import MyAccountStatement from './pages/myAccount/MyAccountStatement';
import MyProfile from './pages/myAccount/MyProfile';
import MyActivityLog from './pages/myAccount/MyActivityLog';

import AprofitByDownline from './pages/myReport/profitLossReportByDownline/AprofitByDownline';

import AprofitDownline from './pages/myReport/profitLossByDownline/AprofitDownline';
import AprofitDownlineSubAdmin from './pages/myReport/profitLossByDownline/SubAdmin';
import AprofitDownlineSeniorSuper from './pages/myReport/profitLossByDownline/SeniorSuper';
import AprofitDownlineSuperAgent from './pages/myReport/profitLossByDownline/SuperAgent';
import AprofitDownlineAgent from './pages/myReport/profitLossByDownline/Agent';

import AprofitMarket from './pages/myReport/profitLossByMarket/AprofitMarket';
import MatchMarketBets from './pages/myReport/profitLossByMarket/MatchMarketBets';

import CasinoProfitLoss from './pages/myReport/profitLossSportsWise/CasinoProfitLoss';

import ACdownlinesportspl from './pages/myReport/AllCasinoProfitLoss/ACdownlinesportspl';
import ACdownlinesportsplSubAdmin from './pages/myReport/AllCasinoProfitLoss/SubAdmin';
import ACdownlinesportsplSeniorSuper from './pages/myReport/AllCasinoProfitLoss/SeniorSuper';
import ACdownlinesportsplSuperAgent from './pages/myReport/AllCasinoProfitLoss/SuperAgent';
import ACdownlinesportsplAgent from './pages/myReport/AllCasinoProfitLoss/Agent';

import AprofitCasino from './pages/myReport/CasinoProfitLossByDate/AprofitCasino';

import DownlineNew from './pages/myReport/casinoProfitLossMonthly/DownlineNew';
import DownlineNewSubAdmin from './pages/myReport/casinoProfitLossMonthly/SubAdmin';
import DownlineNewSeniorSuper from './pages/myReport/casinoProfitLossMonthly/SeniorSuper';
import DownlineNewSuperAgent from './pages/myReport/casinoProfitLossMonthly/SuperAgent';
import DownlineNewAgent from './pages/myReport/casinoProfitLossMonthly/Agent';

import InternationalDownlineNew from './pages/myReport/InternationalCasinoDownline/DownlineNew';

import BetList from './pages/BetList/BetList';
import BetListLive from './pages/BetListLive/BetListLive';
import RiskManagement from './pages/riskManagement/RiskManagement';
import MatchedAll from './pages/riskManagement/MatchedAll';

import Banking from './pages/banking/Banking';
import BlockMarket from './pages/blockMarket/BlockMarket';
import Transactionslog from './pages/banking/Transactionslog';

import GeneralSetting from './pages/generalSetting/GeneralSetting';
import SearchUser from './pages/generalSetting/SearchUser';
import Surveillance from './pages/generalSetting/Surveillance';
import BetLockeduser from './pages/generalSetting/BetLockeduser';
import PlayerBalance from './pages/generalSetting/PlayerBalance';
import ActiveMatch from './pages/generalSetting/ActiveMatch';
import InActiveMatch from './pages/generalSetting/InActiveMatch';
import UpdateFancyStatus from './pages/generalSetting/UpdateFancyStatus';
import SuspendedResult from './pages/generalSetting/SuspendedResult';
import SuspendedFancyResult from './pages/generalSetting/SuspendedFancyResult';
import SuspendedMarketResult from './pages/generalSetting/SuspendedMarketResult';
import ViewBets from './pages/generalSetting/ViewBets';
import InactiveUsers from './pages/generalSetting/InactiveUsers';
import BetLockedUsers from './pages/generalSetting/BetLockedUsers';

import DownLineView from './pages/downlineList/DownLineView';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/logout" element={<Login />} />
          <Route path='transaction-logs/:userId' element={<Transactionslog />} />
          <Route path='/match-market-bets' element={<MatchMarketBets />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<DownLineList />} />
            <Route path='/:role/:userId' element={<DownLineView />} />
            <Route path='/account-summary/:role/:userId' element={<AccountSummary />} />
            <Route path='/activity-log/:role/:userId' element={<ActivityLog />} />
            <Route path='/current-bets/:role/:userId' element={<CurrentBets />} />
            <Route path='/betting-history/:role/:userId' element={<BettingHistory />} />
            <Route path='/betting-profit-loss/:role/:userId' element={<BettingProfitLoss />} />
            <Route path='/transaction-history/:role/:userId' element={<TransactionHistory />} />
            <Route path='/transaction-history2/:role/:userId' element={<TransactionHistory2 />} />
            <Route path='/my-account-summary' element={<MyAccountSummary />} />
            <Route path='/my-account-statement' element={<MyAccountStatement />} />
            <Route path='/my-profile' element={<MyProfile />} />
            <Route path='/my-activity-log' element={<MyActivityLog />} />
            <Route path='/AprofitByDownline' element={<AprofitByDownline />} />
            <Route path='/AprofitDownline' element={<AprofitDownline />} />
            <Route path='/AprofitDownline/sub_admin/:userId' element={<AprofitDownlineSubAdmin />} />
            <Route path='/AprofitDownline/senior_super/:userId' element={<AprofitDownlineSeniorSuper />} />
            <Route path='/AprofitDownline/super_agent/:userId' element={<AprofitDownlineSuperAgent />} />
            <Route path='/AprofitDownline/agent/:userId' element={<AprofitDownlineAgent />} />
            <Route path='/AprofitMarket' element={<AprofitMarket />} />
            <Route path='/Adownlinesportspl' element={<CasinoProfitLoss />} />
            <Route path='/ACdownlinesportspl' element={<ACdownlinesportspl />} />
            <Route path='/ACdownlinesportspl/:role/:userId' element={<ACdownlinesportsplSubAdmin />} />
            {/* <Route path='/ACdownlinesportspl/senior_super' element={<ACdownlinesportsplSeniorSuper />} />
            <Route path='/ACdownlinesportspl/super_agent' element={<ACdownlinesportsplSuperAgent />} />
            <Route path='/ACdownlinesportspl/agent' element={<ACdownlinesportsplAgent />} /> */}
            <Route path='/AprofitCasino' element={<AprofitCasino />} />
            <Route path='/ACasinoprofitAndLossDownlineNew' element={<DownlineNew />} />
            <Route path='/ACasinoprofitAndLossDownlineNew/:role/:userId' element={<DownlineNewSubAdmin />} />
            {/* <Route path='/ACasinoprofitAndLossDownlineNew/senior_super' element={<DownlineNewSeniorSuper />} />
            <Route path='/ACasinoprofitAndLossDownlineNew/super_agent' element={<DownlineNewSuperAgent />} />
            <Route path='/ACasinoprofitAndLossDownlineNew/agent' element={<DownlineNewAgent />} /> */}
            <Route path='/ICasinoprofitAndLossDownlineNew' element={<InternationalDownlineNew />} />
            <Route path='/Betlist' element={<BetList />} />
            <Route path='/BetListLive' element={<BetListLive />} />
            <Route path='/RiskManagement' element={<RiskManagement />} />
            <Route path='/matchedAll' element={<MatchedAll />} />
            <Route path='/banking' element={<Banking />} />
            <Route path='/block-market' element={<BlockMarket />} />
            <Route path='/general-setting' element={<GeneralSetting />} />
            <Route path='/searchuser' element={<SearchUser />} />
            <Route path='/SurveillanceSetting' element={<Surveillance />} />
            <Route path='/PlayerBalance' element={<PlayerBalance />} />
            <Route path='/active-match' element={<ActiveMatch />} />
            <Route path='/in-active-match' element={<InActiveMatch />} />
            <Route path='/updateFancyStatus' element={<UpdateFancyStatus />} />
            <Route path='/SuspendedResult' element={<SuspendedResult />} />
            <Route path='/SuspendedFancyResult' element={<SuspendedFancyResult />} />
            <Route path='/SuspendedMarketResult' element={<SuspendedMarketResult />} />
            <Route path='/viewBets' element={<ViewBets />} />
            <Route path='/inactive-users' element={<InactiveUsers />} />
            <Route path='/BetLockUser' element={<BetLockedUsers />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;