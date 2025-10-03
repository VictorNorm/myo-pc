import React, { useEffect, useState } from 'react';
import { exercisesAPI } from '../utils/api/apiV2';

function Sidebar({ onExerciseClick }) {
  const [exerciseList, setExerciseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExerciseList = async () => {
      try {
        const exercises = await exercisesAPI.getAll();
        console.log('V2 API exercises:', exercises);
        
        // V2 API returns exercises as direct array, need to group by muscle groups
        const groupedExercises = {};
        exercises.forEach(exercise => {
          if (exercise.muscle_groups && exercise.muscle_groups.length > 0) {
            exercise.muscle_groups.forEach(mg => {
              const muscleGroup = mg.muscle_groups || mg;
              const groupName = muscleGroup.name;
              
              if (!groupedExercises[groupName]) {
                groupedExercises[groupName] = {
                  muscleGroup: { name: groupName, id: muscleGroup.id },
                  exercises: []
                };
              }
              groupedExercises[groupName].exercises.push(exercise);
            });
          }
        });
        
        // Convert to array format for rendering
        const exerciseListArray = Object.values(groupedExercises);
        setExerciseList(exerciseListArray);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchExerciseList();
  }, []);

  const handleExerciseInteraction = (exercise) => {
    onExerciseClick(exercise);
  };

  const handleKeyDown = (event, exercise) => {
    if (event.keyCode === 13) {
      handleExerciseInteraction(exercise);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="sidebar">
      <h2>Exercise List</h2>
      {exerciseList.map((category, index) => (
        <div key={index}>
          <h3>{category.muscleGroup.name}</h3>
          <ul>
            {category.exercises.map((exercise) => (
              <li 
                key={exercise.id}
                onClick={() => handleExerciseInteraction(exercise)}
                onKeyDown={(e) => handleKeyDown(e, exercise)}
                style={{ cursor: 'pointer' }}
              >
                {exercise.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Sidebar;