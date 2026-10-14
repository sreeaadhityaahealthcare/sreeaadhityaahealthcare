import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, Clock, Copy, PackageCheck, PackageSearch, Search, Truck, XCircle } from 'lucide-react';
import { CallButton, WhatsAppButton } from '../components/common/ContactActions';
import Button from '../components/ui/Button';
import { TextField } from '../components/ui/FormField';
import { PageHero } from '../components/ui/Section';
import Seo from '../components/ui/Seo';
import { EmptyState } from '../components/ui/States';
import { getOrderTracking } from '../services/orderService';
import { formatCurrency, formatTimestamp } from '../utils/format';
import { getErrorMessage, logError } from '../utils/errors';
import { getSavedOrders } from '../utils/storage';

const STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Received & awaiting review' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Verified & stock reserved' },
  { key: 'processing', label: 'Preparing', desc: 'Packing your products' },
  { key: 'shipped', label: 'Shipped', desc: 'On its way to you' },
  { key: 'delivered', label: 'Delivered', desc: 'Delivered successfully' },
];

const STATUS_BADGES = {
  pending: { label: 'Order Placed', bg: 'bg-gold-50 text-gold-700 border-gold-200' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'Being Prepared', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  shipped: { label: 'Shipped & In Transit', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  delivered: { label: 'Delivered', bg: 'bg-ayur-50 text-ayur-800 border-ayur-200' },
  cancelled: { label: 'Cancelled', bg: 'bg-danger-50 text-danger-700 border-danger-200' },
};

const PAYMENT_BADGES = {
  pending: { label: 'Payment Pending', bg: 'bg-gold-50 text-gold-700 border-gold-200' },
  paid: { label: 'Payment Received', bg: 'bg-ayur-50 text-ayur-800 border-ayur-200' },
  failed: { label: 'Payment Failed', bg: 'bg-danger-50 text-danger-700 border-danger-200' },
  refunded: { label: 'Refunded', bg: 'bg-ink-100 text-ink-700 border-ink-200' },
};

export default function OrderStatusPage() {
  const [params, setParams] = useSearchParams();
  const urlId = params.get('id') || params.get('code') || '';
  const [code, setCode] = useState(urlId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saved] = useState(getSavedOrders);

  const lookup = async (value) => {
    const raw = String(value || '').trim().toUpperCase();
    if (!raw) {
      setError('Please enter your order ID.');
      return;
    }
    if (!/^AAH-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(raw)) {
      setError('Enter your order ID in the format AAH-XXXX-XXXX-XXXX.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const tracking = await getOrderTracking(raw);
      if (tracking) {
        setResult(tracking);
        setParams({ id: raw }, { replace: true });
      } else {
        setResult(null);
        setError('No order was found with this ID. Please double-check your code.');
      }
    } catch (err) {
      logError('order-lookup', err);
      setError(getErrorMessage(err, 'Could not retrieve order details. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  // Automatically lookup if ID was supplied in the URL
  useEffect(() => {
    if (urlId) {
      setCode(urlId);
      lookup(urlId);
    }
  }, [urlId]);

  const handleCopy = async (idToCopy) => {
    try {
      await navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const isCancelled = result?.orderStatus === 'cancelled';
  const currentStepIdx = isCancelled ? -1 : STEPS.findIndex((s) => s.key === result?.orderStatus);

  return (
    <>
      <Seo
        title="Check Order Status"
        description="Check your Siddha store order status and delivery updates."
        path="/order-status"
        noindex
      />

      <PageHero
        tone="ayurveda"
        eyebrow="Orders & Delivery"
        title="Check Order Status"
        description="Enter your Order ID below to track real-time confirmation, packing, and delivery updates."
      />

      <div className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Lookup Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              lookup(code);
            }}
            noValidate
            className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8 shadow-sm"
          >
            <h2 className="font-sans text-lg font-semibold text-ink-900 mb-1">
              Track Your Order
            </h2>
            <p className="text-sm text-ink-600 mb-5">
              Paste or type the Order ID provided after placing your order.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <TextField
                  label="Order ID"
                  tone="ayurveda"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. AAH-XXXX-XXXX-XXXX"
                  autoCapitalize="characters"
                  spellCheck={false}
                  error={error}
                />
              </div>
              <div className="sm:self-end">
                <Button
                  type="submit"
                  tone="ayurveda"
                  size="md"
                  loading={busy}
                  className="w-full sm:w-auto h-11"
                >
                  <Search className="size-4" aria-hidden="true" />
                  Track Order
                </Button>
              </div>
            </div>
          </form>

          {/* Active Order Tracking Result Card */}
          {result && (
            <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-md animate-in fade-in duration-300">
              {/* Header Banner */}
              <div className="border-b border-ink-100 bg-ink-50/70 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                      Order ID
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(result.orderNumber)}
                      className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs font-medium text-ink-600 hover:text-ink-900 border border-ink-200 shadow-2xs"
                      title="Copy order ID"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3 text-ayur-600" />
                          <span className="text-ayur-700 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3 text-ink-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 font-mono text-xl sm:text-2xl font-bold tracking-tight text-ink-950">
                    {result.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    Placed on {formatTimestamp(result.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-right sm:items-end">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                      STATUS_BADGES[result.orderStatus]?.bg || 'bg-ink-100 text-ink-800'
                    }`}
                  >
                    {result.orderStatus === 'delivered' ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : result.orderStatus === 'cancelled' ? (
                      <XCircle className="size-3.5" />
                    ) : (
                      <Clock className="size-3.5" />
                    )}
                    {STATUS_BADGES[result.orderStatus]?.label || result.orderStatus}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                      PAYMENT_BADGES[result.paymentStatus]?.bg || 'bg-ink-100 text-ink-700'
                    }`}
                  >
                    {PAYMENT_BADGES[result.paymentStatus]?.label || result.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="p-6 sm:p-8">
                {isCancelled ? (
                  <div className="flex items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-800">
                    <XCircle className="size-5 shrink-0 text-danger-600" />
                    <div>
                      <p className="font-semibold">This order was cancelled.</p>
                      <p className="text-xs text-danger-700 mt-0.5">
                        If you have questions regarding payment or cancellation, please reach out to our staff.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <h3 className="sr-only">Order fulfillment progress</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
                      {STEPS.map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        return (
                          <div
                            key={step.key}
                            className={`relative flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2 p-2 rounded-xl transition-all ${
                              isCurrent
                                ? 'bg-ayur-50/70 border border-ayur-200'
                                : ''
                            }`}
                          >
                            <span
                              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm ${
                                isDone
                                  ? 'bg-ayur-700 text-white'
                                  : 'bg-ink-100 text-ink-400'
                              }`}
                            >
                              {isDone ? (
                                <Check className="size-4" strokeWidth={2.5} />
                              ) : (
                                idx + 1
                              )}
                            </span>

                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  isDone ? 'text-ink-950' : 'text-ink-400'
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-[11px] text-ink-500 hidden sm:block">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shipping Dispatch Info if Available */}
                {result.shipping?.carrier && (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-purple-200 bg-purple-50/50 p-4 text-sm">
                    <Truck className="size-5 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-purple-950">
                        Dispatched via {result.shipping.carrier}
                      </p>
                      {result.shipping.trackingNumber && (
                        <p className="text-xs text-purple-800 mt-1 font-mono">
                          Tracking No: <span className="font-bold">{result.shipping.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Items Summary */}
                {result.items?.length > 0 && (
                  <div className="mt-8 border-t border-ink-100 pt-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-3">
                      Ordered Items ({result.itemCount} item{result.itemCount === 1 ? '' : 's'})
                    </h4>
                    <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100 overflow-hidden text-sm">
                      {result.items.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between p-3.5 hover:bg-ink-50/50">
                          <span className="font-medium text-ink-900">{item.name}</span>
                          <span className="text-ink-500 tabular-nums">Qty: {item.quantity}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex justify-between items-center px-1">
                      <span className="text-sm font-medium text-ink-600">Total Order Amount</span>
                      <span className="font-sans text-lg font-bold text-ink-950 tabular-nums">
                        {formatCurrency(result.total)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Need Help Bar */}
                <div className="mt-8 rounded-xl border border-ink-100 bg-sand-50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Need help with this order?</p>
                    <p className="text-xs text-ink-600">
                      Our Siddha hospital team is available to assist you.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CallButton practice="ayurveda" size="sm" />
                    <WhatsAppButton
                      practice="ayurveda"
                      size="sm"
                      message={`Hello, I would like to check on my order ${result.orderNumber}.`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recently Placed Orders on This Device */}
          <section aria-labelledby="saved-orders-heading">
            <h2 id="saved-orders-heading" className="mb-3 font-sans text-lg font-semibold text-ink-900">
              Orders Placed on This Device
            </h2>
            <p className="text-xs text-ink-500 mb-4">
              Click any order below to view its live status without re-typing.
            </p>

            {saved.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="No orders placed on this device yet"
                message="When you place orders on this browser, they will automatically appear here."
                action={
                  <Button to="/shop" tone="ayurveda">
                    Browse the Shop
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white shadow-xs">
                {saved.map((o) => (
                  <li
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 hover:bg-ink-50/60 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-bold text-ink-900">{o.id}</p>
                        <button
                          type="button"
                          onClick={() => handleCopy(o.id)}
                          className="text-xs text-ink-400 hover:text-ink-700"
                          title="Copy ID"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-ink-500">
                        {o.itemCount} item{o.itemCount === 1 ? '' : 's'} · {formatCurrency(o.total)} · Placed {formatTimestamp(o.createdAt)}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      tone="ayurveda"
                      onClick={() => {
                        setCode(o.id);
                        lookup(o.id);
                      }}
                    >
                      <span>Check Status</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
