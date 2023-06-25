import React from 'react';

const TopUsers = ({ users }) => {
  return (
    <div>
      <h2>Top Users</h2>
      <ol>
        {users.map((user, index) => (
          <li key={user.id}>{`${index + 1}. ${user.name}`}</li>
        ))}
      </ol>
    </div>
  );
};

export default TopUsers;
