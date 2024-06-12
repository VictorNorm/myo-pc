import React from "react";
import "./App.css";
import { RouterProvider } from "react-router-dom";

const App = ({ router }) => {
  return <RouterProvider router={router} />;
};

export default App;
