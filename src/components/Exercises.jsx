import React, { useEffect, useState } from 'react';

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
        
        // Process the grouped data format
        const processedExercises = [];
        if (Array.isArray(data)) {
          // New format: array of objects with muscleGroup and exercises properties
          data.forEach(group => {
            if (group.exercises && Array.isArray(group.exercises)) {
              // Add muscle group reference to each exercise for consistent handling
              const exercisesWithMuscleGroup = group.exercises.map(exercise => ({
                ...exercise,
                muscle_groups: [{
                  muscle_group_id: group.muscleGroup?.id,
                  muscle_groups: group.muscleGroup
                }]
              }));
              processedExercises.push(...exercisesWithMuscleGroup);
            }
          });
          setExercises(processedExercises);
        } else {
          setError('Unexpected data format from API');
        }
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
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
            if (muscleGroup?.id && !seenIds.has(muscleGroup.id)) {
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
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newExercise.name,
          muscleGroupId: newExercise.muscleGroupId,
          category: newExercise.category,
          equipment: newExercise.equipment
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add exercise');
      }
      const addedExercise = await response.json();
      
      // Add the muscle group information to the new exercise
      const muscleGroup = muscleGroups.find(group => group.id === newExercise.muscleGroupId);
      const enrichedExercise = {
        ...addedExercise,
        muscle_groups: [{
          muscle_group_id: newExercise.muscleGroupId,
          muscle_groups: muscleGroup
        }]
      };
      
      setExercises(prevExercises => [...prevExercises, enrichedExercise]);
      setNewExercise({ name: '', muscleGroupId: '', category: '', equipment: '' });
      setFormError(null);
      setRefetchTrigger(prev => prev + 1);
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