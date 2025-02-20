/* eslint-disable no-unused-vars */
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
        // console.log(data)
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
      // Add timestamp to URL to prevent caching
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/workouts/${workoutId}/exercises`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.log('No exercises found for this workout');
        setTargetExercises([]);
        setSupersets({});
        setLoadingExercises(false);
        return;
      }
  
      const updatedExercises = data.map(exercise => {
        
        const transformedExercise = {
          ...exercise,
          exercise_id: exercise.exercise_id || exercise.id,
          name: exercise.exercises?.name || exercise.name || 'Unknown Exercise',
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          superset_with: exercise.superset_with
        };
        
        return transformedExercise;
      });
  
      // Create supersets mapping
      const newSupersets = {};
      updatedExercises.forEach(exercise => {
        if (exercise.superset_with) {
          newSupersets[exercise.exercise_id] = exercise.superset_with;
        }
      });
  
      setSupersets(newSupersets);
      setTargetExercises(updatedExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setErrorExercises(error);
    } finally {
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
      
      // Instead of reading from DOM, use the state directly
      const collectedExerciseData = targetExercises.map(exercise => ({
        id: Number(exercise.exercise_id),
        sets: Number(exercise.sets) || 0,
        reps: Number(exercise.reps) || 0,
        weight: Number(exercise.weight) || 0
      }));
    
      // Collect supersets from the state
      const collectedSupersets = [];
      targetExercises.forEach(exercise => {
        if (exercise.superset_with) {
          const existingSuperset = collectedSupersets.find(
            s => (s.first_exercise_id === Number(exercise.exercise_id) && s.second_exercise_id === Number(exercise.superset_with)) ||
                 (s.first_exercise_id === Number(exercise.superset_with) && s.second_exercise_id === Number(exercise.exercise_id))
          );
          
          if (!existingSuperset) {
            collectedSupersets.push({
              first_exercise_id: Number(exercise.exercise_id),
              second_exercise_id: Number(exercise.superset_with)
            });
          }
        }
      });
    
      const payload = {
        workoutId: Number(selectedWorkoutId),
        exercises: collectedExerciseData,
        supersets: collectedSupersets
      };
    
  
    
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/exercises/upsertExercisesToWorkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
    
        const rawResponse = await response.text();
        
        if (!response.ok) {
          throw new Error(`Failed to add exercises to workout: ${rawResponse}`);
        }

        
        // Single fetch with a small delay to ensure the database has completed its updates
        await new Promise(resolve => setTimeout(resolve, 100));
        await fetchExercises(selectedWorkoutId);
        
      } catch (error) {
        console.error('Error saving workout:', error);
      }
    };

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