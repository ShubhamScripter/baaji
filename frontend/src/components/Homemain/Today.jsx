import React from 'react';
import { useNavigate } from 'react-router-dom';
import banner1 from '../../assets/mainhome/banner1.webp';
import banner2 from '../../assets/mainhome/banner2.webp';
import banner3 from '../../assets/mainhome/banner3.webp';
import banner4 from '../../assets/mainhome/banner4.webp';

const bannerImages = {
  All: banner1,
  Cricket: banner2,
  Soccer: banner3,
  Tennis: banner4
};

function Today({ data, enabledSports }) {
  const navigate = useNavigate();

  const sportBanners = [
    { key: "cricket", name: "Cricket", total: data.cricket.length },
    { key: "soccer", name: "Soccer", total: data.soccer.length },
    { key: "tennis", name: "Tennis", total: data.tennis.length },
  ];
  const visibleSports = sportBanners.filter(
    (banner) => enabledSports?.[banner.key] !== false
  );
  const allTotal = visibleSports.reduce((sum, banner) => sum + banner.total, 0);
  const banners = [{ name: "All", total: allTotal }, ...visibleSports];

  return (
    <div>
      {banners.map((banner) => (
        <div
          key={banner.name}
          className="w-full h-30 bg-cover bg-center rounded-xl mb-3 relative overflow-hidden shadow-2xl"
          style={{ backgroundImage: `url(${bannerImages[banner.name]})` }}
          onClick={() =>
            navigate('/sports', { state: { filter: banner.name, active: "Today" } })
          }
        >
          <div className="flex flex-col p-3">
            <span className="text-[17px] font-semibold">{banner.name}</span>
            <span className="text-[40px] font-bold">{banner.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Today;
