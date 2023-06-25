import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:2000', { transports: ['websocket'] });

const AdminPage = () => {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [goal, setGoal] = useState('');
  const [players, setPlayers] = useState([]);
  const [closestPlayer, setClosestPlayer] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = () => {
    // Check if the password is correct (you can replace 'adminpassword' with your actual password)
    if (password === 'adminpassword') {
      setLoggedIn(true);
      fetchPlayers();
      socket.on('playersUpdated', (updatedPlayers) => {
        setPlayers(updatedPlayers);
      });
    } else {
      setAlertMessage('Incorrect password');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    }
  };

  const handleGoalChange = (event) => {
    setGoal(event.target.value);
  };

  const handleSetGoal = async () => {
    try {
      await axios.post('http://localhost:2000/api/goal', { goal });
      setAlertMessage('Goal set successfully!');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    } catch (error) {
      console.error(error);
      setAlertMessage('Failed to set the goal.');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('http://localhost:2000/api/players');
      setPlayers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearPlayers = async () => {
    try {
      await axios.post('http://localhost:2000/api/clearPlayers');
      setPlayers([]);
      setClosestPlayer(null);
      setAlertMessage('Players cleared successfully!');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    } catch (error) {
      console.error(error);
      setAlertMessage('Failed to clear players.');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    }
  };

  useEffect(() => {
    if (players.length > 0 && goal !== '') {
      const closest = players.reduce((prev, curr) =>
        Math.abs(curr.guess - goal) < Math.abs(prev.guess - goal) ? curr : prev
      );
      setClosestPlayer(closest);
    } else {
      setClosestPlayer(null);
    }
  }, [players, goal]);

  return (
    <div>
      <h2>Admin Page</h2>
      {!loggedIn ? (
        <div>
          <label htmlFor="passwordInput">Password:</label>
          <input type="password" id="passwordInput" value={password} onChange={handlePasswordChange} />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <div>
            <label htmlFor="goalInput">Set Goal:</label>
            <input type="number" id="goalInput" value={goal} onChange={handleGoalChange} />
            <button onClick={handleSetGoal}>Set</button>
          </div>

          <h3>Players' Guesses:</h3>
          <ul>
            {players.map((player) => (
              <li key={player.id}>
                {player.name}'s guess: {player.guess}
              </li>
            ))}
          </ul>

          <h3>Top Players:</h3>
          {closestPlayer && (
            <p>
              Closest player: {closestPlayer.name} with a guess of {closestPlayer.guess}
            </p>
          )}

          <button onClick={handleClearPlayers}>Clear Players</button>

          {alertMessage && (
            <div style={{ marginTop: '20px', backgroundColor: 'yellow', padding: '10px' }}>
              {alertMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
