import React, { useState, useEffect } from "react";
import "./AlgoVisualizer.css";
import { dijkstraAlgo } from "../../algorithms/dijkstraAlgo";
import { useHistory } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import NumericInput from "react-numeric-input";

const baseGrid = [];
const rows = 30;
const columns = 40;
const haversineDistance = require("geodetic-haversine-distance");
for (var i = 0; i < rows; i++) {
  baseGrid[i] = [];
  for (var j = 0; j < columns; j++) {
    baseGrid[i][j] = -1;
  }
}
const predefinedTextVisuals = {};
predefinedTextVisuals[[1, 9]] = {
  direction: "Head Straight",
  lat: 35.45063,
  long: -119.105934,
};
predefinedTextVisuals[[3, 9]] = {
  direction: "Keep Head Straight",
  lat: 35.450621,
  long: -119.105955,
};
predefinedTextVisuals[[8, 9]] = {
  direction: "Turn Left",
  lat: 35.450756,
  long: -119.10619,
};


// //console.log(baseGrid);

const AlgoVisualizer = () => {
  const [grid, setGrid] = useState(baseGrid);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [isMouseDraggingStartPos, setIsMouseDraggingStartPos] = useState(false);
  const [isMouseDraggingEndPos, setIsMouseDraggingEndPos] = useState(false);
  const [currentRotationDegree, setCurrentRotationDegree] = useState(0.0);

  const [selectingRoom, setSelectingRoom] = useState(false);
  const [selectingWall, setSelectingWall] = useState(false);

  const [initializedPosition, setInitPos] = useState({
    startRowIndex: 4,
    startColIndex: 7,
    endRowIndex: 4,
    endColIndex: 15,
  });
  const [previous, setPrevious] = useState(null);
  const [sortedMarkers, setSortedMarkers] = useState([]);
  const [currentGeoLocation, setCurrentGeoLocation] = useState({
    latitude: 35.45063,
    longitude: -119.105934,
  });
  const [currentMarkersVisible, setCurrentMarkersVisible] = useState([]);

  const [show, setShow] = useState(false);


  useEffect(() => {
    const tempGrid = grid;
    let prevStartRowIndex = 0,
      prevStartColIndex = 0;
    let prevEndRowIndex = 0,
      prevEndColIndex = 0;
    // safety initializationOfStart and end
    for (let row = 0; row < tempGrid.length; row++) {
      for (let col = 0; col < tempGrid[row].length; col++) {
        if (tempGrid[row][col] == 0) {
          prevStartRowIndex = row;
          prevStartColIndex = col;
        } else if (tempGrid[row][col] == -50) {
          prevEndRowIndex = row;
          prevEndColIndex = col;
        }
      }
    }

    tempGrid[prevStartRowIndex][prevStartColIndex] = -1;
    tempGrid[prevEndRowIndex][prevEndColIndex] = -1;

    tempGrid[initializedPosition.startRowIndex][
      initializedPosition.startColIndex
    ] = 0;
    tempGrid[initializedPosition.endRowIndex][initializedPosition.endColIndex] =
      -50;
    const { startRowIndex, startColIndex, endRowIndex, endColIndex } =
      initializedPosition;
    document.querySelector(
      `.node-${prevStartRowIndex}-${prevStartColIndex}`
    ).className = `eachCell node-${prevStartRowIndex}-${prevStartColIndex}`;
    document.querySelector(
      `.node-${prevEndRowIndex}-${prevEndColIndex}`
    ).className = `eachCell node-${prevEndRowIndex}-${prevEndColIndex}`;
    document.querySelector(
      `.node-${startRowIndex}-${startColIndex}`
    ).className = `eachCell node-${startRowIndex}-${startColIndex} start`;
    document.querySelector(
      `.node-${endRowIndex}-${endColIndex}`
    ).className = `eachCell node-${endRowIndex}-${endColIndex} end`;

  
    setGrid([...tempGrid]);
  }, [initializedPosition]);

  useEffect(() => {
    const tempGrid = grid;
    //console.log(tempGrid);
    // save the current grid in the local storage
    localStorage.setItem("grid", JSON.stringify(tempGrid));
  }, [grid]);

  // create a function to save the grid to a text file using stringified JSON
  const saveGrid = () => {
    const gridString = JSON.stringify(grid);
    const element = document.createElement("a");
    const file = new Blob([gridString], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "grid.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  // create a function to load the grid from a text file using stringified JSON
  const loadGrid = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      const tempGrid = JSON.parse(text);
      // loop over the tempGrid and change the color of WALL and ROOM
      for (let row = 0; row < tempGrid.length; row++) {
        for (let col = 0; col < tempGrid[row].length; col++) {
          if (tempGrid[row][col] == "WALL") {
            document.querySelector(
              `.node-${row}-${col}`
            ).className = `eachCell node-${row}-${col} wall`;
          } else if (tempGrid[row][col] == "ROOM") {
            document.querySelector(
              `.node-${row}-${col}`
            ).className = `eachCell node-${row}-${col} room`;
          }
        
        }
      }
      setGrid([...tempGrid]);
    };
    reader.readAsText(file);
  };

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
    } else if (type == "currentmarker") {
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} selectedMarker zoomIn`;
    } else if (type == "ROOM") {
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} room`;
    } else {
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} pathCell`;
    }
  };

  const handleInstructions = () => {
    alert(
      "'Green Grid' -> starting point \n'Red Grid'-> endpoint \n  1️⃣ Drag the green or red grid to your desired location on the grid. \n  2️⃣ Click and drag your mouse to the empty cells to mark them as a wall.\n  3️⃣ Click the 'Find Path' button. ✨  "
    );
  };

  function getClosestMarkers() {
    let closestMarkers = [];
    let tempCurrentMarkersVisible = [];
    // for currentMarkersVisible
    for (let i = 0; i < currentMarkersVisible.length; i++) {
      let [row, col] = currentMarkersVisible[i];
      let lat = predefinedTextVisuals[[row, col]]["lat"];
      let long = predefinedTextVisuals[[row, col]]["long"];
      let markerGeoLocation = { latitude: lat, longitude: long };

      let distanceBetweenCurrentPosAndMarker = haversineDistance(
        currentGeoLocation,
        markerGeoLocation
      );
      tempCurrentMarkersVisible.push([row, col]);
      closestMarkers.push([distanceBetweenCurrentPosAndMarker, [row, col]]);
    }
    setCurrentMarkersVisible(tempCurrentMarkersVisible);
    closestMarkers.sort((a, b) => a[0] - b[0]);
    return closestMarkers;
  }
  useEffect(() => {
    if (currentMarkersVisible.length == 0) {
      return;
    }

    let closestMarkers = getClosestMarkers();
    let currentTopMarker = closestMarkers[0];
    if (previous != null && currentTopMarker[1] == previous) {
      return;
    }
    if (previous != null) {
      let [prevRow, prevCol] = previous;
      changeColor(prevRow, prevCol, "marker");
    }
    let [row, col] = currentTopMarker[1];
    changeColor(row, col, "currentmarker");
    //console.log(currentGeoLocation);
    setPrevious(currentTopMarker[1]);
  }, [currentGeoLocation]);

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
      }, 1 * row);
    }
    let tempDistancesWithKeys = [];
    // Fill path color
    for (let row = 0; row < shortPathList.length; row++) {
      setTimeout(() => {
        const node = shortPathList[row];
        if ([node[0], node[1]] in predefinedTextVisuals) {
          changeColor(node[0], node[1], "marker");
          //console.log(predefinedTextVisuals[[node[0], node[1]]]["direction"]);

          tempDistancesWithKeys.push([node[0], node[1]]);
        } else {
          changeColor(node[0], node[1], "path");
        }
      }, 1 * (row + listOfAllNodes.length));
    }
    setCurrentMarkersVisible(tempDistancesWithKeys);
  };

  const toggleWall = (row, col) => {
    // if the current location is not a wall then convert it to a wall by changing the color to black and value to "WALL"
    //console.log(row, col);
    if (grid[row][col] != "WALL") {
      const tempGrid = grid;
      tempGrid[row][col] = "WALL";
      setGrid([...tempGrid]);
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} wall`;
    } else {
      const tempGrid = grid;
      tempGrid[row][col] = -1;
      setGrid([...tempGrid]);
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col}`;
    }
  };

  const toggleRoom = (row, col) => {
    // if the current location is not a room then convert it to a room by changing the color to blue and value to "ROOM"
    //console.log(row, col);
    if (grid[row][col] != "ROOM") {
      const tempGrid = grid;
      tempGrid[row][col] = "ROOM";
      setGrid([...tempGrid]);
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} room`;
    } else {
      const tempGrid = grid;
      tempGrid[row][col] = -1;
      setGrid([...tempGrid]);
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col}`;
    }
  };

  const selectARoomButton = () => {
    setSelectingRoom(!selectingRoom);
    setSelectingWall(false);
  };
  const selectAWallButton = () => {
    setSelectingRoom(false);
    setSelectingWall(!selectingWall);
  };
  useEffect (() => {
    //console.log("selecting room", selectingRoom);

  }, [selectingRoom])
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
      if (selectingRoom) {
        toggleRoom(row, col);
      } else if (selectingWall) {
        toggleWall(row, col);
      }
    }
  };

  //TODO implement a modal
  
  const onCellIn = (row, col) => {
    console.log("mouse enter", row, col);

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
    ;
    setIsMousePressed(true);
    if (selectingRoom) {
      toggleRoom(row, col);
    } else if (selectingWall) {
      toggleWall(row, col);
    }
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
    const a = { latitude: 35.45063, longitude: -119.105934 };
    const b = { latitude: 35.450621, longitude: -119.105955 };
    let t = haversineDistance(a, b);
    //console.log(t);
  }

  let rotationDegree = "180";
  return (
    <div className="container text-center">
      <NumericInput
        onChange={(e) =>
          setCurrentGeoLocation({
            latitude: e,
            longitude: currentGeoLocation.longitude,
          })
        }
        step={0.000001}
        precision={6}
        value={currentGeoLocation["latitude"]}
      />
      <NumericInput
        onChange={(e) =>
          setCurrentGeoLocation({
            latitude: currentGeoLocation.latitude,
            longitude: e,
          })
        }
        step={0.000001}
        precision={6}
        value={currentGeoLocation["longitude"]}
      />

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

        <Button onClick={selectARoomButton}>
          Plot a room
        </Button>
        <Button onClick={selectAWallButton}>
          Plot a wall
        </Button>
        <Button
          variant="dark"
          className="solveBtn col-md-3 mx-3"
          onClick={saveGrid}
        >
          Save Grid
        </Button>
        {/* make a button to use the loadGrid function */}
        <input type="file" onChange={loadGrid} />

        <Button
          variant="dark"
          className="solveBtn col-md-3 mx-3"
          onClick={handleClear}
        >
          Reset
        </Button>
      </div>

      <div
        className="gridContainer"
        style={{
          transform: "rotate(" + currentRotationDegree + "deg)",
        }}
      >
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
