import React, { Component } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Fade,
  Slide,
} from '@mui/material';
import '../styles/admin.scss';
import io from 'socket.io-client';

const socket = io('http://localhost:2000', { transports: ['websocket'] });

class AdminPage extends Component {
  constructor(props) {
    super(props);
    this.passwordRef = React.createRef();
    this.goalRef = React.createRef();
    this.state = {
      password: '',
      loggedIn: false,
      goal: '',
      players: [],
      closestPlayer: null,
      alertMessage: '',
    };
  }

  componentDidMount() {
    this.passwordRef.current.focus();
  }

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value });
  };

  handlePasswordKeyUp = (event) => {
    if (event.key === 'Enter') {
      this.handleLogin();
    }
  };

  handleLogin = () => {
    const { password } = this.state;
    // Check if the password is correct (you can replace 'adminpassword' with your actual password)
    if (password === 'adminpassword') {
      this.setState({ loggedIn: true });
      this.fetchPlayers();
      socket.on('playersUpdated', (updatedPlayers) => {
        this.setState({ players: updatedPlayers });
      });
    } else {
      this.setState({ alertMessage: 'Incorrect password' });
      setTimeout(() => {
        this.setState({ alertMessage: '' });
      }, 3000);
    }
  };

  handleGoalChange = (event) => {
    this.setState({ goal: event.target.value });
  };

  handleSetGoal = async () => {
    const { goal } = this.state;
    try {
      await axios.post('http://localhost:2000/api/goal', { goal });
      this.setState({ alertMessage: 'Goal set successfully!' });
      setTimeout(() => {
        this.setState({ alertMessage: '' });
      }, 3000);

      // Fetch the updated players immediately after setting the goal
      await this.fetchPlayers();
    } catch (error) {
      console.error(error);
      this.setState({ alertMessage: 'Failed to set the goal.' });
      setTimeout(() => {
        this.setState({ alertMessage: '' });
      }, 3000);
    }
  };

  fetchPlayers = async () => {
    const { goal } = this.state;
    try {
      const response = await axios.get('http://localhost:2000/api/players');
      const players = response.data;
      const sortedPlayers = players.sort((a, b) => {
        const differenceA = Math.abs(a.guess - goal);
        const differenceB = Math.abs(b.guess - goal);
        return differenceA - differenceB;
      });
      const closestPlayer = sortedPlayers.length > 0 ? sortedPlayers[0] : null;
      this.setState({ players: sortedPlayers, closestPlayer });
    } catch (error) {
      console.error(error);
    }
  };
  
  handleClearPlayers = async () => {
    try {
      await axios.post('http://localhost:2000/api/clearPlayers');
      this.setState({
        players: [],
        closestPlayer: null,
        alertMessage: 'Players cleared successfully!',
      });
      setTimeout(() => {
        this.setState({ alertMessage: '' });
      }, 3000);
    } catch (error) {
      console.error(error);
      this.setState({ alertMessage: 'Failed to clear players.' });
      setTimeout(() => {
        this.setState({ alertMessage: '' });
      }, 3000);
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const { players, goal, closestPlayer } = this.state;

    if (players.length === 0 || goal === '') {
      if (closestPlayer !== null) {
        this.setState({ closestPlayer: null });
      }
    } else if (players.length > 0 && closestPlayer === null) {
      this.setState({ closestPlayer: players[0] });
    }
  }

  render() {
    const {
      password,
      loggedIn,
      goal,
      players,
      closestPlayer,
      alertMessage,
    } = this.state;

    return (
      <Fade in={true} timeout={1000}>
        <Box p={3} className="admin-page">
          {alertMessage && (
            <Box
              color="black"
              mt={2}
              bgcolor="yellow"
              p={2}
              className="alert-box"
            >
              {alertMessage}
            </Box>
          )}

          <Typography variant="h2">Admin Page</Typography>
          {!loggedIn ? (
            <Slide direction="up" in={true} timeout={1000}>
              <Box mb={2}>
                <Typography>Password:</Typography>
                <TextField
                  id="password"
                  type="password"
                  value={password}
                  onChange={this.handlePasswordChange}
                  onKeyUp={this.handlePasswordKeyUp}
                  inputRef={this.passwordRef}
                  variant="filled"
                  className="text-field"
                />
                <Button
                  variant="contained"
                  onClick={this.handleLogin}
                  className="login-button"
                >
                  Login
                </Button>
              </Box>
            </Slide>
          ) : (
            <Slide direction="up" in={true} timeout={1000}>
              <Box mb={2}>
                <Box mb={2}>
                  <Typography>Set Goal:</Typography>
                  <TextField
                    type="number"
                    value={goal}
                    onChange={this.handleGoalChange}
                    inputRef={this.goalRef}
                    variant="filled"
                    className="text-field"
                  />
                  <Button
                    variant="contained"
                    onClick={this.handleSetGoal}
                    className="set-goal-button"
                  >
                    Set
                  </Button>
                </Box>

                <Typography variant="h3">Players' Guesses:</Typography>
                <List className="players-list">
                  {players.map((player, index) => (
                    <ListItem key={player.id}>
                      <ListItemText
                        primary={`${index + 1}. ${player.name}'s guess: ${
                          player.guess
                        }`}
                        style={{
                          color: index === 0 ? 'green' : 'inherit',
                          fontWeight: index === 0 ? 'bold' : 'normal',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="h3">Top Players:</Typography>
                {closestPlayer && (
                  <Typography>
                    Closest player:{' '}
                    <span style={{ color: 'blue', fontWeight: 'bold' }}>
                      {closestPlayer.name}
                    </span>{' '}
                    with a guess of{' '}
                    <span style={{ color: 'blue', fontWeight: 'bold' }}>
                      {closestPlayer.guess}
                    </span>
                  </Typography>
                )}

                <Button
                  variant="contained"
                  onClick={this.handleClearPlayers}
                  className="clear-players-button"
                >
                  Clear Players
                </Button>
              </Box>
            </Slide>
          )}
        </Box>
      </Fade>
    );
  }
}

export default AdminPage;
