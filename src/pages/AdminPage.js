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
import Confetti from 'react-confetti';

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
      closestPlayers: [],
      alertMessage: '',
      showAlert: false,
      showConfetti: false,
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

    if (password === 'admin') {
      this.setState({ loggedIn: true });
      this.fetchPlayers();

      socket.on('playersUpdated', (updatedPlayers) => {
        this.setState({ players: updatedPlayers, showConfetti: true }, () => {
          this.updateClosestPlayers();
        });
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
    const { goal } = this.state;

    try {
      const response = await axios.get('http://localhost:2000/api/players');
      const newPlayers = response.data;

      const sortedPlayers = newPlayers.sort(
        (a, b) => Math.abs(goal - a.guess) - Math.abs(goal - b.guess)
      );

      this.setState({ players: sortedPlayers }, () => {
        this.updateClosestPlayers();
      });
    } catch (error) {
      console.error(error);
    }
  };

  updateClosestPlayers = () => {
    const { players, goal } = this.state;
    const closestPlayers = [];

    let closestDiff = Infinity;
    players.forEach((player) => {
      const diff = Math.abs(goal - player.guess);
      if (diff < closestDiff) {
        closestPlayers.length = 0; // Clear the array
        closestPlayers.push(player);
        closestDiff = diff;
      } else if (diff === closestDiff) {
        closestPlayers.push(player);
      }
    });

    this.setState({ closestPlayers });
  };

  handleClearPlayers = async () => {
    try {
      await axios.post('http://localhost:2000/api/clearPlayers');
      this.setState({
        players: [],
        closestPlayers: [],
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
    const { players } = this.state;

    if (players.length === 0) {
      if (prevState.closestPlayers.length > 0) {
        this.setState({ closestPlayers: [] });
      }
    } else if (players.length > 0 && prevState.players !== players) {
      this.updateClosestPlayers();
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
      closestPlayers,
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
                {closestPlayers.length > 0 && (
                  <List className="players-list">
                    {closestPlayers.map((player, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`${player.name} - ${player.guess}`} />
                      </ListItem>
                    ))}
                  </List>
                )}
                {players.length === 0 && (
                  <Typography variant="h5" className="no-players-message">
                    No players available.
                  </Typography>
                )}

                <Typography variant="h3" className="all-players-title">
                  All Players:
                </Typography>
                <List className="players-list">
                  {players.map((player, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`${player.name} - ${player.guess}`} />
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
