import React ,{useState,useEffect} from 'react'
import HeaderLogin from '../../components/Header/HeaderLogin'
import Header1 from '../../components/Header/Header1';
import All from './All';
import Cricket from './Cricket';
import Soccer from './Soccer';
import Tennis from './Tennis';
import { useLocation } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { fetchSoccerInplayData } from "../../features/sports/soccerSlice";
import { fetchCricketInplayData } from "../../features/sports/cricketSlice";
import { fetchTennisInplayData } from "../../features/sports/tennisSlice";
function Sports() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [Filter,setFilter] = useState("All")
  const [selected, setSelected] = useState(null);
  const [Active, setActive] = useState("InPlay")

  useEffect(() => {
    if (location.state && location.state.filter) {
      setFilter(location.state.filter);
      setActive(location.state.active);
    }
  }, [location.state]);

  useEffect(() => {
    if (Active === "InPlay") {
      dispatch(fetchCricketInplayData());
      dispatch(fetchSoccerInplayData());
      dispatch(fetchTennisInplayData());
    }
  }, [Active, dispatch]);

  let content;
    if (Filter === "All") {
        content = <All selected={selected} setSelected={setSelected} activeTab={Active} />;
    } else if (Filter === "Cricket") {
        content = <Cricket selected={selected} setSelected={setSelected} activeTab={Active}/>;
    } else if (Filter === "Soccer") {
        content = <Soccer selected={selected} setSelected={setSelected} activeTab={Active}/>;
    } else if (Filter === "Tennis") {
        content = <Tennis selected={selected} setSelected={setSelected} activeTab={Active}/>;
    }
     else {
        content = <div className="p-4">No component for {Filter}</div>;
    }
  return (
    <div>
        <HeaderLogin/>
        <div className='bg-black md:h-15 flex px-3 justify-center'>
          <div className='w-[80%] flex items-center'>
            <div className='w-full grid grid-cols-3 items-center'>
              <span className={`text-gray-400 text-sm md:text-xl font-semibold cursor-pointer ${Active==="InPlay" ? 'border-b-2 text-white' :" "}`}
              style={{ justifySelf: 'start' }}
              onClick={()=>setActive("InPlay")}
              >InPlay</span>
              <span className={`text-gray-400 text-sm md:text-xl font-semibold cursor-pointer ${Active==="Today" ? 'border-b-2 text-white' :" "}`}
              style={{ justifySelf: 'center' }}
              onClick={()=>setActive("Today")}
              >Today</span>
              <span className={`text-gray-400 text-sm md:text-xl font-semibold cursor-pointer ${Active==="Tomorrow" ? 'border-b-2 text-white' :" "}`}
              style={{ justifySelf: 'end' }}
              onClick={()=>setActive("Tomorrow")}
              >Tomorrow</span>
            </div>
          </div>
        </div>
        <Header1 Filter={Filter} setFilter={setFilter}/>
        {content}
    </div>
  )
}

export default Sports