/**
 * Helper functions for baseline data manipulation and management
 */

/**
 * Merge exercises with their corresponding baselines
 * @param {Array} exercises - Array of exercise objects
 * @param {Array} baselines - Array of baseline objects
 * @returns {Array} Array of exercises with baseline data merged
 */
export const mergeExercisesWithBaselines = (exercises, baselines) => {
  if (!Array.isArray(exercises) || !Array.isArray(baselines)) {
    return exercises || [];
  }

  return exercises.map(exercise => {
    const exerciseId = exercise.id || exercise.exercise_id || exercise.exerciseId;
    const baseline = baselines.find(b => 
      (b.exercise_id || b.exerciseId) === exerciseId
    );

    if (baseline) {
      return {
        ...exercise,
        baseline: {
          id: baseline.id,
          sets: baseline.sets,
          reps: baseline.reps,
          weight: baseline.weight,
          createdAt: baseline.createdAt,
          updatedAt: baseline.updatedAt
        },
        hasBaseline: true
      };
    }

    return {
      ...exercise,
      baseline: null,
      hasBaseline: false
    };
  });
};

/**
 * Validate baseline update data
 * @param {Object} oldBaseline - Current baseline data
 * @param {Object} newBaseline - New baseline data to validate
 * @returns {Object} Validation result with errors
 */
export const validateBaselineUpdate = (oldBaseline, newBaseline) => {
  const errors = {};
  const warnings = [];

  if (!oldBaseline || !newBaseline) {
    return {
      isValid: false,
      errors: { general: 'Both old and new baseline data are required' },
      warnings: []
    };
  }

  // Validate sets
  const newSets = Number(newBaseline.sets);
  if (isNaN(newSets) || newSets < 1 || newSets > 20) {
    errors.sets = 'Sets must be between 1 and 20';
  } else {
    // Check for significant changes
    const oldSets = Number(oldBaseline.sets);
    const setsChange = Math.abs(newSets - oldSets);
    if (setsChange > 3) {
      warnings.push(`Large change in sets: ${oldSets} → ${newSets}`);
    }
  }

  // Validate reps
  const newReps = Number(newBaseline.reps);
  if (isNaN(newReps) || newReps < 1 || newReps > 100) {
    errors.reps = 'Reps must be between 1 and 100';
  } else {
    // Check for significant changes
    const oldReps = Number(oldBaseline.reps);
    const repsChange = Math.abs(newReps - oldReps);
    const repsChangePercent = (repsChange / oldReps) * 100;
    if (repsChangePercent > 50) {
      warnings.push(`Large change in reps: ${oldReps} → ${newReps} (${Math.round(repsChangePercent)}%)`);
    }
  }

  // Validate weight
  const newWeight = Number(newBaseline.weight);
  if (isNaN(newWeight) || newWeight < 0) {
    errors.weight = 'Weight must be non-negative';
  } else {
    // Check for significant changes
    const oldWeight = Number(oldBaseline.weight);
    if (oldWeight > 0) {
      const weightChange = Math.abs(newWeight - oldWeight);
      const weightChangePercent = (weightChange / oldWeight) * 100;
      if (weightChangePercent > 25) {
        warnings.push(`Large change in weight: ${oldWeight}kg → ${newWeight}kg (${Math.round(weightChangePercent)}%)`);
      }
    }
  }

  // Check for volume changes
  const oldVolume = oldBaseline.sets * oldBaseline.reps * oldBaseline.weight;
  const newVolume = newSets * newReps * newWeight;
  const volumeChangePercent = oldVolume > 0 ? ((newVolume - oldVolume) / oldVolume) * 100 : 0;
  
  if (Math.abs(volumeChangePercent) > 30) {
    warnings.push(`Significant volume change: ${Math.round(volumeChangePercent)}%`);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    volumeChange: volumeChangePercent
  };
};

/**
 * Generate default baseline from exercise data
 * @param {Object} exercise - Exercise object
 * @param {Object} options - Options for baseline generation
 * @returns {Object} Default baseline object
 */
export const generateDefaultBaseline = (exercise, options = {}) => {
  if (!exercise) return null;

  const exerciseId = exercise.id || exercise.exercise_id || exercise.exerciseId;
  
  // Default values based on exercise category and equipment
  let defaultSets = 3;
  let defaultReps = 10;
  let defaultWeight = 0;

  // Adjust defaults based on exercise category
  if (exercise.category === 'COMPOUND') {
    defaultSets = options.compoundSets || 4;
    defaultReps = options.compoundReps || 6;
  } else if (exercise.category === 'ISOLATION') {
    defaultSets = options.isolationSets || 3;
    defaultReps = options.isolationReps || 12;
  }

  // Adjust defaults based on equipment
  switch (exercise.equipment) {
    case 'BARBELL':
      defaultWeight = options.barbellWeight || 20; // Empty barbell
      break;
    case 'DUMBBELL':
      defaultWeight = options.dumbbellWeight || 5;
      break;
    case 'MACHINE':
      defaultWeight = options.machineWeight || 10;
      break;
    case 'CABLE':
      defaultWeight = options.cableWeight || 10;
      break;
    case 'BODYWEIGHT':
      defaultWeight = 0; // Bodyweight exercises
      break;
    default:
      defaultWeight = options.defaultWeight || 0;
  }

  // Use provided parameters if available
  if (exercise.sets) defaultSets = exercise.sets;
  if (exercise.reps) defaultReps = exercise.reps;
  if (exercise.weight !== undefined) defaultWeight = exercise.weight;

  return {
    exerciseId: exerciseId,
    sets: defaultSets,
    reps: defaultReps,
    weight: defaultWeight
  };
};

/**
 * Calculate baseline progression over time
 * @param {Array} baselineHistory - Array of historical baseline data
 * @returns {Object} Progression analysis
 */
export const analyzeBaselineProgression = (baselineHistory) => {
  if (!Array.isArray(baselineHistory) || baselineHistory.length === 0) {
    return {
      hasProgression: false,
      totalSessions: 0,
      progressionRate: 0,
      trends: {}
    };
  }

  const sortedHistory = [...baselineHistory].sort((a, b) => 
    new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt)
  );

  const firstBaseline = sortedHistory[0];
  const lastBaseline = sortedHistory[sortedHistory.length - 1];

  // Calculate changes
  const setsChange = lastBaseline.sets - firstBaseline.sets;
  const repsChange = lastBaseline.reps - firstBaseline.reps;
  const weightChange = lastBaseline.weight - firstBaseline.weight;

  // Calculate volume progression
  const initialVolume = firstBaseline.sets * firstBaseline.reps * firstBaseline.weight;
  const finalVolume = lastBaseline.sets * lastBaseline.reps * lastBaseline.weight;
  const volumeChange = finalVolume - initialVolume;
  const volumeChangePercent = initialVolume > 0 ? (volumeChange / initialVolume) * 100 : 0;

  // Calculate time span
  const startDate = new Date(firstBaseline.updatedAt || firstBaseline.createdAt);
  const endDate = new Date(lastBaseline.updatedAt || lastBaseline.createdAt);
  const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const weeksDiff = daysDiff / 7;

  // Calculate progression rates (per week)
  const setsRate = setsChange / weeksDiff;
  const repsRate = repsChange / weeksDiff;
  const weightRate = weightChange / weeksDiff;
  const volumeRate = volumeChange / weeksDiff;

  // Identify trends
  const trends = {
    sets: setsChange > 0 ? 'increasing' : setsChange < 0 ? 'decreasing' : 'stable',
    reps: repsChange > 0 ? 'increasing' : repsChange < 0 ? 'decreasing' : 'stable',
    weight: weightChange > 0 ? 'increasing' : weightChange < 0 ? 'decreasing' : 'stable',
    volume: volumeChange > 0 ? 'increasing' : volumeChange < 0 ? 'decreasing' : 'stable'
  };

  // Overall progression assessment
  const hasProgression = volumeChangePercent > 5; // At least 5% volume increase

  return {
    hasProgression,
    totalSessions: sortedHistory.length,
    timespan: {
      days: daysDiff,
      weeks: Math.round(weeksDiff * 10) / 10
    },
    changes: {
      sets: setsChange,
      reps: repsChange,
      weight: weightChange,
      volume: Math.round(volumeChange * 100) / 100,
      volumePercent: Math.round(volumeChangePercent * 100) / 100
    },
    rates: {
      setsPerWeek: Math.round(setsRate * 100) / 100,
      repsPerWeek: Math.round(repsRate * 100) / 100,
      weightPerWeek: Math.round(weightRate * 100) / 100,
      volumePerWeek: Math.round(volumeRate * 100) / 100
    },
    trends,
    progressionRate: Math.round(volumeChangePercent / weeksDiff * 100) / 100 // % volume change per week
  };
};

/**
 * Generate baseline recommendations based on program type and user level
 * @param {Object} exercise - Exercise object
 * @param {string} programType - Program type (MANUAL/AUTOMATED)
 * @param {string} userLevel - User experience level (beginner/intermediate/advanced)
 * @returns {Object} Baseline recommendations
 */
export const generateBaselineRecommendations = (exercise, programType = 'AUTOMATED', userLevel = 'beginner') => {
  if (!exercise) return null;

  const recommendations = {};

  // Base recommendations by user level and exercise type
  const baseValues = {
    beginner: {
      compound: { sets: 3, reps: 8, weightMultiplier: 0.6 },
      isolation: { sets: 3, reps: 10, weightMultiplier: 0.4 }
    },
    intermediate: {
      compound: { sets: 4, reps: 6, weightMultiplier: 0.8 },
      isolation: { sets: 3, reps: 12, weightMultiplier: 0.6 }
    },
    advanced: {
      compound: { sets: 5, reps: 5, weightMultiplier: 0.9 },
      isolation: { sets: 4, reps: 15, weightMultiplier: 0.8 }
    }
  };

  const exerciseType = exercise.category === 'COMPOUND' ? 'compound' : 'isolation';
  const base = baseValues[userLevel]?.[exerciseType] || baseValues.beginner[exerciseType];

  recommendations.sets = base.sets;
  recommendations.reps = base.reps;

  // Estimate weight based on equipment and user level
  const equipmentWeights = {
    BARBELL: { min: 20, typical: 40 },
    DUMBBELL: { min: 2.5, typical: 15 },
    CABLE: { min: 5, typical: 20 },
    MACHINE: { min: 10, typical: 30 },
    BODYWEIGHT: { min: 0, typical: 0 }
  };

  const equipmentWeight = equipmentWeights[exercise.equipment] || equipmentWeights.DUMBBELL;
  recommendations.weight = Math.round(equipmentWeight.typical * base.weightMultiplier * 2.5) / 2.5; // Round to nearest 2.5kg

  // Add rationale
  recommendations.rationale = `Recommended for ${userLevel} level ${exerciseType} ${exercise.equipment.toLowerCase()} exercise`;

  // Add progression suggestions
  if (programType === 'AUTOMATED') {
    recommendations.progressionPlan = {
      week1to2: { ...recommendations },
      week3to4: {
        sets: recommendations.sets,
        reps: Math.min(recommendations.reps + 1, 20),
        weight: recommendations.weight
      },
      week5to6: {
        sets: recommendations.sets,
        reps: Math.max(recommendations.reps - 1, 1),
        weight: recommendations.weight + 2.5
      }
    };
  }

  return recommendations;
};

/**
 * Compare baselines across multiple exercises
 * @param {Array} baselines - Array of baseline objects with exercise data
 * @returns {Object} Comparison analysis
 */
export const compareBaselines = (baselines) => {
  if (!Array.isArray(baselines) || baselines.length === 0) {
    return { hasData: false };
  }

  const analysis = {
    hasData: true,
    totalExercises: baselines.length,
    categories: {},
    equipment: {},
    volumeDistribution: [],
    recommendations: []
  };

  // Group by category and equipment
  baselines.forEach(baseline => {
    const category = baseline.category || 'Unknown';
    const equipment = baseline.equipment || 'Unknown';

    if (!analysis.categories[category]) {
      analysis.categories[category] = { count: 0, avgVolume: 0, totalVolume: 0 };
    }
    
    if (!analysis.equipment[equipment]) {
      analysis.equipment[equipment] = { count: 0, avgVolume: 0, totalVolume: 0 };
    }

    const volume = baseline.sets * baseline.reps * baseline.weight;
    
    analysis.categories[category].count++;
    analysis.categories[category].totalVolume += volume;
    analysis.equipment[equipment].count++;
    analysis.equipment[equipment].totalVolume += volume;

    analysis.volumeDistribution.push({
      exerciseId: baseline.exerciseId,
      name: baseline.name,
      volume,
      category,
      equipment
    });
  });

  // Calculate averages
  Object.keys(analysis.categories).forEach(category => {
    analysis.categories[category].avgVolume = 
      Math.round(analysis.categories[category].totalVolume / analysis.categories[category].count);
  });

  Object.keys(analysis.equipment).forEach(equipment => {
    analysis.equipment[equipment].avgVolume = 
      Math.round(analysis.equipment[equipment].totalVolume / analysis.equipment[equipment].count);
  });

  // Sort volume distribution
  analysis.volumeDistribution.sort((a, b) => b.volume - a.volume);

  // Generate recommendations
  if (analysis.categories.COMPOUND && analysis.categories.ISOLATION) {
    const compoundRatio = analysis.categories.COMPOUND.count / baselines.length;
    if (compoundRatio < 0.4) {
      analysis.recommendations.push('Consider adding more compound exercises for better strength development');
    } else if (compoundRatio > 0.8) {
      analysis.recommendations.push('Consider adding isolation exercises for targeted muscle development');
    }
  }

  // Check for volume imbalances
  const avgVolume = analysis.volumeDistribution.reduce((sum, item) => sum + item.volume, 0) / baselines.length;
  const highVolumeCount = analysis.volumeDistribution.filter(item => item.volume > avgVolume * 1.5).length;
  const lowVolumeCount = analysis.volumeDistribution.filter(item => item.volume < avgVolume * 0.5).length;

  if (highVolumeCount > baselines.length * 0.3) {
    analysis.recommendations.push('Some exercises have very high volume - consider reducing for better recovery');
  }

  if (lowVolumeCount > baselines.length * 0.3) {
    analysis.recommendations.push('Some exercises have very low volume - consider increasing for better stimulus');
  }

  return analysis;
};

/**
 * Export baselines to a standardized format
 * @param {Array} baselines - Array of baseline objects
 * @param {string} format - Export format ('csv', 'json')
 * @returns {string} Formatted export data
 */
export const exportBaselines = (baselines, format = 'csv') => {
  if (!Array.isArray(baselines) || baselines.length === 0) {
    return '';
  }

  if (format === 'json') {
    return JSON.stringify(baselines, null, 2);
  }

  if (format === 'csv') {
    const headers = ['Exercise Name', 'Equipment', 'Category', 'Sets', 'Reps', 'Weight (kg)', 'Volume', 'Last Updated'];
    const rows = baselines.map(baseline => [
      baseline.name || 'Unknown',
      baseline.equipment || 'Unknown',
      baseline.category || 'Unknown',
      baseline.sets || 0,
      baseline.reps || 0,
      baseline.weight || 0,
      (baseline.sets * baseline.reps * baseline.weight) || 0,
      baseline.updatedAt ? new Date(baseline.updatedAt).toLocaleDateString() : 'Never'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  return '';
};

export default {
  mergeExercisesWithBaselines,
  validateBaselineUpdate,
  generateDefaultBaseline,
  analyzeBaselineProgression,
  generateBaselineRecommendations,
  compareBaselines,
  exportBaselines
};