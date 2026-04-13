import React from 'react';

const BANNER_IMAGES = {
  forest: "/images/banners/forest.svg",
  safari: "/images/banners/safari.svg",
  ocean: "/images/banners/ocean.svg",
  desert: "/images/banners/desert.svg",
  mesa: "/images/banners/mesa.svg",
  arctic: "/images/banners/arctic.svg",
  sunset: "/images/banners/sunset.svg",
  jungle: "/images/banners/jungle.svg",
};

export default function BannerDisplay({ bannerId }) {
  if (!bannerId || !BANNER_IMAGES[bannerId]) return null;
  return (
    <div
      className="profile-banner"
      style={{
        backgroundImage: `url(${BANNER_IMAGES[bannerId]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}

export { BANNER_IMAGES };
