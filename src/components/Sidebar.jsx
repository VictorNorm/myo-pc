import React, { useEffect, useState } from 'react';

function Sidebar({ onExerciseClick }) {
  const [exerciseList, setExerciseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Sort and categorize the data
        const categorizedData = categorizeAndSortData(data);
        setExerciseList(categorizedData);
        
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchExerciseList();
  }, []);

  const categorizeAndSortData = (data) => {
    // Group exercises by muscle group
    const groupedData = data.reduce((acc, exercise) => {
      const muscleGroup = exercise.muscle_groups[0]?.muscle_groups?.name || 'Uncategorized';
      if (!acc[muscleGroup]) {
        acc[muscleGroup] = [];
      }
      acc[muscleGroup].push(exercise);
      return acc;
    }, {});

    // Sort muscle groups and exercises within each group
    const sortedData = Object.entries(groupedData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, exercises]) => ({
        muscle_group: group,
        exercises: exercises.sort((a, b) => a.name.localeCompare(b.name))
      }));

    return sortedData;
  };

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
          <h3>{category.muscle_group}</h3>
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