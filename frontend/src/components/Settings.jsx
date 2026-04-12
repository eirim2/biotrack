import React, { useState } from "react";
import Navigation from "./Navigation";
import { THEMES, applyTheme, loadThemeName, saveThemeName } from "../theme";
import axios from "axios";

const THEME_COLORS = {
  forest: { bg: "#e8f5e9", accent: "#2e7d32" },
  safari: { bg: "#f5ead6", accent: "#6d4c41" },
  ocean: { bg: "#0288d1", accent: "#e1f5fe" },
  desert: { bg: "#fab54d", accent: "#3b2d1b" },
  mesa: { bg: "#D3503D", accent: "#F0E5D7" },
  arctic: { bg: "#E8EAF6", accent: "#5C6BC0" },
};

const BANNERS = [
  { id: "forest",  label: "Forest",  image: "/images/banners/forest.svg",  placeholder: "🌲🌳🌿" },
  { id: "safari",  label: "Safari",  image: "/images/banners/safari.svg",  placeholder: "🦁🌅🐘" },
  { id: "ocean",   label: "Ocean",   image: "/images/banners/ocean.svg",   placeholder: "🌊🐠🐋" },
  { id: "desert",  label: "Desert",  image: "/images/banners/desert.svg",  placeholder: "🏜️🌵☀️" },
  { id: "mesa",    label: "Mesa",    image: "/images/banners/mesa.svg",    placeholder: "🏔️🌄🦅" },
  { id: "arctic",  label: "Arctic",  image: "/images/banners/arctic.svg",  placeholder: "❄️🐧🏔️" },
  { id: "sunset",  label: "Sunset",  image: "/images/banners/sunset.svg",  placeholder: "🌇🌆✨" },
  { id: "jungle",  label: "Jungle",  image: "/images/banners/jungle.svg",  placeholder: "🌴🦜🐒" },
];

function Settings({ user, onLogout, updateUser }) {
  const [themeName, setThemeName] = useState(loadThemeName());
  const [banner, setBanner] = useState(user?.banner || null);
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const handleThemeChange = (name) => {
    setThemeName(name);
    applyTheme(THEMES[name]);
    saveThemeName(name);
  };

  const handleBannerChange = async (bannerId) => {
    const newBanner = banner === bannerId ? null : bannerId;
    setBanner(newBanner);
    try {
      await axios.post(`/api/user/${user.username}/banner`, { banner: newBanner });
      if (updateUser) updateUser({ ...user, banner: newBanner });
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <Navigation user={user} onLogout={onLogout} />
      <div className="profile-container">
        <div className="profile-header">
          <h1>⚙️ Settings</h1>
          <p>Customize your BioTrack experience</p>
        </div>

        <div className="profile-sections">
          {/* Theme */}
          <div className="profile-section">
            <h2>🎨 Theme</h2>
            <div className="theme-grid">
              {Object.keys(THEMES).map((name) => {
                const colors = THEME_COLORS[name] || { bg: "#888", accent: "#fff" };
                const isActive = themeName === name;
                return (
                  <button key={name} onClick={() => handleThemeChange(name)}
                    className={`theme-btn${isActive ? ' active' : ''}`}>
                    <div className="theme-swatch" style={{ background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.accent} 100%)` }} />
                    <span className={`theme-label${isActive ? ' active' : ''}`}>{name}</span>
                  </button>
                );
              })}
            </div>
            <p className="settings-note">Theme is saved on this device.</p>
          </div>

          {/* Banner — only for students */}
          {isStudent && (
            <div className="profile-section">
              <h2>🖼️ Profile Banner</h2>
              <p style={{ color: '#666', marginBottom: 16 }}>
                Choose a banner for your profile page. {banner ? 'Click the active banner to remove it.' : 'Select one below.'}
              </p>
              <div className="banner-grid">
                {BANNERS.map(b => (
                  <button key={b.id} className={`banner-option${banner === b.id ? ' active' : ''}`}
                    onClick={() => handleBannerChange(b.id)}>
                    <img
                      className="banner-preview banner-preview-wide"
                      src={b.image}
                      alt={b.label}
                      style={{ objectFit: 'cover', width: '100%' }}
                    />
                    <span className="banner-label">{b.label}</span>
                    {banner === b.id && <span className="banner-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
export { BANNERS };
