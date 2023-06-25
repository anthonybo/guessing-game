import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    <div>
      <h2>Player Page</h2>
      <div>
        <label htmlFor="nameInput">Enter Your Name:</label>
        <input type="text" id="nameInput" value={name} onChange={handleNameChange} />
      </div>
      <div>
        <label htmlFor="guessInput">Enter Your Guess:</label>
        <input type="number" id="guessInput" value={guess} onChange={handleGuessChange} />
        <button onClick={handleGuessSubmit}>Submit</button>
      </div>

      <h3>Players' Guesses:</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.name}: {player.guess}
          </li>
        ))}
      </ul>

      {alertMessage && (
        <div style={{ marginTop: '20px', backgroundColor: 'yellow', padding: '10px' }}>
          {alertMessage}
        </div>
      )}
    </div>
  );
};

export default PlayerPage;
