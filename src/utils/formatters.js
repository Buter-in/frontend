export const truncateAddress = (address, size) => {
    if (!address) return "No Account";
    const match = address.match(
        `^(0x[a-zA-Z0-9]{${size}})[a-zA-Z0-9]+([a-zA-Z0-9]{${size}})$`
    );
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
};

export const toHex = (num) => {
    const val = Number(num);
    return "0x" + val.toString(16);
};

export const str32ToAddress = (str) => {
    return '0x' + str.slice(str.length - 40)
}