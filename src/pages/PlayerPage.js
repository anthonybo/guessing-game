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
    try {
      await axios.post('http://localhost:2000/api/players', { name, guess });
      this.setState({
        alertMessage: `Guess submitted successfully! ${name}: ${guess}`,
        name: '',
        guess: '',
      });
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
      <Box p={3}>
        <Typography variant="h2">Player Page</Typography>
        <Box mb={2}>
          <Typography>Enter Your Name:</Typography>
          <TextField
            type="text"
            value={name}
            onChange={this.handleNameChange}
            fullWidth
          />
        </Box>
        <Box mb={2}>
          <Typography>Enter Your Guess:</Typography>
          <TextField
            type="number"
            value={guess}
            onChange={this.handleGuessChange}
            fullWidth
          />
          <Button variant="contained" onClick={this.handleGuessSubmit}>
            Submit
          </Button>
        </Box>

        <Typography variant="h3">Players' Guesses:</Typography>
        <List>
          {players.map((player, index) => (
            <ListItem key={player.id}>
              <ListItemText
                primary={`${index + 1}. ${player.name}`}
                secondary={`Guess: ${player.guess}`}
              />
            </ListItem>
          ))}
        </List>

        {adminGoal && (
          <Typography variant="h4">Admin's Goal: {adminGoal}</Typography>
        )}

        {alertMessage && (
          <Box color="black" mt={2} bgcolor="yellow" p={2}>
            {alertMessage}
          </Box>
        )}
      </Box>
    );
  }
}

export default PlayerPage;
