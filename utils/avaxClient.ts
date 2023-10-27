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
import {avalanche} from "viem/chains"

function getPublicAvaxClient(): PublicClient {
    return createPublicClient({ chain: avalanche, transport: http() })
}

function getAvaxWalletClient(privateKey: Hex): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
    return createWalletClient({ chain: avalanche, account: privateKeyToAccount(privateKey), transport: http() })
}

export { getPublicAvaxClient, getAvaxWalletClient }