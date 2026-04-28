import Top10Table from "./Top10Table";
import MatchOdds from "./MatchOdds";
import BookMaker from "./BookMaker";
import FancyBet from "./FancyBet";
import SportsBook from "./SportsBook";
import PremiumCricket from "./PremiumCricket";
import Binary from "./Binary";
function RiskManagement() {

  return (
    <div className='mt-4 p-4 font-["Times_New_Roman"] bg-white border border-gray-300 rounded-md'>
      <h2 className='text-[#243a48] text-[16px] font-[700]'>
        Risk Management Summary
      </h2>
      <div>
        <Top10Table/>
        <MatchOdds/>
        <BookMaker/>
        <FancyBet/>
        {/* <SportsBook/>
        <PremiumCricket/>
        <Binary/> */}
      </div>
    </div>
  );
}

export default RiskManagement;
