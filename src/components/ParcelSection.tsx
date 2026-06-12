import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, ShieldCheck, Flame } from 'lucide-react';

const PhoneIcon: React.FC = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-4 h-4 animate-bounce"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const Clock: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"></path>
  </svg>
);

const ParcelSection: React.FC = () => {
  const { parcelItems } = useApp();
  const [selectedPack, setSelectedPack] = useState<'ALL' | 'Couple Pack' | 'Family Pack' | 'Bucket Biryani'>('ALL');

  // Filter items
  const filteredParcels = parcelItems.filter(item => {
    return selectedPack === 'ALL' || item.category === selectedPack;
  });

  return (
    <div className="w-full space-y-8 relative">
      
      {/* Dynamic Background packaging animations container */}
      <div className="relative overflow-hidden bg-gradient-to-r from-maroon/5 via-saffron/5 to-maroon/5 p-6 rounded-3xl border border-maroon/10 dark:border-saffron/10 z-10 glass">
        
        {/* Animated Spices/Takeaway items floating across background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
          <div className="absolute top-10 left-10 text-2xl animate-float" style={{ animationDelay: '0s' }}>🛵</div>
          <div className="absolute top-1/2 right-20 text-3xl animate-float" style={{ animationDelay: '2s' }}>🛍️</div>
          <div className="absolute bottom-10 left-1/3 text-2xl animate-float" style={{ animationDelay: '4s' }}>🍗</div>
          <div className="absolute top-1/3 left-2/3 text-xl animate-float" style={{ animationDelay: '1.5s' }}>📦</div>
        </div>

        <div className="max-w-xl text-center mx-auto space-y-3 relative z-10 select-none py-4">
          <h2 className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">
            Freshly Packed, Delivered with Care
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Enjoy your favourite dishes at home with our quick and hygienic parcel service. Order online or by phone and get freshly prepared food packed securely for takeaway or delivery.
          </p>
        </div>

        {/* Feature Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-maroon/5 dark:border-saffron/5 mt-6 relative z-10 select-none">
          <div className="flex items-center gap-2 justify-center text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="w-5 h-5 text-saffron" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Hygienic Packs</span>
          </div>
          <div className="flex items-center gap-2 justify-center text-neutral-500 dark:text-neutral-400">
            <Flame className="w-5 h-5 text-maroon dark:text-saffron" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Freshly Cooked</span>
          </div>
          <div className="flex items-center gap-2 justify-center text-neutral-500 dark:text-neutral-400">
            <Clock className="w-5 h-5 text-saffron" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Fast Preparation</span>
          </div>
          <div className="flex items-center gap-2 justify-center text-neutral-500 dark:text-neutral-400">
            <Truck className="w-5 h-5 text-maroon dark:text-saffron" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Home Delivery</span>
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 justify-center relative z-10">
        {(['ALL', 'Couple Pack', 'Family Pack', 'Bucket Biryani'] as const).map(pack => (
          <button 
            key={pack}
            onClick={() => setSelectedPack(pack)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
              selectedPack === pack
                ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-sm'
                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-maroon/30 dark:hover:border-saffron/30'
            }`}
          >
            {pack === 'ALL' ? 'Show All Packs' : pack}
          </button>
        ))}
      </div>

      {/* Parcel list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {filteredParcels.map(item => {
          return (
            <div 
              key={item.id}
              className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-3xl border border-neutral-250 dark:border-neutral-800/70 overflow-hidden shadow-sm flex hover:shadow-md transition-all duration-300 relative group ${item.disabled ? 'opacity-50 select-none' : ''}`}
            >
              <div className="w-28 sm:w-36 h-full overflow-hidden flex-shrink-0 bg-neutral-105/50 dark:bg-neutral-850/50 relative">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ${item.disabled ? 'grayscale' : ''}`}
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-gradient-to-r from-maroon to-red-700 dark:from-saffron dark:to-amber-505 text-white dark:text-neutral-950 text-[8px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-widest font-logo shadow-lg">
                  {item.category}
                </span>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h4 className="font-logo font-extrabold text-sm sm:text-base text-neutral-800 dark:text-neutral-100 group-hover:text-maroon dark:group-hover:text-saffron transition-colors leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/60 mt-3 flex items-center justify-between">
                  <span className="font-logo font-extrabold text-maroon dark:text-saffron text-sm sm:text-base bg-maroon/5 dark:bg-saffron/5 px-3 py-1 rounded-xl">
                    ₹{item.price}
                  </span>
                  {item.disabled && (
                    <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 font-bold text-[9px] rounded-lg border border-red-200 dark:border-red-900/35 uppercase tracking-wider select-none">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Booking CTA info */}
      <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border-2 border-saffron/35 dark:border-saffron/50 p-6 sm:p-8 rounded-3xl shadow-[0_10px_30px_rgba(217,119,6,0.12)] hover:shadow-[0_15px_40px_rgba(217,119,6,0.18)] transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden select-none">
        {/* Glow effect */}
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-saffron/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-maroon/15 blur-3xl pointer-events-none"></div>

        <div className="space-y-4 text-center md:text-left relative z-10 flex-1">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/25 text-saffron text-[10px] font-bold uppercase tracking-widest">
              ✨ Premium Services
            </span>
            <h3 className="font-logo font-black text-xl sm:text-2xl text-white tracking-wide">
              Bulk Catering &amp; Event Orders
            </h3>
            <p className="text-xs text-neutral-305 leading-relaxed max-w-xl">
              From intimate family gather-ups to grand wedding ceremonies, we deliver exquisite catering experiences crafted by our master chefs with high hygiene standards.
            </p>
          </div>

          {/* Services Offered Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 max-w-md mx-auto md:mx-0">
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-saffron text-sm">🎉</span>
              <span className="text-[10.5px] font-semibold text-neutral-300">Birthdays &amp; Parties</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-saffron text-sm">💍</span>
              <span className="text-[10.5px] font-semibold text-neutral-300">Weddings &amp; Catering</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-saffron text-sm">🏢</span>
              <span className="text-[10.5px] font-semibold text-neutral-300">Corporate Lunches</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="text-saffron text-sm">🍽️</span>
              <span className="text-[10.5px] font-semibold text-neutral-300">Group Dining Buffets</span>
            </div>
          </div>
        </div>

        {/* Button Wrapper */}
        <div className="relative z-10 flex-shrink-0 flex justify-center w-full md:w-auto">
          <a 
            href="tel:9966315544"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-saffron to-amber-500 hover:from-amber-500 hover:to-saffron text-neutral-950 font-logo font-black uppercase text-xs sm:text-sm rounded-2xl shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.45)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 ring-4 ring-saffron/20 border border-amber-400/20"
          >
            <PhoneIcon />
            <span>Call 9966315544</span>
          </a>
        </div>
      </div>

    </div>
  );
};

export default ParcelSection;
