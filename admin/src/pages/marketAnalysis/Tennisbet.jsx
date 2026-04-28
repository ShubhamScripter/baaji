import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; //eslint-disable-line
import { useDispatch, useSelector } from 'react-redux';

import {
  getPendingBetAmo,
  fetchTannisBatingData,
  // getBetPerents,
  masterBookReducer,
  masterBookReducerDownline,
} from '../../store/marketAnalyzeReducer';
// import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import { FaArrowRight } from 'react-icons/fa';
import Spinner from '../../components/Spinner';
import { host } from '../redux/api';
import { MdOutlineKeyboardArrowRight, MdPlayArrow } from 'react-icons/md';
import { GoGraph } from "react-icons/go";
import { TfiMenuAlt } from "react-icons/tfi";
import { AiFillCloseSquare } from 'react-icons/ai';
export default function Tennisbet() {
  const [bettingData, setBettingData] = useState(null);
  const dispatch = useDispatch();
  const { gameid } = useParams() || {};
  const [showMasterDownline, setShowMasterDownline] = useState(false);
  // const [scoreUrl, setScoreUrl] = useState(false);
  // const [url, setUrl] = useState('');
  const [activeIframe, setActiveIframe] = useState(null);
  const [masterpopup, setMasterpopup] = useState(false);
  const [userMasterpopup, setUserMasterpopup] = useState(false);
  // const [liveBets, setLiveBets] = useState([]);
  const [userBet, setUserBet] = useState([]);
  const [storedGameType, setStoredGameType] = useState(null);
  const [storedMatchOddsList, setStoredMatchOddsList] = useState([]);
  const [teamHeaders, setTeamHeaders] = useState([]);
  const [masterDownline, setMasterDownline] = useState([]);
  const [profitLoss, setProfitLoss] = useState(false);
  const [marketType, setMarketType] = useState("");
  const [viewMoreDetail, setViewMoreDetail] = useState(false);
  // const [entriesPerPage, setEntriesPerPage] = useState(10);
  // const [searchTerm, setSearchTerm] = useState('');
  const {
    loading,
    pendingBet,
    battingData,
    betsData,
    betPerantsData,
    masterData,
    masterDataDownline,
  } = useSelector((state) => state.market);
  const { userInfo } = useSelector((state) => state.auth);

  // Initial fetch
  useEffect(() => {
    if (gameid) {
      dispatch(fetchTannisBatingData(gameid));
    }
  }, [gameid, dispatch]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!gameid) return;

    const socket = new WebSocket(host);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({ type: 'subscribe', gameid, apitype: 'tennis' })
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
    setBettingData(battingData);
  }, [battingData]);

  useEffect(() => {
    dispatch(getPendingBetAmo(gameid));
  }, [dispatch]);

  const matchOddsList = Array.isArray(bettingData)
    ? bettingData.filter((item) => item.mname === 'MATCH_ODDS')
    : [];

  const matchOdd = Array.isArray(betsData)
    ? betsData.filter(
        (item) => item?.gameType === 'Match Odds' || item?.gameType === 'Winner'
      )
    : [];

  const oddsData =
    Array.isArray(matchOddsList) &&
    matchOddsList.length > 0 &&
    matchOddsList[0].section
      ? matchOddsList[0].section.map((sec) => ({
          team: sec.nat,
          sid: sec.sid,
          odds: sec.odds,
          mname: 'Match Odds',
          status: matchOddsList[0].status,
        }))
      : [];
console.log('oddsData',oddsData);
  const getFixedOrderedOdds = (odds, options = {}) => {
    const { onlyTnoZero = false } = options;
    const source = Array.isArray(odds)
      ? onlyTnoZero
        ? odds.filter((item) => item?.tno === 0)
        : odds
      : [];

    const order = ['back3', 'back2', 'back1', 'lay1', 'lay2', 'lay3'];
    const byName = new Map(
      source
        .filter((item) => typeof item?.oname === 'string')
        .map((item) => [item.oname.toLowerCase(), item])
    );

    return order.map((key) => byName.get(key) || null);
  };
console.log('getFixedOrderedOdds',getFixedOrderedOdds)
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

  useEffect(() => {
    if (masterData?.length > 0) {
      setMasterDownline(masterData); // ⬅️ For first-level data
    }
  }, [masterData]);

  useEffect(() => {
    if (masterDataDownline?.length > 0) {
      setMasterDownline(masterDataDownline); // ⬅️ For downline drill
    }
  }, [masterDataDownline]);

  // Helper function
  const getBetDetails = (pendingBet, matchData, team) => {
    const marketBets =
      pendingBet?.filter((item) => item.gameType === matchData?.mname) || [];

    // If no bets, return empty
    if (marketBets.length === 0) {
      return {
        isHedged: false,
        netOutcome: null,
        displayAmount: null,
        otype: '',
        totalBetAmount: '',
        totalPrice: '',
        teamName: '',
        isMatchedTeam: false,
      };
    }

    // Find bet specifically for current team
    const matchedTeamBet = marketBets.find(
      (item) => item.teamName?.toLowerCase() === team?.toLowerCase()
    );

    // Always calculate NET outcome if THIS team wins
    // This works whether bets are on one team or multiple teams
    let netOutcome = 0;

    marketBets.forEach((bet) => {
      const isBetOnThisTeam =
        bet.teamName?.toLowerCase() === team?.toLowerCase();
      const betAmount = parseFloat(bet.totalBetAmount) || 0;
      const stake = parseFloat(bet.totalPrice) || 0;

      if (bet.otype === 'back') {
        if (isBetOnThisTeam) {
          netOutcome += betAmount;
        } else {
          netOutcome -= stake;
        }
      } else {
        if (isBetOnThisTeam) {
          netOutcome -= stake;
        } else {
          netOutcome += betAmount;
        }
      }
    });

    return {
      isHedged: true,
      netOutcome: Math.round(netOutcome * 100) / 100,
      otype: matchedTeamBet?.otype || marketBets[0]?.otype || '',
      totalBetAmount:
        matchedTeamBet?.totalBetAmount || marketBets[0]?.totalBetAmount || '',
      totalPrice: matchedTeamBet?.totalPrice || marketBets[0]?.totalPrice || '',
      teamName: matchedTeamBet?.teamName || marketBets[0]?.teamName || '',
      isMatchedTeam: !!matchedTeamBet,
    };
  };

  // Inside your React functional component (e.g., in a file like MyComponent.jsx)
  function MyComponent({ team, matchData, pendingBet }) {
    const { otype, totalBetAmount, totalPrice, teamName } = getBetDetails(
      pendingBet,
      matchData,
      team
    );

    const betDetails = getBetDetails(pendingBet, matchData, team);
    const {
      isHedged,
      netOutcome,
      displayAmount,
      isMatchedTeam: isMatchedFromDetails,
    } = betDetails;

    const isMatchedTeam =
      isMatchedFromDetails !== undefined
        ? isMatchedFromDetails
        : teamName?.toLowerCase() === team?.toLowerCase();

    const existingBet =
      (otype && totalBetAmount) ||
      (totalPrice && teamName) ||
      isHedged ||
      displayAmount !== null
        ? true
        : false;

    // Determine the actual value to display
    let actualDisplayValue;
    if (isHedged) {
      actualDisplayValue = netOutcome;
    } else if (displayAmount !== null && displayAmount !== undefined) {
      actualDisplayValue = displayAmount;
    } else if (otype === 'lay') {
      actualDisplayValue = isMatchedTeam ? totalPrice : totalBetAmount;
    } else if (otype === 'back') {
      actualDisplayValue = isMatchedTeam ? totalBetAmount : totalPrice;
    } else {
      actualDisplayValue = null;
    }

    // Color based on actual value - simple logic: negative = red, positive/zero = green
    const numericValue = parseFloat(actualDisplayValue) || 0;
    const betColor =
      existingBet && actualDisplayValue !== null
        ? numericValue >= 0
          ? 'green'
          : 'red'
        : 'green';

    const displayValue = (() => {
      if (!existingBet || actualDisplayValue === null) {
        return null;
      }

      return (
        <span className='flex items-center gap-0.5'>
          <FaArrowRight />
          {actualDisplayValue}
        </span>
      );
    })();

    // console.log("existingBet", existingBet)

    return (
      <div className='col-span-5 pl-1 py-1.5 text-left text-sm font-bold md:col-span-3 md:text-[11px]'>
        <div>
          <p>{team}</p>
          <p style={{ color: betColor }}>{displayValue || '0.00'}</p>
        </div>
      </div>
    );
  }

  const [popup, setPopup] = useState(false);
  // const handelpopup = async (id) => {
  //   setPopup(true);
  //   await dispatch(getBetPerents(id));
  //   // console.log("idddd", id);
  // };

  const formatToK = (num) => {
    if (!num || num < 1000) return num;
    const n = Number(num) / 1000;
    return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}k`;
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
  return (
    <div className='relative'>
      {loading ? (
        <div className='py-4 text-center'>
          <Spinner />
        </div>
      ) : (
        <div className='flex w-full flex-col p-1 md:flex-row justify-between md:p-3 bg-gray-200'>
          <div className='sm:w-full md:w-[59%] mr-[1%]'>
            <div>
              <div className='flex items-center justify-between bg-[#2c3e50] py-1.5 px-3 text-white text-[12px]'>
                <span className='flex flex-1 items-center'>
                  Event name <MdOutlineKeyboardArrowRight /> Category Name
                </span>
                <span className=''>
                  Date/Time
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
                  src={`https://test.bulkapi.co.in/api/v1/live-stream?gmid=${gameid}&key=gk_db1cb19180dd6dc5657140d56d29c138099808c7a1196c52`}
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
                  src={`https://test.bulkapi.co.in/api/v1/live-scorecard?gmid=${gameid}&key=gk_db1cb19180dd6dc5657140d56d29c138099808c7a1196c52&sportid=2`}
                  allowFullScreen
                  className='w-full rounded-lg'
                  style={{ height: '50vh' }}
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


              <div>
                {oddsData.length > 0 && (
                  <div>
                    <div className='mx-auto bg-gray-200 text-[13px]'>
                      <div className='flex items-center justify-between bg-[#2c3e50] text-white px-3 py-1.5 mt-1'>
                          <span>{oddsData[0]?.mname}</span>
                          <span>Min: {matchOddsList[0]?.min} | Max: {formatToK(matchOddsList[0]?.maxb)}</span>
                      </div>

                      {oddsData[0]?.status === 'SUSPENDED' ? (
                        <div className='relative mx-auto border-2 border-red-500'>
                          <div className='justify-centerz-10 absolute flex h-full w-full items-center bg-[#e1e1e17e]'>
                            <p className='absolute left-1/2 -translate-x-1/2 transform text-3xl font-bold text-red-700'>
                              SUSPENDED
                            </p>
                          </div>

                          <div className='grid grid-cols-9 border-b border-gray-300 bg-white text-center'>
                            <div className='col-span-5 p-1 md:col-span-5 text-left'>
                              Min: {matchOddsList[0]?.min} | Max: {formatToK(matchOddsList[0]?.maxb)}
                            </div>
                            <div className='col-span-2 bg-[#72bbef] p-1 font-bold text-slate-800 md:col-span-1 md:md:rounded-tl-xl m-0.5'>
                              Back
                            </div>
                            <div className='col-span-2 bg-[#faa9ba] p-1 font-bold text-slate-800 md:col-span-1 md:md:rounded-tr-xl m-0.5'>
                              Lay
                            </div>
                            <div className='col-span-2 hidden rounded-lg p-1 text-[11px] font-semibold md:block'></div>
                          </div>
                          {oddsData.map(({ team, odds }, index) => (
                            <div key={index}>
                              <div className='grid grid-cols-9 border-b border-gray-300 bg-white text-center text-[10px] font-semibold'>
                                <div className='col-span-5 pl-1 py-1.5 text-left text-sm font-bold md:col-span-3 md:text-[11px]'>
                                  {team}
                                </div>
                                {getFixedOrderedOdds(odds).map((odd, i) => {
                                  return (
                                  <div
                                    key={i}
                                    className={`col-span-2 p-1 m-0.5 md:col-span-1 ${
                                      i === 0
                                        ? 'hidden bg-sky-100 md:block'
                                        : i === 1
                                          ? 'hidden bg-sky-200 md:block'
                                          : i === 2
                                            ? 'bg-[#72bbef] '
                                            : i === 3
                                              ? 'bg-[#faa9ba]'
                                              : i === 4
                                                ? 'hidden bg-pink-200 md:block'
                                                : 'hidden bg-pink-100 md:block'
                                    }`}
                                  >
                                    {odd ? (
                                      <>
                                        <div className='font-bold'>{odd.odds}</div>
                                        <div className='text-gray-800'>{formatToK(odd.size)}</div>
                                      </>
                                    ) : (
                                      <div className='opacity-30'>--</div>
                                    )}
                                  </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <div className='grid grid-cols-9 border-b border-gray-300 bg-white text-center'>
                            <div className='col-span-5 p-1 md:col-span-5 text-left'>
                              Min: {matchOddsList[0]?.min} | Max: {formatToK(matchOddsList[0]?.maxb)}
                            </div>
                            <div className='col-span-2 bg-[#72bbef] p-1 font-bold text-slate-800 md:col-span-1 md:md:rounded-tl-xl m-0.5'>
                              Back
                            </div>
                            <div className='col-span-2 bg-[#faa9ba] p-1 font-bold text-slate-800 md:col-span-1 md:md:rounded-tr-xl m-0.5'>
                              Lay
                            </div>
                            <div className='col-span-2 hidden rounded-lg p-1 text-[11px] font-semibold md:block'></div>
                          </div>
                          {oddsData.map(({ team, odds }, index) => (
                            <div key={index}>
                              <div className='grid grid-cols-9 border-b border-gray-300 bg-white text-center text-[10px] font-semibold'>
                                <MyComponent
                                  key={team}
                                  team={team}
                                  matchData={oddsData[0]}
                                  pendingBet={pendingBet}
                                  index={index}
                                  // oddsValue={odd?.odds}
                                />
                                {getFixedOrderedOdds(odds).map((odd, i) => {
                                  return (
                                      <div
                                        key={i}
                                        className={`col-span-2 p-1 m-0.5 md:col-span-1 ${
                                          i === 0
                                            ? 'hidden bg-sky-100 md:block'
                                            : i === 1
                                              ? 'hidden bg-sky-200 md:block'
                                              : i === 2
                                                ? 'bg-[#72bbef] '
                                                : i === 3
                                                  ? 'bg-[#faa9ba]'
                                                  : i === 4
                                                    ? 'hidden bg-pink-200 md:block'
                                                    : 'hidden bg-pink-100 md:block'
                                        }`}
                                      >
                                        {odd ? (
                                          <>
                                            <div className='font-bold'>{odd.odds}</div>
                                            <div className='text-gray-800'>{formatToK(odd.size)}</div>
                                          </>
                                        ) : (
                                          <div className='opacity-30'>--</div>
                                        )}
                                      </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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

              {/* Pl popup */}
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


              <div className='text-red-500'
                onClick={() =>
                  hemdelMasterBook(
                    '',
                    matchOdd[0]?.gameType,
                    matchOddsList
                  )
                }
              >
                  Downline pnl
              </div>






              {/* master list popup */}
              {masterpopup && (
                <div className='modal-overlay fixed top-10 left-0 z-50 w-full'>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className='modal-content w-full'
                  >
                    <div className='modal-header bg-color flex justify-between bg-yellow-400'>
                      <span> Market List</span>
                      <span
                        className='text-lg'
                        onClick={() => setMasterpopup(false)}
                      >
                        {' '}
                        X
                      </span>
                    </div>
                    <div className='modal-body p-4 bg-white'>
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
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* master Book popup */}
              {showMasterDownline && masterDownline?.length > 0 && (
                <div className='modal-overlay1 fixed top-10 left-0 w-full z-[9999] h-full'>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                    className='modal-content h-fit w-full rounded-lg bg-white shadow-lg'
                  >
                    <div className='modal-header bg-color flex justify-between border-b p-3'>
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
                    <div className='modal-header bg-color flex justify-between'>
                      <span> Market List</span>
                      <span
                        className='text-2xl'
                        onClick={() => setUserMasterpopup(false)}
                      >
                        {' '}
                        X
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
                    <div className='modal-header bg-color flex justify-between'>
                      <span> User Book</span>
                      <span
                        className='text-2xl'
                        onClick={() => setUserBet(null)}
                      >
                        {' '}
                        X
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
                                    const betMatchesAnyTeam = teamHeaders.some(
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
              <div className='bg-opacity-50 fixed inset-0 z-[100] flex items-start justify-center bg-[#0000005d]'>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                  className='mt-1 w-94 rounded-lg bg-white shadow-lg md:w-150'
                >
                  {/* Header */}
                  <div className='bg-color flex justify-between px-4 py-1.5 font-bold text-white'>
                    <span>Parent List</span>
                    <button
                      onClick={() => setPopup(false)}
                      className='text-xl text-white'
                    >
                      X
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
  );
}
