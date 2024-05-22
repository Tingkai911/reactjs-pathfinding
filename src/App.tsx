import './App.css'
import {useEffect, useState} from "react";
import {Grid, initializeGrid} from "./logic/graph.ts";
import NodeComponent from "./components/NodeComponent.tsx";
import bfs from "./logic/bfs.ts";

function App() {
    const gridSize = 30;
    const [steps, setSteps] = useState<number>(0);
    const [isComplete, setComplete] = useState<boolean>(false);
    const [grid, setGrid] = useState<Grid>(initializeGrid(gridSize));
    const [start, setStart] = useState<number[] | null>(null)
    const [goal, setGoal] = useState<number[] | null>(null)

    // TODO: Not working
    useEffect(() => {
        console.log("Num steps: ", steps);
        console.log("Is complete: ", isComplete);
        // // Sleep for a while before updating
        // setTimeout(() => console.log("Updating grid"), 500);
        const newGrid: Grid = grid.map(rowArray =>
            rowArray.map(cell => ({
                ...cell
            }))
        );
        setGrid(newGrid);
    }, [isComplete, steps]);

    const handleGridClick = (row: number, col: number): void => {
        if (isComplete){
            return;
        }

        // Deep Copy
        const newGrid: Grid = grid.map(rowArray =>
            rowArray.map(cell => ({
                ...cell
            }))
        );

        if (!grid.some(row => row.some(cell => cell.isStart))) {
            newGrid[row][col].isStart = true;
            setStart([row, col]);
        } else if (!grid.some(row => row.some(cell => cell.isGoal))) {
            newGrid[row][col].isGoal = true;
            setGoal([row, col]);
        } else {
            newGrid.forEach(row => row.forEach(cell => {
                cell.isStart = false;
                cell.isGoal = false;
            }));
            newGrid[row][col].isStart = true;
            setStart([row, col]);
            setGoal(null)
        }

        setGrid(newGrid);
    };

    const startBFS = (): void => {
        if (start && goal && !isComplete) {
            bfs(start, goal, grid, setSteps, setComplete);
        }
        else if (isComplete) {
            alert("Please reset the grid first before starting a new search,");
        }else {
            alert("Please select both a start and a goal position before starting a new search.");
        }
    };

    const resetGrid = (): void => {
        setGrid(initializeGrid(gridSize));
        setSteps(0);
        setStart(null);
        setGoal(null);
        setComplete(false);
    };

    return (
        <>
            <div style={{display: 'flex'}}>
                <div style={{marginRight: '20px'}}>
                    <h3>Steps: {steps}</h3>
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
                        <NodeComponent
                            key={`(${rowIndex}-${colIndex})`}
                            x={rowIndex}
                            y={colIndex}
                            isExplored={cell.isExplored}
                            isStart={cell.isStart}
                            isGoal={cell.isGoal}
                            isPath={cell.isPath}
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
