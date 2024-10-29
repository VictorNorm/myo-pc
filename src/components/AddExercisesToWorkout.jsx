import React, { useEffect, useState, memo, useRef, useCallback } from 'react';
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

  const [supersets, setSupersets] = useState({});
  const [selectingSuperset, setSelectingSuperset] = useState(null);

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
      const updatedExercises = data.map(exercise => ({
        ...exercise,
        exercise_id: exercise.id || exercise.exercise_id || Date.now().toString(),
        name: exercise.name || (exercise.exercises?.name) || 'Unknown Exercise',
        sets: exercise.sets || 0,
        reps: exercise.reps || 0,
        weight: exercise.weight || 0,
        superset_with: exercise.superset_with
      }));
      const newSupersets = {};
      updatedExercises.forEach(exercise => {
        if (exercise.superset_with) {
          newSupersets[exercise.exercise_id] = exercise.superset_with;
        }
      });
      setSupersets(newSupersets);
      setTargetExercises(updatedExercises);
      setLoadingExercises(false);
      console.log(data);
      console.log(updatedExercises);
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

  // const handleSuperset = useCallback((exerciseId) => {
  //   setTargetExercises(prevExercises => {
  //     const updatedExercises = [...prevExercises];
  //     const exerciseIndex = updatedExercises.findIndex(e => e.exercise_id.toString() === exerciseId);
      
  //     if (exerciseIndex === -1) {
  //       console.error(`Exercise with id ${exerciseId} not found`);
  //       return prevExercises; // Return the previous state unchanged
  //     }
  
  //     const exercise = updatedExercises[exerciseIndex];
  
  //     if (exercise.superset_with) {
  //       // Remove the superset
  //       const pairedExerciseIndex = updatedExercises.findIndex(e => e.exercise_id.toString() === exercise.superset_with);
  //       if (pairedExerciseIndex !== -1) {
  //         updatedExercises[pairedExerciseIndex] = { ...updatedExercises[pairedExerciseIndex], superset_with: null };
  //       }
  //       updatedExercises[exerciseIndex] = { ...exercise, superset_with: null };
  //     } else if (selectingSuperset === exerciseId) {
  //       // Cancel selection
  //       // Do nothing here, we'll update selectingSuperset outside of this function
  //     } else if (selectingSuperset) {
  //       // Create new superset
  //       const selectingIndex = updatedExercises.findIndex(e => e.exercise_id.toString() === selectingSuperset);
  //       if (selectingIndex !== -1) {
  //         updatedExercises[selectingIndex] = { ...updatedExercises[selectingIndex], superset_with: exerciseId };
  //         updatedExercises[exerciseIndex] = { ...exercise, superset_with: selectingSuperset };
  //       } else {
  //         console.error(`Exercise with id ${selectingSuperset} not found`);
  //       }
  //     }
  
  //     return updatedExercises;
  //   });
  
  //   setSupersets(prevSupersets => {
  //     const newSupersets = { ...prevSupersets };
  //     if (newSupersets[exerciseId]) {
  //       delete newSupersets[exerciseId];
  //     } else if (selectingSuperset) {
  //       newSupersets[selectingSuperset] = exerciseId;
  //       newSupersets[exerciseId] = selectingSuperset;
  //     }
  //     return newSupersets;
  //   });
  
  //   setSelectingSuperset(prev => {
  //     if (prev === exerciseId) {
  //       return null; // Cancel selection
  //     } else if (!prev) {
  //       return exerciseId; // Start selecting
  //     } else {
  //       return null; // Finish selecting (create superset)
  //     }
  //   });
  // }, [selectingSuperset, setTargetExercises, setSupersets, setSelectingSuperset]);

  const handleAddToSuperset = (exerciseId) => {
    setSelectingSuperset(exerciseId);
  };
  
  const handleRemoveFromSuperset = (exerciseId) => {
    setTargetExercises(prevExercises => {
      const updatedExercises = [...prevExercises];
      const exercise = updatedExercises.find(e => e.exercise_id.toString() === exerciseId);
      
      if (!exercise) return prevExercises;
      
      const partnerId = exercise.superset_with;
      const partner = updatedExercises.find(e => e.exercise_id.toString() === partnerId);
      
      if (partner) {
        partner.superset_with = null;
      }
      exercise.superset_with = null;
      
      return updatedExercises;
    });
  
    setSupersets(prev => {
      const next = { ...prev };
      const partnerId = next[exerciseId];
      delete next[exerciseId];
      delete next[partnerId];
      return next;
    });
  };
  
  const handleCompleteSuperset = (exerciseId) => {
    if (!selectingSuperset || selectingSuperset === exerciseId) {
      setSelectingSuperset(null);
      return;
    }
  
    setTargetExercises(prevExercises => {
      const updatedExercises = [...prevExercises];
      const firstExercise = updatedExercises.find(e => e.exercise_id.toString() === selectingSuperset);
      const secondExercise = updatedExercises.find(e => e.exercise_id.toString() === exerciseId);
      
      if (firstExercise && secondExercise) {
        firstExercise.superset_with = exerciseId;
        secondExercise.superset_with = selectingSuperset;
      }
      
      return updatedExercises;
    });
  
    setSupersets(prev => ({
      ...prev,
      [exerciseId]: selectingSuperset,
      [selectingSuperset]: exerciseId
    }));
  
    setSelectingSuperset(null);
  };


  const findExercise = (id) => {
    if (!id) return null;
    // Convert the incoming id to string for comparison
    const stringId = id.toString();
    const foundExercise = targetExercises.find((exercise) => 
      exercise.exercise_id.toString() === stringId
    );
    if (!foundExercise) {
      return null;
    }
    return foundExercise.name || foundExercise.exercises?.name || 'Unknown Exercise';
  };

  const renderItem = (item, index) => {
    // Validation check
    if (!item || typeof item.exercise_id === 'undefined') {
      console.error("Invalid exercise item:", item);
      return null;
    }
  
    // Extract item properties
    const exerciseId = item.exercise_id.toString();
    const exerciseName = item.exercises ? item.exercises.name : item.name || 'Unknown Exercise';
    const isInSuperset = Boolean(item.superset_with);
    const isSelectingThis = selectingSuperset === exerciseId;
    const isSelectingOther = selectingSuperset && selectingSuperset !== exerciseId;
  
    // Render the exercise input controls
    const renderInputControl = (field, label) => (
      <div className="inputContainer">
        <span className="itemText">{label}:</span>
        <input
          className="input"
          value={item[field] || 0}
          type="number"
          readOnly
        />
        <div className="buttonContainer">
          <button 
            className="button" 
            type="button" 
            onClick={() => handleDecrement(item.exercise_id, field)}
          >
            -
          </button>
          <button 
            className="button" 
            type="button" 
            onClick={() => handleIncrement(item.exercise_id, field)}
          >
            +
          </button>
        </div>
      </div>
    );
  
    // Render the appropriate superset button
    const renderSupersetButton = () => {
      if (isInSuperset) {
        return (
          <button
            onClick={() => handleRemoveFromSuperset(exerciseId)}
            className="supersetButton active"
            type="button"
          >
            Remove from Superset
          </button>
        );
      }
  
      if (selectingSuperset) {
        return (
          <button
            onClick={() => handleCompleteSuperset(exerciseId)}
            className={`supersetButton ${isSelectingThis ? 'selecting' : 'pairing'}`}
            type="button"
          >
            {isSelectingThis ? 'Cancel Selection' : 'Pair with Selected'}
          </button>
        );
      }
  
      return (
        <button
          onClick={() => handleAddToSuperset(exerciseId)}
          className="supersetButton"
          type="button"
        >
          Add to Superset
        </button>
      );
    };
  
    return (
      <Draggable key={exerciseId} draggableId={exerciseId} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`itemContainer ${isInSuperset ? 'superset' : ''} ${isSelectingThis ? 'selecting' : ''}`}
          >
            {/* Remove exercise button */}
            <button
              onClick={() => handleRemoveExercise(item.exercise_id)}
              className="itemContainer__button"
              type="button"
            >
              X
            </button>
  
            {/* Exercise name */}
            <h3 className="exerciseHeading">{exerciseName}</h3>
  
            {/* Show superset partner if in a superset */}
            {isInSuperset && item.superset_with && (
              <p>Supersetted with: {findExercise(item.superset_with)}</p>
            )}
  
            {/* Exercise controls */}
            {renderInputControl('sets', 'Sets')}
            {renderInputControl('reps', 'Reps')}
            {renderInputControl('weight', 'Weight (kg)')}
  
            {/* Superset controls */}
            {renderSupersetButton()}
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
      const collectedSupersets = [];

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

      if (supersets[draggableId]) {
        collectedSupersets.push({
          first_exercise_id: Number.parseInt(draggableId),
          second_exercise_id: Number.parseInt(supersets[draggableId])
        });
      }
      
    }
    
      console.log("collected exerciseData:",collectedExerciseData);
      console.log("collected supersets:", collectedSupersets);
      console.log(selectedWorkoutId);

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
            exercises: collectedExerciseData,
            supersets: collectedSupersets
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