import { useEffect, useState } from "react";
import api from "../utils/axiosConfig";

const defaultLocks = {
  matchOdds: true,
  bookmaker: true,
  fancy: true,
};

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function useMatchMarketLocks({ sport, gameid, matchName }) {
  const [marketLocks, setMarketLocks] = useState(defaultLocks);

  useEffect(() => {
    const loadLocks = async () => {
      if (!sport) {
        setMarketLocks(defaultLocks);
        return;
      }
      try {
        const { data } = await api.get("/match-settings/deactivated?limit=5000");
        const rows = data?.data?.matches || [];
        const sportRows = rows.filter(
          (row) => String(row?.sport || "").toLowerCase() === String(sport).toLowerCase()
        );

        const normalizedGameId = String(gameid || "").trim();
        const normalizedMatchName = String(matchName || "").trim();

        let found =
          sportRows.find(
            (row) => String(row?.matchId || "").trim() === normalizedGameId
          ) || null;

        if (!found && normalizedMatchName) {
          const matcher = new RegExp(`^${escapeRegex(normalizedMatchName)}$`, "i");
          found =
            sportRows.find((row) =>
              matcher.test(String(row?.matchName || "").trim())
            ) || null;
        }

        if (!found) {
          setMarketLocks(defaultLocks);
          return;
        }

        setMarketLocks({
          matchOdds: found?.marketLocks?.matchOdds ?? false,
          bookmaker: found?.marketLocks?.bookmaker ?? false,
          fancy: found?.marketLocks?.fancy ?? false,
        });
      } catch {
        setMarketLocks(defaultLocks);
      }
    };

    loadLocks();
  }, [sport, gameid, matchName]);

  return { marketLocks };
}
