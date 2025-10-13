import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Save, ArrowLeft, ArrowRight, CheckCircle, Loader } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ExerciseSelector from './ExerciseSelector';
import ExerciseParametersDialog from './ExerciseParametersDialog';
import { usersAPI, exercisesAPI, programsAPI } from '../utils/api/apiV2';
import baselineApi from '../utils/api/baselineApi';

const PROGRAM_TYPES = {
  MANUAL: 'MANUAL',
  AUTOMATED: 'AUTOMATED'
};

const GOALS = {
  HYPERTROPHY: 'HYPERTROPHY',
  STRENGTH: 'STRENGTH'
};

const STEPS = {
  PROGRAM_DETAILS: 1,
  WORKOUTS: 2,
  EXERCISES: 3,
  BASELINES: 4
};

const isEndDateValid = (start, end) => {
  if (!end) return true;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return endDate >= startDate;
};

function CreateProgramWithWorkoutsEnhanced() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Multi-step state
  const [currentStep, setCurrentStep] = useState(STEPS.PROGRAM_DETAILS);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  
  // Form state
  const [selectedUser, setSelectedUser] = useState('');
  const [programName, setProgramName] = useState('');
  const [goal, setGoal] = useState('HYPERTROPHY');
  const [programType, setProgramType] = useState(PROGRAM_TYPES.MANUAL);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [setActive, setSetActive] = useState(false);
  
  // Workouts and exercises state
  const [workouts, setWorkouts] = useState([
    { id: 1, name: '', exercises: [] }
  ]);
  const [nextWorkoutId, setNextWorkoutId] = useState(2);
  
  // Exercise selection state
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showParametersDialog, setShowParametersDialog] = useState(false);
  const [pendingExercise, setPendingExercise] = useState(null);
  
  // Baseline state
  const [baselines, setBaselines] = useState([]);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
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
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(error.message);
      setUsers([]); // Ensure users is always an array
      setLoading(false);
    }
  };
  
  // Step validation functions
  const validateStep1 = () => {
    return !!(programName && selectedUser && startDate && (!endDate || isEndDateValid(startDate, endDate)));
  };
  
  const validateStep2 = () => {
    return workouts.length > 0 && workouts.every(w => w.name.trim());
  };
  
  const validateStep3 = () => {
    return workouts.every(w => w.exercises.length > 0);
  };
  
  const validateStep4 = () => {
    if (programType !== PROGRAM_TYPES.AUTOMATED) return true;
    const allExerciseIds = workouts.flatMap(w => w.exercises.map(e => e.exerciseId));
    return allExerciseIds.every(id => baselines.some(b => b.exerciseId === id));
  };
  
  // Navigation functions
  const canProceedToStep = (step) => {
    switch (step) {
      case STEPS.WORKOUTS:
      return validateStep1();
      case STEPS.EXERCISES:
      return validateStep1() && validateStep2();
      case STEPS.BASELINES:
      return validateStep1() && validateStep2() && validateStep3();
      default:
      return true;
    }
  };
  
  const goToStep = (step) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
      setError(null);
    }
  };
  
  const nextStep = () => {
    const next = currentStep + 1;
    const maxStep = programType === PROGRAM_TYPES.AUTOMATED ? STEPS.BASELINES : STEPS.EXERCISES;
    
    if (next <= maxStep && canProceedToStep(next)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(next);
      setError(null);
    }
  };
  
  const prevStep = () => {
    if (currentStep > STEPS.PROGRAM_DETAILS) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };
  
  // Form handlers
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (!startDate) {
      setError('Please select a start date first');
      return;
    }
    
    if (!isEndDateValid(startDate, newEndDate)) {
      setError('End date cannot be before start date');
      return;
    }
    
    setError(null);
    setEndDate(newEndDate);
  };
  
  const addWorkout = () => {
    setWorkouts(prev => [
      ...prev,
      { id: nextWorkoutId, name: '', exercises: [] }
    ]);
    setNextWorkoutId(prev => prev + 1);
  };
  
  const removeWorkout = (id) => {
    if (workouts.length === 1) return;
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };
  
  const handleWorkoutNameChange = (id, name) => {
    setWorkouts(prev => prev.map(w => 
      w.id === id ? { ...w, name } : w
    ));
  };
  
  // Exercise selection handlers
  const openExerciseSelector = (workoutIndex) => {
    setCurrentWorkoutIndex(workoutIndex);
    setShowExerciseSelector(true);
  };
  
  const handleExerciseSelection = useCallback(async (exerciseIds) => {
    if (exerciseIds.length === 0) return;
    
    try {
      const exercises = await exercisesAPI.getAll();
      
      for (const exerciseId of exerciseIds) {
        const exercise = exercises.find(e => e.id === exerciseId);
        if (exercise) {
          setPendingExercise(exercise);
          setShowParametersDialog(true);
          setShowExerciseSelector(false);
          break;
        }
      }
    } catch (error) {
      setError(`Failed to load exercise details: ${error.message}`);
    }
  }, []);
  
  const handleExerciseParameters = (parameters) => {
    if (pendingExercise) {
      const exerciseWithParams = {
        exerciseId: pendingExercise.id,
        name: pendingExercise.name,
        equipment: pendingExercise.equipment,
        category: pendingExercise.category,
        ...parameters
      };
      
      setWorkouts(prev => prev.map((workout, index) => 
        index === currentWorkoutIndex 
      ? { ...workout, exercises: [...workout.exercises, exerciseWithParams] }
      : workout
    ));
    
    // Update baselines for AUTOMATED programs
    if (programType === PROGRAM_TYPES.AUTOMATED) {
      setBaselines(prev => {
        const existing = prev.find(b => b.exerciseId === pendingExercise.id);
        if (!existing) {
          return [...prev, { exerciseId: pendingExercise.id, ...parameters }];
        }
        return prev;
      });
    }
  }
  
  setShowParametersDialog(false);
  setPendingExercise(null);
};

const removeExerciseFromWorkout = (workoutIndex, exerciseIndex) => {
  setWorkouts(prev => prev.map((workout, wIndex) => 
    wIndex === workoutIndex 
  ? { ...workout, exercises: workout.exercises.filter((_, eIndex) => eIndex !== exerciseIndex) }
  : workout
));
};

// Baseline handlers
const updateBaseline = (exerciseId, field, value) => {
  setBaselines(prev => prev.map(baseline => 
    baseline.exerciseId === exerciseId 
    ? { ...baseline, [field]: Math.max(0, Number(value)) }
    : baseline
  ));
};

const handleSubmit = async () => {
  if (programType === PROGRAM_TYPES.AUTOMATED) {
    if (!validateStep1() || !validateStep2() || !validateStep3() || !validateStep4()) {
      setError('Please complete all required fields and add exercises to all workouts');
      return;
    }
  } else {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      setError('Please complete all required fields and add exercises to all workouts');
      return;
    }
  }
  
  setSubmitting(true);
  setError(null);
  
  try {
    // Step 1: Create program with workouts using V2 API with admin support
    const programPayload = {
      name: programName,
      targetUserId: Number(selectedUser), // For admin creating for other users
      goal,
      programType,
      startDate,
      endDate: endDate || null,
      shouldActivate: setActive,          // Whether to set as active program
      workouts: workouts.map((workout) => ({
        name: workout.name
      }))
    };
    
    console.log('Creating program with payload:', programPayload);
    
    const result = await programsAPI.createWithWorkouts(programPayload);
    const createdProgram = result.data || result;
    console.log('Created program:', createdProgram);
    console.log('Has workouts?', createdProgram?.workouts);
    console.log('Workout count:', createdProgram?.workouts?.length);
    
    // Step 2: Add exercises to each workout
    if (createdProgram && createdProgram.workouts) {
      console.log('Adding exercises to workouts...');
      console.log('Created program structure:', createdProgram);
      
      for (let i = 0; i < createdProgram.workouts.length; i++) {
        const workout = createdProgram.workouts[i];
        const workoutExercises = workouts[i].exercises;
        
        console.log(`Processing workout ${i}:`, {
          workoutId: workout.id,
          exerciseCount: workoutExercises?.length,
          exercises: workoutExercises
        });
        
        if (workoutExercises && workoutExercises.length > 0) {
          const exercisePayload = {
            workoutId: workout.id,
            exercises: workoutExercises.map((exercise, index) => ({
              id: exercise.exerciseId,
              sets: Number(exercise.sets),
              reps: Number(exercise.reps),
              weight: Number(exercise.weight),
              order: index + 1
            }))
          };
          
          console.log('Sending exercise payload:', exercisePayload);
          
          try {
            const result = await exercisesAPI.upsertToWorkout(exercisePayload);
            console.log('Exercise upsert result:', result);
          } catch (exerciseError) {
            console.error(`Failed to add exercises to workout ${workout.id}:`, exerciseError);
            throw new Error(`Failed to add exercises to workout "${workout.name}": ${exerciseError.message}`);
          }
        }
      }
      console.log('All exercises added successfully');
    }
    
    // Step 3: Create baselines for AUTOMATED programs
    if (programType === PROGRAM_TYPES.AUTOMATED && baselines.length > 0 && createdProgram.id) {
      try {
        await baselineApi.bulkCreateBaselines(createdProgram.id, baselines);
        console.log('Baselines created successfully');
      } catch (baselineError) {
        console.error('Failed to create baselines:', baselineError);
        setError(`Program created but failed to create baselines: ${baselineError.message}`);
      }
    }
    
    // Reset form
    setProgramName('');
    setSelectedUser('');
    setGoal('HYPERTROPHY');
    setProgramType(PROGRAM_TYPES.MANUAL);
    setStartDate('');
    setEndDate('');
    setWorkouts([{ id: 1, name: '', exercises: [] }]);
    setSetActive(false);
    setCurrentStep(STEPS.PROGRAM_DETAILS);
    setCompletedSteps(new Set());
    setBaselines([]);
    
    alert('Program created successfully with all exercises!');
  } catch (error) {
    console.error('Error creating program:', error);
    
    // Parse validation errors from the API response
    let errorMessage = 'Failed to create program';
    
    if (error.response) {
      const errorData = error.response;
      
      // Check for validation errors array
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors
          .map(err => err.msg || err.message)
          .filter(msg => msg) // Remove empty messages
          .join('\n');
        
        errorMessage = errorMessages || errorData.message || errorMessage;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    setError(errorMessage);
  } finally {
    setSubmitting(false);
  }
};

// Render functions
const renderStepIndicator = () => {
  const maxStep = programType === PROGRAM_TYPES.AUTOMATED ? STEPS.BASELINES : STEPS.EXERCISES;
  
  return (
    <div className="step-indicator">
    {[1, 2, 3, 4].slice(0, maxStep).map(step => (
      <div 
      key={step}
      className={`step ${currentStep === step ? 'current' : ''} ${
        completedSteps.has(step) ? 'completed' : ''
      } ${canProceedToStep(step) ? 'accessible' : 'locked'}`}
      onClick={() => goToStep(step)}
      >
      <div className="step-number">
      {completedSteps.has(step) ? <CheckCircle size={16} /> : step}
      </div>
      <div className="step-label">
      {step === STEPS.PROGRAM_DETAILS && 'Program Details'}
      {step === STEPS.WORKOUTS && 'Workouts'}
      {step === STEPS.EXERCISES && 'Exercises'}
      {step === STEPS.BASELINES && 'Baselines'}
      </div>
      </div>
    ))}
    </div>
  );
};

const renderStep1 = () => (
  <div className="step-content">
  <h2>Program Details</h2>
  <div className="form-grid">
  <div className="form-group">
  <label htmlFor="programName">Program Name *</label>
  <input
  type="text"
  id="programName"
  value={programName}
  onChange={(e) => setProgramName(e.target.value)}
  placeholder="Enter program name"
  />
  </div>
  
  <div className="form-group">
  <label htmlFor="user">Select User *</label>
  <select
  id="user"
  value={selectedUser}
  onChange={(e) => setSelectedUser(e.target.value)}
  >
  <option value="">Select a user</option>
  {(users || []).map(user => (
    <option key={user.id} value={user.id}>
    {user.firstName} {user.lastName} ({user.username})
    </option>
  ))}
  </select>
  </div>
  
  <div className="form-group">
  <label>Goal *</label>
  <div className="button-group">
  <button
  type="button"
  onClick={() => setGoal('HYPERTROPHY')}
  className={`option-button ${goal === 'HYPERTROPHY' ? 'active' : ''}`}
  >
  Hypertrophy
  </button>
  <button
  type="button"
  onClick={() => setGoal('STRENGTH')}
  className={`option-button ${goal === 'STRENGTH' ? 'active' : ''}`}
  >
  Strength
  </button>
  </div>
  </div>
  
  <div className="form-group">
  <label>Program Type *</label>
  <div className="button-group">
  <button
  type="button"
  onClick={() => setProgramType(PROGRAM_TYPES.MANUAL)}
  className={`option-button ${programType === PROGRAM_TYPES.MANUAL ? 'active' : ''}`}
  >
  Manual
  </button>
  <button
  type="button"
  onClick={() => setProgramType(PROGRAM_TYPES.AUTOMATED)}
  className={`option-button ${programType === PROGRAM_TYPES.AUTOMATED ? 'active' : ''}`}
  >
  Automated
  </button>
  </div>
  <small className="form-hint">
  {programType === PROGRAM_TYPES.AUTOMATED 
    ? 'Automated programs use baselines for progression tracking'
    : 'Manual programs require manual workout tracking'
  }
  </small>
  </div>
  
  <div className="form-group">
  <div className="checkbox-group">
  <input
  type="checkbox"
  id="setActive"
  checked={setActive}
  onChange={(e) => setSetActive(e.target.checked)}
  />
  <label htmlFor="setActive">Set as active program</label>
  </div>
  </div>
  
  <div className="form-group">
  <label htmlFor="startDate">Start Date *</label>
  <input
  type="date"
  id="startDate"
  value={startDate}
  onChange={(e) => {
    setStartDate(e.target.value);
    if (endDate && !isEndDateValid(e.target.value, endDate)) {
      setEndDate('');
    }
  }}
  />
  </div>
  
  <div className="form-group">
  <label htmlFor="endDate">End Date (Optional)</label>
  <input
  type="date"
  id="endDate"
  value={endDate}
  min={startDate}
  onChange={handleEndDateChange}
  />
  </div>
  </div>
  </div>
);

const renderStep2 = () => (
  <div className="step-content">
  <div className="step-header">
  <h2>Workouts</h2>
  <button 
  type="button"
  className="add-button"
  onClick={addWorkout}
  >
  <Plus size={16} /> Add Workout
  </button>
  </div>
  
  <div className="workout-list">
  {workouts.map((workout) => (
    <div key={workout.id} className="workout-item">
    <input
    type="text"
    className="workout-name-input"
    placeholder="Workout name"
    value={workout.name}
    onChange={(e) => handleWorkoutNameChange(workout.id, e.target.value)}
    />
    <div className="workout-info">
    {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
    </div>
    <button 
    type="button"
    className="remove-button"
    onClick={() => removeWorkout(workout.id)}
    disabled={workouts.length === 1}
    >
    <X size={16} />
    </button>
    </div>
  ))}
  </div>
  </div>
);

const renderStep3 = () => (
  <div className="step-content">
  <h2>Exercise Selection</h2>
  <p className="step-description">
  Add exercises to each workout. Each workout must have at least one exercise.
  </p>
  
  <div className="workout-exercise-list">
  {workouts.map((workout, workoutIndex) => (
    <div key={workout.id} className="workout-section">
    <div className="workout-section-header">
    <h3>{workout.name || `Workout ${workoutIndex + 1}`}</h3>
    <button
    type="button"
    className="add-exercises-button"
    onClick={() => openExerciseSelector(workoutIndex)}
    >
    <Plus size={16} /> Add Exercises
    </button>
    </div>
    
    <div className="exercise-list">
    {workout.exercises.length === 0 ? (
      <div className="empty-state">
      <p>No exercises added yet</p>
      </div>
    ) : (
      workout.exercises.map((exercise, exerciseIndex) => (
        <div key={exerciseIndex} className="exercise-item">
        <div className="exercise-info">
        <h4>{exercise.name}</h4>
        <div className="exercise-params">
        {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
        </div>
        </div>
        <button
        type="button"
        className="remove-exercise-button"
        onClick={() => removeExerciseFromWorkout(workoutIndex, exerciseIndex)}
        >
        <X size={16} />
        </button>
        </div>
      ))
    )}
    </div>
    </div>
  ))}
  </div>
  </div>
);

const renderStep4 = () => (
  <div className="step-content">
  <h2>Set Baselines</h2>
  <p className="step-description">
  Set baseline values for each exercise. These will be used as starting points for progression.
  </p>
  
  <div className="baseline-list">
  {baselines.map((baseline) => (
    <div key={baseline.exerciseId} className="baseline-item">
    <div className="baseline-info">
    <h4>{workouts.flatMap(w => w.exercises).find(e => e.exerciseId === baseline.exerciseId)?.name}</h4>
    </div>
    <div className="baseline-controls">
    <div className="control-group">
    <label>Sets</label>
    <input
    type="number"
    min="1"
    max="20"
    value={baseline.sets}
    onChange={(e) => updateBaseline(baseline.exerciseId, 'sets', e.target.value)}
    />
    </div>
    <div className="control-group">
    <label>Reps</label>
    <input
    type="number"
    min="1"
    max="100"
    value={baseline.reps}
    onChange={(e) => updateBaseline(baseline.exerciseId, 'reps', e.target.value)}
    />
    </div>
    <div className="control-group">
    <label>Weight (kg)</label>
    <input
    type="number"
    min="0"
    step="2.5"
    value={baseline.weight}
    onChange={(e) => updateBaseline(baseline.exerciseId, 'weight', e.target.value)}
    />
    </div>
    </div>
    </div>
  ))}
  </div>
  </div>
);

const renderNavigation = () => {
  const isLastStep = programType === PROGRAM_TYPES.AUTOMATED 
  ? currentStep === STEPS.BASELINES 
  : currentStep === STEPS.EXERCISES;
  
  return (
    <div className="step-navigation">
    <div className="nav-left">
    {currentStep > STEPS.PROGRAM_DETAILS && (
      <button
      type="button"
      onClick={prevStep}
      className="nav-button secondary"
      >
      <ArrowLeft size={16} />
      Previous
      </button>
    )}
    </div>
    
    <div className="nav-right">
    {isLastStep ? (
      <button
      onClick={handleSubmit}
      className="nav-button primary"
      disabled={submitting}
      type="button"
      >
      {submitting ? (
        <>
        <LoadingSpinner size="small" />
        Creating...
        </>
      ) : (
        <>
        <Save size={16} />
        Create Program
        </>
      )}
      </button>
    ) : (
      <button
      type="button"
      onClick={nextStep}
      className="nav-button primary"
      disabled={!canProceedToStep(currentStep + 1)}
      >
      Next
      <ArrowRight size={16} />
      </button>
    )}
    </div>
    </div>
  );
};

if (loading) return <LoadingSpinner size="large" />;

return (
  <div className="create-program-enhanced">
  <div className="create-program-enhanced__header">
  <h1>Create Program</h1>
  {renderStepIndicator()}
  </div>
  
  <div className="create-program-enhanced__content">
  {currentStep === STEPS.PROGRAM_DETAILS && renderStep1()}
  {currentStep === STEPS.WORKOUTS && renderStep2()}
  {currentStep === STEPS.EXERCISES && renderStep3()}
  {currentStep === STEPS.BASELINES && programType === PROGRAM_TYPES.AUTOMATED && renderStep4()}
  </div>
  
  {error && (
    <div className="error-message">{error}</div>
  )}
  
  {renderNavigation()}
  
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
  </div>
);
}

export default CreateProgramWithWorkoutsEnhanced;