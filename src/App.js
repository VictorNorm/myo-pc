import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorPage from './components/ErrorPage';
import Root from './components/Root';
import Login from './components/Login';
import HomePage from './components/HomePage';
import Programs from './components/Programs';
import Exercises from './components/Exercises';
import Clients from './components/Clients';
import RequireAuth from './components/RequireAuth';
import Workouts from './components/Workouts';
import Training from './components/Training';
import MyPrograms from './components/MyPrograms';
import EditProgramEnhanced from './components/EditProgramEnhanced';
import Signup from './components/Signup';
import VerifyEmail from './components/VerifyEmail';
import AddExercisesToWorkout from './components/AddExercisesToWorkout';
import ResetPassword from './components/ResetPassword';
import CreateProgramWithWorkoutsEnhanced from './components/CreateProgramWithWorkoutsEnhanced';
import EditExercises from './components/EditExercises';
import CreateExercise from './components/CreateExercise';

const App = () => (
    <Routes>
        <Route path='/' element={<Root />} errorElement={<ErrorPage />}>
            <Route
                index
                element={
                    <RequireAuth>
                        <HomePage />
                    </RequireAuth>
                }
            />
            <Route
                path='programs'
                element={
                    <RequireAuth>
                        <Programs />
                    </RequireAuth>
                }
            />
            <Route
                path='createProgramWithWorkouts'
                element={
                    <RequireAuth>
                        <CreateProgramWithWorkoutsEnhanced />
                    </RequireAuth>
                }
            />
            <Route
                path='myprograms'
                element={
                    <RequireAuth>
                        <MyPrograms />
                    </RequireAuth>
                }
            />
            <Route
                path='editProgram'
                element={
                    <RequireAuth>
                        <EditProgramEnhanced />
                    </RequireAuth>
                }
            />
            <Route
                path='training'
                element={
                    <RequireAuth>
                        <Training />
                    </RequireAuth>
                }
            />
            <Route
                path='workouts'
                element={
                    <RequireAuth>
                        <Workouts />
                    </RequireAuth>
                }
            />
            <Route
                path='exercises'
                element={
                    <RequireAuth>
                        <Exercises />
                    </RequireAuth>
                }
            />
            <Route
                path='editExercises'
                element={
                    <RequireAuth>
                        <EditExercises />
                    </RequireAuth>
                }
            />
            <Route
                path='exercises/create'
                element={
                    <RequireAuth>
                        <CreateExercise />
                    </RequireAuth>
                }
            />
            <Route
                path='addExercisesToWorkout'
                element={
                    <RequireAuth>
                        <AddExercisesToWorkout />
                    </RequireAuth>
                }
            />
            <Route
                path='clients'
                element={
                    <RequireAuth>
                        <Clients />
                    </RequireAuth>
                }
            />
            <Route path='login' element={<Login />} />
            <Route path='signup' element={<Signup />} />
            <Route path='verify-email' element={<VerifyEmail />} />
            <Route path='reset-password' element={<ResetPassword />} />
        </Route>
    </Routes>
);

export default App;
