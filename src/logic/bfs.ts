import Vertex, {directions, Grid, SearchProgress, vertexToConsole} from "./graph.ts";
import Queue from "./queue.ts";
import React from "react";

async function bfs(start: number[], goal: number[], grid: Grid, stepTime: number,
                   setSteps: React.Dispatch<React.SetStateAction<number>>,
                   setProgress: React.Dispatch<React.SetStateAction<SearchProgress>>,
                   setGrid: React.Dispatch<React.SetStateAction<Grid>>): Promise<void> {
    const queue: Queue<Vertex> = new Queue();
    const seen: Set<string> = new Set();
    const size: number = grid.length;
    setProgress(SearchProgress.IN_PROGRESS);

    console.log("Size:", size);

    const startNode: Vertex = grid[start[0]][start[1]];
    startNode.isStart = true;
    startNode.isGoal = false;
    console.log("Start Node");
    vertexToConsole(startNode);

    const goalNode: Vertex = grid[goal[0]][goal[1]];
    goalNode.isGoal = true;
    goalNode.isStart = false;
    console.log("Goal Node");
    vertexToConsole(goalNode);

    queue.enqueue(startNode);

    while (queue.size() > 0) {
        const currNode: Vertex | undefined = queue.dequeue();
        if (currNode) {
            const key: string = generateKey(currNode.x, currNode.y);

            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            currNode.isExplored = true;
            console.log("Explored ", seen);

            await new Promise((resolve) => setTimeout(resolve, stepTime));
            setSteps((prev) => prev + 1);
            setGrid(grid);

            if (currNode.x === goalNode.x && currNode.y === goalNode.y) {
                console.log("Goal Found");
                drawPath(goalNode);
                setGrid(grid);
                setProgress(SearchProgress.COMPLETE);
                return;
            }

            for (const direction of directions) {
                const dx: number = direction[0];
                const dy: number = direction[1];
                if (isValid(currNode.x + dx, currNode.y + dy, size)
                    && !seen.has(generateKey(currNode.x + dx, currNode.y + dy))) {
                    const nextNode: Vertex = grid[currNode.x + dx][currNode.y + dy];
                    if (!nextNode.isObstacle) {
                        // vertexToConsole(nextNode)
                        nextNode.prevNode = currNode;
                        queue.enqueue(nextNode);
                    }
                }
            }
        }
    }

    setGrid(grid);
    setProgress(SearchProgress.INCOMPLETE);
}

function drawPath(goalNode: Vertex): void {
    console.log("Start getPath")
    let currNode: Vertex | null = goalNode;
    while (currNode != null) {
        console.log(generateKey(currNode.x, currNode.y));
        currNode.isPath = true;
        currNode = currNode.prevNode;
    }
    console.log("End getPath")
}

function generateKey(x: number, y: number): string {
    return `(${x},${y})`;
}

function isValid(x: number, y: number, size: number): boolean {
    return x >= 0 && x < size && y >= 0 && y < size;
}

export default bfs;