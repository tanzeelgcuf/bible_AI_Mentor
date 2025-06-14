// frontend/src/pages/AIAssistants.js
import {
  BookOpen,
  Bot,
  Download,
  MessageCircle,
  Send,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { aiService } from "../services/aiService";

const AIAssistants = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [selectedAssistant, setSelectedAssistant] = useState(
    type || "bible_mentor"
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const assistants = {
    bible_mentor: {
      name: "Mentor Bíblico",
      icon: BookOpen,
      color: "bg-blue-500",
      description:
        "Tu guía personal para interpretación bíblica y orientación pastoral",
      placeholder:
        "Pregúntame sobre pasajes bíblicos, interpretación o consejos pastorales...",
    },
    sermon_coach: {
      name: "Entrenador de Sermones",
      icon: MessageCircle,
      color: "bg-green-500",
      description: "Mejora tus sermones con estructura, técnicas y engagement",
      placeholder: "Necesito ayuda con la estructura de mi sermón sobre...",
    },
    exegesis_guide: {
      name: "Guía de Exégesis",
      icon: Users,
      color: "bg-purple-500",
      description:
        "Análisis profundo de textos bíblicos con contexto histórico",
      placeholder: "Quiero entender mejor el contexto de este pasaje...",
    },
  };

  useEffect(() => {
    if (type && assistants[type]) {
      setSelectedAssistant(type);
    }
  }, [type]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversationHistory();
  }, [selectedAssistant]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversationHistory = async () => {
    try {
      const history = await aiService.getConversations();
      const currentConversation = history.find(
        (conv) => conv.assistant_type === selectedAssistant
      );
      if (currentConversation) {
        setMessages(currentConversation.messages || []);
      } else {
        setMessages([]);
      }
      setConversationHistory(history);
    } catch (error) {
      console.error("Error loading conversation history:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await aiService.sendMessage(
        selectedAssistant,
        input.trim()
      );

      const assistantMessage = {
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Reload conversation history to get updated data
      await loadConversationHistory();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssistantChange = (assistantType) => {
    setSelectedAssistant(assistantType);
    navigate(`/ai-assistants/${assistantType}`);
  };

  const clearConversation = () => {
    setMessages([]);
    toast.success("Conversación limpiada");
  };

  const exportConversation = async () => {
    try {
      const currentConversation = conversationHistory.find(
        (conv) => conv.assistant_type === selectedAssistant
      );

      if (!currentConversation) {
        toast.error("No hay conversación para exportar");
        return;
      }

      // Create a simple text export for now
      const exportText = messages
        .map((msg) => {
          const timestamp = new Date(msg.timestamp).toLocaleString("es-ES");
          const role =
            msg.role === "user"
              ? "Usuario"
              : assistants[selectedAssistant].name;
          return `[${timestamp}] ${role}: ${msg.content}`;
        })
        .join("\n\n");

      const blob = new Blob([exportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conversacion-${assistants[selectedAssistant].name
        .toLowerCase()
        .replace(" ", "-")}-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Conversación exportada exitosamente");
    } catch (error) {
      console.error("Error exporting conversation:", error);
      toast.error("Error al exportar la conversación");
    }
  };

  const currentAssistant = assistants[selectedAssistant];
  const IconComponent = currentAssistant.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Asistentes de Inteligencia Artificial
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Interactúa con nuestros asistentes especializados para mejorar tus
            sermones, profundizar en la Palabra y desarrollar tu ministerio.
          </p>
        </div>

        {/* Assistant Selector */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {Object.entries(assistants).map(([key, assistant]) => {
            const AssistantIcon = assistant.icon;
            return (
              <button
                key={key}
                onClick={() => handleAssistantChange(key)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedAssistant === key
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-center mb-3">
                  <div
                    className={`${assistant.color} w-12 h-12 rounded-lg flex items-center justify-center mr-4`}
                  >
                    <AssistantIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assistant.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{assistant.description}</p>
              </button>
            );
          })}
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className={`${currentAssistant.color} px-6 py-4 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <IconComponent className="w-6 h-6 mr-3" />
                <div>
                  <h2 className="text-xl font-semibold">
                    {currentAssistant.name}
                  </h2>
                  <p className="text-sm text-white/80">
                    {currentAssistant.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportConversation}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Exportar conversación"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={clearConversation}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Limpiar conversación"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">¡Hola! Soy tu {currentAssistant.name}</p>
                <p className="text-sm">¿En qué puedo ayudarte hoy?</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === "assistant" && (
                        <Bot className="w-5 h-5 mt-1 flex-shrink-0" />
                      )}
                      {message.role === "user" && (
                        <User className="w-5 h-5 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString(
                            "es-ES"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-gray-600">Escribiendo...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentAssistant.placeholder}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  !input.trim() || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">
              Sugerencias para {currentAssistant.name}
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {selectedAssistant === "bible_mentor" && (
                <>
                  <li>• "Explícame el contexto de Juan 3:16"</li>
                  <li>• "¿Cómo aplicar Romanos 8 hoy?"</li>
                  <li>• "Consejo pastoral para conflictos"</li>
                </>
              )}
              {selectedAssistant === "sermon_coach" && (
                <>
                  <li>• "Ayúdame con un sermón sobre el amor"</li>
                  <li>• "Técnicas para mantener atención"</li>
                  <li>• "Cómo estructurar una introducción"</li>
                </>
              )}
              {selectedAssistant === "exegesis_guide" && (
                <>
                  <li>• "Análisis de Mateo 5:1-12"</li>
                  <li>• "Contexto histórico de Efesios"</li>
                  <li>• "Significado en el griego original"</li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">
              Historial de Conversaciones
            </h3>
            <div className="space-y-2">
              {conversationHistory.filter(
                (conv) => conv.assistant_type === selectedAssistant
              ).length > 0 ? (
                <p className="text-sm text-green-600">
                  ✓ Tienes conversaciones guardadas
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  No hay conversaciones previas
                </p>
              )}
              <button
                onClick={loadConversationHistory}
                className="text-sm text-blue-500 hover:underline"
              >
                Actualizar historial
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-gray-900 mb-2">
              Exportar & Compartir
            </h3>
            <div className="space-y-2">
              <button
                onClick={exportConversation}
                className="text-sm text-blue-500 hover:underline block"
              >
                📄 Exportar como texto
              </button>
              <button
                className="text-sm text-gray-400 block"
                title="Próximamente"
              >
                📱 Compartir conversación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistants;
