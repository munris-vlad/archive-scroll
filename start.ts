import { privateKeyConvert, readWallets } from "./utils/wallet"
import { random, randomFloat, shuffle, sleep } from "./utils/common"
import { bridgeConfig, generalConfig, merklyConfig } from "./config"
import { makeLogger } from "./utils/logger"
import { entryPoint } from "./utils/menu"
import { Bridge } from "./modules/bridge"
import { waitGas } from "./utils/getCurrentGas"
import { Orbiter } from "./modules/orbiter"
import { Scrollswap } from "./modules/scrollswap"
import { Deploy } from "./modules/deploy"
import { Merkly } from "./modules/merkly"

let privateKeys = readWallets('./private_keys.txt')

if (generalConfig.shuffleWallets) {
    shuffle(privateKeys)
}

async function bridgeModule() {
    const logger = makeLogger("Bridge")
    for (let privateKey of privateKeys) {
        const bridge = new Bridge(privateKeyConvert(privateKey))
        const sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)

        const officialBridgeSum = randomFloat(bridgeConfig.bridgeFrom, bridgeConfig.bridgeTo)
        if (await waitGas('bridge')) {
            await bridge.bridge(officialBridgeSum.toString())
        }
        
        logger.info(`Waiting ${sleepTime} sec until next wallet...`)
        await sleep(sleepTime * 1000)
    }
}

async function orbiterModule() {
    const logger = makeLogger("Orbiter")
    for (let privateKey of privateKeys) {
        const orbiter = new Orbiter(privateKeyConvert(privateKey))
        const sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)

        const bridgeSum = randomFloat(bridgeConfig.orbiterFrom, bridgeConfig.orbiterTo)
        switch (bridgeConfig.orbiterFromNetwork) {
            case 'arbitrum':
                await orbiter.arbitrumOrbiter(bridgeSum.toString())
                break
        }
        
        logger.info(`Waiting ${sleepTime} sec until next wallet...`)
        await sleep(sleepTime * 1000)
    }
}

async function scrollswapModule() {
    const logger = makeLogger("Scrollswap")
    for (let privateKey of privateKeys) {
        const scrollswap = new Scrollswap(privateKeyConvert(privateKey))
        await scrollswap.roundSwap()
        
        const sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
        logger.info(`Waiting ${sleepTime} sec until next wallet...`)
        await sleep(sleepTime * 1000)
    }
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

async function randomModule() {
    const logger = makeLogger("Random")
    for (let privateKey of privateKeys) {
        const randomChooice = random(1, 10)
        let sleepTime

        switch (randomChooice) {
            
        }

        sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
        logger.info(`Waiting ${sleepTime} sec until next wallet...`)
        await sleep(sleepTime * 1000)
    }
}

async function randomSwapModule() {
    const logger = makeLogger("Random swap")
    for (let privateKey of privateKeys) {
        const randomChooice = random(1, 5)
        let sleepTime

        switch (randomChooice) {
            
        }

        sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
        logger.info(`Waiting ${sleepTime} sec until next wallet...`)
        await sleep(sleepTime * 1000)
    }
}

async function randomL0Module() {
    const logger = makeLogger("Random L0")
    for (let privateKey of privateKeys) {
        const randomChooice = random(1, 3)
        let sleepTime

        switch (randomChooice) {
           
        }

        sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
        logger.info(`Waiting ${sleepTime} sec until next wallet...`)
        await sleep(sleepTime * 1000)
    }
}

async function stableSwapModule() {
    const logger = makeLogger("StableSwap")
    for (let privateKey of privateKeys) {
        // const pancake = new Pancake(privateKeyConvert(privateKey))

        // await pancake.swapStablesToEth()

        const sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
        logger.info(`Waiting ${sleepTime} sec until next wallet...`)
        await sleep(sleepTime * 1000)
    }
}

async function customModule() {
    const logger = makeLogger("Custom")
    let customModules = generalConfig.customModules

    for (let privateKey of privateKeys) {
        let sleepTime
        if (generalConfig.shuffleCustomModules) {
            shuffle(customModules)
        }
        for (let customModuleItem of customModules) {
            switch (customModuleItem) {
                
            }

            sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
            logger.info(`Waiting ${sleepTime} sec until next module...`)
            await sleep(sleepTime * 1000)
        }

        sleepTime = random(generalConfig.sleepFrom, generalConfig.sleepTo)
        logger.info(`Waiting ${sleepTime} sec until next wallet...`)
        await sleep(sleepTime * 1000)
    }
}

async function startMenu() {
    let mode = await entryPoint()
    switch (mode) {
        case "bridge":
            await bridgeModule()
            break
        case "orbiter":
            await orbiterModule()
            break
        case "merkly":
            await merklyModule()
            break
        case "scrollswap":
            await scrollswapModule()
            break
        case "deploy":
            await deployModule()
            break
        case "random":
            await randomModule()
            break
        case "random_swap":
            await randomSwapModule()
            break
        case "stable_to_eth":
            await stableSwapModule()
            break
        case "custom":
            await customModule()
            break
    }
}

await startMenu()