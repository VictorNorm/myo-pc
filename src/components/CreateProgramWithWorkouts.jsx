import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Loader } from 'lucide-react';

const PROGRAM_TYPES = {
  PT_MANAGED: 'PT_MANAGED',
  AI_ASSISTED: 'AI_ASSISTED'
};

const GOALS = {
  HYPERTROPHY: 'HYPERTROPHY',
  STRENGTH: 'STRENGTH'
};

const isEndDateValid = (start, end) => {
  if (!end) return true; // End date is optional
  const startDate = new Date(start);
  const endDate = new Date(end);
  return endDate >= startDate;
};

function CreateProgramWithWorkouts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextId, setNextId] = useState(1);
  
  // Form state
  const [selectedUser, setSelectedUser] = useState('');
  const [programName, setProgramName] = useState('');
  const [goal, setGoal] = useState('HYPERTROPHY');
  const [programType, setProgramType] = useState(PROGRAM_TYPES.PT_MANAGED);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (!startDate) {
      setError('Please select a start date first');
      return;
    }
    
    if (!isEndDateValid(startDate, newEndDate)) {
      setError('End date cannot be before start date');
      return;
    }
    
    setError(null);
    setEndDate(newEndDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!programName || !selectedUser || !startDate || workouts.some(w => !w.name)) {
      setError('Please fill in all required fields');
      return;
    }

    if (endDate && !isEndDateValid(startDate, endDate)) {
      setError('End date cannot be before start date');
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
          goal,
          programType,
          startDate,
          endDate: endDate || null,
          workouts: workouts.map(({ name }) => ({ name }))
        })
      });

      console.log(programName,
        selectedUser,
        goal,
        programType,
        startDate,
        endDate || null,
        workouts.map(({ name }) => ({ name })))
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create program');
      }
      
      const result = await response.json();
      
      // Reset form
      setProgramName('');
      setSelectedUser('');
      setGoal('HYPERTROPHY');
      setStartDate('');
      setEndDate('');
      setWorkouts([{ id: 1, name: '', exercises: [] }]);
      setError(null);
      
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
    <div className="loading-container">
      <Loader className="spinner" size={24} />
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

          <div className="program-details__form-group">
            <label>Goal</label>
            <div className="goal-selector">
              <button
                type="button"
                onClick={() => setGoal('HYPERTROPHY')}
                className={`goal-button ${goal === 'HYPERTROPHY' ? 'active' : ''}`}
              >
                Hypertrophy
              </button>
              <button
                type="button"
                onClick={() => setGoal('STRENGTH')}
                className={`goal-button ${goal === 'STRENGTH' ? 'active' : ''}`}
              >
                Strength
              </button>
            </div>
            <div className="program-details__form-group">
              <label>Program Type</label>
              <div className="goal-selector">
                <button
                  type="button"
                  onClick={() => setProgramType(PROGRAM_TYPES.PT_MANAGED)}
                  className={`goal-button ${programType === PROGRAM_TYPES.PT_MANAGED ? 'active' : ''}`}
                >
                  PT Managed
                </button>
                <button
                  type="button"
                  onClick={() => setProgramType(PROGRAM_TYPES.AI_ASSISTED)}
                  className={`goal-button ${programType === PROGRAM_TYPES.AI_ASSISTED ? 'active' : ''}`}
                >
                  Automated
                </button>
              </div>
          </div>
          </div>

          <div className="program-details__form-group date-inputs">
            <div className="date-field">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // Clear end date if it's now invalid
                  if (endDate && !isEndDateValid(e.target.value, endDate)) {
                    setEndDate('');
                    setError('End date was cleared as it was before the new start date');
                  }
                }}
              />
            </div>
            <div className="date-field">
              <label htmlFor="endDate">End Date (Optional)</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                min={startDate} // This adds HTML5 validation
                onChange={handleEndDateChange}
              />
            </div>
          </div>
        </div>

        <div className="workouts">
          <div className="workouts__header">
            <h2>Workouts</h2>
            <button 
              type="button"
              className="workouts__add-button"
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
                    type="button"
                    className="workout-item__remove"
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