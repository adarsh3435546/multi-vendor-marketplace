export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initiateRazorpayPayment({
  orderData,
  onSuccess,
  onError,
}) {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    if (onError) onError(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
    return;
  }

  const options = {
    key: orderData.keyId || 'rzp_test_placeholder',
    amount: orderData.amount, // in paise
    currency: orderData.currency || 'INR',
    name: orderData.businessName || 'Multi-Vendor Marketplace',
    description: `Payment for ${orderData.serviceName || 'Service Booking'} (Booking #${orderData.bookingId})`,
    order_id: orderData.orderId,
    prefill: {
      name: orderData.customerName || '',
      email: orderData.customerEmail || '',
      contact: orderData.customerPhone || '',
    },
    theme: {
      color: '#4f46e5',
    },
    handler: function (response) {
      if (onSuccess) {
        onSuccess({
          bookingId: orderData.bookingId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      }
    },
    modal: {
      ondismiss: function () {
        if (onError) {
          onError(new Error('Payment checkout was dismissed.'));
        }
      },
    },
  };

  try {
    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
      if (onError) {
        onError(new Error(response.error.description || 'Payment transaction failed.'));
      }
    });
    paymentObject.open();
  } catch (err) {
    if (onError) onError(err);
  }
}
