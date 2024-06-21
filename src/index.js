import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";
import ErrorPage from "./components/ErrorPage";
import Root from "./components/Root";
import Login from "./components/Login";
import HomePage from "./components/HomePage";
import { AuthProvider } from "./contexts/AuthProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Programs from "./components/Programs";
import Exercises from "./components/Exercises";
import Clients from "./components/Clients";
import RequireAuth from "./components/RequireAuth";
import Workouts from "./components/Workouts";
import Training from "./components/Training";
import MyPrograms from "./components/MyPrograms";
import AddWorkouts from "./components/AddWorkouts";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: (
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        ),
      },
      {
        path: "/programs",
        element: (
          <RequireAuth>
            <Programs />
          </RequireAuth>
        ),
      },
      {
        path: "/myprograms",
        element: (
          <RequireAuth>
            <MyPrograms />
          </RequireAuth>
        ),
      },
      {
        path: "/clientprograms",
        element: (
          <RequireAuth>
            <AddWorkouts />
          </RequireAuth>
        ),
      },
      {
        path: "/training",
        element: (
          <RequireAuth>
            <Training />
          </RequireAuth>
        ),
      },
      {
        path: "/workouts",
        element: (
          <RequireAuth>
            <Workouts />
          </RequireAuth>
        ),
      },
      {
        path: "/exercises",
        element: (
          <RequireAuth>
            <Exercises />
          </RequireAuth>
        ),
      },
      {
        path: "/clients",
        element: (
          <RequireAuth>
            <Clients />
          </RequireAuth>
        ),
      },
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
