import React, { useEffect, useState } from 'react';

function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newExercise, setNewExercise] = useState({ name: '', muscleGroupId: '' });
  const [formError, setFormError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/exercises`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        setExercises(data);
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        setError('Failed to load exercises. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [refetchTrigger]);

  useEffect(() => {
    const fetchMuscleGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/muscleGroups`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        setMuscleGroups(data);
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        setError('Failed to load exercises. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMuscleGroups();
  }, [refetchTrigger]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExercise(prevState => ({
      ...prevState,
      [name]: name === 'muscleGroupId' ? Number.parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newExercise.name || !newExercise.muscleGroupId) {
      setFormError('Please provide both exercise name and muscle group.');
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newExercise.name,
          muscleGroupId: newExercise.muscleGroupId
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add exercise');
      }
      const addedExercise = await response.json();
      setExercises(prevExercises => [...prevExercises, addedExercise]);
      setNewExercise({ name: '', muscleGroupId: '' });
      setFormError(null);
      setRefetchTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add exercise:', error);
      setFormError('Failed to add exercise. Please try again later.');
    }
  };

  const getMuscleGroupName = (exercise) => {
    if (exercise.muscle_groups?.[0]?.muscle_groups) {
      return exercise.muscle_groups[0].muscle_groups.name;
    }
    if (exercise.muscle_groups?.[0]) {
      return exercise.muscle_groups[0].name;
    }
    // Find the muscle group name from our fetched muscleGroups
    return muscleGroups.find(group => group.id === exercise.muscleGroupId)?.name || 'Unknown';
  };

  const groupedExercises = exercises.reduce((groups, exercise) => {
    const group = getMuscleGroupName(exercise);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(exercise);
    return groups;
  }, {});

  Object.keys(groupedExercises).forEach(group => {
    groupedExercises[group].sort((a, b) => a.name.localeCompare(b.name));
  });

  const sortedMuscleGroups = Object.keys(groupedExercises).sort();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <form className='add-exercises-form' onSubmit={handleSubmit}>
        <h2>Add New Exercise</h2>
        <div className='add-exercises-form__input-container'>
          <label htmlFor="name">Exercise Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newExercise.name}
            onChange={handleInputChange}
          />
        </div>
        <div className='add-exercises-form__select-container'>
          <label htmlFor="muscleGroupId">Muscle Group:</label>
          <select
            id="muscleGroupId"
            name="muscleGroupId"
            value={newExercise.muscleGroupId}
            onChange={handleInputChange}
          >
            <option value="">Select a muscle group</option>
            {muscleGroups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <label htmlFor="categoryId">Exercise category:</label>
          <select name="category" id="categoryId">
            <option value="">Select a category</option>
            <option value="COMPOUND">Compound</option>
            <option value="ISOLATION">Isolation</option>
          </select>
        </div>
        {formError && <div style={{ color: 'red' }}>{formError}</div>}
        <button type="submit">Add Exercise</button>
      </form>
      <div className='exercise-container'>
        <h2>Exercises</h2>
        {sortedMuscleGroups.map((group, index) => (
          <div key={index}>
            <h3>{group}</h3>
            <ul>
              {groupedExercises[group].map((exercise, index) => (
                <li key={index}>{exercise.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}


export default Exercises;
