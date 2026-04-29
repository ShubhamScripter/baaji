import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; //eslint-disable-line
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FancyMasterBookPopup from './CircketComponent/FancyMasterBookPopup';
import {
  getPendingBetAmo,
  fetchCricketBatingData,
  // getBetPerents,
  masterBookReducer,
  masterBookReducerDownline,
  getFancyMasterBook,
} from '../../store/marketAnalyzeReducer';
import { GoGraph } from "react-icons/go";
import { TfiMenuAlt } from "react-icons/tfi";
import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import { BiInfoCircle } from 'react-icons/bi';
import { RiArrowDropRightFill } from "react-icons/ri";
import Spinner from '../../components/Spinner';
import MatchOdd from './CircketComponent/MatchOdd';
import TiedMatch from './CircketComponent/TiedMatch';
import BookMaker from './CircketComponent/BookMaker';
import { host } from '../redux/api';
import { MdOutlineKeyboardArrowRight, MdPlayArrow } from 'react-icons/md';
import { AiFillCloseSquare } from "react-icons/ai";
const oddsDataraw = [
  {
    title: 'KKR 14 Over Total Runs (Odds / Evens)',
    options: [
      { label: 'ODD', value: '1.95', stake: '1M' },
      { label: 'EVEN', value: '1.95', stake: '1M' },
    ],
  },
  {
    title: 'KKR 15 Over Total Runs (Odds / Evens)',
    options: [
      { label: 'ODD', value: '1.95', stake: '1M' },
      { label: 'EVEN', value: '1.95', stake: '1M' },
    ],
  },
];

const dismissalData = [
  { method: 'Caught', odds: '1.3' },
  { method: 'Bowled', odds: '4' },
  { method: 'LBW', odds: '5' },
  { method: 'Run Out', odds: '15' },
  { method: 'Stumped', odds: '20' },
  { method: 'Others', odds: '100' },
];

export default function Cricketbet() {
  const DISABLE_6_OVER_SECTION = false;
  const { gameid } = useParams() || {};
  const { match } = useParams() || {};
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  // const { pendingBetAmounts } = useSelector((state) => state.bet);
  //  WebSocket Setup (Real-time updates)
  const [bettingData, setBettingData] = useState(null);
  const [loader, setLoader] = useState(false);
  const { battingData } = useSelector((state) => state.market);

  const {
    loading,
    pendingBet,
    betsData,
    betPerantsData,
    masterData,
    masterDataDownline,
  } = useSelector((state) => state.market);

  const [activeTab, setActiveTab] = useState('fancy');
  const [activeSubTab, setActiveSubTab] = useState('Normal');
  const [masterBookPopup, setMasterBookPopup] = useState({
    show: false,
    teamName: '',
  });

  const [activeIframe, setActiveIframe] = useState(null);

  const [masterpopup, setMasterpopup] = useState(false);
  const [userMasterpopup, setUserMasterpopup] = useState(false);
  const [viewMoreDetail, setViewMoreDetail] = useState(false);
  const [profitLoss, setProfitLoss] = useState(false);
  const [marketType, setMarketType] = useState("");

  const [showMasterDownline, setShowMasterDownline] = useState(false);
  // const [liveBets, setLiveBets] = useState([]);
  const [userBet, setUserBet] = useState([]);
  const [storedGameType, setStoredGameType] = useState(null);
  const [storedMatchOddsList, setStoredMatchOddsList] = useState([]);
  const [teamHeaders, setTeamHeaders] = useState([]);
  const [masterDownline, setMasterDownline] = useState([]);
  // const [entriesPerPage, setEntriesPerPage] = useState(10);
  // const [searchTerm, setSearchTerm] = useState('');
  const subTabs = [
    { id: 'Normal', name: 'ALL' },
    { id: 'Normal', name: 'Fancy' },
    { id: 'line', name: 'Line Markets' },
    { id: 'ball', name: 'Ball by Ball' },
    { id: 'meter', name: 'Meter Markets' },
    { id: 'khado', name: 'Khado Markets' },
  ];

  const handleOpenMasterBook = (team, gameType) => {
    setMasterBookPopup({ show: true, teamName: team });
    dispatch(
      getFancyMasterBook({
        gameId: gameid,
        teamName: team,
        gameType,
      })
    );
  };
  //  Fetch once before using socket (optional)
  useEffect(() => {
    if (gameid) {
      setLoader(true);
      dispatch(fetchCricketBatingData(gameid)).finally(() => {
        setLoader(false);
      });
    }
  }, [dispatch, gameid]);

  useEffect(() => {
    if (!gameid) return;

    const socket = new WebSocket(host);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({ type: 'subscribe', gameid, apitype: 'cricket' })
      );
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.gameid === gameid) {
          setBettingData(message.data);
        }
      } catch (err) {
        console.error(' Error parsing message:', err);
      }
    };

    socket.onerror = (err) => {
      console.error(' WebSocket error:', err);
    };

    socket.onclose = () => {
      console.log(' WebSocket disconnected');
    };

    return () => socket.close();
  }, [gameid]);

  useEffect(() => {
    let intervalId;

    if (gameid) {
      // Set loader true before initial fetch
      setLoader(true);

      const fetchData = async () => {
        dispatch(fetchCricketBatingData(gameid));
        setLoader(false);
      };

      fetchData();
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [gameid]);

  useEffect(() => {
    setBettingData(battingData);
  }, [battingData]);

  

  // Calculate net outcome for a team in a given market (like MatchOdd.jsx)
  const getTossBetDetails = (pendingBets, gameType, team) => {
    const marketBets =
      pendingBets?.filter((item) => item.gameType === gameType) || [];

    if (marketBets.length === 0) {
      return { netOutcome: null, hasExistingBet: false };
    }

    let netOutcome = 0;
    marketBets.forEach((bet) => {
      const isBetOnThisTeam =
        bet.teamName?.toLowerCase().trim() === team?.toLowerCase().trim();
      const betAmount = parseFloat(bet.totalBetAmount) || 0;
      const stake = parseFloat(bet.totalPrice) || 0;

      if (bet.otype === 'back') {
        if (isBetOnThisTeam) {
          netOutcome += betAmount; // Profit if THIS team wins
        } else {
          netOutcome -= stake; // Loss if OTHER team wins (lose your stake)
        }
      } else {
        // lay bet logic
        if (isBetOnThisTeam) {
          netOutcome -= stake; // Loss if THIS team wins (liability)
        } else {
          netOutcome += betAmount; // Profit if OTHER team wins
        }
      }
    });

    return {
      netOutcome: Math.round(netOutcome * 100) / 100,
      hasExistingBet: true,
    };
  };

  const matchOddsList = Array.isArray(bettingData)
    ? bettingData.filter(
        (item) =>
          item?.mname === 'MATCH_ODDS' || item?.mname === 'TOURNAMENT_WINNER'
      )
    : [];

  const matchOdd = Array.isArray(betsData)
    ? betsData.filter(
        (item) => item?.gameType === 'Match Odds' || item?.gameType === 'Winner'
      )
    : [];

  const tiedMatchList = Array.isArray(bettingData)
    ? bettingData.filter(
        (item) =>
          item?.mname === 'TIED_MATCH' || item?.mname === 'Bookmaker IPL CUP'
      )
    : [];
  const tiedMatch = Array.isArray(betsData)
    ? betsData.filter(
        (item) =>
          item?.gameType === 'Bookmaker IPL CUP' ||
          item?.gameType === 'TIED_MATCH'
      )
    : [];

  const BookmakerList = Array.isArray(bettingData)
    ? bettingData.filter((item) => item.mname === 'Bookmaker')
    : [];

  const Bookmaker = Array.isArray(betsData)
    ? betsData.filter((item) => item.gameType === 'Bookmaker')
    : [];

  const Toss = Array.isArray(betsData)
    ? betsData.filter((item) => item.gameType === 'Toss')
    : [];

  const first6over = Array.isArray(betsData)
    ? betsData.filter((item) => item.gameType === '1st 6 over')
    : [];

  const fancy1List = bettingData?.filter((item) => item.mname === 'fancy1');

  const fancy1Data =
    Array.isArray(fancy1List) && fancy1List.length > 0 && fancy1List[0].section
      ? fancy1List[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: fancy1List[0].mname, // Access from first item
          status: fancy1List[0].status, //  Access from first item
        }))
      : [];

  const over6List = bettingData?.filter((item) => item.mname === 'Normal');
  const over6Data =
    Array.isArray(over6List) && over6List.length > 0 && over6List[0].section
      ? over6List[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: over6List[0].mname, //  Access from first item
          status: sec.gstatus, //  Access from first item
        }))
      : [];

  const fancy2List = bettingData?.filter((item) => item.mname === activeSubTab);
  const fancy2Data =
    Array.isArray(fancy2List) && fancy2List.length > 0 && fancy2List[0].section
      ? fancy2List[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          max: sec.max,
          min: sec.min,
          mname: fancy2List[0].mname, //  Access from first item
          status: sec.gstatus, //  Access from first item
        }))
      : [];

  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
  }, [dispatch]);

  useEffect(() => {
    document.body.style.overflow = masterpopup ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [masterpopup]);

  const hendalUserBetsData = (gameType, code, matchOddsList) => {
    const userBet = Array.isArray(betsData)
      ? betsData.filter(
          (item) => item?.gameType === gameType || item?.gameType === code
        )
      : [];

    // Extract teams from matchOddsList
    const teams = Array.isArray(matchOddsList[0]?.section)
      ? matchOddsList[0].section.map((sec) => sec.nat)
      : [];
    setTeamHeaders(teams); // Set teams to render in table header

    setUserBet(userBet);
  };

  const hemdelMasterBook = async (userId, gameType, matchOddsList) => {
    try {
      // Reset UI
      setMasterDownline([]);
      setTeamHeaders([]);
      setShowMasterDownline(true);

      // Use stored values if not passed (for downline use)
      const finalGameType = gameType || storedGameType;
      const finalMatchOddsList = matchOddsList?.length
        ? matchOddsList
        : storedMatchOddsList;

      // Save for future
      if (gameType && matchOddsList) {
        setStoredGameType(gameType);
        setStoredMatchOddsList(matchOddsList);
      }

      // Dispatch reset action if needed
      dispatch({ type: 'RESET_MASTER_BOOK' });

      // Fetch new data
      await dispatch(
        masterBookReducer({ userId, gameid, gameType: finalGameType })
      );

      // Update headers
      const teams = Array.isArray(finalMatchOddsList[0]?.section)
        ? finalMatchOddsList[0].section.map((sec) => sec.nat)
        : [];
      setTeamHeaders(teams);
    } catch (error) {
      console.log(error);
    }
  };

  const hemdelMasterBookDownline = async (userId) => {
    try {
      // Reset UI
      setMasterDownline([]);
      setTeamHeaders([]);

      const finalGameType = storedGameType;
      const finalMatchOddsList = storedMatchOddsList;

      // Dispatch new downline request
      await dispatch(
        masterBookReducerDownline({ userId, gameid, gameType: finalGameType })
      );

      // Update headers
      const teams = Array.isArray(finalMatchOddsList[0]?.section)
        ? finalMatchOddsList[0].section.map((sec) => sec.nat)
        : [];
      setTeamHeaders(teams);
    } catch (error) {
      console.log(error);
    }
  };

  const tossTeamamo = (gameType, team1) => {
    const team1Data = Array.isArray(betsData)
      ? betsData.filter(
          (item) => item?.gameType === gameType || item?.teamName === team1
        )
      : [];

    console.log('team1Data', team1Data);
  };

  useEffect(() => {
    if (masterData?.length > 0) {
      setMasterDownline(masterData); //  For first-level data
    }
  }, [masterData]);

  useEffect(() => {
    if (masterDataDownline?.length > 0) {
      setMasterDownline(masterDataDownline); // For downline drill
    }
  }, [masterDataDownline]);

  const [popup, setPopup] = useState(false);
  // const handelpopup = async (id) => {
  //   setPopup(true);
  //   await dispatch(getBetPerents(id));
  // };

  // Inside your React functional component (e.g., in a file like MyComponent.jsx)

  const formatToK = (num) => {
    if (!num || num < 1000) return num;
    const n = Number(num);
    return `${n / 1000}k`;
  };

  const pratnerShip = (role, amount, part) => {
    const roundedAmount = Math.round(amount * 100) / 100; // Round to 2 decimals
    if (role === 'user') {
      return roundedAmount;
    } else {
      return Math.round(roundedAmount * ((100 - part) / 100) * 100) / 100;
    }
  };

  const filteredData = marketType
  ? betsData.filter(item => item.gameType === marketType)
  : betsData;
  // const filteredBetOdd = betsData
  //   ?.filter((item) =>
  //     searchTerm
  //       ? item.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         item.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         item.gameType?.toLowerCase().includes(searchTerm.toLowerCase())
  //       : true
  //   )
  //   .slice(0, entriesPerPage);
  const liveGmid = useMemo(() => {
    const apiGmid = battingData?.find((market) => market?.gmid != null)?.gmid;
    if (apiGmid != null) return String(apiGmid);
    return gameid != null ? String(gameid) : "";
    }, [battingData, gameid]);


  return (
    <div className='relative'>
      <div className='w-full'>
        {loader ? (
          <div className='fixed top-52 left-[40%] py-4 text-center'>
            <Spinner />
          </div>
        ) : (
          <div className='flex w-full flex-col p-1 md:flex-row justify-between md:p-3 bg-gray-200'>
            <div className='sm:w-full md:w-[59%] mr-[1%]'>
              <div className='z-0'>
              <div className='flex items-center justify-between bg-[#2c3e50] py-1.5 px-3 text-white text-[12px]'>
                <span className='flex flex-1 items-center'>
                  Event name <MdOutlineKeyboardArrowRight /> Category Name
                  {/* {gameTitle} <MdOutlineKeyboardArrowRight /> {gameName} */}
                </span>
                <span className=''>
                  Date/Time
                  {/* {lastUpdateddate
                    ? new Date(lastUpdateddate).toLocaleString('en-IN')
                    : '—'} */}
                </span>
              </div>
              <div className='grid grid-cols-2 bg-black py-1.5 px-3 text-white text-[12px] my-1'>
                <span
                  className="text-center col-span-1 cursor-pointer"
                  onClick={() =>
                    setActiveIframe((prev) => (prev === "live" ? null : "live"))
                  }
                >
                  Live
                </span>

                <span
                  className="text-center col-span-1 cursor-pointer"
                  onClick={() =>
                    setActiveIframe((prev) => (prev === "score" ? null : "score"))
                  }
                >
                  ScoreBoard
                </span>
              </div>
                {activeIframe === "live" && (
                  <iframe
                    src={`https://test.bulkapi.co.in/api/v1/live-stream?gmid=${liveGmid}&key=gk_db1cb19180dd6dc5657140d56d29c138099808c7a1196c52`}
                    title='Watch Live'
                    className='w-full rounded-lg'
                    style={{ height: '50vh' }}
                    allowFullScreen
                    loading='lazy'
                    allow='
                    autoplay;
                    encrypted-media;
                    fullscreen;
                    picture-in-picture;
                    accelerometer;
                    gyroscope
                  '
                  />
                )}
                {activeIframe === "score" && (
                  <iframe
                    src={`https://test.bulkapi.co.in/api/v1/live-score?gmid=${gameid}&key=gk_db1cb19180dd6dc5657140d56d29c138099808c7a1196c52`}
                    allowFullScreen
                    className='w-full rounded-lg'
                    title='Live Score'
                    allow='
                    autoplay;
                    encrypted-media;
                    fullscreen;
                    picture-in-picture;
                    accelerometer;
                    gyroscope
                  '
                  />
                )}

                <MatchOdd
                  matchOddsList={matchOddsList}
                  gameid={gameid}
                  match={match}
                />
                <TiedMatch
                  tiedMatchList={tiedMatchList}
                  gameid={gameid}
                  match={match}
                />
                <BookMaker
                  BookmakerList={BookmakerList}
                  gameid={gameid}
                  match={match}
                />

                <div className='mt-2'>
                  {fancy1Data.length > 0 &&
                    fancy1Data[0]?.team?.split('(')[0]?.includes('Toss') && (
                      <div>
                        <div className='mx-auto bg-gray-200 text-[13px]'>
                          <div className='flex items-center justify-between rounded-t-md bg-white'>
                            <div className='bg-blue flex gap-3 rounded-tr-3xl p-2 px-4 font-bold text-white'>
                              <span>Which Team Will Win The Toss </span>

                              <span className='mt-1 text-lg font-black'>
                                <HiOutlineExclamationCircle />
                              </span>
                            </div>
                            <div className='font-bold'>
                              {fancy1Data[0].min} -{' '}
                              {formatToK(fancy1Data[0]?.max)}
                            </div>
                          </div>

                          {fancy1Data[0]?.status === 'SUSPENDED' ? (
                            <div className='relative mx-auto border-2 border-red-500'>
                              <div className='justify-centerz-10 absolute flex h-full w-full items-center bg-[#e1e1e17e]'>
                                <p className='absolute left-1/2 -translate-x-1/2 transform text-3xl font-bold text-red-700'>
                                  SUSPENDED
                                </p>
                              </div>
                              <div className='bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]'>
                                <div className='flex justify-around p-3'>
                                  <div className='text-center'>
                                    <p className='font-semibold'>
                                      {' '}
                                      {fancy1Data[0]?.team?.split('(')[0]}
                                    </p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        {fancy1Data[0]?.odds[0].odds}
                                      </span>
                                      <span className='text-[10px]'>
                                        {' '}
                                        {fancy1Data[0]?.odds[0].size}
                                      </span>
                                    </span>
                                  </div>
                                  <div className='text-center'>
                                    <p className='font-semibold'>
                                      {fancy1Data[1]?.team?.split('(')[0]}
                                    </p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        1.5
                                      </span>
                                      <span className='text-[10px]'>3m</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className='bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]'>
                              <div className='flex justify-around p-3'>
                                <div className='grid justify-items-center text-center'>
                                  <p className='text-xs font-semibold'>
                                    {' '}
                                    {fancy1Data[0]?.team?.split('(')[0]}
                                  </p>
                                  <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                    <span className='text-[13px] font-semibold'>
                                      {fancy1Data[0]?.odds[0].odds}
                                    </span>
                                    <span className='text-[10px]'>
                                      {' '}
                                      {fancy1Data[0]?.odds[0].size}
                                    </span>
                                  </span>
                                  <span>
                                    {tossTeamamo(
                                      'Toss',
                                      fancy1Data[0]?.team?.split('(')[0]
                                    )}
                                  </span>
                                  {(() => {
                                    const { netOutcome, hasExistingBet } =
                                      getTossBetDetails(
                                        pendingBet,
                                        'Toss',
                                        fancy1Data[0]?.team?.split('(')[0]
                                      );
                                    if (hasExistingBet && netOutcome !== null) {
                                      return (
                                        <span
                                          className={`text-xs font-bold ${
                                            netOutcome >= 0
                                              ? 'text-green-600'
                                              : 'text-red-600'
                                          }`}
                                        >
                                          {netOutcome}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>

                                <div className='grid justify-items-center text-center'>
                                  <p className='text-xs font-bold md:text-[11px]'>
                                    {' '}
                                    {fancy1Data[1]?.team?.split('(')[0]}
                                  </p>
                                  <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                    <span className='text-[13px] font-semibold'>
                                      {fancy1Data[1]?.odds[0].odds}
                                    </span>
                                    <span className='text-[10px]'>
                                      {' '}
                                      {fancy1Data[1]?.odds[0].size}
                                    </span>
                                  </span>
                                  {(() => {
                                    const { netOutcome, hasExistingBet } =
                                      getTossBetDetails(
                                        pendingBet,
                                        'Toss',
                                        fancy1Data[1]?.team?.split('(')[0]
                                      );
                                    if (hasExistingBet && netOutcome !== null) {
                                      return (
                                        <span
                                          className={`text-xs font-bold ${
                                            netOutcome >= 0
                                              ? 'text-green-600'
                                              : 'text-red-600'
                                          }`}
                                        >
                                          {netOutcome}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
                {/* 1st 6 over matches */}
                {DISABLE_6_OVER_SECTION && (
                  <div className='mt-2'>
                    {over6Data.length > 0 &&
                      over6Data[0]?.team?.split('(')[0]?.includes('6 over') && (
                        <div>
                          <div className='mx-auto bg-gray-200 text-[13px]'>
                            <div className='flex items-center justify-between rounded-t-md bg-white'>
                              <div className='bg-blue flex gap-3 rounded-tr-3xl p-2 px-4 font-bold text-white'>
                                <span>Highest Score In 1st 6 Over </span>

                                <span className='mt-1 text-lg font-black'>
                                  <HiOutlineExclamationCircle />
                                </span>
                              </div>
                              <div className='font-bold'>
                                {over6Data[0].min} -{' '}
                                {formatToK(over6Data[0]?.max)}
                              </div>
                            </div>

                            {over6Data[0]?.status === 'SUSPENDED' ? (
                              <div className='relative mx-auto border-2 border-red-500'>
                                <div className='justify-centerz-10 absolute flex h-full w-full items-center bg-[#e1e1e17e]'>
                                  <p className='absolute left-1/2 -translate-x-1/2 transform text-3xl font-bold text-red-700'>
                                    SUSPENDED
                                  </p>
                                </div>
                                <div className='bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]'>
                                  <div className='flex justify-around p-3'>
                                    <div className='text-center'>
                                      <p className='font-semibold'>
                                        {' '}
                                        {over6Data[0]?.team?.split('(')[0]}
                                      </p>
                                      <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                        <span className='text-[13px] font-semibold'>
                                          {over6Data[0]?.odds[0].odds}
                                        </span>
                                        <span className='text-[10px]'>
                                          {' '}
                                          {over6Data[0]?.odds[0].size}
                                        </span>
                                      </span>
                                    </div>
                                    <div className='text-center'>
                                      <p className='font-semibold'>Kolkata</p>
                                      <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                        <span className='text-[13px] font-semibold'>
                                          1.5
                                        </span>
                                        <span className='text-[10px]'>3m</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className='bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]'>
                                <div className='flex justify-around p-3'>
                                  <div className='text-center'>
                                    <p className='font-semibold'>
                                      {' '}
                                      {over6Data[0]?.team?.split('(')[0]}
                                    </p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        {over6Data[0]?.odds[0].odds}
                                      </span>
                                      <span className='text-[10px]'>
                                        {' '}
                                        {over6Data[0]?.odds[0].size}
                                      </span>
                                    </span>
                                    {(() => {
                                      const { netOutcome, hasExistingBet } =
                                        getTossBetDetails(
                                          pendingBet,
                                          '1st 6 over',
                                          over6Data[0]?.team
                                        );
                                      if (
                                        hasExistingBet &&
                                        netOutcome !== null
                                      ) {
                                        return (
                                          <span
                                            className={`text-xs font-bold ${
                                              netOutcome >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}
                                          >
                                            {netOutcome}
                                          </span>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                  <div className='text-center'>
                                    <p className='font-semibold'>
                                      {' '}
                                      {over6Data[1]?.team?.split('(')[0]}
                                    </p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        {over6Data[1]?.odds[0].odds}
                                      </span>
                                      <span className='text-[10px]'>
                                        {' '}
                                        {over6Data[1]?.odds[0].size}
                                      </span>
                                    </span>
                                    {/* Show bet amount for THIS team */}
                                    {(() => {
                                      const { netOutcome, hasExistingBet } =
                                        getTossBetDetails(
                                          pendingBet,
                                          '1st 6 over',
                                          over6Data[1]?.team
                                        );
                                      if (
                                        hasExistingBet &&
                                        netOutcome !== null
                                      ) {
                                        return (
                                          <span
                                            className={`text-xs font-bold ${
                                              netOutcome >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}
                                          >
                                            {netOutcome}
                                          </span>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
                {/*fancy  */}

                <main className='mt-2 h-full bg-gray-100'>
                  <div className='mx-auto w-full overflow-hidden rounded-md bg-white'>
                    <div className='flex text-xs md:text-sm bg-[#2c3e50] text-white '>
                      <button
                        className={`flex items-center pl-3 py-2 ${
                          activeTab === 'fancy'
                            ? 'font-bold'
                            : ''
                        }`}
                        onClick={() => setActiveTab('fancy')}
                      >
                        <span>Fancy Bet</span>
                      </button>
                      <button
                        className={`flex items-center pl-3 py-2 ${
                          activeTab === 'sportsbook'
                            ? 'font-bold'
                            : ''
                        }`}
                        onClick={() => setActiveTab('sportsbook')}
                      >
                        <span>Sportsbook</span>
                      </button>
                    </div>

                    {activeTab === 'fancy' && (
                      <>
                        <div className='bg-color flex justify-start gap-1 overflow-x-auto scroll-smooth px-2 py-1 whitespace-nowrap text-black'>
                          {subTabs.map((tab) => (
                            <button
                              key={tab.id}
                              className={`px-2 py-1 text-xs ${
                                activeSubTab === tab.id
                                  ? 'rounded-t-md bg-white text-xs font-medium text-black'
                                  : ''
                              }`}
                              onClick={() => setActiveSubTab(tab.id)}
                            >
                              {tab.name}
                            </button>
                          ))}
                        </div>

                        <div className='overflow-x-auto'>
                          <div className='w-full text-xs'>
                            <div className=''>
                              <div className='grid grid-cols-6 border-b border-gray-400 text-xs'>
                                <span className='col-span-4 px-4 py-2 text-left md:col-span-3'></span>
                                <span className='col-span-1 bg-[#72bbef] px-4 py-2 text-center'>
                                  Yes
                                </span>
                                <span className='col-span-1 w-full bg-[#faa9ba] px-4 py-2 text-center'>
                                  No
                                </span>

                                <span className='col-span-1 hidden px-4 py-2 text-center md:block'>
                                  Min/Max
                                </span>
                              </div>
                            </div>
                            <div>
                              {fancy2Data.length > 0 ? (
                                fancy2Data.map(
                                  (
                                    { team, odds, min, max, status },
                                    index
                                  ) => (
                                    <div key={index} className='w-full'>
                                      <div className='grid grid-cols-6'>
                                        <span className='col-span-4 border-b border-gray-400 px-2 py-1 text-sm font-bold md:col-span-2 md:text-[11px]'>
                                          {team}
                                          <div className='flex items-center'>
                                            <p
                                              className='text-red-500'
                                              onClick={() => {
                                                if (
                                                  window.matchMedia(
                                                    '(max-width: 767px)'
                                                  ).matches
                                                ) {
                                                  handleOpenMasterBook(
                                                    team,
                                                    activeSubTab
                                                  );
                                                }
                                              }}
                                            >
                                              {
                                                pendingBet
                                                  ?.filter(
                                                    (item) =>
                                                      item.gameType ===
                                                        activeSubTab &&
                                                      item.teamName?.toLowerCase() ===
                                                        team?.toLowerCase()
                                                  )
                                                  .reduce(
                                                    (sum, item) =>
                                                      sum +
                                                      (item.totalPrice ||
                                                        '0.00'),
                                                    ''
                                                  ) // Changed initial value to 0
                                              }
                                            </p>
                                          </div>
                                        </span>
                                        <span className='hidden border-b border-gray-400 px-2 py-1 text-center md:block'>
                                          
                                        </span>
                                        {status === 'SUSPENDED' ? (
                                          <div className='item-center relative col-span-2 flex'>
                                            <div className='justify-centerz-10 absolute flex h-full w-full items-center bg-[#48484869]'>
                                              <p className='absolute left-1/2 -translate-x-1/2 transform text-white'>
                                                SUSPENDED
                                              </p>
                                            </div>

                                            {odds.slice(0, 2).map((odd, i) => (
                                              <span
                                                key={i}
                                                className={`w-full cursor-pointer border-b p-1 text-center ${
                                                  i === 0
                                                    ? 'bg-[#72bbef]'
                                                    : i === 1
                                                      ? 'bg-[#faa9ba]'
                                                      : i === 2
                                                        ? 'bg-[#72bbef]'
                                                        : i === 3
                                                          ? 'bg-[#faa9ba]'
                                                          : i === 4
                                                            ? 'bg-pink-200'
                                                            : 'bg-pink-100'
                                                }`}
                                                // onClick={() => {
                                                //   setSelectedRun(index);
                                                //   setCurrentOdd(odd);
                                                // }}
                                              >
                                                <div className='font-bold'>
                                                  {odd?.odds}
                                                </div>
                                                <div className='text-gray-800'>
                                                  {odd?.size}
                                                </div>
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className='item-center col-span-2 flex'>
                                            {' '}
                                            {/* This was likely col-span-4 (2 back + 2 lay for the actual odds) */}
                                            {odds.map(
                                              (odd, i) =>
                                                // ONLY RENDER IF odd.tno IS 0
                                                odd?.tno === 0 && ( // <-- Added this conditional rendering
                                                  <span
                                                    key={i}
                                                    className={`w-full cursor-pointer border-b p-1 text-center ${
                                                      odd?.otype === 'back'
                                                        ? 'bg-[#72bbef]'
                                                        : 'bg-[#faa9ba]'
                                                    }`}
                                                  >
                                                    <div className='cursor-pointer'>
                                                      <div className='font-bold'>
                                                        <span>{odd?.odds}</span>{' '}
                                                        {/* No need for tno === 0 check here, already filtered */}
                                                      </div>
                                                      <div className='text-gray-800'>
                                                        {odd?.size}
                                                      </div>
                                                    </div>
                                                  </span>
                                                )
                                            )}
                                          </div>
                                        )}
                                        <span className='col-span-1 hidden border-b border-gray-400 px-2 py-1 text-center font-semibold md:block'>
                                          {min} - {formatToK(max)}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )
                              ) : (
                                <tr>
                                  <td
                                    colSpan={5}
                                    className='py-4 text-center text-gray-500'
                                  >
                                    No betting options available for this
                                    category
                                  </td>
                                </tr>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === 'sportsbook' && (
                      <div className='mt-2 text-xs'>
                        <div className='space-y-3'>
                          {/* Odds/Evens Sections */}
                          {oddsDataraw.map((item, idx) => (
                            <div key={idx} className='overflow-hidden rounded'>
                              <div className='bg-orange px-4 py-2 font-semibold text-black'>
                                {item.title}
                              </div>
                              <div className='bg-gradient-to-l from-[#a2e5bd] to-[#9fe5bb]'>
                                <div className='flex justify-around p-3'>
                                  <div className='text-center'>
                                    <p className='font-semibold'>Kolkata</p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        1.5
                                      </span>
                                      <span className='text-[10px]'>3m</span>
                                    </span>
                                  </div>
                                  <div className='text-center'>
                                    <p className='font-semibold'>Kolkata</p>
                                    <span className='flex w-[100px] flex-col items-center justify-center border-[1px] border-white bg-[#72e3a0] py-0.5'>
                                      <span className='text-[13px] font-semibold'>
                                        1.5
                                      </span>
                                      <span className='text-[10px]'>3m</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* 5th Wicket Dismissal Method */}
                          <div className='overflow-hidden rounded'>
                            <div className='bg-orange px-4 py-2 text-xs font-semibold text-black'>
                              KKR 5th Wicket Dismissal Method
                            </div>
                            <div className='divide-y divide-gray-200'>
                              {dismissalData.map((item, idx) => (
                                <div
                                  key={idx}
                                  className='flex items-center justify-between border-b border-gray-500 px-4 py-1 transition'
                                >
                                  <span className='font-medium'>
                                    {item.method}
                                  </span>
                                  <span className='flex w-[100px] flex-col items-center justify-center bg-green-300 p-1 font-semibold'>
                                    {item.odds}
                                    <span className='text-xs'>100K</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </main>
              </div>
            </div>
            <div className='sm:w-full md:w-[40%]'>
              <div>
                <div className='flex items-center justify-between bg-[#2c3e50] py-1.5 px-3 text-black text-white text-[12px]'>
                  <div className="flex items-center gap-2">
                    <div className='flex items-center gap-1'>Odds 
                      <span className="w-[15px] h-[15px] rounded-sm text-[10px] flex items-center justify-center bg-black">
                        {betsData.filter(item => item.gameType === 'Match Odds').length}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>BM 
                      <span className="w-[15px] h-[15px] rounded-sm text-[10px] flex items-center justify-center bg-black">
                      {betsData.filter(item => item.gameType === 'Bookmaker').length}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>Fancy 
                      <span className="w-[15px] h-[15px] rounded-sm text-[10px] flex items-center justify-center bg-black">
                      {betsData.filter(item => item.gameType === 'Normal').length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className='flex items-center gap-1 bg-gradient-to-b from-gray-600 to-black border border-black rounded-sm px-2 py-0.5' onClick={() => setProfitLoss(true)}>P&L <GoGraph /></div>
                    <div className='flex items-center gap-1 bg-gradient-to-b from-gray-600 to-black border border-black rounded-sm px-2 py-0.5' onClick={() => setViewMoreDetail(true)}>All Bets <TfiMenuAlt /></div>
                  </div>
                </div>

                {betsData.length > 0 ? (
                  <div className=''>
                    <div className='flex border-b mt-[1px] border-gray-400 text-white bg-[#2c3e50] text-[11px] w-full'>
                      <div className='w-[15%] border-r px-1 py-1'>UserName</div>
                      <div className='w-[30%] border-r px-1 py-1'>Market</div>
                      <div className='w-[30%] border-r px-1 py-1'>Runner</div>
                      <div className='w-[10%] border-r px-1 py-1'>Rate</div>
                      <div className='w-[15%] px-1 py-1'>Amount</div>
                    </div>

                    {betsData.map((item) => (
                        <div key={item.id} className={`${item.otype === 'back' ? ' bg-[#beddf4]' : 'bg-[#faa9ba]'} flex w-full text-[11px] border-t border-white`}>
                          <div className='w-[15%] border-r border-white px-1 py-1'>
                            {item.userName}
                          </div>
                          <div className='w-[30%] border-r border-white px-1 py-1'>
                            {item.gameType}
                          </div>
                          <div className='w-[30%] border-r border-white px-1 py-1'>
                            {item.teamName}
                          </div>
                          <div className='w-[10%] border-r border-white px-1 py-1'>
                            {item.gameType === 'Normal'
                              ? `${item.fancyScore}/`
                              : ''}
                            {item.xValue}
                          </div>
                          <div className='w-[15%] px-1 py-1'>
                            
                            {item.otype === 'lay'
                              ? item.betAmount
                              : item.price}
                          </div>
                        </div>
                    ))}
                  </div>
                ) : (
                  <div className='items-center py-8 text-center'>
                    <h2>There are no any bet.</h2>
                  </div>
                )}










                {profitLoss && (
                  <div className='modal-overlay fixed h-full z-50 bg-black/20 top-0 left-0 w-full h-fit'>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className='fixed top-7 left-1/2 -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-full'
                    >
                      {/* Header */}
                      <div className='bg-yellow-400 flex items-center justify-between px-5 py-4 text-black'>
                        <h4 className='text-[16px] font-bold'>
                          Settled Market P&L
                        </h4>
                        <button
                          className='text-md font-bold text-black'
                          onClick={() => setProfitLoss(false)}
                        >
                          <AiFillCloseSquare size={25} />
                        </button>
                      </div>

                      {/* Body */}

                      <div className='p-3 bg-gray-200'>
                        {loading ? (
                          <div className='flex items-center justify-center py-10'>
                            <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'>
                              Loading...
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className='mb-4 text-[12px] md:flex-row'>
                              <div className='mb-2 font-bold' >Select Market Type</div>
                              <select
                                value={marketType}
                                onChange={(e) => setMarketType(e.target.value)}
                                className='border border-gray-300 bg-white px-2 py-1 outline-none w-[300px]'>
                                <option value=''>Select Market Type</option>
                                <option value='Match Odds'>Bet Fair</option>
                                <option value='Bookmaker'>Bookmaker</option>
                                <option value='Normal'>Fancy</option>
                              </select>
                            </div>

                            <table className='block w-full border-collapse overflow-x-auto border border-gray-300 md:table'>
                              <thead>
                                <tr className='bg-[#2c3e50] text-white text-[11px]'>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Market
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Declare Date & Time
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Winner
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Total Amount
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    P/L
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* {betsData?.length > 0 ? (
                                  betsData.map((item) => (
                                    <tr
                                      key={item.id}
                                      className={` text-[11px] ${item.otype === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}
                                    >
                                      <td className='px-[10px] py-[4px]'></td>
                                      <td className='px-[10px] py-[4px]'></td>
                                      <td className='px-[10px] py-[4px]'></td>
                                      <td className='px-[10px] py-[4px]'></td>
                                      <td className='px-[10px] py-[4px]'></td>
                                    </tr>
                                  ))
                                ) : ( */}
                                  <tr>
                                    <td colSpan='5' className='px-[10px] py-[4px] text-[12px]'>
                                      No Record found
                                    </td>
                                  </tr>
                                {/* )} */}
                              </tbody>
                            </table>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* view more popup */}
                {viewMoreDetail && (
                  <div className='modal-overlay fixed h-full z-50 bg-black/20 top-0 left-0 w-full h-fit'>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className='fixed top-7 left-1/2 -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-lg md:w-full'
                    >
                      {/* Header */}
                      <div className='bg-yellow-400 flex items-center justify-between px-5 py-4 text-black'>
                        <h4 className='text-[16px] font-bold'>
                          View More Bet
                        </h4>
                        <button
                          className='text-md font-bold text-black'
                          onClick={() => setViewMoreDetail(false)}
                        >
                          <AiFillCloseSquare size={25} />
                        </button>
                      </div>

                      {/* Body */}

                      <div className='p-3 bg-gray-200'>
                        {loading ? (
                          <div className='flex items-center justify-center py-10'>
                            <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent'>
                              Loading...
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className='mb-4 text-[12px] md:flex-row'>
                              <div className='mb-2 font-bold' >Select Market Type</div>
                              <select
                                value={marketType}
                                onChange={(e) => setMarketType(e.target.value)}
                                className='border border-gray-300 bg-white px-2 py-1 outline-none w-[300px]'>
                                <option value=''>Select Market Type</option>
                                <option value='Match Odds'>Bet Fair</option>
                                <option value='Bookmaker'>Bookmaker</option>
                                <option value='Normal'>Fancy</option>
                              </select>
                            </div>

                            <table className='block w-full border-collapse overflow-x-auto border border-gray-300 md:table'>
                              <thead>
                                <tr className='bg-[#2c3e50] text-white text-[11px]'>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    PL ID
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Bet ID
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Bet Placed
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Market
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Selection
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Type
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Odds req.
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Stake
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Liability
                                  </th>
                                  <th className='px-[10px] py-[5px] text-left'>
                                    Profit/Loss
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredData?.length > 0 ? (
                                  filteredData.map((item) => (
                                    <tr
                                      key={item.id}
                                      className={` text-[11px] ${item.otype === 'back' ? 'bg-[#72bbef]' : 'bg-[#faa9ba]'}`}
                                    >
                                      <td className='px-[10px] py-[4px]'
                                        // onClick={() => handelpopup(item.userId)}
                                      > {item.userName}
                                      </td>
                                      <td className='px-[10px] py-[4px]'>
                                        {item.userId}
                                      </td>
                                      <td className='px-[10px] py-[4px]'>
                                        {new Date(
                                          item.createdAt
                                        ).toLocaleString('en-IN')}
                                      </td>
                                      <td className='px-[10px] py-[4px] flex items-center gap-2 whitespace-nowrap'>
                                        {item.gameName}
                                        <MdPlayArrow />
                                        <span className="font-bold">{item.eventName}</span>
                                        <MdPlayArrow />
                                        {item.marketName}
                                      </td>
                                      <td className='px-[10px] py-[4px]'>
                                        {item.teamName}
                                      </td>
                                      <td className='px-[10px] py-[4px]'>
                                        {item.otype}
                                      </td>
                                      <td className='px-[10px] py-[4px]'>
                                        {item.xValue}
                                      </td>
                                      <td className='px-[10px] py-[4px]'>
                                        {item.price}
                                      </td>
                                      <td className='px-[10px] py-[4px]'>
                                        {item.otype === 'back' ? item.price : item.betAmount}
                                      </td>
                                      <td className={`px-[10px] py-[4px] ${item.betAmount < 0 ? 'text-red-700':'text-green-700'}`}>
                                        {item.betAmount}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td
                                      colSpan='10'
                                      className=' px-[10px] py-[9px] text-center'
                                    >
                                      No Detail found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* master list popup */}
                {masterpopup && (
                  <div className='modal-overlay fixed top-10 left-[25%] h-full'>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className='modal-content h-fit w-[95%] md:w-[50%]'
                    >
                      <div className='modal-header bg-color flex items-center justify-between'>
                        <span> Market List</span>
                        <span
                          className='text-lg'
                          onClick={() => setMasterpopup(false)}
                        >
                          {' '}
                          ×
                        </span>
                      </div>
                      <div className='modal-body p-4'>
                        <div className='border border-gray-300'>
                          {matchOdd?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hemdelMasterBook(
                                  '',
                                  matchOdd[0]?.gameType,
                                  matchOddsList
                                )
                              }
                            >
                              {matchOdd[0]?.gameType}
                            </h2>
                          )}
                          {tiedMatch?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hemdelMasterBook(
                                  '',
                                  tiedMatch[0]?.gameType,
                                  tiedMatchList
                                )
                              }
                            >
                              {tiedMatch[0]?.gameType}
                            </h2>
                          )}
                          {Bookmaker?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hemdelMasterBook(
                                  '',
                                  Bookmaker[0]?.gameType,
                                  BookmakerList
                                )
                              }
                            >
                              {Bookmaker[0]?.gameType}
                            </h2>
                          )}
                          {Toss?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hemdelMasterBook('', Toss[0]?.gameType, Toss)
                              }
                            >
                              {/* {Toss[0]?.gameType} */}
                              Which Team Will Win The Toss
                            </h2>
                          )}
                          {first6over?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hemdelMasterBook(
                                  '',
                                  first6over[0]?.gameType,
                                  first6over
                                )
                              }
                            >
                              {/* {Toss[0]?.gameType} */}
                              Highest Score In 1st 6 Over
                            </h2>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* master Book popup */}
                {showMasterDownline && masterDownline?.length > 0 && (
                  <div className='modal-overlay1 fixed top-10 left-[25%] z-[9999] h-full'>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className='modal-content h-fit w-[95%] rounded-lg bg-white shadow-lg md:w-[30%]'
                    >
                      <div className='modal-header bg-color flex items-center justify-between border-b p-3'>
                        <span className='font-semibold'>Master Book</span>
                        <span
                          className='cursor-pointer text-2xl'
                          onClick={() => {
                            setMasterDownline([]);
                            setShowMasterDownline(false);
                          }}
                        >
                          ×
                        </span>
                      </div>
                      <div className='modal-body p-4'>
                        <div className='overflow-x-auto'>
                          <table className='w-full border-collapse'>
                            <thead>
                              <tr className='bg-gray-200 text-center text-sm'>
                                <th className='border p-2'>Username</th>
                                <th className='border p-2'>Role</th>
                                {teamHeaders.map((team, idx) => (
                                  <th key={idx} className='border p-2'>
                                    {team}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {loading && (
                                <tr>
                                  <td colSpan={6} className='p-4 text-center'>
                                    Loading...
                                  </td>
                                </tr>
                              )}

                              {!loading && masterDownline?.length > 0 ? (
                                masterDownline.map((item, index) => (
                                  <tr
                                    key={index}
                                    className='text-center text-sm hover:bg-gray-100'
                                  >
                                    <td
                                      className='cursor-pointer border p-2 text-blue-500'
                                      onClick={() =>
                                        hemdelMasterBookDownline(item.id)
                                      }
                                    >
                                      {item.userName}
                                    </td>
                                    <td className='border p-2'>
                                      {item.userRole}
                                    </td>
                                    {teamHeaders.map((team, i) => {
                                      // Calculate the value to display
                                      let displayValue;
                                      if (item.otype === 'back') {
                                        displayValue =
                                          item.teamName === team
                                            ? item.totalBetAmount // Profit if this team wins
                                            : -item.totalPrice; // Loss if other team wins
                                      } else {
                                        // lay
                                        displayValue =
                                          item.teamName === team
                                            ? -item.totalPrice // Liability if this team wins
                                            : item.totalBetAmount; // Profit if other team wins
                                      }

                                      const roundedValue = pratnerShip(
                                        item.userRole,
                                        displayValue,
                                        item.partnership
                                      );
                                      const numericValue =
                                        parseFloat(roundedValue) || 0;
                                      const colorClass =
                                        numericValue >= 0
                                          ? 'text-green-600'
                                          : 'text-red-500';

                                      return (
                                        <td key={i} className='border p-2'>
                                          <span className={colorClass}>
                                            {roundedValue}
                                          </span>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className='py-4 text-center'>
                                    No data available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* user master list popup */}
                {userMasterpopup && (
                  <div className='modal-overlay fixed top-10 left-[25%] h-full'>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className='modal-content h-fit w-[95%] md:w-[50%]'
                    >
                      <div className='modal-header bg-color flex items-center justify-between'>
                        <span> Market List</span>
                        <span
                          className='text-2xl'
                          onClick={() => setUserMasterpopup(false)}
                        >
                          {' '}
                          ×
                        </span>
                      </div>
                      <div className='modal-body p-4'>
                        <div className='border border-gray-300'>
                          {matchOdd?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hendalUserBetsData(
                                  matchOdd[0]?.gameType,
                                  userInfo.code,
                                  matchOddsList
                                )
                              }
                            >
                              {matchOdd[0]?.gameType}
                            </h2>
                          )}
                          {tiedMatch?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hendalUserBetsData(
                                  tiedMatch[0]?.gameType,
                                  userInfo.code,
                                  tiedMatchList
                                )
                              }
                            >
                              {tiedMatch[0]?.gameType}
                            </h2>
                          )}
                          {Bookmaker?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hendalUserBetsData(
                                  Bookmaker[0]?.gameType,
                                  userInfo.code,
                                  BookmakerList
                                )
                              }
                            >
                              {Bookmaker[0]?.gameType}
                            </h2>
                          )}
                          {Toss?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hendalUserBetsData(
                                  Toss[0]?.gameType,
                                  userInfo.code,
                                  Toss
                                )
                              }
                            >
                              {/* {Toss[0]?.gameType} */}
                              Which Team Will Win The Toss
                            </h2>
                          )}
                          {first6over?.length > 0 && (
                            <h2
                              className='cursor-pointer border-b border-gray-300 p-2 text-sm hover:bg-gray-200'
                              onClick={() =>
                                hendalUserBetsData(
                                  first6over[0]?.gameType,
                                  userInfo.code,
                                  first6over
                                )
                              }
                            >
                              {/* {first6over[0]?.gameType} */}
                              Highest Score In 1st 6 Over
                            </h2>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* user Book popup */}
                {userBet?.length > 0 && (
                  <div className='modal-overlay1 fixed top-10 left-[25%] h-full'>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className='modal-content h-fit w-[95%] md:w-[30%]'
                    >
                      <div className='modal-header bg-color flex items-center justify-between'>
                        <span> User Book</span>
                        <span
                          className='text-2xl'
                          onClick={() => setUserBet(null)}
                        >
                          {' '}
                          ×
                        </span>
                      </div>
                      <div className='modal-body p-4'>
                        <div className='overflow-x-auto'>
                          <table className='w-full border-collapse'>
                            <thead>
                              <tr className='bg-gray-200 text-center'>
                                <th className='border border-gray-300 p-2 text-left'>
                                  <div className='flex items-center justify-center text-[13px]'>
                                    Username
                                  </div>
                                </th>
                                <th className='border border-gray-300 p-2 text-left'>
                                  <div className='flex items-center justify-center text-[13px]'>
                                    Role
                                  </div>
                                </th>
                                {teamHeaders.map((team, index) => (
                                  <th
                                    key={index}
                                    className='border border-gray-300 p-2 text-left'
                                  >
                                    <div className='flex items-center justify-center text-[13px]'>
                                      {team}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {loading && (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className='border border-gray-300 p-4 text-center'
                                  >
                                    Loading...
                                  </td>
                                </tr>
                              )}
                              {!loading && userBet?.length > 0 ? (
                                userBet.map((item, index) => (
                                  <tr
                                    key={index}
                                    className='text-center text-sm font-semibold hover:bg-gray-100'
                                  >
                                    <td className='cursor-pointer border border-gray-300 p-2 text-[#2789ce]'>
                                      {item.userName}
                                    </td>

                                    <td className='border border-gray-300 p-2'>
                                      {item.userRole}
                                    </td>

                                    {/* Loop through team headers for dynamic columns */}
                                    {teamHeaders.map((team, i) => {
                                      // Check if bet matches any team in the current match
                                      const isMatchedTeam =
                                        item.teamName?.toLowerCase() ===
                                        team?.toLowerCase();
                                      const betMatchesAnyTeam =
                                        teamHeaders.some(
                                          (t) =>
                                            item.teamName?.toLowerCase() ===
                                            t?.toLowerCase()
                                        );

                                      // If bet doesn't belong to this match, show 0
                                      if (!betMatchesAnyTeam) {
                                        return (
                                          <td
                                            key={i}
                                            className='border border-gray-300 p-2'
                                          >
                                            <span className='text-gray-400'>
                                              0
                                            </span>
                                          </td>
                                        );
                                      }

                                      // Calculate display value
                                      let displayValue;
                                      if (item.otype === 'back') {
                                        displayValue = isMatchedTeam
                                          ? item.betAmount || 0 // Profit if this team wins
                                          : -(item.price || 0); // Loss if other team wins
                                      } else {
                                        // lay
                                        displayValue = isMatchedTeam
                                          ? -(item.price || 0) // Liability if this team wins
                                          : item.betAmount || 0; // Profit if other team wins
                                      }

                                      // Round to 2 decimal places
                                      const roundedValue =
                                        Math.round(displayValue * 100) / 100;

                                      // Color based on actual value (positive = green, negative = red)
                                      const colorClass =
                                        roundedValue >= 0
                                          ? 'text-green-500'
                                          : 'text-red-500';

                                      return (
                                        <td
                                          key={i}
                                          className='border border-gray-300 p-2'
                                        >
                                          <span className={colorClass}>
                                            {roundedValue}
                                          </span>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className='border border-gray-300 p-4 text-center'
                                  >
                                    No data available in table
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* user bet presents popup */}
            </div>
            <div>
              {popup && (
                <div className='bg-opacity-50 fixed inset-0 z-9999 flex items-start justify-center bg-[#0000005d]'>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className='mt-7 w-[96%] rounded-lg bg-white shadow-lg md:w-150'
                  >
                    {/* Header */}
                    <div className='bg-color flex items-center justify-between px-4 py-1.5 font-bold text-white'>
                      <span>Parent List</span>
                      <button
                        onClick={() => setPopup(false)}
                        className='text-xl text-white'
                      >
                        ×
                      </button>
                    </div>

                    {/* Commission List */}
                    <div className='space-y-2 p-4'>
                      {[...betPerantsData].reverse().map((item, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-center border border-gray-300 px-4 py-2 text-center font-semibold'
                        >
                          <span>{item.userName}</span>
                          <span>
                            <span>({item.role.toUpperCase()})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {masterBookPopup.show && (
        <FancyMasterBookPopup
          teamName={masterBookPopup.teamName}
          onClose={() => setMasterBookPopup({ show: false, teamName: '' })}
        />
      )}
    </div>
  );
}
