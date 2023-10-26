import { formatEther, Hex, parseEther } from "viem"
import { getEthWalletClient } from "../utils/ethClient"
import { makeLogger } from "../utils/logger"
import { getArbWalletClient } from "../utils/arbClient"
import { getPublicScrollClient, getScrollWalletClient } from "../utils/scrollClient"
import { deployAbi, deployData } from "../data/abi/deploy"

export class Deploy {
    privateKey: Hex
    logger: any
    scrollClient: any
    scrollWallet: any
    walletAddress: Hex

    constructor(privateKey:Hex) {
        this.privateKey = privateKey
        this.logger = makeLogger("Deploy")
        this.scrollClient = getPublicScrollClient()
        this.scrollWallet = getScrollWalletClient(privateKey)
        this.walletAddress = this.scrollWallet.account.address
    }

    async deploy() {
        this.logger.info(`${this.walletAddress} | Deploy contract`)

        const txHash = await this.scrollWallet.deployContract({
            abi: deployAbi,
            bytecode: deployData
        })

        this.logger.info(`${this.walletAddress} | Success contract deployed: https://scrollscan.com/tx/${txHash}`)
    }
}