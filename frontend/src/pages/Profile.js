import { Award, Save, Settings, User } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const Profile = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || "",
    email: user?.email || "",
    bio: "",
    ministry: "",
    location: "",
  });

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // Here you would typically save to backend
    setEditing(false);
    toast.success("Perfil actualizado exitosamente");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
              <div className="flex items-center">
                <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mr-6">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user?.full_name}</h1>
                  <p className="text-lg opacity-90">{user?.email}</p>
                  <p className="text-sm opacity-75">
                    Miembro desde{" "}
                    {new Date(user?.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Información Personal
                  </h2>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {editing ? "Cancelar" : "Editar"}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <p className="text-gray-900">{profileData.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biografía
                    </label>
                    {editing ? (
                      <textarea
                        name="bio"
                        rows="4"
                        value={profileData.bio}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Cuéntanos sobre tu ministerio..."
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profileData.bio || "No hay biografía disponible"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ministerio/Iglesia
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="ministry"
                        value={profileData.ministry}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre de tu iglesia o ministerio"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profileData.ministry || "No especificado"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="location"
                        value={profileData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ciudad, País"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profileData.location || "No especificado"}
                      </p>
                    )}
                  </div>

                  {editing && (
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSave}
                        className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Estadísticas
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Talleres Completados</span>
                    <span className="font-semibold">14/21</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Conversaciones IA</span>
                    <span className="font-semibold">142</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Horas de Estudio</span>
                    <span className="font-semibold">24h</span>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Logros</h3>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Primer Sermón
                      </div>
                      <div className="text-xs text-gray-600">
                        Completaste tu primer taller
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Estudiante Dedicado
                      </div>
                      <div className="text-xs text-gray-600">
                        10 talleres completados
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <Award className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Conversador IA
                      </div>
                      <div className="text-xs text-gray-600">
                        100+ conversaciones
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
