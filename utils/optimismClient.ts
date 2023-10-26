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
import { privateKeyToAccount } from "viem/accounts"
import { publicL2OpStackActions } from 'op-viem'

export const optimism = defineChain({
    id: 10,
    name: 'Optimism',
    network: 'optimism',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['https://optimism.llamarpc.com'],
            webSocket: ['wss://https://optimism.llamarpc.com'],
        },
        public: {
            http: ['https://optimism.llamarpc.com'],
            webSocket: ['wss://https://optimism.llamarpc.com'],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://optimistic.etherscan.io/' },
    }
})

function getPublicOpClient(): PublicClient {
    return createPublicClient({ chain: optimism, transport: http() }).extend(publicL2OpStackActions)
}

function getOpWalletClient(privateKey: Hex): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
    return createWalletClient({ chain: optimism, account: privateKeyToAccount(privateKey), transport: http() })
}

export { getPublicOpClient, getOpWalletClient }