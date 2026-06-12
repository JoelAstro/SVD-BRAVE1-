import React from 'react';
import { ArrowRight, BookOpen, Clock, Phone, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

const HeroSection: React.FC = () => {
  const { getAverageRating, ratings } = useApp();
  const navigateTo = (hash: string) => {
    window.location.hash = hash;
  };

  return (
    <div className="relative min-h-[75vh] flex items-center bg-cover bg-center select-none" style={{ backgroundImage: "url('./hero_background.png')" }}>
      {/* Royal Maroon Overlay with soft gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/80 to-transparent z-0"></div>
      
      <div className="max-w-7xl mx-auto w-full px-4 relative z-10 py-12 md:py-24">
        <div className="max-w-xl space-y-6">
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/30 text-saffron text-[10px] font-bold uppercase tracking-wider">
              <span>❄️</span> Fully A/C Fine Dining
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-bold uppercase tracking-wider">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {getAverageRating()} / 5.0 ({ratings.length} Reviews)
            </div>
          </div>

          <h2 className="font-logo font-extrabold text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
            Tradition in <span className="text-saffron">Every Bite</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Welcome to Sri Vijaya Durga Restaurant. Experience authentic Indian flavors, signature Biryanis, sizzling Tandoori specialties, and exceptional catering services in a warm family environment.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button 
              onClick={() => navigateTo('#booking')}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-maroon text-white dark:bg-saffron dark:text-maroon font-extrabold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Book dining table <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigateTo('#menu')}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-neutral-800/80 text-white border border-neutral-700 font-extrabold text-sm shadow-md hover:-translate-y-0.5 transition-all"
            >
              View digital menu <BookOpen className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 gap-4 border-t border-neutral-700/50 pt-8 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-saffron">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs text-neutral-400 font-medium">Opening Hours</h4>
                <p className="text-xs text-white font-bold">11:00 AM - 11:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-saffron">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs text-neutral-400 font-medium">Order / Catering</h4>
                <p className="text-xs text-white font-bold">9966315544</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;
