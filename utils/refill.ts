import { Hex } from "viem"
import { random, randomFloat } from "./common"
import { binanceConfig, generalConfig } from "../config"
import { Binance } from "../modules/binance"
import { privateKeyConvert } from "./wallet"
import { makeLogger } from "./logger"

export async function refill(privateKey: Hex) {
    const logger = makeLogger("Binance")
    const sum = randomFloat(binanceConfig.withdrawFrom, binanceConfig.withdrawTo)
    const binance = new Binance(privateKeyConvert(privateKey))
    await binance.withdraw(sum.toString())

    const sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
    logger.info(`Waiting ${sleepTime} sec after refill...`)
}