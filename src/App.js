import React, { useState, useEffect } from "react";
import "./App.css";
import AlgoVisualizer from "./components/AlgoVisualizerPage/AlgoVisualizer";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import FirstFloor from "./firstfloor/FirstFloor";

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
        <Route exact path="/secondfloor">
          <AlgoVisualizer />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
