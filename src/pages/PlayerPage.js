import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, TextField, Button, List, ListItem, ListItemText, Box } from '@mui/material';
import '../styles/player.scss';

const PlayerPage = () => {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [guess, setGuess] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleGuessChange = (event) => {
    setGuess(event.target.value);
  };

  const handleGuessSubmit = async () => {
    try {
      await axios.post('http://localhost:2000/api/players', { name, guess });
      setAlertMessage(`Guess submitted successfully! ${name}: ${guess}`);
      setName('');
      setGuess('');
    } catch (error) {
      console.error(error);
      setAlertMessage('Failed to submit the guess.');
    }
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get('http://localhost:2000/api/players');
        setPlayers(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h2">Player Page</Typography>
      <Box mb={2}>
        <Typography>Enter Your Name:</Typography>
        <TextField type="text" value={name} onChange={handleNameChange} fullWidth />
      </Box>
      <Box mb={2}>
        <Typography>Enter Your Guess:</Typography>
        <TextField type="number" value={guess} onChange={handleGuessChange} fullWidth />
        <Button variant="contained" onClick={handleGuessSubmit}>Submit</Button>
      </Box>

      <Typography variant="h3">Players' Guesses:</Typography>
      <List>
        {players.map((player) => (
          <ListItem key={player.id}>
            <ListItemText primary={`${player.name}: ${player.guess}`} />
          </ListItem>
        ))}
      </List>

      {alertMessage && (
        <Box color="black" mt={2} bgcolor="yellow" p={2}>
          {alertMessage}
        </Box>
      )}
    </Box>
  );
};

export default PlayerPage;
