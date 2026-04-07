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
  { id: "forest", label: "Forest", gradient: "linear-gradient(135deg, #2e7d32, #81c784)" },
  { id: "safari", label: "Safari", gradient: "linear-gradient(135deg, #6d4c41, #f57c00)" },
  { id: "ocean", label: "Ocean", gradient: "linear-gradient(135deg, #0d47a1, #0288d1)" },
  { id: "desert", label: "Desert", gradient: "linear-gradient(135deg, #9b7b36, #fab54d)" },
  { id: "mesa", label: "Mesa", gradient: "linear-gradient(135deg, #D3503D, #E8872D)" },
  { id: "arctic", label: "Arctic", gradient: "linear-gradient(135deg, #3949AB, #7986CB)" },
  { id: "sunset", label: "Sunset", gradient: "linear-gradient(135deg, #ff6b35, #f7c59f)" },
  { id: "jungle", label: "Jungle", gradient: "linear-gradient(135deg, #1b5e20, #4caf50)" },
];

function Settings({ user, onLogout, updateUser }) {
  const [themeName, setThemeName] = useState(loadThemeName());
  const [banner, setBanner] = useState(user?.banner || null);

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

          {/* Banner */}
          <div className="profile-section">
            <h2>🖼️ Profile Banner</h2>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Choose a banner for your profile page. {banner ? 'Click the active banner to remove it.' : 'Select one below.'}
            </p>
            <div className="banner-grid">
              {BANNERS.map(b => (
                <button key={b.id} className={`banner-option${banner === b.id ? ' active' : ''}`}
                  onClick={() => handleBannerChange(b.id)}>
                  <div className="banner-preview" style={{ background: b.gradient }} />
                  <span className="banner-label">{b.label}</span>
                  {banner === b.id && <span className="banner-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
export { BANNERS };
