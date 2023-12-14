import { Hex } from "viem"
import { makeLogger } from "../utils/logger"
import { getPublicScrollClient, getScrollWalletClient } from "../utils/scrollClient"
import { deployAbi, deployData, deployMerklyData } from "../data/abi/deploy"
import { waitGas } from "../utils/getCurrentGas"
import { deployConfig } from "../config"
import { random } from "../utils/common"
import axios from "axios"
import { deployNftAbi } from "../data/abi/deploy-nft"

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

    async mint() {
        await waitGas()
        this.logger.info(`${this.walletAddress} | Mint NFT for contract deploy`)

        const data = await axios.get(`https://nft.scroll.io/p/${this.walletAddress}.json`).then(response => {
            return response.data
        })

        const { proof, metadata } = data

        if (proof) {
            try {
                const txHash = await this.scrollWallet.writeContract({
                    address: '0x74670a3998d9d6622e32d0847ff5977c37e0ec91',
                    abi: deployNftAbi,
                    functionName: 'mint',
                    args: [
                        this.walletAddress,
                        metadata,
                        proof
                    ]
                })
                
                this.logger.info(`${this.walletAddress} | Success minted: https://scrollscan.com/tx/${txHash}`)
            } catch (e) {
                this.logger.error(`${this.walletAddress} | Error ${e.toString()}`)
            }
        } else {
            this.logger.info(`${this.walletAddress} | No NFT for this wallet`)
        }
    }
}