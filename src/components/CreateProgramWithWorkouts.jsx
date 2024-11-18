import React, { useState, useEffect } from 'react';
import { Plus, X, Users, Save, Loader } from 'lucide-react';

function CreateProgramWithWorkouts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nextId, setNextId] = useState(1);
  
  // Form state
  const [selectedUser, setSelectedUser] = useState('');
  const [programName, setProgramName] = useState('');
  const [workouts, setWorkouts] = useState([
    { id: nextId, name: '', exercises: [] }
  ]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!programName || !selectedUser || workouts.some(w => !w.name)) {
      setError('Please fill in all required fields');
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/programs/create-with-workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          programName,
          userId: selectedUser,
          workouts: workouts.map(({ name }) => ({ name }))
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create program');
      }
      
      const result = await response.json();
      
      // Reset form
      setProgramName('');
      setSelectedUser('');
      setWorkouts([{ id: 1, name: '', exercises: [] }]);
      setError(null);
      
      // Show success message
      alert('Program and workouts created successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  const addWorkout = () => {
    setNextId(prevId => prevId + 1);
    setWorkouts(prevWorkouts => [
      ...prevWorkouts,
      { id: nextId + 1, name: '', exercises: [] }
    ]);
  };

  const removeWorkout = (id) => {
    if (workouts.length === 1) return;
    setWorkouts(prevWorkouts => prevWorkouts.filter(w => w.id !== id));
  };

  const handleWorkoutNameChange = (id, name) => {
    setWorkouts(prevWorkouts => prevWorkouts.map(w => 
      w.id === id ? { ...w, name } : w
    ));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader className="animate-spin text-indigo-500" size={24} />
    </div>
  );

  return (
    <div className="program-creation">
      <h1>Create Program</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="program-details">
          <h2>Program Details</h2>
          <div className="program-details__form-group">
            <label htmlFor="programName">Program Name</label>
            <input
              type="text"
              id="programName"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Enter program name"
            />
          </div>
          <div className="program-details__form-group">
            <label htmlFor="user">Select User</label>
            <select
              id="user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="workouts">
          <div className="workouts__header">
            <h2>Workouts</h2>
            <button 
              className="workouts__add-button" 
              type="button"
              onClick={addWorkout}
            >
              <Plus size={16} /> Add Workout
            </button>
          </div>

          {workouts.length === 0 ? (
            <div className="workouts__empty">
              <p>No workouts added yet</p>
              <button onClick={addWorkout} type="button">
                Create your first workout
              </button>
            </div>
          ) : (
            <div className="workouts__list">
              {workouts.map((workout) => (
                <div key={workout.id} className="workout-item">
                  <input
                    type="text"
                    className="workout-item__input"
                    placeholder="Workout name"
                    value={workout.name}
                    onChange={(e) => handleWorkoutNameChange(workout.id, e.target.value)}
                  />
                  <button 
                    className="workout-item__remove"
                    type="button"
                    onClick={() => removeWorkout(workout.id)}
                    disabled={workouts.length === 1}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <button className="submit-button" type="submit">
          <Save size={16} /> Create Program
        </button>
      </form>
    </div>
  );
}

export default CreateProgramWithWorkouts;