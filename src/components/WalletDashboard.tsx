import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, Card, CardContent,
  List, ListItem, ListItemAvatar, Avatar, Alert, Tab, Tabs
} from '@mui/material';
import {
  Wallet as WalletIcon, Send as SendIcon, QrCode, History,
  ContentCopy, Check, Logout, ExpandMore, Add,
  SwapHoriz, Savings, Collections, Language, TrendingUp,
  TrendingDown, Search, Settings
} from '@mui/icons-material';
import { useWallet } from '../context/WalletContext';
import {
  formatBalance, formatUSD, formatAddress, CHAINS,
  sendTransaction, validateAddress, getTransactionHistory, POPULAR_TOKENS,
  getTokenBalance, executeSwap, stakeTokens,
  getNFTs, DAPPS, addCustomChain, getAllChains, type Transaction, type NFTItem
} from '../utils/crypto';

interface TokenWithPrice {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  change24h: number;
  value: number;
}

export function WalletDashboard() {
  const {
    wallets, activeWallet, balances, prices, selectedChain,
    setSelectedChain, refreshBalances, disconnect, setActiveWallet,
    createWallet, selectedVpn, setSelectedVpn
  } = useWallet();

  const useTor = selectedVpn === 'tor';

  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showStake, setShowStake] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddChain, setShowAddChain] = useState(false);
  const [customChainForm, setCustomChainForm] = useState({ name: '', symbol: '', rpcUrl: '', chainId: '', explorer: '', decimals: '18' });
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [staking, setStaking] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [sendForm, setSendForm] = useState({ to: '', amount: '' });
  const [swapForm, setSwapForm] = useState({ fromToken: 'ETH', toToken: 'USDC', amount: '' });
  const [stakeForm, setStakeForm] = useState({ validator: '', amount: '' });
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [chainAnchorEl, setChainAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  // @ts-ignore
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // @ts-ignore
  const [loadingHistory, setLoadingHistory] = useState(false);
  // @ts-ignore
  const [loadingTokens, setLoadingTokens] = useState(false);
  // @ts-ignore
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  // @ts-ignore
  const [gasSpeed, setGasSpeed] = useState<'slow' | 'standard' | 'fast'>('standard');
  const [vpnConnecting, setVpnConnecting] = useState(false);
  const [vpnStatus, setVpnStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const chain = CHAINS[selectedChain];

  useEffect(() => {
    const checkVpnStatus = async () => {
      try {
        const response = await fetch('/api/tor-status');
        const data = await response.json();
        if (data.status === 'active') {
          setVpnStatus('connected');
        }
      } catch {}
    };
    checkVpnStatus();
  }, []);

  const handleVpnToggle = async () => {
    if (selectedVpn === 'none') {
      setVpnConnecting(true);
      setVpnStatus('connecting');
      try {
        const response = await fetch('/api/vpn/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'tor' })
        });
        const data = await response.json();
        if (data.success) {
          setSelectedVpn('tor');
          setVpnStatus('connected');
        } else {
          setVpnStatus('disconnected');
        }
      } catch {
        setVpnStatus('disconnected');
      }
      setVpnConnecting(false);
    } else {
      await fetch('/api/vpn/disconnect', { method: 'POST' });
      setSelectedVpn('none');
      setVpnStatus('disconnected');
    }
  };

  const totalPortfolioValue = Object.entries(balances).reduce((total, [chainKey, bal]) => {
    const chainInfo = CHAINS[chainKey];
    const tokenPrice = prices[chainInfo?.symbol || '']?.usd || 0;
    return total + (parseFloat(bal) * tokenPrice);
  }, 0);

  const tokensWithPrices: TokenWithPrice[] = (POPULAR_TOKENS[selectedChain] || []).map(token => {
    const balance = token.address === '0x0000000000000000000000000000000000000000'
      ? balances[selectedChain]
      : tokenBalances[token.symbol] || '0';
    const tokenPrice = prices[token.symbol]?.usd || 0;
    const change24h = prices[token.symbol]?.change24h || 0;
    const value = parseFloat(balance) * tokenPrice;
    return {
      symbol: token.symbol,
      name: token.name,
      balance,
      price: tokenPrice,
      change24h,
      value
    };
  }).filter(t => t.value > 0).sort((a, b) => b.value - a.value);

  useEffect(() => {
    if (activeWallet && showHistory) {
      loadTransactions();
    }
  }, [activeWallet, selectedChain, showHistory]);

  useEffect(() => {
    if (activeWallet) {
      loadTokenBalances();
    }
  }, [activeWallet, selectedChain]);

  const loadTransactions = async () => {
    if (!activeWallet) return;
    setLoadingHistory(true);
    try {
      const txs = await getTransactionHistory(activeWallet.address, selectedChain);
      setTransactions(txs);
    } catch {
      setTransactions([]);
    }
    setLoadingHistory(false);
  };

  const loadTokenBalances = async () => {
    if (!activeWallet) return;
    setLoadingTokens(true);
    const tokens = POPULAR_TOKENS[selectedChain] || [];
    const balances: Record<string, string> = {};

    for (const token of tokens) {
      if (token.address !== '0x0000000000000000000000000000000000000000') {
        balances[token.symbol] = await getTokenBalance(
          activeWallet.address,
          token.address,
          selectedChain
        );
      }
    }
    setTokenBalances(balances);
    setLoadingTokens(false);
  };

  const copyAddress = () => {
    if (activeWallet?.address) {
      navigator.clipboard.writeText(activeWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = async () => {
    if (!activeWallet || !validateAddress(sendForm.to)) {
      setTxError('Invalid recipient address');
      return;
    }

    setSending(true);
    setTxError(null);
    setTxHash(null);

    try {
      const hash = await sendTransaction(
        activeWallet.privateKey,
        sendForm.to,
        sendForm.amount,
        selectedChain,
        gasSpeed,
        useTor
      );
      setTxHash(hash);
      setSendForm({ to: '', amount: '' });
      await refreshBalances();
    } catch (e) {
      setTxError(e instanceof Error ? e.message : 'Transaction failed');
    } finally {
      setSending(false);
    }
  };

  const mainnetChains = Object.entries(getAllChains());

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0D1117 0%, #161B22 100%)',
        pb: 10,
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Button
            onClick={(e) => setAnchorEl(e.currentTarget)}
            startIcon={<WalletIcon />}
            endIcon={<ExpandMore />}
            sx={{
              color: '#fff',
              borderRadius: '12px',
              px: 2,
              py: 1,
              background: 'rgba(255,255,255,0.1)',
              textTransform: 'none',
              '&:hover': { background: 'rgba(255,255,255,0.15)' },
            }}
          >
            {activeWallet?.name || 'Select Wallet'}
          </Button>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              onClick={handleVpnToggle}
              disabled={vpnConnecting}
              sx={{
                color: '#fff',
                minWidth: 'auto',
                px: 1.5,
                borderRadius: '12px',
                background: vpnStatus === 'connected' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)',
                border: vpnStatus === 'connected' ? '1px solid #22c55e' : 'none',
                textTransform: 'none',
                '&:hover': { background: 'rgba(255,255,255,0.15)' },
                '&:disabled': { opacity: 0.7 },
              }}
            >
              {vpnStatus === 'connecting' ? '⏳' : (vpnStatus === 'connected' ? '🛡️' : '🌐')}
            </Button>
            {selectedVpn === 'tor' && !vpnConnecting && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                px: 1,
                py: 0.5,
                borderRadius: '8px',
                background: 'rgba(34,197,94,0.2)',
                border: '1px solid rgba(34,197,94,0.5)',
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
                <Box component="span" sx={{ fontSize: '10px', color: '#22c55e' }}>VPN</Box>
              </Box>
            )}
            <IconButton onClick={() => setShowSettings(true)} sx={{ color: '#fff' }}>
              <Settings />
            </IconButton>
            <IconButton onClick={disconnect} sx={{ color: '#fff' }}>
              <Logout />
            </IconButton>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              background: 'rgba(22, 27, 34, 0.95)',
              borderRadius: '16px',
              minWidth: 250,
            }
          }}
        >
          {wallets.map((wallet) => (
            <MenuItem
              key={wallet.id}
              onClick={() => { setActiveWallet(wallet); setAnchorEl(null); }}
              selected={activeWallet?.id === wallet.id}
            >
              <ListItemIcon><WalletIcon sx={{ color: '#8B5CF6' }} /></ListItemIcon>
              <ListItemText primary={wallet.name} secondary={formatAddress(wallet.address)} />
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={() => { createWallet(); setAnchorEl(null); }}>
            <ListItemIcon><Add sx={{ color: '#8B5CF6' }} /></ListItemIcon>
            <ListItemText primary="Add Wallet" />
          </MenuItem>
        </Menu>

        <Card sx={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)', borderRadius: '24px', p: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Total Portfolio
            </Typography>
            <Button
              onClick={(e) => setChainAnchorEl(e.currentTarget)}
              size="small"
              sx={{ color: '#fff', textTransform: 'none', background: 'rgba(255,255,255,0.2)', borderRadius: '20px' }}
            >
              {chain?.name} <ExpandMore sx={{ fontSize: 16, ml: 0.5 }} />
            </Button>
          </Box>
          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
            {formatUSD(totalPortfolioValue, 1)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {totalPortfolioValue > 0 && (
              <>
                {totalPortfolioValue > 0 ? (
                  <TrendingUp sx={{ color: '#4ADE80', fontSize: 18 }} />
                ) : (
                  <TrendingDown sx={{ color: '#F87171', fontSize: 18 }} />
                )}
                <Typography variant="body2" sx={{ color: '#4ADE80' }}>
                  +$123.45 (2.5%)
                </Typography>
              </>
            )}
          </Box>
        </Card>

        <Menu
          anchorEl={chainAnchorEl}
          open={Boolean(chainAnchorEl)}
          onClose={() => setChainAnchorEl(null)}
          PaperProps={{
            sx: { background: 'rgba(22, 27, 34, 0.95)', borderRadius: '16px', maxHeight: 400, overflowY: 'auto' }
          }}
        >
          {mainnetChains.map(([key, chain]) => (
            <MenuItem
              key={key}
              onClick={() => { setSelectedChain(key); setChainAnchorEl(null); }}
              selected={selectedChain === key}
            >
              {chain.name} ({chain.symbol})
            </MenuItem>
          ))}
          <MenuItem
            onClick={() => { setChainAnchorEl(null); setShowAddChain(true); }}
            sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 1 }}
          >
            <Add sx={{ mr: 1 }} /> Add Custom Chain
          </MenuItem>
        </Menu>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 2 }}>
          {[
            { icon: <SendIcon />, label: 'Send', action: () => setShowSend(true) },
            { icon: <QrCode />, label: 'Receive', action: () => setShowReceive(true) },
            { icon: <SwapHoriz />, label: 'Swap', action: () => setShowSwap(true) },
            { icon: <Savings />, label: 'Stake', action: () => setShowStake(true) },
          ].map((item) => (
            <Button
              key={item.label}
              onClick={item.action}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                '&:hover': { background: 'rgba(255,255,255,0.15)' },
              }}
            >
              <Box sx={{ color: '#fff' }}>{item.icon}</Box>
              <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.7rem' }}>{item.label}</Typography>
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Add />}
            sx={{
              py: 1.5,
              borderRadius: '16px',
              background: '#22C55E',
              '&:hover': { background: '#16A34A' },
            }}
          >
            Buy
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<SwapHoriz />}
            sx={{
              py: 1.5,
              borderRadius: '16px',
              background: '#3B82F6',
              '&:hover': { background: '#2563EB' },
            }}
          >
            Sell
          </Button>
        </Box>

        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            mb: 2,
            '& .MuiTab-root': { color: '#8B949E', minWidth: '50%' },
            '& .Mui-selected': { color: '#fff' },
            '& .MuiTabs-indicator': { background: '#8B5CF6' },
          }}
        >
          <Tab label="Assets" />
          <Tab label="NFTs" />
          <Tab label="DApps" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: '#8B949E', mr: 1 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.08)',
                    '& fieldset': { border: 'none' },
                  },
                  '& .MuiInputBase-input': { color: '#fff' },
                }}
              />
            </Box>

            {tokensWithPrices.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No assets yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Get started by buying or receiving crypto
                </Typography>
              </Box>
            ) : (
              tokensWithPrices
                .filter(t => t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((token) => (
                  <ListItem
                    key={token.symbol}
                    sx={{
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { background: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                        {token.symbol.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={token.symbol}
                      secondary={token.name}
                      primaryTypographyProps={{ color: '#fff', fontWeight: 600 }}
                      secondaryTypographyProps={{ color: '#8B949E' }}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                        {formatBalance(token.balance)} {token.symbol}
                      </Typography>
                      <Typography variant="body2" sx={{ color: token.change24h >= 0 ? '#4ADE80' : '#F87171' }}>
                        {formatUSD(token.value, 1)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Button
              fullWidth
              startIcon={<Collections />}
              onClick={async () => {
                if (!activeWallet) return;
                setLoadingNFTs(true);
                const nftsData = await getNFTs(activeWallet.address, selectedChain);
                setNfts(nftsData);
                setLoadingNFTs(false);
              }}
              sx={{ mb: 2, py: 1.5, borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              Refresh NFTs
            </Button>
            {nfts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Collections sx={{ fontSize: 48, color: '#6E7681', mb: 2 }} />
                <Typography color="text.secondary">No NFTs found</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                {nfts.map((nft) => (
                  <Card key={nft.tokenId} sx={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                    <Box sx={{ height: 120, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {nft.imageUrl ? (
                        <img src={nft.imageUrl} alt={nft.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Collections sx={{ fontSize: 40, color: '#6E7681' }} />
                      )}
                    </Box>
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {nft.name}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {tabValue === 2 && (
          <List>
            {(DAPPS[selectedChain] || DAPPS.ethereum).map((dapp, index) => (
              <ListItem
                key={index}
                component="a"
                href={dapp.url}
                target="_blank"
                sx={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  mb: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', width: 40, height: 40 }}>
                    {dapp.logo}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={dapp.name} secondary={dapp.category} />
                <Language sx={{ color: '#8B949E' }} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Dialog open={showSend} onClose={() => setShowSend(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'rgba(22,27,34,0.95)', borderRadius: '24px' } }}>
        <DialogTitle sx={{ color: '#fff' }}>Send {chain?.symbol}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Recipient"
              value={sendForm.to}
              onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
              fullWidth
              placeholder="0x..."
              sx={{ '& .MuiInputBase-input': { color: '#fff' }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <TextField
              label="Amount"
              type="number"
              value={sendForm.amount}
              onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
              fullWidth
              sx={{ '& .MuiInputBase-input': { color: '#fff' }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            {txError && <Alert severity="error">{txError}</Alert>}
            {txHash && <Alert severity="success">Sent! <a href={`${chain?.explorer}/tx/${txHash}`} target="_blank" style={{color: '#8B5CF6'}}>View</a></Alert>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowSend(false)} sx={{ borderRadius: '12px' }}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending} variant="contained" sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showReceive} onClose={() => setShowReceive(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'rgba(22,27,34,0.95)', borderRadius: '24px' } }}>
        <DialogTitle sx={{ color: '#fff' }}>Receive {chain?.symbol}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Box sx={{ background: '#fff', borderRadius: '16px', p: 3, mb: 3, display: 'inline-block' }}>
            <QrCode sx={{ fontSize: 180, color: '#0D1117' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '12px', p: 2 }}>
            <Typography sx={{ color: '#fff', flex: 1, fontFamily: 'monospace', wordBreak: 'break-all' }}>{activeWallet?.address}</Typography>
            <IconButton onClick={copyAddress} sx={{ color: '#fff' }}>
              {copied ? <Check sx={{ color: '#4ADE80' }} /> : <ContentCopy />}
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowReceive(false)} variant="contained" fullWidth sx={{ borderRadius: '12px' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSwap} onClose={() => setShowSwap(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'rgba(22,27,34,0.95)', borderRadius: '24px' } }}>
        <DialogTitle sx={{ color: '#fff' }}>Swap Tokens</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField select fullWidth value={swapForm.fromToken} onChange={(e) => setSwapForm({ ...swapForm, fromToken: e.target.value })} SelectProps={{ native: true }} sx={{ '& .MuiInputBase-input': { color: '#fff' } }}>
              {(POPULAR_TOKENS[selectedChain] || []).map((t) => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
            </TextField>
            <TextField select fullWidth value={swapForm.toToken} onChange={(e) => setSwapForm({ ...swapForm, toToken: e.target.value })} SelectProps={{ native: true }} sx={{ '& .MuiInputBase-input': { color: '#fff' } }}>
              {(POPULAR_TOKENS[selectedChain] || []).map((t) => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
            </TextField>
            <TextField label="Amount" type="number" value={swapForm.amount} onChange={(e) => setSwapForm({ ...swapForm, amount: e.target.value })} fullWidth sx={{ '& .MuiInputBase-input': { color: '#fff' } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowSwap(false)} sx={{ borderRadius: '12px' }}>Cancel</Button>
          <Button
            onClick={async () => {
              if (!activeWallet || !swapForm.amount) return;
              setSwapping(true);
              try {
                const hash = await executeSwap(activeWallet.privateKey, swapForm.fromToken, swapForm.toToken, swapForm.amount, selectedChain);
                setTxHash(hash);
                await refreshBalances();
              } catch (e) { setTxError(e instanceof Error ? e.message : 'Failed'); }
              setSwapping(false);
            }}
            disabled={swapping}
            variant="contained"
            sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          >
            {swapping ? 'Swapping...' : 'Swap'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showStake} onClose={() => setShowStake(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'rgba(22,27,34,0.95)', borderRadius: '24px' } }}>
        <DialogTitle sx={{ color: '#fff' }}>Stake {chain?.symbol}</DialogTitle>
        <DialogContent>
          <TextField select fullWidth value={stakeForm.validator} onChange={(e) => setStakeForm({ ...stakeForm, validator: e.target.value })} SelectProps={{ native: true }} sx={{ mt: 2, '& .MuiInputBase-input': { color: '#fff' } }}>
            {selectedChain === 'ethereum' && <><option value="Lido">Lido - APY 3.5%</option><option value="Rocket Pool">Rocket Pool - APY 3.2%</option></>}
            {selectedChain === 'polygon' && <option value="Polygon">Polygon Stake - APY 5.2%</option>}
            {selectedChain === 'avalanche' && <option value="Avalanche">Avalanche Stake - APY 6.8%</option>}
          </TextField>
          <TextField label="Amount" type="number" value={stakeForm.amount} onChange={(e) => setStakeForm({ ...stakeForm, amount: e.target.value })} fullWidth sx={{ mt: 2, '& .MuiInputBase-input': { color: '#fff' } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowStake(false)} sx={{ borderRadius: '12px' }}>Cancel</Button>
          <Button
            onClick={async () => {
              if (!activeWallet || !stakeForm.amount) return;
              setStaking(true);
              try {
                const hash = await stakeTokens(activeWallet.privateKey, stakeForm.validator, stakeForm.amount, selectedChain);
                setTxHash(hash);
                await refreshBalances();
              } catch (e) { setTxError(e instanceof Error ? e.message : 'Failed'); }
              setStaking(false);
            }}
            disabled={staking}
            variant="contained"
            sx={{ borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)' }}
          >
            {staking ? 'Staking...' : 'Stake'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'rgba(22,27,34,0.95)', borderRadius: '24px' } }}>
        <DialogTitle sx={{ color: '#fff' }}>Settings</DialogTitle>
        <DialogContent>
          <List>
            <ListItem onClick={() => { setShowSettings(false); setShowBackup(true); }} sx={{ borderRadius: '12px', cursor: 'pointer' }}>
              <ListItemIcon><WalletIcon sx={{ color: '#8B5CF6' }} /></ListItemIcon>
              <ListItemText primary="Backup Wallet" secondary="View seed phrase & private key" />
            </ListItem>
            <ListItem onClick={() => { setShowSettings(false); setShowHistory(true); }} sx={{ borderRadius: '12px', cursor: 'pointer' }}>
              <ListItemIcon><History sx={{ color: '#3B82F6' }} /></ListItemIcon>
              <ListItemText primary="Transaction History" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowSettings(false)} variant="contained" fullWidth sx={{ borderRadius: '12px' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showAddChain} onClose={() => setShowAddChain(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'rgba(22,27,34,0.95)', borderRadius: '24px' } }}>
        <DialogTitle sx={{ color: '#fff' }}>Add Custom Chain</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Chain Name"
            value={customChainForm.name}
            onChange={(e) => setCustomChainForm({ ...customChainForm, name: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { color: '#8B949E' } }}
            InputProps={{ sx: { color: '#fff' } }}
          />
          <TextField
            fullWidth
            label="Symbol"
            value={customChainForm.symbol}
            onChange={(e) => setCustomChainForm({ ...customChainForm, symbol: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { color: '#8B949E' } }}
            InputProps={{ sx: { color: '#fff' } }}
          />
          <TextField
            fullWidth
            label="RPC URL"
            value={customChainForm.rpcUrl}
            onChange={(e) => setCustomChainForm({ ...customChainForm, rpcUrl: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { color: '#8B949E' } }}
            InputProps={{ sx: { color: '#fff' } }}
          />
          <TextField
            fullWidth
            label="Chain ID"
            type="number"
            value={customChainForm.chainId}
            onChange={(e) => setCustomChainForm({ ...customChainForm, chainId: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { color: '#8B949E' } }}
            InputProps={{ sx: { color: '#fff' } }}
          />
          <TextField
            fullWidth
            label="Explorer URL"
            value={customChainForm.explorer}
            onChange={(e) => setCustomChainForm({ ...customChainForm, explorer: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ sx: { color: '#8B949E' } }}
            InputProps={{ sx: { color: '#fff' } }}
          />
          <TextField
            fullWidth
            label="Decimals"
            type="number"
            value={customChainForm.decimals}
            onChange={(e) => setCustomChainForm({ ...customChainForm, decimals: e.target.value })}
            InputLabelProps={{ sx: { color: '#8B949E' } }}
            InputProps={{ sx: { color: '#fff' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowAddChain(false)} sx={{ borderRadius: '12px' }}>Cancel</Button>
          <Button 
            onClick={() => {
              if (customChainForm.name && customChainForm.symbol && customChainForm.rpcUrl) {
                addCustomChain({
                  name: customChainForm.name,
                  symbol: customChainForm.symbol,
                  rpcUrl: customChainForm.rpcUrl,
                  chainId: parseInt(customChainForm.chainId) || 1,
                  explorer: customChainForm.explorer || '',
                  decimals: parseInt(customChainForm.decimals) || 18,
                });
                setShowAddChain(false);
                setCustomChainForm({ name: '', symbol: '', rpcUrl: '', chainId: '', explorer: '', decimals: '18' });
                refreshBalances();
              }
            }} 
            variant="contained" 
            fullWidth 
            sx={{ borderRadius: '12px' }}
          >
            Add Chain
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showBackup} onClose={() => setShowBackup(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'rgba(22,27,34,0.95)', borderRadius: '24px' } }}>
        <DialogTitle sx={{ color: '#fff' }}>Backup Wallet</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ borderRadius: '12px', mb: 2 }}>Never share your seed phrase!</Alert>
          <Typography variant="body2" sx={{ color: '#8B949E' }}>Address</Typography>
          <Box sx={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', p: 2, mb: 2, wordBreak: 'break-all', fontFamily: 'monospace', color: '#fff' }}>
            {activeWallet?.address}
          </Box>
          {activeWallet?.mnemonic && (
            <>
              <Typography variant="body2" sx={{ color: '#8B949E' }}>Seed Phrase</Typography>
              <Box sx={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', p: 2, mb: 2, wordBreak: 'break-all', fontFamily: 'monospace', color: '#fff' }}>
                {activeWallet.mnemonic}
              </Box>
            </>
          )}
          <Typography variant="body2" sx={{ color: '#8B949E' }}>Private Key</Typography>
          <Box sx={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', p: 2, wordBreak: 'break-all', fontFamily: 'monospace', color: '#fff' }}>
            {activeWallet?.privateKey}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowBackup(false)} variant="contained" fullWidth sx={{ borderRadius: '12px' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}