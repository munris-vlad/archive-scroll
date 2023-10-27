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
import {polygon} from "viem/chains"

function getPublicPolygonClient(): PublicClient {
    return createPublicClient({ chain: polygon, transport: http() })
}

function getPolygonWalletClient(privateKey: Hex): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
    return createWalletClient({ chain: polygon, account: privateKeyToAccount(privateKey), transport: http() })
}

export { getPublicPolygonClient, getPolygonWalletClient }