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
        
        // Group exercises by muscle groups
        const groupedExercises = {};
        
        exercises.forEach(exercise => {
          // Handle different possible data structures
          let muscleGroups = [];
          
          // Check for muscle_groups array
          if (exercise.muscle_groups && Array.isArray(exercise.muscle_groups)) {
            muscleGroups = exercise.muscle_groups;
          }
          // Check for single muscleGroup property
          else if (exercise.muscleGroup) {
            muscleGroups = [exercise.muscleGroup];
          }
          
          // If we have muscle groups, process them
          if (muscleGroups.length > 0) {
            muscleGroups.forEach(mg => {
              // Extract muscle group info - handle nested structure
              let groupName, groupId;
              
              if (mg.muscle_groups) {
                // Nested structure: mg.muscle_groups.name
                groupName = mg.muscle_groups.name;
                groupId = mg.muscle_groups.id;
              } else if (mg.name) {
                // Direct structure: mg.name
                groupName = mg.name;
                groupId = mg.id;
              } else {
                console.warn('Unknown muscle group structure:', mg);
                return;
              }
              
              // Create muscle group entry if it doesn't exist
              if (!groupedExercises[groupName]) {
                groupedExercises[groupName] = {
                  muscleGroup: { name: groupName, id: groupId },
                  exercises: []
                };
              }
              
              // Add exercise to this muscle group
              groupedExercises[groupName].exercises.push(exercise);
            });
          } else {
            // If no muscle group, add to "Other" category
            if (!groupedExercises.Other) {
              groupedExercises.Other = {
                muscleGroup: { name: 'Other', id: 0 },
                exercises: []
              };
            }
            groupedExercises.Other.exercises.push(exercise);
          }
        });
        
        // Convert to array format for rendering
        const exerciseListArray = Object.values(groupedExercises);
        
        console.log('Grouped exercises:', exerciseListArray);
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
    if (event.keyCode === 13 || event.key === 'Enter') {
      handleExerciseInteraction(exercise);
    }
  };

  if (loading) {
    return (
      <div className="sidebar">
        <h2>Exercise List</h2>
        <p style={{ color: '#9ca3af' }}>Loading exercises...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sidebar">
        <h2>Exercise List</h2>
        <p style={{ color: '#FF5252' }}>Error loading exercises</p>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>{error.message}</p>
      </div>
    );
  }

  if (exerciseList.length === 0) {
    return (
      <div className="sidebar">
        <h2>Exercise List</h2>
        <p style={{ color: '#9ca3af' }}>No exercises found</p>
      </div>
    );
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
                tabIndex={0}
                role="button"
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