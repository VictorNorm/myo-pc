import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function AddWorkouts() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [errorPrograms, setErrorPrograms] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [errorWorkouts, setErrorWorkouts] = useState(null);
  const [errorAddWorkouts, setErrorAddWorkouts] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
        setLoadingUsers(false);
      } catch (error) {
        setErrorUsers(error);
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/allprograms`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPrograms(data.programs);
        setLoadingPrograms(false);
      } catch (error) {
        setErrorPrograms(error);
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      const fetchWorkouts = async () => {
        setLoadingWorkouts(true);
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:3000/programs/${selectedProgramId}/workouts`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setWorkouts(data);
          setLoadingWorkouts(false);
        } catch (error) {
          setErrorWorkouts(error);
          setLoadingWorkouts(false);
        }
      };

      fetchWorkouts();
    }
  }, [selectedProgramId]);

  if (loadingUsers || loadingPrograms) {
    return <div>Loading...</div>; // You can replace this with a better loading indicator
  }

  if (errorUsers) {
    return <div>Error loading users: {errorUsers.message}</div>;
  }

  if (errorPrograms) {
    return <div>Error loading programs: {errorPrograms.message}</div>;
  }

  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value);
    setSelectedProgramId(''); // Reset the selected program when user changes
    setWorkouts([]); // Reset workouts when user changes
  };

  const handleProgramChange = (e) => {
    setSelectedProgramId(e.target.value);
  };

  const handleAddWorkout = (event) => {
    event.preventDefault()

    try {
      setErrorAddWorkouts(false);
      console.log("bajs");
    } catch (error) {
      
    }
  };

  const filteredPrograms = selectedUserId
    ? programs.filter(program => program.userId === parseInt(selectedUserId))
    : [];

  return (
    <div className='add-workout-container'>
      <h1>Add workout</h1>
      <div className='add-workout-container__select-container'>
        <div className='add-workout-container__select-container__user'>
          <h2>Select User</h2>
          <select onChange={handleUserChange} value={selectedUserId || ''}>
            <option value="" disabled>Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.username})
              </option>
            ))}
          </select>
        </div>
        <div className='add-workout-container__select-container__program'>
          <h2>Select Program</h2>
          <select onChange={handleProgramChange} value={selectedProgramId} disabled={!selectedUserId}>
            <option value="" disabled>Select a program</option>
            {filteredPrograms.map(program => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className='add-workout-container__input-container'>
        <form action="post" onSubmit={handleAddWorkout}>
          <label htmlFor="workoutName"><h2>Name</h2></label>
          <input type="text" name="workoutName" id="workoutName" />
          {errorAddWorkouts && <p className='error-message'>Please enter a workout name</p>}
          <button type="submit">Add workout</button>
        </form>
      </div>
      <div className='workouts-list'>
        {loadingWorkouts && <div>Loading workouts...</div>}
        {errorWorkouts && <div>Error loading workouts: {errorWorkouts.message}</div>}
        {!loadingWorkouts && !errorWorkouts && (
          <div>
            <h2>Workouts</h2>
            {workouts.map((workout) => {
              return <Link to={`/training?id=${workout.id}`} key={workout.id}>
                      <div className='workouts-container__workout'>{workout.name}</div>
                    </Link>
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddWorkouts;