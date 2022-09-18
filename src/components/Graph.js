import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import { truncateAddress } from "../utils/formatters";
import { withResizeDetector } from "react-resize-detector";
import { ethers } from "ethers";
import { mainColor, secondColor } from "../constants";

const templateData = {
    nodes: [
        { id: "B", type: 'test' },
        { id: "U", type: 'test' },
        { id: "T", type: 'test' },
        { id: "E", type: 'test' },
        { id: "R", type: 'test' },
        { id: "I", type: 'test' },
        { id: "N", type: 'test' }
    ],
    links: [
        { source: "B", target: "U", value: 5 },
        { source: "U", target: "T", value: 5 },
        { source: "T", target: "E", value: 5 },
        { source: "E", target: "R", value: 5 },
        { source: "R", target: "I", value: 5 },
        { source: "I", target: "N", value: 5 },
        { source: "N", target: "B", value: 5 }
    ]
};

const templateSad = {
    nodes: [
        { id: " 4", type: 'test' },
        { id: "0", type: 'test' },
        { id: "4 ", type: 'test' }
    ],
    links: [
        { source: " 4", target: "0", value: 5 },
        { source: "0", target: "4 ", value: 5 },
    ]
}

const Graph = ({ width, height, fromToData, from, to }) => {
    const navigate = useNavigate()
    const forceRef = useRef(null);
    let data = []

    if (typeof fromToData !== 'undefined' && Object.keys(fromToData).length !== 0) {
        console.log('fromToData', fromToData.nodes)
        if (fromToData.nodes.length === 0) {
            data = templateSad
        } else {
            data = JSON.parse(JSON.stringify(fromToData))
        }
    } else {
        data = templateData
    }

    const nodePaint = (node, ctx) => {
        const { id, x, y } = node;
        let size = 5;
        if (node.id === from) {
            ctx.fillStyle = "black";
            ctx.font = "12px 'Space mono'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`From [${truncateAddress(from, 3)}]`, x + 80, y + 10);
            size = 7;
        } else if (node.id === to) {
            ctx.fillStyle = "black";
            ctx.font = "12px 'Space mono'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`To [${truncateAddress(to, 3)}]`, x + 80, y + 10);
            size = 7;
        } else if (node.type === 'main') {
            ctx.fillStyle = mainColor;
            size = 7;
        } else if (node.type === 'test') {
            ctx.fillStyle = mainColor;
            size = 7;
            ctx.font = "15px 'Space mono'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(node.id, x + 10, y + 10);
        } else {
            ctx.fillStyle = secondColor;
        }
        ctx.beginPath()
        ctx.arc(x, y, size, 0, 2 * Math.PI, false)
        return ctx.fill();
    }

    useEffect(() => {
        forceRef.current.d3Force("charge").distanceMax(200).strength(-200);
    });

    return (
        <>
            <ForceGraph2D
                graphData={data}
                width={width}
                height={height}
                minZoom={0.5}
                maxZoom={10}
                zoom={5}
                backgroundColor="linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 50%)"
                nodeLabel="id"
                nodeRelSize={5}
                onNodeClick={(node) => {
                    if (ethers.utils.isAddress(node.id)) {
                        window.open('https://etherscan.io/address/' + node.id, '_blank');
                    }
                }}
                ref={forceRef}
                linkDirectionalParticles={4}
                nodeCanvasObject={(node, ctx) => nodePaint(node, ctx)}
            />
        </>

    );
};

export const ForceGraph = withResizeDetector(Graph);