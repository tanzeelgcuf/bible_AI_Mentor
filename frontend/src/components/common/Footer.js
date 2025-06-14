import { Globe, Heart, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="text-xl font-bold mb-4">
              Un Millón de Predicadores
            </h3>
            <p className="text-gray-300 mb-4">
              Capacitando predicadores hispanos con inteligencia artificial y
              recursos educativos de calidad para transformar comunidades.
            </p>
            <div className="flex items-center text-gray-300">
              <Heart className="w-4 h-4 mr-2 text-red-400" />
              <span>Organización sin fines de lucro</span>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/about" className="hover:text-white">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white">
                  Contacto
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white">
                  Términos
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@unmillondepredicadores.org</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                <span>Global</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; 2024 Un Millón de Predicadores. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
