import React, {useEffect} from "react";
import Vertex from "../logic/graph.ts";

const VertexComponent: React.FC<Vertex> = ({x, y, isObstacle, isPath,
                                               isExplored, isStart, isGoal,
                                               onClick}) => {
    const getBackgroundColor = () => {
        if (isStart) {
            return 'green';
        }
        if (isGoal) {
            return 'red';
        }
        if (isObstacle) {
            return '#000000';  // Black
        }
        if (isPath) {
            return '#A9A9A9';  // Grey
        }
        if (isExplored) {
            return 'blue';
        }
        return 'white';
    };

    // Rerender only for the node that changes state
    useEffect(() => {
        console.log(`Render node component (${x},${y})`);
    }, [isObstacle, isPath, isExplored, isStart, isGoal]);

    const style = {
        width: '20px',
        height: '20px',
        backgroundColor: getBackgroundColor(),
        border: '1px solid black'
    };

    return (
        <>
            <div style={style} onClick={onClick}></div>
        </>
    );
};

export default VertexComponent;