export const generalConfig = {
    ethrpc: 'https://rpc.ankr.com/eth',
    scrollrpc: 'https://rpc.scroll.io',
    sleepFrom: 150,
    sleepTo: 250,
    maxGas: 16,
    shuffleWallets: true,
    shuffleCustomModules: false,
    customModules: [] // scrollswap
}

export const bridgeConfig = {
    type: 'official', // 'official', 'orbiter'
    orbiterFromNetwork: 'arbitrum',
    bridgeFrom: 0.001,
    bridgeTo: 0.002,
    orbiterFrom: 0.005, // min 0.005
    orbiterTo: 0.0055,
    maxGas: 10 // for official bridge Eth -> Scroll
}

export const swapConfig = {
    swapEthPercentFrom: 20,
    swapEthPercentTo: 30
}

export const merklyConfig = {
    refuelFrom: 0.0006,
    refuelTo: 0.0007,
    sourceNetwork: 'auto', // Scroll | to scroll: 'auto' 'random' 'Arbitrum' 'Optimism' 'Polygon' 'Avalanche' 'Base'
    destinationNetwork: 'Scroll', // Scroll | from scroll: 'random' 'Zora' 'Arbitrum Nova' 'Moonbeam' 'Gnosis' 'OpBNB' 'Astar'
    checkScrollBalance: true, // проверять наличие баланса в Scroll
    minBalance: 1 // если баланс >= этой суммы в USD, refuel будет пропускаться
}

export const deployConfig = {
    type: 'random' // 'own', 'merkly', 'random'
}