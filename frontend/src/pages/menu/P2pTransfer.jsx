import React,{useState} from 'react'
import { MdArrowBackIos } from "react-icons/md";
import HeaderLogin from '../../components/Header/HeaderLogin'
import { BsCopy } from "react-icons/bs";
import { FaUser, FaLock } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
function P2pTransfer() {
    const [walletIdFocus, setwalletIdFocus] = useState(false);
    const [transferAmountFocus, settransferAmountFocus] = useState(false);
    const [remarkFocus, setremarkFocus] = useState(false);
    
    const [walletId, setwalletId] = useState('');
    const [transferAmount, settransferAmount] = useState('');
    const [remark, setremark] = useState('');
    
  
    const iswalletIdActive = walletIdFocus || walletId;
    const istransferAmountActive = transferAmountFocus || transferAmount;
    const isremarkActive = remarkFocus || remark;

    const [myWalletId, setmyWalletId] = useState("6853bc8dd21e5ca967f672f4")

    const clearForm = () => {
    setwalletId('');
    settransferAmount('');
    setremark('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Transfer submitted!");
    clearForm();
  };
    
  return (
    <div>
      <HeaderLogin/>
      <div className="bg-[#000] h-10 flex items-center px-5 relative">
        <div
        onClick={() => window.history.back()} 
        >
          <MdArrowBackIos className='text-white text-2xl font-semibold' />
        </div>
        <span className="text-white text-sm  md:text-lg font-semibold absolute -translate-x-1/2 left-1/2">P2P Transfer</span>
      </div>
      <div className='bg-[#f1f7ff] min-h-[80vh]'>
        <div className='p-2'>
          <h3 className='p-2 text-lg font-semibold'>My Wallet Id</h3>
          <div className='bg-white rounded-lg p-4 m-2 flex gap-2 items-center'>
            <div className='bg-[#d4e0e5] flex-1 p-2 rounded-lg '>
              {myWalletId}
            </div>
            <div className="p-2 bg-yellow-400 rounded-lg border border-transparent hover:bg-white hover:border-[#19A044] transition-colors duration-200 cursor-pointer" 
            onClick={() => {
              navigator.clipboard.writeText(myWalletId)
              toast.success("Text Copied to clipboard")
            }} >
              <BsCopy className='text-2xl'/>
            </div>
          </div>
        </div>
        <div className='p-2'>
          <h3 className='p-2 text-lg font-semibold'>Transfer To</h3>
          <div className='bg-white rounded-lg p-4 m-2  gap-2 items-center'>
            <form onSubmit={handleSubmit}>
              <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${iswalletIdActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
                <label
                  htmlFor="walletId"
                  className={`absolute left-5 transition-all duration-200 pointer-events-none bg-white px-1
                    ${iswalletIdActive
                      ? 'text-xs -top-2 text-[#19A044]'
                      : 'top-1/2 transform -translate-y-1/2 text-gray-400'}
                  `}
                >
                  Recipient wallet ID

                </label>
                <input
                  type="text"
                  id="walletId"
                  required
                  value={walletId}
                  onFocus={() => setwalletIdFocus(true)}
                  onBlur={() => setwalletIdFocus(false)}
                  onChange={(e) => setwalletId(e.target.value)}
                  className=' w-full outline-none bg-transparent text-gray-800'
                />
              </div>
              <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${istransferAmountActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
                <label
                  htmlFor="transferAmount"
                  className={`absolute left-5 transition-all duration-200 pointer-events-none bg-white px-1
                    ${istransferAmountActive
                      ? 'text-xs -top-2 text-[#19A044]'
                      : 'top-1/2 transform -translate-y-1/2 text-gray-400'}
                  `}
                >
                  Transfer Amount

                </label>
                <input
                  type="number"
                  id="transferAmount"
                  required
                  value={transferAmount}
                  onFocus={() => settransferAmountFocus(true)}
                  onBlur={() => settransferAmountFocus(false)}
                  onChange={(e) => settransferAmount(e.target.value)}
                  className=' w-full outline-none bg-transparent text-gray-800'
                />
              </div>
              <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isremarkActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
                <label
                  htmlFor="walletId"
                  className={`absolute left-5 transition-all duration-200 pointer-events-none bg-white px-1
                    ${isremarkActive
                      ? 'text-xs -top-2 text-[#19A044]'
                      : 'top-1/2 transform -translate-y-1/2 text-gray-400'}
                  `}
                >
                  Remark

                </label>
                <input
                  type="text"
                  id="remark"
                  value={remark}
                  onFocus={() => setremarkFocus(true)}
                  onBlur={() => setremarkFocus(false)}
                  onChange={(e) => setremark(e.target.value)}
                  className=' w-full outline-none bg-transparent text-gray-800'
                />
              </div>
              <div className='flex gap-2'>
                <button className='flex-1 border rounded-lg  px-2 py-3 mb-6 font-semibold'
                onClick={clearForm}
                >Clear</button>
                <button className='flex-1 border rounded-lg  px-2 py-3 mb-6 bg-yellow-400 font-semibold transition-colors duration-300 ease-in hover:bg-white border-[#19A044]  '>
                  Transfer</button>
              </div>
            </form>
          </div>
        </div>
        <ToastContainer />
      </div>
      
    </div>
  )
}

export default P2pTransfer