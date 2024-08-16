import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Root() {
    const location = useLocation();
    const hideNavPaths = ['/login', "/signup", "/verify-email"];
    const [workoutExercises, setWorkoutExercises] = useState({});
    const [targetExercises, setTargetExercises] = useState([]);

    const handleDragStart = (e, exercise) => {
      e.dataTransfer.setData('application/json', JSON.stringify(exercise));
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const droppedExercise = JSON.parse(e.dataTransfer.getData('application/json'));
      setWorkoutExercises((prevExercises) => {
        const group = droppedExercise.muscle_group;
        return {
          ...prevExercises,
          [group]: [...(prevExercises[group] || []), droppedExercise]
        };
      });
    };

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
              onDragStart={handleDragStart} 
              onExerciseClick={handleExerciseClick}
            />
          )}
          <div className="main-content">
            {!hideNavPaths.includes(location.pathname) && <Header />}
            {!hideNavPaths.includes(location.pathname) && <Nav />}
            <div 
              className="App"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Outlet context={{ workoutExercises, targetExercises, setTargetExercises }} />
            </div>
          </div>
        </div>
      </>
    );
  }
