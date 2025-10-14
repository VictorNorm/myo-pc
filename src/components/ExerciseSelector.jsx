import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, CheckSquare, Square } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { exercisesAPI } from '../utils/api/apiV2';

const EQUIPMENT_TYPES = {
  BARBELL: 'BARBELL',
  DUMBBELL: 'DUMBBELL',
  CABLE: 'CABLE',
  MACHINE: 'MACHINE',
  BODYWEIGHT: 'BODYWEIGHT'
};

const CATEGORIES = {
  COMPOUND: 'COMPOUND',
  ISOLATION: 'ISOLATION'
};

const ExerciseSelector = ({
  isOpen = true,
  selectedExercises = [],
  onSelectionChange,
  onClose,
  multiple = true,
  showFilters = true,
  maxSelection = null
}) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Selection states
  const [internalSelection, setInternalSelection] = useState(new Set(selectedExercises));
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  useEffect(() => {
    setInternalSelection(new Set(selectedExercises));
  }, [selectedExercises]);
  const fetchExercises = async (filters = {}) => {
    try {
      setLoading(true);
      
      // Use V2 API to get exercises
      const allExercises = await exercisesAPI.getAll();
      
      // V2 API returns direct array of exercises, no need to flatten
      let filteredExercises = allExercises;
      
      // Apply filters after fetching
      if (filters.equipment || selectedEquipment) {
        const equipment = filters.equipment || selectedEquipment;
        filteredExercises = filteredExercises.filter(exercise => 
          exercise.equipment === equipment
        );
      }
      
      if (filters.category || selectedCategory) {
        const category = filters.category || selectedCategory;
        filteredExercises = filteredExercises.filter(exercise => 
          exercise.category === category
        );
      }
      
      if (filters.search || searchQuery) {
        const search = (filters.search || searchQuery).toLowerCase();
        filteredExercises = filteredExercises.filter(exercise => 
          exercise.name.toLowerCase().includes(search)
        );
      }
      
      setExercises(filteredExercises);
      setError(null);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError(error.message);
      setExercises([]); // Ensure exercises is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchExercises({ search: query });
  };

  const handleEquipmentFilter = (equipment) => {
    setSelectedEquipment(equipment);
    fetchExercises({ equipment });
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    fetchExercises({ category });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedEquipment('');
    setSelectedCategory('');
    fetchExercises();
  };

  const handleExerciseToggle = (exerciseId) => {
    const newSelection = new Set(internalSelection);
    
    if (newSelection.has(exerciseId)) {
      newSelection.delete(exerciseId);
    } else {
      if (!multiple) {
        newSelection.clear();
      }
      
      if (!maxSelection || newSelection.size < maxSelection) {
        newSelection.add(exerciseId);
      }
    }
    
    setInternalSelection(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelection));
    }
  };

  const handleSelectAll = () => {
    if (internalSelection.size === exercises.length) {
      // Deselect all
      setInternalSelection(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    } else {
      // Select all (respecting maxSelection)
      const allIds = exercises.map(ex => ex.id);
      const limitedSelection = maxSelection ? allIds.slice(0, maxSelection) : allIds;
      const newSelection = new Set(limitedSelection);
      
      setInternalSelection(newSelection);
      if (onSelectionChange) {
        onSelectionChange(Array.from(newSelection));
      }
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = !searchQuery || 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEquipment = !selectedEquipment || 
      exercise.equipment === selectedEquipment;
    
    const matchesCategory = !selectedCategory || 
      exercise.category === selectedCategory;
    
    return matchesSearch && matchesEquipment && matchesCategory;
  });

  const isSelected = (exerciseId) => internalSelection.has(exerciseId);
  const isSelectionLimitReached = maxSelection && internalSelection.size >= maxSelection;

  if (!isOpen) return null;

  return (
    <div className="exercise-selector">
      <div className="exercise-selector__header">
        <h3>Select Exercises</h3>
        <div className="exercise-selector__header__controls">
          <div className="selection-count">
            {internalSelection.size} selected
            {maxSelection && ` / ${maxSelection} max`}
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="close-button"
              type="button"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="exercise-selector__search">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        {showFilters && (
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`filter-toggle ${showFiltersPanel ? 'active' : ''}`}
            type="button"
          >
            <Filter size={20} />
            Filters
          </button>
        )}
      </div>

      {showFilters && showFiltersPanel && (
        <div className="exercise-selector__filters">
          <div className="filter-group">
            <label>Equipment</label>
            <select
              value={selectedEquipment}
              onChange={(e) => handleEquipmentFilter(e.target.value)}
            >
              <option value="">All Equipment</option>
              {Object.values(EQUIPMENT_TYPES).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.values(CATEGORIES).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearFilters}
            className="clear-filters-button"
            type="button"
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="exercise-selector__actions">
        {multiple && (
          <button
            onClick={handleSelectAll}
            className="select-all-button"
            type="button"
          >
            {internalSelection.size === filteredExercises.length ? (
              <>
                <CheckSquare size={16} />
                Deselect All
              </>
            ) : (
              <>
                <Square size={16} />
                Select All
              </>
            )}
          </button>
        )}
      </div>

      <div className="exercise-selector__content">
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="medium" />
            <p>Loading exercises...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">Error: {error}</p>
            <button onClick={() => fetchExercises()} type="button">
              Retry
            </button>
          </div>
        ) : (
          <div className="exercise-list">
            {filteredExercises.length === 0 ? (
              <div className="empty-state">
                <p>No exercises found</p>
                {(searchQuery || selectedEquipment || selectedCategory) && (
                  <button onClick={handleClearFilters} type="button">
                    Clear filters to see all exercises
                  </button>
                )}
              </div>
            ) : (
              filteredExercises.map(exercise => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
                <div
                  key={exercise.id}
                  className={`exercise-item ${isSelected(exercise.id) ? 'selected' : ''} ${
                    !isSelected(exercise.id) && isSelectionLimitReached ? 'disabled' : ''
                  }`}
                  onClick={() => {
                    if (!(!isSelected(exercise.id) && isSelectionLimitReached)) {
                      handleExerciseToggle(exercise.id);
                    }
                  }}
                >
                  <div className="exercise-item__checkbox">
                    {isSelected(exercise.id) ? (
                      <CheckSquare size={20} className="checked" />
                    ) : (
                      <Square size={20} />
                    )}
                  </div>
                  
                  <div className="exercise-item__content">
                    <h4 className="exercise-name">{exercise.name}</h4>
                    <div className="exercise-details">
                      <span className="equipment-badge">
                        {exercise.equipment}
                      </span>
                      <span className="category-badge">
                        {exercise.category}
                      </span>
                    </div>
                    
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
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseSelector;