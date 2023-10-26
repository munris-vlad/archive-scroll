import {
    Chain,
    createPublicClient,
    createWalletClient, defineChain,
    Hex,
    http,
    HttpTransport,
    PrivateKeyAccount, PublicClient,
    WalletClient
} from "viem"
import {privateKeyToAccount} from "viem/accounts"
import { generalConfig } from "../config"

const eth = defineChain({
    id: 1,
    network: 'homestead',
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: [generalConfig.ethrpc],
        },
        public: {
            http: [generalConfig.ethrpc],
        },
    },
    blockExplorers: {
        etherscan: {
            name: 'Etherscan',
            url: 'https://etherscan.io',
        },
        default: {
            name: 'Etherscan',
            url: 'https://etherscan.io',
        },
    },
    contracts: {
        ensRegistry: {
            address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        },
        ensUniversalResolver: {
            address: '0xc0497E381f536Be9ce14B0dD3817cBcAe57d2F62',
            blockCreated: 16966585,
        },
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 14353601,
        },
    },
})

function getPublicEthClient(): PublicClient {
    return createPublicClient({ chain: eth, transport: http() })
}

function getEthWalletClient(privateKey: Hex): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
    return createWalletClient({ chain: eth, account: privateKeyToAccount(privateKey), transport: http() })
}

export { getPublicEthClient, getEthWalletClient }