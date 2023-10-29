import { Hex, encodePacked, parseEther, parseGwei } from "viem"
import { makeLogger } from "../utils/logger"
import { merklyAbi } from "../data/abi/merkly"
import { getUsdValue, random, randomFloat, sleep } from "../utils/common"
import { merklyConfig } from "../config"
import { refill } from "../utils/refill"
import { waitGas } from "../utils/getCurrentGas"
import { getPublicScrollClient, getScrollWalletClient } from "../utils/scrollClient"
import { getPolygonWalletClient, getPublicPolygonClient } from "../utils/polygonClient"
import { getArbWalletClient, getPublicArbClient } from "../utils/arbClient"
import { getOpWalletClient, getPublicOpClient } from "../utils/optimismClient"
import { getAvaxWalletClient, getPublicAvaxClient } from "../utils/avaxClient"
import axios from 'axios'

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
    walletAddress: Hex = '0x'
    ethPrice: number = 0
    sourceNetworks: any = ['Polygon', 'Arbitrum', 'Optimism', 'Avalanche']
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
                break
            case 'Optimism':
                this.client = getPublicOpClient()
                this.wallet = getOpWalletClient(this.privateKey)
                this.merklyContract = this.merklyContracts.optimism
                this.explorerLink = 'https://optimistic.etherscan.io'
                break
            case 'Polygon':
                this.client = getPublicPolygonClient()
                this.wallet = getPolygonWalletClient(this.privateKey)
                this.merklyContract = this.merklyContracts.polygon
                this.explorerLink = 'https://polygonscan.com'
                break
            case 'Avalanche':
                this.client = getPublicAvaxClient()
                this.wallet = getAvaxWalletClient(this.privateKey)
                this.merklyContract = this.merklyContracts.avalanche
                this.explorerLink = 'https://avascan.info/blockchain/dfk'
                break
        }
        this.walletAddress = this.wallet.account.address
    }

    async defineSourceNetwork() {
        let polygonPrice = 0
        let avaxPrice = 0
        await axios.get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD').then(response => {
            this.ethPrice = response.data.USD
        })

        await axios.get('https://min-api.cryptocompare.com/data/price?fsym=MATIC&tsyms=USD').then(response => {
            polygonPrice = response.data.USD
        })

        await axios.get('https://min-api.cryptocompare.com/data/price?fsym=AVAX&tsyms=USD').then(response => {
            avaxPrice = response.data.USD
        })

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
        
        if (merklyConfig.sourceNetwork === 'auto') {
            const topBalance:number = await this.defineSourceNetwork()

            if ((parseInt(value) * this.ethPrice) < topBalance) {
                this.logger.info(`${this.walletAddress} | Not enough balance, skip`)
                return
            }
        }

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