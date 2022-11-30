import React, { useState, useEffect } from "react";
import "./AlgoVisualizer.css";
import { dijkstraAlgo } from "../../algorithms/dijkstraAlgo";
import { useHistory } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
const baseGrid = [
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
];

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
    tGrid[initializedPosition.startRowIndex][initializedPosition.startColIndex] = 0;
    tGrid[initializedPosition.endRowIndex][initializedPosition.endColIndex] = -10;
    debugger;
    setGrid([...tGrid]);
    const { startRowIndex, startColIndex, endRowIndex, endColIndex } = initializedPosition;
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
  }, [initializedPosition]);

  const changeColor = (row, col, type) => {
    if (
      (row == initializedPosition.startRowIndex && col == initializedPosition.startColIndex) ||
      (row == initializedPosition.endRowIndex && col == initializedPosition.endColIndex)
    ) {
      return;
    }
    if (type == "visual") {
      document.querySelector(
        `.node-${row}-${col}`
      ).className = `eachCell node-${row}-${col} visualCell`;
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

    // Fill path color
    for (let row = 0; row < shortPathList.length; row++) {
      setTimeout(() => {
        const node = shortPathList[row];
        changeColor(node[0], node[1], "path");
      }, 50 * (row + listOfAllNodes.length));
    }
  };

  const toggleWall = (row, col) => {
    // if the current location is not a wall then convert it to a wall by changing the color to black and value to -5
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
      setInitPos({ ...initializedPosition, startRowIndex: row, startColIndex: col });
      return;
    } else if (isMouseDraggingEndPos) {
      setInitPos({ ...initializedPosition, endRowIndex: row, endColIndex: col });
      return;
    }
    if (isMousePressed) {
      toggleWall(row, col);
    }
  };

  //TODO implement a modal

  const onCellIn = (row, col) => {
    if (row == initializedPosition.startRowIndex && col == initializedPosition.startColIndex) {
      setIsMouseDraggingStartPos(true);
      return;
    } else if (row == initializedPosition.endRowIndex && col == initializedPosition.endColIndex) {
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
  return (
    <div className="container text-center">
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
            return row.map((cell, cellIndex) => {
              return (
                <div
                  onMouseDown={() => {
                    onCellIn(rowIndex, cellIndex);
                  }}
                  onMouseUp={onCellOut}
                  onMouseEnter={() => {
                    onCellEnter(rowIndex, cellIndex);
                  }}
                  className={`eachCell node-${rowIndex}-${cellIndex}`}
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
