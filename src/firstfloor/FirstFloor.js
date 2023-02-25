import React, { useState, useEffect } from "react";
import Select from "react-select";
import { dijkstraAlgo } from "../algorithms/dijkstraAlgo";
import { useHistory } from "react-router-dom";
import Button from "react-bootstrap/Button";
import NumericInput from "react-numeric-input";
import { useGeolocated } from "react-geolocated";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import cloneDeep from "lodash/cloneDeep";
import "./firstfloor.css";

const baseGrid = [];
let gridRowLength = 20;
let gridColumnLength = 52;
const haversineDistance = require("geodetic-haversine-distance");
for (var i = 0; i < gridRowLength; i++) {
  baseGrid[i] = [];
  for (var j = 0; j < gridColumnLength; j++) {
    baseGrid[i][j] = -1;
  }
}
let currentLatitude = null;
let currentLongitude = null;

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

const FirstFloor = () => {
  const [grid, setGrid] = useState(baseGrid);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [isMouseDraggingStartPos, setIsMouseDraggingStartPos] = useState(false);
  const [isMouseDraggingEndPos, setIsMouseDraggingEndPos] = useState(false);
  const [currentRotationDegree, setCurrentRotationDegree] = useState(0.0);
  const [selectingPredefinedMarker, setSelectingImage] = useState(false);
  const [currentoptions, setCurrentOptions] = useState([]);
  const [previousGrid, setPreviousGrid] = useState(null);
  const [
    currentSelectedPredefinedMarkers,
    setCurrentSelectedPredefinedMarkers,
  ] = useState({});
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [
    currentGeolocationForPredefinedMarker,
    setcurrentGeolocationForPredefinedMarker,
  ] = useState({
    latitude: "",
    longitude: "",
  });
  const [isCellRoom, setIsCellRoom] = useState(false);
  const [
    currentSelectedPredefinedMarkersCellInformation,
    setCurrentSelectedPredefinedMarkersCellInformation,
  ] = useState({
    row: -1,
    col: -1,
  });
  const [keyValueData, setKeyValueData] = useState(null);
  const [currentName, setCurrentName] = useState("");
  const [currentStartPos, setCurrentStartPos] = useState("");
  const [currentEndPos, setCurrentEndPos] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [show, setShow] = useState(false);
  const [currentStartPositionGeolocation, setCurrentStartPositionGeolocation] =
    useState({
      latitude: "",
      longitude: "",
    });

  const [currentEndPositionGeolocation, setCurrentEndPositionGeolocation] =
    useState({
      latitude: "",
      longitude: "",
    });

  useEffect(() => {
    console.log(
      "currentSelectedPredefinedMarkers",
      currentSelectedPredefinedMarkers
    );
  }, [currentSelectedPredefinedMarkers]);
  const handleClose = () => {
    if (currentSelectedPredefinedMarkersCellInformation.row == -1) {
      setShow(false);
      return;
    }

    if (
      currentGeolocationForPredefinedMarker.latitude == "" ||
      currentGeolocationForPredefinedMarker.longitude == ""
    ) {
      setShow(false);
      return;
    }
    let currentPredefinedInformation = {
      row: currentSelectedPredefinedMarkersCellInformation.row,
      col: currentSelectedPredefinedMarkersCellInformation.col,
      latitude:
        currentGeolocationForPredefinedMarker.latitude != ""
          ? currentGeolocationForPredefinedMarker.latitude
          : 0,
      longitude:
        currentGeolocationForPredefinedMarker.longitude != ""
          ? currentGeolocationForPredefinedMarker.longitude
          : 0,
      image_url: currentImageUrl != "" ? currentImageUrl : "",
      is_target_location: isCellRoom,
      name: currentName != "" ? currentName : "",
    };
    // get the currentSelectedPredefinedMarkers and remove the current cell and replace it with the new one
    let temp = currentSelectedPredefinedMarkers;
    // delete the temp at row and col
    delete temp[
      [
        currentSelectedPredefinedMarkersCellInformation.row,
        currentSelectedPredefinedMarkersCellInformation.col,
      ]
    ];
    temp[
      [
        currentSelectedPredefinedMarkersCellInformation.row,
        currentSelectedPredefinedMarkersCellInformation.col,
      ]
    ] = currentPredefinedInformation;
    setCurrentSelectedPredefinedMarkers(temp);

    setCurrentSelectedPredefinedMarkersCellInformation({
      row: -1,
      col: -1,
    });
    setcurrentGeolocationForPredefinedMarker({
      latitude: "",
      longitude: "",
    });
    setCurrentImageUrl("");
    setIsCellRoom(false);
    setShow(false);
    setCurrentName("");
  };

  const handleShow = (row, col) => {
    // use a filter to find a value in the currentSelectedPredefinedMarkers with row and col
    if (currentSelectedPredefinedMarkers[[row, col]] != undefined) {
      if (
        currentSelectedPredefinedMarkers[[row, col]].latitude != "" ||
        currentSelectedPredefinedMarkers[[row, col]].latitude != 0
      ) {
        setcurrentGeolocationForPredefinedMarker({
          latitude: currentSelectedPredefinedMarkers[[row, col]].latitude,
          longitude: currentSelectedPredefinedMarkers[[row, col]].longitude,
        });
        let temp = currentSelectedPredefinedMarkers[[row, col]];
        setIsCellRoom(temp.is_target_location);
        setCurrentImageUrl(
          currentSelectedPredefinedMarkers[[row, col]].image_url
        );
        setCurrentName(currentSelectedPredefinedMarkers[[row, col]].name);
      }
    }
    setShow(true);
  };
  useEffect(() => {
    console.log(
      "currentSelectedPredefinedMarkers",
      currentSelectedPredefinedMarkers
    );
  }, [currentSelectedPredefinedMarkers]);

  const [selectingRoom, setSelectingRoom] = useState(false);
  const [selectingWall, setSelectingWall] = useState(false);
  const [plottingGeolocation, setPlottingGeolocation] = useState(false);

  const {
    coords,
    timestamp,
    isGeolocationAvailable,
    isGeolocationEnabled,
    getPosition,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  });

  function getCurrentGeoLocation() {
    if (coords) {
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    }
    console.log("Geolocation is not available");
  }

  function buttonFunctionToGetCurrentLocation() {
    getPosition();
    console.log("new coords" + coords.latitude + " " + coords.longitude);
    setCurrentTimestamp(timestamp);
    // setcurrentGeolocationForPredefinedMarker({
    //   latitude: currentGeoLocation.latitude,
    //   longitude: currentGeoLocation.longitude,
    // });
    setcurrentGeolocationForPredefinedMarker({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }

  const [initializedPosition, setInitPos] = useState({
    startRowIndex: gridRowLength - 1,
    startColIndex: gridColumnLength - 1,
    endRowIndex: gridRowLength - 1,
    endColIndex: gridColumnLength - 1,
  });
  const [previous, setPrevious] = useState(null);
  const [sortedMarkers, setSortedMarkers] = useState([]);
  const [currentGeoLocation, setCurrentGeoLocation] = useState({
    latitude: 35.45063,
    longitude: -119.105934,
  });
  const [currentMarkersVisible, setCurrentMarkersVisible] = useState([]);

  // const [show, setShow] = useState(false);

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

  const saveGrid = () => {
    // create a json file with the grid and images as keys
    let target_locations = [];
    let markers = [];
    // filter out currentSelectedPredefinedMarkers if the is_target_location is true
    for (let key in currentSelectedPredefinedMarkers) {
      if (currentSelectedPredefinedMarkers[key].is_target_location) {
        target_locations.push(currentSelectedPredefinedMarkers[key]);
      } else {
        markers.push(currentSelectedPredefinedMarkers[key]);
      }
    }
    let walls = [];
    // for row col in grid
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        // if grid[row][col] == 1
        if (grid[row][col] == "WALL") {
          // add to walls
          walls.push({ row, col });
        }
      }
    }
    const gridString = JSON.stringify({
      gridRowLength,
      gridColumnLength,
      target_locations,
      markers,
      walls,
    });
    const element = document.createElement("a");
    const file = new Blob([gridString], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "grid.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  // create a function to load the grid from a text file using stringified JSON
  useEffect(() => {
    if (navigator.geolocation) {
      // Call showPosition() once initially to get the current location
      navigator.geolocation.getCurrentPosition(showPosition);
      // Set an interval to call getCurrentPosition() every 1 second
      const intervalId = setInterval(() => {
        console.log("new geolocations");
        navigator.geolocation.getCurrentPosition(showPosition);
      }, 1000);
      // Return a cleanup function to clear the interval when the component unmounts
      return () => clearInterval(intervalId);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }, []);
  function showPosition(position) {
    const lat = position.coords.latitude.toFixed(9);
    const long = position.coords.longitude.toFixed(9);
    currentLatitude = lat;
    currentLongitude = long;
    setCurrentGeoLocation({
      latitude: lat,
      longitude: long,
    });
    console.log(`Latitude: ${lat}, Longitude: ${long}`);
  }
  const loadGrid = () => {
    const fileInput = document.querySelector('input[type="file"]');
    const reader = new FileReader();
    let jsonFileContent = null;
    reader.onload = (event) => {
      jsonFileContent = JSON.parse(event.target.result);
      // let tempGrid = jsonFileContent.grid;
      let markers = jsonFileContent.markers;
      let target_locations = jsonFileContent.target_locations;
      let walls = jsonFileContent.walls;
      let currentGridRowLength = jsonFileContent.gridRowLength;
      let currentGridColumnLength = jsonFileContent.gridColumnLength;
      gridRowLength = currentGridRowLength;
      gridColumnLength = currentGridColumnLength;
      // set the values of the grid, images, walls and target_locations with the content of the json file
      let tempGrid = [];
      // create a matrix with -1's with gridRowLength and cols
      for (let row = 0; row < currentGridRowLength; row++) {
        tempGrid.push([]);
        for (let col = 0; col < currentGridColumnLength; col++) {
          tempGrid[row].push(-1);
        }
      }

      for (let i = 0; i < walls.length; i++) {
        let row = walls[i].row;
        let col = walls[i].col;
        console.log(row, col);
        tempGrid[row][col] = "WALL";
        document.querySelector(
          `.node-${row}-${col}`
        ).className = `eachCell node-${row}-${col} wall`;
      }
      let currentTempKeyValue = {};
      for (let i = 0; i < target_locations.length; i++) {
        let key =
          target_locations[i].name +
          " " +
          target_locations[i].row +
          "," +
          target_locations[i].col;
        let row = target_locations[i].row;
        let col = target_locations[i].col;
        // tempGrid[row][col] = "ROOM";
        document.querySelector(
          `.node-${row}-${col}`
        ).className = `eachCell node-${row}-${col} room`;
        currentTempKeyValue[key] = target_locations[i];
      }
      for (let i = 0; i < markers.length; i++) {
        let row = markers[i].row;
        let col = markers[i].col;
        let key = markers[i].row + "," + markers[i].col;
        document.querySelector(
          `.node-${row}-${col}`
        ).className = `eachCell node-${row}-${col} marker`;
        currentTempKeyValue[key] = markers[i];
      }
      let merge = [];
      let tempcurrentselectedpredefinedmarkers = {};
      merge = [...target_locations, ...markers];
      for (let i = 0; i < merge.length; i++) {
        tempcurrentselectedpredefinedmarkers[[merge[i].row, merge[i].col]] =
          merge[i];
      }

      setKeyValueData({ ...currentTempKeyValue });
      setGrid([...tempGrid]);
      // setCurrentSelectedPredefinedMarkers(
      //   ...tempcurrentselectedpredefinedmarkers
      // );
      setCurrentSelectedPredefinedMarkers({
        ...tempcurrentselectedpredefinedmarkers,
      });
    };

    reader.readAsText(fileInput.files[0]); // read the file content as text
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

  useEffect(() => {
    console.log(grid);
  }, [grid]);

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

  function getDirections(tempNodes) {
    let next = null;
    for (let i = 0; i < tempNodes.length - 1; i++) {
      if (i == 0) {
        let [row1, col1] = [tempNodes[i].row, tempNodes[i].col];
        let [row2, col2] = [tempNodes[i + 1].row, tempNodes[i + 1].col];
        if (row1 == row2) {
          if (col1 < col2) {
            tempNodes[i].direction = "right";
          } else {
            tempNodes[i].direction = "left";
          }
        } else if (col1 == col2) {
          if (row1 < row2) {
            tempNodes[i].direction = "down";
          } else {
            tempNodes[i].direction = "up";
          }
        }
      } else {
        let [row1, col1] = [tempNodes[i].row, tempNodes[i].col];
        let [row2, col2] = [tempNodes[i + 1].row, tempNodes[i + 1].col];
        if (tempNodes[i - 1].direction == "right") {
          if (row1 == row2) {
            if (col1 < col2) {
              tempNodes[i].direction = "right";
              tempNodes[i].userDirection = "";
            } else {
              tempNodes[i].direction = "left";
              tempNodes[i].userDirection = "";
            }
          } else if (col1 == col2) {
            if (row1 < row2) {
              tempNodes[i].direction = "down";
              tempNodes[i].userDirection = "right";
            } else {
              tempNodes[i].direction = "up";
              tempNodes[i].userDirection = "left";
            }
          }
        } else if (tempNodes[i - 1].direction == "left") {
          if (row1 == row2) {
            if (col1 < col2) {
              tempNodes[i].direction = "right";
              tempNodes[i].userDirection = "";
            } else {
              tempNodes[i].direction = "left";
              tempNodes[i].userDirection = "";
            }
          } else if (col1 == col2) {
            if (row1 < row2) {
              tempNodes[i].direction = "down";
              tempNodes[i].userDirection = "left";
            } else {
              tempNodes[i].direction = "up";
              tempNodes[i].userDirection = "right";
            }
          }
        } else if (tempNodes[i - 1].direction == "up") {
          if (row1 == row2) {
            if (col1 < col2) {
              tempNodes[i].direction = "right";
              tempNodes[i].userDirection = "right";
            } else {
              tempNodes[i].direction = "left";
              tempNodes[i].userDirection = "left";
            }
          } else if (col1 == col2) {
            if (row1 < row2) {
              tempNodes[i].direction = "down";
              tempNodes[i].userDirection = "";
            } else {
              tempNodes[i].direction = "up";
              tempNodes[i].userDirection = "";
            }
          }
        } else if (tempNodes[i - 1].direction == "down") {
          if (row1 == row2) {
            if (col1 < col2) {
              tempNodes[i].direction = "right";
              tempNodes[i].userDirection = "left";
            } else {
              tempNodes[i].direction = "left";
              tempNodes[i].userDirection = "right";
            }
          } else if (col1 == col2) {
            if (row1 < row2) {
              tempNodes[i].direction = "down";
              tempNodes[i].userDirection = "";
            } else {
              tempNodes[i].direction = "up";
              tempNodes[i].userDirection = "";
            }
          }
        }
      }
    }
    return tempNodes;
  }
  useEffect(() => {
    //console.log("currentoptions", currentoptions);
    // use the values of currentSelectedPredefinedMarkers to set the currentoptions
    let temp = [];
    for (var key in currentSelectedPredefinedMarkers) {
      temp.push({
        value: key,
        label: currentSelectedPredefinedMarkers[key].name + " " + key,
      });
    }
    setCurrentOptions([...temp]);
  }, [currentSelectedPredefinedMarkers]);

  useEffect(() => {
    console.log("currentoptions", currentoptions);
  }, [currentoptions]);
  useEffect(() => {
    console.log(initializedPosition);
  }, [initializedPosition]);

  const solveTheGrid = () => {
    // make a deep copy of the grid
    let deep_clone_grid = cloneDeep(grid);
    setPreviousGrid(deep_clone_grid);

    const [shortPathList, listOfAllNodes, solvedGrid] = dijkstraAlgo(
      grid,
      initializedPosition
    );
    setGrid(solvedGrid);
    // create nodes with row and col as well as direction from the shortPathList
    let tempNodes = [];
    for (let i = 0; i < shortPathList.length; i++) {
      let [row, col] = shortPathList[i];
      tempNodes.push({
        key: i + 1,
        row: row,
        col: col,
        direction: null,
        userDirection: "",
      });
    }

    let sortedNodes = tempNodes.sort((a, b) => a.key - b.key);
    // remove the last node
    let nodes = getDirections(sortedNodes);
    nodes = nodes.sort((a, b) => a.key - b.key);
    let last_node = nodes[nodes.length - 1];
    // check the last node and set the direction using the start node
    if (last_node.direction == "right") {
      if (last_node.col < initializedPosition.col) {
        last_node.userDirection = "left";
      } else {
        last_node.userDirection = "right";
      }
    } else if (last_node.direction == "left") {
      if (last_node.col < initializedPosition.col) {
        last_node.userDirection = "left";
      } else {
        last_node.userDirection = "right";
      }
    } else if (last_node.direction == "up") {
      if (last_node.row < initializedPosition.row) {
        last_node.userDirection = "left";
      }
      if (last_node.row > initializedPosition.row) {
        last_node.userDirection = "right";
      }
    } else if (last_node.direction == "down") {
      if (last_node.row < initializedPosition.row) {
        last_node.userDirection = "right";
      }
      if (last_node.row > initializedPosition.row) {
        last_node.userDirection = "left";
      }
    }
    for (let row = 0; row < listOfAllNodes.length; row++) {
      setTimeout(() => {
        const node = listOfAllNodes[row];
        changeColor(node[0], node[1], "visual");
      }, 1 * row);
    }

    // filter currentSelectedPredefinedMarkers with is_target_location false
    let temp = {};
    for (var key in currentSelectedPredefinedMarkers) {
      if (currentSelectedPredefinedMarkers[key].is_target_location == false) {
        temp[key] = currentSelectedPredefinedMarkers[key];
      }
    }

    for (let row = 0; row < nodes.length; row++) {
      setTimeout(() => {
        const node = nodes[row];

        changeColor(node.row, node.col, "path");

        if (row != node.length - 1) {
          if (temp[[node.row, node.col]] != undefined) {
            if (node.userDirection == "") {
              node.userDirection = "keep straight";
            }
            document.querySelector(
              `.node-${node.row}-${node.col}`
            ).innerHTML = `<div class="text">${node.userDirection}</div>`;
          }

          document.querySelector(
            `.node-${node.row}-${node.col}`
          ).innerHTML = `<div class="text">${node.userDirection}</div>`;
        }
      }, 1 * (row + listOfAllNodes.length));
    }
  };

  const toggleWall = (row, col) => {
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
  const togglePredefinedMarker = (row, col) => {
    if (
      currentSelectedPredefinedMarkers[[row, col]] &&
      window.confirm("Are you sure you want to delete this marker?")
    ) {
      const temp = currentSelectedPredefinedMarkers;
      delete temp[[row, col]];
      setCurrentSelectedPredefinedMarkers({ ...temp });
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col}`;

      return;
    }

    // create a modal
    setCurrentSelectedPredefinedMarkersCellInformation({ row: row, col: col });
    handleShow(row, col);
    document.querySelector(
      `.node-${row}-${col}`
    ).className = `eachCell node-${row}-${col} marker`;
  };

  useEffect(() => {
    console.log(
      "currentSelectedPredefinedMarkers",
      currentSelectedPredefinedMarkers
    );
  }, [currentSelectedPredefinedMarkers]);

  const selectARoomButton = () => {
    setSelectingRoom(!selectingRoom);
    setSelectingWall(false);
    setSelectingImage(false);
  };
  const selectAWallButton = () => {
    setSelectingWall(!selectingWall);
    setSelectingRoom(false);
    setSelectingImage(false);
  };
  const selectAPredefinedMarker = () => {
    setSelectingImage(!selectingPredefinedMarker);
    setSelectingRoom(false);
    setSelectingWall(false);
  };
  const plottingGeolocationButton = () => {
    setPlottingGeolocation(!plottingGeolocation);
    setSelectingRoom(false);
    setSelectingWall(false);
    setSelectingImage(false);
  };
  // useEffect(()=>{
  //   console.log("selectingPredefinedMarker",selectingPredefinedMarker)

  // },[selectingPredefinedMarker])
  useEffect(() => {}, [selectingRoom]);
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
    setIsMousePressed(true);
    if (selectingRoom) {
      toggleRoom(row, col);
    } else if (selectingWall) {
      toggleWall(row, col);
    } else if (selectingPredefinedMarker) {
      togglePredefinedMarker(row, col);
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
    for (let row = 0; row < previousGrid.length; row++) {
      for (let col = 0; col < previousGrid[0].length; col++) {
        if (previousGrid[row][col] == "WALL") {
          document.querySelector(
            `.node-${row}-${col}`
          ).className = `eachCell node-${row}-${col} wall`;
        } else {
          document.querySelector(
            `.node-${row}-${col}`
          ).className = `eachCell node-${row}-${col}`;
        }
        document.querySelector(`.node-${row}-${col}`).innerHTML = ``;
      }
    }
    // for currentSelectedPredefinedMarkers
    for (let key in currentSelectedPredefinedMarkers) {
      let [row, col] = key.split(",");

      if (currentSelectedPredefinedMarkers[key].is_target_location == true) {
        document.querySelector(
          `.node-${row}-${col}`
        ).className = `eachCell node-${row}-${col} room`;
      } else if (
        currentSelectedPredefinedMarkers[key].is_target_location == false
      ) {
        document.querySelector(
          `.node-${row}-${col}`
        ).className = `eachCell node-${row}-${col} marker`;
      }
    }

    setGrid(previousGrid);
  };

  useEffect(() => {
    console.log(
      "current start geolocation latitude" +
        currentStartPositionGeolocation.latitude
    );
    console.log(
      "current start geolocation longitude" +
        currentStartPositionGeolocation.longitude
    );
  }, [currentStartPositionGeolocation]);

  useEffect(() => {
    console.log(
      "current end geolocation latitude" +
        currentEndPositionGeolocation.latitude
    );
    console.log(
      "current End geolocation longitude" +
        currentEndPositionGeolocation.longitude
    );
  }, [currentEndPositionGeolocation]);

  function test() {
    const a = { latitude: 35.45063, longitude: -119.105934 };
    const b = { latitude: 35.450621, longitude: -119.105955 };
    let t = haversineDistance(a, b);
    //console.log(t);
  }

  function computeDistanceBetweenTwoPoints() {
    alert(
      haversineDistance(
        currentStartPositionGeolocation,
        currentEndPositionGeolocation
      )
    );
  }
  useEffect(() => {
    console.log("isCellRoom", isCellRoom);
    console.log("currentImageUrl", currentImageUrl);
  }, [isCellRoom, currentImageUrl]);

  let currentStartGeolocationVariable = null;
  let currentEndGeolocationVariable = null;

  useEffect(() => {
    console.log("keyValues", keyValueData);
  }, [keyValueData]);
  let rotationDegree = "180";
  return (
    <>
      {" "}
      current geolocation: latitude: {
        currentGeoLocation.latitude
      } longitude: {currentGeoLocation.longitude} latest time stamp:{" "}
      {currentTimestamp}
      {/* convert epoch time to human readable with my timezon  */}
      {" \n"}
      {"global latitude variable " + currentLatitude}
      {"global longitude variable " + currentLongitude}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>add Geolocation or image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* button to use the get current geolocation */}
          <Button onClick={buttonFunctionToGetCurrentLocation}>
            Plot to cell current Geolocation
          </Button>
          <div>
            current geolocation:{" "}
            {currentGeolocationForPredefinedMarker.latitude}, ,{" "}
            {currentGeolocationForPredefinedMarker.longitude}
          </div>
          {/* input from modal with button called save
           */}
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>image url</Form.Label>
              <Form.Control
                onChange={(e) => setCurrentImageUrl(e.target.value)}
                placeholder={currentImageUrl}
                autoFocus
              />
            </Form.Group>
          </Form>
          <Form>
            {["checkbox"].map((type) => (
              <div key={`default-${type}`} className="mb-3">
                <Form.Check
                  checked={isCellRoom}
                  onChange={(e) => setIsCellRoom(e.target.checked)}
                  type={type}
                  id={`default-${type}`}
                  label={`is target location`}
                />
              </div>
            ))}
          </Form>{" "}
          {isCellRoom ? (
            <Form>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>name</Form.Label>
                <Form.Control
                  onChange={(e) => setCurrentName(e.target.value)}
                  placeholder={currentName}
                  autoFocus
                />
              </Form.Group>
            </Form>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary">Understood</Button>
        </Modal.Footer>
      </Modal>
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

          {/* <Button onClick={selectARoomButton}>Plot a room</Button> */}
          <Button onClick={selectAWallButton}>Plot a wall</Button>
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
          <Button onClick={selectAPredefinedMarker}>
            Plot an Predefined Marker
          </Button>
          <div>select start location: {currentStartPos} </div>
          <Select
            style={{ width: "100px", color: "black" }}
            placeholder="select start location"
            options={currentoptions}
            onChange={(e) => {
              console.log(e);
              // split the e.value using , to get the current row and col
              let row = parseInt(e.value.split(",")[0]);
              let col = parseInt(e.value.split(",")[1]);
              setCurrentStartPos(e.label);
              setInitPos({
                startRowIndex: initializedPosition.startRowIndex,
                startColIndex: initializedPosition.startColIndex,
                endRowIndex: row,
                endColIndex: col,
              });
            }}
          />

          <div>select destination location: {currentEndPos} </div>

          <Select
            style={{ width: "100px", color: "black" }}
            placeholder="select start location"
            options={currentoptions}
            value={currentEndPos}
            onChange={(e) => {
              console.log(e);
              // split the e.value using , to get the current row and col
              let row = parseInt(e.value.split(",")[0]);
              let col = parseInt(e.value.split(",")[1]);
              setCurrentEndPos(e.label);
              setInitPos({
                startRowIndex: row,
                startColIndex: col,
                endRowIndex: initializedPosition.endRowIndex,
                endColIndex: initializedPosition.endColIndex,
              });
            }}
          />

          <div>
            select start geo location: {currentStartGeolocationVariable}
          </div>
          <Select
            style={{ width: "100px", color: "black" }}
            placeholder="select geolocation start location"
            options={currentoptions}
            onChange={(e) => {
              if (
                e.label.length === 3 ||
                e.label.length === 4 ||
                e.label.length === 5 ||
                e.label.length === 6
              ) {
                e.label = e.label.replace(/\s/g, "");
              }
              setCurrentStartPositionGeolocation({
                latitude: keyValueData[e.label].latitude,
                longitude: keyValueData[e.label].longitude,
              });
              let row = keyValueData[e.label].row;
              let col = keyValueData[e.label].col;
              document.querySelector(
                `.node-${row}-${col}`
              ).className = `eachCell node-${row}-${col} start`;
            }}
          />
          <div>select end geo location: {currentEndPos} </div>
          <Select
            style={{ width: "100px", color: "black" }}
            placeholder="select geolocation start location"
            options={currentoptions}
            onChange={(e) => {
              // remove whitespace in e.label;
              // if length of label is 2 or 3 then
              if (
                e.label.length === 3 ||
                e.label.length === 4 ||
                e.label.length === 5 ||
                e.label.length === 6
              ) {
                e.label = e.label.replace(/\s/g, "");
              }
              setCurrentEndPositionGeolocation({
                latitude: keyValueData[e.label].latitude,
                longitude: keyValueData[e.label].longitude,
              });
              let row = keyValueData[e.label].row;
              let col = keyValueData[e.label].col;
              document.querySelector(
                `.node-${row}-${col}`
              ).className = `eachCell node-${row}-${col} end`;
            }}
          />
          <Button
            variant="dark"
            className="solveBtn col-md-3 mx-3"
            onClick={computeDistanceBetweenTwoPoints}
          >
            get distance
          </Button>
        </div>

        <div
          className="gridContainer"
          style={{
            transform: "rotate(" + currentRotationDegree + "deg)",
          }}
        >
          <div className="grid2">
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
    </>
  );
};

export default FirstFloor;
