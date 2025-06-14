// frontend/src/pages/Login.js
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";
import FacebookLogin from "../components/auth/FacebookLogin";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast.success("¡Bienvenido de vuelta!");
      } else {
        toast.error(result.error || "Error en el inicio de sesión");
      }
    } catch (error) {
      toast.error("Error en el inicio de sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSuccess = async (userData) => {
    setLoading(true);
    try {
      // Send Facebook data to backend for authentication
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000/api"}/auth/facebook`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            facebook_id: userData.id,
            access_token: userData.accessToken,
            email: userData.email,
            full_name: userData.name,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);

        // Get user data and update auth context
        const userResponse = await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:8000/api"}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Update auth context here if needed
          toast.success("¡Bienvenido! Iniciaste sesión con Facebook");
          window.location.href = "/dashboard"; // Force reload to update auth context
        }
      } else {
        const error = await response.json();
        toast.error(error.detail || "Error al iniciar sesión con Facebook");
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      toast.error("Error al iniciar sesión con Facebook");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookError = (error) => {
    console.error("Facebook login error:", error);
    toast.error("Error al iniciar sesión con Facebook");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">Iniciar Sesión</h2>
          <p className="mt-2 text-sm text-gray-300">
            Accede a tu cuenta de Un Millón de Predicadores
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300/30 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300/30 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-300">
                  O continúa con
                </span>
              </div>
            </div>

            {/* Facebook Login Button */}
            <div className="mt-6">
              <FacebookLogin
                onSuccess={handleFacebookSuccess}
                onError={handleFacebookError}
                buttonText="Continuar con Facebook"
              />
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-300">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-300 hover:text-blue-200 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
