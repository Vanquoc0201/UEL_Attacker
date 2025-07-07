import axios from 'axios';
import { Buffer } from 'buffer';
import { CovalentTransaction, BalanceItem, WalletFeatures } from '@/types/analysis';

const COVALENT_API_KEY = process.env.COVALENT_API_KEY;
const CHAIN_NAME = 'eth-mainnet';
const MAX_PAGES_TO_FETCH = 50; 

const headers = {
  'Authorization': `Basic ${Buffer.from(COVALENT_API_KEY + ':').toString('base64')}`
};

async function fetchAllTransactions(address: string): Promise<CovalentTransaction[]> {
    const allItems: CovalentTransaction[] = [];
    let pageNumber = 0;
    let hasMore = true;
    console.log(`Fetching all transactions for ${address}`);

    while (hasMore && pageNumber < MAX_PAGES_TO_FETCH) {
        const url = `https://api.covalenthq.com/v1/${CHAIN_NAME}/address/${address}/transactions_v3/?page-number=${pageNumber}`;
        try {
            const res = await axios.get(url, { headers });
            const data = res.data?.data;
            if (data?.items) {
                allItems.push(...data.items);
                hasMore = data.pagination ? data.pagination.has_more : false;
            } else {
                hasMore = false;
            }
            pageNumber++;
        } catch (error: any) {
            console.error(`Covalent API Error on page ${pageNumber}: ${error.response?.data?.error_message || error.message}`);
            hasMore = false; 
        }
    }
    return allItems;
}

async function fetchBalance(address: string): Promise<{ items: BalanceItem[] }> {
    const url = `https://api.covalenthq.com/v1/${CHAIN_NAME}/address/${address}/balances_v2/`;
    const res = await axios.get(url, { headers });
    return res.data.data;
}

function calculateAllFeatures(address: string, allTxs: CovalentTransaction[], balanceData: { items: BalanceItem[] }): WalletFeatures {
    const addr = address.toLowerCase();
    const features: Partial<WalletFeatures> = {};
    const toEther = (wei: string | undefined) => (wei ? Number(BigInt(wei)) / 1e18 : 0);
    const getStats = (arr: number[]) => {
        if (arr.length === 0) return { min: 0, max: 0, avg: 0 };
        const sum = arr.reduce((a, b) => a + b, 0);
        return { min: Math.min(...arr), max: Math.max(...arr), avg: sum / arr.length };
    };
    const getTimeDiffs = (txs: any[]) => {
        if (txs.length < 2) return [];
        const ts = txs.map(tx => new Date(tx.block_signed_at).getTime()).sort((a, b) => a - b);
        return ts.slice(1).map((t, i) => (t - ts[i]) / 60000); // In minutes
    };
    const getAvg = (arr: number[]) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
    const getMostCommon = (arr: (string | null)[]) => {
        if (arr.length === 0) return null;
        const counts = arr.reduce((acc, val) => {
            if (val === null) return acc;
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.keys(counts).length > 0 ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) : null;
    };

    const sentTxs = allTxs.filter(tx => tx.from_address.toLowerCase() === addr);
    const receivedTxs = allTxs.filter(tx => tx.to_address && tx.to_address.toLowerCase() === addr);
    const contractCreationTxs = sentTxs.filter(tx => tx.to_address === null);
    const sentToContractTxs = sentTxs.filter(tx => tx.to_address_is_contract);
    features.Index = 0;
    features.Address = address;
    features.FLAG = 0; 

    const allTimestamps = allTxs.map(tx => new Date(tx.block_signed_at).getTime());
    const firstTxTime = allTimestamps.length > 0 ? Math.min(...allTimestamps) : 0;
    const lastTxTime = allTimestamps.length > 0 ? Math.max(...allTimestamps) : 0;
    features['Time Diff between first and last (Mins)'] = allTimestamps.length > 1 ? (lastTxTime - firstTxTime) / 60000 : 0;
    features['Avg min between sent tnx'] = getAvg(getTimeDiffs(sentTxs));
    features['Avg min between received tnx'] = getAvg(getTimeDiffs(receivedTxs));
    features['Sent tnx'] = sentTxs.length;
    features['Received Tnx'] = receivedTxs.length;
    features['Number of Created Contracts'] = contractCreationTxs.length;
    features['Unique Received From Addresses'] = new Set(receivedTxs.map(tx => tx.from_address)).size;
    features['Unique Sent To Addresses'] = new Set(sentTxs.map(tx => tx.to_address).filter(Boolean)).size;
    return features as WalletFeatures;
}
export async function analyzeWalletAddress(address: string): Promise<WalletFeatures> {
    try {
        console.log(`Starting analysis for address: ${address}`);
        
        const [allTxs, balanceData] = await Promise.all([
            fetchAllTransactions(address),
            fetchBalance(address),
        ]);

        console.log(`Fetched ${allTxs.length} transactions.`);
        console.log(`Calculating features...`);
        
        const features = calculateAllFeatures(address, allTxs, balanceData);
        
        console.log(`Analysis complete for ${address}`);
        return features;

    } catch (error) {
        console.error(`Critical error analyzing wallet ${address}:`, error);
        throw new Error(`Failed to analyze wallet ${address}.`);
    }
}