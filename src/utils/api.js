import axios from 'axios'
import axiosRetry from 'axios-retry';

axiosRetry(axios, { retries: 5 });

const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiYzYzZjQ4NmUtNzg3Yi00ZTNlLWI1YTMtNjE2MzFhZmZlNmU0IiwiYXVkIjpbImZhc3RhcGktdXNlcnM6YXV0aCIsImZhc3RhcGktdXNlcnM6dmVyaWZ5Il19.aksYMPh_YpZONn-EB2omwbPqtNxDOcv9F4dbG_5erAM'

const getNodes = async ({ src, dst, exclude_contracts }) => {

    const payload = {
        "src": src,
        "dst": dst,
        "exclude_contracts": exclude_contracts,
    }
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        timeout: 3000
    }
    let res = await axios.post('https://api.quantor.me/v1/eth/graph/fraud/shortest_path', payload, config)
    return res.data
}

const getNeibors = async ({ address }) => {
    const payload = {
        'src': address,
    }
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        timeout: 3000
    }
    let res = await axios.post('https://api.quantor.me/v1/eth/graph/fraud/bfs_nodes', payload, config)
    return res.data.map((item) => {
        return {
            from_address_: address,
            to_address_: item,
        }
    })
}

const getRequest = async ({ from, to, nonce }) => {
    let res = await axios.post(`http://buterin.me:8000/sbt_emitent_signature?from_addr=${from}&to_addr=${to}&nonce=${nonce}`)
    return res.data
}

export { getNodes, getNeibors, getRequest }