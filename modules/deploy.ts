import { Hex } from "viem"
import { makeLogger } from "../utils/logger"
import { getPublicScrollClient, getScrollWalletClient } from "../utils/scrollClient"
import { deployAbi, deployData, deployMerklyData } from "../data/abi/deploy"
import { waitGas } from "../utils/getCurrentGas"
import { deployConfig } from "../config"
import { random } from "../utils/common"

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
        await waitGas()
        this.logger.info(`${this.walletAddress} | Deploy contract`)
        let bytecode: any

        switch (deployConfig.type) {
            case 'merkly':
                bytecode = deployMerklyData
                break
            case 'own':
                bytecode = deployData
                break
            case 'random':
                const randomDeploy = random(1, 2)
                switch (randomDeploy) {
                    case 1:
                        bytecode = deployData
                        break
                    case 2:
                        bytecode = deployMerklyData
                        break
                }
                break
        }

        const txHash = await this.scrollWallet.deployContract({
            abi: deployAbi,
            bytecode: bytecode
        })

        this.logger.info(`${this.walletAddress} | Success contract deployed: https://scrollscan.com/tx/${txHash}`)
    }
}