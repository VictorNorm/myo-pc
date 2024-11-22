/* eslint-disable no-unused-vars */
import React, { useState, useEffect, memo, useRef } from 'react';
import { Search, ChevronRight, Save, X, Plus, Minus, ArrowLeft } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useOutletContext } from 'react-router-dom';

const EditProgram = () => {
  const { workoutExercises, targetExercises, setTargetExercises } = useOutletContext();
  const targetExercisesRef = useRef(null);

  // View states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeView, setActiveView] = useState('programs');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('programs');

  // Users states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Program states
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [errorPrograms, setErrorPrograms] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programWorkouts, setProgramWorkouts] = useState([]);
  const [selectedProgramName, setSelectedProgramName] = useState('');

  // Exercise states
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [errorExercises, setErrorExercises] = useState(null);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);

  // ExerciseList states
  const [exerciseList, setExerciseList] = useState([]);
  const [loadingExerciseList, setLoadingExerciseList] = useState(false);
  const [errorExerciseList, setErrorExerciseList] = useState(null);

  // Workout states
  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);
  const [errorWorkouts, setErrorWorkouts] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);

  // Superset states
  const [supersets, setSupersets] = useState({});
  const [selectingSuperset, setSelectingSuperset] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchExerciseList();
    fetchPrograms();
    fetchExerciseList();
  }, []);

  useEffect(() => {
    console.log('Selected Workout ID changed:', selectedWorkoutId);
  }, [selectedWorkoutId]);

  // Fetch functions --------------------------------------------------------------------------------------------------------------------

  const fetchUserPrograms = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/programs/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch programs');
      const data = await response.json();
      setPrograms(data.userPrograms);
    } catch (error) {
      setError(error.message);
    }
  };


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

  // Handlers -------------------------------------------------------------------------------------------------------------------------------------

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedProgram(null);
    setSelectedWorkout(null);
    setActiveView('programs');
    fetchUserPrograms(user.id);
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

  const handleRemoveExercise = (exerciseId) => {
    setTargetExercises(prevExercises => 
      prevExercises.filter(exercise => exercise.exercise_id !== exerciseId)
    );
  };

  const handleProgramClick = async (program) => {
    setSelectedProgramId(program.id);
    setSelectedProgramName(program.name);
    setIsLoading(true);
    setViewMode('workouts');
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/programs/${program.id}/workouts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      
      const workouts = await response.json();
      setProgramWorkouts(workouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPrograms = () => {
    setViewMode('programs');
    setSelectedProgramId(null);
    setProgramWorkouts([]);
  };

  const handleBackClick = () => {
    setSelectedProgramId(null);
    setProgramWorkouts([]);
  };

  const handleWorkoutClick = (workout) => {
    setSelectedWorkout(workout);
    setSelectedWorkoutId(workout.id);
    setActiveView('exercises');
    fetchExercises(workout.id);
  };

  const handleAddToSuperset = (exerciseId) => {
    setSelectingSuperset(exerciseId);
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

  const handleAddExercise = async (exercise) => {
    const newExercise = {
      ...exercise,
      sets: 3, // Default values
      reps: 10,
      weight: 0,
      exercise_id: exercise.id,
      workout_id: selectedWorkout.id
    };
  
    try {
      setExercises(prev => [...prev, newExercise]); // Optimistic update
      
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/workouts/${selectedWorkout.id}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newExercise)
      });
  
      if (!response.ok) {
        throw new Error('Failed to add exercise');
      }
  
      // Refresh exercises to ensure we have the latest data
      await fetchExercises(selectedWorkout.id);
    } catch (error) {
      console.error('Error adding exercise:', error);
      // Rollback the optimistic update
      setExercises(prev => prev.filter(e => e.exercise_id !== newExercise.exercise_id));
    }
  };

  // findExercise -----------------------------------------------------------------------------------------------------------------------------

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

  // onDragEnd --------------------------------------------------------------------------------------------------------------------------------

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(targetExercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTargetExercises(items);
  };

   // saveWorkout -----------------------------------------------------------------------------------------------------------------------------

  const saveWorkout = async (event) => {
    event.preventDefault();

    if (!selectedWorkoutId) {
      console.error('No workout ID selected');
      return;
    }
    
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

    console.log('Saving workout with payload:', payload);
    console.log('Selected Workout ID:', selectedWorkoutId); // Debug log

    if (!payload.workoutId) {
      console.error('Invalid workout ID');
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/upsertExercisesToWorkout`, {
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

  // ExerciseItem -----------------------------------------------------------------------------------------------------------------------------

  const ExerciseItem = ({ 
    exercise, 
    index,
    totalExercises,
    findExercise,
    handleRemoveExercise, 
    handleIncrement, 
    handleDecrement,
    handleRemoveFromSuperset,
    handleAddToSuperset,
    handleCompleteSuperset,
    selectingSuperset,
    provided 
  }) => {
    const exerciseId = exercise.exercise_id.toString();
    const isInSuperset = Boolean(exercise.superset_with);
    const isSelectingThis = selectingSuperset === exerciseId;
    const isSelectingOther = selectingSuperset && selectingSuperset !== exerciseId;
  
    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`exercise-item ${isInSuperset ? 'supersetted' : ''}`}
      >
        <div className="exercise-item__header">
          <div className="exercise-item__header__content">
            <h4>{exercise.exercises?.name || exercise.name}</h4>
            {isInSuperset && (
              <p className="superset-info">
                Supersetted with: {findExercise(exercise.superset_with)}
              </p>
            )}
          </div>
          <button
            onClick={() => handleRemoveExercise(exercise.exercise_id)}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
  
        <div className="exercise-item__controls">
          {['sets', 'reps', 'weight'].map((field) => (
            <div key={field} className="control-group">
              <label>{field}</label>
              <div className="control-input">
                <button 
                  type="button"
                  onClick={() => handleDecrement(exercise.exercise_id, field)}
                >
                  <Minus size={16} />
                </button>
                <span>{exercise[field] || 0}{field === 'weight' ? 'kg' : ''}</span>
                <button
                  type="button"
                  onClick={() => handleIncrement(exercise.exercise_id, field)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
  
        <div className="exercise-item__superset">
          <button
            onClick={() => {
              if (isSelectingThis) {
                setSelectingSuperset(null);
              } else if (isInSuperset) {
                handleRemoveFromSuperset(exerciseId);
              } else if (isSelectingOther) {
                handleCompleteSuperset(exerciseId);
              } else {
                handleAddToSuperset(exerciseId);
              }
            }}
            className={isSelectingThis || isInSuperset ? 'active' : ''}
            type="button"
          >
            {isSelectingThis 
              ? 'Cancel Selection'
              : isSelectingOther
                ? 'Pair with Selected'
                : isInSuperset
                  ? 'Remove Superset'
                  : 'Add Superset'
            }
          </button>
        </div>
      </div>
    );
  };

  // renderExerciseItem -----------------------------------------------------------------------------------------------------------------------

  const renderExerciseItem = (exercise, index) => (
    <Draggable 
      key={exercise.exercise_id} 
      draggableId={exercise.exercise_id.toString()} 
      index={index}
    >
      {(provided) => (
        <ExerciseItem
          exercise={exercise}
          index={index}
          totalExercises={targetExercises.length}
          findExercise={findExercise}
          handleRemoveExercise={handleRemoveExercise}
          handleIncrement={handleIncrement}
          handleDecrement={handleDecrement}
          handleRemoveFromSuperset={handleRemoveFromSuperset}
          handleAddToSuperset={handleAddToSuperset}
          handleCompleteSuperset={handleCompleteSuperset}
          selectingSuperset={selectingSuperset}
          provided={provided}
        />
      )}
    </Draggable>
  );

  // renderContent -----------------------------------------------------------------------------------------------------------------------

  const renderContent = () => {
    if (!selectedUser) {
      return (
        <div className="program-editor__content__empty">
          <h2>Select a User</h2>
          <p>Choose a user from the list to view and edit their program</p>
        </div>
      );
    }

    if (activeView === 'exercises') {
      return (
        <div className="program-view">
          <h2 className="program-view__title">{selectedWorkout?.name}</h2>
          <button 
            type="button"
            onClick={() => {
              setSelectedWorkout(null);
              setActiveView('programs');
              setExercises([]);
            }}
            className="program-editor__content__back-button"
          >
            <ArrowLeft size={18} />
            Back to Workouts
          </button>
          
          
          {loadingExercises ? (
            <div>Loading exercises...</div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="exercises">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="program-view__exercises"
                  >
                    {targetExercises.map((exercise, index) => 
                      renderExerciseItem(exercise, index)
                    )}
                    {provided.placeholder}
                    {targetExercises.length === 0 && (
                      <div className="text-secondary">No exercises found in this workout</div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      );
    }

    return (
      <div className="program-editor__content__programs">
        {viewMode === 'programs' ? (
          // Programs view
          programs.map(program => (
            <div 
              key={program.id} 
              className="program-card"
            >
              <h3>{program.name}</h3>
              <button 
                type="button"
                className="view-workouts-button"
                onClick={() => handleProgramClick(program)}
              >
                View Workouts
              </button>
            </div>
          ))
        ) : (
          // Workouts view
          <>
            <div className="workouts-header">
              <h2>{selectedProgramName}</h2>
              <button 
                type="button"
                onClick={handleBackToPrograms}
                className="back-to-programs-button"
              >
                <ArrowLeft size={18} />
                Back to Programs
              </button>
            </div>
            <div className="workouts-grid">
              {programWorkouts.map(workout => (
                <button
                  type="button"
                  key={workout.id}
                  onClick={() => handleWorkoutClick(workout)}
                  className="program-view__workout"
                >
                  {workout.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="program-editor">
      {/* Sidebar */}
      <div className="program-editor__sidebar">
        <div className="program-editor__sidebar__search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="search-icon" size={20} />
        </div>
        
        <div className="program-editor__sidebar__list">
          {users.filter(user => 
            `${user.firstName} ${user.lastName} ${user.username}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          ).map(user => (
            <button
              type="button"
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`${selectedUser?.id === user.id ? 'selected' : ''}`}
            >
              <h3>{user.firstName} {user.lastName}</h3>
              <p>{user.username}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="program-editor__content">
        <div className="program-editor__content__header">
          <div className="program-editor__content__header__breadcrumb">
            <span>{selectedUser?.firstName} {selectedUser?.lastName}</span>
            {activeView === 'exercises' && selectedWorkout && (
              <>
                <ChevronRight size={16} className="chevron" />
                <span>{selectedWorkout.name}</span>
              </>
            )}
          </div>
          
          {activeView === 'exercises' && (
            <div className="program-editor__content__header__actions">
              <button onClick={saveWorkout} type="button">
                <Save size={16} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};


export default EditProgram;

