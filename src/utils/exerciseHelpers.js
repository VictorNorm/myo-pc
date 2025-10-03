/**
 * Helper functions for exercise data manipulation and formatting
 */

/**
 * Format exercise data for display
 * @param {Object} exercise - Exercise object
 * @returns {Object} Formatted exercise object
 */
export const formatExerciseForDisplay = (exercise) => {
  if (!exercise) return null;

  return {
    id: exercise.id || exercise.exercise_id,
    name: exercise.name || exercise.exercises?.name || 'Unknown Exercise',
    equipment: exercise.equipment || exercise.exercises?.equipment || 'Unknown',
    category: exercise.category || exercise.exercises?.category || 'Unknown',
    sets: Number(exercise.sets) || 0,
    reps: Number(exercise.reps) || 0,
    weight: Number(exercise.weight) || 0,
    muscleGroups: exercise.muscleGroups || exercise.exercises?.muscleGroups || [],
    videoUrl: exercise.videoUrl || exercise.exercises?.videoUrl,
    notes: exercise.notes || exercise.exercises?.notes,
    superset_with: exercise.superset_with,
    order: exercise.order || 0,
    lastCompleted: exercise.lastCompleted,
    defaultIncrementKg: exercise.defaultIncrementKg || exercise.exercises?.defaultIncrementKg || 2.5
  };
};

/**
 * Format exercise parameters for display
 * @param {Object} exercise - Exercise object
 * @returns {string} Formatted parameter string
 */
export const formatExerciseParameters = (exercise) => {
  if (!exercise) return '';

  const sets = exercise.sets || 0;
  const reps = exercise.reps || 0;
  const weight = exercise.weight || 0;

  return `${sets} set${sets !== 1 ? 's' : ''} × ${reps} rep${reps !== 1 ? 's' : ''} @ ${weight}kg`;
};

/**
 * Group exercises by muscle group
 * @param {Array} exercises - Array of exercise objects
 * @returns {Object} Object with muscle groups as keys and exercises as values
 */
export const groupExercisesByMuscleGroup = (exercises) => {
  if (!Array.isArray(exercises)) return {};

  const grouped = {};

  exercises.forEach(exercise => {
    const formattedExercise = formatExerciseForDisplay(exercise);
    
    if (formattedExercise.muscleGroups && formattedExercise.muscleGroups.length > 0) {
      // Group by primary muscle groups first
      const primaryGroups = formattedExercise.muscleGroups.filter(mg => mg.isPrimary);
      
      if (primaryGroups.length > 0) {
        primaryGroups.forEach(mg => {
          if (!grouped[mg.name]) {
            grouped[mg.name] = [];
          }
          grouped[mg.name].push(formattedExercise);
        });
      } else {
        // If no primary groups, use all muscle groups
        formattedExercise.muscleGroups.forEach(mg => {
          if (!grouped[mg.name]) {
            grouped[mg.name] = [];
          }
          grouped[mg.name].push(formattedExercise);
        });
      }
    } else {
      // If no muscle groups, put in "Other" category
      if (!grouped['Other']) {
        grouped['Other'] = [];
      }
      grouped['Other'].push(formattedExercise);
    }
  });

  return grouped;
};

/**
 * Group exercises by equipment type
 * @param {Array} exercises - Array of exercise objects
 * @returns {Object} Object with equipment types as keys and exercises as values
 */
export const groupExercisesByEquipment = (exercises) => {
  if (!Array.isArray(exercises)) return {};

  const grouped = {};

  exercises.forEach(exercise => {
    const formattedExercise = formatExerciseForDisplay(exercise);
    const equipment = formattedExercise.equipment;

    if (!grouped[equipment]) {
      grouped[equipment] = [];
    }
    grouped[equipment].push(formattedExercise);
  });

  return grouped;
};

/**
 * Group exercises by category (COMPOUND/ISOLATION)
 * @param {Array} exercises - Array of exercise objects
 * @returns {Object} Object with categories as keys and exercises as values
 */
export const groupExercisesByCategory = (exercises) => {
  if (!Array.isArray(exercises)) return {};

  const grouped = {};

  exercises.forEach(exercise => {
    const formattedExercise = formatExerciseForDisplay(exercise);
    const category = formattedExercise.category;

    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(formattedExercise);
  });

  return grouped;
};

/**
 * Calculate total volume for exercises
 * @param {Array} exercises - Array of exercise objects
 * @returns {Object} Volume metrics
 */
export const calculateTotalVolume = (exercises) => {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return {
      totalSets: 0,
      totalReps: 0,
      totalWeight: 0,
      totalVolume: 0,
      averageIntensity: 0,
      exerciseCount: 0
    };
  }

  let totalSets = 0;
  let totalReps = 0;
  let totalWeight = 0;
  let totalVolume = 0;
  let weightedReps = 0;
  
  exercises.forEach(exercise => {
    const sets = Number(exercise.sets) || 0;
    const reps = Number(exercise.reps) || 0;
    const weight = Number(exercise.weight) || 0;

    totalSets += sets;
    totalReps += (sets * reps);
    totalWeight += weight;
    
    const exerciseVolume = sets * reps * weight;
    totalVolume += exerciseVolume;
    weightedReps += (sets * reps * weight);
  });

  const exerciseCount = exercises.length;
  const averageIntensity = totalReps > 0 ? (totalVolume / totalReps) : 0;

  return {
    totalSets,
    totalReps,
    totalWeight,
    totalVolume,
    averageIntensity: Math.round(averageIntensity * 100) / 100,
    exerciseCount
  };
};

/**
 * Sort exercises by a given criteria
 * @param {Array} exercises - Array of exercise objects
 * @param {string} sortBy - Sort criteria ('name', 'equipment', 'category', 'volume')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted exercises array
 */
export const sortExercises = (exercises, sortBy = 'name', order = 'asc') => {
  if (!Array.isArray(exercises)) return [];

  const sortedExercises = [...exercises].sort((a, b) => {
    const aFormatted = formatExerciseForDisplay(a);
    const bFormatted = formatExerciseForDisplay(b);

    let aValue, bValue;

    switch (sortBy) {
      case 'name':
        aValue = aFormatted.name.toLowerCase();
        bValue = bFormatted.name.toLowerCase();
        break;
      case 'equipment':
        aValue = aFormatted.equipment.toLowerCase();
        bValue = bFormatted.equipment.toLowerCase();
        break;
      case 'category':
        aValue = aFormatted.category.toLowerCase();
        bValue = bFormatted.category.toLowerCase();
        break;
      case 'volume':
        aValue = (aFormatted.sets * aFormatted.reps * aFormatted.weight);
        bValue = (bFormatted.sets * bFormatted.reps * bFormatted.weight);
        break;
      case 'sets':
        aValue = aFormatted.sets;
        bValue = bFormatted.sets;
        break;
      case 'reps':
        aValue = aFormatted.reps;
        bValue = bFormatted.reps;
        break;
      case 'weight':
        aValue = aFormatted.weight;
        bValue = bFormatted.weight;
        break;
      default:
        aValue = aFormatted.name.toLowerCase();
        bValue = bFormatted.name.toLowerCase();
    }

    if (order === 'desc') {
      return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });

  return sortedExercises;
};

/**
 * Filter exercises by various criteria
 * @param {Array} exercises - Array of exercise objects
 * @param {Object} filters - Filter criteria
 * @param {string} [filters.search] - Search term for exercise name
 * @param {string} [filters.equipment] - Equipment type filter
 * @param {string} [filters.category] - Category filter
 * @param {Array} [filters.muscleGroups] - Muscle group IDs to filter by
 * @returns {Array} Filtered exercises array
 */
export const filterExercises = (exercises, filters = {}) => {
  if (!Array.isArray(exercises)) return [];

  let filtered = exercises.map(formatExerciseForDisplay);

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase().trim();
    filtered = filtered.filter(exercise =>
      exercise.name.toLowerCase().includes(searchTerm) ||
      exercise.equipment.toLowerCase().includes(searchTerm) ||
      exercise.category.toLowerCase().includes(searchTerm)
    );
  }

  // Equipment filter
  if (filters.equipment) {
    filtered = filtered.filter(exercise =>
      exercise.equipment === filters.equipment
    );
  }

  // Category filter
  if (filters.category) {
    filtered = filtered.filter(exercise =>
      exercise.category === filters.category
    );
  }

  // Muscle groups filter
  if (filters.muscleGroups && Array.isArray(filters.muscleGroups) && filters.muscleGroups.length > 0) {
    filtered = filtered.filter(exercise =>
      exercise.muscleGroups.some(mg =>
        filters.muscleGroups.includes(mg.id)
      )
    );
  }

  return filtered;
};

/**
 * Find similar exercises based on muscle groups and equipment
 * @param {Object} targetExercise - Target exercise to find similar exercises for
 * @param {Array} allExercises - Array of all available exercises
 * @param {number} limit - Maximum number of similar exercises to return
 * @returns {Array} Array of similar exercises
 */
export const findSimilarExercises = (targetExercise, allExercises, limit = 5) => {
  if (!targetExercise || !Array.isArray(allExercises)) return [];

  const target = formatExerciseForDisplay(targetExercise);
  const targetMuscleGroupIds = target.muscleGroups.map(mg => mg.id);

  const similar = allExercises
    .filter(exercise => exercise.id !== target.id) // Exclude the target exercise
    .map(exercise => {
      const formatted = formatExerciseForDisplay(exercise);
      const muscleGroupIds = formatted.muscleGroups.map(mg => mg.id);

      // Calculate similarity score
      let score = 0;

      // Same equipment type (high weight)
      if (formatted.equipment === target.equipment) {
        score += 3;
      }

      // Same category (medium weight)
      if (formatted.category === target.category) {
        score += 2;
      }

      // Shared muscle groups (high weight)
      const sharedMuscleGroups = muscleGroupIds.filter(id => 
        targetMuscleGroupIds.includes(id)
      );
      score += sharedMuscleGroups.length * 2;

      return { exercise: formatted, score };
    })
    .filter(item => item.score > 0) // Only include exercises with some similarity
    .sort((a, b) => b.score - a.score) // Sort by similarity score (descending)
    .slice(0, limit) // Limit results
    .map(item => item.exercise);

  return similar;
};

/**
 * Create exercise template data
 * @param {Object} exercise - Exercise object
 * @param {Object} defaultParams - Default parameters for the template
 * @returns {Object} Exercise template
 */
export const createExerciseTemplate = (exercise, defaultParams = {}) => {
  if (!exercise) return null;

  const formatted = formatExerciseForDisplay(exercise);

  return {
    exerciseId: formatted.id,
    name: formatted.name,
    equipment: formatted.equipment,
    category: formatted.category,
    sets: defaultParams.sets || 3,
    reps: defaultParams.reps || 10,
    weight: defaultParams.weight || 0,
    muscleGroups: formatted.muscleGroups,
    videoUrl: formatted.videoUrl,
    notes: formatted.notes,
    defaultIncrementKg: formatted.defaultIncrementKg
  };
};

/**
 * Calculate progression suggestions based on exercise history
 * @param {Object} exercise - Current exercise
 * @param {Array} history - Array of historical performance data
 * @returns {Object} Progression suggestions
 */
export const calculateProgressionSuggestions = (exercise, history = []) => {
  if (!exercise) return null;

  const current = formatExerciseForDisplay(exercise);
  
  if (!Array.isArray(history) || history.length === 0) {
    // No history, suggest basic progression
    return {
      sets: current.sets,
      reps: Math.min(current.reps + 1, 15), // Conservative rep increase
      weight: current.weight + (current.defaultIncrementKg || 2.5),
      rationale: 'Basic progression - increase reps or weight'
    };
  }

  // Analyze recent performance trends
  const recentSessions = history.slice(-3); // Last 3 sessions
  const completionRates = recentSessions.map(session => 
    (session.completedReps / (session.targetReps || current.reps)) * 100
  );
  const averageCompletion = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;

  let suggestions = {
    sets: current.sets,
    reps: current.reps,
    weight: current.weight,
    rationale: ''
  };

  if (averageCompletion >= 95) {
    // Excellent performance - increase intensity
    if (current.reps >= 12) {
      // High reps, increase weight and reduce reps
      suggestions.weight = current.weight + (current.defaultIncrementKg || 2.5);
      suggestions.reps = Math.max(current.reps - 2, 6);
      suggestions.rationale = 'Excellent performance - increase weight, reduce reps';
    } else {
      // Lower reps, increase reps first
      suggestions.reps = Math.min(current.reps + 1, 15);
      suggestions.rationale = 'Excellent performance - increase reps';
    }
  } else if (averageCompletion >= 80) {
    // Good performance - moderate progression
    suggestions.reps = Math.min(current.reps + 1, 15);
    suggestions.rationale = 'Good performance - small rep increase';
  } else {
    // Poor performance - maintain or reduce
    if (current.weight > 0) {
      suggestions.weight = Math.max(current.weight - (current.defaultIncrementKg || 2.5), 0);
      suggestions.rationale = 'Struggling with current load - reduce weight';
    } else {
      suggestions.reps = Math.max(current.reps - 1, 1);
      suggestions.rationale = 'Struggling with current volume - reduce reps';
    }
  }

  return suggestions;
};

export default {
  formatExerciseForDisplay,
  formatExerciseParameters,
  groupExercisesByMuscleGroup,
  groupExercisesByEquipment,
  groupExercisesByCategory,
  calculateTotalVolume,
  sortExercises,
  filterExercises,
  findSimilarExercises,
  createExerciseTemplate,
  calculateProgressionSuggestions
};