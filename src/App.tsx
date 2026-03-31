import { WalletProvider, useWallet } from './context/WalletContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { WalletDashboard } from './components/WalletDashboard';

function AppContent() {
  const { activeWallet } = useWallet();
  
  return activeWallet ? <WalletDashboard /> : <WelcomeScreen />;
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;