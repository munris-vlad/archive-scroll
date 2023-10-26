import { Hex } from "viem"
import { random } from "./common"
import axios from "axios"

export function getRandomContract(contracts: string[]) {
    return contracts[random(0, contracts.length-1)] as Hex
}

export async function submitTx(address: string, hash: string, chainId = 8453) {
    axios.post("https://mint.fun/api/mintfun/submit-tx", {
        address: address,
        chainId: chainId,
        hash: hash,
        isAllowlist: false,
        source: 'projectPage'
    })
    .then(function (response) {})
    .catch(function (error) {
        console.log(error)
    })
}