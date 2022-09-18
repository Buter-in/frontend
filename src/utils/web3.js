import { ethers } from "ethers";
import { message } from '../wrappers/web3'

const collection = {
    80001: '0x9fc7cbe0aebb56d1a9f01a79ecfa3c32032021ae',
}
const abiCollection = [
    "function getNonce(address account) public view returns (uint256)",
    "function owner() public view returns (address)",
    "function balanceOf(address _owner) public view returns (uint256)",
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "emitent",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "nonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "path",
                        "type": "string"
                    }
                ],
                "internalType": "struct SBToken_V4.approveSBT",
                "name": "_aSBT",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "_signature",
                "type": "bytes"
            }
        ],
        "name": "verify",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "emitent",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "nonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "path",
                        "type": "string"
                    }
                ],
                "internalType": "struct SBToken_V4.approveSBT",
                "name": "_aSBT",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "_signature",
                "type": "bytes"
            }
        ],
        "name": "attest",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
]

export async function getNonce({ library }) {
    const network = await library.getNetwork()
    const contract = new ethers.Contract(collection[network.chainId], abiCollection, library);
    const _signer = library.getSigner();
    const _signer_address = await _signer.getAddress()
    const _nonce = (await contract.getNonce(_signer_address)).toNumber();

    return _nonce
}

export async function getBalanceOf({ library, address }) {
    const network = await library.getNetwork()
    const contract = new ethers.Contract(collection[network.chainId], abiCollection, library);
    const _balance = await contract.balanceOf(address);

    console.log(_balance)
    return _balance
}

export async function verifyRequest({ library, message, signature }) {
    const network = await library.getNetwork()
    const contract = new ethers.Contract(collection[network.chainId], abiCollection, library);

    const isValid = await contract.verify(
        message,
        signature
    )
    return isValid
}

export async function executeRequest({ library, message, signature, nonce }) {
    const network = await library.getNetwork()
    const contract = new ethers.Contract(collection[network.chainId], abiCollection, library);
    const _signer = library.getSigner();
    const tx = await contract.connect(_signer).attest(
        message,
        signature,
    );
    console.log(tx)
    const receipt = await tx.wait()
    console.log(receipt)
    return { tx, receipt }
}