import React, { useState } from "react";
import * as Icons from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";

const navData = [
  {
    label: "Active Users",
    icon: "FaUserCheck",
    path: "/active-users"
  },
  {
    label: "Sport Setting",
    icon: "FaFutbol",
    path: "/sport-setting"
  },
  {
    label: "Downline List",
    icon: "FaUsers",
    path: "/"
  },
  {
    label: "My Account",
    icon: "FaUserCircle",
    path: "/my-account-summary"
  },
  {
    label: "My Report",
    icon: "FaChartBar",
    children: [
      // {
      //   label: "Profit/Loss Report by Downline",
      //   icon: "FaFileAlt",
      //   path: "/AprofitByDownline"
      // },
      {
        label: "Profit/Loss by Downline",
        icon: "FaFileInvoiceDollar",
        path: "/AprofitDownline"
      },
      {
        label: "Profit/Loss Report by Market",
        icon: "FaChartPie",
        path: "/AprofitMarket"
      },
      {
        label: "Profit/Loss Sports Wise",
        icon: "FaFutbol",
        path: "/Adownlinesportspl"
      },
      {
        label: "All Casino Profit/Loss",
        icon: "FaDice",
        path: "/ACdownlinesportspl"
      },
      // {
      //   label: "Casino Profit/Loss Report by Date",
      //   icon: "FaCalendarAlt",
      //   path: "/AprofitCasino"
      // },
      // {
      //   label: "Casino P/L Downline Monthly",
      //   icon: "FaCalendar",
      //   path: "/ACasinoprofitAndLossDownlineNew"
      // },
      // {
      //   label: "International Casino P/L Downline Monthly",
      //   icon: "FaGlobe",
      //   path: "/ICasinoprofitAndLossDownlineNew"
      // }
    ]
  },
  {
    label: "BetList",
    icon: "FaListUl",
    path: "/Betlist"
  },
  {
    label: "Risk Management",
    icon: "FaListUl",
    path: "/RiskManagement"
  },
  {
    label: "Risk & Fraud",
    icon: "FaShieldAlt",
    path: "/risk-fraud",
    // Multi-account detection exposes players across the whole downline.
    superadminOnly: true,
    // Count of unreviewed clusters, kept live by useFraudAlerts.
    badge: "fraud"
  },
  {
    label: "BetListLive",
    icon: "FaBroadcastTower",
    path: "/BetListLive"
  },
  {
    label: "Banking",
    icon: "FaCreditCard",
    path: "/banking"
  },
  {
    label: "Block Market",
    icon: "FaBan",
    path: "/block-market"
  },
  // {
  //   label: "Admin Setting",
  //   icon: "FaCogs",
  //   path: "/general-setting"
  // },
  {
    label: "Other",
    icon: "FaEllipsisH",
    children: [
      {
        label: "Search User",
        icon: "FaSearch",
        path: "/searchuser"
      }
    ]
  },
  {
    label: "Time Zone : GMT+6:00",
    icon: "FaClock"
  },
  {
    label: "Logout",
    icon: "FaSignOutAlt",
    path: "/logout"
  }
];

const SidebarItem = ({ item, badgeCount = 0 }) => {
  const [open, setOpen] = useState(false);
  const Icon = Icons[item.icon] || Icons.FaQuestionCircle;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = () => {
    if (item.label === "Logout") {
      dispatch(logout());
      navigate("/admin/login");
      return;
    }

    if (item.children) {
      setOpen(!open);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="hide-scrollbar">
      <div
        onClick={handleClick}
        className="flex items-center justify-between cursor-pointer p-2 py-3 border-b-[1px] border-b-solid border-b-[#ffffff4d] hover:bg-[#4a4e42] hover:font-semibold"
      >
        <div className="flex items-center gap-2">

          <span className="text-[13px]">{item.label}</span>
          {badgeCount > 0 && (
            <span className="bg-[#d32f2f] text-white text-[10px] font-bold leading-none min-w-[18px] px-1.5 py-1 rounded-full text-center">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </div>
        {item.children && (
          <span>{open ? "▲" : "▼"}</span>
        )}
      </div>

      {item.children && open && (
        <div className="mt-1">
          {item.children.map((child) => (
            <SidebarItem key={child.path} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const role = useSelector((state) => state.auth.role);
  const unreviewedClusters = useSelector(
    (state) => state.fraud.summary?.unacknowledged || 0
  );

  const items = navData.filter(
    (item) => !item.superadminOnly || role === "superadmin"
  );

  return (
    <div className="w-64 bg-black text-white shadow-lg h-[calc(100vh-80px)] overflow-y-auto hide-scrollbar">
      {items.map((item) => (
        <SidebarItem
          key={item.path || item.label}
          item={item}
          badgeCount={item.badge === "fraud" ? unreviewedClusters : 0}
        />
      ))}
    </div>
  );
};

export default Navbar;