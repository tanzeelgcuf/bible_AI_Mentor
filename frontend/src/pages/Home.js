// frontend/src/pages/Home.js
import {
  ArrowRight,
  BookOpen,
  Heart,
  MessageCircle,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Bienvenido a<br />
            Un Millón de Predicadores
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-gray-200 leading-relaxed">
            Plataforma educativa con inteligencia artificial para entrenar
            predicadores hispanos con herramientas avanzadas, talleres
            interactivos y asistentes virtuales especializados.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              to="/register"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-2"
            >
              Comenzar Ahora <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/10 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Características Principales
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* AI Assistants */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                3 Asistentes IA
              </h3>
              <p className="text-gray-200">
                Mentor Bíblico, Entrenador de Sermones y Guía de Exégesis
                especializados
              </p>
            </div>

            {/* Workshops */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">21 Talleres</h3>
              <p className="text-gray-200">
                Módulos interactivos de capacitación pastoral y homilética
              </p>
            </div>

            {/* Community */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Comunidad</h3>
              <p className="text-gray-200">
                Conecta con otros predicadores y comparte experiencias
              </p>
            </div>

            {/* Donations */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/30 transition-all duration-300 transform hover:scale-105">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Donaciones</h3>
              <p className="text-gray-200">
                Apoya nuestra misión de entrenar un millón de predicadores
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistants Preview */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center text-white mb-16">
          Nuestros Asistentes de IA
        </h2>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Bible Mentor */}
          <div className="bg-gradient-to-br from-blue-600/30 to-blue-800/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30">
            <div className="bg-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              Mentor Bíblico
            </h3>
            <p className="text-gray-200 text-center mb-6">
              Orientación bíblica profunda, interpretación culturalmente
              relevante y consejos pastorales sabios basados en las Escrituras.
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• Búsqueda de pasajes bíblicos</li>
              <li>• Análisis de contexto</li>
              <li>• Insights teológicos</li>
              <li>• Aplicación cultural hispana</li>
            </ul>
          </div>

          {/* Sermon Coach */}
          <div className="bg-gradient-to-br from-green-600/30 to-green-800/30 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30">
            <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              Entrenador de Sermones
            </h3>
            <p className="text-gray-200 text-center mb-6">
              Mejora la estructura de tus sermones, técnicas de comunicación y
              engagement con tu audiencia hispana.
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• Creación de esquemas</li>
              <li>• Técnicas de oratoria</li>
              <li>• Engagement de audiencia</li>
              <li>• Adaptación cultural</li>
            </ul>
          </div>

          {/* Exegesis Guide */}
          <div className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <div className="bg-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              Guía de Exégesis
            </h3>
            <p className="text-gray-200 text-center mb-6">
              Análisis profundo de textos bíblicos con contexto histórico,
              idiomas originales y aplicaciones prácticas.
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• Análisis de idiomas originales</li>
              <li>• Contexto histórico</li>
              <li>• Comentarios académicos</li>
              <li>• Aplicación práctica</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            ¿Listo para transformar tu ministerio?
          </h2>
          <p className="text-xl text-orange-100 mb-12 max-w-2xl mx-auto">
            Únete a miles de predicadores que ya están utilizando nuestra
            plataforma para mejorar sus sermones y ministerios.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/register"
              className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Registrarse Gratis
            </Link>

            <Link
              to="/donations"
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
            >
              Apoyar la Misión
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">1M+</div>
              <div className="text-gray-300">Meta de Predicadores</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">21</div>
              <div className="text-gray-300">Talleres Disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">3</div>
              <div className="text-gray-300">Asistentes de IA</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                24/7
              </div>
              <div className="text-gray-300">Disponibilidad</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
