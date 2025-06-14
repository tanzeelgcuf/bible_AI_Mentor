// frontend/src/pages/Workshops.js
import { BookOpen, CheckCircle, Clock, Lock, Play, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { workshopService } from "../services/workshopService";

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [completedWorkshops, setCompletedWorkshops] = useState(new Set());

  const categories = {
    all: "Todos los Talleres",
    fundamentals: "Fundamentos",
    preaching: "Predicación",
    leadership: "Liderazgo",
    pastoral: "Cuidado Pastoral",
    evangelism: "Evangelismo",
  };

  useEffect(() => {
    loadWorkshops();
    loadProgress();
  }, []);

  const loadWorkshops = async () => {
    try {
      const data = await workshopService.getWorkshops();
      setWorkshops(data);
    } catch (error) {
      console.error("Error loading workshops:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = () => {
    // Load completed workshops from localStorage
    const completed = JSON.parse(
      localStorage.getItem("completedWorkshops") || "[]"
    );
    setCompletedWorkshops(new Set(completed));
  };

  const markAsCompleted = (workshopId) => {
    const newCompleted = new Set(completedWorkshops);
    newCompleted.add(workshopId);
    setCompletedWorkshops(newCompleted);
    localStorage.setItem(
      "completedWorkshops",
      JSON.stringify([...newCompleted])
    );
  };

  const getWorkshopsByCategory = () => {
    if (selectedCategory === "all") return workshops;
    return workshops.filter(
      (workshop) => workshop.category === selectedCategory
    );
  };

  const getProgressPercentage = () => {
    if (workshops.length === 0) return 0;
    return Math.round((completedWorkshops.size / workshops.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Talleres de Capacitación
          </h1>
          <p className="text-gray-600 max-w-2xl mb-6">
            Accede a nuestros 21 módulos de capacitación diseñados
            específicamente para predicadores hispanos. Desarrolla tus
            habilidades paso a paso.
          </p>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tu Progreso
              </h3>
              <span className="text-2xl font-bold text-blue-600">
                {getProgressPercentage()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {completedWorkshops.size} de {workshops.length} talleres
              completados
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {Object.entries(categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === key
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Workshops Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getWorkshopsByCategory().map((workshop, index) => {
            const isCompleted = completedWorkshops.has(workshop.id);
            const isLocked =
              index > 0 &&
              !completedWorkshops.has(getWorkshopsByCategory()[index - 1]?.id);

            return (
              <div
                key={workshop.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  isLocked ? "opacity-60" : ""
                }`}
              >
                {/* Workshop Header */}
                <div
                  className={`p-6 ${
                    isCompleted
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : isLocked
                      ? "bg-gradient-to-r from-gray-400 to-gray-500"
                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                  } text-white`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium opacity-90">
                      Taller #{workshop.order}
                    </span>
                    {isCompleted && <CheckCircle className="w-6 h-6" />}
                    {isLocked && <Lock className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{workshop.title}</h3>
                  <p className="text-sm opacity-90 line-clamp-2">
                    {workshop.description}
                  </p>
                </div>

                {/* Workshop Info */}
                <div className="p-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {workshop.duration_minutes} min
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {workshop.resources?.length || 0} recursos
                    </div>
                  </div>

                  {/* Workshop Content Preview */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {workshop.content?.substring(0, 150)}...
                  </p>

                  {/* Action Button */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/workshops/${workshop.id}`}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isLocked
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : isCompleted
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                      onClick={(e) => isLocked && e.preventDefault()}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isCompleted
                        ? "Revisar"
                        : isLocked
                        ? "Bloqueado"
                        : "Comenzar"}
                    </Link>

                    {!isLocked && !isCompleted && (
                      <button
                        onClick={() => markAsCompleted(workshop.id)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        title="Marcar como completado"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Resources */}
                {workshop.resources && workshop.resources.length > 0 && (
                  <div className="px-6 pb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Recursos incluidos:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {workshop.resources.slice(0, 3).map((resource, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {resource}
                        </span>
                      ))}
                      {workshop.resources.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{workshop.resources.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Learning Path */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Ruta de Aprendizaje Recomendada
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                1. Fundamentos
              </h3>
              <p className="text-gray-600 text-sm">
                Comienza con los principios básicos de la predicación y el
                ministerio pastoral.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                2. Desarrollo
              </h3>
              <p className="text-gray-600 text-sm">
                Desarrolla habilidades avanzadas en liderazgo, evangelismo y
                cuidado pastoral.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                3. Maestría
              </h3>
              <p className="text-gray-600 text-sm">
                Perfecciona tu ministerio con técnicas avanzadas y
                especialización.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            ¿Necesitas ayuda personalizada?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Nuestros asistentes de IA están disponibles 24/7 para complementar
            tu aprendizaje
          </p>
          <Link
            to="/ai-assistants"
            className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            Hablar con Asistentes IA
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Workshops;
