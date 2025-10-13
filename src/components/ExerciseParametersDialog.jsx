import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Save } from 'lucide-react';

const DEFAULT_PARAMETERS = { sets: 3, reps: 10, weight: 0 };

const ExerciseParametersDialog = ({
  isOpen,
  exercise,
  initialParameters = DEFAULT_PARAMETERS,
  onSave,
  onCancel,
  title = 'Set Exercise Parameters'
}) => {
  const [parameters, setParameters] = useState(initialParameters);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setParameters(initialParameters);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        handleCancel();
      } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const validateParameters = () => {
    const newErrors = {};
    
    if (parameters.sets < 1 || parameters.sets > 20) {
      newErrors.sets = 'Sets must be between 1 and 20';
    }
    
    if (parameters.reps < 1 || parameters.reps > 100) {
      newErrors.reps = 'Reps must be between 1 and 100';
    }
    
    if (parameters.weight < 0) {
      newErrors.weight = 'Weight cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleParameterChange = (field, value) => {
    const numericValue = Math.max(0, Number(value) || 0);
    setParameters(prev => ({
      ...prev,
      [field]: numericValue
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleIncrement = (field) => {
    const increment = field === 'weight' ? 2.5 : 1;
    const maxValue = field === 'sets' ? 20 : field === 'reps' ? 100 : 1000;
    
    setParameters(prev => ({
      ...prev,
      [field]: Math.min(maxValue, prev[field] + increment)
    }));
  };

  const handleDecrement = (field) => {
    const decrement = field === 'weight' ? 2.5 : 1;
    const minValue = field === 'weight' ? 0 : 1;
    
    setParameters(prev => ({
      ...prev,
      [field]: Math.max(minValue, prev[field] - decrement)
    }));
  };

  const handleSave = () => {
    if (validateParameters()) {
      onSave(parameters);
    }
  };

  const handleCancel = () => {
    setParameters(initialParameters);
    setErrors({});
    onCancel();
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="exercise-parameters-dialog__overlay" onClick={handleOverlayClick}>
      <div className="exercise-parameters-dialog">
        <div className="exercise-parameters-dialog__header">
          <h3>{title}</h3>
          <button
            onClick={handleCancel}
            className="close-button"
            type="button"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="exercise-parameters-dialog__content">
          {exercise && (
            <div className="exercise-info">
              <h4 className="exercise-name">{exercise.name}</h4>
              {exercise.equipment && exercise.category && (
                <div className="exercise-details">
                  <span className="equipment-badge">{exercise.equipment}</span>
                  <span className="category-badge">{exercise.category}</span>
                </div>
              )}
              {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                <div className="muscle-groups">
                  {exercise.muscle_groups.map((mg, index) => {
                    const muscleGroup = mg.muscle_groups || mg;
                    return (
                      <span 
                        key={muscleGroup.id || index} 
                        className="muscle-group"
                      >
                        {muscleGroup.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="parameters-form">
            <div className="parameter-group">
              <label htmlFor="sets">Sets</label>
              <div className="parameter-control">
                <button
                  onClick={() => handleDecrement('sets')}
                  type="button"
                  className="decrement-button"
                  disabled={parameters.sets <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  id="sets"
                  type="number"
                  min="1"
                  max="20"
                  value={parameters.sets}
                  onChange={(e) => handleParameterChange('sets', e.target.value)}
                  className={errors.sets ? 'error' : ''}
                />
                <button
                  onClick={() => handleIncrement('sets')}
                  type="button"
                  className="increment-button"
                  disabled={parameters.sets >= 20}
                >
                  <Plus size={16} />
                </button>
              </div>
              {errors.sets && (
                <span className="error-message">{errors.sets}</span>
              )}
            </div>

            <div className="parameter-group">
              <label htmlFor="reps">Reps</label>
              <div className="parameter-control">
                <button
                  onClick={() => handleDecrement('reps')}
                  type="button"
                  className="decrement-button"
                  disabled={parameters.reps <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  id="reps"
                  type="number"
                  min="1"
                  max="100"
                  value={parameters.reps}
                  onChange={(e) => handleParameterChange('reps', e.target.value)}
                  className={errors.reps ? 'error' : ''}
                />
                <button
                  onClick={() => handleIncrement('reps')}
                  type="button"
                  className="increment-button"
                  disabled={parameters.reps >= 100}
                >
                  <Plus size={16} />
                </button>
              </div>
              {errors.reps && (
                <span className="error-message">{errors.reps}</span>
              )}
            </div>

            <div className="parameter-group">
              <label htmlFor="weight">Weight (kg)</label>
              <div className="parameter-control">
                <button
                  onClick={() => handleDecrement('weight')}
                  type="button"
                  className="decrement-button"
                  disabled={parameters.weight <= 0}
                >
                  <Minus size={16} />
                </button>
                <input
                  id="weight"
                  type="number"
                  min="0"
                  step="2.5"
                  value={parameters.weight}
                  onChange={(e) => handleParameterChange('weight', e.target.value)}
                  className={errors.weight ? 'error' : ''}
                />
                <button
                  onClick={() => handleIncrement('weight')}
                  type="button"
                  className="increment-button"
                >
                  <Plus size={16} />
                </button>
              </div>
              {errors.weight && (
                <span className="error-message">{errors.weight}</span>
              )}
            </div>
          </div>

          <div className="exercise-parameters-dialog__actions">
            <button
              onClick={handleCancel}
              className="cancel-button"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="save-button"
              type="button"
            >
              <Save size={16} />
              Save Parameters
            </button>
          </div>
        </div>

        <div className="keyboard-shortcuts">
          <span>Press <kbd>Esc</kbd> to cancel or <kbd>Ctrl+Enter</kbd> to save</span>
        </div>
      </div>
    </div>
  );
};

export default ExerciseParametersDialog;