import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from './authSlice';
import downlineReducer from './downlineSlice';
import accountSummaryReducer from './accountSummarySlice';
import activityLogReducer from './activityLogSlice';
import transactionsReducer from './transactionsSlice';
import subadminReducer from './subadminSlice'
import riskReducer from './riskSlice';
import marketReducer from './marketAnalyzeReducer';
import { setLogoutHandler } from '../utils/axiosInstance';

const store = configureStore({
  reducer: {
    auth: authReducer,
    downline: downlineReducer,
    accountSummary: accountSummaryReducer,
    activityLog: activityLogReducer,
    transactions: transactionsReducer,
    subadmin: subadminReducer,
    risk: riskReducer,
    market: marketReducer,
  },
});

//  Register logout callback once store exists
setLogoutHandler(() => {
  store.dispatch(logout());
});

export default store;
