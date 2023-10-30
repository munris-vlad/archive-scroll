import { formatEther, Hex, parseEther } from "viem"
import { getEthWalletClient } from "../utils/ethClient"
import { makeLogger } from "../utils/logger"
import { getArbWalletClient } from "../utils/arbClient"

export class Orbiter {
    privateKey: Hex
    arbitrumOrbiterAddress:Hex = '0x80C67432656d59144cEFf962E8fAF8926599bCF8'
    logger: any
    scrollOrbiterDestination: string = '9019'

    constructor(privateKey:Hex) {
        this.privateKey = privateKey
        this.logger = makeLogger("Orbiter")
    }

    async arbitrumOrbiter(amount: string) {
        const wallet = getArbWalletClient(this.privateKey)
        let orbiterAmount = amount.slice(0, -4) + this.scrollOrbiterDestination
        const value: bigint = parseEther(orbiterAmount)

        this.logger.info(`${wallet.account.address} | Orbiter bridge Arbitrum -> Scroll ${amount} ETH`)
        
        try {
            const txHash = await wallet.sendTransaction({
                to: this.arbitrumOrbiterAddress,
                value: value
            })
        
            this.logger.info(`${wallet.account.address} | Orbiter bridge Arbitrum -> Scroll done: https://arbiscan.io/tx/${txHash}`)
        } catch (e) {
            this.logger.error(`${wallet.account.address} | Orbiter bridge Arbitrum -> Scroll error: ${e.shortMessage}`)
        }
    }
}