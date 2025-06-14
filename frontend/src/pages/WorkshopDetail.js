import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { workshopService } from "../services/workshopService";

const WorkshopDetail = () => {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadWorkshop();
    checkCompletion();
  }, [id]);

  const loadWorkshop = async () => {
    try {
      const data = await workshopService.getWorkshop(id);
      setWorkshop(data);
    } catch (error) {
      console.error("Error loading workshop:", error);
      toast.error("Error al cargar el taller");
    } finally {
      setLoading(false);
    }
  };

  const checkCompletion = () => {
    const completedWorkshops = JSON.parse(
      localStorage.getItem("completedWorkshops") || "[]"
    );
    setCompleted(completedWorkshops.includes(id));
  };

  const markAsCompleted = () => {
    const completedWorkshops = JSON.parse(
      localStorage.getItem("completedWorkshops") || "[]"
    );
    if (!completedWorkshops.includes(id)) {
      completedWorkshops.push(id);
      localStorage.setItem(
        "completedWorkshops",
        JSON.stringify(completedWorkshops)
      );
      setCompleted(true);
      toast.success("¡Taller marcado como completado!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Taller no encontrado
          </h2>
          <Link to="/workshops" className="text-blue-600 hover:underline">
            ← Volver a talleres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/workshops"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a talleres
          </Link>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div
              className={`p-8 ${
                completed
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-blue-500 to-purple-500"
              } text-white`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium opacity-90">
                  Taller #{workshop.order}
                </span>
                {completed && <CheckCircle className="w-8 h-8" />}
              </div>
              <h1 className="text-3xl font-bold mb-4">{workshop.title}</h1>
              <p className="text-lg opacity-90 mb-6">{workshop.description}</p>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {workshop.duration_minutes} minutos
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {workshop.resources?.length || 0} recursos
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contenido del Taller
              </h2>

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {workshop.content}
                </div>
              </div>
            </div>

            {/* Resources */}
            {workshop.resources && workshop.resources.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recursos Incluidos
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {workshop.resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 border border-gray-200 rounded-lg"
                    >
                      <Download className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">{resource}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Tu Progreso
              </h3>

              {completed ? (
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-green-700 font-semibold mb-4">
                    ¡Taller Completado!
                  </p>
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Descargar Certificado
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Play className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Completa este taller para avanzar
                  </p>
                  <button
                    onClick={markAsCompleted}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Marcar como Completado
                  </button>
                </div>
              )}
            </div>

            {/* AI Assistant Suggestion */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-3">¿Necesitas Ayuda?</h3>
              <p className="text-sm opacity-90 mb-4">
                Nuestros asistentes de IA pueden ayudarte a profundizar en este
                tema
              </p>
              <Link
                to="/ai-assistants"
                className="block w-full bg-white text-purple-600 text-center py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Hablar con IA
              </Link>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Navegación
              </h3>
              <div className="space-y-3">
                {workshop.order > 1 && (
                  <Link
                    to={`/workshops/${workshop.order - 1}`}
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ← Taller Anterior
                  </Link>
                )}
                {workshop.order < 21 && (
                  <Link
                    to={`/workshops/${workshop.order + 1}`}
                    className="block text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Siguiente Taller →
                  </Link>
                )}
                <Link
                  to="/workshops"
                  className="block text-gray-600 hover:text-gray-700 text-sm"
                >
                  Ver Todos los Talleres
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;
