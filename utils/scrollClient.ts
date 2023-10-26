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
import { generalConfig } from "../config"

export const scroll = defineChain({
    id: 534352,
    name: 'Scroll',
    network: 'scroll',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: [generalConfig.scrollrpc],
        },
        public: {
            http: [generalConfig.scrollrpc],
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://blockscout.scroll.io/' },
    }
})

function getPublicScrollClient(): PublicClient {
    return createPublicClient({ chain: scroll, transport: http() })
}

function getScrollWalletClient(privateKey: Hex): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
    return createWalletClient({ chain: scroll, account: privateKeyToAccount(privateKey), transport: http() })
}

export { getPublicScrollClient, getScrollWalletClient }