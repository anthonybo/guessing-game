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
  Alert,
  Snackbar,
} from '@mui/material';
import '../styles/admin.scss';
import io from 'socket.io-client';
import Confetti from 'react-confetti'; // Import the Confetti component

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
      showAlert: false,
      showConfetti: false, // New state variable for displaying confetti
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
    if (password === 'admin') {
      this.setState({ loggedIn: true });
      this.fetchPlayers();
      socket.on('playersUpdated', (updatedPlayers) => {
        this.setState({ players: updatedPlayers, showConfetti: true });
      });
    } else {
      this.setState({ alertMessage: 'Incorrect password', showAlert: true });
      setTimeout(() => {
        this.setState({ alertMessage: '', showAlert: false });
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
      this.setState({ alertMessage: 'Goal set successfully!', showAlert: true });
      setTimeout(() => {
        this.setState({ alertMessage: '', showAlert: false });
      }, 3000);

      // Fetch the updated players immediately after setting the goal
      await this.fetchPlayers();
    } catch (error) {
      console.error(error);
      this.setState({ alertMessage: 'Failed to set the goal.', showAlert: true });
      setTimeout(() => {
        this.setState({ alertMessage: '', showAlert: false });
      }, 3000);
    }
  };

fetchPlayers = async () => {
  const { goal, players } = this.state;

  try {
    const response = await axios.get('http://localhost:2000/api/players');
    const newPlayers = response.data;
    const sortedPlayers = newPlayers.sort(
      (a, b) => Math.abs(goal - a.guess) - Math.abs(goal - b.guess)
    );

    const isNewPlayerGuess = !players.length || players[0].id !== sortedPlayers[0].id;
    const isNewPlayer = sortedPlayers.some(player => !players.find(p => p.id === player.id));

    if (isNewPlayerGuess && isNewPlayer) {
      this.setState({ showConfetti: true });
    }

    this.setState({ players: sortedPlayers });
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
        showAlert: true,
      });
      setTimeout(() => {
        this.setState({ alertMessage: '', showAlert: false });
      }, 3000);
    } catch (error) {
      console.error(error);
      this.setState({ alertMessage: 'Failed to clear players.', showAlert: true });
      setTimeout(() => {
        this.setState({ alertMessage: '', showAlert: false });
      }, 3000);
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const { players, goal, closestPlayer } = this.state;
  
    if (players.length === 0 || goal === '') {
      if (closestPlayer && prevState.closestPlayer !== null) {
        this.setState({ closestPlayer: null });
      }
    } else if (players.length > 0 && !prevState.closestPlayer) {
      this.setState({ closestPlayer: players[0] });
    }
  }
  

  handleConfettiComplete = () => {
    this.setState({ showConfetti: false });
  };

  render() {
    const {
      password,
      loggedIn,
      goal,
      players,
      closestPlayer,
      alertMessage,
      showAlert,
      showConfetti,
    } = this.state;

    return (
      <Fade in={true} timeout={1000}>
        <Box p={3} className="admin-page">
          <Snackbar
            open={showAlert}
            autoHideDuration={3000}
            onClose={() => this.setState({ showAlert: false })}
          >
            <Alert severity="info" sx={{ width: '100%' }}>
              {alertMessage}
            </Alert>
          </Snackbar>

          <Typography variant="h2" className="admin-title">
            Admin Page
          </Typography>
          {!loggedIn ? (
            <Slide direction="up" in={true} timeout={1000}>
              <Box mb={2} className="login-container">
                <Typography variant="h4" className="login-label">
                  Password:
                </Typography>
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
              <Box mb={2} className="admin-container">
                <Box mb={2} className="goal-container">
                  <Typography variant="h4" className="goal-label">
                    Set Goal:
                  </Typography>
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

                <Typography variant="h3" className="top-players-title">
                  Top Players:
                </Typography>
                {closestPlayer && (
                  <Typography className="closest-player">
                    Closest player:{' '}
                    <span className="player-name">{closestPlayer.name}</span>{' '}
                    with a guess of{' '}
                    <span className="player-guess">{closestPlayer.guess}</span>
                  </Typography>
                )}

                <Typography variant="h3" className="players-guesses-title">
                  Players' Guesses:
                </Typography>
                <List className="players-list">
                  {players.map((player, index) => (
                    <ListItem key={player.id}>
                      <ListItemText
                        primary={`${index + 1}. ${player.name}'s guess: ${
                          player.guess
                        }`}
                        className={index === 0 ? 'top-player' : ''}
                      />
                    </ListItem>
                  ))}
                </List>

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

          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              onConfettiComplete={this.handleConfettiComplete}
            />
          )}
        </Box>
      </Fade>
    );
  }
}

export default AdminPage;
