export const generalConfig = {
    ethrpc: 'https://rpc.ankr.com/eth',
    scrollrpc: 'https://rpc.scroll.io',
    sleepFrom: 60,
    sleepTo: 150,
    maxGas: 20,
    shuffleWallets: true,
    shuffleCustomModules: false,
    customModules: [] // scrollswap
}

export const bridgeConfig = {
    type: 'official', // 'official', 'orbiter'
    orbiterFromNetwork: 'arbitrum', // 'arbitrum', 'optimism', 'polygon'
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