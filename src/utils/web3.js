import { ethers } from "ethers";
import { message } from '../wrappers/web3'

const factory = '0xE92504673530a53d2F6A812cc26ecFeF3447E064';
const abiFactory = [
    "function deploy(string name,string symbol,string baseURI,string version) returns (address)",
]
const abiCollection = [
    "function getNonce(address account) public view returns (uint256)",
    "function owner() public view returns (address)",
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
                    }
                ],
                "internalType": "struct SBToken.requestSBT",
                "name": "_rSBT",
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
                    }
                ],
                "internalType": "struct SBToken.requestSBT",
                "name": "_rSBT",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "_signature",
                "type": "bytes"
            },
            {
                "internalType": "string",
                "name": "_path",
                "type": "string"
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

const requestSBT = [
    { name: "emitent", type: "address" },
    { name: "to", type: "address" },
    { name: "nonce", type: 'uint256' },
];
const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
];

const signData = async ({ library, wallet, message }) => {
    var params = [wallet, JSON.stringify(message)];
    var method = 'eth_signTypedData_v4';

    console.log(params)

    return await library.provider.request({
        method,
        params
    })
}

const buildData = (chainId, verifyingContract, emitent, to, nonce) => ({
    primaryType: 'requestSBT',
    types: { EIP712Domain, requestSBT },
    domain: { name: "SBT Contract", version: "1", chainId: chainId, verifyingContract: verifyingContract },
    message: { emitent, to, nonce },
})

export async function deployCollection(library, name,) {
    const contract = new ethers.Contract(factory, abiFactory, library);
    const _signer = library.getSigner();
    console.log('NAME', name)
    const tx = await contract.connect(_signer).deploy(name, 'SBT', 'ipfs://...', '1');
    console.log('tx', tx)
    const receipt = await tx.wait()
    console.log('receipt', receipt);
    return { tx, receipt }
}

export async function signRequest(library, collection, emitent) {
    console.log(collection)
    const contract = new ethers.Contract(collection, abiCollection, library);
    const _signer = library.getSigner();
    const _signer_address = await _signer.getAddress()
    const _network = await library.getNetwork()
    const _nonce = await contract.getNonce(_signer_address);
    const nonce = _nonce.toNumber();

    const message = buildData(_network.chainId, collection, emitent, _signer_address, nonce)
    const user_sign = await signData({ library, wallet: _signer_address, message })

    return { user_sign, user_message: message }
}

export async function attestBST(library, item) {
    console.log(library, item, item.user_message)
    const msg = JSON.parse(item.user_message);
    const contract = new ethers.Contract(item.collection_address, abiCollection, library);
    const _signer = library.getSigner();
    console.log('owner', await contract.owner())
    const tx = await contract.connect(_signer).attest(
        msg.message,
        item.user_sign,
        'ipfs://...'
    );
    console.log(tx)
    const receipt = await tx.wait()
    console.log(receipt)
    return { tx, receipt }
}