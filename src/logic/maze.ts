import Vertex, {isValid} from "./graph.ts";

function getRandomPosition(n: number): { x: number, y: number } {
    return {
        x: Math.floor(Math.random() * n),
        y: Math.floor(Math.random() * n)
    };
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function createMaze(grid: Vertex[][]): [Vertex[][], number[], number[]] {
    const n = grid.length;

    // Randomly assign start and goal positions with a minimum distance
    const startPos = getRandomPosition(n);
    let goalPos = getRandomPosition(n);
    const minDistance = Math.floor(n / 1.5);
    while (distance(startPos.x, startPos.y, goalPos.x, goalPos.y) < minDistance) {
        goalPos = getRandomPosition(n);
    }

    grid[startPos.x][startPos.y].isStart = true;
    grid[goalPos.x][goalPos.y].isGoal = true;

    // Initialize maze with walls
    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            if (!(grid[x][y].isStart || grid[x][y].isGoal)) {
                grid[x][y].isObstacle = true;
            }
        }
    }

    // Directions for movement (up, down, left, right)
    const directions = [
        { dx: -2, dy: 0 }, // Up
        { dx: 2, dy: 0 },  // Down
        { dx: 0, dy: -2 }, // Left
        { dx: 0, dy: 2 }   // Right
    ];

    // Shuffle function to randomize directions
    function shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Depth-First Search based maze generation with guaranteed path
    function dfs(x: number, y: number) {
        shuffle(directions);
        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;
            const midX = x + dx / 2;
            const midY = y + dy / 2;
            if (isValid(nx, ny, n) && grid[nx][ny].isObstacle) {
                grid[nx][ny].isObstacle = false;
                grid[midX][midY].isObstacle = false;
                dfs(nx, ny);
            }
        }
    }

    // Start maze generation from the start position
    grid[startPos.x][startPos.y].isObstacle = false;
    grid[goalPos.x][goalPos.y].isObstacle = false;
    dfs(startPos.x, startPos.y);

    // Ensure path to goal
    let currentX = startPos.x;
    let currentY = startPos.y;
    while (currentX !== goalPos.x || currentY !== goalPos.y) {
        let direction;
        if (currentX < goalPos.x) {
            direction = { dx: 1, dy: 0 };
        } else if (currentX > goalPos.x) {
            direction = { dx: -1, dy: 0 };
        } else if (currentY < goalPos.y) {
            direction = { dx: 0, dy: 1 };
        } else {
            direction = { dx: 0, dy: -1 };
        }
        currentX += direction.dx;
        currentY += direction.dy;
        grid[currentX][currentY].isObstacle = false;
    }

    return [grid, [startPos.x, startPos.y], [goalPos.x, goalPos.y]];
}

export default createMaze;
