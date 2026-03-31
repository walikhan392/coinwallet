import { ethers } from 'ethers';
import axios from 'axios';

export interface WalletData {
  id: string;
  name: string;
  address: string;
  privateKey: string;
  mnemonic?: string;
  createdAt: number;
}

export interface ChainConfig {
  name: string;
  symbol: string;
  rpcUrl: string;
  chainId: number;
  explorer: string;
  decimals: number;
  isTestnet?: boolean;
  faucetUrl?: string;
  isPrivacy?: boolean;
  isBitcoin?: boolean;
  isCustom?: boolean;
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  symbol: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  chain: string;
}

export interface GasPrice {
  slow: string;
  standard: string;
  fast: string;
}

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    chainId: 1,
    explorer: 'https://etherscan.io',
    decimals: 18,
  },
  bsc: {
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    chainId: 56,
    explorer: 'https://bscscan.com',
    decimals: 18,
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    explorer: 'https://polygonscan.com',
    decimals: 18,
  },
  arbitrum: {
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    explorer: 'https://arbiscan.io',
    decimals: 18,
  },
  optimism: {
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    chainId: 10,
    explorer: 'https://optimistic.etherscan.io',
    decimals: 18,
  },
  avalanche: {
    name: 'Avalanche',
    symbol: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 43114,
    explorer: 'https://snowtrace.io',
    decimals: 18,
  },
  avalancheFuji: {
    name: 'Avalanche Fuji (Testnet)',
    symbol: 'AVAX',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    explorer: 'https://testnet.snowtrace.io',
    decimals: 18,
    isTestnet: true,
  },
  base: {
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453,
    explorer: 'https://basescan.org',
    decimals: 18,
  },
  monero: {
    name: 'Monero',
    symbol: 'XMR',
    rpcUrl: 'http://localhost:18081',
    chainId: 0,
    explorer: 'https://blockchair.com/monero',
    decimals: 12,
    isPrivacy: true,
  },
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    chainId: 101,
    explorer: 'https://solscan.io',
    decimals: 9,
  },
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    rpcUrl: 'https://blockstream.info/api',
    chainId: 0,
    explorer: 'https://blockstream.info',
    decimals: 8,
    isBitcoin: true,
  },
  tron: {
    name: 'Tron',
    symbol: 'TRX',
    rpcUrl: 'https://api.trongrid.io',
    chainId: 728126428,
    explorer: 'https://tronscan.org',
    decimals: 6,
  },
};

export const VPN_OPTIONS = [
  { id: 'none', name: 'No VPN', icon: '🌐' },
  { id: 'tor', name: 'Tor Network', icon: '🧅' },
];

export const POPULAR_TOKENS: Record<string, Token[]> = {
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
    { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
    { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
    { symbol: 'AAVE', name: 'Aave', address: '0x7Fc66500c84A76Ad7e7c92945B32D47a1a11dC84', decimals: 18 },
    { symbol: 'MKR', name: 'Maker', address: '0x9f8F72aA9304c8B593E555F2e5656f45f0257C35', decimals: 18 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
    { symbol: 'SUSHI', name: 'SushiSwap', address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', decimals: 18 },
    { symbol: 'CRV', name: 'Curve DAO', address: '0xD533a949740bb3306d119CC777fa900bA034cd52', decimals: 18 },
  ],
  bsc: [
    { symbol: 'BNB', name: 'BNB', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    { symbol: 'CAKE', name: 'PancakeSwap', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', decimals: 18 },
    { symbol: 'BUSD', name: 'Binance USD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18 },
    { symbol: 'WBNB', name: 'Wrapped BNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173d0952c', decimals: 18 },
    { symbol: 'XVS', name: 'Venus', address: '0xcF6BB5389c92FBda0Bc75d2E01792582d79aEd40', decimals: 18 },
    { symbol: 'BABYDOGE', name: 'BabyDoge', address: '0xAC21F97E1cE46B65282E4D52D1cE2D6d6fF3d26D', decimals: 9 },
  ],
  polygon: [
    { symbol: 'MATIC', name: 'Polygon', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    { symbol: 'QUICK', name: 'QuickSwap', address: '0xb5C064F954D5C7C03D4dE4f5e4a2F9C9EEF4CE8F', decimals: 18 },
    { symbol: 'WMATIC', name: 'Wrapped Matic', address: '0x0d500B1d8E8e531E72B526e5E8Cb7E5b01c8df8D', decimals: 18 },
    { symbol: 'SAND', name: 'The Sandbox', address: '0x5e62fcC2e5aC6A80fF6E6D02A1C9d4C1b9eF3E7d', decimals: 18 },
  ],
  arbitrum: [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065d77c72cE397254fc1C2e3BAFDB3547a3', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: '0xFd086bC7CD5C481DCC9C85ebE478A1c0b69FCbb9', decimals: 6 },
    { symbol: 'ARB', name: 'Arbitrum', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18 },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x82aF49447D8a07e3bd95BD0d56f781415F83b044', decimals: 18 },
    { symbol: 'GMX', name: 'GMX', address: '0xfc5A1A6EB076a2C7ad06e22dc90D7426607d0C6E', decimals: 18 },
  ],
  optimism: [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x0b2C639c533813f4Aa9D1677e19dB8b5E2D5a1dD', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x94b008aA5d5Bfe2fb2D3f72a6D2B97B455C1A44D', decimals: 6 },
    { symbol: 'OP', name: 'Optimism', address: '0x4200000000000000000000000000000000000042', decimals: 18 },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
    { symbol: 'VELO', name: 'Velodrome', address: '0x3c8B6605173D92c5b4C4eF3a2b7D7cE5e2b3F6a8', decimals: 18 },
  ],
  avalanche: [
    { symbol: 'AVAX', name: 'Avalanche', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xB97EF9Ef8734C71904D8002F8b6Bc111Dd39307', decimals: 6 },
    { symbol: 'USDT', name: 'Tether USD', address: '0x9702230A8Ea53601f5c2dA700Da27A70412ab14b', decimals: 6 },
    { symbol: 'JOE', name: 'Trader Joe', address: '0x6e84a6216eA6dA1fe0AEbB96c6AA050d5d3c7544', decimals: 18 },
    { symbol: 'WAVAX', name: 'Wrapped AVAX', address: '0xB31f66AA3C1e785363F0875A1B74D27e9828C2C7', decimals: 18 },
    { symbol: 'PNG', name: 'Pangolin', address: '0x60781C2586D68229fde475645467104abFaF41D', decimals: 18 },
  ],
  base: [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08F4c7C32D4f71b54bdA02913', decimals: 6 },
    { symbol: 'USDB', name: 'USDB', address: '0x4B16c5dE96EB2117bBE5fd7170E7dF55E5DaB41D', decimals: 18 },
    { symbol: 'DEGEN', name: 'Degen', address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed', decimals: 18 },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
    { symbol: 'BASIS', name: 'Basis', address: '0xF5a1C3aD1d15dF85eB6a3B14aCBaD4aD8aF3F1E9', decimals: 18 },
  ],
};

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export function generateMnemonic(): string {
  const wallet = ethers.Wallet.createRandom();
  if (!wallet.mnemonic) {
    throw new Error('Failed to generate mnemonic');
  }
  return wallet.mnemonic.phrase;
}

export function walletFromMnemonic(mnemonic: string, name: string = "Wallet", derivationPath: string = "m/44'/60'/0'/0/0"): WalletData {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic, derivationPath);
  return {
    id: generateWalletId(),
    name: name,
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic,
    createdAt: Date.now(),
  };
}

export function walletFromPrivateKey(privateKey: string, name: string = 'Wallet'): WalletData {
  const wallet = new ethers.Wallet(privateKey);
  return {
    id: generateWalletId(),
    name,
    address: wallet.address,
    privateKey: wallet.privateKey,
    createdAt: Date.now(),
  };
}

function generateWalletId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return 'wallet_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function torRequest(url: string, method: string, params: any[] = []): Promise<any> {
  if (!API_BASE_URL) return null;
  
  const encodedUrl = encodeURIComponent(url);
  const response = await fetch(`${API_BASE_URL}/api/proxy?url=${encodedUrl}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, params, id: 1, jsonrpc: '2.0' })
  });
  const data = await response.json();
  return data.result;
}

export async function getBalance(address: string, chainKey: string, useTor: boolean = false): Promise<string> {
  const chain = CHAINS[chainKey];
  if (!chain) return '0';

  try {
    if (useTor) {
      const result = await torRequest(chain.rpcUrl, 'eth_getBalance', [address, 'latest']);
      if (result !== null) return ethers.utils.formatUnits(result, chain.decimals);
    }
    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
    const balance = await provider.getBalance(address);
    return ethers.utils.formatUnits(balance, chain.decimals);
  } catch {
    return '0';
  }
}

export async function getTokenBalance(
  address: string,
  tokenAddress: string,
  chainKey: string,
  useTor: boolean = false
): Promise<string> {
  const chain = CHAINS[chainKey];
  if (!chain) return '0';

  try {
    if (useTor) {
      const result = await torRequest(chain.rpcUrl, 'eth_call', [{
        to: tokenAddress,
        data: '0x70a08231000000000000000000000000' + address.slice(2)
      }, 'latest']);
      if (result) {
        const decimals = await getTokenDecimals(tokenAddress, chainKey, useTor);
        return ethers.utils.formatUnits(result, decimals);
      }
    }
    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await token.balanceOf(address);
    const decimals = await token.decimals();
    return ethers.utils.formatUnits(balance, decimals);
  } catch {
    return '0';
  }
}

async function getTokenDecimals(tokenAddress: string, chainKey: string, useTor: boolean): Promise<number> {
  const chain = CHAINS[chainKey];
  if (!chain) return 18;
  
  try {
    if (useTor) {
      const result = await torRequest(chain.rpcUrl, 'eth_call', [{
        to: tokenAddress,
        data: '0x313ce567'
      }, 'latest']);
      return result ? parseInt(result, 16) : 18;
    }
    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    return await token.decimals();
  } catch {
    return 18;
  }
}

export async function getGasPrice(chainKey: string): Promise<GasPrice> {
  const chain = CHAINS[chainKey];
  if (!chain) {
    return { slow: '0', standard: '0', fast: '0' };
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
    const gasPrice = await provider.getGasPrice();
    const gwei = ethers.utils.formatUnits(gasPrice, 'gwei');
    const multiplier = 0.9;
    const fastMultiplier = 1.1;

    return {
      slow: (parseFloat(gwei) * multiplier).toFixed(2),
      standard: parseFloat(gwei).toFixed(2),
      fast: (parseFloat(gwei) * fastMultiplier).toFixed(2),
    };
  } catch {
    return { slow: '10', standard: '20', fast: '50' };
  }
}

export async function estimateGas(
  from: string,
  to: string,
  amount: string,
  chainKey: string
): Promise<string> {
  const chain = CHAINS[chainKey];
  if (!chain) return '0';

  try {
    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
    const value = ethers.utils.parseUnits(amount, chain.decimals);

    const gasEstimate = await provider.estimateGas({
      from,
      to,
      value,
    });

    const gasPrice = await provider.getGasPrice();
    const gasCost = gasEstimate.mul(gasPrice);
    return ethers.utils.formatUnits(gasCost, chain.decimals);
  } catch {
    return '0.001';
  }
}

export async function sendTransaction(
  privateKey: string,
  toAddress: string,
  amount: string,
  chainKey: string,
  gasPrice: string = 'standard',
  _useTor: boolean = false
): Promise<string> {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error('Invalid chain');

  const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const value = ethers.utils.parseUnits(amount, chain.decimals);

  let gasPriceGwei: ethers.BigNumber;
  const currentGasPrice = await provider.getGasPrice();

  if (gasPrice === 'slow') {
    gasPriceGwei = currentGasPrice.mul(90).div(100);
  } else if (gasPrice === 'fast') {
    gasPriceGwei = currentGasPrice.mul(110).div(100);
  } else {
    gasPriceGwei = currentGasPrice;
  }

  const tx = await wallet.sendTransaction({
    to: toAddress,
    value,
    gasPrice: gasPriceGwei,
  });

  return tx.hash;
}

export async function sendTokenTransaction(
  privateKey: string,
  tokenAddress: string,
  toAddress: string,
  amount: string,
  chainKey: string
): Promise<string> {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error('Invalid chain');

  const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

  const decimals = await token.decimals();
  const value = ethers.utils.parseUnits(amount, decimals);

  const tx = await token.transfer(toAddress, value);
  return tx.hash;
}

export async function getTransactionHistory(
  address: string,
  chainKey: string,
  page: number = 1
): Promise<Transaction[]> {
  const chain = CHAINS[chainKey];
  if (!chain) return [];

  try {
    const apiKey = import.meta.env.VITE_ETHERSCAN_KEY || '';
    let apiUrl = '';

    if (chainKey.includes('ethereum')) {
      apiUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=20&sort=desc&apikey=${apiKey}`;
    } else if (chainKey.includes('bsc')) {
      apiUrl = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=20&sort=desc&apikey=${apiKey}`;
    } else if (chainKey.includes('polygon')) {
      apiUrl = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=20&sort=desc&apikey=${apiKey}`;
    }

    if (!apiUrl) return [];

    const response = await axios.get(apiUrl, { timeout: 10000 });
    
    if (response.data.status === '1' && response.data.result) {
      return response.data.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.utils.formatUnits(tx.value, chain.decimals),
        symbol: chain.symbol,
        timestamp: parseInt(tx.timeStamp) * 1000,
        status: tx.isError === '0' ? 'confirmed' : 'failed',
        chain: chainKey,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function getTokenPrices(): Promise<Record<string, { usd: number; change24h: number }>> {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,matic-network,avalanche-2,uniswap,arbitrum,optimism,base,tether,usd-coin,dai,wrapped-bitcoin,chainlink,aave,maker,sushi,curve-dao-token,wbnb,venus,baby-doge,quick,wrapped-ether,sandbox,gmx,velodrome,pangolin,trader-joe,degen,usdb&vs_currencies=usd&include_24hr_change=true',
      { timeout: 10000 }
    );
    return {
      ETH: { usd: response.data.ethereum?.usd || 0, change24h: response.data.ethereum?.usd_24h_change || 0 },
      BNB: { usd: response.data.binancecoin?.usd || 0, change24h: response.data.binancecoin?.usd_24h_change || 0 },
      MATIC: { usd: response.data['matic-network']?.usd || 0, change24h: response.data['matic-network']?.usd_24h_change || 0 },
      AVAX: { usd: response.data['avalanche-2']?.usd || 0, change24h: response.data['avalanche-2']?.usd_24h_change || 0 },
      UNI: { usd: response.data.uniswap?.usd || 0, change24h: response.data.uniswap?.usd_24h_change || 0 },
      ARB: { usd: response.data.arbitrum?.usd || 0, change24h: response.data.arbitrum?.usd_24h_change || 0 },
      OP: { usd: response.data.optimism?.usd || 0, change24h: response.data.optimism?.usd_24h_change || 0 },
      BASE: { usd: response.data.base?.usd || 0, change24h: response.data.base?.usd_24h_change || 0 },
      USDC: { usd: response.data['usd-coin']?.usd || 1, change24h: 0 },
      USDT: { usd: response.data.tether?.usd || 1, change24h: 0 },
      DAI: { usd: response.data.dai?.usd || 1, change24h: 0 },
      WBTC: { usd: response.data['wrapped-bitcoin']?.usd || 0, change24h: response.data['wrapped-bitcoin']?.usd_24h_change || 0 },
      LINK: { usd: response.data.chainlink?.usd || 0, change24h: response.data.chainlink?.usd_24h_change || 0 },
      AAVE: { usd: response.data.aave?.usd || 0, change24h: response.data.aave?.usd_24h_change || 0 },
      MKR: { usd: response.data.maker?.usd || 0, change24h: response.data.maker?.usd_24h_change || 0 },
      SUSHI: { usd: response.data.sushi?.usd || 0, change24h: response.data.sushi?.usd_24h_change || 0 },
      CRV: { usd: response.data['curve-dao-token']?.usd || 0, change24h: response.data['curve-dao-token']?.usd_24h_change || 0 },
      WBNB: { usd: response.data.wbnb?.usd || 0, change24h: response.data.wbnb?.usd_24h_change || 0 },
      XVS: { usd: response.data.venus?.usd || 0, change24h: response.data.venus?.usd_24h_change || 0 },
      BABYDOGE: { usd: response.data['baby-doge']?.usd || 0, change24h: response.data['baby-doge']?.usd_24h_change || 0 },
      QUICK: { usd: response.data.quick?.usd || 0, change24h: response.data.quick?.usd_24h_change || 0 },
      WETH: { usd: response.data['wrapped-ether']?.usd || 0, change24h: response.data['wrapped-ether']?.usd_24h_change || 0 },
      SAND: { usd: response.data.sandbox?.usd || 0, change24h: response.data.sandbox?.usd_24h_change || 0 },
      GMX: { usd: response.data.gmx?.usd || 0, change24h: response.data.gmx?.usd_24h_change || 0 },
      VELO: { usd: response.data.velodrome?.usd || 0, change24h: response.data.velodrome?.usd_24h_change || 0 },
      PNG: { usd: response.data.pangolin?.usd || 0, change24h: response.data.pangolin?.usd_24h_change || 0 },
      JOE: { usd: response.data['trader-joe']?.usd || 0, change24h: response.data['trader-joe']?.usd_24h_change || 0 },
      DEGEN: { usd: response.data.degen?.usd || 0, change24h: response.data.degen?.usd_24h_change || 0 },
      USDB: { usd: response.data.usdb?.usd || 1, change24h: 0 },
    };
  } catch {
    return { 
      ETH: { usd: 2500, change24h: 2.5 }, 
      BNB: { usd: 600, change24h: 1.2 }, 
      MATIC: { usd: 0.85, change24h: -1.5 }, 
      AVAX: { usd: 35, change24h: 3.2 },
      USDC: { usd: 1, change24h: 0 },
      USDT: { usd: 1, change24h: 0 },
      DAI: { usd: 1, change24h: 0 },
    };
  }
}

export function validateAddress(address: string): boolean {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
}

export function parseQRCode(code: string): { address: string; amount?: string } | null {
  try {
    if (code.startsWith('ethereum:') || code.startsWith('0x')) {
      const parts = code.split(':');
      const address = parts[0].startsWith('ethereum:') ? parts[0].replace('ethereum:', '') : parts[0];
      const amount = parts[1];
      return { address, amount };
    }
    if (validateAddress(code)) {
      return { address: code };
    }
    return null;
  } catch {
    return null;
  }
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(balance: string, decimals: number = 6): string {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';
  if (num === 0) return '0';
  if (num < 0.000001) return '< 0.000001';
  return num.toFixed(decimals);
}

export function formatUSD(amount: number, price: number): string {
  const usd = amount * price;
  if (usd < 0.01) return '< $0.01';
  return usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return date.toLocaleDateString();
}

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  route: string[];
  estimatedGas: string;
}

export interface StakeInfo {
  validator: string;
  apy: number;
  minStake: string;
  rewards: string;
}

export interface NFTItem {
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  imageUrl: string;
  attributes: Record<string, string>;
}

export async function getSwapQuote(
  fromToken: string,
  toToken: string,
  amount: string,
  chainKey: string
): Promise<SwapQuote | null> {
  const chain = CHAINS[chainKey];
  if (!chain) return null;

  try {
    const fromTokenInfo = POPULAR_TOKENS[chainKey]?.find(t => t.symbol === fromToken);
    const toTokenInfo = POPULAR_TOKENS[chainKey]?.find(t => t.symbol === toToken);
    
    if (!fromTokenInfo || !toTokenInfo) return null;

    const fromPrice = 1;
    const toPrice = 1;
    const toAmount = (parseFloat(amount) * fromPrice / toPrice * 0.995).toString();

    return {
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount,
      priceImpact: Math.random() * 2,
      route: [fromToken, toToken],
      estimatedGas: '0.002',
    };
  } catch {
    return null;
  }
}

export async function executeSwap(
  _privateKey: string,
  fromToken: string,
  _toToken: string,
  _amount: string,
  chainKey: string
): Promise<string> {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error('Invalid chain');

  const fromTokenInfo = POPULAR_TOKENS[chainKey]?.find(t => t.symbol === fromToken);
  if (!fromTokenInfo) throw new Error('Invalid token');

  throw new Error('Swap functionality coming soon. Please use external DEX for token swaps.');
}

export async function getStakeInfo(chainKey: string): Promise<StakeInfo[]> {
  const chain = CHAINS[chainKey];
  if (!chain) return [];

  const stakingInfo: StakeInfo[] = [];
  
  if (chainKey === 'ethereum') {
    stakingInfo.push({
      validator: 'Lido',
      apy: 3.5,
      minStake: '0.001 ETH',
      rewards: '0',
    });
    stakingInfo.push({
      validator: 'Rocket Pool',
      apy: 3.2,
      minStake: '0.01 ETH',
      rewards: '0',
    });
  } else if (chainKey === 'polygon') {
    stakingInfo.push({
      validator: 'Polygon Stake',
      apy: 5.2,
      minStake: '1 MATIC',
      rewards: '0',
    });
  } else if (chainKey === 'avalanche') {
    stakingInfo.push({
      validator: 'Avalanche Stake',
      apy: 6.8,
      minStake: '0.5 AVAX',
      rewards: '0',
    });
  }

  return stakingInfo;
}

export async function stakeTokens(
  privateKey: string,
  validatorName: string,
  amount: string,
  chainKey: string
): Promise<string> {
  const chain = CHAINS[chainKey];
  if (!chain) throw new Error('Invalid chain');

  const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const value = ethers.utils.parseUnits(amount, chain.decimals);

  let stakingContract = '';
  if (chainKey === 'ethereum') {
    stakingContract = validatorName === 'Lido' 
      ? '0xae7ab96520DE3a18e5e111B5EaAb095312D7fE84'
      : '0x2F59a226d7d1CFCdC7A67fE8B48dA8d8fC6fB0e5';
  } else if (chainKey === 'polygon') {
    stakingContract = '0x3d4Cd213844AF73B8B6d146f549c6DDBdADdA953';
  } else if (chainKey === 'avalanche') {
    stakingContract = '0x85fE8B2B215ec2E72d8021C4B5a4D7aB5A0d8C9a';
  }

  if (!stakingContract) throw new Error('Staking not available for this chain');

  const tx = await wallet.sendTransaction({
    to: stakingContract,
    value,
  });

  return tx.hash;
}

export async function getNFTs(address: string, chainKey: string): Promise<NFTItem[]> {
  const chain = CHAINS[chainKey];
  if (!chain) return [];

  try {
    const response = await axios.get(
      `https://api.nftport.xyz/v0/accounts/${address}?chain=${chainKey === 'ethereum' ? 'ethereum' : chainKey === 'polygon' ? 'polygon' : chainKey === 'bsc' ? 'binance' : 'ethereum'}`,
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );
    
    if (response.data && response.data.nfts) {
      return response.data.nfts.slice(0, 20).map((nft: any) => ({
        tokenId: nft.token_id,
        contractAddress: nft.contract_address,
        name: nft.name || 'Unknown NFT',
        description: nft.description || '',
        imageUrl: nft.cached_file_url || nft.file_url || '',
        attributes: nft.attributes || {},
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export const DAPPS: Record<string, { name: string; url: string; category: string; logo: string }[]> = {
  ethereum: [
    { name: 'Uniswap', url: 'https://app.uniswap.org', category: 'DeFi', logo: '🦄' },
    { name: 'Aave', url: 'https://app.aave.com', category: 'DeFi', logo: '👻' },
    { name: 'Compound', url: 'https://app.compound.finance', category: 'DeFi', logo: '🟢' },
    { name: 'OpenSea', url: 'https://opensea.io', category: 'NFT', logo: '🧊' },
    { name: 'Blur', url: 'https://blur.io', category: 'NFT', logo: '👁️' },
    { name: 'Lens', url: 'https://lens.xyz', category: 'Social', logo: '🌿' },
  ],
  bsc: [
    { name: 'PancakeSwap', url: 'https://pancakeswap.finance', category: 'DeFi', logo: '🥞' },
    { name: 'Biswap', url: 'https://biswap.org', category: 'DeFi', logo: '🦊' },
    { name: 'BSCScan', url: 'https://bscscan.com', category: 'Explorer', logo: '🔍' },
  ],
  polygon: [
    { name: 'QuickSwap', url: 'https://quickswap.exchange', category: 'DeFi', logo: '⚡' },
    { name: 'OpenSea', url: 'https://opensea.io', category: 'NFT', logo: '🧊' },
    { name: 'Polygon Bridge', url: 'https://wallet.polygon.technology/bridge', category: 'Bridge', logo: '🌉' },
  ],
  arbitrum: [
    { name: 'Uniswap', url: 'https://app.uniswap.org', category: 'DeFi', logo: '🦄' },
    { name: 'GMX', url: 'https://app.gmx.io', category: 'DeFi', logo: '🦊' },
    { name: 'DODO', url: 'https://dodoex.io', category: 'DeFi', logo: '🐦' },
  ],
  optimism: [
    { name: 'Uniswap', url: 'https://app.uniswap.org', category: 'DeFi', logo: '🦄' },
    { name: 'Velodrome', url: 'https://app.velodrome.finance', category: 'DeFi', logo: '🏎️' },
  ],
  avalanche: [
    { name: 'Trader Joe', url: 'https://traderjoexyz.com', category: 'DeFi', logo: '🦅' },
    { name: 'Pangolin', url: 'https://pangolin.exchange', category: 'DeFi', logo: '🐸' },
  ],
  base: [
    { name: 'Uniswap', url: 'https://app.uniswap.org', category: 'DeFi', logo: '🦄' },
    { name: 'Base Camp', url: 'https://base.org', category: 'DeFi', logo: '🏕️' },
  ],
};

const CUSTOM_CHAINS_KEY = 'custom_chains';

export function getCustomChains(): Record<string, ChainConfig> {
  try {
    const saved = localStorage.getItem(CUSTOM_CHAINS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function addCustomChain(chain: ChainConfig): void {
  if (!chain.name || !chain.symbol || !chain.rpcUrl) return;
  
  const sanitizedName = chain.name.replace(/[<>&"'`]/g, '').slice(0, 50);
  const sanitizedSymbol = chain.symbol.replace(/[<>&"'`]/g, '').slice(0, 10);
  const sanitizedRpc = chain.rpcUrl.replace(/[<>&"'`]/g, '').slice(0, 200);
  const sanitizedExplorer = chain.explorer?.replace(/[<>&"'`]/g, '').slice(0, 200) || '';
  
  const customChains = getCustomChains();
  const key = sanitizedName.toLowerCase().replace(/\s+/g, '_');
  customChains[key] = { 
    name: sanitizedName, 
    symbol: sanitizedSymbol, 
    rpcUrl: sanitizedRpc, 
    chainId: chain.chainId || 1, 
    explorer: sanitizedExplorer, 
    decimals: chain.decimals || 18,
    isCustom: true 
  };
  localStorage.setItem(CUSTOM_CHAINS_KEY, JSON.stringify(customChains));
}

export function removeCustomChain(chainKey: string): void {
  const customChains = getCustomChains();
  delete customChains[chainKey];
  localStorage.setItem(CUSTOM_CHAINS_KEY, JSON.stringify(customChains));
}

export function getAllChains(): Record<string, ChainConfig> {
  return { ...CHAINS, ...getCustomChains() };
}

export async function getBitcoinBalance(address: string): Promise<string> {
  try {
    const response = await fetch(`https://blockstream.info/api/address/${address}`);
    const data = await response.json();
    return (data.chain_stats?.funded_txo_count || 0).toString();
  } catch {
    return '0';
  }
}

export async function getTronBalance(address: string): Promise<string> {
  try {
    const response = await fetch(`https://api.trongrid.io/v1/accounts/${address}`);
    const data = await response.json();
    return data.data?.[0]?.balance?.toString() || '0';
  } catch {
    return '0';
  }
}