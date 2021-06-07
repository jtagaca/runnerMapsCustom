import React, { useState, useEffect } from "react";
import "./App.css";
import AlgoVisualizer from "./components/AlgoVisualizerPage/AlgoVisualizer";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <AlgoVisualizer />
      {/* <div className="App"></div> */}
    </div>
  );
}

export default App;
