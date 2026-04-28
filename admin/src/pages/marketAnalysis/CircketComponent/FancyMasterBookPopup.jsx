import { useSelector } from 'react-redux';

export default function FancyMasterBookPopup({ teamName, onClose }) {
  const { fancyMasterBook, fancyMasterBookLoading } = useSelector(
    (state) => state.market
  );

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'
      onClick={onClose}
    >
      <div
        className='fixed top-8 mx-4 w-full max-w-[352px] rounded-t-md bg-white shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='bg-color flex items-center justify-between rounded-t-md px-4 py-1'>
          <h3 className='text-sm text-white'>Book</h3>
          <button
            onClick={onClose}
            className='text-xl leading-none font-bold text-white hover:text-gray-300'
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className='p-1'>
          <table className='min-w-full border-2 border-black text-[14px]'>
            {/* Table Header */}
            <thead className='bg-gray-100'>
              <tr>
                <th className='w-1/2 border px-4'>Run</th>
                <th className='w-1/2 border px-4'>Amount</th>
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {fancyMasterBookLoading ? (
                <tr>
                  <td
                    colspan='2'
                    className='w-full border px-4 text-center text-gray-500'
                  >
                    Loading...
                  </td>
                </tr>
              ) : fancyMasterBook.length === 0 ? (
                <tr>
                  <td
                    colspan='2'
                    className='w-full border px-4 text-center font-bold'
                  >
                    No data!
                  </td>
                </tr>
              ) : (
                fancyMasterBook.map((item) => (
                  <tr
                    key={item.score}
                    className={`${
                      item.pnl > 0
                        ? 'bg-[#72bbef]'
                        : item.pnl < 0
                          ? 'bg-[#faa9ba]'
                          : 'bg-gray-400'
                    }`}
                  >
                    <td className='w-1/2 border px-4 text-center font-bold text-gray-800'>
                      {item.score}
                    </td>
                    <td className='w-1/2 border px-4 text-center font-bold text-gray-800'>
                      {item.pnl}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
