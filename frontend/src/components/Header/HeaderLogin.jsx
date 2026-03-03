// import React, { useState } from 'react';
// import { GiHamburgerMenu } from "react-icons/gi";
// import { FiAlignJustify } from "react-icons/fi";
// import Logo from '../../assets/logo.png';
// import { BiRefresh } from "react-icons/bi";
// import Navbar from './Navbar';
// import { motion } from "motion/react"
// import { useSelector } from "react-redux";
// import Header from './Header';
// function HeaderLogin() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const { user } = useSelector((state) => state.auth);

//   return (
//     <>
//     {user?
//     <div>
//       {/* Header Bar */}
//       <div className="bg-[#17934e] h-10 relative z-30">
//         <div className="flex justify-between items-center h-full px-4">
//           <div className="flex items-center justify-center gap-3">
//             <GiHamburgerMenu
//               className="text-white text-2xl"
//               onClick={() => setSidebarOpen(true)}
//             />
//             <img src={Logo} alt="Logo" className="w-20 h-10 mt-2" />
//           </div>
//           <div className="flex gap-2 items-center ">
//             <div className="flex flex-col">
//               <span className="text-white text-[8px] md:text-sm leading-none">
//                 {user?.username}
//               </span>
//               <span className="text-white text-[10px] md:text-base font-semibold">{user?.currency || "BDT"}{" "} <span className='font-normal'>{user?.balance ?? 0}</span>&nbsp; Exp (0.00)</span>
//             </div>
//             <motion.div
//             animate={{rotate:360}} 
//             transition={{duration:3,delay:1}}
//             >
//                 <BiRefresh className="text-white text-2xl" />
//             </motion.div>
//           </div>
//         </div>
//       </div>

//       {/* SIDEBAR OVERLAY (now at root level, not inside header) */}
//       {sidebarOpen && (
//   <div className="fixed inset-0 z-40 flex justify-center">
//     <div
//       className="absolute inset-0 bg-black/50"
//       onClick={() => setSidebarOpen(false)}
//     ></div>
//     {/* Sidebar container, only as wide as mobile */}
//     <div className="relative w-full max-w-[480px] h-full">
//       <Navbar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//     </div>
//   </div>
// )}
//     </div>:<Header/>}
//     </>
//   );
// }

// export default HeaderLogin;

// import React, { useState } from 'react';
// import { GiHamburgerMenu } from "react-icons/gi";
// import { FiAlignJustify } from "react-icons/fi";
// import Logo from '../../assets/logo.png';
// import { BiRefresh } from "react-icons/bi";
// import Navbar from './Navbar';
// import { motion } from "motion/react";
// import { useSelector, useDispatch } from "react-redux";
// import { getUser } from '../../features/auth/authSlice';
// import Header from './Header';
// import { host } from '../../utils/axiosConfig';
// function HeaderLogin() {
//   const dispatch = useDispatch();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const { user } = useSelector((state) => state.auth);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await dispatch(getUser());
//     } catch (error) {
//       console.error('Failed to refresh user data:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   return (
//     <>
//       {user ? (
//         <div>
//           {/* Header Bar */}
//           <div className="bg-[#17934e] h-10 relative z-30">
//             <div className="flex justify-between items-center h-full px-4">
//               <div className="flex items-center justify-center gap-3">
//                 <GiHamburgerMenu
//                   className="text-white text-2xl"
//                   onClick={() => setSidebarOpen(true)}
//                 />
//                 <img src={Logo} alt="Logo" className="w-20 h-10 mt-2" />
//               </div>
//               <div className="flex gap-2 items-center ">
//                 <div className="flex flex-col">
//                   {/* 🔑 use userName from API */}
//                   <span className="text-white text-[8px] md:text-sm leading-none">
//                     {user?.userName}
//                   </span>

//                   {/* 🔑 remove/replace currency if you don't have it */}
//                   <span className="text-white text-[10px] md:text-base font-semibold">
//                     BDT{" "}
//                     <span className="font-normal">
//                       {user?.balance ?? 0}
//                     </span>
//                     &nbsp; Exp (<span className="text-[#e52219]">
//                     {Number(user?.exposure).toFixed(2)}
//                   </span>)
//                   </span>
//                 </div>
//                 <motion.div
//                   animate={{ rotate: refreshing ? 360 : 0 }}
//                   transition={{ duration: refreshing ? 1 : 3, delay: refreshing ? 0 : 1 }}
//                 >
//                   <BiRefresh 
//                     className={`text-white text-2xl cursor-pointer ${refreshing ? 'opacity-70' : ''}`}
//                     onClick={handleRefresh}
//                   />
//                 </motion.div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar overlay */}
//           {sidebarOpen && (
//             <div className="fixed inset-0 z-40 flex justify-center">
//               <div
//                 className="absolute inset-0 bg-black/50"
//                 onClick={() => setSidebarOpen(false)}
//               ></div>
//               <div className="relative w-full max-w-[480px] h-full">
//                 <Navbar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <Header />
//       )}
//     </>
//   );
// }

// export default HeaderLogin;


// import React, { useState, useEffect, useRef } from "react";
// import { GiHamburgerMenu } from "react-icons/gi";
// import { BiRefresh } from "react-icons/bi";
// import { motion } from "motion/react";
// import { useSelector, useDispatch } from "react-redux";
// import { getUser } from "../../features/auth/authSlice";
// import Navbar from "./Navbar";
// import Header from "./Header";
// import Logo from "../../assets/logo.png";
// import { host } from "../../utils/axiosConfig";

// function HeaderLogin() {
//   const dispatch = useDispatch();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const { user } = useSelector((state) => state.auth);
//   const socketRef = useRef(null);

//   // 🔁 Refresh handler
//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await dispatch(getUser());
//     } catch (error) {
//       console.error("Failed to refresh user data:", error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   // 🔗 Setup WebSocket connection
//   useEffect(() => {
//     if (!user) return;

//     // Create a WebSocket connection
//     socketRef.current = new WebSocket(host);

//     socketRef.current.onopen = () => {
//       console.log("🔗 Connected to WebSocket");

//       // Identify user for targeted messages
//       socketRef.current.send(
//         JSON.stringify({
//           type: "identify",
//           userName: user.userName,
//         })
//       );
//     };

//     // Handle messages from the backend
//     socketRef.current.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);

//         if (data.type === "balance_update") {
//           console.log("💰 Balance update received:", data);
//           handleRefresh(); // auto-refresh on balance change
//         }
//       } catch (err) {
//         console.error("❌ Invalid socket message:", event.data);
//       }
//     };

//     socketRef.current.onclose = () => {
//       console.log("❌ WebSocket disconnected");
//     };

//     // Cleanup when component unmounts
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.close();
//       }
//     };
//   }, [user]);

//   return (
//     <>
//       {user ? (
//         <div>
//           {/* Header Bar */}
//           <div className="bg-[#17934e] h-10 relative z-30">
//             <div className="flex justify-between items-center h-full px-4">
//               <div className="flex items-center justify-center gap-3">
//                 <GiHamburgerMenu
//                   className="text-white text-2xl"
//                   onClick={() => setSidebarOpen(true)}
//                 />
//                 <img src={Logo} alt="Logo" className="w-20 h-10 mt-2" />
//               </div>

//               <div className="flex gap-2 items-center">
//                 <div className="flex flex-col">
//                   <span className="text-white text-[8px] md:text-sm leading-none">
//                     {user?.userName}
//                   </span>

//                   <span className="text-white text-[10px] md:text-base font-semibold">
//                     BDT{" "}
//                     <span className="font-normal">{Number(user?.avbalance || 0).toFixed(2)}</span>
//                     &nbsp; Exp (
//                     <span className="text-[#e52219]">
//                       {Number(user?.exposure || 0).toFixed(2)}
//                     </span>
//                     )
//                   </span>
//                 </div>

//                 {/* Refresh Icon */}
//                 <motion.div
//                   animate={{ rotate: refreshing ? 360 : 0 }}
//                   transition={{
//                     duration: refreshing ? 1 : 3,
//                     delay: refreshing ? 0 : 1,
//                   }}
//                 >
//                   <BiRefresh
//                     className={`text-white text-2xl cursor-pointer ${
//                       refreshing ? "opacity-70" : ""
//                     }`}
//                     onClick={handleRefresh}
//                   />
//                 </motion.div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar overlay */}
//           {sidebarOpen && (
//             <div className="fixed inset-0 z-40 flex justify-center">
//               <div
//                 className="absolute inset-0 bg-black/50"
//                 onClick={() => setSidebarOpen(false)}
//               ></div>
//               <div className="relative w-full max-w-[480px] h-full">
//                 <Navbar
//                   open={sidebarOpen}
//                   onClose={() => setSidebarOpen(false)}
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <Header />
//       )}
//     </>
//   );
// }

// export default HeaderLogin;


import React, { useState, useEffect, useRef } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { BiRefresh } from "react-icons/bi";
import { motion } from "motion/react";
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "../../features/auth/authSlice";
import Navbar from "./Navbar";
import Header from "./Header";
import Logo from "../../assets/logo.png";
// import Logonew from '../../assets/newdiamondlogo.png'
import { host } from "../../utils/axiosConfig";
import { useLocation } from "react-router-dom";
function HeaderLogin() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  // 🔁 Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getUser());
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && user) {
      handleRefresh();
    }
  }, [location.pathname]);

  // 🔗 Setup WebSocket connection
  useEffect(() => {
    if (!user) return;

    // Create a WebSocket connection
    socketRef.current = new WebSocket(host);

    socketRef.current.onopen = () => {
      console.log("🔗 Connected to WebSocket");

      // Identify user for targeted messages
      socketRef.current.send(
        JSON.stringify({
          type: "identify",
          userName: user.userName,
        })
      );
    };

    // Handle messages from the backend
    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "balance_update") {
          console.log("💰 Balance update received:", data);
          handleRefresh(); // auto-refresh on balance change
        }
      } catch (err) {
        console.error("❌ Invalid socket message:", event.data);
      }
    };

    socketRef.current.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    // Cleanup when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);

  return (
    <>
      {user ? (
        <div>
          {/* Header Bar */}
          <div className="bg-[#17934e] h-10 relative z-30">
            <div className="flex justify-between items-center h-full px-4">
              <div className="flex items-center justify-center gap-3">
                <GiHamburgerMenu
                  className="text-white text-2xl"
                  onClick={() => setSidebarOpen(true)}
                />
                <img src={Logo} alt="Logo" className="w-20 h-10 mt-2" />
              </div>

              <div className="flex gap-2 items-center">
                <div className="flex flex-col">
                  <span className="text-white text-[8px] md:text-sm leading-none">
                    {user?.userName}
                   </span>

                  <span className="text-white text-[10px] md:text-base font-semibold">
                   BDT{" "}
                     <span className="font-normal">{Number(user?.avbalance || 0).toFixed(2)}</span>
                    &nbsp; Exp (
                     <span className="text-[#e52219]">
                      {Number(user?.exposure || 0).toFixed(2)}
                    </span>
                    )
                  </span>
                </div>

                {/* Refresh Icon */}
                <motion.div
                  animate={{ rotate: refreshing ? 360 : 0 }}
                  transition={{
                    duration: refreshing ? 1 : 3,
                    delay: refreshing ? 0 : 1,
                  }}
                >
                  <BiRefresh
                    className={`text-white text-2xl cursor-pointer ${
                      refreshing ? "opacity-70" : ""
                    }`}
                    onClick={handleRefresh}
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 flex justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setSidebarOpen(false)}
              ></div>
              <div className="relative w-full max-w-[480px] h-full">
                <Navbar
                  open={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <Header />
      )}
    </>
  );
}

export default HeaderLogin;