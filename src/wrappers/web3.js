import { useState, useEffect, createContext } from 'react';

import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { toHex } from '../utils/formatters';
import { createCompany } from '../utils/api'

export const networkParams = {
    "0x539": {
      chainId: "0x539",
      rpcUrls: ["http://localhost:8545"],
      chainName: "HH",
      nativeCurrency: { name: "ONE", decimals: 18, symbol: "ONE" },
      blockExplorerUrls: ["https://explorer.harmony.one"],
      iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"]
    },
  };

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {}
});

const message = "You sign this so we can identify you. Nothing to worry about";

const Web3Context = createContext(null);

function Web3({ children }) {
    const [provider, setProvider] = useState();
    const [library, setLibrary] = useState();
    const [account, setAccount] = useState();
    const [signature, setSignature] = useState("");
    const [error, setError] = useState("");
    const [chainId, setChainId] = useState();
    const [network, setNetwork] = useState();
    // const [message, setMessage] = useState();
    const [signedMessage, setSignedMessage] = useState("");
    const [verified, setVerified] = useState();

    const connectWallet = async () => {
        try {
            const provider = await web3Modal.connect();
            const library = new ethers.providers.Web3Provider(provider, 'any');
            const accounts = await library.listAccounts();
            const network = await library.getNetwork();

            setProvider(provider);
            setLibrary(library);
            setNetwork(network);
            if (accounts) setAccount(accounts[0]);
            setChainId(network.chainId);
            console.log('ok')
        } catch (error) {
            console.log('fail')
            setError(error);
        }
    };

    const auth = async () => {
        const sign = localStorage.getItem('account_signature')
        if (!sign) {
            console.log('signature does not exist');
            await signMessage();
            console.log('signature', signature);
            localStorage.setItem('account_signature', signature);
        } else {
            console.log('signature exists');
            setSignedMessage(message);
            setSignature(localStorage.getItem('account_signature'));
            await verifyMessage();
            console.log('verified', verified)
        }
    }

    const signMessage = async () => {
        if (!library) return;
        try {
            const signature = await library.provider.request({
                method: "personal_sign",
                params: [message, account]
            });
            setSignedMessage(message);
            setSignature(signature);
        } catch (error) {
            setError(error);
        }
    };

    const verifyMessage = async (signature) => {
        console.log(message, signature, account)
        if (!library) return;
        try {
            const verify = await library.provider.request({
                method: "personal_ecRecover",
                params: [message, signature]
            });
            return (verify === account.toLowerCase());
        } catch (error) {
            setError(error);
        }
    };

    const refreshState = () => {
        setAccount(null);
        setChainId();
        setNetwork("");
        setSignature("");
        setVerified(undefined);
    };

    const disconnect = async () => {
        await web3Modal.clearCachedProvider();
        refreshState();
    };

    useEffect(() => {
        if (provider?.on) {
            const handleAccountsChanged = (accounts) => {
                console.log("accountsChanged", accounts);
                if (accounts) setAccount(accounts[0]);
                window.location.reload(false);
            };

            const handleChainChanged = async (_hexChainId) => {
                setChainId(_hexChainId);
            };

            const handleDisconnect = () => {
                console.log("disconnect", error);
                disconnect();
            };

            provider.on("accountsChanged", handleAccountsChanged);
            provider.on("chainChanged", handleChainChanged);
            provider.on("disconnect", handleDisconnect);

            return () => {
                if (provider.removeListener) {
                    provider.removeListener("accountsChanged", handleAccountsChanged);
                    provider.removeListener("chainChanged", handleChainChanged);
                    provider.removeListener("disconnect", handleDisconnect);
                }
            };
        }
    }, [provider]);

    const switchNetwork = async (chainId) => {
        try {
            await library.provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: toHex(chainId) }]
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await library.provider.request({
                        method: "wallet_addEthereumChain",
                        params: [1]
                    });
                } catch (error) {
                    setError(error);
                }
            }
        }
    };

    useEffect(() => {
        if (web3Modal.cachedProvider) {
            connectWallet();
        }
    }, []);

    return (
        <>
            <Web3Context.Provider value={{ connectWallet, disconnect, signMessage, verifyMessage, auth, account, network, library }}>
                {children}
            </Web3Context.Provider>
        </>
    )

}

export { Web3, Web3Context, message };