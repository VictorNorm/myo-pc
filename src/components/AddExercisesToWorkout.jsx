import React, { useEffect, useState, memo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function AddExercisesToWorkout() {
  const { workoutExercises, targetExercises, setTargetExercises } = useOutletContext();
  const targetExercisesRef = useRef(null);

  // const [targetExercises, setTargetExercises] = useState([]);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [errorPrograms, setErrorPrograms] = useState(null);

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');

  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [errorWorkouts, setErrorWorkouts] = useState(null);

  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [errorExercises, setErrorExercises] = useState(null);

  const [exerciseList, setExerciseList] = useState([]);
  const [loadingExerciseList, setLoadingExerciseList] = useState(false);
  const [errorExerciseList, setErrorExerciseList] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
        setLoadingUsers(false);
      } catch (error) {
        setErrorUsers(error);
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/allprograms`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPrograms(data.programs);
        setLoadingPrograms(false);
      } catch (error) {
        setErrorPrograms(error);
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

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
        console.log(data)
        setExerciseList(data);
        setLoadingExerciseList(false);
      } catch (error) {
        setErrorExerciseList(error);
        setLoadingExerciseList(false);
      }
    };
  
    fetchExerciseList();
  }, []);

  const fetchWorkouts = async (programId) => {
    setLoadingWorkouts(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/programs/${programId}/workouts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setWorkouts(data);
      setLoadingWorkouts(false);
    } catch (error) {
      setErrorWorkouts(error);
      setLoadingWorkouts(false);
    }
  };

  const fetchExercises = async (workoutId) => {
    setLoadingExercises(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/workouts/${workoutId}/exercises`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const updatedExercises = data.map(exercise => {
        return {
          ...exercise,
          exercise_id: exercise.id || exercise.exercise_id || Date.now().toString(),
          name: exercise.name || (exercise.exercises?.name) || 'Unknown Exercise',
          sets: exercise.sets || 0,
          reps: exercise.reps || 0,
          weight: exercise.weight || 0
        };
      });
      setTargetExercises(updatedExercises);
      setLoadingExercises(false);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setErrorExercises(error);
      setLoadingExercises(false);
    }
  };

  const handleIncrement = (exerciseId, field) => {
    setTargetExercises(prevExercises => prevExercises.map(exercise => 
      exercise.exercise_id === exerciseId 
        ? { ...exercise, [field]: exercise[field] + (field === 'weight' ? 2.5 : 1) }
        : exercise
    ));
  };

  const handleDecrement = (exerciseId, field) => {
    setTargetExercises(prevExercises => prevExercises.map(exercise => 
      exercise.exercise_id === exerciseId 
        ? { ...exercise, [field]: Math.max(0, exercise[field] - (field === 'weight' ? 2.5 : 1)) }
        : exercise
    ));
  };

  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value);
    setSelectedProgramId('');
    setWorkouts([]);
  };

  const handleProgramChange = (e) => {
    const programId = e.target.value;
    setSelectedProgramId(programId);
    fetchWorkouts(programId);
  };

  const handleWorkoutChange = (e) => {
    const workoutId = Number.parseInt(e.target.value);
    setSelectedWorkoutId(workoutId);
    fetchExercises(workoutId);
  };

  const handleRemoveExercise = (exerciseId) => {
    setTargetExercises(prevExercises => 
      prevExercises.filter(exercise => exercise.exercise_id !== exerciseId)
    );
  };

  const renderItem = (item, index) => {
    if (!item || typeof item.exercise_id === 'undefined') {
      console.error("Invalid exercise item:", item);
      return null; // Skip rendering this item
    }
  
    const exerciseId = item.exercise_id.toString();
    const exerciseName = item.name || (item.exercises?.name) || 'Unknown Exercise';

    return (
      <Draggable key={exerciseId} draggableId={exerciseId} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={"itemContainer"}
          >
            <button
              onClick={() => handleRemoveExercise(item.exercise_id)}
              className="itemContainer__button"
            type="button">
              X
            </button>
            <h3 className={"exerciseHeading"}>{item.exercises ? item.exercises.name : item.name || 'Unknown Exercise'}</h3>
            <div className={"inputContainer"}>
              <span className={"itemText"}>Sets:</span>
              <input
                className={"input"}
                value={item.sets || 0}
                type="number"
                readOnly
              />
              <div className={"buttonContainer"}>
                <button className={"button"} type="button" onClick={() => handleDecrement(item.exercise_id, 'sets')}>-</button>
                <button className={"button"} type="button" onClick={() => handleIncrement(item.exercise_id, 'sets')}>+</button>
              </div>
            </div>
            <div className={"inputContainer"}>
              <span className={"itemText"}>Reps:</span>
              <input
                className={"input"}
                value={item.reps || 0}
                type="number"
                readOnly
              />
              <div className={"buttonContainer"}>
                <button className={"button"} type="button" onClick={() => handleDecrement(item.exercise_id, 'reps')}>-</button>
                <button className={"button"} type="button" onClick={() => handleIncrement(item.exercise_id, 'reps')}>+</button>
              </div>
            </div>
            <div className={"inputContainer"}>
              <span className={"itemText"}>Weight (kg):</span>
              <input
                className={"input"}
                value={item.weight || 0}
                type="number"
                readOnly
              />
              <div className={"buttonContainer"}>
                <button className={"button"} type="button" onClick={() => handleDecrement(item.exercise_id, 'weight')}>-</button>
                <button className={"button"} type="button" onClick={() => handleIncrement(item.exercise_id, 'weight')}>+</button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(targetExercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTargetExercises(items);
  };

  const filteredPrograms = selectedUserId
    ? programs.filter(program => program.userId === Number.parseInt(selectedUserId, 10))
    : [];

    const MemoizedDroppable = memo(({ children, ...props }) => (
      <Droppable {...props}>
        {(provided, snapshot) => children(provided, snapshot)}
      </Droppable>
    ));

    const saveWorkout = async (event) => {
      event.preventDefault();
      const htmlCollection = targetExercisesRef.current.children[0].children;

      const collectedExerciseData = [];

      for(const element of htmlCollection) {
        const draggableId = element.dataset.rfdDraggableId;

        const collection = element.children;
        const result = {
          id: Number.parseInt(draggableId),
          name: null,
          sets:  null,
          reps: null,
          weight: null,
        };

        for (let i = 0; i < collection.length; i++) {
          const element = collection[i];
          
          if (i === 0) {
          } else if (i === 1) {
              result.name = element.innerHTML;
          } else if (i >= 2 && i <= 4) {
              if (element.children.length > 1) {
                  const value = element.children[1].value.trim();
                 
                  switch(i) {
                      case 2:
                          result.sets = Number.parseInt(value);
                          break;
                      case 3:
                          result.reps = Number.parseInt(value);
                          break;
                      case 4:
                          result.weight = Number.parseInt(value);
                          break;
                          default:
                            console.warn(`Unexpected index ${i} in inner loop`);
                            break;
                  }
              }
          }
      }

      collectedExerciseData.push(result);
      
    }
    
      console.log(collectedExerciseData);
      console.log(selectedWorkoutId)

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/upsertExercisesToWorkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            workoutId: selectedWorkoutId,
            exercises: collectedExerciseData
          })
        });
    
        if (!response.ok) {
          throw new Error('Failed to add exercises to workout');
        }
    
        const result = await response.json();
        console.log(result.message);
        // Handle success (e.g., show a success message, update UI, etc.)
      } catch (error) {
        console.error('Error saving workout:', error);
        // Handle error (e.g., show error message to user)
      }

    }

    return (
      <div className="addExercisesToWorkout-container">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="addExercisesToWorkout-container__left" ref={targetExercisesRef}>
            <MemoizedDroppable droppableId="target-exercises" type='group'>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="addExercisesToWorkout-container__exercises"
                  id="target-exercises"
                >
                  {loadingExercises ? (
                    <p>Loading exercises...</p>
                  ) : errorExercises ? (
                    <p>Error loading exercises: {errorExercises.message}</p>
                  ) : (
                    <>
                      {targetExercises.map((exercise, index) => renderItem(exercise, index))}
                    </>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </MemoizedDroppable>
          </div>
        </DragDropContext>
  
        <div className="addExercisesToWorkout-container__right">
          <div className="add-workout-container__select-container">
            <div className="add-workout-container__select-container__user">
              <h2>Select User</h2>
              <select
                onChange={handleUserChange}
                value={selectedUserId || ""}
                className="input-primary"
              >
                <option value="" disabled>Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.username})
                  </option>
                ))}
              </select>
            </div>
            <div className="add-workout-container__select-container__program">
              <h2>Select Program</h2>
              <select
                onChange={handleProgramChange}
                value={selectedProgramId}
                disabled={!selectedUserId}
                className="input-primary"
              >
                <option value="" disabled>Select a program</option>
                {filteredPrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="add-workout-container__select-container__workout">
              <h2>Select Workout</h2>
              <select
                onChange={handleWorkoutChange}
                value={selectedWorkoutId}
                disabled={!selectedProgramId}
                className="input-primary"
              >
                <option value="" disabled>Select a workout</option>
                {workouts.map((workout) => (
                  <option key={workout.id} value={workout.id}>
                    {workout.name}
                  </option>
                ))}
              </select>
            </div>
            <form onSubmit={saveWorkout}>
              <button className='cta-1' type='submit'>Save workout</button>
            </form>
          </div>
        </div>
      </div>
    );
}

export default AddExercisesToWorkout;