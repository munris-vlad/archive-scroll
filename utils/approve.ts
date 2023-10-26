import { Hex } from "viem"
import { erc20Abi } from "../data/abi/erc20"

async function checkAllowance(client: any, tokenAddress: Hex, contractAddress: Hex, walletAddress: Hex) {
    const allowance = await client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [
            walletAddress,
            contractAddress
        ]
    })

    return allowance
}

export async function approve(walletClient: any, client: any, tokenAddress: Hex, contractAddress: Hex, amount: bigint, logger: any) {
    const allowance = await checkAllowance(client, tokenAddress, contractAddress, walletClient.account.address)
    
    if (allowance < amount) {
        const txHash = await walletClient.writeContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [
                contractAddress,
                amount
            ]
        })
        
        logger.info(`${walletClient.account.address} | Success approve: https://basescan.org/tx/${txHash}`)
    } else {
        logger.info(`${walletClient.account.address} | Already approved`)
    }
}