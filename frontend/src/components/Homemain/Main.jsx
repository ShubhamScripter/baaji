import React, { useState, useEffect } from 'react';
import { IoAlarmSharp } from "react-icons/io5";
import { FaCalendar, FaCalendarAlt } from "react-icons/fa";
import { HiTrophy } from "react-icons/hi2";
import { useSelector, useDispatch } from "react-redux";
import { fetchCricketData, fetchCricketInplayData } from "../../features/sports/cricketSlice";
import { fetchSoccerData, fetchSoccerInplayData } from "../../features/sports/soccerSlice";
import { fetchTennisData, fetchTennisInplayData } from "../../features/sports/tennisSlice";
import { useNavigate } from 'react-router-dom';
import api from "../../utils/axiosConfig";
import useDeactivatedMatches from "../../hooks/useDeactivatedMatches";
import Inplay from './Inplay';
import Today from './Today';
import Tomorrow from './Tomorrow';
import Spinner from '../Spinner';
// Utility: safely parse date to YYYY-MM-DD
const normalizeDate = (dateString) => {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split("T")[0];
  } catch {
    return null;
  }
};

const filterMatches = (matches, filterType) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  if (filterType === "In Play") {
    return matches.filter(m => m.inplay === true);
  } else if (filterType === "Today") {
    return matches.filter(m => normalizeDate(m.date) === todayStr);
  } else if (filterType === "Tomorrow") {
    return matches.filter(m => normalizeDate(m.date) === tomorrowStr);
  }
  return matches;
};

const categories = [
  { name: "In Play", icon: <IoAlarmSharp size={35} /> },
  { name: "Today", icon: <FaCalendar size={35} /> },
  { name: "Tomorrow", icon: <FaCalendarAlt size={35} /> },
  { name: "League", icon: <HiTrophy size={35} /> },
];

const defaultVisibleSports = {
  cricket: true,
  soccer: true,
  tennis: true,
};

const parseEnabledSports = (gameLock = []) => {
  const lockMap = {};
  gameLock.forEach((entry) => {
    const key = String(entry?.game || "").toLowerCase().replace(/\s+/g, "");
    lockMap[key] = Boolean(entry?.lock);
  });

  return {
    cricket: lockMap.cricket ?? true,
    soccer: lockMap.soccer ?? true,
    tennis: lockMap.tennis ?? true,
  };
};

const getUserGameLock = (userObj) => {
  if (Array.isArray(userObj?.gamelock)) return userObj.gamelock;
  if (Array.isArray(userObj?.settings?.gamelock)) return userObj.settings.gamelock;
  return null;
};

function Main() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isMatchVisible } = useDeactivatedMatches();

  const cricket = useSelector(state => state.cricket.matches || []);
  const soccer = useSelector(state => state.soccer.soccerData || []);
  const tennis = useSelector(state => state.tennis.data || []);
  const cricketInplay = useSelector(state => state.cricket.inplayMatches || []);
  const soccerInplay = useSelector(state => state.soccer.soccerInplayData || []);
  const tennisInplay = useSelector(state => state.tennis.inplayData || []);
  const [enabledSports, setEnabledSports] = useState({
    ...defaultVisibleSports,
  });
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  // const cricket = []
  // const soccer = []
  // const tennis = []

  const [Filter, setFilter] = useState("In Play");

  useEffect(() => {
    dispatch(fetchCricketData());
    dispatch(fetchCricketInplayData());
    dispatch(fetchSoccerData());
    dispatch(fetchSoccerInplayData());
    dispatch(fetchTennisData());
    dispatch(fetchTennisInplayData());
  }, [dispatch]);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) {
      setEnabledSports(defaultVisibleSports);
      return;
    }

    const localGameLock = getUserGameLock(user);
    if (Array.isArray(localGameLock)) {
      setEnabledSports(parseEnabledSports(localGameLock));
    }

    const loadSportVisibility = async () => {
      setVisibilityLoading(true);
      try {
        const { data } = await api.get("/get/user-details");
        const gameLock = getUserGameLock(data?.data);
        if (Array.isArray(gameLock)) {
          setEnabledSports(parseEnabledSports(gameLock));
        }
      } catch (error) {
        // Keep local user settings fallback in case API call fails.
        if (!Array.isArray(localGameLock)) {
          setEnabledSports(defaultVisibleSports);
        }
      } finally {
        setVisibilityLoading(false);
      }
    };

    loadSportVisibility();
  }, [user?.id, user?._id]);

  // If data hasn't loaded yet, show loading
  if (
    visibilityLoading ||
    (!cricket.length &&
    !soccer.length &&
    !tennis.length &&
    !cricketInplay.length &&
    !soccerInplay.length &&
    !tennisInplay.length)
  ) {
    return <div className="text-center py-4"><Spinner/></div>;
  }

  const visibleCricket = enabledSports.cricket
    ? cricket.filter((m) => isMatchVisible("cricket", m?.id))
    : [];
  const visibleSoccer = enabledSports.soccer
    ? soccer.filter((m) => isMatchVisible("soccer", m?.id))
    : [];
  const visibleTennis = enabledSports.tennis
    ? tennis.filter((m) => isMatchVisible("tennis", m?.id))
    : [];
  const visibleCricketInplay = enabledSports.cricket
    ? cricketInplay.filter((m) => isMatchVisible("cricket", m?.id))
    : [];
  const visibleSoccerInplay = enabledSports.soccer
    ? soccerInplay.filter((m) => isMatchVisible("soccer", m?.id))
    : [];
  const visibleTennisInplay = enabledSports.tennis
    ? tennisInplay.filter((m) => isMatchVisible("tennis", m?.id))
    : [];

  const allSports = [...visibleCricket, ...visibleSoccer, ...visibleTennis];
  const allInplaySports = [...visibleCricketInplay, ...visibleSoccerInplay, ...visibleTennisInplay];

  const filteredData = {
    all: Filter === "In Play" ? allInplaySports : filterMatches(allSports, Filter),
    cricket: Filter === "In Play" ? visibleCricketInplay : filterMatches(visibleCricket, Filter),
    soccer: Filter === "In Play" ? visibleSoccerInplay : filterMatches(visibleSoccer, Filter),
    tennis: Filter === "In Play" ? visibleTennisInplay : filterMatches(visibleTennis, Filter),
  };

  let content;
  if (Filter === "In Play") {
    content = <Inplay data={filteredData} enabledSports={enabledSports} />;
  } else if (Filter === "Today") {
    content = <Today data={filteredData} enabledSports={enabledSports} />;
  } else if (Filter === "Tomorrow") {
    content = <Tomorrow data={filteredData} enabledSports={enabledSports} />;
  } else if (Filter === "League") {
    navigate('/leagues');
  }

  return (
    <div className='bg-[#f0f8ff] w-full flex gap-1'>
      {/* Sidebar */}
      <div className='bg-white flex flex-col p-1 ml-2 mt-2 rounded-2xl gap-4 h-fit'>
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`flex flex-col items-center justify-center p-1 rounded-md cursor-pointer
            ${Filter === cat.name ? 'bg-[#19A044] text-white' : ''}`}
            onClick={() => setFilter(cat.name)}
          >
            {cat.icon}
            <span className='text-[10px]'>{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className='flex-1 h-full flex-col p-1 mt-1 mb-2 rounded-2xl gap-4'>
        {content}
      </div>
    </div>
  );
}

export default Main;
