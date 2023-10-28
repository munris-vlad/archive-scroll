import { Hex, encodePacked, parseEther, parseGwei } from "viem"
import { makeLogger } from "../utils/logger"
import { merklyAbi } from "../data/abi/merkly"
import { random, randomFloat, sleep } from "../utils/common"
import { merklyConfig } from "../config"
import { refill } from "../utils/refill"
import { waitGas } from "../utils/getCurrentGas"
import { getPublicScrollClient, getScrollWalletClient } from "../utils/scrollClient"
import { getPolygonWalletClient, getPublicPolygonClient } from "../utils/polygonClient"
import { getArbWalletClient, getPublicArbClient } from "../utils/arbClient"
import { getOpWalletClient, getPublicOpClient } from "../utils/optimismClient"
import { getAvaxWalletClient, getPublicAvaxClient } from "../utils/avaxClient"

export class Merkly {
    privateKey: Hex
    logger: any
    destNetwork: number = 195
    explorerLink: string = 'https://scrollscan.com'
    merklyContract: Hex
    merklyContracts: { [key: string]: Hex } = {
        'optimism': '0xa2c203d7ef78ed80810da8404090f926d67cd892',
        'arbitrum': '0xaa58e77238f0e4a565343a89a79b4addd744d649',
        'avalanche': '0xe030543b943bdcd6559711ec8d344389c66e1d56',
        'polygon': '0xa184998ec58dc1da77a1f9f1e361541257a50cf4',
        'scroll': '0x7dfb5e7808b5eb4fb8b9e7169537575f6ff1a218'
    }

    randomNetwork: any
    client: any
    wallet: any
    walletAddress: Hex
    networks = [
        {
            id: 110,
            name: 'Arbitrum'
        },
        {
            id: 184,
            name: 'Base'
        },
    ]

    constructor(privateKey:Hex) {
        this.privateKey = privateKey
        this.logger = makeLogger("Merkly")
        this.merklyContract = this.merklyContracts.scroll

        if (merklyConfig.sourceNetwork === 'Scroll') {
            this.client = getPublicScrollClient()
            this.wallet = getScrollWalletClient(privateKey)
            
            if (merklyConfig.destinationNetwork === 'random') {
                this.randomNetwork = this.networks[random(0, this.networks.length-1)]
            } else {
                this.randomNetwork = this.networks.find(network => network.name === merklyConfig.destinationNetwork)
            }
            
            this.destNetwork = this.randomNetwork.id
        } else {
            this.randomNetwork = {
                name: 'Scroll',
                id: 214
            }
            this.destNetwork = 214

            if (merklyConfig.sourceNetwork === 'random') {
                const randomNetwork = random(1, 2)

                switch (randomNetwork) {
                    case 1:
                        this.client = getPublicArbClient()
                        this.wallet = getArbWalletClient(privateKey)
                        this.merklyContract = this.merklyContracts.arbitrum
                        break
                    case 2:
                        this.client = getPublicOpClient()
                        this.wallet = getOpWalletClient(privateKey)
                        this.merklyContract = this.merklyContracts.optimism
                        break
                    case 3:
                        this.client = getPublicPolygonClient()
                        this.wallet = getPolygonWalletClient(privateKey)
                        this.merklyContract = this.merklyContracts.polygon
                        break
                    case 4:
                        this.client = getPublicAvaxClient()
                        this.wallet = getAvaxWalletClient(privateKey)
                        this.merklyContract = this.merklyContracts.avalanche
                        break
                }
            } else {
                switch (merklyConfig.sourceNetwork) {
                    case 'Arbitrum':
                        this.client = getPublicArbClient()
                        this.wallet = getArbWalletClient(privateKey)
                        this.merklyContract = this.merklyContracts.arbitrum
                        this.explorerLink = 'https://arbiscan.io'
                        break
                    case 'Optimism':
                        this.client = getPublicOpClient()
                        this.wallet = getOpWalletClient(privateKey)
                        this.merklyContract = this.merklyContracts.optimism
                        this.explorerLink = 'https://optimistic.etherscan.io'
                        break
                    case 'Polygon':
                        this.client = getPublicPolygonClient()
                        this.wallet = getPolygonWalletClient(privateKey)
                        this.merklyContract = this.merklyContracts.polygon
                        this.explorerLink = 'https://polygonscan.com'
                        break
                    case 'Avalanche':
                        this.client = getPublicAvaxClient()
                        this.wallet = getAvaxWalletClient(privateKey)
                        this.merklyContract = this.merklyContracts.avalanche
                        this.explorerLink = 'https://avascan.info/blockchain/dfk'
                        break
                }
            }
        }

        this.walletAddress = this.wallet.account.address
    }

    async estimateLayerzeroFee(adapterParams: any) {
        let value: bigint
        const txValue = await this.client.readContract({
            address: this.merklyContract,
            abi: merklyAbi,
            functionName: 'estimateGasBridgeFee',
            args: [
                this.destNetwork,
                false,
                adapterParams
            ]
        })

        value = txValue[0]
        return BigInt(value)
    }

    async refuel(value: string) {
        // await waitGas()
        this.logger.info(`${this.walletAddress} | Refuel to ${this.randomNetwork.name}`)

        let amount = BigInt(parseEther(value))
        console.log(amount)
        console.log(this.destNetwork)
        console.log(this.walletAddress)

        let isSuccess = false
        let retryCount = 1

        while (!isSuccess) {
            try {
                const adapterParams = encodePacked(
                    [
                        "uint16", 
                        "uint", 
                        "uint", 
                        "address"
                    ], 
                    [
                        2, 
                        BigInt('250000'),
                        amount,
                        this.walletAddress
                    ]
                )

                let value = await this.estimateLayerzeroFee(adapterParams)

                const txHash = await this.wallet.writeContract({
                    address: this.merklyContract,
                    abi: merklyAbi,
                    functionName: 'bridgeGas',
                    args: [
                        this.destNetwork,
                        this.walletAddress,
                        adapterParams
                    ],
                    value: value
                })
                isSuccess = true
                this.logger.info(`${this.walletAddress} | Success refuel to ${this.randomNetwork.name}: ${this.explorerLink}/tx/${txHash}`)
            } catch (e) {
                this.logger.info(`${this.walletAddress} | Error: ${e}`)

                if (retryCount <= 3) {
                    this.logger.info(`${this.walletAddress} | Wait 30 sec and retry refuel ${retryCount}/3`)
                    retryCount++
                    await sleep(30 * 1000)
                } else {
                    isSuccess = true
                    this.logger.info(`${this.walletAddress} | Refuel unsuccessful, skip`)
                }
            }
        }
    }
}