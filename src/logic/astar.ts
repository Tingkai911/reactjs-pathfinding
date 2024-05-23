import Vertex, {directions, generateKey, Grid, isValid, SearchProgress, vertexToConsole} from "./graph.ts";
import PriorityQueue from "./pq.ts";
import React from "react";

interface PQNode {
    cost: number,
    heuristic: number,
    vertex: Vertex,
    prevPQNode: PQNode | null,
}

async function astar(start: number[], goal: number[], grid: Grid, stepTime: number,
                   setSteps: React.Dispatch<React.SetStateAction<number>>,
                   setProgress: React.Dispatch<React.SetStateAction<SearchProgress>>,
                   setGrid: React.Dispatch<React.SetStateAction<Grid>>): Promise<void> {
    // Sort by cost from start to point + heuristic from point to goal
    const pq: PriorityQueue<PQNode> = new PriorityQueue((a, b) => {
        return (a.cost + a.heuristic) - (b.cost + b.heuristic)
    });
    const size: number = grid.length;
    setProgress(SearchProgress.IN_PROGRESS);

    // This is needed as there may be a lower cost path from the start node to the current node found later which we want to explore.
    const seen: Map<string, number> = new Map();

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

    const node: PQNode = {
        cost: 0,
        heuristic: manhattanDistance(start, goal),
        vertex: startNode,
        prevPQNode: null,
    }
    pq.insert(node);

    while (!pq.isEmpty()) {
        const currNode: PQNode | null = pq.remove();
        if (currNode) {
            const vertex: Vertex = currNode.vertex;
            const cost: number = currNode.cost;

            const key: string = generateKey(vertex.x, vertex.y);

            if (seen.has(key)) {
                continue;
            }
            seen.set(key, currNode.cost + currNode.heuristic);

            vertex.isExplored = true;
            console.log("Explored ", seen);

            await new Promise((resolve) => setTimeout(resolve, stepTime));
            setSteps((prev) => prev + 1);
            setGrid(grid);

            if (vertex.x === goalNode.x && vertex.y === goalNode.y) {
                console.log("Goal Found");
                drawPath(currNode);
                setGrid(grid);
                setProgress(SearchProgress.COMPLETE);
                return;
            }

            for (const direction of directions) {
                const dx: number = direction[0];
                const dy: number = direction[1];
                if (isValid(vertex.x + dx, vertex.y + dy, size)) {
                    const nextNode: Vertex = grid[vertex.x + dx][vertex.y + dy];
                    if (!nextNode.isObstacle) {
                        // vertexToConsole(nextNode)
                        const nextPQNode: PQNode = {
                            cost: cost + 1,
                            heuristic: manhattanDistance([vertex.x + dx, vertex.y + dy], goal),
                            vertex: nextNode,
                            prevPQNode: currNode,
                        }
                        if (!seen.has(generateKey(vertex.x + dx, vertex.y + dy))) {
                            pq.insert(nextPQNode);
                        }
                        // If a lower cost path is found, we want to explore that as well.
                        const existCost: number | undefined = seen.get(generateKey(vertex.x + dx, vertex.y + dy));
                        const nextCost: number = nextPQNode.cost + nextPQNode.heuristic;
                        if (existCost !== undefined && existCost > nextCost) {
                            seen.set(generateKey(vertex.x + dx, vertex.y + dy), nextPQNode.cost + nextPQNode.heuristic);
                            pq.insert(nextPQNode);
                        }
                    }
                }
            }
        }
    }

    setGrid(grid);
    setProgress(SearchProgress.INCOMPLETE);
}

function manhattanDistance(start: number[], goal: number[]): number {
    return Math.abs(start[0] - goal[0]) + Math.abs(start[1] - goal[1]);
}

// Need a new drawPath function as we do not want to overwrite the prev nodes of the same indices but with different cost
function drawPath(goalNode: PQNode): void {
    console.log("Start getPath")
    let currNode: PQNode | null = goalNode;
    while (currNode != null) {
        console.log(generateKey(currNode.vertex.x, currNode.vertex.y));
        currNode.vertex.isPath = true;
        currNode = currNode.prevPQNode;
    }
    console.log("End getPath")
}

export default astar;