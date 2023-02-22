import React, { useState, useEffect } from "react";
import "./App.css";
import AlgoVisualizer from "./components/AlgoVisualizerPage/AlgoVisualizer";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import FirstFloor from "./components/AlgoVisualizerPage/FirstFloor";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <AlgoVisualizer />
        </Route>
        <Route path="/firstfloor">
          <FirstFloor />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
