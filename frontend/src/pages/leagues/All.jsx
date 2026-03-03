import React from 'react'
import { MdArrowCircleUp } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";
import { IoArrowUndo } from "react-icons/io5";
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
const all=[
  "Test Matches",
  "Womens International Twenty20 Matches",
  "Afghanistan T20 Wakhan National Cup",
  "One Day Internationals",
  "T20 Blast",
  "Irish Inter Provincial T20 Trophy"
]
const matchesData = {
  "Test Matches": ["India vs Australia", "England vs South Africa"],
  "Womens International Twenty20 Matches": ["India Women vs Australia Women"],
  "Afghanistan T20 Wakhan National Cup": ["Team A vs Team B"],
  "One Day Internationals": ["Pakistan vs Sri Lanka"],
  "T20 Blast": ["Team X vs Team Y"],
  "Irish Inter Provincial T20 Trophy": ["Leinster vs Munster"]
};
function All({ selected, setSelected }) {
    const navigate = useNavigate();
    if (selected) {
    return (
      <div>
        {/* <div className='bg-[#333] w-full h-16 flex items-center gap-2 p-2'>
            <div><IoArrowUndo className='text-2xl text-white'/></div>
            <h3 className='text-xl font-semibold mb-2 text-white'>{selected} Matches</h3>
        </div> */}
        <div className='bg-[#f0f8ff] min-h-screen'>
        <div className='p-4'>
            <button
          className="mb-4 px-4 py-2 bg-[#19A044] text-white rounded"
          onClick={() => setSelected(null)}
        >
          Back
        </button>
        <h3 className='text-xl font-semibold'>{selected}</h3>
        </div>
        <div className='bg-[#f0f8ff]'>
        <div className='p-2 flex flex-col gap-1'>
            {matchesData[selected]?.map((items,idx)=>(
                <div key={idx} className='flex flex-col bg-white p-4 rounded-xl'
                onClick={()=> navigate('/fullmarket')}
                >
                <span className='text-xs bg-[#e2eaef] w-fit pl-2 pr-2'>02/07/2025 3:30 PM &nbsp; Matched96160.33</span>
                <div className='flex justify-between items-center'>
                <span className='md:text-xl'>{items}</span>
                <MdArrowForwardIos/>
                </div>
                </div> 
            ))}
        </div>
    </div>
      </div>
      </div>
    );
  }
  return (
    <div className='bg-[#f0f8ff] min-h-[80vh]'>
        <div className='p-4 flex flex-col gap-1'>
            <h3 className='text-xl font-semibold mb-2'>Popular</h3>
            {all.map((items,idx)=>(
                <div key={idx} className='flex items-center justify-between bg-white p-4 rounded-xl'
                onClick={() => setSelected(items)}
                >
                <div className='flex justify-center items-center gap-2'>
                <MdArrowCircleUp className='text-2xl'/>
                <span className='md:text-xl'>{items}</span>
                </div>
                <MdArrowForwardIos/>
                </div> 
            ))}
        </div>
    </div>
  )
}

export default All