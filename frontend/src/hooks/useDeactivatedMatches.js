import { useEffect, useMemo, useState } from "react";
import api from "../utils/axiosConfig";

const normalizeId = (value) => String(value ?? "").trim().toLowerCase();

export default function useDeactivatedMatches() {
  const [deactivatedBySport, setDeactivatedBySport] = useState({
    cricket: new Set(),
    soccer: new Set(),
    tennis: new Set(),
  });

  useEffect(() => {
    const loadDeactivatedMatches = async () => {
      try {
        const { data } = await api.get("/match-settings/deactivated?limit=1000");
        const rows = data?.data?.matches || [];
        const next = {
          cricket: new Set(),
          soccer: new Set(),
          tennis: new Set(),
        };

        rows.forEach((row) => {
          const sport = String(row?.sport || "").toLowerCase();
          if (!next[sport]) return;
          const locks = row?.marketLocks;
          const isFullyBlocked =
            !locks ||
            (locks.matchOdds === false &&
              locks.bookmaker === false &&
              locks.fancy === false);
          if (isFullyBlocked) {
            next[sport].add(normalizeId(row?.matchId));
          }
        });

        setDeactivatedBySport(next);
      } catch (error) {
        setDeactivatedBySport({
          cricket: new Set(),
          soccer: new Set(),
          tennis: new Set(),
        });
      }
    };

    loadDeactivatedMatches();
  }, []);

  const isMatchVisible = useMemo(
    () => (sport, matchId) => {
      const sportKey = String(sport || "").toLowerCase();
      const blocked = deactivatedBySport[sportKey];
      if (!blocked) return true;
      return !blocked.has(normalizeId(matchId));
    },
    [deactivatedBySport]
  );

  return { isMatchVisible, deactivatedBySport };
}
