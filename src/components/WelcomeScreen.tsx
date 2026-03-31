import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Button, TextField, 
  ToggleButton, ToggleButtonGroup, Alert, IconButton, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel,
  Card, Chip, Divider
} from '@mui/material';
import { 
  Wallet as WalletIcon, Key as KeyIcon, Visibility, VisibilityOff,
  Warning, Lock, Pin, Shield, Security, VerifiedUser,
  Google, Apple, Extension
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { CHAINS, generateMnemonic, walletFromMnemonic } from '../utils/crypto';

export function WelcomeScreen() {
  const [showImport, setShowImport] = useState(false);
  const [importMethod, setImportMethod] = useState<'mnemonic' | 'privateKey'>('mnemonic');
  const [input, setInput] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [seedPhraseConfirmed, setSeedPhraseConfirmed] = useState(false);
  const [newWalletData, setNewWalletData] = useState<{ address: string; mnemonic: string; privateKey: string } | null>(null);
  const { importWallet, importFromPrivateKey, isLoading, error } = useWallet();

  useEffect(() => {
    const savedPin = localStorage.getItem('walletPin');
    if (savedPin) {
      setShowPinSetup(true);
    }
  }, []);

  const handleCreateWallet = () => {
    const mnemonic = generateMnemonic();
    const walletData = walletFromMnemonic(mnemonic);
    setNewWalletData({
      address: walletData.address,
      mnemonic: mnemonic,
      privateKey: walletData.privateKey
    });
    setShowSeedPhrase(true);
  };

  const handleImport = () => {
    if (importMethod === 'mnemonic') {
      importWallet(input);
    } else {
      importFromPrivateKey(input);
    }
  };

  const handleSetupPin = () => {
    if (pin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }
    localStorage.setItem('walletPin', pin);
    localStorage.setItem('pinRequired', 'true');
    setShowPinSetup(false);
    setPin('');
    setConfirmPin('');
    setPinError('');
  };

  const handleConfirmSeedPhrase = () => {
    if (newWalletData) {
      importWallet(newWalletData.mnemonic);
      setShowSeedPhrase(false);
      setNewWalletData(null);
      setSeedPhraseConfirmed(false);
      const savedPin = localStorage.getItem('walletPin');
      if (!savedPin) {
        setShowPinSetup(true);
      }
    }
  };

  const isLocked = localStorage.getItem('locked') === 'true' && localStorage.getItem('walletPin');

  if (isLocked) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #1C2128 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)' },
                      '50%': { boxShadow: '0 20px 80px rgba(99, 102, 241, 0.6)' },
                    },
                  }}
                >
                  <Lock sx={{ fontSize: 50, color: '#fff' }} />
                </Box>
              </motion.div>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
                CoinWallet
              </Typography>
              <Typography variant="h5" sx={{ color: '#8B949E', mb: 2 }}>
                Wallet Locked
              </Typography>
              <Typography variant="body1" sx={{ color: '#6E7681' }}>
                Enter your PIN to unlock
              </Typography>
            </Box>

            <Card sx={{ background: 'rgba(22, 27, 34, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(48, 54, 61, 0.5)', p: 4 }}>
              <TextField
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
                fullWidth
                inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    background: 'rgba(13, 17, 23, 0.6)',
                    '& fieldset': { borderColor: 'rgba(48, 54, 61, 0.5)' },
                  },
                  '& .MuiInputBase-input': { color: '#fff', py: 2 },
                }}
              />
              {pinError && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>{pinError}</Alert>
              )}
              <Button
                onClick={() => {
                  const savedPin = localStorage.getItem('walletPin');
                  if (pin === savedPin) {
                    localStorage.removeItem('locked');
                    window.location.reload();
                  } else {
                    setPinError('Incorrect PIN');
                  }
                }}
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  py: 2,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Unlock Wallet
              </Button>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #1C2128 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 20%, rgba(129, 140, 248, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(167, 139, 250, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: '0 30px 60px rgba(99, 102, 241, 0.4)',
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                  },
                }}
              >
                <WalletIcon sx={{ fontSize: 50, color: '#fff' }} />
              </Box>
            </motion.div>
            
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700, 
                color: '#fff',
                mb: 1,
                background: 'linear-gradient(135deg, #fff 0%, #A5B4FC 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CoinWallet
            </Typography>
            <Typography variant="h6" sx={{ color: '#8B949E', mb: 1 }}>
              The most trusted multi-chain wallet
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
              <Chip icon={<Shield sx={{ fontSize: 14 }} />} label="Bank-grade Security" size="small" sx={{ background: 'rgba(34,197,94,0.2)', color: '#4ADE80' }} />
              <Chip icon={<Security sx={{ fontSize: 14 }} />} label="Non-Custodial" size="small" sx={{ background: 'rgba(99,102,241,0.2)', color: '#A5B4FC' }} />
              <Chip icon={<VerifiedUser sx={{ fontSize: 14 }} />} label="Open Source" size="small" sx={{ background: 'rgba(168,85,247,0.2)', color: '#C084FC' }} />
            </Box>
          </Box>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ background: 'rgba(22, 27, 34, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(48, 54, 61, 0.5)', p: 4, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }}>
              <AnimatePresence mode="wait">
                {!showImport ? (
                  <motion.div
                    key="create"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        onClick={handleCreateWallet}
                        disabled={isLoading}
                        variant="contained"
                        size="large"
                        startIcon={<WalletIcon />}
                        fullWidth
                        sx={{
                          py: 2.5,
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 32px rgba(99, 102, 241, 0.5)',
                          },
                        }}
                      >
                        Create New Wallet
                      </Button>

                      <Button
                        onClick={() => setShowImport(true)}
                        variant="outlined"
                        size="large"
                        startIcon={<KeyIcon />}
                        fullWidth
                        sx={{
                          py: 2.5,
                          borderRadius: '16px',
                          borderColor: 'rgba(139, 148, 158, 0.3)',
                          color: '#C9D1D9',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#8B5CF6',
                            background: 'rgba(139, 92, 246, 0.1)',
                          },
                        }}
                      >
                        Import Existing Wallet
                      </Button>

                      <Divider sx={{ my: 1, color: '#6E7681' }}>
                        <Typography variant="caption" sx={{ color: '#6E7681' }}>OR CONNECT WITH</Typography>
                      </Divider>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Google />}
                          sx={{
                            py: 2,
                            borderRadius: '16px',
                            borderColor: 'rgba(139, 148, 158, 0.3)',
                            color: '#fff',
                            '&:hover': { borderColor: '#EA4335', background: 'rgba(234,67,53,0.1)' },
                          }}
                        >
                          Google
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Apple />}
                          sx={{
                            py: 2,
                            borderRadius: '16px',
                            borderColor: 'rgba(139, 148, 158, 0.3)',
                            color: '#fff',
                            '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.1)' },
                          }}
                        >
                          Apple
                        </Button>
                      </Box>

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Extension />}
                        sx={{
                          py: 2,
                          borderRadius: '16px',
                          borderColor: 'rgba(139, 148, 158, 0.3)',
                          color: '#fff',
                          '&:hover': { borderColor: '#F59E0B', background: 'rgba(245,158,11,0.1)' },
                        }}
                      >
                        WalletConnect
                      </Button>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.div
                    key="import"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <ToggleButtonGroup
                        value={importMethod}
                        exclusive
                        onChange={(_, v) => v && setImportMethod(v)}
                        fullWidth
                        sx={{
                          '& .MuiToggleButton-root': {
                            py: 2,
                            borderRadius: '12px !important',
                            border: '1px solid rgba(48, 54, 61, 0.5)',
                            color: '#8B949E',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&.Mui-selected': {
                              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                              color: '#fff',
                              borderColor: 'transparent',
                            },
                          },
                        }}
                      >
                        <ToggleButton value="mnemonic">Seed Phrase</ToggleButton>
                        <ToggleButton value="privateKey">Private Key</ToggleButton>
                      </ToggleButtonGroup>

                      <TextField
                        type={importMethod === 'mnemonic' ? 'text' : showPrivateKey ? 'text' : 'password'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={importMethod === 'mnemonic' ? 'Enter your 12/24 word seed phrase' : 'Enter your private key'}
                        fullWidth
                        variant="outlined"
                        multiline={importMethod === 'mnemonic'}
                        rows={3}
                        InputProps={{
                          endAdornment: importMethod === 'privateKey' && (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPrivateKey(!showPrivateKey)} edge="end" sx={{ color: '#8B949E' }}>
                                {showPrivateKey ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            background: 'rgba(13, 17, 23, 0.6)',
                            '& fieldset': { borderColor: 'rgba(48, 54, 61, 0.5)' },
                            '&:hover fieldset': { borderColor: '#8B5CF6' },
                            '&.Mui-focused fieldset': { borderColor: '#8B5CF6', borderWidth: 2 },
                          },
                          '& .MuiInputBase-input': { color: '#fff', py: 2, '&::placeholder': { color: '#6E7681' } },
                        }}
                      />

                      {error && (
                        <Alert severity="error" icon={<Warning />} sx={{ borderRadius: '12px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: '#F85149' }}>
                        {error}
                      </Alert>
                      )}

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={() => setShowImport(false)} variant="outlined" fullWidth sx={{ py: 2, borderRadius: '16px', borderColor: 'rgba(139,148,158,0.3)', color: '#C9D1D9', fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: '#8B949E' } }}>
                          Back
                        </Button>
                        <Button onClick={handleImport} disabled={!input || isLoading} variant="contained" fullWidth sx={{ py: 2, borderRadius: '16px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', fontWeight: 600, textTransform: 'none', '&.Mui-disabled': { background: 'rgba(48,54,61,0.5)', color: '#6E7681' } }}>
                          {isLoading ? 'Importing...' : 'Import Wallet'}
                        </Button>
                      </Box>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#6E7681' }}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Typography>
              <Typography variant="body2" sx={{ color: '#6E7681', mt: 1 }}>
                Supported: {Object.values(CHAINS).map(c => c.symbol).join(' • ')}
              </Typography>
            </Box>
          </motion.div>
        </motion.div>
      </Container>

      <Dialog open={showSeedPhrase} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'rgba(22,27,34,0.95)', borderRadius: '24px' } }}>
        <DialogTitle sx={{ color: '#fff', textAlign: 'center', fontSize: '1.5rem' }}>⚠️ Important - Save Your Seed Phrase</DialogTitle>
        <DialogContent>
          <Alert severity="warning" icon={<Warning />} sx={{ borderRadius: '12px', mb: 3, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
            Write down these 12 words in order and store them safely. Anyone with this phrase can access your funds.
          </Alert>
          <Box sx={{ background: 'rgba(13,17,23,0.8)', borderRadius: '16px', p: 3, mb: 3, border: '1px solid rgba(48,54,61,0.5)' }}>
            <Typography sx={{ color: '#fff', fontFamily: 'monospace', fontSize: '1.2rem', wordBreak: 'break-word', lineHeight: 2.5, textAlign: 'center' }}>
              {newWalletData?.mnemonic}
            </Typography>
          </Box>
          <FormControlLabel control={<Checkbox checked={seedPhraseConfirmed} onChange={(e) => setSeedPhraseConfirmed(e.target.checked)} sx={{ color: '#8B949E' }} />} label={<Typography sx={{ color: '#8B949E' }}>I have securely saved my seed phrase</Typography>} />
        </DialogContent>
        <DialogActions sx={{ p: 2, flexDirection: 'column', gap: 1 }}>
          <Button onClick={handleConfirmSeedPhrase} disabled={!seedPhraseConfirmed} variant="contained" fullWidth sx={{ py: 2, borderRadius: '16px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', fontWeight: 600 }}>I've Saved My Phrase - Continue</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showPinSetup} maxWidth="sm" fullWidth PaperProps={{ sx: { background: 'rgba(22,27,34,0.95)', borderRadius: '24px' } }}>
        <DialogTitle sx={{ color: '#fff', textAlign: 'center' }}>
          <Pin sx={{ fontSize: 48, color: '#8B5CF6', mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Set Up PIN Lock</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#8B949E', mb: 3, textAlign: 'center' }}>Create a PIN to secure your wallet. You'll need it to unlock.</Typography>
          <TextField type="password" label="Enter PIN (4-6 digits)" value={pin} onChange={(e) => setPin(e.target.value)} fullWidth inputProps={{ maxLength: 6 }} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .MuiInputBase-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#8B949E' } }} />
          <TextField type="password" label="Confirm PIN" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} fullWidth inputProps={{ maxLength: 6 }} sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' }, '& .MuiInputBase-input': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#8B949E' } }} />
          {pinError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{pinError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleSetupPin} variant="contained" fullWidth sx={{ py: 2, borderRadius: '16px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', fontWeight: 600 }}>Set PIN</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}