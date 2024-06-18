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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    // eslint-disable-next-line
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
        element: <Programs />,
      },
      {
        path: "/training",
        element: <Training />,
      },
      ,
      {
        path: "/workouts",
        element: <Workouts />,
      },
      {
        path: "/exercises",
        element: <Exercises />,
      },
      {
        path: "/clients",
        element: <Clients />,
      },
      // Add other protected routes here
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
