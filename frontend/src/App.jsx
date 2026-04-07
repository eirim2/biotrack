import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AnimalExplorer from './components/AnimalExplorer';
import AnimalDetail from './components/AnimalDetail';
import Quiz from './components/Quiz';
import Profile from './components/Profile';
import './App.css';
import { THEMES, applyTheme, loadThemeName } from "./theme";
import Settings from "./components/Settings";
import { FlashcardSets, FlashcardSetDetail, FlashcardStudyPage, MatchGamePage } from './components/Flashcards';
import TeacherDashboard from './components/TeacherDashBoard';
import TeacherClasses from './components/TeacherClasses';
import TeacherClassDetail from './components/TeacherClassDetail';
import StudentClasses from './components/StudentClasses';
import StudentClassDetail from './components/StudentClassDetail';
import Inbox from './components/Inbox';
import TeacherQuizBuilder from './components/TeacherQuizBuilder';
import { BioQuizHost, BioQuizJoin } from './components/BioQuiz';
import CustomQuiz from './components/CustomQuiz';
// Scenario 3 imports
import PasswordReset from './components/PasswordReset';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminAnimalRequests from './components/AdminAnimalRequests';
import AdminCreateAnimal from './components/AdminCreateAnimal';
import AdminFeedback from './components/AdminFeedback';
import FeedbackForm from './components/FeedbackForm';
import TeacherAnimalRequest from './components/TeacherAnimalRequest';
import Chatbot from './components/Chatbot';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('biotrack_user');
    const themeName = loadThemeName();
    applyTheme(THEMES[themeName]);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('biotrack_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('biotrack_user');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('biotrack_user', JSON.stringify(updatedUserData));
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="safari-loader"></div>
        <p>Loading Safari...</p>
      </div>
    );
  }

  // If user must reset password, show reset screen
  if (user && user.must_reset_password) {
    return (
      <PasswordReset user={user} onPasswordReset={(updatedUser) => {
        updateUser(updatedUser);
      }} />
    );
  }

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <Router>
      <div className="app safari-theme">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />} />

          {/* Dashboard — role-based */}
          <Route path="/dashboard" element={
            user ? (
              isAdmin ? <AdminDashboard user={user} onLogout={handleLogout} />
              : isTeacher ? <TeacherDashboard user={user} onLogout={handleLogout} />
              : <Dashboard user={user} onLogout={handleLogout} updateUser={updateUser} />
            ) : <Navigate to="/login" />
          } />

          {/* Student routes */}
          <Route path="/explore" element={user ? <AnimalExplorer user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/flashcards" element={user ? <FlashcardSets user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/flashcards/:setId" element={user ? <FlashcardSetDetail user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/flashcards/:setId/study" element={user ? <FlashcardStudyPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/flashcards/:setId/match" element={user ? <MatchGamePage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/animal/:id" element={user ? <AnimalDetail user={user} onLogout={handleLogout} updateUser={updateUser} /> : <Navigate to="/login" />} />
          <Route path="/quiz/:animalId" element={user ? <Quiz user={user} onLogout={handleLogout} updateUser={updateUser} /> : <Navigate to="/login" />} />
          <Route path="/custom-quiz/:quizId" element={user ? <CustomQuiz user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} onLogout={handleLogout} updateUser={updateUser} /> : <Navigate to="/login" />} />
          <Route path="/inbox" element={user ? <Inbox user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />

          {/* Settings — student/teacher */}
          <Route path="/settings" element={user ? <Settings user={user} onLogout={handleLogout} updateUser={updateUser} /> : <Navigate to="/login" />} />

          {/* Feedback — student/teacher */}
          <Route path="/feedback" element={
            user && (isStudent || isTeacher) ? <FeedbackForm user={user} onLogout={handleLogout} /> : <Navigate to={user ? "/dashboard" : "/login"} />
          } />

          {/* Teacher routes */}
          <Route path="/teacher/classes" element={
            user && isTeacher ? <TeacherClasses user={user} onLogout={handleLogout} /> : <Navigate to={user ? "/dashboard" : "/login"} />
          } />
          <Route path="/teacher/classes/:classId" element={user ? <TeacherClassDetail user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
          <Route path="/teacher/custom-quizzes" element={
            user && isTeacher ? <TeacherQuizBuilder user={user} onLogout={handleLogout} /> : <Navigate to={user ? "/dashboard" : "/login"} />
          } />
          <Route path="/teacher/animal-request" element={
            user && isTeacher ? <TeacherAnimalRequest user={user} onLogout={handleLogout} /> : <Navigate to={user ? "/dashboard" : "/login"} />
          } />

          {/* Classes routing */}
          <Route path="/classes" element={
            user ? (isTeacher ? <Navigate to="/teacher/classes" /> : <StudentClasses user={user} onLogout={handleLogout} />) : <Navigate to="/login" />
          } />
          <Route path="/classes/:classId" element={user ? <StudentClassDetail user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />

          {/* BioQuiz */}
          <Route path="/bioquiz" element={
            user ? (isTeacher ? <BioQuizHost user={user} onLogout={handleLogout} /> : <BioQuizJoin user={user} onLogout={handleLogout} />) : <Navigate to="/login" />
          } />
          <Route path="/bioquiz/join" element={user ? <BioQuizJoin user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />

          {/* Admin routes */}
          <Route path="/admin/users" element={
            user && isAdmin ? <AdminUsers user={user} onLogout={handleLogout} /> : <Navigate to={user ? "/dashboard" : "/login"} />
          } />
          <Route path="/admin/animal-requests" element={
            user && isAdmin ? <AdminAnimalRequests user={user} onLogout={handleLogout} /> : <Navigate to={user ? "/dashboard" : "/login"} />
          } />
          <Route path="/admin/create-animal" element={
            user && isAdmin ? <AdminCreateAnimal user={user} onLogout={handleLogout} /> : <Navigate to={user ? "/dashboard" : "/login"} />
          } />
          <Route path="/admin/feedback" element={
            user && isAdmin ? <AdminFeedback user={user} onLogout={handleLogout} /> : <Navigate to={user ? "/dashboard" : "/login"} />
          } />

          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>

        {/* Chatbot — only for students */}
        {user && isStudent && <Chatbot />}
      </div>
    </Router>
  );
}

export default App;
