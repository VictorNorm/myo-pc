import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const EditProgram = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchUserPrograms = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/programs?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch programs');
      const data = await response.json();
      setPrograms(data.programs);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedWorkout(null);
    fetchUserPrograms(user.id);
  };

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName} ${user.username}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="program-editor">
      <div className="program-editor__sidebar">
        <div className="program-editor__sidebar__search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="search-icon" size={20} />
        </div>
        
        <div className="program-editor__sidebar__list">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleUserSelect(user)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleUserSelect(user);
                }
              }}
              className={selectedUser?.id === user.id ? 'selected' : ''}
            >
              <h3>{user.firstName} {user.lastName}</h3>
              <p>{user.username}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="program-editor__content">
        {!selectedUser ? (
          <div className="program-editor__content__empty">
            <h2>Select a User</h2>
            <p>Choose a user from the list to view and edit their program</p>
          </div>
        ) : (
          <>
            <div className="program-editor__content__header">
              <h2>Program for {selectedUser.firstName} {selectedUser.lastName}</h2>
            </div>
            
            <div className="program-editor__content__programs">
              {programs.map(program => (
                <div key={program.id} className="program-card">
                  <h3>{program.name}</h3>
                  {/* Program details will go here */}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

};

export default EditProgram;