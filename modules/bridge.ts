import { formatEther, Hex, parseEther } from "viem"
import { getEthWalletClient } from "../utils/ethClient"
import { bridgeAbi } from "../data/abi/bridge"
import { makeLogger } from "../utils/logger"

export class Bridge {
    privateKey: Hex
    bridgeContractAddress:Hex = '0xF8B1378579659D8F7EE5f3C929c2f3E332E41Fd6'
    logger: any

    constructor(privateKey:Hex) {
        this.privateKey = privateKey
        this.logger = makeLogger("Bridge")
    }

    async bridge(amount: string) {
        const ethWallet = getEthWalletClient(this.privateKey)
        const value: bigint = BigInt(parseEther(amount))

        this.logger.info(`${ethWallet.account.address} | Official bridge ETH -> Scroll ${amount} ETH`)
        
        try {
            const txHash = await ethWallet.writeContract({
                address: this.bridgeContractAddress,
                abi: bridgeAbi,
                functionName: 'depositETH',
                args: [
                    value,
                    BigInt(168000)
                ],
                value: value
            })
        
            this.logger.info(`${ethWallet.account.address} | Official bridge ETH -> Scroll done: https://etherscan.io/tx/${txHash}`)
        } catch (e) {
            this.logger.error(`${ethWallet.account.address} | Official bridge ETH -> Scroll error: ${e.shortMessage}`)
        }
    }
}