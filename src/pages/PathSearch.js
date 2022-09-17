import React from "react";
import { ForceGraph } from "../components/Graph";
import { Search } from "../components/common/Search";

export function PathSearch() {

    return (
        <div className="flex flex-col md:flex-row h-full p-6 md:p-0">
            <div className="graph hidden md:flex flex-row w-full md:w-1/2 h-full" style={{ zIndex: 0 }}>
                <ForceGraph />
            </div>
            <div className="flex flex-col w-full md:w-1/2 h-full items-center justify-center overflow-scroll">
                <Search />
            </div>
        </div>
    );
}