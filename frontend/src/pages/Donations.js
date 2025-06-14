// frontend/src/pages/Donations.js
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Check, CreditCard, DollarSign, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Payment Service
const paymentService = {
  async createStripeIntent(amount, donorInfo) {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:8000/api/payments/stripe/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'USD',
        ...donorInfo
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error creating payment');
    }

    return response.json();
  },

  async confirmStripePayment(paymentIntentId) {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:8000/api/payments/stripe/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        payment_id: paymentIntentId,
        payment_method: 'stripe',
        status: 'completed'
      }),
    });

    return response.json();
  },

  async createPayPalOrder(amount, donorInfo) {
    const token = localStorage.getItem('access_token');
    const response = await fetch('http://localhost:8000/api/payments/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'USD',
        ...donorInfo
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error creating PayPal order');
    }

    return response.json();
  }
};

// Stripe Payment Form Component
function StripePaymentForm({ amount, donorInfo, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    try {
      // Create payment intent
      const { client_secret, payment_intent_id } = await paymentService.createStripeIntent(amount, donorInfo);

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: donorInfo.donor_name,
            email: donorInfo.donor_email,
          },
        }
      });

      if (error) {
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        await paymentService.confirmStripePayment(payment_intent_id);
        onSuccess('¡Donación procesada exitosamente con Stripe!');
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${
          processing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {processing ? 'Procesando...' : `Donar $${amount} con Stripe`}
      </button>
    </form>
  );
}

// Main Donations Component
function Donations() {
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    donor_name: '',
    donor_email: '',
    message: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);

  const predefinedAmounts = [25, 50, 100, 250, 500];

  const handleAmountSelect = (amount) => {
    setDonationAmount(amount.toString());
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setDonationAmount(value);
  };

  const handleDonorInfoChange = (e) => {
    setDonorInfo({
      ...donorInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSuccess = (message) => {
    toast.success(message);
    setDonationAmount('');
    setCustomAmount('');
    setDonorInfo({
      donor_name: '',
      donor_email: '',
      message: ''
    });
  };

  const handlePaymentError = (error) => {
    toast.error(error || 'Error procesando el pago');
  };

  // PayPal payment handlers
  const createPayPalOrder = async () => {
    try {
      const result = await paymentService.createPayPalOrder(parseFloat(donationAmount), donorInfo);
      return result.order_id;
    } catch (error) {
      handlePaymentError(error.message);
      return null;
    }
  };

  const onPayPalApprove = async (data) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/payments/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          payment_id: data.orderID,
          payment_method: 'paypal',
          status: 'completed'
        }),
      });

      const result = await response.json();
      if (result.success) {
        handlePaymentSuccess('¡Donación procesada exitosamente con PayPal!');
      } else {
        handlePaymentError('Error procesando el pago con PayPal');
      }
    } catch (error) {
      handlePaymentError(error.message);
    }
  };

  const currentAmount = parseFloat(donationAmount) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Apoya Nuestra Misión
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 opacity-90">
            Ayúdanos a entrenar a un millón de predicadores hispanos para 
            transformar comunidades con el poder del Evangelio
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Hacer una Donación
            </h2>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecciona una cantidad (USD)
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleAmountSelect(amount)}
                    className={`p-3 border-2 rounded-lg text-center font-semibold transition-all ${
                      donationAmount === amount.toString()
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              
              {/* Custom Amount */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Cantidad personalizada"
                  value={customAmount}
                  onChange={handleCustomAmount}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            {/* Donor Information */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Información del Donante (Opcional)
              </h3>
              
              <input
                type="text"
                name="donor_name"
                placeholder="Nombre completo"
                value={donorInfo.donor_name}
                onChange={handleDonorInfoChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              
              <input
                type="email"
                name="donor_email"
                placeholder="Correo electrónico"
                value={donorInfo.donor_email}
                onChange={handleDonorInfoChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              
              <textarea
                name="message"
                placeholder="Mensaje opcional"
                rows="3"
                value={donorInfo.message}
                onChange={handleDonorInfoChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
              />
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Método de Pago
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex items-center justify-center p-3 border-2 rounded-lg transition-colors ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Tarjeta (Stripe)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex items-center justify-center p-3 border-2 rounded-lg transition-colors ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="font-bold text-blue-600 mr-2">PayPal</span>
                </button>
              </div>
            </div>

            {/* Payment Forms */}
            {currentAmount > 0 && (
              <div className="border-t pt-6">
                {paymentMethod === 'stripe' ? (
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      amount={currentAmount}
                      donorInfo={donorInfo}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                ) : (
                  <PayPalScriptProvider options={{
                    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
                    currency: "USD",
                    intent: "capture"
                  }}>
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        color: "blue",
                        shape: "rect",
                        label: "paypal"
                      }}
                      createOrder={createPayPalOrder}
                      onApprove={onPayPalApprove}
                      onError={(err) => handlePaymentError('Error con PayPal: ' + err.message)}
                      onCancel={() => toast.info('Pago cancelado')}
                    />
                  </PayPalScriptProvider>
                )}
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                <span>Donación segura con encriptación SSL</span>
              </div>
            </div>
          </div>

          {/* Impact Information */}
          <div className="space-y-8">
            {/* Mission Impact */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Tu Impacto
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">$25</h4>
                    <p className="text-gray-600 text-sm">
                      Proporciona acceso completo a un predicador por 1 mes
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">$100</h4>
                    <p className="text-gray-600 text-sm">
                      Capacita a un predicador con todos los 21 talleres
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">$500</h4>
                    <p className="text-gray-600 text-sm">
                      Patrocina la capacitación de 20 predicadores nuevos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Nuestro Progreso
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Predicadores Capacitados</span>
                    <span>15,847 / 1,000,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full" style={{width: '1.58%'}}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">127</div>
                    <div className="text-sm text-gray-600">Países Alcanzados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">89%</div>
                    <div className="text-sm text-gray-600">Satisfacción</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
              <div className="text-center">
                <p className="text-lg italic mb-4">
                  "Esta plataforma transformó mi ministerio. Los talleres y asistentes 
                  de IA me ayudaron a mejorar mis sermones y alcanzar más vidas para Cristo."
                </p>
                <div className="font-semibold">- Pastor Miguel Rodríguez</div>
                <div className="text-sm opacity-80">Guatemala</div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información Fiscal
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Organización sin fines de lucro 501(c)(3)
                </p>
                <p className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Donaciones deducibles de impuestos en EE.UU.
                </p>
                <p className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Recibo fiscal enviado por correo electrónico
                </p>
                <p className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  100% de tu donación va al ministerio
                </p>
              </div>
            </div>

            {/* Recent Donations (if user is logged in) */}
            <RecentDonations />
          </div>
        </div>
      </div>
    </div>
  );
}

// Recent Donations Component
function RecentDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/payments/donations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDonations(data.slice(0, 5)); // Show last 5 donations
      }
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!localStorage.getItem('access_token') || donations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tus Donaciones Recientes
      </h3>
      <div className="space-y-3">
        {donations.map((donation) => (
          <div key={donation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">
                ${donation.amount} {donation.currency}
              </div>
              <div className="text-sm text-gray-600">
                {new Date(donation.created_at).toLocaleDateString('es-ES')} • {donation.payment_method}
              </div>
              {donation.message && (
                <div className="text-xs text-gray-500 italic">
                  "{donation.message}"
                </div>
              )}
            </div>
            <div className={`px-2 py-1 text-xs rounded-full ${
              donation.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : donation.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {donation.status === 'completed' ? 'Completada' : 
               donation.status === 'pending' ? 'Pendiente' : 'Fallida'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Donations;