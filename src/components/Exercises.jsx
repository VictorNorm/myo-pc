import React, { useEffect, useState } from 'react';
import { exercisesAPI, muscleGroupsAPI } from '../utils/api/apiV2';

function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [newExercise, setNewExercise] = useState({ 
    name: '', 
    muscleGroupId: '',
    category: '',
    equipment: ''
  });

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const exercises = await exercisesAPI.getAll();
        console.log('V2 API exercises:', exercises);
        
        // V2 API returns exercises as direct array with muscle_groups already included
        setExercises(Array.isArray(exercises) ? exercises : []);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError('Failed to load exercises. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [refetchTrigger]);

  // Extract unique muscle groups from exercises instead of fetching separately
  useEffect(() => {
    if (exercises.length > 0) {
      const uniqueMuscleGroups = [];
      const seenIds = new Set();
      
      exercises.forEach(exercise => {
        if (exercise.muscle_groups && exercise.muscle_groups.length > 0) {
          exercise.muscle_groups.forEach(mg => {
            const muscleGroup = mg.muscle_groups || mg;
            if (muscleGroup && muscleGroup.id && !seenIds.has(muscleGroup.id)) {
              uniqueMuscleGroups.push({
                id: muscleGroup.id,
                name: muscleGroup.name
              });
              seenIds.add(muscleGroup.id);
            }
          });
        }
      });
      
      setMuscleGroups(uniqueMuscleGroups);
      setLoading(false);
    }
  }, [exercises]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExercise(prevState => ({
      ...prevState,
      [name]: name === 'muscleGroupId' ? Number.parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newExercise.name || !newExercise.muscleGroupId || !newExercise.category || !newExercise.equipment) {
      setFormError('Please fill in all fields: exercise name, muscle group, category, and equipment.');
      return;
    }
    try {
      const exerciseData = {
        name: newExercise.name,
        muscleGroupIds: [newExercise.muscleGroupId], // V2 API expects array of muscle group IDs
        category: newExercise.category,
        equipment: newExercise.equipment
      };

      const addedExercise = await exercisesAPI.create(exerciseData);
      
      // Refresh the exercise list to show the new exercise
      setRefetchTrigger(prev => prev + 1);
      setNewExercise({ name: '', muscleGroupId: '', category: '', equipment: '' });
      setFormError(null);
    } catch (error) {
      console.error('Failed to add exercise:', error);
      setFormError('Failed to add exercise. Please try again later.');
    }
  };

  const getMuscleGroupName = (exercise) => {
    // First, try to get the name from the muscle_groups array with the new structure
    if (exercise.muscle_groups?.[0]?.muscle_groups?.name) {
      return exercise.muscle_groups[0].muscle_groups.name;
    }
    
    // Next, try the old structure
    if (exercise.muscle_groups?.[0]?.name) {
      return exercise.muscle_groups[0].name;
    }
    
    // Finally, fall back to the muscleGroups array
    return muscleGroups.find(group => group.id === exercise.muscleGroupId)?.name || 'Unknown';
  };

  // Group exercises by muscle group
  const groupedExercises = exercises.reduce((groups, exercise) => {
    const group = getMuscleGroupName(exercise);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(exercise);
    return groups;
  }, {});

  // Sort exercises alphabetically within each group
  Object.keys(groupedExercises).forEach(group => {
    groupedExercises[group].sort((a, b) => a.name.localeCompare(b.name));
  });

  // Sort muscle groups alphabetically
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
            required
          />
        </div>
        <div className='add-exercises-form__select-container'>
          <label htmlFor="muscleGroupId">Muscle Group:</label>
          <select
            id="muscleGroupId"
            name="muscleGroupId"
            value={newExercise.muscleGroupId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a muscle group</option>
            {muscleGroups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>

          <label htmlFor="category">Exercise category:</label>
          <select 
            name="category" 
            id="category"
            value={newExercise.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a category</option>
            <option value="COMPOUND">Compound</option>
            <option value="ISOLATION">Isolation</option>
          </select>

          <label htmlFor="equipment">Equipment:</label>
          <select 
            name="equipment" 
            id="equipment"
            value={newExercise.equipment}
            onChange={handleInputChange}
            required
          >
            <option value="">Select equipment</option>
            <option value="BARBELL">Barbell</option>
            <option value="BODYWEIGHT">Bodyweight</option>
            <option value="CABLE">Cable</option>
            <option value="DUMBBELL">Dumbbell</option>
            <option value="MACHINE">Machine</option>
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