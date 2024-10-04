import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Root() {
    const location = useLocation();
    const hideNavPaths = ['/login', "/signup", "/verify-email", "/reset-password"];
    const [workoutExercises, setWorkoutExercises] = useState({});
    const [targetExercises, setTargetExercises] = useState([]);

    const handleExerciseClick = (exercise) => {
      setTargetExercises(prevExercises => [
        ...prevExercises,
        {
          ...exercise,
          exercise_id: exercise.id,
          exercises: { name: exercise.name },
          sets: 0,
          reps: 0,
          weight: 0
        }
      ]);
    };

    return (
      <>
        <div className="app-container">
          {location.pathname === '/addExercisesToWorkout' && (
            <Sidebar
              onExerciseClick={handleExerciseClick}
            />
          )}
          <div className="main-content">
            {!hideNavPaths.includes(location.pathname) && <Header />}
            {!hideNavPaths.includes(location.pathname) && <Nav />}
            <div 
              className="App"
            >
              <Outlet context={{ workoutExercises, targetExercises, setTargetExercises }} />
            </div>
          </div>
        </div>
      </>
    );
  }
