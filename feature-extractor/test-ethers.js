import { ethers } from 'ethers';
import tokenAbi from "./erc20-abi.json" assert { type: "json" };
import dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.QUICKNODE_RPC_URL);

// Phân 1 : Lấy thông tin tài khoản
// async function main() {
//   const address = "0x96405B4d4286917D212e40d839B2cB0FeeC1af13";
//   const balance = await provider.getBalance(address); // số ETH trong tài khoản
//   const blockNumber = await provider.getBlockNumber(); // số block hiện tại
//   const feeData = await provider.getFeeData(); // thông tin phí giao dịch
//   const tx = await provider.getTransaction("0xa1c07b9f65b28fefb168c94c14886174f17d4b5d42f268239f309a471f5d7d0c"); // thông tin giao dịch
//   const block = await provider.getBlock(blockNumber); // thông tin block
//   const nonce = await provider.getTransactionCount("0xf29f4c445c7a3abf54c9ac899b38e4267e29cee1"); // số lượng giao dịch đã thực hiện
//   const logs = await provider.getLogs({
//     address: "0x6fb81383733800ec4b4a2670aefbd18e7e76f13a", // Một token ERC20 thật trên Sepolia
//     fromBlock: 8690000,
//     toBlock: 8700000,
//   });
//   const network = await provider.getNetwork(); // thông tin mạng
//   console.log("Network chain ID:",network.chainId);
//   console.log("Transaction details:", tx);
//   console.log("Block details:", block);
//   console.log("Transaction count (nonce):", nonce);
//   logs.forEach((log, index) => {
//     console.log(`\n📦 Log ${index + 1}:`);
//     console.log("Block:", log.blockNumber);
//     console.log("Tx Hash:", log.transactionHash);
//     console.log("Data:", log.data);
//     console.log("Topics:", log.topics);
//   });
//   console.log("ETH balance:", ethers.formatEther(balance));
//   console.log("Block number:", blockNumber);
//   console.log("Gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
// }

// main();
// Phần 2: Tương tác với Smart Contract
async function main() {
  const contract = new ethers.Contract(
    "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    tokenAbi,
    provider
  );

  const name = await contract.name();
  const symbol = await contract.symbol();
  const totalSupply = await contract.totalSupply();
  const balance = await contract.balanceOf("0x96405B4d4286917D212e40d839B2cB0FeeC1af13");

  console.log("✅ Token Name:", name);
  console.log("✅ Symbol:", symbol);
  console.log("✅ Total Supply:", ethers.formatUnits(totalSupply, 18));
  console.log("✅ User Balance:", ethers.formatUnits(balance, 18));
}
/**
 * Nếu bạn muốn lấy địa chỉ của logic contract từ một proxy contract, bạn có thể sử dụng đoạn mã sau:
const proxyContract = new ethers.Contract(
  "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  proxyAbi, // ABI bạn gửi ở trên
  provider
);

const logicAddress = await proxyContract.implementation();
console.log("🎯 Logic contract address:", logicAddress);

 */

main();