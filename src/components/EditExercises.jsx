import React, { useEffect, useState } from 'react';
import toast, {Toaster} from 'react-hot-toast';

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
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/exercises`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log(data)
        setExercises(data);
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        setError('Failed to load exercises. Please try again later.');
      }
    };

    const fetchMuscleGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/muscleGroups`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setMuscleGroups(data);
      } catch (error) {
        console.error('Failed to fetch muscle groups:', error);
        setError('Failed to load muscle groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
    fetchMuscleGroups();
  }, [refetchTrigger]);

  const handleExerciseSelect = (exercise) => {
    // Check for required fields
    if (!exercise.name || !exercise.equipment || !exercise.category || !exercise.muscle_groups?.[0]?.muscle_group_id) {
      setFormError('Warning: Selected exercise is missing required data. Please check the database for data integrity issues.');
      console.error('Exercise data integrity issue:', {
        name: exercise.name,
        equipment: exercise.equipment,
        category: exercise.category,
        muscleGroupId: exercise.muscle_groups?.[0]?.muscle_group_id,
        exercise: exercise
      });
      return;
    }
  
    setSelectedExercise(exercise);
    setEditForm({
      name: exercise.name,
      equipment: exercise.equipment,
      category: exercise.category,
      muscleGroupId: exercise.muscle_groups[0].muscle_group_id
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
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/editExercises`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedExercise.id,
          ...editForm
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update exercise');
      }

      setRefetchTrigger(prev => prev + 1);
      setFormError(null);
      toast.success(`Successfully updated ${editForm.name}`); // Add success toast
    } catch (error) {
      console.error('Failed to update exercise:', error);
      setFormError('Failed to update exercise. Please try again.');
      toast.error('Failed to update exercise'); // Add error toast
    }
  };

  const getMuscleGroupName = (exercise) => {
    if (exercise.muscle_groups?.[0]?.muscle_groups) {
      return exercise.muscle_groups[0].muscle_groups.name;
    }
    if (exercise.muscle_groups?.[0]) {
      return exercise.muscle_groups[0].name;
    }
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="edit-exercises">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937', // background.secondary
            color: '#f3f4f6',     // text.primary
            border: '1px solid #374151', // background.tertiary
            borderRadius: '8px',  // border-radius.md
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)', // shadows.md
            padding: '12px 16px', // spacing.md spacing.lg
          },
          success: {
            duration: 3000,
            style: {
              background: 'rgba(76, 175, 80, 0.3)', // status.success-light
              border: '1px solid #4CAF50', // status.success
            },
            iconTheme: {
              primary: '#4CAF50', // status.success
              secondary: '#f3f4f6', // text.primary
            }
          },
          error: {
            duration: 4000,
            style: {
              background: 'rgba(255, 82, 82, 0.3)', // status.error-light
              border: '1px solid #FF5252', // status.error
            },
            iconTheme: {
              primary: '#FF5252', // status.error
              secondary: '#f3f4f6', // text.primary
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