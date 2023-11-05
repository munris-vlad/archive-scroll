import { Hex, encodePacked, parseEther, parseGwei } from "viem"
import { makeLogger } from "../utils/logger"
import { merklyAbi, merklyAbiBase } from "../data/abi/merkly"
import { getSymbolPrice, getUsdValue, random, randomFloat, sleep } from "../utils/common"
import { merklyConfig } from "../config"
import { refill } from "../utils/refill"
import { waitGas } from "../utils/getCurrentGas"
import { getPublicScrollClient, getScrollWalletClient } from "../utils/scrollClient"
import { getPolygonWalletClient, getPublicPolygonClient } from "../utils/polygonClient"
import { getArbWalletClient, getPublicArbClient } from "../utils/arbClient"
import { getOpWalletClient, getPublicOpClient } from "../utils/optimismClient"
import { getAvaxWalletClient, getPublicAvaxClient } from "../utils/avaxClient"
import axios from 'axios'
import { getBaseWalletClient, getPublicBaseClient } from "../utils/baseClient"

export class Merkly {
    privateKey: Hex
    logger: any
    destNetwork: number = 214
    explorerLink: string = 'https://scrollscan.com'
    merklyContract: Hex
    merklyContracts: { [key: string]: Hex } = {
        'optimism': '0xa2c203d7ef78ed80810da8404090f926d67cd892',
        'arbitrum': '0xaa58e77238f0e4a565343a89a79b4addd744d649',
        'avalanche': '0xe030543b943bdcd6559711ec8d344389c66e1d56',
        'polygon': '0xa184998ec58dc1da77a1f9f1e361541257a50cf4',
        'base': '0x6bf98654205b1ac38645880ae20fc00b0bb9ffca',
        'scroll': '0x7dfb5e7808b5eb4fb8b9e7169537575f6ff1a218'
    }

    randomNetwork: any
    client: any
    wallet: any
    walletAddress: Hex = '0x'
    ethPrice: number = 0
    sourceNetwork: string = 'Auto'
    sourceNetworks: any = ['Polygon', 'Arbitrum', 'Optimism', 'Avalanche', 'Base']
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
        this.wallet = getScrollWalletClient(privateKey)
        this.walletAddress = this.wallet.account.address

        if (merklyConfig.sourceNetwork === 'Scroll') {
            this.client = getPublicScrollClient()
            this.wallet = getScrollWalletClient(privateKey)
            this.walletAddress = this.wallet.account.address
            
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
                const randomNetwork = random(1, 4)

                switch (randomNetwork) {
                    case 1:
                        this.setSourceNetwork('Arbitrum')
                        break
                    case 2:
                        this.setSourceNetwork('Optimism')
                        break
                    case 3:
                        this.setSourceNetwork('Polygon')
                        break
                    case 4:
                        this.setSourceNetwork('Avalanche')
                        break
                    case 5:
                        this.setSourceNetwork('Base')
                        break
                }
            } else if (merklyConfig.sourceNetwork !== 'random' && merklyConfig.sourceNetwork !== 'auto') {
                this.setSourceNetwork(merklyConfig.sourceNetwork)
            }
        }
    }

    setSourceNetwork(network: string) {
        switch (network) {
            case 'Arbitrum':
                this.client = getPublicArbClient()
                this.wallet = getArbWalletClient(this.privateKey)
                this.merklyContract = this.merklyContracts.arbitrum
                this.explorerLink = 'https://arbiscan.io'
                this.sourceNetwork = 'Arbitrum'
                break
            case 'Optimism':
                this.client = getPublicOpClient()
                this.wallet = getOpWalletClient(this.privateKey)
                this.merklyContract = this.merklyContracts.optimism
                this.explorerLink = 'https://optimistic.etherscan.io'
                this.sourceNetwork = 'Optimism'
                break
            case 'Polygon':
                this.client = getPublicPolygonClient()
                this.wallet = getPolygonWalletClient(this.privateKey)
                this.merklyContract = this.merklyContracts.polygon
                this.explorerLink = 'https://polygonscan.com'
                this.sourceNetwork = 'Polygon'
                break
            case 'Avalanche':
                this.client = getPublicAvaxClient()
                this.wallet = getAvaxWalletClient(this.privateKey)
                this.merklyContract = this.merklyContracts.avalanche
                this.explorerLink = 'https://avascan.info/blockchain/dfk'
                this.sourceNetwork = 'Avalanche'
                break
            case 'Base':
                this.client = getPublicBaseClient()
                this.wallet = getBaseWalletClient(this.privateKey)
                this.merklyContract = this.merklyContracts.base
                this.explorerLink = 'https://basescan.org'
                this.sourceNetwork = 'Base'
                break
        }
        this.walletAddress = this.wallet.account.address
    }

    async defineSourceNetwork() {
        let polygonPrice = await getSymbolPrice('MATIC')
        let avaxPrice = await getSymbolPrice('AVAX')

        let balance:any = { Polygon: 0, Avalanche: 0, Arbitrum: 0, Optimism: 0}

        for (const network of this.sourceNetworks) {
            switch (network) {
                case "Polygon":
                    balance['Polygon'] = getUsdValue(await getPublicPolygonClient().getBalance({ address: this.walletAddress }), polygonPrice)
                    break
                case "Avalanche":
                    balance['Avalanche'] = getUsdValue(await getPublicAvaxClient().getBalance({ address: this.walletAddress }), avaxPrice)
                    break
                case "Arbitrum":
                    balance['Arbitrum'] = getUsdValue(await getPublicArbClient().getBalance({ address: this.walletAddress }), this.ethPrice)
                    break
                case "Optimism":
                    balance['Optimism'] = getUsdValue(await getPublicOpClient().getBalance({ address: this.walletAddress }), this.ethPrice)
                    break
                case "Base":
                    balance['Base'] = getUsdValue(await getPublicBaseClient().getBalance({ address: this.walletAddress }), this.ethPrice)
                    break
            }
        }
    
        let topNetwork = null
        let topBalance = -Infinity
        
        for (const key in balance) {
            if (balance.hasOwnProperty(key)) {
                const currentBalance = balance[key]
                if (currentBalance > topBalance) {
                    topBalance = currentBalance
                    topNetwork = key
                }
            }
        }

        if (topNetwork) {
            this.logger.info(`${this.walletAddress} | Auto network: ${topNetwork} ($${topBalance.toFixed(2)})`)
            this.setSourceNetwork(topNetwork)
        }

        return topBalance
    }

    async estimateLayerzeroFee(adapterParams: any) {
        let value: bigint
        const txValue = await this.client.readContract({
            address: this.merklyContract,
            abi: this.sourceNetwork === 'Base' ? merklyAbiBase : merklyAbi,
            functionName: this.sourceNetwork === 'Base' ? 'estimateSendFee' : 'estimateGasBridgeFee',
            args: this.sourceNetwork === 'Base' ? [this.destNetwork, '0x', adapterParams] : [this.destNetwork, false, adapterParams]
        })

        value = txValue[0]
        return this.sourceNetwork === 'Base' ? BigInt(Math.round(Number(value) * 1.01)) : BigInt(value)
    }

    async refuel(value: string) {
        this.ethPrice = await getSymbolPrice('ETH')
        if (merklyConfig.checkScrollBalance) {
            const balance = await getPublicScrollClient().getBalance({ address: this.walletAddress })
            const scrollBalance = getUsdValue(balance, this.ethPrice)
            if (scrollBalance >= merklyConfig.minBalance) {
                this.logger.info(`${this.walletAddress} | Balance in Scroll is $${scrollBalance.toFixed(2)} and enough, skip`)
                return false
            } else {
                this.logger.info(`${this.walletAddress} | Balance in Scroll is $${scrollBalance.toFixed(2)} and not enough, continue`)
            }
        }

        if (merklyConfig.sourceNetwork === 'auto') {
            const topBalance:number = await this.defineSourceNetwork()

            if ((parseFloat(value) * this.ethPrice) > topBalance) {
                this.logger.error(`${this.walletAddress} | Not enough balance, skip`)
                return false
            }
        }

        await waitGas()

        this.logger.info(`${this.walletAddress} | Refuel ${this.sourceNetwork} -> ${this.randomNetwork.name}`)
        let amount = BigInt(parseEther(value))

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
                let txHash
                if (this.sourceNetwork === 'Base') {
                    txHash = await this.wallet.writeContract({
                        address: this.merklyContract,
                        abi: merklyAbiBase,
                        functionName: 'bridgeGas',
                        args: [
                            this.destNetwork,
                            this.walletAddress,
                            adapterParams
                        ],
                        value: value,
                        maxPriorityFeePerGas: parseGwei('0.000084412'),
                        maxFeePerGas: parseGwei('0.000097240')
                    })
                } else {
                    txHash = await this.wallet.writeContract({
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
                }
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

        return true
    }
}