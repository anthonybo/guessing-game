import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import AdminPage from './pages/AdminPage';
import PlayerPage from './pages/PlayerPage';

const App = () => {
  const [goal, setGoal] = useState(null);

  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={<AdminPage setGoal={setGoal} />}
        />
        <Route
          path="/player"
          element={<PlayerPage goal={goal} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
