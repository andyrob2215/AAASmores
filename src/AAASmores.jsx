import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, Flame, Lock, X, Plus, Minus, Clock, MapPin, Truck, Utensils, RefreshCw, CheckCircle, DollarSign, Tag, Trash2, Edit, Save, WifiOff, AlertTriangle, ArrowLeft, Eye, Receipt, Monitor, Maximize2, Minimize2, Star, Settings, AlertCircle, Image as ImageIcon, EyeOff } from 'lucide-react';

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

const Hero = ({ setView }) => (
  <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover -z-20 opacity-50"><source src="/campfire.mp4" type="video/mp4" /></video>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-neutral-950/80 to-neutral-950 -z-10"></div>
    <Flame className="w-24 h-24 text-orange-500 mb-6 drop-shadow-[0_0_25px_rgba(251,140,0,0.6)] animate-pulse" />
    <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">FIRE. <span className="text-orange-500">CHOCOLATE.</span> <br/>GOOD TIMES.</h1>
    <p className="text-neutral-400 text-lg max-w-xl mb-10">The ultimate campfire experience.</p>
    <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
      <button onClick={() => setView('menu')} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-900/30 transition-all">Order Now</button>
      <button onClick={() => setView('queue')} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-4 rounded-xl font-bold text-lg border border-neutral-700">Check ETA</button>
    </div>
  </div>
);

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
        initial[base.id] = (initial[base.id] || 0) + 1;
    });
    return initial;
  });

  const getSurcharge = () => {
    let extraCount = 0;
    Object.keys(counts).forEach(ingId => {
        const currentQty = counts[ingId];
        const baseQty = baseIngredients.filter(b => b.id === parseInt(ingId)).length;
        if (currentQty > baseQty) extraCount += (currentQty - baseQty);
    });
    return extraCount * 0.50;
  };

  const handleConfirm = () => {
    const surcharge = getSurcharge();
    
    const baseCounts = {};
    allIngredients.forEach(ing => baseCounts[ing.id] = 0);
    baseIngredients.forEach(base => {
        baseCounts[base.id] = (baseCounts[base.id] || 0) + 1;
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

const QueueBoard = ({ queue, lastUpdated }) => {
  const myEta = (index) => (index + 1) * 4;
  const validQueue = Array.isArray(queue) ? queue : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10"><Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" /><h2 className="text-4xl font-bold text-white mb-2">Order Queue</h2><p className="text-neutral-400">Current wait time: ~4 minutes per order.</p></div>
      {validQueue.length === 0 ? <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-500"><p className="text-xl">The fire is quiet. No pending orders.</p></div> : 
        <div className="grid gap-4">{validQueue.map((q, idx) => (
            <div key={q.id} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4"><div className="bg-neutral-800 w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 font-bold">#{idx + 1}</div><div><h3 className="text-2xl font-bold text-white">{q.customer_name}</h3><p className="text-xs text-neutral-500">Ordered at {formatTime(q.created_at)}</p></div></div>
              <div className="text-right">
                  {q.status === 'completed' ? <div className="text-green-500 font-bold text-xl uppercase">Ready</div> : <><div className="text-orange-500 font-bold text-xl">~{myEta(idx)} min</div><div className="text-xs text-neutral-500 uppercase tracking-wider">Estimated Wait</div></>}
              </div>
            </div>
        ))}</div>
      }
      <div className="text-center mt-8 text-neutral-600 text-xs">Live Updates Active • Last Sync: {lastUpdated ? formatTime(lastUpdated.time, true) : 'Syncing...'}</div>
    </div>
  );
};

const CartView = ({ cart, updateCartQty, submitOrder, view, setView, API_URL, deliveryEnabled }) => {
  const subtotal = cart.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [tipOption, setTipOption] = useState(0); 
  const [customTip, setCustomTip] = useState('');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [siteNumber, setSiteNumber] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [activeDiscount, setActiveDiscount] = useState(null); 
  const [discountError, setDiscountError] = useState('');

  useEffect(() => { if(!deliveryEnabled) setDeliveryType('pickup'); }, [deliveryEnabled]);

  const getTipAmount = () => { if (customTip) return Math.max(0, parseFloat(customTip) || 0); if (tipOption === 0) return 0; return (subtotal * (tipOption / 100)); };
  const validateDiscount = async () => { if (!discountCode) return; try { const res = await fetch(`${API_URL}/discounts/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: discountCode }) }); const data = await res.json(); if (data.valid) { setActiveDiscount(data.discount); setDiscountError(''); } else { setActiveDiscount(null); setDiscountError('Invalid code'); } } catch(e) { console.error(e); } };
  const getDiscountAmount = () => { if (!activeDiscount) return 0; if (activeDiscount.type === 'percent') return subtotal * (activeDiscount.value / 100); if (activeDiscount.type === 'flat') return parseFloat(activeDiscount.value); return 0; };

  const tipAmount = getTipAmount();
  const discountAmount = getDiscountAmount();
  const finalTotal = Math.max(0, subtotal - discountAmount + tipAmount);

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
             <div className="flex gap-2"><input type="text" value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())} placeholder="PROMO CODE" className="flex-1 bg-neutral-950 border border-neutral-800 rounded p-2 text-white uppercase"/><button onClick={validateDiscount} className="bg-neutral-800 px-4 rounded font-bold hover:bg-white hover:text-black">Apply</button></div>
             {discountError && <p className="text-red-500 text-xs">{discountError}</p>}
             {activeDiscount && <p className="text-green-500 text-xs">Applied: {activeDiscount.type === 'percent' ? `${activeDiscount.value}%` : `$${activeDiscount.value}`} OFF</p>}
             <div><label className="text-sm text-neutral-400 mb-2 block">Driver/Cook Tip</label><div className="flex gap-2 mb-2">{[0, 15, 20, 25].map(pct => (<button key={pct} onClick={() => { setTipOption(pct); setCustomTip(''); }} className={`flex-1 py-2 rounded-lg font-bold text-sm ${tipOption === pct && !customTip ? 'bg-orange-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>{pct === 0 ? 'None' : `${pct}%`}</button>))}</div><div className="relative"><DollarSign className="absolute left-3 top-3 w-4 h-4 text-neutral-500" /><input type="number" min="0" placeholder="Custom Amount" value={customTip} onChange={(e) => { const v = e.target.value; if(v >= 0) setCustomTip(v); setTipOption(-1); }} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-9 pr-4 text-white" /></div></div>
        </div>
        <div className="mt-6 flex justify-between items-end"><div className="text-neutral-400 text-sm"><div>Subtotal: ${subtotal.toFixed(2)}</div>{activeDiscount && <div className="text-green-500">Discount: -${discountAmount.toFixed(2)}</div>}<div>Tip: ${tipAmount.toFixed(2)}</div></div><div className="text-3xl font-bold text-orange-500">${finalTotal.toFixed(2)}</div></div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white" />{deliveryType === 'delivery' && (<input type="text" value={siteNumber} onChange={e => setSiteNumber(e.target.value)} placeholder="Campsite Number (Required)" className="w-full bg-neutral-900 border border-orange-500/50 rounded-xl p-4 text-white" />)}</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes..." className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-white h-20" />
        <button disabled={!name || (deliveryType === 'delivery' && !siteNumber)} onClick={() => submitOrder(name, notes, tipAmount, activeDiscount, deliveryType, siteNumber)} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-900/20">Place Order (Cash ${finalTotal.toFixed(2)})</button>
        <p className="text-center text-xs text-neutral-500">By clicking order, you agree to pay in CASH upon receipt.</p>
      </div>
    </div>
  );
};

const StorefrontQueueDisplay = ({ queue, deliveryEnabled }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    
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
                <div className={`${deliveryEnabled ? 'col-span-2' : 'col-span-1'} flex flex-col bg-neutral-900/30 border border-orange-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm min-h-0`}><div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div><h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-orange-400 border-b border-orange-500/20 pb-4"><Flame className="w-8 h-8 animate-bounce" /> In The Fire</h2><div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">{pendingOrders.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-50"><Clock className="w-16 h-16 mb-4" /><p className="text-2xl font-light">Waiting for orders...</p></div> : pendingOrders.map((q, idx) => (<div key={q.id} className="bg-neutral-800/80 border border-neutral-700 p-5 rounded-2xl flex items-center justify-between shadow-lg transform transition-all hover:scale-[1.02] hover:border-orange-500/50"><div className="flex items-center gap-5"><div className="bg-orange-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-md">#{idx + 1}</div><div><h3 className="text-3xl font-bold">{q.customer_name}</h3><p className="text-neutral-400 text-sm mt-1">Ordered at {formatTime(q.created_at)}</p></div></div><div className="text-right"><div className="text-2xl font-bold text-orange-400">~{(idx + 1) * 4} min</div><div className="text-xs uppercase tracking-wider text-neutral-500">Wait Time</div></div></div>))}</div></div>
                <div className={`${deliveryEnabled ? 'col-span-2' : 'col-span-1'} flex flex-col bg-neutral-900/30 border border-green-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm min-h-0`}><div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div><h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-green-400 border-b border-green-500/20 pb-4"><CheckCircle className="w-8 h-8" /> Ready for Pickup</h2><div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">{readyPickupOrders.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-50"><p className="text-xl">All clear!</p></div> : readyPickupOrders.map((h) => (<div key={h.id} className="bg-green-900/20 border border-green-500/30 p-5 rounded-2xl flex items-center justify-between"><div><h3 className="text-3xl font-bold text-white">{h.customer_name}</h3><p className="text-green-300/70 text-sm mt-1">Ready for pickup</p></div><div className="bg-green-500/20 p-2 rounded-full"><CheckCircle className="w-8 h-8 text-green-500" /></div></div>))}</div></div>
                {deliveryEnabled && (<div className="col-span-1 flex flex-col bg-neutral-900/30 border border-blue-500/20 rounded-3xl p-4 relative overflow-hidden backdrop-blur-sm min-h-0"><div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div><h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400 border-b border-blue-500/20 pb-3"><Truck className="w-6 h-6" /> Deliveries</h2><div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">{outForDeliveryOrders.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-neutral-500 opacity-50"><p className="text-sm">No deliveries.</p></div> : outForDeliveryOrders.map((h) => (<div key={h.id} className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl"><h3 className="text-lg font-bold text-white truncate">{h.customer_name}</h3><div className="flex items-center gap-2 text-blue-300 text-sm mt-1"><MapPin className="w-3 h-3" /> Site {h.delivery_location}</div></div>))}</div></div>)}
            </div>
        </div>
    );
};

const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
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
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Order Details</h4>
                        <div className="space-y-3">
                            {order.items?.map((item, idx) => {
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

// --- ADMIN DASHBOARD (Self-Contained Fetching) ---
const AdminDashboard = ({ staffAuth, setStaffAuth, API_URL, showNotification, setView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminTab, setAdminTab] = useState('active'); 
  
  // Data State
  const [adminData, setAdminData] = useState({ pending: [], history: [], ingredients: [], menuItems: [], recipes: [], discounts: [], sales: {}, deliveryEnabled: true });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Editing State
  const [editingItem, setEditingItem] = useState(null); 
  const [newIngredient, setNewIngredient] = useState('');
  const [newDiscount, setNewDiscount] = useState({ code: '', type: 'percent', value: '' });
  const [viewingOrder, setViewingOrder] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // FETCH LOGIC (Moved inside component for isolation)
  const fetchAdminData = useCallback(async (showLoading = false) => {
      if (showLoading) setIsLoading(true);
      try {
          const res = await fetch(`${API_URL}/admin/dashboard?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-store' } });
          if (!res.ok) throw new Error('Server Error');
          const data = await res.json();
          setAdminData(data);
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
      if (res.ok) { setStaffAuth(true); localStorage.setItem('aaasmores_auth', 'true'); } 
      else { showNotification('Invalid Credentials', 'error'); }
    } catch (e) { showNotification('Login Failed', 'error'); }
  };

  const logout = () => { setStaffAuth(false); localStorage.removeItem('aaasmores_auth'); setView('home'); };

  const toggleDelivery = async (newState) => {
      try {
          await fetch(`${API_URL}/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deliveries_enabled: newState }) });
          fetchAdminData();
      } catch(e) {}
  };

  const updateOrderStatus = async (id, status) => { try { await fetch(`${API_URL}/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); fetchAdminData(); } catch (e) {} };
  const markPickedUp = async (id) => { try { await fetch(`${API_URL}/orders/${id}/pickup`, { method: 'PUT' }); fetchAdminData(); } catch (e) {} };
  const toggleIngredient = async (id, currentStatus) => { await fetch(`${API_URL}/ingredients/${id}/toggle`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inStock: !currentStatus }) }); fetchAdminData(); };
  
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
    await fetch(url, { method, body: formData });
    setEditingItem(null); setImageFile(null); fetchAdminData(); showNotification("Menu Item Saved");
  };

  const handleDeleteMenu = async (id) => { if(!window.confirm("Delete?")) return; await fetch(`${API_URL}/menu/${id}`, { method: 'DELETE' }); fetchAdminData(); };
  const handleAddIngredient = async () => { if(!newIngredient) return; await fetch(`${API_URL}/ingredients`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newIngredient }) }); setNewIngredient(''); fetchAdminData(); };
  const handleDeleteIngredient = async (id) => { if(!window.confirm("Delete?")) return; await fetch(`${API_URL}/ingredients/${id}`, { method: 'DELETE' }); fetchAdminData(); };
  const handleAddDiscount = async () => { if(!newDiscount.code) return; await fetch(`${API_URL}/discounts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newDiscount) }); setNewDiscount({ code: '', type: 'percent', value: '' }); fetchAdminData(); };
  const handleDeleteDiscount = async (id) => { if(!window.confirm("Delete?")) return; await fetch(`${API_URL}/discounts/${id}`, { method: 'DELETE' }); fetchAdminData(); };
  const toggleRecipeIngredient = (ingId) => { const currentIds = editingItem.ingredientIds || []; if (currentIds.includes(ingId)) setEditingItem({ ...editingItem, ingredientIds: currentIds.filter(id => id !== ingId) }); else setEditingItem({ ...editingItem, ingredientIds: [...currentIds, ingId] }); };

  // SEPARATE VISIBLE AND HIDDEN ITEMS
  const visibleItems = adminData.menuItems?.filter(i => i.is_visible) || [];
  const hiddenItems = adminData.menuItems?.filter(i => !i.is_visible) || [];

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
      <div className="max-w-4xl mx-auto p-4">
        {adminTab === 'settings' && (
             <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                 <h3 className="text-xl font-bold mb-4 text-white">Store Configuration</h3>
                 <div className="flex items-center justify-between"><div><div className="text-lg font-bold text-white">Accept Deliveries</div><div className="text-sm text-neutral-400">Enable or disable delivery orders for customers.</div></div><button onClick={() => toggleDelivery(!adminData.deliveryEnabled)} className={`w-16 h-8 rounded-full p-1 transition-colors ${adminData.deliveryEnabled ? 'bg-green-600' : 'bg-neutral-700'}`}><div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${adminData.deliveryEnabled ? 'translate-x-8' : 'translate-x-0'}`} /></button></div>
             </div>
        )}
        {adminTab === 'active' && (
          <div className="space-y-4">
            {adminData.pending.map(o => (
              <div key={o.id} className={`border p-6 rounded-xl relative animate-in fade-in ${o.status === 'completed' ? 'bg-green-900/10 border-green-500/50' : 'bg-neutral-900 border-neutral-800'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div><h3 className="text-2xl font-bold">{o.customer_name}</h3><div className="flex gap-2 mt-1">{o.delivery_type === 'delivery' ? <span className="bg-orange-900/50 text-orange-200 px-2 py-0.5 rounded text-xs border border-orange-500/30 flex items-center gap-1"><Truck className="w-3 h-3"/> Site {o.delivery_location}</span> : <span className="bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded text-xs border border-blue-500/30">Pickup</span>}<span className="text-neutral-500 text-sm">{formatTime(o.created_at)}</span></div>{o.notes && <p className="text-orange-400 mt-2 text-sm italic">"{o.notes}"</p>}</div>
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
                <div className="flex gap-2">{o.status === 'completed' ? (o.delivery_type === 'delivery' ? (<button onClick={() => markPickedUp(o.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><Truck className="w-4 h-4"/> Mark Delivered</button>) : (<button onClick={() => markPickedUp(o.id)} className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4"/> Picked Up</button>)) : (<button onClick={() => updateOrderStatus(o.id, 'completed')} className="flex-1 bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-bold">Mark Ready</button>)}<button onClick={() => updateOrderStatus(o.id, 'cancelled')} className="px-4 bg-neutral-800 hover:bg-red-900 text-neutral-400 rounded-lg">Cancel</button></div>
              </div>
            ))}
            {adminData.pending.length === 0 && !isLoading && <p className="text-center text-neutral-500 py-10">No active orders.</p>}
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
                      <div className="flex gap-2"><button onClick={() => { const relatedIngredients = adminData.recipes.filter(r => r.menu_item_id === item.id).map(r => r.ingredient_id); setEditingItem({ ...item, ingredientIds: relatedIngredients }); }} className="p-2 bg-neutral-800 rounded hover:bg-white hover:text-black"><Edit className="w-4 h-4" /></button><button onClick={() => handleDeleteMenu(item.id)} className="p-2 bg-neutral-800 rounded hover:bg-red-600 hover:text-white"><Trash2 className="w-4 h-4" /></button></div>
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
                                    onClick={() => { const relatedIngredients = adminData.recipes.filter(r => r.menu_item_id === item.id).map(r => r.ingredient_id); setEditingItem({ ...item, ingredientIds: relatedIngredients }); }}
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

                  <div><label className="text-xs text-neutral-500 block mb-2">Recipe (Required Ingredients)</label><div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-neutral-950 p-4 rounded border border-neutral-800 max-h-48 overflow-y-auto">{adminData.ingredients.map(ing => (<label key={ing.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-orange-400"><input type="checkbox" checked={editingItem.ingredientIds?.includes(ing.id)} onChange={() => toggleRecipeIngredient(ing.id)} className="rounded bg-neutral-800 border-neutral-700 text-orange-600 focus:ring-0" />{ing.name}</label>))}</div></div>
                  <div className="flex gap-2 pt-4"><button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4"/> Save Item</button><button type="button" onClick={() => { setEditingItem(null); setImageFile(null); }} className="px-6 bg-neutral-800 hover:bg-white hover:text-black rounded">Cancel</button></div>
              </form>
            )}
          </div>
        )}
        {adminTab === 'discounts' && (
            <div className="space-y-6"><div className="flex gap-2 bg-neutral-900 p-4 rounded-xl border border-neutral-800"><div className="flex-1"><label className="text-xs text-neutral-500 block mb-1">Code</label><input type="text" placeholder="SUMMER2025" value={newDiscount.code} onChange={e => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 uppercase" /></div><div className="w-24"><label className="text-xs text-neutral-500 block mb-1">Type</label><select value={newDiscount.type} onChange={e => setNewDiscount({...newDiscount, type: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2"><option value="percent">% Off</option><option value="flat">$ Off</option></select></div><div className="w-24"><label className="text-xs text-neutral-500 block mb-1">Value</label><input type="number" placeholder="10" value={newDiscount.value} onChange={e => setNewDiscount({...newDiscount, value: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded p-2" /></div><button onClick={handleAddDiscount} className="bg-green-600 hover:bg-green-700 px-4 rounded font-bold mt-5">Create</button></div><div className="grid gap-3">{adminData.discounts?.map(d => (<div key={d.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg flex justify-between items-center"><div className="flex items-center gap-3"><div className="bg-neutral-800 p-2 rounded"><Tag className="w-5 h-5 text-orange-500" /></div><div><div className="font-bold text-lg">{d.code}</div><div className="text-neutral-500 text-sm">{d.type === 'percent' ? `${d.value}% Off` : `$${parseFloat(d.value).toFixed(2)} Off`}</div></div></div><button onClick={() => handleDeleteDiscount(d.id)} className="text-neutral-500 hover:text-red-500"><Trash2 className="w-5 h-5" /></button></div>))}</div></div>
        )}
        {adminTab === 'history' && (
          <div className="space-y-4"><div className="overflow-x-auto rounded-xl border border-neutral-800"><table className="w-full text-left text-sm text-neutral-400"><thead className="bg-neutral-900 uppercase text-xs font-bold text-neutral-500"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Time</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4 text-right">Total</th></tr></thead><tbody className="divide-y divide-neutral-800 bg-neutral-900/50">{adminData.history.map(h => (<tr key={h.id} onClick={() => setViewingOrder(h)} className="hover:bg-neutral-800 cursor-pointer transition-colors"><td className="px-6 py-4 font-mono text-orange-500">#{h.id}</td><td className="px-6 py-4">{formatDate(h.created_at)}</td><td className="px-6 py-4">{formatTime(h.created_at)}</td><td className="px-6 py-4 font-bold text-white">{h.customer_name}</td><td className="px-6 py-4 text-right text-white">${parseFloat(h.total_price).toFixed(2)}</td></tr>))}</tbody></table></div></div>
        )}
      </div>
      
      {viewingOrder && <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />}
      <div className={`fixed bottom-0 w-full bg-neutral-950 border-t border-neutral-800 py-1 text-center text-xs flex justify-center items-center gap-2 ${lastUpdated && lastUpdated.error ? 'text-red-500' : 'text-neutral-600'}`}>{lastUpdated && lastUpdated.error ? <><WifiOff className="w-3 h-3" /> Connection Lost ({lastUpdated.msg || 'Unknown'}). Retrying...</> : <>Live System Active • Last Checked: {lastUpdated ? formatTime(lastUpdated.time, true) : 'Syncing...'}</>}</div>
    </div>
  );
};

// ... (Keep SuccessView and App Main same as fixed version) ...
const SuccessView = ({ setView }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle className="w-10 h-10 text-white" /></div>
    <h2 className="text-4xl font-bold text-white mb-4">Order Received!</h2>
    <p className="text-neutral-400 max-w-md mb-8">We are preparing your campfire treats. Please have <strong>CASH</strong> ready upon pickup/delivery.</p>
    <div className="flex gap-4">
      <button onClick={() => setView('queue')} className="bg-neutral-800 text-white px-6 py-3 rounded-xl font-bold">Check Status</button>
      <button onClick={() => setView('home')} className="text-orange-500 font-bold px-6 py-3">Return Home</button>
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState(() => localStorage.getItem('aaasmores_view') || 'home'); 
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('aaasmores_cart') || '[]'));
  
  const [menuItems, setMenuItems] = useState([]);
  const [queue, setQueue] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [notification, setNotification] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  
  const [staffAuth, setStaffAuth] = useState(() => localStorage.getItem('aaasmores_auth') === 'true');
  const [customizingItem, setCustomizingItem] = useState(null);

  useEffect(() => { localStorage.setItem('aaasmores_view', view); }, [view]);
  useEffect(() => { localStorage.setItem('aaasmores_cart', JSON.stringify(cart)); }, [cart]);

  const fetchMenu = useCallback(async () => { if (!USE_LIVE_API) return; try { const res = await fetch(`${API_URL}/menu?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-store' } }); const data = await res.json(); setMenuItems(data.map(i => ({...i, price: parseFloat(i.price)}))); } catch (e) { showNotification("Error loading menu", "error"); } }, []);
  const fetchIngredients = useCallback(async () => { try { const res = await fetch(`${API_URL}/ingredients?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-store' } }); setAllIngredients(await res.json()); } catch (e) { console.error(e); } }, []);
  const fetchConfig = useCallback(async () => { try { const res = await fetch(`${API_URL}/config?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-store' } }); const data = await res.json(); setDeliveryEnabled(data.deliveries_enabled); } catch (e) { console.error(e); } }, []);

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

  useEffect(() => {
    if (view === 'menu') { fetchMenu(); fetchIngredients(); }
    if (view === 'queue' || view === 'cart') { fetchQueue(); fetchConfig(); }
  }, [view, staffAuth, fetchMenu, fetchIngredients, fetchQueue, fetchConfig]);

  useInterval(() => {
      if (view === 'queue') fetchQueue();
      if (view === 'menu') { fetchMenu(); fetchIngredients(); }
      if (view === 'cart') fetchConfig(); 
  }, 5000);

  const submitOrder = async (name, notes, tip, discount, deliveryType, deliveryLocation) => {
    const subtotal = cart.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
    let discountAmount = 0;
    if(discount) { if(discount.type === 'percent') discountAmount = subtotal * (discount.value / 100); else discountAmount = parseFloat(discount.value); }
    
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, items: cart, total: Math.max(0, subtotal - discountAmount + tip), notes, tip, discountCodeId: discount ? discount.id : null, discountAmount, deliveryType, deliveryLocation })
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
        {view === 'home' && <Hero setView={setView} />}
        {view === 'menu' && <MenuGrid menuItems={menuItems} openCustomizer={setCustomizingItem} />}
        {view === 'queue' && <QueueBoard queue={queue} lastUpdated={lastUpdated} />}
        {view === 'reviews' && <ReviewsView API_URL={API_URL} showNotification={showNotification} />}
        {view === 'cart' && <CartView cart={cart} updateCartQty={updateCartQty} submitOrder={submitOrder} view={view} setView={setView} API_URL={API_URL} deliveryEnabled={deliveryEnabled} />}
        {view === 'success' && <SuccessView setView={setView} />}
        {(view === 'admin-login' || view === 'admin') && 
          <AdminDashboard setView={setView} staffAuth={staffAuth} setStaffAuth={setStaffAuth} API_URL={API_URL} showNotification={showNotification} />
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