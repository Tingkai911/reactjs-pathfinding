import './App.css'
import {useState, useEffect} from "react";
import {Grid, initializeGrid, SearchProgress} from "./logic/graph.ts";
import VertexComponent from "./components/VertexComponent.tsx";
import bfs from "./logic/bfs.ts";

function App() {
    const gridSize = 10;
    const [steps, setSteps] = useState<number>(0);
    const [progress, setProgress] = useState<SearchProgress>(SearchProgress.NOT_STARTED);
    const [start, setStart] = useState<number[] | null>(null)
    const [goal, setGoal] = useState<number[] | null>(null)

    // TODO: Replace with useContext
    const [grid, setGrid] = useState<Grid>(initializeGrid(gridSize));

    // TODO: Not working - only run once at the end instead of at every step of the search
    useEffect( () => {
        console.log("Num steps: ", steps);
        console.log("Progress: ", progress);
        if (progress === SearchProgress.INCOMPLETE) {
            alert("No path found between start and goal.");
        }
        const newGrid: Grid = grid.map(rowArray =>
            rowArray.map(cell => ({
                ...cell
            }))
        );
        setGrid(newGrid);
    }, [progress, steps]);

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
            bfs(start, goal, grid, setSteps, setProgress);
        }
        else if (progress !== SearchProgress.NOT_STARTED) {
            alert("Please reset the grid first before starting a new search,");
        }
        else {
            alert("Please select both a start and a goal position before starting a new search.");
        }
    };

    const resetGrid = (): void => {
        setGrid(initializeGrid(gridSize));
        setSteps(0);
        setStart(null);
        setGoal(null);
        setProgress(SearchProgress.NOT_STARTED);
    };

    return (
        <>
            <div style={{display: 'flex'}}>
                <div style={{marginRight: '20px'}}>
                    <h3>Nodes visited: {steps}</h3>
                    <div style={{ marginBottom: '10px' }}>
                        <button onClick={startBFS} style={{ display: 'block', marginBottom: '10px' }}>Start BFS</button>
                        <button onClick={resetGrid} style={{ display: 'block' }}>Reset Grid</button>
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
