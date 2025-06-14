// frontend/src/pages/Donations.js
import {
  CheckCircle,
  CreditCard,
  DollarSign,
  Heart,
  Target,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const Donations = () => {
  const [donationAmount, setDonationAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donorInfo, setDonorInfo] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const predefinedAmounts = [25, 50, 100, 250, 500];

  const handleAmountSelect = (amount) => {
    setDonationAmount(amount.toString());
    setCustomAmount("");
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setDonationAmount(value);
  };

  const handleDonorInfoChange = (e) => {
    setDonorInfo({
      ...donorInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Here you would integrate with PayPal, Stripe, or your payment processor
      // For now, we'll simulate the donation process

      if (!donationAmount || parseFloat(donationAmount) <= 0) {
        toast.error("Por favor selecciona una cantidad válida");
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("¡Gracias por tu donación! Procesando pago...");

      // Reset form
      setDonationAmount("");
      setCustomAmount("");
      setDonorInfo({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      toast.error("Error al procesar la donación");
    } finally {
      setLoading(false);
    }
  };

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

            <form onSubmit={handleSubmit}>
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
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-gray-300"
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
                  name="name"
                  placeholder="Nombre completo"
                  value={donorInfo.name}
                  onChange={handleDonorInfoChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={donorInfo.email}
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

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Métodos de Pago
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-blue-600 mr-2">PayPal</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !donationAmount}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Donar ${donationAmount || "0"}
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
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
                    <Users className="w-6 h-6 text-blue-600" />
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
                    <Target className="w-6 h-6 text-green-600" />
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
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                      style={{ width: "1.58%" }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">127</div>
                    <div className="text-sm text-gray-600">
                      Países Alcanzados
                    </div>
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
                  "Esta plataforma transformó mi ministerio. Los talleres y
                  asistentes de IA me ayudaron a mejorar mis sermones y alcanzar
                  más vidas para Cristo."
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
                <p>✓ Organización sin fines de lucro 501(c)(3)</p>
                <p>✓ Donaciones deducibles de impuestos en EE.UU.</p>
                <p>✓ Recibo fiscal enviado por correo electrónico</p>
                <p>✓ 100% de tu donación va al ministerio</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
