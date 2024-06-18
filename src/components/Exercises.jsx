import React, { useEffect, useState } from 'react';

function Exercises() {
  const [exercises, setExercises] = useState(null);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Add New Exercise</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Exercise Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newExercise.name}
            onChange={handleInputChange}
          />
        </div>
        <div>
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
      <h2>Exercises</h2>
      <ul>
        {exercises.map((exercise, index) => (
          <li key={index}>{exercise.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Exercises;
