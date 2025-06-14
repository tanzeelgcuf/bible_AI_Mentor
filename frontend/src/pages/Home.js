import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="nav-icon">📖</span>
            <span className="nav-title">Un Millón de Predicadores</span>
          </div>
          <div className="nav-menu">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/attendees" className="nav-link">
              Attendees
            </Link>
            <Link to="/workshops" className="nav-link">
              IA Workshops
            </Link>
            <Link to="/donations" className="nav-link">
              Donations
            </Link>
          </div>
          <div className="nav-auth">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </div>
          <div className="nav-toggle">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <h1 className="hero-title">
            Bienvenido a<br />
            Un Millón de
            <br />
            Predicadores
          </h1>
          <p className="hero-subtitle">
            Forma parte de una comunidad que está revolucionando la manera de
            compartir el Evangelio. Recibe herramientas prácticas,
            acompañamiento personalizado y entrenamiento profundo para cumplir
            tu llamado con excelencia. ¡Es tu momento de crecer, predicar con
            poder y transformar vidas!
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Comenzar Ahora →
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2 className="features-title">Características Principales</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon chat-icon">💬</div>
              <h3>3 Asistentes Ministeriales</h3>
              <p>
                Mentor Bíblico, Entrenador de Sermones y Guía de Exégesis que te
                acompañan en cada paso de tu preparación.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon book-icon">📚</div>
              <h3>21 Talleres</h3>
              <p>Módulos interactivos de capacitación pastoral y homilética</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon community-icon">👥</div>
              <h3>Comunidad</h3>
              <p>Conecta con otros predicadores y comparte experiencias</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon heart-icon">❤️</div>
              <h3>Donaciones</h3>
              <p>Apoya nuestra misión de entrenar un millón de predicadores</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistants Section */}
      <section className="ai-assistants">
        <div className="ai-container">
          <h2 className="ai-title">Nuestros Asistentes de IA</h2>
          <div className="ai-grid">
            <div className="ai-card">
              <div className="ai-icon mentor-icon">📖</div>
              <h3>Mentor Bíblico</h3>
              <p>
                Orientación bíblica profunda, interpretación culturalmente
                relevante y consejos pastorales sabios basados en las
                Escrituras.
              </p>
              <ul className="ai-features">
                <li>• Búsqueda de pasajes bíblicos</li>
                <li>• Análisis de contexto</li>
                <li>• Insights teológicos</li>
                <li>• Aplicación cultural hispana</li>
              </ul>
            </div>

            <div className="ai-card">
              <div className="ai-icon coach-icon">💬</div>
              <h3>Entrenador de Sermones</h3>
              <p>
                Mejora la estructura de tus sermones, técnicas de comunicación y
                engagement con tu audiencia hispana.
              </p>
              <ul className="ai-features">
                <li>• Creación de esquemas</li>
                <li>• Técnicas de oratoria</li>
                <li>• Engagement de audiencia</li>
                <li>• Adaptación cultural</li>
              </ul>
            </div>

            <div className="ai-card">
              <div className="ai-icon guide-icon">👥</div>
              <h3>Guía de Exégesis</h3>
              <p>
                Análisis profundo de textos bíblicos con contexto histórico,
                idiomas originales y aplicaciones prácticas.
              </p>
              <ul className="ai-features">
                <li>• Análisis de idiomas originales</li>
                <li>• Contexto histórico</li>
                <li>• Comentarios académicos</li>
                <li>• Aplicación práctica</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <h2>¿Listo para transformar tu ministerio?</h2>
          <p>
            Únete a miles de predicadores que ya están utilizando nuestra
            plataforma para mejorar sus sermones y ministerios.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-white">
              Registrarse Gratis
            </Link>
            <Link to="/donations" className="btn btn-outline">
              Apoyar la Misión
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat">
            <div className="stat-number">1M+</div>
            <div className="stat-label">Meta de Predicadores</div>
          </div>
          <div className="stat">
            <div className="stat-number">21</div>
            <div className="stat-label">Talleres Disponibles</div>
          </div>
          <div className="stat">
            <div className="stat-number">3</div>
            <div className="stat-label">Asistentes de IA</div>
          </div>
          <div className="stat">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Disponibilidad</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Un Millón de Predicadores</h3>
            <p>
              Capacitando predicadores hispanos con inteligencia artificial y
              recursos educativos de calidad para transformar comunidades.
            </p>
            <p className="nonprofit">❤️ Organización sin fines de lucro</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li>
                <a href="#about">Acerca de</a>
              </li>
              <li>
                <a href="#contact">Contacto</a>
              </li>
              <li>
                <a href="#privacy">Privacidad</a>
              </li>
              <li>
                <a href="#terms">Términos</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>📧 info@unmillondepredicadores.org</p>
            <p>🌐 Global</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © 2024 Un Millón de Predicadores. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
