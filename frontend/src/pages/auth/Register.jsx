import React, { useState } from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { FaUser, FaLock } from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";
import { FaMobileRetro } from "react-icons/fa6";
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';
function Register() {
  const navigate = useNavigate();
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
  const [mobileNoFocus, setMobileNoFocus] = useState(false);
  const [currencyFocus, setCurrencyFocus] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');

  const isUsernameActive = usernameFocus || username;
  const isPasswordActive = passwordFocus || password;
  const isConfirmPasswordActive = confirmPasswordFocus || confirmPassword;
  const isMobileNoActive = mobileNoFocus || mobileNo;
  const isCurrencyActive = currencyFocus || selectedCurrency;

  return (
    <div className='min-h-screen bg-[url(/loginbg.jpg)] bg-cover bg-center bg-no-repeat flex flex-col'>

      {/* Back Button */}
      <div className='bg-white w-8 h-8 rounded-full flex justify-center items-center ml-2 mt-2'>
        <IoIosArrowBack className='text-gray-600 w-6 h-6' />
      </div>

      {/* Logo */}
      <div className='flex flex-col items-center justify-center mt-4'>
        <img src={logo} alt="Logo" width={200} height={200} />
      </div>

      {/* Register Form */}
      <div className='bg-white rounded-t-2xl shadow-lg p-4 mt-4 flex-1 flex flex-col justify-center'>
        <h2 className='text-3xl font-sans text-center py-4'>Register User</h2>

        <form className='flex flex-col px-2'>

          {/* Username */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isUsernameActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isUsernameActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label
              htmlFor="username"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${isUsernameActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}`}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onFocus={() => setUsernameFocus(true)}
              onBlur={() => setUsernameFocus(false)}
              onChange={(e) => setUsername(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
            />
          </div>

          {/* Mobile No */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isMobileNoActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <FaMobileRetro className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isMobileNoActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label
              htmlFor="mobileNo"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${isMobileNoActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}`}
            >
              Mobile No
            </label>
            <input
              type="number"
              id="mobileNo"
              value={mobileNo}
              onFocus={() => setMobileNoFocus(true)}
              onBlur={() => setMobileNoFocus(false)}
              onChange={(e) => setMobileNo(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
            />
          </div>

          {/* Password */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isPasswordActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isPasswordActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label
              htmlFor="password"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${isPasswordActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}`}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              onChange={(e) => setPassword(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
            />
          </div>

          {/* Confirm Password */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isConfirmPasswordActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-200 ${isConfirmPasswordActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label
              htmlFor="confirmPassword"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${isConfirmPasswordActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}`}
            >
              Confirm Password
            </label>
            <input
              type="text"
              id="confirmPassword"
              value={confirmPassword}
              onFocus={() => setConfirmPasswordFocus(true)}
              onBlur={() => setConfirmPasswordFocus(false)}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800'
            />
          </div>

          {/* Currency Dropdown */}
          <div className={`relative border rounded-lg px-2 py-3 mb-6 transition-all duration-200 ${isCurrencyActive ? 'border-[#19A044]' : 'border-gray-400'}`}>
            <MdVerifiedUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isCurrencyActive ? 'text-[#19A044]' : 'text-gray-600'}`} />
            <label
              htmlFor="currency"
              className={`absolute left-10 transition-all duration-200 pointer-events-none bg-white px-1
              ${isCurrencyActive ? 'text-xs -top-2 text-[#19A044]' : 'top-1/2 transform -translate-y-1/2 text-gray-400'}`}
            >
              Choose Currency
            </label>
            <select
              id="currency"
              value={selectedCurrency}
              onFocus={() => setCurrencyFocus(true)}
              onBlur={() => setCurrencyFocus(false)}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className='pl-10 pt-1 pb-1 w-full outline-none bg-transparent text-gray-800 appearance-none '
            >
              <option value="" disabled>Select</option>
              <option value="INR">BDT</option>
              <option value="BUSD">USD</option>
            </select>
          </div>

          <button type="submit" className='bg-[#19A044] text-white py-2 rounded'>Submit</button>

          <p className='text-center text-sm text-gray-600 mt-4'>
            Already registered?{' '}
            <span onClick={() => navigate('/login')} className='text-[#19A044] font-semibold cursor-pointer hover:underline'>
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
