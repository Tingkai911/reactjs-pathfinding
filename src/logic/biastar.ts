import Vertex, {directions, generateKey, Grid, isValid, SearchProgress, vertexToConsole} from "./graph.ts";
import React from "react";
import PriorityQueue from "./pq.ts";

interface PQNode {
    cost: number,
    heuristic: number,
    vertex: Vertex,
    prevPQNode: PQNode | null,
}

// Bidirectional A*, maintain 2 frontiers, one from the start to goal, and another one from the goal to start
async function bi_astar(start: number[], goal: number[], grid: Grid, stepTime: number,
                        setSteps: React.Dispatch<React.SetStateAction<number>>,
                        setProgress: React.Dispatch<React.SetStateAction<SearchProgress>>,
                        setGrid: React.Dispatch<React.SetStateAction<Grid>>): Promise<void> {
    const size: number = grid.length;
    setProgress(SearchProgress.IN_PROGRESS);
    console.log("Size:", size);

    // Expand from start to goal
    const pqForward: PriorityQueue<PQNode> = new PriorityQueue((a, b) => {
        return (a.cost + a.heuristic) - (b.cost + b.heuristic)
    });
    const seenForward: Map<string, PQNode> = new Map();
    const startNode: Vertex = grid[start[0]][start[1]];
    startNode.isStart = true;
    startNode.isGoal = false;
    console.log("Start Node");
    vertexToConsole(startNode);
    const startPQNode: PQNode = {
        cost: 0,
        heuristic: manhattanDistance(start, goal),
        vertex: startNode,
        prevPQNode: null,
    }
    pqForward.insert(startPQNode);
    seenForward.set(generateKey(startNode.x, startNode.y), startPQNode)
    startNode.isStart = true;

    // Expand from goal to start
    const pqBackward: PriorityQueue<PQNode> = new PriorityQueue((a, b) => {
        return (a.cost + a.heuristic) - (b.cost + b.heuristic)
    });
    const seenBackward: Map<string, PQNode> = new Map();
    const goalNode: Vertex = grid[goal[0]][goal[1]];
    goalNode.isGoal = true;
    goalNode.isStart = false;
    console.log("Goal Node");
    vertexToConsole(goalNode);
    const goalPQNode: PQNode = {
        cost: 0,
        heuristic: manhattanDistance(goal, start),
        vertex: goalNode,
        prevPQNode: null,
    }
    pqBackward.insert(goalPQNode);
    seenBackward.set(generateKey(goalNode.x, goalNode.y), goalPQNode)
    goalNode.isExplored = true;

    // Managing midpoint where the 2 frontiers meet
    let bestPathCost: number = Number.MAX_VALUE;
    let forwardMeetingNode: PQNode | null = null;
    let backwardMeetingNode: PQNode | null = null;

    // Bidirectional A* search
    while (!pqForward.isEmpty() && !pqBackward.isEmpty()) {
        const forwardNode: PQNode | null = pqForward.peek();
        const backwardNode: PQNode | null = pqBackward.peek();

        // Terminating condition
        if (forwardNode !== null && backwardNode !== null) {
            // Terminate if the lowest cost of both frontier exceeds the best cost found
            if (forwardNode.cost + backwardNode.cost >= bestPathCost) {
                break;
            }
            // Terminate if the cost + heuristic of both frontier exceed the best cost found
            if ((forwardNode.cost + forwardNode.heuristic) >= bestPathCost
                || (backwardNode.cost + backwardNode.heuristic) >= bestPathCost) {
                break;
            }
        }

        // Forward expansion
        if (pqForward.size() <= pqBackward.size() && forwardNode !== null) {
            pqForward.remove();
            const cost: number = forwardNode.cost;

            for (const direction of directions) {
                const dx: number = direction[0];
                const dy: number = direction[1];
                if (isValid(forwardNode.vertex.x + dx, forwardNode.vertex.y + dy, size)) {
                    const nextNode: Vertex = grid[forwardNode.vertex.x + dx][forwardNode.vertex.y + dy];
                    if (!nextNode.isObstacle) {
                        // vertexToConsole(nextNode)
                        const nextKey: string = generateKey(forwardNode.vertex.x + dx, forwardNode.vertex.y + dy)
                        const nextPQNode: PQNode = {
                            cost: cost + 1,
                            heuristic: manhattanDistance([forwardNode.vertex.x + dx, forwardNode.vertex.y + dy], goal),
                            vertex: nextNode,
                            prevPQNode: forwardNode,
                        }
                        const nextPathCost: number = nextPQNode.cost + nextPQNode.heuristic;
                        if (nextPathCost > bestPathCost) {
                            continue;
                        }
                        // If neighbour not in forward frontier
                        if (!seenForward.has(nextKey)) {
                            seenForward.set(nextKey, nextPQNode);
                            pqForward.insert(nextPQNode);
                            nextPQNode.vertex.isExplored = true;
                            console.log("Explored Forward ", seenForward);
                            await new Promise((resolve) => setTimeout(resolve, stepTime));
                            setSteps((prev) => prev + 1);
                            setGrid(grid);
                        }
                        // If neighbour in forward frontier and a lower cost path is found, we want to explore that as well.
                        const existPQNode : PQNode | undefined = seenForward.get(nextKey);
                        if (existPQNode !== undefined && (existPQNode.cost + existPQNode.heuristic) > nextPathCost) {
                            seenForward.set(nextKey, nextPQNode);  // Overwrite
                            pqForward.insert(nextPQNode);  // Add to forward frontier
                            nextPQNode.vertex.isExplored = true;
                            console.log("Explored Forward ", seenForward);
                            await new Promise((resolve) => setTimeout(resolve, stepTime));
                            setGrid(grid);
                        }

                        // If neighbour in backward frontier
                        if (seenBackward.has(nextKey)) {
                            const seenBackwardPQNode: PQNode | undefined = seenBackward.get(nextKey);
                            if (seenBackwardPQNode !== undefined) {
                                const pathCost: number = seenBackwardPQNode.cost + nextPQNode.cost;
                                if (pathCost < bestPathCost) {
                                    bestPathCost = pathCost;
                                    forwardMeetingNode = nextPQNode;
                                    backwardMeetingNode = seenBackwardPQNode;
                                }
                            }
                        }
                    }
                }
            }
        }
        // Backward expansion
        else if (backwardNode !== null) {
            pqBackward.remove();
            const cost: number = backwardNode.cost;

            for (const direction of directions) {
                const dx: number = direction[0];
                const dy: number = direction[1];
                if (isValid(backwardNode.vertex.x + dx, backwardNode.vertex.y + dy, size)) {
                    const nextNode: Vertex = grid[backwardNode.vertex.x + dx][backwardNode.vertex.y + dy];
                    if (!nextNode.isObstacle) {
                        // vertexToConsole(nextNode)
                        const nextKey: string = generateKey(backwardNode.vertex.x + dx, backwardNode.vertex.y + dy)
                        const nextPQNode: PQNode = {
                            cost: cost + 1,
                            heuristic: manhattanDistance([backwardNode.vertex.x + dx, backwardNode.vertex.y + dy], start),
                            vertex: nextNode,
                            prevPQNode: backwardNode,
                        }
                        const nextPathCost: number = nextPQNode.cost + nextPQNode.heuristic;
                        if (nextPathCost > bestPathCost) {
                            continue;
                        }
                        // If neighbour not in backward frontier
                        if (!seenBackward.has(nextKey)) {
                            seenBackward.set(nextKey, nextPQNode);
                            pqBackward.insert(nextPQNode);
                            nextPQNode.vertex.isExplored = true;
                            console.log("Explored Backward ", seenBackward);
                            await new Promise((resolve) => setTimeout(resolve, stepTime));
                            setSteps((prev) => prev + 1);
                            setGrid(grid);
                        }
                        // If neighbour in backward frontier and a lower cost path is found, we want to explore that as well.
                        const existPQNode : PQNode | undefined = seenBackward.get(nextKey);
                        if (existPQNode !== undefined && (existPQNode.cost + existPQNode.heuristic) > nextPathCost) {
                            seenBackward.set(nextKey, nextPQNode);  // Overwrite
                            pqBackward.insert(nextPQNode);  // Add to backward frontier
                            nextPQNode.vertex.isExplored = true;
                            console.log("Explored Backward ", seenBackward);
                            await new Promise((resolve) => setTimeout(resolve, stepTime));
                            setGrid(grid);
                        }

                        // If neighbour in forward frontier
                        if (seenForward.has(nextKey)) {
                            const seenForwardPQNode: PQNode | undefined = seenForward.get(nextKey);
                            if (seenForwardPQNode !== undefined) {
                                const pathCost: number = seenForwardPQNode.cost + nextPQNode.cost;
                                if (pathCost < bestPathCost) {
                                    bestPathCost = pathCost;
                                    forwardMeetingNode = seenForwardPQNode;
                                    backwardMeetingNode = nextPQNode;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (forwardMeetingNode === null || backwardMeetingNode === null) {
        setGrid(grid);
        setProgress(SearchProgress.INCOMPLETE);
        return;
    }

    // Reconstruct Path
    if (forwardMeetingNode) {
        drawPath(forwardMeetingNode);
    }
    if (backwardMeetingNode) {
        drawPath(backwardMeetingNode);
    }
    setGrid(grid);
    setProgress(SearchProgress.COMPLETE);
}

function manhattanDistance(start: number[], goal: number[]): number {
    return Math.abs(start[0] - goal[0]) + Math.abs(start[1] - goal[1]);
}

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

export default bi_astar;