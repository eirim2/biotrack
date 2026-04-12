import React from 'react';

// Map banner IDs to their image paths (served via /images/ static mount)
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
    <img
      className="profile-banner"
      src={BANNER_IMAGES[bannerId]}
      alt={`${bannerId} banner`}
      style={{ objectFit: 'cover', width: '100%' }}
    />
  );
}

export { BANNER_IMAGES };
