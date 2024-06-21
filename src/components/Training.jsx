import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.REACT_APP_API_URL

function useQuery() {
    return new URLSearchParams(useLocation().search);
  }


function Training() {
    const [exercises, setExercises] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const query = useQuery();
    const workoutId = query.get('id');

    useEffect(() => {
        const fetchWorkout = async () => {
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/workouts/${workoutId}/exercises`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data)
            setExercises(data);
            setLoading(false);
          } catch (error) {
            setError(error);
            setLoading(false);
          }
        };
    
        if (workoutId) {
          fetchWorkout();
        }
      }, [workoutId]);

      const handleIncrement = (id, field) => {
        setExercises((prevData) =>
          prevData.map((exercise) =>
            exercise.exercise_id === id
              ? { ...exercise, [field]: parseInt(exercise[field]) + 1 }
              : exercise
          )
        );
      };
    
      const handleDecrement = (id, field) => {
        setExercises((prevData) =>
          prevData.map((exercise) =>
            exercise.exercise_id === id
              ? { ...exercise, [field]: parseInt(exercise[field]) - 1 }
              : exercise
          )
        );
      };

      const handleFinishWorkout = async () => {
        const confirmation = window.confirm("Are you sure you want to finish the workout?");
        if (confirmation) {
          try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            console.log("exercises:", exercises)
    
            const exerciseData = exercises.map(exercise => ({
              userId: userId,
              workoutId: parseInt(workoutId),
              exerciseId: exercise.exercise_id,
              name: exercise.exercises.name,
              sets: parseInt(exercise.sets),
              reps: parseInt(exercise.reps),
              weight: parseFloat(exercise.weight)
            }));

            console.log("exerciseData:", exerciseData)
    
            const response = await fetch(`${API_URL}/workouts/completeWorkout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(exerciseData)
            });

            console.log(response)
    
            if (response.ok) {
              alert('Workout data saved successfully');
            } else {
              alert('Failed to save workout data');
            }
          } catch (error) {
            console.error('Error saving workout data:', error);
            alert('An error occurred while saving workout data');
          }
        }
      };

      const renderItem = (item) => (
        <div key={item.exercise_id} className={"itemContainer"}>
          <h3 className={"exerciseHeading"}>{item.exercises.name}</h3>
          <div className={"inputContainer"}>
            <span className={"itemText"}>Sets:</span>
            <input
              className={"input"}
              value={item.sets}
              type="number"
              readOnly
            />
            <div className={"buttonContainer"}>
              <button className={"button"} onClick={() => handleDecrement(item.exercise_id, 'sets')}>-</button>
              <button className={"button"} onClick={() => handleIncrement(item.exercise_id, 'sets')}>+</button>
            </div>
          </div>
          <div className={"inputContainer"}>
            <span className={"itemText"}>Reps:</span>
            <input
              className={"input"}
              value={item.reps}
              type="number"
              readOnly
            />
            <div className={"buttonContainer"}>
              <button className={"button"} onClick={() => handleDecrement(item.exercise_id, 'reps')}>-</button>
              <button className={"button"} onClick={() => handleIncrement(item.exercise_id, 'reps')}>+</button>
            </div>
          </div>
          <div className={"inputContainer"}>
            <span className={"itemText"}>Weight (kg):</span>
            <input
              className={"input"}
              value={item.weight}
              type="number"
              readOnly
            />
            <div className={"buttonContainer"}>
              <button className={"button"} onClick={() => handleDecrement(item.exercise_id, 'weight')}>-</button>
              <button className={"button"} onClick={() => handleIncrement(item.exercise_id, 'weight')}>+</button>
            </div>
          </div>
        </div>
      );

      if (loading) {
        return <div>Loading...</div>; // You can replace this with a better loading indicator
      }
    
      if (error) {
        return <div>{error}</div>
      }


    return (
        <div className={"training-container"}>
   
            {exercises.map(renderItem)}

          <button className={"finishButton"} onClick={handleFinishWorkout}>Finish Workout</button>
        </div>
      );
}

export default Training