import './App.css'
import {useEffect, useState} from "react";
import {Grid, initializeGrid, SearchProgress} from "./logic/graph.ts";
import VertexComponent from "./components/VertexComponent.tsx";
import bfs from "./logic/bfs.ts";
import dfs from "./logic/dfs.ts";
import astar from "./logic/astar.ts";
import biastar from "./logic/biastar.ts";

function App() {
    const stepTime: number = 1;
    const defaultGridSize: number = 9;
    // Not a hard limit in terms of algorithm implementation, but for grid larger tha 50x50 is hard to fit on screen
    const minSize: number = 0;
    const maxSize: number = 50;

    const [gridSize, setGridSize] = useState<number>(defaultGridSize);
    const [steps, setSteps] = useState<number>(0);
    const [progress, setProgress] = useState<SearchProgress>(SearchProgress.NOT_STARTED);
    const [start, setStart] = useState<number[] | null>(null)
    const [goal, setGoal] = useState<number[] | null>(null)
    const [grid, setGrid] = useState<Grid>(initializeGrid(gridSize));
    const [algorithm, setAlgorithm] = useState<string>('BFS');

    useEffect(() => {
        if (progress === SearchProgress.INCOMPLETE) {
            alert("No path found between start and goal.");
        }
    }, [progress]);

    const handleGridClick = (row: number, col: number): void => {
        if (progress !== SearchProgress.NOT_STARTED) {
            return;
        }
        // Deep Copy
        const newGrid: Grid = grid.map(rowArray =>
            rowArray.map(cell => ({
                ...cell
            }))
        );
        // Set start
        if (!grid.some(row => row.some(cell => cell.isStart))) {
            newGrid[row][col].isStart = true;
            setStart([row, col]);
        }
        // Set goal
        else if (!grid.some(row => row.some(cell => cell.isGoal))) {
            newGrid[row][col].isGoal = true;
            setGoal([row, col]);
        }
        // Set obstacles
        else {
            newGrid[row][col].isObstacle = !newGrid[row][col].isObstacle;
        }
        setGrid(newGrid);
    };

    const startBFS = (): void => {
        if (start && goal && progress === SearchProgress.NOT_STARTED) {
            if (algorithm === "DFS") {
                dfs(start, goal, grid, stepTime, setSteps, setProgress, setGrid);
            }
            else if (algorithm === "A*") {
                astar(start, goal, grid, stepTime, setSteps, setProgress, setGrid);
            }
            else if (algorithm === "Bi-A*") {
                biastar(start, goal, grid, stepTime, setSteps, setProgress, setGrid);
            }
            else {
                // Defaults to BFS
                setAlgorithm("BFS")
                bfs(start, goal, grid, stepTime, setSteps, setProgress, setGrid);
            }
        } else if (progress !== SearchProgress.NOT_STARTED) {
            alert("Please reset the grid first before starting a new search,");
        } else {
            alert("Please select both a start and a goal position before starting a new search.");
        }
    };

    const resetGrid = (): void => {
        if (progress === SearchProgress.IN_PROGRESS) {
            return;
        }
        setGrid(initializeGrid(gridSize));
        setSteps(0);
        setStart(null);
        setGoal(null);
        setProgress(SearchProgress.NOT_STARTED);
    };

    const handleGridSizeChange = (event: { target: { value: string; }; }): void => {
        if (progress === SearchProgress.IN_PROGRESS) {
            return;
        }
        if (event.target.value.trim().length === 0) {
            setGridSize(0);
            setGrid(initializeGrid(0));
            setStart(null);
            setGoal(null);
            alert("Please select a grid size that is between 0 to 50");
            return;
        }
        const newSize: number = parseInt(event.target.value, 10);
        if (!isNaN(newSize) && newSize >= minSize && newSize <= maxSize) {
            console.log(newSize);
            setGridSize(newSize);
            setGrid(initializeGrid(newSize));
            setStart(null);
            setGoal(null);
        } else {
            alert(`Please select a grid size that is between ${minSize} and ${maxSize}`);
        }
    };

    const handleAlgorithmChange = (event: { target: { value: string; }; }): void => {
        if (progress === SearchProgress.IN_PROGRESS) {
            return;
        }
        setAlgorithm(event.target.value);
    };

    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                <div style={{marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <h3>Nodes visited: {steps}</h3>
                    <label htmlFor="gridSizeInput" style={{marginBottom: '5px'}}>Grid Size (n x n):</label>
                    <input
                        id="gridSizeInput"
                        type="number"
                        value={gridSize}
                        onChange={handleGridSizeChange}
                        style={{marginBottom: '10px'}}
                    />
                    <label htmlFor="algorithmSelect" style={{marginBottom: '5px'}}>Choose Algorithm:</label>
                    <select
                        id="algorithmSelect"
                        value={algorithm}
                        onChange={handleAlgorithmChange}
                        style={{marginBottom: '10px'}}
                    >
                        <option value="BFS">Breadth-First Search (BFS)</option>
                        <option value="DFS">Depth-First Search (DFS)</option>
                        <option value="A*">A* Search</option>
                        <option value="Bi-A*">Bidirectional A* Search</option>
                    </select>
                    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px'}}>
                        <button onClick={startBFS} style={{marginRight: '10px'}}>Start</button>
                        <button onClick={resetGrid}>Reset</button>
                    </div>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridSize}, 20px)`,
                    gridTemplateRows: `repeat(${gridSize}, 20px)`
                }}>
                    {grid.map((row, rowIndex) => row.map((cell, colIndex) => (
                        <VertexComponent
                            key={`(${rowIndex}-${colIndex})`}
                            x={rowIndex}
                            y={colIndex}
                            isExplored={cell.isExplored}
                            isStart={cell.isStart}
                            isGoal={cell.isGoal}
                            isPath={cell.isPath}
                            isObstacle={cell.isObstacle}
                            prevNode={cell.prevNode}
                            onClick={() => handleGridClick(rowIndex, colIndex)}
                        />
                    )))}
                </div>
            </div>
        </>
    )
}

export default App
