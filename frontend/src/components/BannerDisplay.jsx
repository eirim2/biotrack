import React from 'react';

const BANNER_IMAGES = {
  forest: "/images/banners/forest.png",
  safari: "/images/banners/safari.jpg",
  ocean: "/images/banners/ocean.png",
  desert: "/images/banners/desert.jpg",
  mesa: "/images/banners/mesa.jpg",
  arctic: "/images/banners/arctic.png",
};

export default function BannerDisplay({ bannerId, height = 250}) {
  if (!bannerId || !BANNER_IMAGES[bannerId]) return null;
  return (
    <div
      className="profile-banner"
      style={{
        backgroundImage: `url(${BANNER_IMAGES[bannerId]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height,
      }}
    />
  );
}

export { BANNER_IMAGES };
