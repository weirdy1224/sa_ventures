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
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', city: '', state: '', pincode: '' });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(def._id);
    }
  }, []);

  const handlePayment = async () => {
    if (!selectedAddress && !addresses.length) { toast.error('Please add a delivery address'); return; }
    setProcessing(true);

    try {
      const res = await api.post('/orders', { addressId: selectedAddress });
      const { razorpayOrderId, amount, currency, key } = res.data;

      const options = {
        key,
        amount,
        currency,
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

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Razorpay SDK not loaded. Please check your connection.');
        setProcessing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
      setProcessing(false);
    }
  };

  const delivery = cartTotal >= 499 ? 0 : 60;
  const total = cartTotal + delivery;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40 }}>
        {/* Left */}
        <div>
          {/* Step 1: Address */}
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
                  } catch (err) { toast.error('Failed to add address'); }
                }} className="btn btn-secondary">Save Address</button>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700 }}>💳 Payment Method</h2>
            <div style={{ padding: 16, border: '2px solid var(--gold)', borderRadius: 10, background: 'rgba(242,165,26,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                <span style={{ fontSize: 24 }}>💳</span> Razorpay (Cards, UPI, Net Banking, Wallets)
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>You'll be redirected to Razorpay's secure payment gateway.</p>
            </div>
          </div>
        </div>

        {/* Right – Summary */}
        <div>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
              {cart.items?.map((item, i) => {
                const p = item.productId;
                const price = p?.salePrice || p?.price || 0;
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img src={p?.images?.[0] || 'https://via.placeholder.com/48'} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p?.name}</p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12 }}>x{item.quantity}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: '1px solid var(--grey-100)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span style={{ color: 'var(--text-secondary)' }}>Delivery</span><span style={{ color: delivery === 0 ? 'var(--accent-green)' : '' }}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--grey-100)', fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ fontSize: 20, color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>{formatPrice(total)}</span>
              </div>
            </div>
            <button onClick={handlePayment} disabled={processing} className="btn btn-primary btn-lg w-full btn-round" style={{ marginTop: 20 }}>
              {processing ? '⌛ Processing...' : `Pay ${formatPrice(total)} →`}
            </button>
            <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>🔒 Secured by Razorpay</p>
          </div>
        </div>
      </div>

      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '1fr 360px'"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
