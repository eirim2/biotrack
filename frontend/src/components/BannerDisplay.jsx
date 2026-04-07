import React from 'react';

const BANNER_GRADIENTS = {
  forest: "linear-gradient(135deg, #2e7d32, #81c784)",
  safari: "linear-gradient(135deg, #6d4c41, #f57c00)",
  ocean: "linear-gradient(135deg, #0d47a1, #0288d1)",
  desert: "linear-gradient(135deg, #9b7b36, #fab54d)",
  mesa: "linear-gradient(135deg, #D3503D, #E8872D)",
  arctic: "linear-gradient(135deg, #3949AB, #7986CB)",
  sunset: "linear-gradient(135deg, #ff6b35, #f7c59f)",
  jungle: "linear-gradient(135deg, #1b5e20, #4caf50)",
};

export default function BannerDisplay({ bannerId }) {
  if (!bannerId || !BANNER_GRADIENTS[bannerId]) return null;
  return <div className="profile-banner" style={{ background: BANNER_GRADIENTS[bannerId] }} />;
}

export { BANNER_GRADIENTS };
