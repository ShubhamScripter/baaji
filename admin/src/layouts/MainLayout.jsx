import React from 'react';
import Header from '../components/header/Header';
import Navbar from '../components/navbar/Navbar';
import { Outlet } from 'react-router-dom';
import useFraudAlerts from '../hooks/useFraudAlerts';

function MainLayout() {
  // Live multi-account alerts for superadmin; a no-op for every other role.
  useFraudAlerts();

  return (
    <div className='min-h-screen flex flex-col'>
      <Header />
      <main className='flex flex-1 mt-20'>

        <aside className=''>
          <Navbar />
        </aside>

        <section className='flex-1 px-2 bg-[#f0ece1] overflow-y-auto h-[calc(100vh-80px)] hide-scrollbar'>
          <Outlet />
        </section>
        
      </main>
    </div>
  );
}

export default MainLayout;
