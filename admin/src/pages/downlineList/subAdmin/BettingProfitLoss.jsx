import React, { useState, useEffect } from "react";
import Navigation from "../../../components/downListComp/subAdmin/Navigation";
import ProfitLossTable from "./ProfitLossTable";
import ProfitLossTableCasino from "../admin/ProfitLossTableCasino";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../../utils/axiosInstance";

const ExchangeData = [];
const Fancydata = [];
const bookmakerdata = [];
const casinodata = [];

function BettingProfitLoss() {
  const { userId, role } = useParams();
  const [bettingData, setbettingData] = useState(ExchangeData);
  const [selected] = useState("ProfitLoss");
  const [selectedType, setselectedType] = useState("Exchange");
  const [loading, setLoading] = useState(false);
  const [UserInfo, setUserInfo] = useState([]);

  const title = {
    superadmin: "SUD",
    admin: "AD",
    subadmin: "SAD",
    seniorSuper: "SSM",
    superAgent: "SA",
    agent: "AG",
    user: "CL",
  };

  const user = useSelector((state) => state.auth.user);

  const mapSelectedTypeToSelectedGame = (type) => {
    switch (type) {
      case "Exchange":
        return "matchoods";
      case "FancyBet":
        return "Normal";
      case "TiedMatch":
        return "Tied Match";
      case "BookMaker":
        return "Bookmaker";
      case "Casino":
        return "Casino";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (!userId) return;
    const fetchUserInfo = async () => {
      try {
        const response = await axiosInstance.get(`/get/user-profile/${userId}`);
        setUserInfo(response.data.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, [userId]);

  const getDefaultDates = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      startDate: yesterday.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  };

  const [startDate, setStartDate] = useState(() => getDefaultDates().startDate);
  const [endDate, setEndDate] = useState(() => getDefaultDates().endDate);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");

  const fetchProfitLossData = async (
    customStartDate = null,
    customEndDate = null,
    customStartTime = null,
    customEndTime = null
  ) => {
    try {
      setLoading(true);
      const useStartDate = customStartDate || startDate;
      const useEndDate = customEndDate || endDate;
      const useStartTime = customStartTime || startTime;
      const useEndTime = customEndTime || endTime;
      const selectedGame = mapSelectedTypeToSelectedGame(selectedType);

      let queryParams = `page=1&limit=10&targetUserId=${userId}&selectedGame=${encodeURIComponent(selectedGame)}`;
      if (useStartDate && useEndDate) {
        queryParams += `&startDate=${useStartDate}&endDate=${useEndDate}&startTime=${useStartTime}&endTime=${useEndTime}`;
      }

      const response = await axiosInstance.get(
        `/get/profit-loss-by-downline-reports-userData-v2?${queryParams}`
      );

      if (response.data.success) {
        const transformedData = response.data.data.map((item) => ({
          sport: item.gameName,
          match: item.eventName,
          settled: new Date(item.settledDate).toLocaleString(),
          profitLoss: item.totalProfitLoss,
          expanded: false,
          bets: item.bets.map((bet) => ({
            username: bet.userName,
            betId: bet.betId,
            selection: bet.selection,
            odds: bet.odds,
            stake: bet.stake,
            type: bet.type,
            placed: new Date(bet.placedAt).toLocaleString(),
            pnl: bet.profitLoss,
          })),
        }));
        setbettingData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching profit/loss data:", error);
      setbettingData(ExchangeData);
    } finally {
      setLoading(false);
    }
  };

  const fetchCasinoData = async (
    customStartDate = null,
    customEndDate = null,
    customStartTime = null,
    customEndTime = null
  ) => {
    try {
      setLoading(true);
      const useStartDate = customStartDate || startDate;
      const useEndDate = customEndDate || endDate;
      const useStartTime = customStartTime || startTime;
      const useEndTime = customEndTime || endTime;

      let queryParams = `id=${userId}&page=1&limit=100`;
      if (useStartDate && useEndDate) {
        queryParams += `&startDate=${useStartDate}&endDate=${useEndDate}&startTime=${useStartTime}&endTime=${useEndTime}`;
      }

      const response = await axiosInstance.get(`/casino/all-bet-history?${queryParams}`);

      if (response.data.success && response.data.data.length > 0) {
        const groupedData = {};
        response.data.data.forEach((bet) => {
          const key = `${bet.game_uid}_${bet.game_round}`;
          if (!groupedData[key]) {
            groupedData[key] = {
              sport: "Casino",
              match: bet.game_uid || "Unknown Game",
              settled: new Date(bet.provider_timestamp || bet.createdAt).toLocaleString(),
              profitLoss: 0,
              expanded: false,
              bets: [],
            };
          }
          groupedData[key].bets.push({
            sport: bet.game_uid || "Casino",
            validTurnover: bet.bet_amount || 0,
            winLoss: bet.win_amount || 0,
            ptComm: 0,
            profitLoss: bet.change || 0,
          });
          groupedData[key].profitLoss += bet.change || 0;
        });
        setbettingData(Object.values(groupedData));
      } else {
        setbettingData([]);
      }
    } catch (error) {
      console.error("Error fetching casino data:", error);
      setbettingData(casinodata);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedType === "Casino") {
      fetchCasinoData();
    } else if (
      selectedType === "Exchange" ||
      selectedType === "FancyBet" ||
      selectedType === "BookMaker" ||
      selectedType === "TiedMatch"
    ) {
      fetchProfitLossData();
    } else {
      setbettingData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, userId]);
  return (
    <div className="p-2 mt-4 font-['Times_New_Roman']">
      <div
        className="flex gap-4 border border-[#bbb] rounded shadow-inner px-4 py-2 w-fit"
        style={{
          background: "linear-gradient(180deg, #fff, #eee)",
          boxShadow: "inset 0 2px 0 0 #ffffff80",
        }}
      >
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            AD
          </span>
          <span className="text-sm font-bold">bajivaiadminbdt</span>
        </div>
        <div className="flex font-['Times_New_Roman'] gap-2">
          <span className="bg-[#d77319] rounded-[5px] text-[10px] px-2 py-1 text-white font-semibold">
            SSM
          </span>
          <span className="text-sm font-bold">testseniorsuper</span>
        </div>
      </div>

      <div className="flex mt-4 gap-4">
        <Navigation selected={selected} userId={userId} role={role} />
        <div className="font-['Times_New_Roman'] flex-1 mb-5">
          <h2 className="text-[#243a48] text-[16px] font-[700]">
            Betting Profit Loss
          </h2>
          <div className="mt-4">
            <div className="border-b-2 border-b-[#060316]">
              <ul className='flex gap-1'>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'Exchange'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("Exchange")}
                >
                  Exhange</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'FancyBet'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("FancyBet")}
                >
                  FancyBet</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'BookMaker'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("BookMaker")}
                >
                  BookMaker</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'Casino'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("Casino")}
                >
                  Casino</li>
                <li className={`text-[#3b5160] text-[13px] font-[700] px-4 py-1 rounded-t-sm  border border-[#3b5160]  cursor-pointer ${selectedType === 'TiedMatch'? 'bg-[#ffa00c]': 'bg-gradient-to-t from-[#eee] to-[#fff]'}`}
                onClick={()=>setselectedType("TiedMatch")}
                >
                  TiedMatch</li>
              </ul>
            </div>
            <div className="bg-[#e0e6e6] border-b border-b-[#7e97a7] p-2">
              <div className="flex justify-between items-center gap-2 mt-3">
                <div className="flex justify-center items-center gap-2">
                  <label htmlFor="betStatus" className="text-xs font-[700]">
                    Bet Status
                  </label>
                  <select
                    name=""
                    id=""
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
                  >
                    <option value="Unmatched">Unmatched</option>
                    <option value="Matched">Matched</option>
                    <option value="Settled">Settled</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Voided">Voided</option>
                  </select>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <label htmlFor="startDate" className="text-xs font-[700]">
                    From
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2"
                  />
                </div>
                <div className="flex justify-center items-center gap-2">
                  <label htmlFor="endDate" className="text-xs font-[700]">
                    To
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] bg-[#fff] min-w-[170px] text-xs p-2"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="border border-[#aaa] shadow-[inset_0_2px_0_0_#0000001a] text-xs p-2"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2 pb-2">
                <button
                  className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    setStartDate(today);
                    setEndDate(today);
                    setStartTime("00:00");
                    setEndTime("23:59");
                    if (selectedType === "Casino") fetchCasinoData(today, today, "00:00", "23:59");
                    else fetchProfitLossData(today, today, "00:00", "23:59");
                  }}
                >
                  Just For Today
                </button>
                <button
                  className="border border-[#bbb] text-xs font-[700] bg-[linear-gradient(180deg,_#fff,_#eee)] p-2 rounded-sm cursor-pointer"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split("T")[0];
                    setStartDate(yesterdayStr);
                    setEndDate(yesterdayStr);
                    setStartTime("00:00");
                    setEndTime("23:59");
                    if (selectedType === "Casino") fetchCasinoData(yesterdayStr, yesterdayStr, "00:00", "23:59");
                    else fetchProfitLossData(yesterdayStr, yesterdayStr, "00:00", "23:59");
                  }}
                >
                  From Yesterday
                </button>
                <button
                  className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer"
                  onClick={() => {
                    if (selectedType === "Casino") fetchCasinoData();
                    else fetchProfitLossData();
                  }}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Get History"}
                </button>
                <button
                  className="border border-[#cb8009] text-xs font-[700] bg-[#ffcc2f] p-2 rounded-sm hover:bg-[#ffa00c] cursor-pointer"
                  onClick={() => {
                    const defaultDates = getDefaultDates();
                    setStartDate(defaultDates.startDate);
                    setEndDate(defaultDates.endDate);
                    setStartTime("00:00");
                    setEndTime("23:59");
                    if (selectedType === "Casino") {
                      fetchCasinoData(defaultDates.startDate, defaultDates.endDate, "00:00", "23:59");
                    } else {
                      fetchProfitLossData(defaultDates.startDate, defaultDates.endDate, "00:00", "23:59");
                    }
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-[14px]">
                Betting History enables you to review the bets you have placed.
                Specify the time period during which your bets were placed, the
                type of markets on which the bets were placed, and the sport.
              </p>
              <p className="text-[14px] mt-2">
                Betting History is available online for the past 30 days.
              </p>
            </div>
            <div className="mt-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm">Loading data...</span>
                </div>
              ) : selectedType === "Casino" ? (
                <ProfitLossTableCasino bettingData={bettingData} />
              ) : (
                <ProfitLossTable bettingData={bettingData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BettingProfitLoss;
