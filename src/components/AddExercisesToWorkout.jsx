import React, { useEffect, useState, memo, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { usersAPI, programsAPI, exercisesAPI, workoutsAPI } from '../utils/api/apiV2';

function AddExercisesToWorkout() {
  const { workoutExercises, targetExercises, setTargetExercises } = useOutletContext();
  const targetExercisesRef = useRef(null);

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
        const data = await usersAPI.getAll();
        // V2 API returns users with 'firstname'/'lastname' instead of 'firstName'/'lastName'
        const formattedUsers = Array.isArray(data) ? data.map(user => ({
          ...user,
          firstName: user.firstname || user.firstName,
          lastName: user.lastname || user.lastName
        })) : [];
        setUsers(formattedUsers);
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
        const data = await programsAPI.getAll();
        // V2 API returns programs in data.programs format
        const programs = data.programs || [];
        setPrograms(programs);
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
        setLoadingExerciseList(true);
        const exercises = await exercisesAPI.getAll();
        console.log('Fetched exercise list:', exercises);
        // V2 API returns exercises as a direct array, no need to flatten
        setExerciseList(Array.isArray(exercises) ? exercises : []);
        setLoadingExerciseList(false);
      } catch (error) {
        console.error('Error fetching exercise list:', error);
        setErrorExerciseList(error);
        setLoadingExerciseList(false);
      }
    };
  
    fetchExerciseList();
  }, []);

  // Initialize exercise state on component mount
  useEffect(() => {
    fetchExercises(null); // This will clear the state and set proper initial values
  }, []);

  const fetchWorkouts = async (programId) => {
    setLoadingWorkouts(true);
    try {
      const workouts = await workoutsAPI.getByProgram(programId);
      setWorkouts(workouts);
      setLoadingWorkouts(false);
    } catch (error) {
      setErrorWorkouts(error);
      setLoadingWorkouts(false);
    }
  };

  const fetchExercises = async (workoutId) => {
    if (!workoutId) {
      console.log('No workout selected, clearing exercises');
      setTargetExercises([]);
      setSupersets({});
      setErrorExercises(null);
      setLoadingExercises(false);
      return;
    }

    setLoadingExercises(true);
    setErrorExercises(null);

    try {
      const data = await workoutsAPI.getExercises(workoutId);
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log('No exercises found for this workout');
        setTargetExercises([]);
        setSupersets({});
        setLoadingExercises(false);
        return;
      }
  
      const updatedExercises = data.map(exercise => {
        // V2 API structure - exercise data should be properly formatted
        const transformedExercise = {
          ...exercise,
          exercise_id: exercise.exercise_id || exercise.id,
          name: exercise.exercises?.name || exercise.name || 'Unknown Exercise',
          sets: exercise.sets || 0,
          reps: exercise.reps || 0,
          weight: exercise.weight || 0,
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
  
  const handleAddExerciseToWorkout = (exercise) => {
    // Check if exercise is already in the target list
    const isAlreadyAdded = targetExercises.some(
      targetExercise => targetExercise.exercise_id === exercise.id
    );
    
    if (isAlreadyAdded) {
      return; // Don't add duplicates
    }
    
    // Add exercise to target exercises with default values
    const newExercise = {
      exercise_id: exercise.id,
      name: exercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
      superset_with: null,
      exercises: { name: exercise.name } // For compatibility
    };
    
    setTargetExercises(prevExercises => [...prevExercises, newExercise]);
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
    return foundExercise.name || 'Unknown Exercise';
  };

  const renderItem = (item, index) => {
    // Validation check
    if (!item || typeof item.exercise_id === 'undefined') {
      console.error("Invalid exercise item:", item);
      return null;
    }
  
    // Extract item properties
    const exerciseId = item.exercise_id.toString();
    const exerciseName = item.name || 'Unknown Exercise';
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
      await exercisesAPI.upsertToWorkout(payload);
      
      // Small delay to ensure the database has completed its updates
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
          <h2>Workout Exercises</h2>
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
                ) : !selectedWorkoutId ? (
                  <p>Select a workout to see exercises</p>
                ) : targetExercises.length === 0 ? (
                  <p>No exercises in this workout. Add some from the available exercises.</p>
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

      <div className="addExercisesToWorkout-container__middle">
        <h2>Available Exercises</h2>
        {loadingExerciseList ? (
          <p>Loading exercises...</p>
        ) : errorExerciseList ? (
          <p>Error loading exercises: {errorExerciseList.message}</p>
        ) : (
          <div className="exercise-list">
            {exerciseList.map((exercise) => {
              const isAlreadyAdded = targetExercises.some(
                targetExercise => targetExercise.exercise_id === exercise.id
              );
              
              return (
                <div
                  key={exercise.id}
                  className={`exercise-item ${isAlreadyAdded ? 'added' : ''}`}
                  onClick={() => !isAlreadyAdded && handleAddExerciseToWorkout(exercise)}
                  style={{ 
                    cursor: isAlreadyAdded ? 'default' : 'pointer',
                    opacity: isAlreadyAdded ? 0.5 : 1
                  }}
                >
                  <div className="exercise-name">{exercise.name}</div>
                  <div className="exercise-details">
                    <span className="equipment">{exercise.equipment}</span>
                    <span className="category">{exercise.category}</span>
                  </div>
                  {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                    <div className="muscle-groups">
                      {exercise.muscle_groups.map((mg, index) => {
                        const muscleGroup = mg.muscle_groups || mg;
                        return (
                          <span key={muscleGroup.id || index} className="muscle-group">
                            {muscleGroup.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {!isAlreadyAdded && <button className="add-btn">+</button>}
                  {isAlreadyAdded && <span className="added-text">Added</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="addExercisesToWorkout-container__right">
        <div className="add-workout-container__select-container">
          <div className="add-workout-container__select-container__user">
            <h2>Select User</h2>
            {loadingUsers ? (
              <p>Loading users...</p>
            ) : errorUsers ? (
              <p>Error loading users: {errorUsers.message}</p>
            ) : (
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
            )}
          </div>
          <div className="add-workout-container__select-container__program">
            <h2>Select Program</h2>
            {loadingPrograms ? (
              <p>Loading programs...</p>
            ) : errorPrograms ? (
              <p>Error loading programs: {errorPrograms.message}</p>
            ) : (
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
            )}
          </div>
          <div className="add-workout-container__select-container__workout">
            <h2>Select Workout</h2>
            {loadingWorkouts ? (
              <p>Loading workouts...</p>
            ) : errorWorkouts ? (
              <p>Error loading workouts: {errorWorkouts.message}</p>
            ) : (
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
            )}
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