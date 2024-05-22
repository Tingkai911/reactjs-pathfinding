import Vertex, {directions, drawPath, generateKey, Grid, isValid, SearchProgress, vertexToConsole} from "./graph.ts";
import Stack from "./stack.ts";
import React from "react";

async function dfs(start: number[], goal: number[], grid: Grid, stepTime: number,
                   setSteps: React.Dispatch<React.SetStateAction<number>>,
                   setProgress: React.Dispatch<React.SetStateAction<SearchProgress>>,
                   setGrid: React.Dispatch<React.SetStateAction<Grid>>): Promise<void> {
    const queue: Stack<Vertex> = new Stack();
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

    queue.push(startNode);

    while (queue.size() > 0) {
        const currNode: Vertex | undefined = queue.pop();
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
                        queue.push(nextNode);
                    }
                }
            }
        }
    }

    setGrid(grid);
    setProgress(SearchProgress.INCOMPLETE);
}

export default dfs;