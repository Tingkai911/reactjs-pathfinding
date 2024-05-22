interface Vertex {
    isExplored: boolean;
    isStart: boolean;
    isGoal: boolean;
    isPath: boolean;
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

export const directions = [[1,0], [-1,0], [0,1], [0,-1]]

export default Vertex;