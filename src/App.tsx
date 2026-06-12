import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import CustomerPortal from './pages/CustomerPortal';
import KitchenDashboard from './pages/KitchenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Sun, Moon, ChefHat, ShieldAlert, UtensilsCrossed } from 'lucide-react';

const AppContent: React.FC = () => {
  const { theme, setTheme, activeTable, adminSession, kitchenSession } = useApp();
  const [currentView, setCurrentView] = useState<string>('customer'); // 'customer' | 'kitchen' | 'admin'
  const [activeTab, setActiveTab] = useState<string>('home'); // 'home' | 'booking' | 'menu' | 'parcels'
  const [bgImage, setBgImage] = useState<string>('/hero_background.png');

  // --- ROUTING ENGINE ---
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash || '#home';
      const cleanHash = hash.split('?')[0];

      // Update background image based on section smoothly
      if (cleanHash === '#menu') {
        setBgImage('/special_dum_biryani.png');
      } else if (cleanHash === '#parcels') {
        setBgImage('/paneer_tikka.png');
      } else if (cleanHash === '#gallery') {
        setBgImage('/gulab_jamun.png');
      } else if (cleanHash === '#contact') {
        setBgImage('/tandoori_chicken.png');
      } else {
        setBgImage('/hero_background.png');
      }

      if (cleanHash === '#kitchen') {
        setCurrentView('kitchen');
      } else if (cleanHash === '#admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('customer');
        if (cleanHash === '#booking') {
          setActiveTab('booking');
        } else if (cleanHash === '#menu') {
          setActiveTab('menu');
        } else if (cleanHash === '#parcels') {
          setActiveTab('parcels');
        } else {
          setActiveTab('home');
        }
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    return () => window.removeEventListener('hashchange', handleRoute);
  }, []);

  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-neutral-800 dark:text-neutral-100 transition-colors duration-300 relative overflow-hidden">
      
      {/* Dynamic Ambient Background Image with Crossfade */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 z-0 opacity-15 dark:opacity-5 pointer-events-none"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Floating Spices Background Effect */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-25 dark:opacity-15">
        <div className="absolute top-10 left-10 w-8 h-8 bg-saffron rounded-full filter blur-md animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-20 w-12 h-12 bg-maroon rounded-full filter blur-lg animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-saffron rounded-full filter blur-md animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-maroon rounded-full filter blur-sm animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* App Shell Header */}
      <header className="sticky top-0 z-50 glass border-b border-maroon/10 dark:border-saffron/10 px-4 py-3 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Area */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => navigateTo('#home')}
          >
            <div className="w-10 h-10 rounded-full bg-maroon dark:bg-saffron flex items-center justify-center text-white dark:text-maroon shadow-md">
              <UtensilsCrossed className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="font-logo font-extrabold text-lg leading-tight text-maroon dark:text-saffron">Sri Vijaya Durga</h1>
              <p className="text-xs uppercase tracking-widest text-saffron dark:text-maroon/70 font-semibold font-logo">Family AC Restaurant</p>
            </div>
          </div>

          {/* Portal Switcher */}
          <nav className="flex bg-neutral-200/50 dark:bg-neutral-800/50 p-1 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-inner">
            <button 
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                currentView === 'customer' 
                  ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-md' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              onClick={() => navigateTo(activeTable ? `#menu?table=${activeTable}` : '#home')}
            >
              Customer
            </button>
            <button 
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all relative ${
                currentView === 'kitchen' 
                  ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-md' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              onClick={() => navigateTo('#kitchen')}
            >
              <ChefHat className="w-3.5 h-3.5" />
              Kitchen
              {kitchenSession && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500"></span>}
            </button>
            <button 
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all relative ${
                currentView === 'admin' 
                  ? 'bg-maroon text-white dark:bg-saffron dark:text-maroon shadow-md' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              onClick={() => navigateTo('#admin')}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
              {adminSession && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500"></span>}
            </button>
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 hover:text-saffron transition-all"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">
        {currentView === 'customer' && <CustomerPortal activeTab={activeTab} setActiveTab={setActiveTab} />}
        {currentView === 'kitchen' && <KitchenDashboard />}
        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Sticky Table Identifier Bar */}
      {activeTable && currentView === 'customer' && (
        <div className="fixed bottom-0 left-0 right-0 bg-maroon dark:bg-saffron text-white dark:text-maroon px-4 py-2.5 z-40 flex items-center justify-between shadow-2xl border-t border-saffron/20 dark:border-maroon/20 font-logo select-none no-print">
          <div className="flex items-center gap-2">
            <span className="bg-saffron dark:bg-maroon text-maroon dark:text-white px-2.5 py-0.5 rounded-md text-xs font-extrabold tracking-wide">
              Table {activeTable}
            </span>
            <span className="text-xs font-semibold opacity-90">Reserved &amp; Active Dining Session</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateTo(`#menu?table=${activeTable}`)}
              className="text-xs font-extrabold underline hover:text-saffron-light dark:hover:text-maroon-light transition-all"
            >
              Order Food Menu
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
