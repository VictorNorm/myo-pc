import React, { useEffect, useState } from 'react';

function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newExercise, setNewExercise] = useState({ name: '', muscleGroup: '' });
  const [formError, setFormError] = useState(null);

  const muscleGroups = [
    'Arms', 'Shoulders', 'Chest', 'Back', 'Abdominal', 'Glutes', 'Legs', 'Calves'
  ];

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/exercises`, {
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExercise({
      ...newExercise,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newExercise.name || !newExercise.muscleGroup) {
      setFormError('Please provide both exercise name and muscle group.');
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newExercise)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const addedExercise = await response.json();
      setExercises([...exercises, addedExercise]);
      setNewExercise({ name: '', muscleGroup: '' });
      setFormError(null);
    } catch (error) {
      console.error('Failed to add exercise:', error);
      setFormError('Failed to add exercise. Please try again later.');
    }
  };

  const groupedExercises = exercises.reduce((groups, exercise) => {
    const group = exercise.muscle_group;
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
          <label htmlFor="muscleGroup">Muscle Group:</label>
          <select
            id="muscleGroup"
            name="muscleGroup"
            value={newExercise.muscleGroup}
            onChange={handleInputChange}
          >
            <option value="">Select a muscle group</option>
            {muscleGroups.map((group, index) => (
              <option key={index} value={group}>{group}</option>
            ))}
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
