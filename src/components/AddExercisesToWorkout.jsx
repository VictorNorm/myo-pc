import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

function AddExercisesToWorkout() {
  const { workoutExercises } = useOutletContext();

  const isEmpty = Object.keys(workoutExercises).length === 0;
  const sortedMuscleGroups = isEmpty ? [] : Object.keys(workoutExercises).sort();

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

  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [errorExercises, setErrorExercises] = useState(null);

  const [exerciseList, setExerciseList] = useState([]);
  const [loadingExerciseList, setLoadingExerciseList] = useState(false);
  const [errorExerciseList, setErrorExerciseList] = useState(null);

  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/allprograms`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data)
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
    const fetchExerciseList = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/exercises`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data)
        setErrorExerciseList(data.programs);
        setLoadingExerciseList(false);
      } catch (error) {
        setErrorExerciseList(error);
        setLoadingExerciseList(false);
      }
    };

    fetchExerciseList();
  }, []);

  const fetchWorkouts = async (programId) => {
    setLoadingWorkouts(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/programs/${programId}/workouts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data)
      setWorkouts(data);
      setLoadingWorkouts(false);
    } catch (error) {
      setErrorWorkouts(error);
      setLoadingWorkouts(false);
    }
  };

  const fetchExercises = async (workoutId) => {
    setLoadingExercises(true);
    try {
      const token = localStorage.getItem("token");
      console.log(`Fetching exercises for workout ID: ${workoutId}`);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/workouts/${workoutId}/exercises`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("EXERCISES", data);
      setExercises(data);
      console.log("Set exercises state", data);
      setLoadingExercises(false);
    } catch (error) {
      setErrorExercises(error);
      setLoadingExercises(false);
    }
  };

  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value);
    setSelectedProgramId(''); // Reset the selected program when user changes
    setWorkouts([]); // Reset workouts when user changes
  };

  const handleProgramChange = (e) => {
    const programId = e.target.value;
    setSelectedProgramId(programId);
    fetchWorkouts(programId); // Fetch workouts for the selected program
  };

  const handleWorkoutChange = (e) => {
    const workoutId = Number.parseInt(e.target.value);
    setSelectedWorkoutId(workoutId);
    fetchExercises(workoutId); // Fetch exercises for the selected workout
  };

  const filteredPrograms = selectedUserId
    ? programs.filter(program => program.userId === Number.parseInt(selectedUserId, 10))
    : [];

  return (
    <div>
      <div className="addExercisesToWorkout-container">
      {isEmpty ? (
          <p>No exercises added yet. Drag exercises here to add them to your workout.</p>
        ) : (
          sortedMuscleGroups.map((group, index) => (
            <div key={index}>
              <h3>{group}</h3>
              <ul>
                {workoutExercises[group].map((exercise, exerciseIndex) => (
                  <li key={exerciseIndex}>{exercise.name}</li>
                ))}
              </ul>
            </div>
          ))
        )}
        <div className="add-workout-container__select-container">
          <div className="add-workout-container__select-container__user">
            <h2>Select User</h2>
            <select
              onChange={handleUserChange}
              value={selectedUserId || ""}
              className="input-primary"
            >
              <option value="" disabled>
                Select a user
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.username})
                </option>
              ))}
            </select>
          </div>
          <div className="add-workout-container__select-container__program">
            <h2>Select Program</h2>
            <select
              onChange={handleProgramChange}
              value={selectedProgramId}
              disabled={!selectedUserId}
              className="input-primary"
            >
              <option value="" disabled>
                Select a program
              </option>
              {filteredPrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
          <div className="add-workout-container__select-container__workout">
            <h2>Select Workout</h2>
            <select
              onChange={handleWorkoutChange}
              value={selectedWorkoutId}
              disabled={!selectedProgramId}
              className="input-primary"
            >
              <option value="" disabled>
                Select a workout
              </option>
              {workouts.map((workout) => (
                <option key={workout.id} value={workout.id}>
                  {workout.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddExercisesToWorkout;
