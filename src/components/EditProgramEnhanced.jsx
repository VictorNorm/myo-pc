import React, { useState, useEffect, memo, useRef } from 'react';
import { Search, ChevronRight, Save, X, Plus, Minus, ArrowLeft, Settings, BarChart3 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useOutletContext } from 'react-router-dom';
import DeleteProgramModal from './DeleteProgramModal';
import ExerciseSelector from './ExerciseSelector';
import ExerciseParametersDialog from './ExerciseParametersDialog';
import BaselineManager from './BaselineManager';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import { usersAPI, programsAPI, workoutsAPI, exercisesAPI } from '../utils/api/apiV2';

const VIEWS = {
  PROGRAMS: 'programs',
  WORKOUTS: 'workouts', 
  EXERCISES: 'exercises',
  BASELINES: 'baselines'
};

const PROGRAM_TYPES = {
  MANUAL: 'MANUAL',
  AUTOMATED: 'AUTOMATED'
};

const EditProgramEnhanced = () => {
  const { workoutExercises, targetExercises, setTargetExercises } = useOutletContext();
  const targetExercisesRef = useRef(null);

  // View and navigation states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeView, setActiveView] = useState(VIEWS.PROGRAMS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Users states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  // Program states
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [errorPrograms, setErrorPrograms] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programWorkouts, setProgramWorkouts] = useState([]);
  const [programToDelete, setProgramToDelete] = useState(null);

  // Exercise states
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [errorExercises, setErrorExercises] = useState(null);

  // Workout states
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);

  // Enhanced exercise selection states
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showParametersDialog, setShowParametersDialog] = useState(false);
  const [pendingExercise, setPendingExercise] = useState(null);
  const [bulkSelection, setBulkSelection] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Superset states
  const [supersets, setSupersets] = useState({});
  const [selectingSuperset, setSelectingSuperset] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchPrograms();
  }, []);

  useEffect(() => {
    console.log('Selected Workout ID changed:', selectedWorkoutId);
  }, [selectedWorkoutId]);

  // Fetch functions
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
      console.error('Failed to fetch users:', error);
      setErrorUsers(error);
      setUsers([]); // Ensure users is always an array
      setLoadingUsers(false);
    }
  };

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

  const fetchWorkouts = async (programId) => {
    setIsLoading(true);
    
    try {
      const workouts = await workoutsAPI.getByProgram(programId);
      setProgramWorkouts(workouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExercises = async (workoutId) => {
    setLoadingExercises(true);

    try {
      const exercises = await workoutsAPI.getExercises(workoutId);
      
      if (!Array.isArray(exercises)) {
        console.log('No exercises found for this workout');
        setTargetExercises([]);
        setSupersets({});
        setLoadingExercises(false);
        return;
      }
  
      // V2 API returns exercises in a different format
      const updatedExercises = exercises.map(exercise => {
        const transformedExercise = {
          ...exercise,
          exercise_id: exercise.exerciseId || exercise.id,
          name: exercise.name || 'Unknown Exercise',
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          equipment: exercise.equipment,
          category: exercise.category,
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

  // Navigation handlers
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedProgram(null);
    setSelectedWorkout(null);
    setActiveView(VIEWS.PROGRAMS);
    setBulkSelection(new Set());
    setShowBulkActions(false);
  };

  const handleProgramClick = async (program) => {
    setSelectedProgram(program);
    setActiveView(VIEWS.WORKOUTS);
    setBulkSelection(new Set());
    setShowBulkActions(false);
    
    await fetchWorkouts(program.id);
  };

  const handleWorkoutClick = (workout) => {
    setSelectedWorkout(workout);
    setSelectedWorkoutId(workout.id);
    setActiveView(VIEWS.EXERCISES);
    setBulkSelection(new Set());
    setShowBulkActions(false);
    fetchExercises(workout.id);
  };

  const handleViewBaselines = () => {
    if (selectedProgram && selectedProgram.programType === PROGRAM_TYPES.AUTOMATED) {
      setActiveView(VIEWS.BASELINES);
      setBulkSelection(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBackToPrograms = () => {
    setActiveView(VIEWS.PROGRAMS);
    setSelectedProgram(null);
    setProgramWorkouts([]);
    setBulkSelection(new Set());
    setShowBulkActions(false);
  };

  const handleBackToWorkouts = () => {
    setActiveView(VIEWS.WORKOUTS);
    setSelectedWorkout(null);
    setSelectedWorkoutId(null);
    setTargetExercises([]);
    setBulkSelection(new Set());
    setShowBulkActions(false);
  };

  // Exercise manipulation handlers
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
    
    // Remove from bulk selection if selected
    setBulkSelection(prev => {
      const newSet = new Set(prev);
      newSet.delete(exerciseId);
      return newSet;
    });
  };

  // Enhanced exercise addition
  const openExerciseSelector = () => {
    setShowExerciseSelector(true);
  };

  const handleExerciseSelection = async (exerciseIds) => {
    if (exerciseIds.length === 0) return;
    
    try {
      const token = localStorage.getItem("token");
      const exercises = await exercisesAPI.getAll();
      
      // Handle multiple selections
      for (const exerciseId of exerciseIds) {
        const exercise = exercises.find(e => e.id === exerciseId);
        if (exercise) {
          // Quick add with default parameters
          const newExercise = {
            exerciseId: exercise.id,
            name: exercise.name,
            equipment: exercise.equipment,
            category: exercise.category,
            sets: 3,
            reps: 10,
            weight: 0
          };
          
          setTargetExercises(prev => [...prev, {
            ...newExercise,
            exercise_id: exercise.id,
            workout_id: selectedWorkout.id
          }]);
        }
      }
      
      setShowExerciseSelector(false);
      toast.success(`Added ${exerciseIds.length} exercise${exerciseIds.length !== 1 ? 's' : ''}`);
    } catch (error) {
      setError('Failed to load exercise details: ' + error.message);
    }
  };

  const handleExerciseParameters = (parameters) => {
    if (pendingExercise && selectedWorkout) {
      const exerciseWithParams = {
        exerciseId: pendingExercise.id,
        name: pendingExercise.name,
        equipment: pendingExercise.equipment,
        category: pendingExercise.category,
        sets: parameters.sets,
        reps: parameters.reps,
        weight: parameters.weight
      };

      // Add the exercise to the current workout
      const newExercise = {
        ...exerciseWithParams,
        exercise_id: exerciseWithParams.exerciseId,
        workout_id: selectedWorkout.id
      };

      setTargetExercises(prev => [...prev, newExercise]);
      
      // Close dialogs and clear pending exercise
      setShowParametersDialog(false);
      setPendingExercise(null);
      
      toast.success(`Added ${exerciseWithParams.name} to workout`);
    }
  };

  // Bulk operations
  const handleBulkSelect = (exerciseId) => {
    setBulkSelection(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (bulkSelection.size === targetExercises.length) {
      setBulkSelection(new Set());
    } else {
      setBulkSelection(new Set(targetExercises.map(e => e.exercise_id)));
    }
  };

  const handleBulkIncrement = (field) => {
    const increment = field === 'weight' ? 2.5 : 1;
    const maxValue = field === 'sets' ? 20 : field === 'reps' ? 100 : 1000;
    
    setTargetExercises(prevExercises => prevExercises.map(exercise => 
      bulkSelection.has(exercise.exercise_id)
        ? { ...exercise, [field]: Math.min(maxValue, exercise[field] + increment) }
        : exercise
    ));
  };

  const handleBulkDecrement = (field) => {
    const decrement = field === 'weight' ? 2.5 : 1;
    const minValue = field === 'weight' ? 0 : 1;
    
    setTargetExercises(prevExercises => prevExercises.map(exercise => 
      bulkSelection.has(exercise.exercise_id)
        ? { ...exercise, [field]: Math.max(minValue, exercise[field] - decrement) }
        : exercise
    ));
  };

  const handleBulkDelete = () => {
    const confirmed = window.confirm(
      `Delete ${bulkSelection.size} selected exercise${bulkSelection.size !== 1 ? 's' : ''}?`
    );
    
    if (confirmed) {
      setTargetExercises(prevExercises => 
        prevExercises.filter(exercise => !bulkSelection.has(exercise.exercise_id))
      );
      setBulkSelection(new Set());
    }
  };

  // Superset handlers (same as original)
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

  const handleDeleteProgram = async (programId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/programs/${programId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete program');
      }
  
      setPrograms(prev => prev.filter(p => p.id !== programId));
      setProgramToDelete(null);
      
      toast.success('Program deleted successfully');
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error('Failed to delete program. Please try again.');
    }
  };

  // Utility functions
  const findExercise = (id) => {
    if (!id) return null;
    const stringId = id.toString();
    const foundExercise = targetExercises.find((exercise) => 
      exercise.exercise_id.toString() === stringId
    );
    if (!foundExercise) {
      return null;
    }
    return foundExercise.name || foundExercise.exercises?.name || 'Unknown Exercise';
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

  const saveWorkout = async (event) => {
    event.preventDefault();

    if (!selectedWorkoutId) {
      console.error('No workout ID selected');
      return;
    }
    
    const collectedExerciseData = targetExercises.map(exercise => ({
      id: Number(exercise.exercise_id),
      sets: Number(exercise.sets) || 0,
      reps: Number(exercise.reps) || 0,
      weight: Number(exercise.weight) || 0
    }));
  
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
      await exercisesAPI.upsertToWorkout(payload);

      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchExercises(selectedWorkoutId);
      
      toast.success('Workout saved successfully');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  // Enhanced ExerciseItem component with bulk selection
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
    const isSelected = bulkSelection.has(exercise.exercise_id);
  
    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`exercise-item ${isInSuperset ? 'supersetted' : ''} ${isSelected ? 'bulk-selected' : ''}`}
      >
        <div className="exercise-item__header">
          <div className="exercise-item__header__left">
            {showBulkActions && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleBulkSelect(exercise.exercise_id)}
                className="bulk-select-checkbox"
              />
            )}
            <div className="exercise-item__header__content">
              <h4>{exercise.exercises?.name || exercise.name}</h4>
              {isInSuperset && (
                <p className="superset-info">
                  Supersetted with: {findExercise(exercise.superset_with)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => handleRemoveExercise(exercise.exercise_id)}
            type="button"
            className="remove-button"
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

  // Enhanced content rendering
  const renderContent = () => {
    if (!selectedUser) {
      return (
        <div className="program-editor__content__empty">
          <h2>Select a User</h2>
          <p>Choose a user from the list to view and edit their programs</p>
        </div>
      );
    }

    if (activeView === VIEWS.BASELINES) {
      return (
        <div className="baselines-view">
          <div className="baselines-view__header">
            <h2>Baseline Management - {selectedProgram?.name}</h2>
            <button 
              type="button"
              onClick={handleBackToWorkouts}
              className="back-button"
            >
              <ArrowLeft size={18} />
              Back to Workouts
            </button>
          </div>
          
          <BaselineManager 
            programId={selectedProgram?.id}
            userId={selectedUser?.id}
          />
        </div>
      );
    }

    if (activeView === VIEWS.EXERCISES) {
      return (
        <div className="exercises-view">
          <div className="exercises-view__header">
            <div className="exercises-view__header__left">
              <h2>{selectedWorkout?.name}</h2>
              <button 
                type="button"
                onClick={handleBackToWorkouts}
                className="back-button"
              >
                <ArrowLeft size={18} />
                Back to Workouts
              </button>
            </div>
            
            <div className="exercises-view__header__actions">
              <button
                onClick={openExerciseSelector}
                className="add-exercises-button"
                type="button"
              >
                <Plus size={16} />
                Add Exercises
              </button>
              
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className={`bulk-toggle-button ${showBulkActions ? 'active' : ''}`}
                type="button"
              >
                <Settings size={16} />
                Bulk Edit
              </button>
            </div>
          </div>
          
          {showBulkActions && bulkSelection.size > 0 && (
            <div className="bulk-actions-toolbar">
              <div className="bulk-actions-info">
                {bulkSelection.size} selected
              </div>
              
              <div className="bulk-actions-controls">
                <button onClick={handleSelectAll} type="button">
                  {bulkSelection.size === targetExercises.length ? 'Deselect All' : 'Select All'}
                </button>
                
                <div className="bulk-param-controls">
                  {['sets', 'reps', 'weight'].map(field => (
                    <div key={field} className="bulk-param-group">
                      <label>{field}</label>
                      <button 
                        onClick={() => handleBulkDecrement(field)}
                        type="button"
                        className="bulk-decrement"
                      >
                        <Minus size={14} />
                      </button>
                      <button 
                        onClick={() => handleBulkIncrement(field)}
                        type="button"
                        className="bulk-increment"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={handleBulkDelete}
                  className="bulk-delete-button"
                  type="button"
                >
                  <X size={16} />
                  Delete Selected
                </button>
              </div>
            </div>
          )}
          
          {loadingExercises ? (
            <div className="loading-container">
              <LoadingSpinner size="medium" />
              <p>Loading exercises...</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="exercises">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="exercises-list"
                  >
                    {targetExercises.map((exercise, index) => 
                      renderExerciseItem(exercise, index)
                    )}
                    {provided.placeholder}
                    {targetExercises.length === 0 && (
                      <div className="empty-state">
                        <p>No exercises found in this workout</p>
                        <button onClick={openExerciseSelector} type="button">
                          Add your first exercise
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      );
    }

    if (activeView === VIEWS.WORKOUTS) {
      return (
        <div className="workouts-view">
          <div className="workouts-view__header">
            <div className="workouts-view__header__left">
              <h2>{selectedProgram?.name}</h2>
              <div className="program-type-indicator">
                <span className={`program-type ${selectedProgram?.programType?.toLowerCase()}`}>
                  {selectedProgram?.programType || 'MANUAL'}
                </span>
                {selectedProgram?.programType === PROGRAM_TYPES.AUTOMATED && (
                  <small>Uses baseline progression tracking</small>
                )}
              </div>
            </div>
            
            <div className="workouts-view__header__actions">
              {selectedProgram?.programType === PROGRAM_TYPES.AUTOMATED && (
                <button 
                  type="button"
                  onClick={handleViewBaselines}
                  className="baselines-button"
                >
                  <BarChart3 size={16} />
                  Manage Baselines
                </button>
              )}
              
              <button 
                type="button"
                onClick={handleBackToPrograms}
                className="back-button"
              >
                <ArrowLeft size={18} />
                Back to Programs
              </button>
            </div>
          </div>
          
          <div className="workouts-grid">
            {programWorkouts.map(workout => (
              <button
                type="button"
                key={workout.id}
                onClick={() => handleWorkoutClick(workout)}
                className="workout-card"
              >
                <h3>{workout.name}</h3>
                <p>Click to edit exercises</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="programs-view">
        <h2>Programs for {selectedUser?.firstName} {selectedUser?.lastName}</h2>
        <div className="programs-grid">
          {programs.filter(p => p.userId === selectedUser?.id).map(program => (
            <div key={program.id} className="program-card">
              <div className="program-card__header">
                <h3>{program.name}</h3>
                <div className="program-card__actions">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProgramToDelete(program);
                    }}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="program-card__content">
                <div className="program-details">
                  <span className={`program-type ${program.programType?.toLowerCase()}`}>
                    {program.programType || 'MANUAL'}
                  </span>
                  <span className="program-goal">{program.goal}</span>
                </div>
                
                <button 
                  type="button"
                  className="view-button"
                  onClick={() => handleProgramClick(program)}
                >
                  View Workouts
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="program-editor-enhanced">
      {/* Sidebar */}
      <div className="program-editor-enhanced__sidebar">
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="search-icon" size={20} />
        </div>
        
        <div className="sidebar-list">
          {loadingUsers ? (
            <div className="sidebar-loading">
              <LoadingSpinner size="small" />
            </div>
          ) : (
            (users || []).filter(user => 
              `${user.firstName} ${user.lastName} ${user.username}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            ).map(user => (
              <button
                type="button"
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
              >
                <h3>{user.firstName} {user.lastName}</h3>
                <p>{user.username}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="program-editor-enhanced__content">
        {loadingPrograms ? (
          <div className="content-loading">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            <div className="content-header">
              <div className="breadcrumb">
                <span>{selectedUser?.firstName} {selectedUser?.lastName}</span>
                {selectedProgram && (
                  <>
                    <ChevronRight size={16} className="chevron" />
                    <span>{selectedProgram.name}</span>
                  </>
                )}
                {selectedWorkout && (
                  <>
                    <ChevronRight size={16} className="chevron" />
                    <span>{selectedWorkout.name}</span>
                  </>
                )}
              </div>
              
              {activeView === VIEWS.EXERCISES && (
                <div className="content-actions">
                  <button onClick={saveWorkout} type="button" className="save-button">
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {renderContent()}
          </>
        )}
      </div>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ExerciseSelector
              isOpen={showExerciseSelector}
              onSelectionChange={handleExerciseSelection}
              onClose={() => setShowExerciseSelector(false)}
              multiple={true}
            />
          </div>
        </div>
      )}

      {/* Exercise Parameters Dialog */}
      <ExerciseParametersDialog
        isOpen={showParametersDialog}
        exercise={pendingExercise}
        onSave={handleExerciseParameters}
        onCancel={() => {
          setShowParametersDialog(false);
          setPendingExercise(null);
        }}
      />

      {/* Delete Program Modal */}
      {programToDelete && (
        <DeleteProgramModal
          isOpen={Boolean(programToDelete)}
          onClose={() => setProgramToDelete(null)}
          onConfirm={() => handleDeleteProgram(programToDelete.id)}
          programName={programToDelete.name}
        />
      )}

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            style: {
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgb(16, 185, 129)',
              color: 'rgb(16, 185, 129)',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgb(239, 68, 68)',
              color: 'rgb(239, 68, 68)',
            },
          },
        }}
      />
    </div>
  );
};

export default EditProgramEnhanced;