import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import io from 'socket.io-client';
import '../styles/admin.scss';

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

  const Section = styled('div')({
    marginBottom: '20px',
  });

  return (
    <Box p={3}>
      <Typography variant="h2">Admin Page</Typography>
      {!loggedIn ? (
        <Section>
          <Typography>Password:</Typography>
          <TextField
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
          <Button variant="contained" onClick={handleLogin}>Login</Button>
        </Section>
      ) : (
        <Section>
          <Section>
            <Typography>Set Goal:</Typography>
            <TextField
              type="number"
              value={goal}
              onChange={handleGoalChange}
            />
            <Button variant="contained" onClick={handleSetGoal}>Set</Button>
          </Section>

          <Typography variant="h3">Players' Guesses:</Typography>
          <List>
            {players.map((player) => (
              <ListItem key={player.id}>
                <ListItemText primary={`${player.name}'s guess: ${player.guess}`} />
              </ListItem>
            ))}
          </List>

          <Typography variant="h3">Top Players:</Typography>
          {closestPlayer && (
            <Typography>
              Closest player: {closestPlayer.name} with a guess of {closestPlayer.guess}
            </Typography>
          )}

          <Button variant="contained" onClick={handleClearPlayers}>Clear Players</Button>

          {alertMessage && (
            <Box color="black" mt={2} bgcolor="yellow" p={2}>
              {alertMessage}
            </Box>
          )}
        </Section>
      )}
    </Box>
  );
};

export default AdminPage;
