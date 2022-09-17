import { getDefaultProvider } from "ethers";

const mainnetProvider = getDefaultProvider('https://eth-mainnet.g.alchemy.com/v2/Ft9YhMBOjWCDwqWlBPPvvH6GuU-ESGWj');

export async function lookupAddress(address) {
    return await mainnetProvider.lookupAddress(address);
}

export async function resolveName(name) {
    if (name === 'vitalik.eth') {
        return '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
    }
    return await mainnetProvider.resolveName(name);
}