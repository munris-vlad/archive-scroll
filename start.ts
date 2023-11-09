import { privateKeyConvert, readWallets } from "./utils/wallet"
import { random, randomFloat, shuffle, sleep } from "./utils/common"
import { bridgeConfig, generalConfig, merklyConfig } from "./config"
import { makeLogger } from "./utils/logger"
import { entryPoint } from "./utils/menu"
import { Bridge } from "./modules/bridge"
import { waitGas } from "./utils/getCurrentGas"
import { Deploy } from "./modules/deploy"
import { Merkly } from "./modules/merkly"

let privateKeys = readWallets('./private_keys.txt')

if (generalConfig.shuffleWallets) {
    shuffle(privateKeys)
}

async function deployModule() {
    const logger = makeLogger("Deploy")
    for (let privateKey of privateKeys) {
        const deploy = new Deploy(privateKeyConvert(privateKey))
        await deploy.deploy()
        
        const sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
        logger.info(`Waiting ${sleepTime} sec until next wallet...`)
        await sleep(sleepTime * 1000)
    }
}

async function merklyModule() {
    const logger = makeLogger("Merkly")
    for (let privateKey of privateKeys) {
        const refuelSum = randomFloat(merklyConfig.refuelFrom, merklyConfig.refuelTo)
        const merkly = new Merkly(privateKeyConvert(privateKey))
        
        if (await merkly.refuel(refuelSum.toString())) {
            const sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
            logger.info(`Waiting ${sleepTime} sec until next wallet...`)
            await sleep(sleepTime * 1000)
        }
    }
}


async function startMenu() {
    let mode = await entryPoint()
    switch (mode) {
        case "merkly":
            await merklyModule()
            break
        case "deploy":
            await deployModule()
            break
    }
}

await startMenu()