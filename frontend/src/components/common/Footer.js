import { Facebook, Globe, Heart, Instagram, Mail, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="text-xl font-bold mb-4">Un Millón de Predicadores</h3>
            <p className="text-gray-300 mb-4">
              Capacitando predicadores hispanos con inteligencia artificial y 
              recursos educativos de calidad para transformar comunidades.
            </p>
            <div className="flex items-center text-gray-300 mb-4">
              <Heart className="w-4 h-4 mr-2 text-red-400" />
              <span>Organización sin fines de lucro</span>
            </div>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-gray-300">
              <li><button className="hover:text-white transition-colors text-left">Acerca de</button></li>
              <li><button className="hover:text-white transition-colors text-left">Contacto</button></li>
              <li><button className="hover:text-white transition-colors text-left">Privacidad</button></li>
              <li><button className="hover:text-white transition-colors text-left">Términos</button></li>
              <li><button className="hover:text-white transition-colors text-left">Ayuda</button></li>
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
          <p>&copy; 2024 Un Millón de Predicadores. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;