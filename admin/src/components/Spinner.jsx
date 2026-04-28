import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
const Spinner = ({ path = '' }) => {
  const [count, setCount] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => --prevValue);
    }, 1000);
    if (userInfo) {
      navigate({
        state: location.pathname,
      });
    }
    count === 0 &&
      navigate(`/${path}`, {
        state: location.pathname,
      });
    return () => clearInterval(interval);
  }, [count, navigate, location, path]);
  return (
    <>
      <div className='mx-auto flex h-[116px] w-[185px] items-center justify-center overflow-hidden rounded-[20px] bg-white'>
        <div className='loader'>
          <div className='bg-white'>
            <svg
              className='h-[200px] w-[120px] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.0)]'
              xmlns='http://www.w3.org/2000/svg'
              version='1.1'
            >
              <rect width='100%' height='100%' fill='white' rx='16' ry='16' />
              <defs>
                <filter id='goo'>
                  <feGaussianBlur
                    in='SourceGraphic'
                    stdDeviation='6'
                    result='blur'
                  />
                  <feColorMatrix
                    in='blur'
                    mode='matrix'
                    values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7'
                    result='goo'
                  />
                  <feBlend in='SourceGraphic' in2='goo' />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default Spinner;