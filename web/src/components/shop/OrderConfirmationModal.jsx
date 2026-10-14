import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, Copy, Search, ShoppingBag, X } from 'lucide-react';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/format';
import { useSite } from '../../contexts/SiteContext';

export default function OrderConfirmationModal({ order, onClose, onContinueShopping }) {
  const navigate = useNavigate();
  const { settings } = useSite();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
        else navigate(`/order-status?id=${order?.id}`, { replace: true });
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [order, onClose, navigate]);

  if (!order) return null;

  const code = order.orderNumber || order.id || '';
  const paymentMethod =
    settings?.paymentMethods?.find((m) => m.key === order.paymentMethod)?.label ||
    order.paymentMethod ||
    'Cash on delivery';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard access fallback
    }
  };

  const handleCheckStatus = () => {
    if (onClose) onClose();
    navigate(`/order-status?id=${code}`, { replace: true, state: { order } });
  };

  const handleShop = () => {
    if (onContinueShopping) onContinueShopping();
    navigate('/shop');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-confirmed-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/65 backdrop-blur-sm transition-opacity"
        onClick={handleCheckStatus}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-ink-100 bg-white p-6 sm:p-8 shadow-2xl transition-all z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleCheckStatus}
          className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition"
          aria-label="Close confirmation popup"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        {/* Icon & Celebratory Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-ayur-100 text-ayur-700 ring-8 ring-ayur-50">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </div>

          <span className="inline-block rounded-full bg-ayur-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ayur-800">
            Order Confirmed
          </span>

          <h2
            id="order-confirmed-title"
            className="mt-2 font-sans text-2xl sm:text-3xl font-bold tracking-tight text-ink-950"
          >
            Your Order Has Confirmed
          </h2>

          <p className="mt-2 text-sm text-ink-600 leading-relaxed max-w-sm mx-auto">
            Thank you{order.customer?.name ? `, ${order.customer.name}` : ''}! Your order has been placed and registered successfully in our system.
          </p>
        </div>

        {/* Prominent Order ID Box with Copy Action */}
        <div className="mt-6 rounded-2xl border-2 border-ayur-600/30 bg-ayur-50/50 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ayur-900">
                Your Order ID
              </p>
              <p className="font-mono text-lg sm:text-xl font-bold tracking-wider text-ink-950 select-all">
                {code}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs transition ${
                copied
                  ? 'bg-ayur-700 text-white ring-2 ring-ayur-700'
                  : 'bg-white text-ink-800 border border-ink-200 hover:bg-ink-50 hover:text-ink-950'
              }`}
              title="Copy Order ID"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-white" aria-hidden="true" />
                  <span>Order ID Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-4 text-ink-500" aria-hidden="true" />
                  <span>Copy Order ID</span>
                </>
              )}
            </button>
          </div>

          {/* User hint */}
          <div className="mt-3 pt-3 border-t border-ayur-200/60 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-ayur-900/90 font-medium">
            <span className="size-1.5 rounded-full bg-ayur-600 shrink-0" />
            <span>Copy the order ID to check order status anytime.</span>
          </div>
        </div>

        {/* Quick Order Summary */}
        <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50/60 p-3.5 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-ink-500">Total Amount:</span>{' '}
            <strong className="text-ink-900 font-semibold tabular-nums">
              {formatCurrency(order.total)}
            </strong>
          </div>
          <div>
            <span className="text-ink-500">Payment:</span>{' '}
            <strong className="text-ink-900 font-semibold truncate">{paymentMethod}</strong>
          </div>
          {order.deliveryAddress?.city && (
            <div className="col-span-2 text-ink-500 truncate">
              Delivery to: <strong className="text-ink-800">{order.deliveryAddress.city}, {order.deliveryAddress.state}</strong>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="button"
            tone="ayurveda"
            size="lg"
            className="w-full sm:flex-1 shadow-md justify-center"
            onClick={handleCheckStatus}
          >
            <Search className="size-4" aria-hidden="true" />
            <span>Check Order Status</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>

          <Button
            type="button"
            variant="outline"
            tone="ayurveda"
            size="lg"
            className="w-full sm:w-auto justify-center"
            onClick={handleShop}
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            <span>Continue Shopping</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
