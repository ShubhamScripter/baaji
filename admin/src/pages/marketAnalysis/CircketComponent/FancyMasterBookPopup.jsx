import { useSelector } from 'react-redux';

export default function FancyMasterBookPopup({ onClose }) {
  const { fancyMasterBook, fancyMasterBookLoading, fancyMasterBookMeta } = useSelector(
    (state) => state.market
  );
  return (
   
      <div className='fixed top-0 left-0 w-full h-full z-50 bg-[#fbf9ed] rounded-t-md shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='modal-header flex justify-between p-3 bg-yellow-400'>
          <span className='font-semibold text-2xl'>{fancyMasterBookMeta.teamName}</span>
          <span className="cursor-pointer leading-none text-[20px] flex items-center"
            onClick={onClose}
            >
            <span className="text-[30px]">×</span> Close
          </span>
        </div>

        {/* Content */}
        <div className='p-7'>
          <div className='text-2xl font-bold'>Run Position</div>
          <table className='text-[14px] w-full'>
            {/* Table Header */}
            <thead className='bg-gray-200'>
              <tr>
                <th className='w-1/2 px-4 py-1.5 text-left'>Run</th>
                <th className='w-1/2 px-4 py-1.5 text-right'>Amount</th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {fancyMasterBookLoading ? (
                <tr>
                  <td colspan={2} className='w-full border px-4 text-center text-gray-500'>
                    Loading...
                  </td>
                </tr>
              ) : fancyMasterBook.length === 0 ? (
                <tr>
                  <td className='w-full border px-4 text-center font-bold' colSpan={2}>
                    No data!
                  </td>
                </tr>
              ) : (
                fancyMasterBook.map((item) => (
                  <tr
                    key={item.score}
                    className={`border-t border-gray-100/20 ${
                      item.pnl > 0
                        ? 'bg-[#72bbef]'
                        : item.pnl < 0
                          ? 'bg-[#faa9ba]'
                          : 'bg-gray-400'
                    }`}
                  >
                    <td className='w-1/2 px-4 text-left text-gray-800'>
                      {item.score}
                    </td>
                    <td className='w-1/2 px-4 text-right text-gray-800'>
                      {item.pnl}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    
  );
}
