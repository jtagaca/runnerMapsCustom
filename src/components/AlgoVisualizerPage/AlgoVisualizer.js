import React, { useState, useEffect } from "react";
import "./AlgoVisualizer.css";
import { dijkstraAlgo } from "../../algorithms/dijkstraAlgo";
import { useHistory } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import NumericInput from 'react-numeric-input';


const baseGrid = [];
const rows = 10;
const columns = 20;
const haversineDistance = require('geodetic-haversine-distance');
for (var i = 0; i < rows; i++) {
  baseGrid[i] = [];
  for (var j = 0; j < columns; j++) {
    baseGrid[i][j] = -1;
  }
}
const predefinedTextVisuals = {};
predefinedTextVisuals[[1, 9]] = {"direction":"Head Straight", "lat": 35.450630, "long": -119.105934};
predefinedTextVisuals[[3, 9]] = {"direction":"Keep Head Straight", "lat": 35.450621, "long": -119.105955};
predefinedTextVisuals[[8, 9]] = {"direction":"Turn Left", "lat": 35.450756, "long": -119.106190};

// console.log(baseGrid);

const AlgoVisualizer = () => {
  const [grid, setGrid] = useState(baseGrid);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [isMouseDraggingStartPos, setIsMouseDraggingStartPos] = useState(false);
  const [isMouseDraggingEndPos, setIsMouseDraggingEndPos] = useState(false);
  const [initializedPosition, setInitPos] = useState({
    startRowIndex: 9,
    startColIndex: 0,
    endRowIndex: 0,
    endColIndex: 9,
  });
  const [previous, setPrevious] = useState(null);
  const [sortedMarkers, setSortedMarkers] = useState([]);
  const [currentGeoLocation, setCurrentGeoLocation] = useState({ latitude: 35.450630, longitude: -119.105934 });
  const [currentMarkersVisible, setCurrentMarkersVisible] = useState([]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  let history = useHistory();

  const MAX_PATH_LENGTH = 81;

  useEffect(() => {
    const tGrid = grid;
    let prevsi = 0,
      prevsj = 0;
    let prevei = 0,
      prevej = 0;
    // safety initializationOfStart and end
    for (let row = 0; row < tGrid.length; row++) {
      for (let col = 0; col < tGrid[row].length; col++) {
        if (tGrid[row][col] == 0) {
          prevsi = row;
          prevsj = col;
        } else if (tGrid[row][col] == -10) {
          prevei = row;
          prevej = col;
        }
      }
    }

    tGrid[prevsi][prevsj] = -1;
    tGrid[prevei][prevej] = -1;
    tGrid[initializedPosition.startRowIndex][
      initializedPosition.startColIndex
    ] = 0;
    tGrid[initializedPosition.endRowIndex][initializedPosition.endColIndex] =
      -10;
    setGrid([...tGrid]);
    const { startRowIndex, startColIndex, endRowIndex, endColIndex } =
      initializedPosition;
    document.querySelector(
      `.node-${prevsi}-${prevsj}`
    ).className = `eachCell node-${prevsi}-${prevsj}`;
    document.querySelector(
      `.node-${prevei}-${prevej}`
    ).className = `eachCell node-${prevei}-${prevej}`;
    document.querySelector(
      `.node-${startRowIndex}-${startColIndex}`
    ).className = `eachCell node-${startRowIndex}-${startColIndex} start`;
    document.querySelector(
      `.node-${endRowIndex}-${endColIndex}`
    ).className = `eachCell node-${endRowIndex}-${endColIndex} end`;

    let roomNodes = [
      [0, 0],
      [9, 5],
    ];
    for (let i = 0; i < roomNodes.length; i++) {
      let [row, col] = roomNodes[i];
      tGrid[row][col] = -5;
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} room`;
    }

    let predefinedWalls = [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
      [2, 0],
      [1, 0],
    ];
    for (let i = 0; i < predefinedWalls.length; i++) {
      let [row, col] = predefinedWalls[i];
      tGrid[row][col] = -5;
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} wall`;
    }
  }, [initializedPosition]);

  const changeColor = (row, col, type) => {
    if (
      (row == initializedPosition.startRowIndex &&
        col == initializedPosition.startColIndex) ||
      (row == initializedPosition.endRowIndex &&
        col == initializedPosition.endColIndex)
    ) {
      return;
    }
    if (type == "visual") {
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} visualCell`;
    } else if (type == "marker") {
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} marker`;
    } 
    
    else if (type == "currentmarker") {
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} selectedMarker`;
    } 
    else {
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} pathCell`;
    }
  };

  const handleInstructions = () => {
    alert(
      "'Green Grid' -> starting point \n'Red Grid'-> endpoint \n  1?????? Drag the green or red grid to your desired location on the grid. \n  2?????? Click and drag your mouse to the empty cells to mark them as a wall.\n  3?????? Click the 'Find Path' button. ???  "
    );
  };

  function getClosestMarkers(){
    let closestMarkers = [];
    let tempCurrentMarkersVisible = [];
    // for currentMarkersVisible
    for (let i = 0; i < currentMarkersVisible.length; i++) {
      let [row, col] = currentMarkersVisible[i];
      let lat = predefinedTextVisuals[[row,col]]['lat'];
      let long = predefinedTextVisuals[[row,col]]['long'];
      let markerGeoLocation = {latitude: lat, longitude: long};
      
      let distanceBetweenCurrentPosAndMarker = haversineDistance(currentGeoLocation, markerGeoLocation);
      tempCurrentMarkersVisible.push([row,col])
      closestMarkers.push([distanceBetweenCurrentPosAndMarker, [row, col]]);
    }
    setCurrentMarkersVisible(tempCurrentMarkersVisible);
    closestMarkers.sort((a, b) => a[0] - b[0]);
    return closestMarkers;

  }
  useEffect(() => {
    if (currentMarkersVisible.length == 0) {
     return 
    }

    let closestMarkers = getClosestMarkers();
    let currentTopMarker = closestMarkers[0];
    if (previous != null && currentTopMarker[1] == previous  ) {
      return
    }
    debugger;
    if (previous != null) {
      let [prevRow, prevCol] = previous;
      changeColor(prevRow, prevCol, "marker");
    }
    let [row, col] = currentTopMarker[1];
    changeColor(row, col, "currentmarker");
    console.log(currentGeoLocation)
    setPrevious(currentTopMarker[1]);


  }, [currentGeoLocation])
  
  const solveTheGrid = () => {
    const [shortPathList, listOfAllNodes, solvedGrid] = dijkstraAlgo(
      grid,
      initializedPosition
    );
    setGrid(solvedGrid);
    // Fill visualize color
    for (let row = 0; row < listOfAllNodes.length; row++) {
      setTimeout(() => {
        const node = listOfAllNodes[row];
        changeColor(node[0], node[1], "visual");
      }, 50 * row);
    }
    let tempDistancesWithKeys =[];
    // Fill path color
    for (let row = 0; row < shortPathList.length; row++) {
      setTimeout(() => {
        const node = shortPathList[row];
        if ([node[0], node[1]] in predefinedTextVisuals) {
          changeColor(node[0], node[1], "marker");
          console.log(predefinedTextVisuals[[node[0], node[1]]]['direction']);

          tempDistancesWithKeys.push([node[0], node[1]]);
        } else {
          changeColor(node[0], node[1], "path");
        }
      }, 50 * (row + listOfAllNodes.length));
    }
    setCurrentMarkersVisible(tempDistancesWithKeys);

  };

  const toggleWall = (row, col) => {
    // if the current location is not a wall then convert it to a wall by changing the color to black and value to -5
    console.log(row, col);
    if (grid[row][col] != -5) {
      const tGrid = grid;
      tGrid[row][col] = -5;
      setGrid([...tGrid]);
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} wall`;
    } else {
      const tGrid = grid;
      tGrid[row][col] = -1;
      setGrid([...tGrid]);
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col}`;
    }
  };

  const onCellEnter = (row, col) => {
    if (isMouseDraggingStartPos) {
      setInitPos({
        ...initializedPosition,
        startRowIndex: row,
        startColIndex: col,
      });
      return;
    } else if (isMouseDraggingEndPos) {
      setInitPos({
        ...initializedPosition,
        endRowIndex: row,
        endColIndex: col,
      });
      return;
    }
    if (isMousePressed) {
      toggleWall(row, col);
    }
  };

  //TODO implement a modal

  const onCellIn = (row, col) => {
    if (
      row == initializedPosition.startRowIndex &&
      col == initializedPosition.startColIndex
    ) {
      setIsMouseDraggingStartPos(true);
      return;
    } else if (
      row == initializedPosition.endRowIndex &&
      col == initializedPosition.endColIndex
    ) {
      setIsMouseDraggingEndPos(true);
      return;
    }
    setIsMousePressed(true);
    toggleWall(row, col);
  };

  const onCellOut = () => {
    if (isMouseDraggingEndPos) {
      setIsMouseDraggingEndPos(false);
    }
    if (isMouseDraggingStartPos) {
      setIsMouseDraggingStartPos(false);
    }
    if (isMousePressed) {
      setIsMousePressed(false);
    }
  };

  const handleClear = () => {
    // history.push("/hello");
    window.location.reload();
  };


  function test() {


    const a = { latitude: 35.450630, longitude: -119.105934 };
    const b = { latitude: 35.450621, longitude: -119.105955 };
    let t= haversineDistance(a, b);
    console.log(t);

  }

  return (
    <div className="container text-center">
      <NumericInput 
      onChange = {(e)=> setCurrentGeoLocation({latitude: e, longitude: currentGeoLocation.longitude})}
      step={0.000001} precision={6} value={currentGeoLocation['latitude']}/>
      <NumericInput 
      onChange = {(e)=> setCurrentGeoLocation({latitude: currentGeoLocation.latitude, longitude: e})}
      
      step={0.000001} precision={6}  value={currentGeoLocation['longitude']}/>

      <div className="row middle2 containerborder">
        <Button
          variant="dark"
          className="solveBtn col-md-3 mx-3"
          onClick={solveTheGrid}
        >
          Find Path
        </Button>
        <Button
          variant="dark"
          className="solveBtn col-md-3 mx-3"
          onClick={test}
        >
          test
        </Button>
        <Button
          variant="dark"
          className="solveBtn col-md-3 mx-3"
          onClick={handleInstructions}
        >
          Instructions
        </Button>
        <Button
          variant="dark"
          className="solveBtn col-md-3 mx-3"
          onClick={handleClear}
        >
          Reset
        </Button>
      </div>
      <div className="gridContainer">
        <div className="grid">
          {grid.map((row, rowIndex) => {
            return row.map((cell, colIndex) => {
              return (
                <div
                  onMouseDown={() => {
                    onCellIn(rowIndex, colIndex);
                  }}
                  onMouseUp={onCellOut}
                  onMouseEnter={() => {
                    onCellEnter(rowIndex, colIndex);
                  }}
                  className={`eachCell node-${rowIndex}-${colIndex}`}
                ></div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
};

export default AlgoVisualizer;
