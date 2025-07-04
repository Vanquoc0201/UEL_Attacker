import axios from "axios";
import fs from "fs";
import { Buffer } from "buffer"; 
const COVALENT_API_KEY = 'cqt_rQRXGfp9xwYYj3vbj9KJcWYpWyKj';
const CHAIN_NAME = 'eth-mainnet';

const ADDRESSES_TO_PROCESS = [
  "0x8b39b83a81a1a73223596a79e4361543812557e9", 
  "0xb6a35601332a6e1338a4939255792294a539e248",
  "0x098b716b8aafa21512f46aa51d79d616e211e14d"
];
const FRAUDULENT_ADDRESSES = new Set([
].map(addr => addr.toLowerCase()));
const MAX_PAGES_TO_FETCH = 50; 
const headers = {
  'Authorization': `Basic ${Buffer.from(COVALENT_API_KEY + ':').toString('base64')}`
};
async function fetchAllTransactions(address) {
    const allItems = [];
    let pageNumber = 0;
    let hasMore = true;
    console.log(`   -> Bắt đầu lấy tất cả giao dịch từ endpoint: transactions_v3`);

    while (hasMore && pageNumber < MAX_PAGES_TO_FETCH) {
        const url = `https://api.covalenthq.com/v1/${CHAIN_NAME}/address/${address}/transactions_v3/?page-number=${pageNumber}`;
        try {
            const res = await axios.get(url, { headers });
            const data = res.data?.data;
            if (data) {
                if (data.items) allItems.push(...data.items);
                hasMore = data.pagination ? data.pagination.has_more : false;
                if (hasMore) process.stdout.write(`.`);
            } else {
                hasMore = false;
            }
            pageNumber++;
        } catch (error) {
            console.error(`\n      ❌ Lỗi mạng hoặc API ở trang ${pageNumber}: ${error.response?.data?.error_message || error.message}`);
            hasMore = false;
        }
    }
    process.stdout.write("\n");
    return allItems;
}
function calculateAllFeatures(index, address, allTxs, balanceData) {
    const addr = address.toLowerCase();
    const features = {};
    const toEther = (wei) => (wei ? Number(BigInt(wei)) / 1e18 : 0);
    const getStats = (arr) => {
        if (arr.length === 0) return { min: 0, max: 0, avg: 0 };
        const sum = arr.reduce((a, b) => a + b, 0);
        return { min: Math.min(...arr), max: Math.max(...arr), avg: sum / arr.length };
    };
    const getTimeDiffs = (txs) => {
        if (txs.length < 2) return [];
        const ts = txs.map(tx => new Date(tx.block_signed_at).getTime()).sort((a, b) => a - b);
        return ts.slice(1).map((t, i) => (t - ts[i]) / 60000);
    };
    const getAvg = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
    const getMostCommon = (arr) => {
        if (arr.length === 0) return null;
        const counts = arr.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {});
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    };

    const sentTxs = allTxs.filter(tx => tx.from_address.toLowerCase() === addr);
    const receivedTxs = allTxs.filter(tx => tx.to_address && tx.to_address.toLowerCase() === addr);
    const contractCreationTxs = sentTxs.filter(tx => tx.to_address === null);
    const sentToContractTxs = sentTxs.filter(tx => tx.to_address_is_contract);

    const tokenTransfers = allTxs.flatMap(tx => tx.log_events || [])
        .filter(log => log.decoded?.name === "Transfer" && log.decoded.params)
        .map(log => {
            const fromParam = log.decoded.params.find(p => p.name === 'from');
            const toParam = log.decoded.params.find(p => p.name === 'to');
            return {
                block_signed_at: log.block_signed_at,
                from_address: fromParam?.value,
                to_address: toParam?.value,
                token_symbol: log.sender_contract_ticker_symbol,
                value_quote: log.decoded.params.find(p => p.name === 'value')?.value_quote,
                to_address_is_contract: toParam?.is_contract,
            };
        })
        .filter(t => t.from_address && t.to_address);
    const sentTokens = tokenTransfers.filter(t => t.from_address.toLowerCase() === addr);
    const receivedTokens = tokenTransfers.filter(t => t.to_address.toLowerCase() === addr);
    const sentTokensToContract = sentTokens.filter(t => t.to_address_is_contract);
    
    features.Index = index;
    features.Address = address;
    features.FLAG = FRAUDULENT_ADDRESSES.has(addr) ? 1 : 0;

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

    const sentValues = sentTxs.map(tx => toEther(tx.value));
    const recValues = receivedTxs.map(tx => toEther(tx.value));
    const sentContractValues = sentToContractTxs.map(tx => toEther(tx.value));
    const sentStats = getStats(sentValues);
    const recStats = getStats(recValues);
    const sentContractStats = getStats(sentContractValues);
    features['min value received'] = recStats.min;
    features['max value received'] = recStats.max;
    features['avg val received'] = recStats.avg;
    features['min val sent'] = sentStats.min;
    features['max val sent'] = sentStats.max;
    features['avg val sent'] = sentStats.avg;
    features['min value sent to contract'] = sentContractStats.min;
    features['max val sent to contract'] = sentContractStats.max;
    features['avg value sent to contract'] = sentContractStats.avg;

    features['total transactions (including tnx to create contract)'] = allTxs.length;
    features['total Ether sent'] = sentValues.reduce((a, b) => a + b, 0);
    features['total ether received'] = recValues.reduce((a, b) => a + b, 0);
    features['total ether sent contracts'] = sentContractValues.reduce((a, b) => a + b, 0);
    const ethToken = balanceData.items.find(token => token.native_token);
    features['total ether balance'] = ethToken ? Number(ethToken.balance) / (10 ** ethToken.contract_decimals) : 0;

    features['Total ERC20 tnxs'] = tokenTransfers.length;
    features['ERC20 total Ether received'] = receivedTokens.reduce((sum, t) => sum + (t.value_quote || 0), 0);
    features['ERC20 total ether sent'] = sentTokens.reduce((sum, t) => sum + (t.value_quote || 0), 0);
    features['ERC20 total Ether sent contract'] = sentTokensToContract.reduce((sum, t) => sum + (t.value_quote || 0), 0);
    features['ERC20 uniq sent addr'] = new Set(sentTokens.map(t => t.to_address)).size;
    features['ERC20 uniq rec addr'] = new Set(receivedTokens.map(t => t.from_address)).size;
    features['ERC20 uniq sent addr.1'] = features['ERC20 uniq sent addr'];

    features['ERC20 uniq rec contract addr'] = new Set(receivedTokens.filter(t => t.from_address_is_contract).map(t => t.from_address)).size;
    features['ERC20 avg time between sent tnx'] = getAvg(getTimeDiffs(sentTokens));
    features['ERC20 avg time between rec tnx'] = getAvg(getTimeDiffs(receivedTokens));
    features['ERC20 avg time between rec 2 tnx'] = 0;

    features['ERC20 avg time between contract tnx'] = getAvg(getTimeDiffs(sentTokensToContract));

    const sentTokenValues = sentTokens.map(t => t.value_quote || 0);
    const receivedTokenValues = receivedTokens.map(t => t.value_quote || 0);
    const sentTokenToContractValues = sentTokensToContract.map(t => t.value_quote || 0);
    const erc20SentStats = getStats(sentTokenValues);
    const erc20RecStats = getStats(receivedTokenValues);
    const erc20SentContractStats = getStats(sentTokenToContractValues);
    features['ERC20 min val rec'] = erc20RecStats.min;
    features['ERC20 max val rec'] = erc20RecStats.max;
    features['ERC20 avg val rec'] = erc20RecStats.avg;
    features['ERC20 min val sent'] = erc20SentStats.min;
    features['ERC20 max val sent'] = erc20SentStats.max;
    features['ERC20 avg val sent'] = erc20SentStats.avg;
    features['ERC20 min val sent contract'] = erc20SentContractStats.min;
    features['ERC20 max val sent contract'] = erc20SentContractStats.max;
    features['ERC20 avg val sent contract'] = erc20SentContractStats.avg;
    
    features['ERC20 uniq sent token name'] = new Set(sentTokens.map(t => t.token_symbol)).size;
    features['ERC20 uniq rec token name'] = new Set(receivedTokens.map(t => t.token_symbol)).size;
    features['ERC20 most sent token type'] = getMostCommon(sentTokens.map(t => t.token_symbol));
    features['ERC20_most_rec_token_type'] = getMostCommon(receivedTokens.map(t => t.token_symbol));

    return features;
}
async function main() {
    const outputFile = "wallet_features.json";
    let existingData = [];
    const existingAddresses = new Set();

    try {
        if (fs.existsSync(outputFile)) {
            const fileContent = fs.readFileSync(outputFile, 'utf-8');
            if(fileContent) {
                existingData = JSON.parse(fileContent);
                existingData.forEach(item => existingAddresses.add(item.Address.toLowerCase()));
            }
            console.log(`🔍 Đã tìm thấy ${existingData.length} ví trong file ${outputFile}.`);
        }
    } catch (e) {
        console.error(`⚠️ Không thể đọc hoặc phân tích file ${outputFile}. Sẽ tạo file mới. Lỗi: ${e.message}`);
        existingData = [];
    }

    const newAddressesToScrape = ADDRESSES_TO_PROCESS.filter(
        addr => !existingAddresses.has(addr.toLowerCase())
    );

    if (newAddressesToScrape.length === 0) {
        console.log("✅ Tất cả các ví trong danh sách đã được xử lý. Không có gì để làm thêm.");
        return;
    }

    console.log(`⏳ Cần xử lý ${newAddressesToScrape.length} ví mới.`);
    const allNewResults = [];
    let currentIndex = existingData.length;

    for (const address of newAddressesToScrape) {
        console.log(`\n=== 🚀 ĐANG XỬ LÝ VÍ MỚI ${allNewResults.length + 1}/${newAddressesToScrape.length}: ${address} ===`);
        try {
            const [allTxs, balanceRes] = await Promise.all([
                fetchAllTransactions(address),
                axios.get(`https://api.covalenthq.com/v1/${CHAIN_NAME}/address/${address}/balances_v2/`, { headers })
            ]);

            console.log(`   -> Đã lấy xong: ${allTxs.length} giao dịch.`);
            console.log(`   -> Đang tính toán features...`);
            
            const features = calculateAllFeatures(currentIndex, address, allTxs, balanceRes.data.data);
            allNewResults.push(features);
            
            console.log(`✅ Hoàn tất ví ${address}`);
            currentIndex++;
        } catch (error) {
            console.error(`\n❌ Lỗi nghiêm trọng khi xử lý ví ${address}: ${error.message}`);
        }
    }

    const combinedData = [...existingData, ...allNewResults];

    fs.writeFileSync(outputFile, JSON.stringify(combinedData, null, 2));
    console.log(`\n\n🎉 Đã cập nhật file ${outputFile} với ${allNewResults.length} kết quả mới. Tổng cộng có ${combinedData.length} ví.`);
}

main();