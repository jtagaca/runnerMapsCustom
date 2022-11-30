import { Queue } from '../Queue/Queue';


export const dijkstraAlgo = (grid, initPos) => {
    const {startRowIndex, startColIndex, endRowIndex, endColIndex} = initPos;
    debugger;

    const listOfAllNodes = [];
    const tGrid = grid;
    const queue = new Queue();
    queue.enqueue([startRowIndex, startColIndex]);
    listOfAllNodes.push([startRowIndex, startColIndex]);

    while (!queue.isEmpty()) {
        const [currentRowIdx, currentColIdx] = queue.dequeue();

        // as long as it is in bounds and not equal to a wall then add it to the queue
        //UP
        if (currentRowIdx != 0 && tGrid[currentRowIdx - 1][currentColIdx] != -5) {
            if (tGrid[currentRowIdx - 1][currentColIdx] == -10) {
                tGrid[currentRowIdx - 1][currentColIdx] = tGrid[currentRowIdx][currentColIdx] + 1;
                break;
            }
            else if (tGrid[currentRowIdx - 1][currentColIdx] == -1) {
                tGrid[currentRowIdx - 1][currentColIdx] = tGrid[currentRowIdx][currentColIdx] + 1;
                queue.enqueue([currentRowIdx - 1, currentColIdx]);
                listOfAllNodes.push([currentRowIdx - 1, currentColIdx]);
            }
            else { tGrid[currentRowIdx - 1][currentColIdx] = Math.min(tGrid[currentRowIdx - 1][currentColIdx], tGrid[currentRowIdx][currentColIdx] + 1) }
        }

        //DOWN
        if (currentRowIdx != 9 && tGrid[currentRowIdx + 1][currentColIdx] != -5) {
            if (tGrid[currentRowIdx + 1][currentColIdx] == -10) {
                tGrid[currentRowIdx + 1][currentColIdx] = tGrid[currentRowIdx][currentColIdx] + 1;
                break;
            }
            else if (tGrid[currentRowIdx + 1][currentColIdx] == -1) {
                tGrid[currentRowIdx + 1][currentColIdx] = tGrid[currentRowIdx][currentColIdx] + 1;
                queue.enqueue([currentRowIdx + 1, currentColIdx]);
                listOfAllNodes.push([currentRowIdx + 1, currentColIdx]);
            }
            else { tGrid[currentRowIdx + 1][currentColIdx] = Math.min(tGrid[currentRowIdx + 1][currentColIdx], tGrid[currentRowIdx][currentColIdx] + 1) }
        }

        //LEFT
        if (currentColIdx != 0 && tGrid[currentRowIdx][currentColIdx - 1] != -5) {
            if (tGrid[currentRowIdx][currentColIdx - 1] == -10) {
                tGrid[currentRowIdx][currentColIdx - 1] = tGrid[currentRowIdx][currentColIdx] + 1;
                break;
            }
            else if (tGrid[currentRowIdx][currentColIdx - 1] == -1) {
                tGrid[currentRowIdx][currentColIdx - 1] = tGrid[currentRowIdx][currentColIdx] + 1;
                queue.enqueue([currentRowIdx, currentColIdx - 1]);
                listOfAllNodes.push([currentRowIdx, currentColIdx - 1]);
            }
            else { tGrid[currentRowIdx][currentColIdx - 1] = Math.min(tGrid[currentRowIdx][currentColIdx - 1], tGrid[currentRowIdx][currentColIdx] + 1) }
        }

        //RIGHT
        if (currentColIdx != 9 && tGrid[currentRowIdx][currentColIdx + 1] != -5) {
            if (tGrid[currentRowIdx][currentColIdx + 1] == -10) {
                tGrid[currentRowIdx][currentColIdx + 1] = tGrid[currentRowIdx][currentColIdx] + 1;
                break;
            }
            else if (tGrid[currentRowIdx][currentColIdx + 1] == -1) {
                tGrid[currentRowIdx][currentColIdx + 1] = tGrid[currentRowIdx][currentColIdx] + 1;
                queue.enqueue([currentRowIdx, currentColIdx + 1]);
                listOfAllNodes.push([currentRowIdx, currentColIdx + 1]);
            }
            else { tGrid[currentRowIdx][currentColIdx + 1] = Math.min(tGrid[currentRowIdx][currentColIdx + 1], tGrid[currentRowIdx][currentColIdx] + 1) }
        }
    }
    const shortPathList = findShortPath(tGrid, initPos);
    return [shortPathList, listOfAllNodes, tGrid];
}

const findShortPath = (grid, initPos) => {
    const {startRowIndex, startColIndex, endRowIndex, endColIndex} = initPos;
    const MAX_PATH_LENGTH = ((grid.length)-1) * ((grid[0].length)-1);

    let currentRowIdx = endRowIndex, currentColIdx = endColIndex;
    const listOfNodes = [];
    listOfNodes.push([currentRowIdx, currentColIdx]);
    let count = 0;
    while (currentRowIdx != startRowIndex || currentColIdx != startColIndex) {
        count++;
        if (count >= MAX_PATH_LENGTH) {
            break;
        }
        //UP
        if (currentRowIdx != 0 && grid[currentRowIdx - 1][currentColIdx] == grid[currentRowIdx][currentColIdx] - 1) {
            listOfNodes.push([currentRowIdx - 1, currentColIdx]);
            currentRowIdx--;
            continue;
        }
        //DOWN
        if (currentRowIdx != 9 && grid[currentRowIdx + 1][currentColIdx] == grid[currentRowIdx][currentColIdx] - 1) {
            listOfNodes.push([currentRowIdx + 1, currentColIdx]);
            currentRowIdx++;
            continue;
        }

        //LEFT
        if (currentColIdx != 0 && grid[currentRowIdx][currentColIdx - 1] == grid[currentRowIdx][currentColIdx] - 1) {
            listOfNodes.push([currentRowIdx, currentColIdx - 1]);
            currentColIdx--;
            continue;
        }

        //RIGHT
        if (currentColIdx != 9 && grid[currentRowIdx][currentColIdx + 1] == grid[currentRowIdx][currentColIdx] - 1) {
            listOfNodes.push([currentRowIdx, currentColIdx + 1]);
            currentColIdx++;
            continue;
        }
    }
    return listOfNodes;
}