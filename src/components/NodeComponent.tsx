import React from "react";
import Vertex from "../logic/graph.ts";

const NodeComponent: React.FC<Vertex> = ({isPath, isExplored, isStart, isGoal, onClick}) => {
    const getBackgroundColor = () => {
        if (isStart) {
            return 'green';
        }
        if (isGoal) {
            return 'red';
        }
        if (isPath) {
            return '#000000';  // Black
        }
        if (isExplored) {
            return 'blue';
        }
        return 'white';
    };

    const style = {
        width: '20px',
        height: '20px',
        backgroundColor: getBackgroundColor(),
        border: '1px solid black'
    };

    return <div style={style} onClick={onClick}></div>;
};

export default NodeComponent;