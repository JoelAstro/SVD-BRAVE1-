import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, Minus, ShoppingBag, ClipboardList, CreditCard, X } from 'lucide-react';

const MenuSection: React.FC = () => {
  const { 
    activeTable, cart, addToCart, updateCartQty, 
    placeOrder, activeOrder, updateOrderStatus, menuItems 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedItemDetails, setSelectedItemDetails] = useState<any | null>(null);

  // Checkout info form states
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [notes, setNotes] = useState('');

  const categories = [
    'All', 'Veg Biryani', 'Non-Veg Biryani', 'Veg Fried Rice', 'Non-Veg Fried Rice',
    'Veg Starters', 'Non-Veg Starters', 'Sea Food Starters', 'Egg Items',
    'Tandoori Non-Veg', 'Tandoori Veg'
  ];

  // Filter menu dynamically based on search and category selection
  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05); // 5% CGST/SGST
  const serviceCharge = Math.round(subtotal * 0.025); // 2.5% Service Charge
  const grandTotal = subtotal + tax + serviceCharge;

  const handlePlaceOrderClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    let name = custName;
    let phone = custPhone;

    if (activeOrder) {
      name = activeOrder.customerName;
      phone = activeOrder.customerPhone;
    } else {
      if (!name || !phone) {
        alert('Please enter your name and 10-digit mobile number.');
        return;
      }
      if (phone.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    const success = placeOrder(name, phone, notes);
    if (success) {
      alert('Your order has been sent to the Kitchen!');
      setNotes('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT: Menu list, search, categories */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Search */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-neutral-400">
            <Search className="w-4 h-4" />
          </span>
          <input 
            type="text"
            placeholder="Search dishes (e.g. Biryani, Paneer)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-bg-dark text-xs focus:border-maroon dark:focus:border-saffron outline-none shadow-sm transition-all"
          />
        </div>

        {/* Categories scroll row */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-print">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-maroon text-white border-maroon dark:bg-saffron dark:text-maroon dark:border-saffron shadow-sm'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-maroon/30 dark:hover:border-saffron/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Food Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMenu.map(item => {
            const cartItem = cart.find(c => c.id === item.id);
            const qty = cartItem ? cartItem.quantity : 0;
            const orderedQty = activeOrder?.items.find(i => i.id === item.id)?.quantity || 0;

            return (
              <div 
                key={item.id}
                className={`bg-white dark:bg-bg-dark rounded-2xl border border-maroon/10 dark:border-saffron/10 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group cursor-pointer ${item.disabled ? 'opacity-50 select-none' : ''}`}
                onClick={() => !item.disabled && setSelectedItemDetails(item)}
              >
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 border border-neutral-200/50 dark:border-neutral-700/50 relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className={`absolute top-1 left-1 w-2.5 h-2.5 rounded-full border border-white ${
                      item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'
                    }`} title={item.type === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}></span>
                  </div>

                  <div className="space-y-1 flex-1">
                    <h4 className="font-logo font-extrabold text-sm sm:text-base text-neutral-800 dark:text-neutral-100 leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between pt-1" onClick={e => e.stopPropagation()}>
                      <span className="font-logo font-extrabold text-maroon dark:text-saffron">₹{item.price}</span>
                      
                      {/* Add / Qty Control */}
                      {item.disabled ? (
                        <span className="px-2 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-bold text-[10px] rounded-lg border border-neutral-300 dark:border-neutral-700 select-none">
                          Unavailable
                        </span>
                      ) : qty > 0 ? (
                        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700">
                          <button 
                            onClick={() => updateCartQty(item.id, -1)}
                            disabled={qty <= orderedQty}
                            className={`p-1 px-2 text-neutral-500 hover:text-maroon dark:hover:text-saffron font-bold text-xs ${
                              qty <= orderedQty ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold font-logo">{qty}</span>
                          <button 
                            onClick={() => updateCartQty(item.id, 1)}
                            className="p-1 px-2 text-neutral-500 hover:text-maroon dark:hover:text-saffron font-bold text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(item)}
                          className="flex items-center gap-1 px-3 py-1 bg-maroon dark:bg-saffron text-white dark:text-maroon font-bold text-xs rounded-lg shadow-sm hover:opacity-90 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      )}

                    </div>
                  </div>
                </div>

                {orderedQty > 0 && (
                  <div className="bg-maroon/5 dark:bg-saffron/5 border-t border-maroon/5 dark:border-saffron/5 px-4 py-1.5 flex items-center justify-between text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                    <span>Already Ordered:</span>
                    <span className="text-maroon dark:text-saffron">{orderedQty} Portions</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT: Order Checkout sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-bg-dark border border-maroon/10 dark:border-saffron/10 rounded-3xl p-6 shadow-md sticky top-24 glass">
          
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4 justify-between">
            <h3 className="font-logo font-extrabold text-lg text-maroon dark:text-saffron flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" /> Order Details
            </h3>
            <span className="bg-saffron/10 border border-saffron/30 text-saffron text-xs font-bold px-2.5 py-0.5 rounded-lg font-logo">
              Table {activeTable || 'None'}
            </span>
          </div>

          {/* Cart list */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs">
                <ShoppingBag className="w-8 h-8 mx-auto opacity-20 mb-2" />
                Your order card is empty. Add items from the menu.
              </div>
            ) : (
              cart.map(item => {
                const orderedQty = activeOrder?.items.find(i => i.id === item.id)?.quantity || 0;
                return (
                  <div key={item.id} className="flex justify-between items-center gap-4 border-b border-neutral-100 dark:border-neutral-800/40 pb-2">
                    <div>
                      <h5 className="text-xs font-extrabold">{item.name}</h5>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <span>₹{item.price}</span>
                        {orderedQty > 0 && <span className="text-maroon dark:text-saffron font-bold">(Ordered: {orderedQty})</span>}
                      </div>
                    </div>
                    
                    {/* Qty controls */}
                    <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-700">
                      <button 
                        onClick={() => updateCartQty(item.id, -1)}
                        disabled={item.quantity <= orderedQty}
                        className={`p-1 px-1.5 text-neutral-500 font-bold text-xs ${
                          item.quantity <= orderedQty ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="px-2 text-xs font-bold font-logo">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQty(item.id, 1)}
                        className="p-1 px-1.5 text-neutral-500 font-bold text-xs"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Calculations */}
          {cart.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mt-4 space-y-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-logo font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5% CGST/SGST)</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-logo font-bold">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge (2.5%)</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-logo font-bold">₹{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-800 dark:text-neutral-100 font-extrabold border-t border-dashed border-neutral-200 dark:border-neutral-800 pt-2">
                <span>Grand Total</span>
                <span className="text-maroon dark:text-saffron font-logo">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Session indicators & Checkout forms */}
          {cart.length > 0 && (
            <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-3">
              {activeOrder ? (
                // Active Dining session
                <div className="space-y-3">
                  <div className="p-3 bg-maroon/5 dark:bg-saffron/5 border border-maroon/10 dark:border-saffron/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-maroon dark:text-saffron uppercase tracking-wider block">Active Dining Session</span>
                    <h5 className="text-xs font-bold">{activeOrder.customerName}</h5>
                    <p className="text-[10px] text-neutral-400">{activeOrder.customerPhone}</p>
                  </div>
                  
                  {cart.some(c => c.quantity > (activeOrder.items.find(i => i.id === c.id)?.quantity || 0)) ? (
                    <button 
                      onClick={handlePlaceOrderClick}
                      className="w-full py-3 bg-maroon text-white dark:bg-saffron dark:text-maroon font-extrabold text-xs rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-1.5 animate-pulse-ring"
                    >
                      <ClipboardList className="w-4 h-4" /> Add items as "Additional Order"
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-center text-[10px] font-bold text-neutral-400">
                        Orders are preparing in the kitchen.
                      </div>
                      <button 
                        onClick={() => updateOrderStatus(activeOrder.id, 'BILLING')}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" /> Request Bill / Settle Table
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Customer Info Form
                <div className="space-y-3">
                  {activeTable ? (
                    <form onSubmit={handlePlaceOrderClick} className="space-y-2">
                      <input 
                        type="text" 
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Customer Name"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none"
                      />
                      <input 
                        type="tel" 
                        required
                        pattern="[0-9]{10}"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="Mobile Number"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none"
                      />
                    </form>
                  ) : (
                    <div className="p-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/20 rounded-xl text-center text-[10px] font-bold uppercase tracking-wider">
                      Please select a table from "Dining Booking" tab first!
                    </div>
                  )}

                  <input 
                    type="text" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions (e.g. less spicy)..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs focus:border-maroon dark:focus:border-saffron outline-none"
                    disabled={!activeTable}
                  />

                  {activeTable && (
                    <button 
                      onClick={handlePlaceOrderClick}
                      className="w-full py-3 bg-maroon text-white dark:bg-saffron dark:text-maroon font-extrabold text-xs rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                    >
                      <ClipboardList className="w-4 h-4" /> Place Order &amp; Start Cooking
                    </button>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Food Item Expansion popup */}
      {selectedItemDetails && (
        <div 
          onClick={() => setSelectedItemDetails(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-bg-dark rounded-3xl overflow-hidden shadow-2xl border border-maroon/10 dark:border-saffron/10 relative glass animate-scale-up"
          >
            <button 
              onClick={() => setSelectedItemDetails(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 z-10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="h-64 overflow-hidden relative bg-neutral-100">
              <img 
                src={selectedItemDetails.image} 
                alt={selectedItemDetails.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark to-transparent"></div>
              <div className="absolute bottom-4 left-6 space-y-1">
                <span className="px-2 py-0.5 bg-saffron text-maroon text-[9px] font-bold rounded-lg uppercase tracking-wider font-logo">
                  {selectedItemDetails.category}
                </span>
                <h3 className="font-logo font-extrabold text-2xl text-white">
                  {selectedItemDetails.name}
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {selectedItemDetails.description || 'Our signature chef recipe made with premium select spices and seasoned fresh toppings.'}
              </p>
              
              <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
                <span className="font-logo font-extrabold text-2xl text-maroon dark:text-saffron">₹{selectedItemDetails.price}</span>
                <button 
                  onClick={() => {
                    addToCart(selectedItemDetails);
                    setSelectedItemDetails(null);
                  }}
                  className="px-6 py-2.5 bg-maroon text-white dark:bg-saffron dark:text-maroon font-bold text-sm rounded-xl shadow-md"
                >
                  Add +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MenuSection;
