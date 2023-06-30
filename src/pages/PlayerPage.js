import React, { Component } from 'react';
import axios from 'axios';
import {
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Alert
} from '@mui/material';
import '../styles/player.scss';

class PlayerPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
      name: '',
      guess: '',
      alertMessage: '',
      adminGoal: null,
    };
  }

  componentDidMount() {
    this.fetchPlayers();
  }

  handleNameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  handleGuessChange = (event) => {
    this.setState({ guess: event.target.value });
  };

  handleGuessSubmit = async () => {
    const { name, guess } = this.state;

    if (name.trim() === '' || guess.trim() === '') {
      this.setState({ alertMessage: 'Please enter both name and guess.' });
      return;
    }

    try {
      await axios.post('http://localhost:2000/api/players', { name, guess });
      this.setState({
        alertMessage: `Guess submitted successfully! ${name}: ${guess}`,
        name: '',
        guess: '',
      });

      setTimeout(() => {
        this.setState({ alertMessage: '' });
      }, 3000);

      this.fetchPlayers(); // Fetch players again to update the top scores immediately
    } catch (error) {
      console.error(error);
      this.setState({ alertMessage: 'Failed to submit the guess.' });
    }
  };

  fetchPlayers = async () => {
    try {
      const playersResponse = await axios.get(
        'http://localhost:2000/api/players'
      );
      const goalResponse = await axios.get('http://localhost:2000/api/goal');

      const sortedPlayers = playersResponse.data.sort(
        (a, b) =>
          Math.abs(a.guess - goalResponse.data) -
          Math.abs(b.guess - goalResponse.data)
      );

      this.setState({
        players: sortedPlayers,
        adminGoal: goalResponse.data,
      });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const { players, name, guess, alertMessage, adminGoal } = this.state;

    return (
      <div className="player-page">
        <h2 className="title">Player Page</h2>
        <div className="form-container">
          <Typography>Enter Your Name:</Typography>
          <TextField
            type="text"
            value={name}
            onChange={this.handleNameChange}
            fullWidth
            className="input-field"
          />
          <Typography>Enter Your Guess:</Typography>
          <TextField
            type="number"
            value={guess}
            onChange={this.handleGuessChange}
            fullWidth
            className="input-field"
          />
          <Button
            variant="contained"
            onClick={this.handleGuessSubmit}
            className="submit-button"
          >
            Submit
          </Button>
        </div>

        <div className="guesses-container">
          <Typography variant="h3" className="guesses-title">
            Players' Guesses:
          </Typography>
          <List>
            {players.map((player, index) => (
              <ListItem
                key={player.id}
                className={index === 0 ? 'guess-item top-guess' : 'guess-item'}
              >
                <ListItemText
                  primary={`${index + 1}. ${player.name}`}
                  secondary={`Guess: ${player.guess}`}
                  className="guess-info"
                />
              </ListItem>
            ))}
          </List>
        </div>

        {adminGoal && (
          <Typography variant="h4" className="goal-info">
            Admin's Goal: {adminGoal}
          </Typography>
        )}

        {alertMessage && (
          <Alert severity="info" className="alert-banner">
            {alertMessage}
          </Alert>
        )}
      </div>
    );
  }
}

export default PlayerPage;
