import React, { useState } from 'react';

const GuessForm = ({ onGuess }) => {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuess(guess);
    setGuess('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Enter your guess"
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default GuessForm;
