interface Vertex {
    isExplored: boolean;
    isStart: boolean;
    isGoal: boolean;
    isPath: boolean;
    isObstacle: boolean;
    x: number;
    y: number;
    prevNode: Vertex | null;
    onClick: () => void;
}

export type Grid = Vertex[][];

export const initializeGrid = (size: number): Vertex[][] => {
    return Array.from({length: size}, (_, x) =>
        Array.from({length: size}, (_, y): Vertex => ({
            isExplored: false,
            isStart: false,
            isGoal: false,
            isPath: false,
            isObstacle: false,
            x: x,
            y: y,
            prevNode: null,
            onClick: () => {
            },
        }))
    );
};

// For debugging
export const vertexToConsole = (vertex: Vertex): void => {
    console.log(`(${vertex.x},${vertex.y})`)
}

export enum SearchProgress {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETE,
    INCOMPLETE,
}

export const directions = [[1,0], [-1,0], [0,1], [0,-1]]

export default Vertex;

export function drawPath(goalNode: Vertex): void {
    console.log("Start getPath")
    let currNode: Vertex | null = goalNode;
    while (currNode != null) {
        console.log(generateKey(currNode.x, currNode.y));
        currNode.isPath = true;
        currNode = currNode.prevNode;
    }
    console.log("End getPath")
}

export function generateKey(x: number, y: number): string {
    return `(${x},${y})`;
}

export function isValid(x: number, y: number, size: number): boolean {
    return x >= 0 && x < size && y >= 0 && y < size;
}