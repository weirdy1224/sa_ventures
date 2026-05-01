import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', city: '', state: '', pincode: '' });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(def._id);
    }
  }, []);

  // ─── DUMMY PAYMENT ────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!selectedAddress && !addresses.length) { toast.error('Please add a delivery address'); return; }
    setProcessing(true);
    try {
      await api.post('/orders/dummy', {
        addressId: selectedAddress,
        couponCode: appliedCoupon?.code || undefined,
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/account');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    }
    setProcessing(false);
  };
  // ─────────────────────────────────────────────────────────────────────────────

  /*
  // ─── RAZORPAY (commented out for testing) ────────────────────────────────────
  const handlePaymentRazorpay = async () => {
    if (!selectedAddress && !addresses.length) { toast.error('Please add a delivery address'); return; }
    setProcessing(true);
    try {
      const res = await api.post('/orders', { addressId: selectedAddress, couponCode: appliedCoupon?.code || undefined });
      const { razorpayOrderId, amount, currency, key } = res.data;
      const options = {
        key, amount, currency,
        name: 'HOOOMANS – S&A Ventures',
        description: 'Pet Products Order',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/razorpay/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            toast.success('Payment successful! 🎉');
            navigate('/account');
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone || '' },
        theme: { color: '#F2A51A' },
        modal: { ondismiss: () => setProcessing(false) },
      };
      if (window.Razorpay) { const rzp = new window.Razorpay(options); rzp.open(); }
      else { toast.error('Razorpay SDK not loaded.'); setProcessing(false); }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create order'); setProcessing(false); }
  };
  // ─────────────────────────────────────────────────────────────────────────────
  */

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const res = await api.get(`/coupons/validate?code=${couponCode}`);
      setAppliedCoupon({ code: res.data.code, discountPercentage: res.data.discountPercentage });
      toast.success(`Coupon applied! ${res.data.discountPercentage}% off`);
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid coupon');
      setAppliedCoupon(null);
    }
  };

  const delivery = cartTotal >= 499 ? 0 : 60;
  const discountAmount = appliedCoupon ? Math.round(cartTotal * (appliedCoupon.discountPercentage / 100)) : 0;
  const total = Math.max(cartTotal - discountAmount + delivery, 0);

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 28 }}>Checkout</h1>

      <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
        {/* Left */}
        <div>
          {/* Address */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>📍 Delivery Address</h2>
            {addresses.map(addr => (
              <label key={addr._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, border: `2px solid ${selectedAddress === addr._id ? 'var(--gold)' : 'var(--grey-200)'}`, borderRadius: 10, marginBottom: 12, cursor: 'pointer', background: selectedAddress === addr._id ? 'rgba(242,165,26,0.04)' : 'var(--white)' }}>
                <input type="radio" name="address" value={addr._id} checked={selectedAddress === addr._id} onChange={() => setSelectedAddress(addr._id)} style={{ marginTop: 2, accentColor: 'var(--gold)' }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{addr.label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />{addr.city}, {addr.state} – {addr.pincode}</div>
                </div>
              </label>
            ))}
            <button onClick={() => setShowAddressForm(!showAddressForm)} style={{ background: 'none', border: '1.5px dashed var(--grey-300)', borderRadius: 10, padding: '12px 20px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, width: '100%', fontWeight: 600 }}>
              {showAddressForm ? '✕ Cancel' : '+ Add New Address'}
            </button>
            {showAddressForm && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['line1', 'city', 'state', 'pincode'].map(field => (
                  <input key={field} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={newAddress[field]} onChange={e => setNewAddress(a => ({ ...a, [field]: e.target.value }))} className="form-input" />
                ))}
                <button onClick={async () => {
                  try {
                    const res = await api.patch('/auth/me', { addresses: [...addresses, newAddress] });
                    const updatedAddresses = res.data.user.addresses;
                    setAddresses(updatedAddresses);
                    setSelectedAddress(updatedAddresses.at(-1)?._id);
                    setShowAddressForm(false);
                    toast.success('Address added');
                  } catch { toast.error('Failed to add address'); }
                }} className="btn btn-secondary">Save Address</button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>💳 Payment Method</h2>
            <div style={{ padding: 16, border: '2px solid var(--gold)', borderRadius: 10, background: 'rgba(242,165,26,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                <span style={{ fontSize: 24 }}>🧪</span> Test Mode (Dummy Payment)
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>Orders will be placed directly without a payment gateway for testing purposes.</p>
            </div>
          </div>
        </div>

        {/* Right – Summary */}
        <div className="checkout-summary">
          <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
              {cart.items?.map((item, i) => {
                const p = item.productId;
                const price = p?.salePrice || p?.price || 0;
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img src={p?.images?.[0] || 'https://placehold.co/48x48'} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p?.name}</p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12 }}>x{item.quantity}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid var(--grey-100)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Coupon */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input type="text" placeholder="Coupon code" className="form-input" style={{ flex: 1, padding: '8px 12px', fontSize: 13, minWidth: 0 }} value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} disabled={!!appliedCoupon} />
                {!appliedCoupon ? (
                  <button onClick={handleApplyCoupon} className="btn btn-secondary btn-sm" disabled={!couponCode.trim()}>Apply</button>
                ) : (
                  <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); }} className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-red)' }}>Remove</button>
                )}
              </div>
              {couponError && <div style={{ color: 'var(--accent-red)', fontSize: 12, marginTop: -6 }}>{couponError}</div>}
              {appliedCoupon && <div style={{ color: 'var(--accent-green)', fontSize: 12, marginTop: -6 }}>'{appliedCoupon.code}' applied ({appliedCoupon.discountPercentage}% off)</div>}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'var(--accent-green)' }}>Discount ({appliedCoupon.discountPercentage}%)</span><span style={{ color: 'var(--accent-green)' }}>-{formatPrice(discountAmount)}</span></div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'var(--text-secondary)' }}>Delivery</span><span style={{ color: delivery === 0 ? 'var(--accent-green)' : '' }}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--grey-100)', fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ fontSize: 20, color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>{formatPrice(total)}</span>
              </div>
            </div>

            <button onClick={handlePayment} disabled={processing} className="btn btn-primary btn-lg w-full btn-round" style={{ marginTop: 20 }}>
              {processing ? '⌛ Placing Order...' : `Place Order — ${formatPrice(total)}`}
            </button>
            <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>🧪 Test mode — no real payment</p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-layout { grid-template-columns: 1fr !important; }
          .checkout-summary { order: -1; }
        }
      `}</style>
    </div>
  );
}
