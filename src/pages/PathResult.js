import React, { useEffect, useState, useContext } from "react";
import { toast } from 'react-toastify';
import { useParams } from "react-router-dom";
import { ForceGraph } from "../components/Graph";
import { getNodes, getNeibors, getRequest } from "../utils/api";
import { Web3Context } from "../wrappers/web3";
import { truncateAddress } from "../utils/formatters";
import { ethers } from "ethers";
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti'
import BRO from '../assets/BRO.png'
import NEWB from '../assets/NEWB.png'
import { mainColor } from "../constants";
import { PathsModal } from '../components/common/Paths'
import { verifyRequest, executeRequest, getNonce, getBalanceOf } from '../utils/web3'

const dropDuplicates = (arr) => {
    return [...new Map(arr.map(item => [item.id, item])).values()]
};

export function PathResult() {
    const [confetti, setConfetti] = useState(false);
    const { from, to } = useParams()
    const { width, height } = useWindowSize()
    const [isOpen, setIsOpen] = useState(false)
    const { account, library } = useContext(Web3Context)
    const [fromToData, setFromToData] = useState({})
    const [fromExtToData, setExtFromToData] = useState(null)
    const [isVitalik, setIsVitalik] = useState(false)
    const [balanceOf, setBalanceOf] = useState(0)

    const execute = async () => {
        if (library) {
            const network = await library.getNetwork();
            if (network.chainId === 1) {
                console.log('ok')
            } else {
                toast.info("We provide tokens only on Eth mainne", {
                    icon: '🚫',
                })
                throw 'We provide tokens only on mainnet'
            }
        }

        if (!account) {
            toast.info("Connect your wallet", {
                icon: '🙃',
            })
            throw 'Connect your wallet'
        }

        const nonce = await getNonce({ library })
        if (nonce > 0) {
            toast.error("Token already minted", {
                icon: '🚫',
            })
            throw 'Token already minted'
        }
        const data = await getRequest({ from, to, nonce })
        console.log('request', data)
        const isValid = await verifyRequest({ library, message: data.message.message, signature: data.signed.signature })

        console.log(isValid)

        if (isValid) {
            if (data.message.message.to !== account.toLowerCase()) {
                toast.error("You are not the receiver of this request", {
                    icon: '🚫',
                })
            } else {
                try {
                    const promise = executeRequest({ library, message: data.message.message, signature: data.signed.signature })
                    toast.promise(
                        promise,
                        {
                            pending: 'Token is pending. Don\'t refresh the page',
                            success: 'SB Token created 🦄',
                            error: 'Something went wrong 🤯'
                        }
                    )
                } catch (e) {
                    console.log(e?.message || 'Something went wrong')
                }
            }
        } else {
            toast.error("Request is not valid", {
                icon: '🚫',
            })
        }
    }

    const wrapedExecute = () => {
        toast.promise(
            execute,
            {
                pending: 'Executing request',
                success: 'Executed',
                error: 'Error'
            }
        )
    }

    useEffect(() => {
        const get = async () => {
            let nodes = [];
            let links = [];

            try {
                const rawNodes = await getNodes({
                    src: from,
                    dst: to,
                });
                nodes = rawNodes.map((node) => {
                    return { id: node.node_from, type: 'main' }
                }).concat(rawNodes.map((node) => {
                    return { id: node.node_to, type: 'main' }
                }))
                links = rawNodes.map((node) => {
                    return { source: node.node_from, target: node.node_to, value: node.frequency }
                })
            } catch (e) {
                console.log(e)
            }

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

        if (to !== '0xd8da6bf26964af9d7eed9e03e53415d37aa96045') {
            toast.info("You can mint SB token only for Vitalik", {
                icon: '🙃',
            })
        } else {
            setIsVitalik(true)
        }

        get()
    }, [])

    useEffect(() => {
        const get = async () => {
            const balance = await getBalanceOf({ library, address: account })
            console.log('balance', balance)
            setBalanceOf(balance.toNumber())
        }
        if (account) {
            get()
        }
    }, [account])

    return (
        <div className="flex flex-col md:flex-row h-full overflow-scroll">
            <div className="graph flex-row hidden md:flex md:w-1/2 bg-red-100 h-full relative  self-start" style={{ zIndex: 0 }}>
                <ForceGraph fromToData={fromExtToData || fromToData} from={from} to={to} />
            </div>
            <div className="flex flex-col w-full md:w-1/2 items-center justify-center mt-24 md:mt-12">
                <div class="bg-white items-center rounded-lg md:border md:border-gray-200 md:shadow-md dark:bg-gray-800 dark:border-gray-700 m-1 px-12 py-6">

                    {isVitalik && <div className="text-xl mt-2 mb-3">
                        {
                            fromToData.hasOwnProperty('nodes') && fromToData?.nodes.length > 0 && (
                                <h1 className="text-center mb-2 text-xl">
                                    WoW! You and Vitalik are bros
                                    <br></br>
                                    within <span className="text-3xl" style={{ color: mainColor }}>{fromToData?.nodes.length}</span> handshakes
                                </h1>
                            )
                        }
                        {
                            fromToData.hasOwnProperty('nodes') && fromToData?.nodes.length === 0 && (
                                <h1 className="text-center mb-2 text-xl">
                                    Ooops, you are not connected with Vitalik
                                    <br></br>
                                    <span style={{ color: mainColor }}>Gotta be more active</span>
                                </h1>
                            )
                        }
                    </div>}

                    {isVitalik && <div className="nft-template w-[300px] mx-auto border">
                        {
                            fromToData.hasOwnProperty('nodes') && fromToData?.nodes.length > 0 && (
                                <img src={BRO}></img>
                            )
                        }
                        {
                            fromToData.hasOwnProperty('nodes') && fromToData?.nodes.length === 0 && (
                                <img src={NEWB}></img>
                            )
                        }

                    </div>}

                    {
                        isVitalik && balanceOf === 0 && (<div class="flex flex-col">
                            <button
                                onClick={wrapedExecute}
                                className="mt-6 inline-flex items-center justify-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-400 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Mint SBT
                                <svg aria-hidden="true" class="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                            </button>
                        </div>)
                    }

                    {
                        fromToData.hasOwnProperty('nodes') && fromToData?.nodes.length > 0 && (
                            <div class="flex flex-col">
                                <button onClick={() => setIsOpen(true)} className="mt-3 inline-flex items-center justify-center py-2 px-3 text-sm font-medium text-center text-black border rounded-lg hover:bg-blue-200 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    Show paths
                                </button>
                                <PathsModal isOpen={isOpen} setIsOpen={setIsOpen} paths={fromToData.hasOwnProperty('nodes') ? fromToData?.nodes : []} />
                            </div>
                        )
                    }
                    {
                        balanceOf > 0 && (
                            <div class="flex flex-col">
                                <a href={`https://etherscan.io/address/${account}`} target={'_blank'}>
                                <button
                                    className="mt-6 inline-flex items-center justify-center py-2 px-3 text-sm font-medium text-center text-white bg-gray-400 rounded-lg hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    SBT minted | View on etherscan
                                    <svg aria-hidden="true" class="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                </button>
                                </a>
                            </div>
                        )
                    }

                    {
                        fromToData.hasOwnProperty('nodes') && fromToData?.nodes.length === 0 && (
                            <div class="flex flex-col mt-3">
                                No pathes
                            </div>
                        )}
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