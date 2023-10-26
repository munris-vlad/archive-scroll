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
import {arbitrum} from "viem/chains"

function getPublicArbClient(): PublicClient {
    return createPublicClient({ chain: arbitrum, transport: http() })
}

function getArbWalletClient(privateKey: Hex): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
    return createWalletClient({ chain: arbitrum, account: privateKeyToAccount(privateKey), transport: http() })
}

export { getPublicArbClient, getArbWalletClient }