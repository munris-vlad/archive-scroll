import { Hex, formatEther, parseGwei } from "viem"
import { makeLogger } from "../utils/logger"
import { random, randomFloat, sleep } from "../utils/common"
import { approve } from "../utils/approve"
import { getTokenBalance } from "../utils/tokenBalance"
import { generalConfig, swapConfig } from "../config"
import { getPublicScrollClient, getScrollWalletClient } from "../utils/scrollClient"
import { tokens } from "../data/scroll-tokens"
import { scrollswapRouterAbi } from "../data/abi/scrollswap"
import { waitGas } from "../utils/getCurrentGas"

export class Scrollswap {
    privateKey: Hex
    logger: any
    scrollswapContract: Hex = '0xEfEb222F8046aAa032C56290416C3192111C0085'
    randomNetwork: any
    scrollClient: any
    scrollWallet: any
    walletAddress: Hex

    constructor(privateKey:Hex) {
        this.privateKey = privateKey
        this.logger = makeLogger("Scrollswap")
        this.scrollClient = getPublicScrollClient()
        this.scrollWallet = getScrollWalletClient(privateKey)
        this.walletAddress = this.scrollWallet.account.address
    }

    async getMinAmountOut(fromToken: Hex, toToken: Hex, amount: BigInt, slippage: number) {
        const minAmountOut = await this.scrollClient.readContract({
            address: this.scrollswapContract,
            abi: scrollswapRouterAbi,
            functionName: 'getAmountsOut',
            args: [
                amount,
                [
                    fromToken,
                    toToken
                ]
            ]
        })

        return BigInt(Math.round(Number(minAmountOut[1]) - (Number(minAmountOut[1]) /100 * slippage)))
    }

    async swapEthToToken(toToken: string = 'USDT', amount: bigint) {
        await waitGas()
        this.logger.info(`${this.walletAddress} | Swap ${formatEther(amount)} ETH -> ${toToken}`)
        let successSwap: boolean = false
        let retryCount = 1

        while (!successSwap) {
            try {
                const minAmountOut = await this.getMinAmountOut(tokens['ETH'], tokens[toToken], amount, 1)
                const deadline: number = Math.floor(Date.now() / 1000) + 1000000

                const txHash = await this.scrollWallet.writeContract({
                    address: this.scrollswapContract,
                    abi: scrollswapRouterAbi,
                    functionName: 'swapExactETHForTokens',
                    args: [
                        minAmountOut,
                        [
                            tokens['ETH'],
                            tokens[toToken]
                        ],
                        this.walletAddress,
                        deadline
                    ],
                    value: amount
                })
                successSwap = true
                this.logger.info(`${this.walletAddress} | Success swap ${formatEther(amount)} ETH -> ${toToken}: https://scrollscan.com/tx/${txHash}`)
            } catch (e) {
                this.logger.info(`${this.walletAddress} | Error: ${e}`)
                if (retryCount <= 3) {
                    this.logger.info(`${this.walletAddress} | Wait 30 sec and retry swap ${retryCount}/3`)
                    retryCount++
                    await sleep(30 * 1000)
                } else {
                    successSwap = true
                    this.logger.info(`${this.walletAddress} | Swap unsuccessful, skip`)
                }
            }
        }
    }

    async swapTokenToEth(fromToken: string = 'USDT') {
        await waitGas()
        let amount = await getTokenBalance(this.scrollClient, tokens[fromToken], this.walletAddress)
        let successSwap: boolean = false
        let retryCount = 1

        this.logger.info(`${this.walletAddress} | Swap ${formatEther(amount)} ${fromToken} -> ETH`)

        while (!successSwap) {
            try {
                const minAmountOut = await this.getMinAmountOut(tokens[fromToken], tokens['ETH'], amount, 1)
                const deadline: number = Math.floor(Date.now() / 1000) + 1000000

                await approve(this.scrollWallet, this.scrollClient, tokens[fromToken], this.scrollswapContract, amount, this.logger)

                const sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
                this.logger.info(`${this.walletAddress} | Waiting ${sleepTime} sec after approve before swap...`)
                await sleep(sleepTime * 1000)

                const txHash = await this.scrollWallet.writeContract({
                    address: this.scrollswapContract,
                    abi: scrollswapRouterAbi,
                    functionName: 'swapExactTokensForETH',
                    args: [
                        amount,
                        minAmountOut,
                        [
                            tokens[fromToken],
                            tokens['ETH']
                        ],
                        this.walletAddress,
                        deadline
                    ]
                })

                successSwap = true
                this.logger.info(`${this.walletAddress} | Success swap ${fromToken} -> ETH: https://scrollscan.com/tx/${txHash}`)
            } catch (e) {
                this.logger.info(`${this.walletAddress} | Error: ${e}`)
                if (retryCount <= 3) {
                    this.logger.info(`${this.walletAddress} | Wait 30 sec and retry swap ${retryCount}/3`)
                    retryCount++
                    await sleep(30 * 1000)
                } else {
                    successSwap = true
                    this.logger.info(`${this.walletAddress} | Swap unsuccessful, skip`)
                }
            }
        }
    }

    async roundSwap() {
        const randomPercent: number = random(swapConfig.swapEthPercentFrom, swapConfig.swapEthPercentTo) / 100
        const ethBalance: bigint = await this.scrollClient.getBalance({ address: this.walletAddress })
        const randomChooice: number = random(1, 2)
        const randomStable = randomChooice > 1 ? 'USDT' : 'USDT'
        let amount: bigint = BigInt(Math.round(Number(ethBalance) * randomPercent))
        const sleepTimeTo = random(generalConfig.sleepFrom, generalConfig.sleepTo)

        await this.swapEthToToken(randomStable, amount)

        this.logger.info(`${this.walletAddress} | Waiting ${sleepTimeTo} sec until next swap...`)
        await sleep(sleepTimeTo * 1000)

        await this.swapTokenToEth(randomStable)
    }
}