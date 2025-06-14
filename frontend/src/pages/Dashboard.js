import {
  BookOpen,
  Clock,
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            ¡Bienvenido, {user?.full_name}!
          </h1>
          <p className="text-lg opacity-90">
            Continúa tu formación ministerial con nuestros recursos y asistentes ministeriales.
            
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/ai-assistants"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Asistentes Ministeriales
              </h3>
            </div>
            <p className="text-gray-600">
              Chatea con nuestros asistentes especializados en predicación
            </p>
          </Link>

          <Link
            to="/workshops"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Talleres</h3>
            </div>
            <p className="text-gray-600">
              Accede a los 21 módulos de capacitación ministerial
            </p>
          </Link>

          <Link
            to="/donations"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Donaciones
              </h3>
            </div>
            <p className="text-gray-600">
              Apoya nuestra misión de entrenar predicadores
            </p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">67%</div>
            <div className="text-sm text-gray-600">Progreso Total</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">14/21</div>
            <div className="text-sm text-gray-600">Talleres Completados</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">12h</div>
            <div className="text-sm text-gray-600">Tiempo de Estudio</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">142</div>
            <div className="text-sm text-gray-600">Conversaciones IA</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Conversación con Mentor Bíblico
                </div>
                <div className="text-sm text-gray-600">Hace 2 horas</div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Completaste: "Liderazgo Pastoral"
                </div>
                <div className="text-sm text-gray-600">Ayer</div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mr-4">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Nueva sesión con Guía de Exégesis
                </div>
                <div className="text-sm text-gray-600">Hace 3 días</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
