// import React from 'react'
// function ActivelogCard({logdata}) {
//   return (
//     <div className='flex flex-col p-4'>
//       {logdata.map((logData, idx) => (
//         <table key={idx} className="rounded overflow-hidden bg-white border w-full rounded-t-xl mb-4">
//           <thead className='bg-[#d5f2b8]'>
//             <tr>
//               <th colSpan={4} className='p-2'>{logData.date}</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr className='border'>
//               <td colSpan={2} className='p-2'>Login Status</td>
//               <td colSpan={2} className='p-2'>
//                 <strong className={logData.status === "Login Success" ? 'text-green-500' : 'text-red-500'}>
//                   {logData.status}
//                 </strong>
//               </td>
//             </tr>
//             <tr className='border'>
//               <td colSpan={2} className='p-2 border'>IP Address</td>
//               <td colSpan={2} className='p-2'>{logData.ip}</td>
//             </tr>
//             <tr className='border'>
//               <td colSpan={2} className='p-2 border'>ISP</td>
//               <td colSpan={2} className='p-2'>{logData.isp}</td>
//             </tr>
//             <tr className='border-b'>
//               <td colSpan={2} className='p-2 border'>City/State/Country</td>
//               <td colSpan={2} className='p-2'>{logData.location}</td>
//             </tr>
//           </tbody>
//         </table>
//       ))}
//     </div>
//   )
// }

// export default ActivelogCard

import React from "react";

function ActivelogCard({ logdata }) {
  return (
    <div className="flex flex-col p-4">
      {logdata.map((log, idx) => (
        <table
          key={log._id || idx}
          className="rounded overflow-hidden bg-white border w-full rounded-t-xl mb-4"
        >
          <thead className="bg-[#d5f2b8]">
            <tr>
              <th colSpan={4} className="p-2">
                {log.dateTime || "—"}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border">
              <td colSpan={2} className="p-2">User</td>
              <td colSpan={2} className="p-2 font-semibold">{log.userName}</td>
            </tr>
            <tr className="border">
              <td colSpan={2} className="p-2">Login Status</td>
              <td colSpan={2} className="p-2">
                <strong
                  className={
                    log.status?.toLowerCase().includes("success")
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {log.status}
                </strong>
              </td>
            </tr>
            <tr className="border">
              <td colSpan={2} className="p-2">IP Address</td>
              <td colSpan={2} className="p-2">{log.ip || "—"}</td>
            </tr>
            <tr className="border">
              <td colSpan={2} className="p-2">ISP</td>
              <td colSpan={2} className="p-2">{log.isp || "Not provided"}</td>
            </tr>
            <tr className="border-b">
              <td colSpan={2} className="p-2">City/State/Country</td>
              <td colSpan={2} className="p-2">{log.location || "Not provided"}</td>
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  );
}

export default ActivelogCard;
