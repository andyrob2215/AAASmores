import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, Flame, Lock, X, Plus, Minus, Clock, MapPin, Truck, Utensils, RefreshCw, CheckCircle, DollarSign, Tag, Trash2, Edit, Save, WifiOff, AlertTriangle, ArrowLeft, Eye, Receipt, Monitor, Maximize2, Minimize2, Star, Settings, AlertCircle, Image as ImageIcon, EyeOff, CreditCard, Search, Phone, Navigation } from 'lucide-react';

const USE_LIVE_API = true;
const API_URL = '/api'; 

// --- HELPERS ---
const formatTime = (isoString, withSeconds = false) => {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  const options = { hour: 'numeric', minute: '2-digit' };
  if (withSeconds) options.second = '2-digit';
  return date.toLocaleTimeString('en-US', options);
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const parseCustomization = (str) => {
    if (!str) return { isCustom: false, text: '' };
    const isCustom = str.startsWith("CUSTOM: ");
    const text = isCustom ? str.substring(8) : str;
    return { isCustom, text };
};

const formatPhoneNumber = (val) => {
    if (!val) return '';
    const clean = val.replace(/\D/g, '');
    const match = clean.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
        if (!match[2]) return match[1] ? `(${match[1]}` : '';
        if (!match[3]) return `(${match[1]}) ${match[2]}`;
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return clean;
};

const getRandomFlare = () => {
    const msgs = ["Roasting perfection...", "Sticky goodness incoming!", "Any second now!", "Chocolate is melting...", "Almost s'more time!"];
    return msgs[Math.floor(Math.random() * msgs.length)];
};

// Robust Interval Hook
function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// --- SUB-COMPONENTS ---

const Navbar = ({ view, setView, cart }) => (
  <nav className="sticky top-0 z-50 bg-neutral-900/95 backdrop-blur-md border-b border-orange-500/20 text-white shadow-lg">
    <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
      <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer hover:text-orange-400">
        <div className="bg-orange-600 p-1.5 rounded-full"><Flame className="w-5 h-5 text-white" /></div>
        <span className="font-bold text-xl tracking-tight">AAA<span className="text-orange-500">Smores</span></span>
      </div>
      <div className="flex gap-4 items-center">
        <button onClick={() => setView('queue')} className={`text-sm md:text-base font-medium hover:text-orange-400 ${view === 'queue' ? 'text-orange-500' : ''}`}>Queue</button>
        <button onClick={() => setView('pay')} className={`text-sm md:text-base font-medium hover:text-orange-400 ${view === 'pay' ? 'text-orange-500' : ''}`}>Pay</button>
        <button onClick={() => setView('menu')} className={`text-sm md:text-base font-medium hover:text-orange-400 ${view === 'menu' ? 'text-orange-500' : ''}`}>Menu</button>
        <button onClick={() => setView('reviews')} className={`text-sm md:text-base font-medium hover:text-orange-400 ${view === 'reviews' ? 'text-orange-500' : ''}`}>Reviews</button>
        <button onClick={() => setView('cart')} className="relative bg-orange-600 hover:bg-orange-700 p-2 rounded-lg">
          <ShoppingCart className="w-5 h-5" />
          {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
        </button>
      </div>
    </div>
  </nav>
);

const Hero = ({ setView, siteConfig }) => {
  const bgUrl = siteConfig?.hero_background_url ? `${API_URL}${siteConfig.hero_background_url}` : '/campfire_v2.mp4';
  const isVideo = siteConfig?.hero_background_type === 'video' || !siteConfig?.hero_background_url;

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {isVideo ? (
        <video key={bgUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"><source src={bgUrl} type="video/mp4" /></video>
      ) : (
        <img src={bgUrl} alt="Hero Background" className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none" />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-neutral-950/80 to-neutral-950 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl bg-black/20 backdrop-blur-[2px] p-8 rounded-3xl border border-white/10 shadow-2xl">
        <Flame className="w-24 h-24 text-orange-500 mb-6 drop-shadow-[0_0_25px_rgba(251,140,0,0.6)] animate-pulse" />
        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">FIRE. <span className="text-orange-500">CHOCOLATE.</span> <br/>GOOD TIMES.</h1>
        <p className="text-neutral-400 text-lg max-w-xl mb-10">The ultimate campfire experience.</p>
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
          <button onClick={() => setView('menu')} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-900/30 transition-all">Order Now</button>
          <button onClick={() => setView('queue')} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-4 rounded-xl font-bold text-lg border border-neutral-700">Check ETA</button>
        </div>
      </div>
    </div>
  );
};


const ReviewsView = ({ API_URL, showNotification }) => {
    const [reviews, setReviews] = useState([]);
    const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/reviews`).then(res => res.json()).then(data => setReviews(data)).catch(console.error);
    }, [API_URL]);

    const submitReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const payload = { ...form, name: isAnonymous ? 'Anonymous' : form.name };
        try {
            const res = await fetch(`${API_URL}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) { showNotification("Review Submitted!"); setForm({ name: '', rating: 5, comment: '' }); setIsAnonymous(false); fetch(`${API_URL}/reviews`).then(res => res.json()).then(data => setReviews(data)); }
        } catch (err) { showNotification("Failed to submit review", "error"); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12"><Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" /><h2 className="text-4xl font-bold text-white mb-2">AAASmores Reviews</h2><p className="text-neutral-400">See what others are roasting.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl h-fit sticky top-24">
                    <h3 className="text-xl font-bold text-white mb-4">Leave a Review</h3>
                    <form onSubmit={submitReview} className="space-y-4">
                        <div><div className="flex justify-between items-center mb-1"><label className="text-xs text-neutral-500 uppercase font-bold">Name</label><label className="flex items-center gap-2 text-xs text-orange-400 cursor-pointer select-none"><input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="rounded bg-neutral-950 border-neutral-700 text-orange-500 focus:ring-0" />Stay Anonymous</label></div><input required={!isAnonymous} type="text" value={isAnonymous ? '' : form.name} onChange={e => setForm({...form, name: e.target.value})} disabled={isAnonymous} className={`w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white ${isAnonymous ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder={isAnonymous ? "Anonymous" : "Your Name"} /></div>
                        <div><label className="text-xs text-neutral-500 uppercase font-bold block mb-1">Rating</label><div className="flex gap-2">{[1, 2, 3, 4, 5].map(num => (<button key={num} type="button" onClick={() => setForm({...form, rating: num})} className={`p-2 rounded-lg transition-colors ${form.rating >= num ? 'text-yellow-500 bg-yellow-500/10' : 'text-neutral-600 bg-neutral-950'}`}><Star className="w-6 h-6 fill-current" /></button>))}</div></div>
                        <div><label className="text-xs text-neutral-500 uppercase font-bold block mb-1">Comment</label><textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-white h-24" placeholder="How was it?" /></div>
                        <button disabled={submitting} type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">{submitting ? 'Posting...' : 'Post Review'}</button>
                    </form>
                </div>
                <div className="md:col-span-2 space-y-4">
                    {reviews.length === 0 ? <div className="text-center text-neutral-500 py-10">No reviews yet. Be the first!</div> : reviews.map(r => (<div key={r.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl"><div className="flex justify-between items-start mb-2"><h4 className="font-bold text-white text-lg">{r.customer_name}</h4><div className="flex text-yellow-500">{[...Array(r.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div></div><p className="text-neutral-300 leading-relaxed">"{r.comment}"</p><p className="text-xs text-neutral-600 mt-4">{formatDate(r.created_at)}</p></div>))}
                </div>
            </div>
        </div>
    );
};

const CustomizationModal = ({ item, allIngredients, onClose, onConfirm }) => {
  const baseIngredients = item.recipe_ingredients || [];
  const [counts, setCounts] = useState(() => {
    const initial = {};
    allIngredients.forEach(ing => initial[ing.id] = 0);
    baseIngredients.forEach(base => {
        initial[base.id] = base.qty || 1;
    });
    return initial;
  });

  const getSurcharge = () => {
    let extraCount = 0;
    Object.keys(counts).forEach(ingId => {
        const currentQty = counts[ingId];
        const baseItem = baseIngredients.find(b => b.id === parseInt(ingId));
        const baseQty = baseItem ? (baseItem.qty || 1) : 0;
        if (currentQty > baseQty) extraCount += (currentQty - baseQty);
    });
    return extraCount * 0.50;
  };

  const handleConfirm = () => {
    const surcharge = getSurcharge();
    
    const baseCounts = {};
    allIngredients.forEach(ing => baseCounts[ing.id] = 0);
    baseIngredients.forEach(base => {
        baseCounts[base.id] = base.qty || 1;
    });
    const isCustom = Object.keys(counts).some(id => counts[id] !== baseCounts[id]);

    let customizationDescription = Object.keys(counts)
        .filter(id => counts[id] > 0)
        .map(id => {
            const ing = allIngredients.find(i => i.id === parseInt(id));
            return `${counts[id]}x ${ing.name}`;
        })
        .join(', ');

    if (isCustom && customizationDescription) {
        customizationDescription = "CUSTOM: " + customizationDescription;
    }

    onConfirm(item, surcharge, customizationDescription);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/50">
            <div><h3 className="text-2xl font-bold text-white">{item.name}</h3><p className="text-orange-500 font-bold">${item.price.toFixed(2)} Base Price</p></div>
            <button onClick={onClose} className="bg-neutral-800 p-2 rounded-full hover:bg-neutral-700"><X className="text-white w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
            <p className="text-sm text-neutral-400 mb-4">{item.description}</p>
            <div className="bg-orange-900/10 border border-orange-900/30 p-3 rounded-lg mb-4 text-sm text-orange-200 flex gap-2">
                <Utensils className="w-4 h-4 mt-0.5" /> <div>Customize your S'more! Extra ingredients are <strong>+$0.50</strong> each.</div>
            </div>
            <div className="space-y-3">
                {allIngredients.map(ing => (
                    <div key={ing.id} className="flex justify-between items-center bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                        <span className="text-white font-medium">{ing.name}</span>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setCounts(prev => ({...prev, [ing.id]: Math.max(0, prev[ing.id] - 1)}))} className={`p-1.5 rounded ${counts[ing.id] > 0 ? 'bg-neutral-800 text-white hover:bg-red-900' : 'text-neutral-700 cursor-not-allowed'}`}><Minus className="w-4 h-4" /></button>
                            <span className="w-6 text-center font-bold text-lg">{counts[ing.id]}</span>
                            <button onClick={() => setCounts(prev => ({...prev, [ing.id]: prev[ing.id] + 1}))} className="p-1.5 rounded bg-neutral-800 text-white hover:bg-green-900"><Plus className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="p-6 border-t border-neutral-800 bg-neutral-900">
            <div className="flex justify-between mb-4 text-sm"><span className="text-neutral-400">Surcharge:</span><span className="text-green-400">+${getSurcharge().toFixed(2)}</span></div>
            <button onClick={handleConfirm} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold flex justify-between px-6 text-lg shadow-lg"><span>Add to Order</span><span>${(item.price + getSurcharge()).toFixed(2)}</span></button>
        </div>
      </div>
    </div>
  );
};

const MenuGrid = ({ menuItems, openCustomizer }) => (
  <div className="max-w-6xl mx-auto px-4 py-12">
    <h2 className="text-3xl font-bold text-white mb-2">Our Menu</h2>
    <p className="text-neutral-500 mb-8">Click an item to customize ingredients.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map(item => (
        <div key={item.id} onClick={() => item.is_available && openCustomizer(item)} className={`bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden transition-all relative group cursor-pointer ${!item.is_available ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-900/10'}`}>
          <div className="h-48 w-full bg-neutral-950 relative">
             {item.image_url ? <img src={`${API_URL}${item.image_url}`} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-800"><Flame className="w-12 h-12" /></div>}
             {!item.is_available && <div className="absolute inset-0 bg-neutral-950/80 flex items-center justify-center"><span className="text-red-500 font-bold text-xl uppercase tracking-widest border-2 border-red-500 px-4 py-2 rounded transform -rotate-12">Sold Out</span></div>}
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4"><div className="bg-orange-900/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full uppercase">{item.category}</div><span className="text-xl font-bold text-white">${item.price.toFixed(2)}</span></div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{item.name}</h3>
            <p className="text-neutral-400 text-sm mb-6 h-12 line-clamp-2">{item.description}</p>
            <div className="w-full bg-neutral-800 text-neutral-300 py-3 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-white group-hover:text-black transition-colors"><Utensils className="w-4 h-4" /> Customize & Add</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- DYNAMIC QUEUE CALCULATOR ---
const calculateWaitTime = (order, index, activeOrders) => {
    const headOrder = activeOrders[0];
    const headElapsedMs = new Date() - new Date(headOrder.created_at);
    const headElapsedMins = headElapsedMs / 60000;
    const headRemaining = Math.max(0, 4 - headElapsedMins);
    
    const myWait = (index * 4) + headRemaining;
    
    return {
        minutes: Math.ceil(myWait),
        isReadyNow: myWait <= 0.5,
        msg: myWait <= 0.5 ? getRandomFlare() : `~${Math.ceil(myWait)} min`
    };
};

const QueueBoard = ({ queue, lastUpdated }) => {
  const activeOrders = Array.isArray(queue) ? queue.filter(q => q.status === 'pending') : [];
  const readyOrders = Array.isArray(queue) ? queue.filter(q => q.status === 'completed' && !q.picked_up) : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10"><Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" /><h2 className="text-4xl font-bold text-white mb-2">Order Queue</h2><p className="text-neutral-400">Track your treat.</p></div>
      
      {activeOrders.length === 0 && readyOrders.length === 0 && <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500"><p className="text-xl">The fire is quiet. No pending orders.</p></div>}
      
      <div className="grid gap-4">
          {readyOrders.map(q => (
             <div key={q.id} className="bg-green-900/20 border border-green-500/30 p-6 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4"><div className="bg-green-600/20 p-2 rounded-full"><CheckCircle className="w-6 h-6 text-green-500"/></div><div><h3 className="text-2xl font-bold text-white">{q.customer_name}</h3><p className="text-xs text-green-400">Ready for pickup!</p></div></div>
                <div className="text-right text-green-500 font-bold text-xl uppercase">READY</div>
             </div>
          ))}

          {activeOrders.map((q, idx) => {
              const eta = calculateWaitTime(q, idx, activeOrders);
              return (
                <div key={q.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-4"><div className="bg-neutral-800 w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 font-bold">#{idx + 1}</div><div><h3 className="text-2xl font-bold text-white">{q.customer_name}</h3><p className="text-xs text-neutral-500">Ordered at {formatTime(q.created_at)}</p></div></div>
                  <div className="text-right">
                      <div className="text-orange-500 font-bold text-xl">{eta.msg}</div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider">Estimated Wait</div>
                  </div>
                </div>
              );
          })}
      </div>
      <div className="text-center mt-8 text-neutral-600 text-xs">Live Updates Active • Last Sync: {lastUpdated ? formatTime(lastUpdated.time, true) : 'Syncing...'}</div>
    </div>
  );
};

const PayView = ({ API_URL, siteConfig, showNotification }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [unlockCode, setUnlockCode] = useState('');

    const fetchUnpaid = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/unpaid`);
            if (res.ok) setOrders(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [API_URL]);

    useEffect(() => { fetchUnpaid(); }, [fetchUnpaid]);

    const handleUpdatePayment = async (orderId, method) => {
        try {
            if (method === 'cash') {
                if (unlockCode.toLowerCase() !== (siteConfig.cash_unlock_code || 'familycash').toLowerCase()) {
                    showNotification('Invalid Cash Unlock Code', 'error');
                    return;
                }
            }

            const res = await fetch(`${API_URL}/orders/${orderId}/payment-method`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethod: method })
            });
            
            if (res.ok) {
                showNotification('Payment method updated. Please complete payment.');
                fetchUnpaid(); 
                if (method === 'cash') setSelectedOrder(null);
            }
        } catch (e) { showNotification('Error updating payment', 'error'); }
    };

    const getPaymentLink = (method, total) => {
        switch(method) {
            case 'venmo': return `https://venmo.com/aaasmores?txn=pay&amount=${total}&note=Order`;
            case 'cashapp': return `https://cash.app/$aaasmores/${total}`;
            case 'paypal': return `https://paypal.me/aaasmores/${total}`;
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Pay for Orders</h2>
            {loading ? <div className="text-center text-neutral-500">Loading...</div> : (
                <div className="grid gap-6">
                    {orders.length === 0 && <div className="text-center text-neutral-500">No unpaid orders found.</div>}
                    {orders.map(order => (
                        <div key={order.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <div><h3 className="text-xl font-bold text-white">{order.customer_name}</h3><p className="text-sm text-neutral-400">Total: ${parseFloat(order.total_price).toFixed(2)} • Current Method: <span className="capitalize text-orange-400">{order.payment_method}</span></p></div>
                                <button onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)} className="bg-neutral-800 px-4 py-2 rounded-lg text-white hover:bg-neutral-700">Pay Now</button>
                            </div>
                            
                            {selectedOrder === order.id && (
                                <div className="mt-4 pt-4 border-t border-neutral-800 animate-in fade-in slide-in-from-top-2">
                                    <p className="text-sm text-neutral-400 mb-3">Select payment method to complete:</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['venmo', 'cashapp', 'paypal'].map(method => (
                                            <a key={method} href={getPaymentLink(method, order.total_price)} target="_blank" rel="noreferrer" onClick={() => handleUpdatePayment(order.id, method)} className={`block text-center py-3 rounded-lg font-bold text-white ${method === 'venmo' ? 'bg-blue-500' : (method === 'cashapp' ? 'bg-green-600' : 'bg-indigo-600')}`}>
                                                {method.charAt(0).toUpperCase() + method.slice(1)}
                                            </a>
                                        ))}
                                        <div className="col-span-2 flex gap-2">
                                            <input type="text" placeholder="Cash Code" value={unlockCode} onChange={e => setUnlockCode(e.target.value)} className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white" />
                                            <button onClick={() => handleUpdatePayment(order.id, 'cash')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 rounded-lg">Pay Cash</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CartView = ({ cart, updateCartQty, submitOrder, view, setView, API_URL, siteConfig, showNotification }) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [tipOption, setTipOption] = useState(0); 
  const [customTip, setCustomTip] = useState('');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [siteNumber, setSiteNumber] = useState('');
  const [codeInput, setCodeInput] = useState(''); 
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cashapp');
  const [activeDiscount, setActiveDiscount] = useState(null); 
  const [isCashUnlocked, setIsCashUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [loadingGps, setLoadingGps] = useState(false);

  const deliveryEnabled = siteConfig?.deliveries_enabled;
  const cashUnlockCode = siteConfig?.cash_unlock_code || 'familycash';

  useEffect(() => { if(!deliveryEnabled) setDeliveryType('pickup'); }, [deliveryEnabled]);

  const getTipAmount = () => { if (customTip) return Math.max(0, parseFloat(customTip) || 0); if (tipOption === 0) return 0; return (subtotal * (tipOption / 100)); };
  
  const handleApplyCode = async () => {
    if (!codeInput) return;
    setErrorMsg('');

    if (codeInput.toLowerCase() === cashUnlockCode.toLowerCase()) {
        setIsCashUnlocked(true);
        setSelectedPaymentMethod('cash');
        showNotification("Cash payment unlocked!", "success");
        setCodeInput('');
        return;
    }

    try { 
        const res = await fetch(`${API_URL}/discounts/validate`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ code: codeInput }) 
        }); 
        const data = await res.json(); 
        if (data.valid) { 
            setActiveDiscount(data.discount); 
            showNotification(`Discount "${data.discount.code}" applied!`, "success");
            setCodeInput('');
        } else { 
            setErrorMsg('Invalid code'); 
        } 
    } catch(e) { setErrorMsg('Error validating code'); }
  };
  
  const handlePhoneChange = (e) => {
      const formatted = formatPhoneNumber(e.target.value);
      if (formatted.length <= 14) setPhoneNumber(formatted); 
  };

  const handleGetLocation = () => {
      setLoadingGps(true);
      if (!navigator.geolocation) {
          showNotification("Geolocation not supported", "error");
          setLoadingGps(false);
          return;
      }
      navigator.geolocation.getCurrentPosition(
          (pos) => {
              setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              showNotification("Location acquired!", "success");
              setLoadingGps(false);
          },
          (err) => {
              showNotification("Failed to get location. Ensure GPS is on.", "error");
              setLoadingGps(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
  };

  const isPhoneValid = phoneNumber.replace(/\D/g, '').length === 10;

  const getDiscountAmount = () => { 
    if (!activeDiscount) return 0; 
    if (activeDiscount.type === 'percent') return subtotal * (activeDiscount.value / 100); 
    if (activeDiscount.type === 'flat') return parseFloat(activeDiscount.value); 
    return 0; 
  };

  const tipAmount = getTipAmount();
  const discountAmount = getDiscountAmount();
  const finalTotal = Math.max(0, subtotal - discountAmount + tipAmount);

  const handleSubmit = () => {
      const unlockCode = selectedPaymentMethod === 'cash' ? cashUnlockCode : null;
      const couponCode = activeDiscount ? activeDiscount.code : null;
      submitOrder(
          name, notes, tipAmount, activeDiscount, deliveryType, siteNumber, selectedPaymentMethod, couponCode, unlockCode, phoneNumber, 
          gpsCoords ? gpsCoords.lat : null, gpsCoords ? gpsCoords.lng : null
      );
  };

  if(cart.length === 0) return <div className="text-center py-20 text-neutral-500"><ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50"/><p>Cart empty.</p></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Confirm Order</h2>
      
      {deliveryEnabled ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6 flex gap-2">
            <button onClick={() => setDeliveryType('pickup')} className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${deliveryType === 'pickup' ? 'bg-orange-600 text-white' : 'bg-neutral-950 text-neutral-400'}`}><MapPin className="w-4 h-4" /> I'll Pick Up</button>
            <button onClick={() => setDeliveryType('delivery')} className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${deliveryType === 'delivery' ? 'bg-orange-600 text-white' : 'bg-neutral-950 text-neutral-400'}`}><Truck className="w-4 h-4" /> Deliver to Site</button>
          </div>
      ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6 text-center text-neutral-400 text-sm">
              Deliveries are currently unavailable. Pickup only.
          </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
        {cart.map((item, idx) => {
          const { text } = parseCustomization(item.customization);
          return (
            <div key={`${item.id}-${idx}`} className="flex flex-col py-3 border-b border-neutral-800 last:border-0">
              <div className="flex justify-between items-center"><div><h4 className="font-bold text-white">{item.name}</h4><p className="text-neutral-500 text-sm">${item.finalPrice.toFixed(2)}</p></div><div className="flex items-center gap-3 bg-neutral-950 rounded-lg p-1"><button onClick={() => updateCartQty(idx, -1)} className="p-1 hover:text-red-400"><Minus className="w-4 h-4" /></button><span className="font-bold w-4 text-center">{item.quantity}</span><button onClick={() => updateCartQty(idx, 1)} className="p-1 hover:text-green-400"><Plus className="w-4 h-4" /></button></div></div>
              {text && <p className="text-xs text-orange-400/80 mt-1 italic pl-2 border-l-2 border-orange-900">{text}</p>}
            </div>
          );
        })}
        <div className="mt-6 pt-4 border-t border-neutral-800 space-y-4">
             <div>
                <label className="text-sm text-neutral-400 mb-2 block">Codes (Discount or Cash Unlock)</label>
                <div className="flex gap-2">
                    <input type="text" value={codeInput} onChange={e => setCodeInput(e.target.value.toUpperCase())} placeholder="Enter Code" className="flex-1 bg-neutral-950 border border-neutral-800 rounded p-2 text-white uppercase" />
                    <button onClick={handleApplyCode} className="bg-neutral-800 px-4 rounded font-bold hover:bg-white hover:text-black">Apply</button>
                </div>
                {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
                {activeDiscount && <p className="text-green-500 text-xs mt-1">Discount Applied: {activeDiscount.type === 'percent' ? `${activeDiscount.value}%` : `$${activeDiscount.value}`} OFF</p>}
                {isCashUnlocked && <p className="text-green-500 text-xs mt-1">Cash Payment Unlocked</p>}
             </div>

             <div>
                 <label className="text-sm text-neutral-400 mb-2 block">Driver/Cook Tip</label>
                 <div className="flex gap-2 mb-2">{[0, 15, 20, 25].map(pct => (<button key={pct} onClick={() => { setTipOption(pct); setCustomTip(''); }} className={`flex-1 py-2 rounded-lg font-bold text-sm ${tipOption === pct && !customTip ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>{pct === 0 ? 'None' : `${pct}%`}</button>))}</div>
                 <div className="relative"><DollarSign className="absolute left-3 top-3 w-4 h-4 text-neutral-500" /><input type="number" min="0" placeholder="Custom Amount" value={customTip} onChange={(e) => { const v = e.target.value; if(v >= 0) setCustomTip(v); setTipOption(-1); }} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-9 pr-4 text-white" /></div>
             </div>
        </div>
        
        <div className="mt-6 border-t border-neutral-800 pt-4 space-y-4">
            <h3 className="text-sm text-neutral-400 font-bold uppercase tracking-wide mb-2">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSelectedPaymentMethod('cashapp')} className={`py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${selectedPaymentMethod === 'cashapp' ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>Cash App</button>
                <button onClick={() => setSelectedPaymentMethod('venmo')} className={`py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${selectedPaymentMethod === 'venmo' ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>Venmo</button>
                <button onClick={() => setSelectedPaymentMethod('paypal')} className={`py-3 rounded-lg font-bold flex items-center justify-center gap-2 col-span-2 ${selectedPaymentMethod === 'paypal' ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>PayPal</button>
                <button onClick={() => isCashUnlocked && setSelectedPaymentMethod('cash')} className={`py-3 rounded-lg font-bold flex items-center justify-center gap-2 col-span-2 ${selectedPaymentMethod === 'cash' ? 'bg-orange-600 text-white' : (isCashUnlocked ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800')}`}>
                    {isCashUnlocked ? <><DollarSign className="w-4 h-4" /> Cash</> : <><Lock className="w-4 h-4" /> Cash (Requires Code)</>}
                </button>
            </div>
        </div>

        <div className="mt-6 flex justify-between items-end">
            <div className="text-neutral-400 text-sm">
                <div>Subtotal: ${subtotal.toFixed(2)}</div>
                {activeDiscount && <div className="text-green-500">Discount: -${discountAmount.toFixed(2)}</div>}
                <div>Tip: ${tipAmount.toFixed(2)}</div>
            </div>
            <div className="text-3xl font-bold text-orange-500">${finalTotal.toFixed(2)}</div>
        </div>
      </div>
      <div className="space-y-4">
        {selectedPaymentMethod !== 'cash' && (
            <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-red-500">Wait! Payment Required First.</h4>
                    <p className="text-sm text-red-200 mt-1">Your order will <strong>NOT</strong> start cooking until we receive your payment. We will verify it manually.</p>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 gap-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white" />
            {deliveryType === 'delivery' && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input type="text" value={siteNumber} onChange={e => { setSiteNumber(e.target.value); setGpsCoords(null); }} placeholder="Campsite Number" className="w-full bg-neutral-900 border border-orange-500/50 rounded-xl p-4 text-white" disabled={!!gpsCoords} />
                        </div>
                        <div className="flex items-center text-neutral-500 text-sm">OR</div>
                        <button onClick={handleGetLocation} className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold ${gpsCoords ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
                            {loadingGps ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                            {gpsCoords ? 'Location Set' : 'Use Current GPS'}
                        </button>
                    </div>
                    {gpsCoords && <div className="text-xs text-green-500 text-center">Precise location captured. Drivers will be guided to your pin.</div>}
                    <input type="tel" value={phoneNumber} onChange={handlePhoneChange} placeholder="Phone Number (Required)" className="w-full bg-neutral-900 border border-orange-500/50 rounded-xl p-4 text-white" />
                </div>
            )}
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white h-20" />
        <button disabled={!name || (deliveryType === 'delivery' && ((!siteNumber && !gpsCoords) || !isPhoneValid))} onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-900/20">
            {selectedPaymentMethod === 'cash' ? `Place Order (Cash $${finalTotal.toFixed(2)})` : `Place Order & Pay $${finalTotal.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};

// **MOVED UP**
const StorefrontQueueDisplay = ({ queue, deliveryEnabled }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Sort logic handled in backend typically but ensure for ETA calc
    const pendingOrders = Array.isArray(queue) ? queue.filter(o => o.status === 'pending') : [];
    const readyPickupOrders = Array.isArray(queue) ? queue.filter(o => o.status === 'completed' && !o.picked_up && o.delivery_type !== 'delivery') : [];
    const outForDeliveryOrders = Array.isArray(queue) ? queue.filter(o => o.status === 'completed' && !o.picked_up && o.delivery_type === 'delivery') : [];

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) { document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)); } 
        else if (document.exitFullscreen) { document.exitFullscreen().then(() => setIsFullscreen(false)); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-neutral-950 text-white overflow-hidden font-sans flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-orange-900/30 bg-neutral-900/50">
                <div className="flex items-center gap-4"><div className="bg-orange-600 p-3 rounded-full animate-pulse shadow-[0_0_20px_rgba(234,88,12,0.5)]"><Flame className="w-8 h-8 text-white" /></div><div><h1 className="text-4xl font-black tracking-tighter">AAA<span className="text-orange-500">Smores</span></h1><p className="text-neutral-400 text-sm tracking-widest uppercase">Live Campfire Queue</p></div></div>
                <button onClick={toggleFullscreen} className="text-neutral-500 hover:text-white transition-colors">{isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}</button>
            </div>
            <div className={`flex-1 grid gap-8 p-8 min-h-0 ${deliveryEnabled ? 'grid-cols-5' : 'grid-cols-2'}`}>
                <div className={`${deliveryEnabled ? 'col-span-2' : 'col-span-1'} flex flex-col bg-neutral-900/30 border border-orange-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm min-h-0`}><div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div><h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-orange-400 border-b border-orange-500/20 pb-4"><Flame className="w-8 h-8 animate-bounce" /> In The Fire</h2><div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">{pendingOrders.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-50"><Clock className="w-16 h-16 mb-4" /><p className="text-2xl font-light">Waiting for orders...</p></div> : pendingOrders.map((q, idx) => {
                    const eta = calculateWaitTime(q, idx, pendingOrders);
                    return (
                        <div key={q.id} className="bg-neutral-800/80 border border-neutral-700 p-5 rounded-2xl flex items-center justify-between shadow-lg transform transition-all hover:scale-[1.02] hover:border-orange-500/50"><div className="flex items-center gap-5"><div className="bg-orange-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-md">#{idx + 1}</div><div><h3 className="text-3xl font-bold">{q.customer_name}</h3><p className="text-neutral-400 text-sm mt-1">Ordered at {formatTime(q.created_at)}</p></div></div><div className="text-right"><div className="text-2xl font-bold text-orange-400">{eta.msg}</div><div className="text-xs uppercase tracking-wider text-neutral-500">Wait Time</div></div></div>
                    );
                })}</div></div>
                <div className={`${deliveryEnabled ? 'col-span-2' : 'col-span-1'} flex flex-col bg-neutral-900/30 border border-green-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm min-h-0`}><div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div><h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-green-400 border-b border-green-500/20 pb-4"><CheckCircle className="w-8 h-8" /> Ready for Pickup</h2><div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">{readyPickupOrders.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-50"><p className="text-xl">All clear!</p></div> : readyPickupOrders.map((h) => (<div key={h.id} className="bg-green-900/20 border border-green-500/30 p-5 rounded-2xl flex items-center justify-between"><div><h3 className="text-3xl font-bold text-white">{h.customer_name}</h3><p className="text-green-300/70 text-sm mt-1">Ready for pickup</p></div><div className="bg-green-500/20 p-2 rounded-full"><CheckCircle className="w-8 h-8 text-green-500" /></div></div>))}</div></div>
                {deliveryEnabled && (<div className="col-span-1 flex flex-col bg-neutral-900/30 border border-blue-500/20 rounded-3xl p-4 relative overflow-hidden backdrop-blur-sm min-h-0"><div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div><h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400 border-b border-blue-500/20 pb-3"><Truck className="w-6 h-6" /> Deliveries</h2><div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">{outForDeliveryOrders.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-50"><p className="text-sm">No deliveries.</p></div> : outForDeliveryOrders.map((h) => (<div key={h.id} className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl"><h3 className="text-lg font-bold text-white truncate">{h.customer_name}</h3><div className="flex items-center gap-2 text-blue-300 text-sm mt-1"><MapPin className="w-3 h-3" /> Site {h.delivery_location}</div></div>))}</div></div>)}
            </div>
        </div>
    );
};

// **MOVED UP**
const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    const items = order.items || order.order_items || [];
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 bg-neutral-800 p-2 rounded-full hover:bg-neutral-700"><X className="text-white w-5 h-5" /></button>
                <div className="p-8 text-center border-b border-neutral-800">
                    <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-8 h-8 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Order #{order.id}</h2>
                    <p className="text-neutral-400">{formatDate(order.created_at)} • {formatTime(order.created_at)}</p>
                    <div className="mt-4 inline-block px-4 py-1 rounded-full bg-neutral-800 text-sm font-bold uppercase tracking-wide text-neutral-300">
                        {order.status}
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Customer</h4>
                        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                            <div className="font-bold text-lg text-white">{order.customer_name}</div>
                            {order.delivery_type === 'delivery' ? (
                                <div className="flex items-center gap-2 text-orange-400 mt-1"><Truck className="w-4 h-4"/> Site {order.delivery_location}</div>
                            ) : (
                                <div className="flex items-center gap-2 text-blue-400 mt-1"><MapPin className="w-4 h-4"/> Local Pickup</div>
                            )}
                            <div className="flex items-center gap-2 text-neutral-400 mt-1"><DollarSign className="w-4 h-4"/> <span className="capitalize">{order.payment_method}</span> ({order.payment_status})</div>
                            {order.delivery_type === 'delivery' && order.phone_number && (
                                <div className="flex items-center gap-2 text-neutral-400 mt-1"><Phone className="w-4 h-4"/> {order.phone_number}</div>
                            )}
                            {order.gps_lat && order.gps_lng && (
                                <a href={`https://www.google.com/maps/search/?api=1&query=${order.gps_lat},${order.gps_lng}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-green-500 mt-2 hover:underline">
                                    <MapPin className="w-4 h-4" /> Open Exact Location
                                </a>
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Order Details</h4>
                        <div className="space-y-3">
                            {(!items || items.length === 0) && (
                                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-sm text-red-300 italic">
                                    <p>Item details not available from backend.</p>
                                    <p className="text-xs mt-1 text-red-400/70">Endpoint /api/admin/dashboard missing item data.</p>
                                </div>
                            )}
                            {items.map((item, idx) => {
                                const { isCustom, text } = parseCustomization(item.custom);
                                return (
                                    <div key={idx} className="bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                                        <div className="flex justify-between font-medium text-white">
                                            <span>{item.qty}x {isCustom && <span className="text-orange-500 font-bold text-xs mr-1">CUSTOM</span>} {item.name}</span>
                                        </div>
                                        {text && <div className="text-xs text-orange-500/80 mt-1 pl-2 border-l-2 border-orange-500/30 italic">{text}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {order.notes && (
                        <div>
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Notes</h4>
                            <p className="text-sm text-white italic bg-neutral-800/50 p-3 rounded-lg">"{order.notes}"</p>
                        </div>
                    )}
                    <div className="pt-4 border-t border-neutral-800">
                        <div className="flex justify-between text-sm text-neutral-400 mb-1">
                            <span>Subtotal (approx)</span>
                            <span>${(parseFloat(order.total_price) - parseFloat(order.tip_amount)).toFixed(2)}</span>
                        </div>
                        {parseFloat(order.tip_amount) > 0 && (
                            <div className="flex justify-between text-sm text-green-500 mb-1">
                                <span>Tip</span>
                                <span>+${parseFloat(order.tip_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold text-white mt-4">
                            <span>Total</span>
                            <span>${parseFloat(order.total_price).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ staffAuth, setStaffAuth, API_URL, showNotification, setView, siteConfig }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminTab, setAdminTab] = useState('active'); 
  
  // Data State
  const [adminData, setAdminData] = useState({ awaitingPayment: [], pending: [], history: [], ingredients: [], menuItems: [], recipes: [], discounts: [], sales: {}, deliveryEnabled: true, cashUnlockCode: 'familycash' });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Editing State
  const [editingItem, setEditingItem] = useState(null); 
  const [newIngredient, setNewIngredient] = useState('');
  const [newDiscount, setNewDiscount] = useState({ code: '', type: 'percent', value: '' });
  const [viewingOrder, setViewingOrder] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  // Config State
  const [tempCashCode, setTempCashCode] = useState('');

  // FETCH LOGIC
  const fetchAdminData = useCallback(async (showLoading = false) => {
      if (showLoading) setIsLoading(true);
      try {
          const res = await fetch(`${API_URL}/admin/dashboard?_t=${Date.now()}`, { 
              headers: { 
                  'Cache-Control': 'no-store',
                  'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}`
              } 
          });
          if (res.status === 401 || res.status === 403) { logout(); return; }
          if (!res.ok) throw new Error('Server Error');
          const data = await res.json();
          setAdminData(data);
          setTempCashCode(data.cashUnlockCode); // Sync local state
          setLastUpdated({ time: new Date().toISOString(), error: false });
      } catch (e) {
          setLastUpdated(prev => ({ ...prev, error: true, msg: e.message }));
      } finally {
          if (showLoading) setIsLoading(false);
      }
  }, [API_URL]);

  // POLLING & INITIAL LOAD
  useEffect(() => {
      if (staffAuth) {
          fetchAdminData(true);
          const interval = setInterval(() => fetchAdminData(false), 5000);
          return () => clearInterval(interval);
      }
  }, [staffAuth, fetchAdminData]);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (res.ok && data.token) { 
          setStaffAuth(true); 
          localStorage.setItem('aaasmores_auth', 'true'); 
          localStorage.setItem('aaasmores_token', data.token);
      } 
      else { showNotification('Invalid Credentials', 'error'); }
    } catch (e) { showNotification('Login Failed', 'error'); }
  };

  const logout = () => { setStaffAuth(false); localStorage.removeItem('aaasmores_auth'); localStorage.removeItem('aaasmores_token'); setView('home'); };

  const toggleDelivery = async (newState) => {
      try {
          await fetch(`${API_URL}/config`, { 
              method: 'POST', 
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}`
              }, 
              body: JSON.stringify({ deliveries_enabled: newState }) 
          });
          fetchAdminData();
      } catch(e) {}
  };

  const updateCashCode = async () => {
      try {
          await fetch(`${API_URL}/config`, { 
              method: 'POST', 
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}`
              }, 
              body: JSON.stringify({ cash_unlock_code: tempCashCode }) 
          });
          showNotification('Cash Code Updated');
          fetchAdminData();
      } catch(e) { showNotification('Failed to update', 'error'); }
  };

  const updateOrderStatus = async (id, status) => { try { await fetch(`${API_URL}/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` }, body: JSON.stringify({ status }) }); fetchAdminData(); } catch (e) {} };
  const markPickedUp = async (id) => { try { await fetch(`${API_URL}/orders/${id}/pickup`, { method: 'PUT', headers: { 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` } }); fetchAdminData(); } catch (e) {} };
  const handleDeleteOrder = async (id) => { if(!window.confirm("Are you sure you want to delete this order?")) return; try { await fetch(`${API_URL}/admin/orders/${id}/delete`, { method: 'PUT', headers: { 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` } }); fetchAdminData(); } catch (e) {} };
  const handleMarkOrderPaid = async (id) => { if(!window.confirm("Mark this order as paid and move to active?")) return; try { await fetch(`${API_URL}/admin/orders/${id}/mark-paid`, { method: 'PUT', headers: { 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` } }); fetchAdminData(); } catch (e) {} };
  const toggleIngredient = async (id, currentStatus) => { await fetch(`${API_URL}/ingredients/${id}/toggle`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` }, body: JSON.stringify({ inStock: !currentStatus }) }); fetchAdminData(); };
  
  const handleSaveMenu = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', editingItem.name);
    formData.append('description', editingItem.description);
    formData.append('price', editingItem.price);
    formData.append('category', editingItem.category);
    formData.append('manual_availability', editingItem.manual_availability);
    formData.append('is_visible', editingItem.is_visible); 
    if (editingItem.ingredientIds) { formData.append('ingredientIds', JSON.stringify(editingItem.ingredientIds)); }
    if (imageFile) { formData.append('image', imageFile); }

    const method = editingItem.id ? 'PUT' : 'POST';
    const url = editingItem.id ? `${API_URL}/menu/${editingItem.id}` : `${API_URL}/menu`;
    await fetch(url, { 
        method, 
        body: formData,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}`
        }
    });
    setEditingItem(null); setImageFile(null); fetchAdminData(); showNotification("Menu Item Saved");
  };

  const handleDeleteMenu = async (id) => { if(!window.confirm("Delete?")) return; await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` } }); fetchAdminData(); };
  const handleAddIngredient = async () => { if(!newIngredient) return; await fetch(`${API_URL}/ingredients`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` }, body: JSON.stringify({ name: newIngredient }) }); setNewIngredient(''); fetchAdminData(); };
  const handleDeleteIngredient = async (id) => { if(!window.confirm("Delete?")) return; await fetch(`${API_URL}/ingredients/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` } }); fetchAdminData(); };
  const handleAddDiscount = async () => { if(!newDiscount.code) return; await fetch(`${API_URL}/discounts`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` }, body: JSON.stringify(newDiscount) }); setNewDiscount({ code: '', type: 'percent', value: '' }); fetchAdminData(); };
  const handleDeleteDiscount = async (id) => { if(!window.confirm("Delete?")) return; await fetch(`${API_URL}/discounts/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` } }); fetchAdminData(); };
  const updateRecipeIngredient = (ingId, delta) => {
      const current = editingItem.ingredientIds || [];
      const existingIndex = current.findIndex(i => i.id === ingId);
      if (existingIndex >= 0) {
          const newQty = current[existingIndex].qty + delta;
          if (newQty <= 0) setEditingItem({ ...editingItem, ingredientIds: current.filter(i => i.id !== ingId) });
          else { const newIngs = [...current]; newIngs[existingIndex].qty = newQty; setEditingItem({ ...editingItem, ingredientIds: newIngs }); }
      } else if (delta > 0) {
          setEditingItem({ ...editingItem, ingredientIds: [...current, { id: ingId, qty: delta }] });
      }
  };

  const handleViewOrder = (order) => {
      setViewingOrder(order);
  };

  // Helper to render buttons for active orders without complex IIFEs
  const renderActiveOrderButtons = (o) => {
      let mainButton;
      if (o.status === 'completed') {
           if (o.delivery_type === 'delivery') {
               mainButton = <button onClick={() => markPickedUp(o.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Truck className="w-4 h-4"/> Mark Delivered</button>;
           } else {
               mainButton = <button onClick={() => markPickedUp(o.id)} className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4"/> Picked Up</button>;
           }
      } else {
           // Pending
           mainButton = <button onClick={() => updateOrderStatus(o.id, 'completed')} className="flex-1 bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-bold">Mark Ready</button>;
      }
      
      return (
          <>
              {mainButton}
              {o.payment_status === 'unpaid' && (
                  <button onClick={() => handleMarkOrderPaid(o.id)} className="px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center ml-2" title="Mark Payment Collected"><DollarSign className="w-4 h-4" /></button>
              )}
              <button onClick={() => updateOrderStatus(o.id, 'cancelled')} className="px-4 bg-neutral-800 hover:bg-red-900 text-neutral-400 rounded-lg ml-2">Cancel</button>
          </>
      );
  };

  // SEPARATE VISIBLE AND HIDDEN ITEMS
  const visibleItems = adminData.menuItems?.filter(i => i.is_visible) || [];
  const hiddenItems = adminData.menuItems?.filter(i => !i.is_visible) || [];

  const handleBackgroundUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      try {
          const res = await fetch(`${API_URL}/config/background`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${localStorage.getItem('aaasmores_token')}` },
              body: formData
          });
          if (res.ok) showNotification('Background Updated (Refresh to see)');
          else showNotification('Upload Failed', 'error');
      } catch (err) {
          showNotification('Upload Failed', 'error');
      }
  };

  if (!staffAuth) return (
    <div className="min-h-screen flex items-center justify-center bg-black relative z-50">
      <div className="w-full max-w-sm p-6">
        <h2 className="text-white text-center font-bold mb-4">Staff Login</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 rounded text-center" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 text-white p-3 rounded text-center" />
          <button onClick={handleLogin} className="w-full bg-neutral-800 text-white p-3 rounded hover:bg-orange-600 transition-colors font-bold">Enter</button>
        </div>
      </div>
    </div>
  );

  if (adminTab === 'display') {
      return (
          <div className="min-h-screen bg-black text-white">
              <div className="absolute top-4 right-4 z-50"><button onClick={() => setAdminTab('active')} className="bg-neutral-800/80 hover:bg-neutral-700 text-white p-2 rounded-full backdrop-blur-md"><X className="w-5 h-5" /></button></div>
              <StorefrontQueueDisplay queue={adminData.pending} deliveryEnabled={adminData.deliveryEnabled} />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="bg-neutral-900 border-b border-neutral-800 p-4 sticky top-0 z-50 flex justify-between items-center">
        <h2 className="font-bold text-xl flex items-center gap-2">Admin Dashboard</h2>
        <div className="flex gap-2">
            <button onClick={() => fetchAdminData(true)} className="bg-neutral-800 hover:bg-neutral-700 p-2 rounded text-white"><RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /></button>
            <button onClick={logout} className="text-sm text-neutral-500 hover:text-white">Logout</button>
        </div>
      </div>
      <div className="flex gap-2 p-4 overflow-x-auto">
        {['active', 'inventory', 'menu', 'discounts', 'history', 'settings', 'display'].map(tab => (
           <button key={tab} onClick={() => setAdminTab(tab)} className={`px-4 py-2 rounded-lg font-medium capitalize ${adminTab === tab ? 'bg-orange-600 text-white' : 'bg-neutral-900 text-neutral-400'}`}>
               {tab === 'display' ? <div className="flex items-center gap-2"><Monitor className="w-4 h-4" /> Store Display</div> : tab}
           </button>
        ))}
      </div>
      <div className="max-w-6xl mx-auto p-4">
        {adminTab === 'settings' && (
             <div className="space-y-6">
                 <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                     <h3 className="text-xl font-bold mb-4 text-white">Store Configuration</h3>
                     <div className="space-y-4">
                         <div className="flex items-center justify-between"><div><div className="text-lg font-bold text-white">Accept Deliveries</div><div className="text-sm text-neutral-400">Enable or disable delivery orders for customers.</div></div><button onClick={() => toggleDelivery(!adminData.deliveryEnabled)} className={`w-16 h-8 rounded-full p-1 transition-colors ${adminData.deliveryEnabled ? 'bg-green-600' : 'bg-neutral-700'}`}><div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${adminData.deliveryEnabled ? 'translate-x-8' : 'translate-x-0'}`} /></button></div>
                         <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
                             <div className="flex-1">
                                 <label className="text-sm text-neutral-400 block mb-1">Cash Unlock Code</label>
                                 <input type="text" value={tempCashCode} onChange={e => setTempCashCode(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-white" />
                             </div>
                             <button onClick={updateCashCode} className="bg-neutral-800 hover:bg-white hover:text-black px-4 py-2 rounded mt-6 font-bold">Update</button>
                         </div>
                     </div>
                 </div>
                 <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                     <h3 className="text-xl font-bold mb-4 text-white">Home Background</h3>
                     <div className="flex items-center gap-4">
                         <label className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg cursor-pointer font-bold flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Upload New (Image/Video)<input type="file" accept="image/*,video/*" className="hidden" onChange={handleBackgroundUpload} /></label>
                         {siteConfig?.hero_background_url && <span className="text-green-500 text-sm">Custom background active</span>}
                     </div>
                 </div>
             </div>
        )}
        {adminTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unpaid / Awaiting Payment Column */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-red-400 uppercase tracking-widest flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5"/> Unpaid / Review</h3>
                {adminData.awaitingPayment?.map(o => (
                    <div key={o.id} className="bg-red-900/10 border border-red-500/30 p-6 rounded-xl animate-in fade-in">
                        <div className="flex justify-between items-start mb-4">
                            <div><h3 className="text-xl font-bold text-white">{o.customer_name}</h3><div className="flex gap-2 mt-1"><span className="bg-red-500/20 text-red-200 px-2 py-0.5 rounded text-xs border border-red-500/30 capitalize flex items-center gap-1"><DollarSign className="w-3 h-3"/> {o.payment_method}</span></div></div>
                            <div className="text-right font-bold text-xl">${parseFloat(o.total_price).toFixed(2)}</div>
                        </div>
                        <div className="bg-neutral-950/50 p-3 rounded-lg mb-4 text-sm text-neutral-300">
                            {o.items?.map((i, idx) => (
                                <div key={idx}>{i.qty}x {i.name} {i.custom && <span className="text-xs text-orange-400">({parseCustomization(i.custom).text})</span>}</div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleMarkOrderPaid(o.id)} className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm"><CheckCircle className="w-4 h-4"/> Paid</button>
                            <button onClick={() => handleDeleteOrder(o.id)} className="px-4 bg-neutral-800 hover:bg-red-900 text-neutral-400 rounded-lg text-sm">Delete</button>
                        </div>
                    </div>
                ))}
                {(!adminData.awaitingPayment || adminData.awaitingPayment.length === 0) && <p className="text-center text-neutral-600 italic">No unpaid orders.</p>}
            </div>

            {/* Active / Cooking Column */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Flame className="w-5 h-5"/> Active / Cooking</h3>
                {adminData.pending?.map(o => (
                    <div key={o.id} className={`border p-6 rounded-xl relative animate-in fade-in ${o.status === 'completed' ? 'bg-green-900/10 border-green-500/50' : 'bg-neutral-900 border-neutral-800'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div><h3 className="text-2xl font-bold">{o.customer_name}</h3><div className="flex gap-2 mt-1">{o.delivery_type === 'delivery' ? <span className="bg-orange-900/50 text-orange-200 px-2 py-0.5 rounded text-xs border border-orange-500/30 flex items-center gap-1"><Truck className="w-3 h-3"/> Site {o.delivery_location}</span> : <span className="bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded text-xs border border-blue-500/30">Pickup</span>}<span className="bg-neutral-900/50 text-neutral-300 px-2 py-0.5 rounded text-xs border border-neutral-500/30 capitalize">{o.payment_method} ({o.payment_status})</span><span className="text-neutral-500 text-sm">{formatTime(o.created_at)}</span></div>{o.notes && <p className="text-orange-400 mt-2 text-sm italic">"{o.notes}"</p>}
                            {o.delivery_type === 'delivery' && o.phone_number && <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3"/> {o.phone_number}</div>}
                            {o.gps_lat && o.gps_lng && <a href={`https://www.google.com/maps/search/?api=1&query=${o.gps_lat},${o.gps_lng}`} target="_blank" rel="noreferrer" className="text-xs text-green-500 mt-1 flex items-center gap-1 hover:underline"><MapPin className="w-3 h-3"/> Open GPS Location</a>}
                            </div>
                            <div className="text-right">{o.status === 'completed' ? <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold uppercase">Ready</span> : <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold uppercase">Cooking</span>}<div className="font-bold text-neutral-300 text-xl mt-1">${parseFloat(o.total_price).toFixed(2)}</div></div>
                        </div>
                        <div className="bg-neutral-950 p-4 rounded-lg mb-4 space-y-2">
                            {o.items?.map((i, idx) => {
                                const { isCustom, text } = parseCustomization(i.custom);
                                return (
                                    <div key={idx} className="text-sm border-b border-neutral-800/50 pb-2 last:border-0 mb-2 last:mb-0">
                                        <div className="flex justify-between text-neutral-300 font-medium"><span>{i.qty}x {isCustom && <span className="text-orange-500 font-bold text-xs mr-1">CUSTOM</span>}<span className="text-white font-bold">{i.name}</span></span></div>
                                        {text && <div className="text-xs text-orange-500/80 pl-4 mt-0.5 italic flex items-start gap-1"><Edit className="w-3 h-3 mt-0.5 flex-shrink-0"/> {text}</div>}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-2">
                            {renderActiveOrderButtons(o)}
                        </div>
                    </div>
                ))}
                {(!adminData.pending || adminData.pending.length === 0) && !isLoading && <p className="text-center text-neutral-500 py-10">No active orders.</p>}
            </div>
          </div>
        )}
        {adminTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{adminData.ingredients.map(ing => (<div key={ing.id} className="flex items-center justify-between bg-neutral-900 p-4 rounded-lg border border-neutral-800"><span className={!ing.is_in_stock ? 'text-neutral-500 line-through' : 'text-white font-medium'}>{ing.name}</span><button onClick={() => toggleIngredient(ing.id, ing.is_in_stock)} className={`w-12 h-6 rounded-full p-1 transition-colors ${ing.is_in_stock ? 'bg-green-600' : 'bg-neutral-700'}`}><div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${ing.is_in_stock ? 'translate-x-6' : 'translate-x-0'}`} /></button></div>))}</div>
        )}
        {adminTab === 'menu' && (
          <div>
            {!editingItem ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Menu Items</h3><button onClick={() => setEditingItem({ name: '', description: '', price: 0, category: 'Smore', ingredientIds: [], manual_availability: true, is_visible: true })} className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-bold text-sm flex gap-2"><Plus className="w-4 h-4" /> Add Item</button></div>
                
                {/* Active Items */}
                <div className="grid gap-4">
                  {visibleItems.map(item => (
                    <div key={item.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex justify-between items-center">
                      <div><div className="font-bold text-lg">{item.name}</div><div className="text-neutral-500 text-sm">${parseFloat(item.price).toFixed(2)}</div></div>
                      <div className="flex gap-2"><button onClick={() => { const relatedIngredients = adminData.recipes.filter(r => r.menu_item_id === item.id).map(r => ({ id: r.ingredient_id, qty: r.quantity || 1 })); setEditingItem({ ...item, ingredientIds: relatedIngredients }); }} className="p-2 bg-neutral-800 rounded hover:bg-white hover:text-black"><Edit className="w-4 h-4" /></button><button onClick={() => handleDeleteMenu(item.id)} className="p-2 bg-neutral-800 rounded hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4" /></button></div>
                    </div>
                  ))}
                </div>

                {/* Hidden Items & Raw Ingredients Section */}
                <div className="border-t border-neutral-800 pt-6 mt-6">
                  {hiddenItems.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-neutral-500">Hidden Menu Items</h3>
                        <div className="flex flex-wrap gap-2">
                            {hiddenItems.map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => { const relatedIngredients = adminData.recipes.filter(r => r.menu_item_id === item.id).map(r => ({ id: r.ingredient_id, qty: r.quantity || 1 })); setEditingItem({ ...item, ingredientIds: relatedIngredients }); }}
                                    className="bg-neutral-900 border border-red-900/50 text-neutral-400 hover:text-white hover:border-orange-500 px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors"
                                >
                                    {item.name} <EyeOff className="w-3 h-3" />
                                </button>
                            ))}
                        </div>
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-4">Raw Ingredients</h3>
                  <div className="flex gap-2 mb-4"><input type="text" placeholder="New Ingredient Name" value={newIngredient} onChange={e => setNewIngredient(e.target.value)} className="flex-1 bg-neutral-900 border border-neutral-800 rounded p-2 text-white" /><button onClick={handleAddIngredient} className="bg-neutral-800 px-4 rounded hover:bg-white hover:text-black">Add</button></div>
                  <div className="flex flex-wrap gap-2">{adminData.ingredients.map(ing => (<div key={ing.id} className="bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">{ing.name}<button onClick={() => handleDeleteIngredient(ing.id)} className="text-neutral-500 hover:text-red-500"><X className="w-3 h-3" /></button></div>))}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveMenu} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
                  <div className="flex justify-between"><h3 className="text-xl font-bold">{editingItem.id ? 'Edit Item' : 'New Item'}</h3><button type="button" onClick={() => setEditingItem(null)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button></div>
                  <div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-neutral-500 block mb-1">Name</label><input required className="w-full bg-neutral-950 border border-neutral-800 rounded p-2" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} /></div><div><label className="text-xs text-neutral-500 block mb-1">Price</label><input required type="number" step="0.01" className="w-full bg-neutral-950 border border-neutral-800 rounded p-2" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} /></div></div>
                  <div><label className="text-xs text-neutral-500 block mb-1">Description</label><textarea className="w-full bg-neutral-950 border border-neutral-800 rounded p-2" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} /></div>
                  
                  {/* VISIBILITY TOGGLE */}
                  <div className="flex items-center gap-2"><input type="checkbox" checked={editingItem.is_visible} onChange={e => setEditingItem({...editingItem, is_visible: e.target.checked})} className="rounded bg-neutral-950 border-neutral-700 text-orange-600 focus:ring-0" /><label className="text-sm text-neutral-400">Show on Public Menu</label></div>

                  {/* IMAGE UPLOAD */}
                  <div><label className="text-xs text-neutral-500 block mb-1">Item Image</label><label className="w-full bg-neutral-950 border border-neutral-800 border-dashed rounded p-4 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50"><ImageIcon className="w-6 h-6 text-neutral-500 mb-2" /><span className="text-xs text-neutral-400">{imageFile ? imageFile.name : (editingItem.image_url ? 'Replace Image' : 'Upload Image')}</span><input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} /></label>{editingItem.image_url && !imageFile && <div className="mt-2 text-xs text-green-500">Current image set</div>}</div>

                  <div><label className="text-xs text-neutral-500 block mb-2">Recipe (Required Ingredients)</label><div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-neutral-950 p-4 rounded border border-neutral-800 max-h-60 overflow-y-auto">{adminData.ingredients.map(ing => {
                      const current = editingItem.ingredientIds?.find(i => i.id === ing.id);
                      const qty = current ? current.qty : 0;
                      return (
                          <div key={ing.id} className={`flex justify-between items-center p-2 rounded ${qty > 0 ? 'bg-orange-900/20 border border-orange-500/30' : 'bg-neutral-900 border border-neutral-800'}`}>
                              <span className={`text-sm ${qty > 0 ? 'text-orange-200' : 'text-neutral-500'}`}>{ing.name}</span>
                              <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => updateRecipeIngredient(ing.id, -1)} className="p-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400"><Minus className="w-3 h-3" /></button>
                                  <span className={`text-sm font-bold w-4 text-center ${qty > 0 ? 'text-white' : 'text-neutral-600'}`}>{qty}</span>
                                  <button type="button" onClick={() => updateRecipeIngredient(ing.id, 1)} className="p-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400"><Plus className="w-3 h-3" /></button>
                              </div>
                          </div>
                      );
                  })}</div></div>
                  <div className="flex gap-2 pt-4"><button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4"/> Save Item</button><button type="button" onClick={() => { setEditingItem(null); setImageFile(null); }} className="px-6 bg-neutral-800 hover:bg-white hover:text-black rounded">Cancel</button></div>
              </form>
            )}
          </div>
        )}
        {adminTab === 'history' && (
          <div className="space-y-4"><div className="overflow-x-auto rounded-xl border border-neutral-800"><table className="w-full text-left text-sm text-neutral-400"><thead className="bg-neutral-900 uppercase text-xs font-bold text-neutral-500"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Time</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4 text-right">Total</th></tr></thead><tbody className="divide-y divide-neutral-800 bg-neutral-900/50">{adminData.history.map(h => (<tr key={h.id} onClick={() => handleViewOrder(h)} className="hover:bg-neutral-800 cursor-pointer transition-colors"><td className="px-6 py-4 font-mono text-orange-500">#{h.id}</td><td className="px-6 py-4">{formatDate(h.created_at)}</td><td className="px-6 py-4">{formatTime(h.created_at)}</td><td className="px-6 py-4 font-bold text-white">{h.customer_name}</td><td className="px-6 py-4 text-right text-white">${parseFloat(h.total_price).toFixed(2)}</td></tr>))}</tbody></table></div></div>
        )}
      </div>
      
      {viewingOrder && <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}
      <div className={`fixed bottom-0 w-full bg-neutral-950 border-t border-neutral-800 py-1 text-center text-xs flex justify-center items-center gap-2 ${lastUpdated && lastUpdated.error ? 'text-red-500' : 'text-neutral-600'}`}>{lastUpdated && lastUpdated.error ? <><WifiOff className="w-3 h-3" /> Connection Lost ({lastUpdated.msg || 'Unknown'}). Retrying...</> : <>Live System Active • Last Checked: {lastUpdated ? formatTime(lastUpdated.time, true) : 'Syncing...'}</>}</div>
    </div>
  );
};

// ... (Keep SuccessView and App Main same as fixed version) ...
const SuccessView = ({ setView, API_URL, showNotification, order }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Helper to generate payment links
  const getPaymentLink = (method, total) => {
      switch(method) {
          case 'venmo': return `https://venmo.com/aaasmores`;
          case 'cashapp': return `https://cash.app/$aaasmores/${total}`;
          case 'paypal': return `https://paypal.me/aaasmores/${total}`;
          default: return null;
      }
  };

  // We need the order details to show the payment link.
  const paymentMethod = localStorage.getItem('last_payment_method');
  const lastTotal = localStorage.getItem('last_order_total');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return showNotification("Please select a star rating", "error");
    setSubmitting(true);
    try {
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name || 'Anonymous', rating, comment })
        });
        if (res.ok) {
            setSubmitted(true);
            showNotification("Review posted! Thank you.");
        } else {
            showNotification("Failed to post review", "error");
        }
    } catch (e) {
        showNotification("Error posting review", "error");
    } finally {
        setSubmitting(false);
    }
  };

  const isElectronic = paymentMethod === 'venmo' || paymentMethod === 'cashapp' || paymentMethod === 'paypal';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle className="w-10 h-10 text-white" /></div>
      <h2 className="text-4xl font-bold text-white mb-4">Order Received!</h2>
      <p className="text-neutral-400 max-w-md mb-8">
          {isElectronic ? 
            "We have received your order. Please complete payment below to start the fire!" : 
            "We are preparing your campfire treats. Please have CASH ready upon pickup/delivery."}
      </p>
      
      {/* Payment Buttons for Electronic Methods */}
      {isElectronic && (
          <div className="mb-8 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Complete Payment</h3>
              <a href={getPaymentLink(paymentMethod, lastTotal)} target="_blank" rel="noreferrer" className={`block w-full py-4 rounded-xl font-bold text-lg text-white mb-3 ${paymentMethod === 'venmo' ? 'bg-blue-500' : (paymentMethod === 'cashapp' ? 'bg-green-600' : 'bg-indigo-600')}`}>
                  Pay on {paymentMethod === 'venmo' ? 'Venmo' : (paymentMethod === 'cashapp' ? 'Cash App' : 'PayPal')}
              </a>
              <p className="text-xs text-neutral-500">Clicking will open the app/website. Please enter ${lastTotal}.</p>
          </div>
      )}

      {!submitted ? (
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-md mb-8 animate-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-white mb-2">Rate your experience?</h3>
              <p className="text-neutral-500 text-sm mb-4">Let us know what you think!</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex justify-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" onClick={() => setRating(star)} className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-500' : 'text-neutral-700'}`}>
                              <Star className="w-8 h-8 fill-current" />
                          </button>
                      ))}
                  </div>
                  <input type="text" placeholder="Your Name (Optional)" value={name} onChange={e => setName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm" />
                  <textarea placeholder="Any comments?" value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white text-sm h-20 resize-none" />
                  <button disabled={submitting || rating === 0} type="submit" className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors">
                      {submitting ? 'Posting...' : 'Submit Review'}
                  </button>
              </form>
          </div>
      ) : (
          <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-2xl w-full max-w-md mb-8">
              <p className="text-green-400 font-bold text-lg">Thank you for your review!</p>
              <p className="text-green-300/70 text-sm">See it on the Reviews tab.</p>
          </div>
      )}

      <div className="flex gap-4">
        <button onClick={() => setView('queue')} className="bg-neutral-800 text-white px-6 py-3 rounded-xl font-bold">Check Status</button>
        <button onClick={() => setView('home')} className="text-orange-500 font-bold px-6 py-3">Return Home</button>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState(() => localStorage.getItem('aaasmores_view') || 'home'); 
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('aaasmores_cart') || '[]'));
  
  const [menuItems, setMenuItems] = useState([]);
  const [queue, setQueue] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [notification, setNotification] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [siteConfig, setSiteConfig] = useState({ deliveries_enabled: true, hero_background_url: null, hero_background_type: null });
  
  const [staffAuth, setStaffAuth] = useState(() => localStorage.getItem('aaasmores_auth') === 'true');
  const [customizingItem, setCustomizingItem] = useState(null);

  useEffect(() => { localStorage.setItem('aaasmores_view', view); }, [view]);
  useEffect(() => { localStorage.setItem('aaasmores_cart', JSON.stringify(cart)); }, [cart]);

  const fetchMenu = useCallback(async () => { if (!USE_LIVE_API) return; try { const res = await fetch(`${API_URL}/menu?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-store' } }); const data = await res.json(); setMenuItems(data.map(i => ({...i, price: parseFloat(i.price)}))); } catch (e) { showNotification("Error loading menu", "error"); } }, []);
  const fetchIngredients = useCallback(async () => { try { const res = await fetch(`${API_URL}/ingredients?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-store' } }); setAllIngredients(await res.json()); } catch (e) { console.error(e); } }, []);
  const fetchConfig = useCallback(async () => { try { const res = await fetch(`${API_URL}/config?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-store' } }); const data = await res.json(); setSiteConfig(data); } catch (e) { console.error(e); } }, []);

  const fetchQueue = useCallback(async () => { 
      try { 
          const res = await fetch(`${API_URL}/queue?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-store' } }); 
          if (!res.ok) throw new Error('Server Error');
          const data = await res.json(); 
          setQueue(data); 
          setLastUpdated({ time: new Date().toISOString(), error: false });
          fetchConfig();
      } catch (e) { 
          setLastUpdated(prev => ({ ...prev, error: true })); 
      } 
  }, [fetchConfig]);

  // Initial Load of Config
  useEffect(() => {
      fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (view === 'menu') { fetchMenu(); fetchIngredients(); }
    if (view === 'queue' || view === 'cart') { fetchQueue(); fetchConfig(); }
  }, [view, staffAuth, fetchMenu, fetchIngredients, fetchQueue, fetchConfig]);

  useInterval(() => {
      if (view === 'queue') fetchQueue();
      if (view === 'menu') { fetchMenu(); fetchIngredients(); }
      if (view === 'cart') fetchConfig(); 
  }, 5000);

  const submitOrder = async (name, notes, tip, discount, deliveryType, deliveryLocation, paymentMethod, couponCode, unlockCode, phoneNumber, gpsLat, gpsLng) => {
    const subtotal = cart.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
    let discountAmount = 0;
    if(discount) { if(discount.type === 'percent') discountAmount = subtotal * (discount.value / 100); else discountAmount = parseFloat(discount.value); }
    
    // Store payment info for SuccessView
    localStorage.setItem('last_payment_method', paymentMethod);
    localStorage.setItem('last_order_total', Math.max(0, subtotal - discountAmount + tip).toFixed(2));

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, items: cart, total: Math.max(0, subtotal - discountAmount + tip), notes, tip, discountCodeId: discount ? discount.id : null, discountAmount, deliveryType, deliveryLocation, paymentMethod, couponCode, unlockCode, phoneNumber, gpsLat, gpsLng })
      });
      if (res.ok) { setCart([]); setView('success'); localStorage.removeItem('aaasmores_cart'); }
    } catch (e) { showNotification("Failed to order", "error"); }
  };

  const showNotification = (msg, type = 'success') => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000); };
  const addToCart = (item, surcharge, customizationDescription) => { const cartItem = { ...item, finalPrice: item.price + surcharge, customization: customizationDescription, uniqueKey: `${item.id}-${customizationDescription}` }; const existingIndex = cart.findIndex(i => i.uniqueKey === cartItem.uniqueKey); if (existingIndex >= 0) { const newCart = [...cart]; newCart[existingIndex].quantity += 1; setCart(newCart); } else { setCart([...cart, { ...cartItem, quantity: 1 }]); } setCustomizingItem(null); showNotification(`Added ${item.name}`); };
  const updateCartQty = (index, delta) => { const newCart = [...cart]; newCart[index].quantity += delta; if(newCart[index].quantity <= 0) newCart.splice(index, 1); setCart(newCart); };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-200 selection:bg-orange-500 selection:text-white">
      {view !== 'admin' && view !== 'admin-login' && <Navbar view={view} setView={setView} cart={cart} />}
      {notification && <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-bold ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>{notification.msg}</div>}
      {lastUpdated && lastUpdated.error && view !== 'admin' && (<div className="bg-red-600 text-white p-2 text-center text-sm font-bold flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> Connection Lost ({lastUpdated.msg || 'Unknown'}). Retrying...</div>)}
      <main className="pb-20">
        {view === 'home' && <Hero setView={setView} siteConfig={siteConfig} />}
        {view === 'menu' && <MenuGrid menuItems={menuItems} openCustomizer={setCustomizingItem} />}
        {view === 'queue' && <QueueBoard queue={queue} lastUpdated={lastUpdated} />}
        {view === 'pay' && <PayView API_URL={API_URL} siteConfig={siteConfig} showNotification={showNotification} />}
        {view === 'reviews' && <ReviewsView API_URL={API_URL} showNotification={showNotification} />}
        {view === 'cart' && <CartView cart={cart} updateCartQty={updateCartQty} submitOrder={submitOrder} view={view} setView={setView} API_URL={API_URL} siteConfig={siteConfig} showNotification={showNotification} />}
        {view === 'success' && <SuccessView setView={setView} API_URL={API_URL} showNotification={showNotification} />}
        {(view === 'admin-login' || view === 'admin') && 
          <AdminDashboard setView={setView} staffAuth={staffAuth} setStaffAuth={setStaffAuth} API_URL={API_URL} showNotification={showNotification} siteConfig={siteConfig} />
        }
      </main>

      {customizingItem && (
        <CustomizationModal item={customizingItem} allIngredients={allIngredients} onClose={() => setCustomizingItem(null)} onConfirm={addToCart} />
      )}

      {view !== 'admin' && (
        <footer className="fixed bottom-0 w-full py-4 text-center opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="inline-block"><button onClick={() => { setView('admin-login'); }} className="text-neutral-800 hover:text-neutral-600 flex items-center justify-center gap-1 mx-auto text-xs"><Lock className="w-3 h-3" /> Staff Only</button></div>
        </footer>
      )}
    </div>
  );
};

export default App;