import React, { useEffect, useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/solid'
import { ForceGraph } from "../components/Graph";
import { getNodes, getNeibors } from "../utils/api";
import { Web3Context } from "../wrappers/web3";
import { truncateAddress } from "../utils/formatters";
import { ethers } from "ethers";
import { Search } from "../components/common/Search";
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti'
import BRO from '../assets/BRO.png'
import NEWB from '../assets/NEWB.png'
import { mainColor } from "../constants";
import { PathsModal } from '../components/common/Paths'

const dropDuplicates = (arr) => {
    return [...new Map(arr.map(item => [item.id, item])).values()]
};

export function PathResult() {
    // const navigate = useNavigate();
    const [confetti, setConfetti] = useState(false);
    const { from, to } = useParams()
    const { width, height } = useWindowSize()
    const [isOpen, setIsOpen] = useState(false)

    // navigate("/home");

    console.log("from", from)
    console.log("to", to)
    const { account, library } = useContext(Web3Context)
    const [fromToData, setFromToData] = useState({})
    const [fromExtToData, setExtFromToData] = useState(null)

    useEffect(() => {
        const get = async () => {
            console.log('start')
            const rawNodes = await getNodes({
                src: from,
                dst: to,
            });

            const nodes = rawNodes.map((node) => {
                return { id: node.node_from, type: 'main' }
            }).concat(rawNodes.map((node) => {
                return { id: node.node_to, type: 'main' }
            }))
            const links = rawNodes.map((node) => {
                return { source: node.node_from, target: node.node_to, value: node.frequency }
            })

            if (nodes.length > 0) {
                setTimeout(() => {
                    setConfetti(true)
                }, 1000)
            }

            setFromToData({ nodes: dropDuplicates(nodes), links })

            // EXT
            let extNodes = JSON.parse(JSON.stringify(nodes));
            let extLinks = JSON.parse(JSON.stringify(links));

            const promises = []
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i]
                promises.push(getNeibors({
                    address: node.id,
                }));
            }
            const allData = await Promise.all(promises);
            console.log('allData', allData);

            for (let i = 0; i < allData.length; i++) {
                for (let j = 0; j < allData[i].length; j++) {
                    const tx = allData[i][j]
                    extLinks.push({ source: tx.from_address_.toLowerCase(), target: tx.to_address_.toLowerCase(), value: 1 })
                    extNodes.push({ id: tx.to_address_.toLowerCase() })
                }
            }
            extNodes = dropDuplicates(extNodes)
            extNodes = extNodes.map((node) => {
                if (nodes.filter((n) => n.id === node.id).length > 0) {
                    return { ...node, type: 'main' }
                } else {
                    return node
                }
            })

            setExtFromToData({ nodes: extNodes, links: extLinks })
        }
        get()
    }, [])

    return (
        <div className="flex flex-col md:flex-row h-full overflow-scroll">
            <div className="graph flex-row hidden md:flex md:w-1/2 bg-red-100 h-full relative  self-start" style={{ zIndex: 0 }}>
                <ForceGraph fromToData={fromExtToData || fromToData} from={from} to={to} />
            </div>
            <div className="flex flex-col w-full md:w-1/2 items-center justify-center self-start mt-24 md:mt-12">
                <div class="bg-white items-center rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 m-1 px-12 py-6">
                    {/* <img class="rounded-t-lg w-1/2 mx-auto" src='https://lh3.googleusercontent.com/U-yuprWTPHcvMfN1SwJ33_AGE3NNO_EYBKhLqJp9Xga265KcVEKtXVNh-kPGmsb0rRFtVKvNZdQlIewYOc62i9pc_aGIhzL5tiCnLA=w600' alt="" /> */}
                    <div className="text-xl mt-2 mb-3">
                        {
                            fromToData.hasOwnProperty('nodes') && fromToData?.nodes.length > 0 && (
                                <h1 className="text-center mb-2 text-xl">
                                    WoW! You and Vitalik are bros
                                    <br></br>
                                    with <span className="text-3xl" style={{ color: mainColor }}>{fromToData?.nodes.length}</span> handshakes
                                </h1>
                            )
                        }
                    </div>

                    <div className="nft-template w-[300px] mx-auto border">
                        <img src={BRO}></img>
                    </div>

                    <div class="flex flex-col">
                        <button class="mt-6 inline-flex items-center justify-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-400 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Mint SBT
                            <svg aria-hidden="true" class="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </button>
                    </div>

                    <div class="flex flex-col">
                        <button onClick={() => setIsOpen(true)} className="mt-3 inline-flex items-center justify-center py-2 px-3 text-sm font-medium text-center text-black border rounded-lg hover:bg-blue-200 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Show paths
                        </button>
                        <PathsModal isOpen={isOpen} setIsOpen={setIsOpen} paths={fromToData.hasOwnProperty('nodes') ? fromToData?.nodes : []} />
                    </div>
                </div>
            </div>


            <Confetti
                width={width}
                height={height}
                run={confetti}
                recycle={false}
            />
        </div >
    );
}