import React, { useEffect, useState } from 'react';
import toast, {Toaster} from 'react-hot-toast';
import { exercisesAPI, muscleGroupsAPI } from '../utils/api/apiV2';

function EditExercises() {
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    equipment: 'MACHINE',
    category: 'COMPOUND',
    muscleGroupId: ''
  });
  const [formError, setFormError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

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

  const handleExerciseSelect = (exercise) => {
    // Check for required fields
    const muscleGroupId = exercise.muscle_groups?.[0]?.muscle_group_id;
    
    if (!exercise.name || !exercise.equipment || !exercise.category || !muscleGroupId) {
      setFormError('Warning: Selected exercise is missing required data. Please check the database for data integrity issues.');
      console.error('Exercise data integrity issue:', {
        name: exercise.name,
        equipment: exercise.equipment,
        category: exercise.category,
        muscleGroupId: muscleGroupId,
        exercise: exercise
      });
      return;
    }
  
    setSelectedExercise(exercise);
    setEditForm({
      name: exercise.name,
      equipment: exercise.equipment,
      category: exercise.category,
      muscleGroupId: muscleGroupId
    });
    setFormError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'muscleGroupId' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.muscleGroupId) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      const exerciseData = {
        id: selectedExercise.id,
        name: editForm.name,
        equipment: editForm.equipment,
        category: editForm.category,
        muscleGroupIds: [editForm.muscleGroupId] // V2 API expects array of muscle group IDs
      };

      await exercisesAPI.update(selectedExercise.id, exerciseData);
      
      setRefetchTrigger(prev => prev + 1);
      setFormError(null);
      toast.success(`Successfully updated ${editForm.name}`);
    } catch (error) {
      console.error('Failed to update exercise:', error);
      setFormError('Failed to update exercise. Please try again.');
      toast.error('Failed to update exercise');
    }
  };

  const getMuscleGroupName = (exercise) => {
    // Check for muscle group name in the new structure
    if (exercise.muscle_groups?.[0]?.muscle_groups?.name) {
      return exercise.muscle_groups[0].muscle_groups.name;
    }
    
    // Fallback to muscleGroupId lookup if we have it
    if (exercise.muscleGroupId) {
      return muscleGroups.find(group => group.id === exercise.muscleGroupId)?.name || 'Unknown';
    }
    
    return 'Unknown';
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

  // Sort exercises within each group by name
  Object.keys(groupedExercises).forEach(group => {
    groupedExercises[group].sort((a, b) => a.name.localeCompare(b.name));
  });

  // Sort muscle groups alphabetically
  const sortedMuscleGroups = Object.keys(groupedExercises).sort();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="edit-exercises">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
            padding: '12px 16px',
          },
          success: {
            duration: 3000,
            style: {
              background: 'rgba(76, 175, 80, 0.3)',
              border: '1px solid #4CAF50',
            },
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#f3f4f6',
            }
          },
          error: {
            duration: 4000,
            style: {
              background: 'rgba(255, 82, 82, 0.3)',
              border: '1px solid #FF5252',
            },
            iconTheme: {
              primary: '#FF5252',
              secondary: '#f3f4f6',
            }
          },
        }}
      />
      <div className="edit-exercises__container">
        <div className="edit-exercises__list">
          <h2>Exercises</h2>
          <div className="exercise-groups">
            {sortedMuscleGroups.map((group) => (
              <div key={group} className="exercise-group">
                <h3 className="exercise-group__title">{group}</h3>
                <div className="exercise-group__items">
                  {groupedExercises[group].map((exercise) => (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                    <div
                      key={exercise.id}
                      className={`exercise-item ${selectedExercise?.id === exercise.id ? 'exercise-item--selected' : ''}`}
                      onClick={() => handleExerciseSelect(exercise)}
                    >
                      {exercise.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="edit-exercises__form">
          <h2>Edit Exercise</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Exercise Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                className="input-primary"
                disabled={!selectedExercise}
              />
            </div>

            <div className="form-group">
              <label htmlFor="equipment">Equipment:</label>
              <select
                id="equipment"
                name="equipment"
                value={editForm.equipment}
                onChange={handleInputChange}
                className="input-primary"
                disabled={!selectedExercise}
              >
                <option value="DUMBBELL">Dumbbell</option>
                <option value="BARBELL">Barbell</option>
                <option value="CABLE">Cable</option>
                <option value="MACHINE">Machine</option>
                <option value="BODYWEIGHT">Bodyweight</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                name="category"
                value={editForm.category}
                onChange={handleInputChange}
                className="input-primary"
                disabled={!selectedExercise}
              >
                <option value="COMPOUND">Compound</option>
                <option value="ISOLATION">Isolation</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="muscleGroupId">Muscle Group:</label>
              <select
                id="muscleGroupId"
                name="muscleGroupId"
                value={editForm.muscleGroupId}
                onChange={handleInputChange}
                className="input-primary"
                disabled={!selectedExercise}
              >
                <option value="">Select a muscle group</option>
                {muscleGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {formError && (
              <div className="form-error">{formError}</div>
            )}

            <button 
              type="submit" 
              className="cta-1"
              disabled={!selectedExercise}
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditExercises;