# backend/scripts/init_db.py
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "one_million_preachers")

async def init_database():
    """Initialize the database with sample data"""
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print(f"Connecting to database: {DATABASE_NAME}")
    
    # Initialize workshops collection
    await init_workshops(db)
    
    # Create indexes
    await create_indexes(db)
    
    client.close()
    print("Database initialization completed!")

async def init_workshops(db):
    """Initialize workshops collection with 21 workshops"""
    workshops_collection = db.workshops
    
    workshops = [
        # Fundamentals (1-7)
        {
            "title": "Fundamentos de la Predicación",
            "description": "Introducción a los principios básicos de la predicación bíblica expositiva",
            "content": """
            Este taller cubre los fundamentos esenciales de la predicación bíblica. 
            Aprenderás los principios básicos de la exposición bíblica, la importancia 
            de la preparación espiritual del predicador, y cómo estructurar un mensaje 
            que honre a Dios y edifique a la congregación.
            
            Objetivos:
            - Entender el llamado a la predicación
            - Conocer los elementos básicos de un sermón
            - Desarrollar una metodología de estudio bíblico
            - Practicar la preparación espiritual
            """,
            "order": 1,
            "duration_minutes": 45,
            "category": "fundamentals",
            "resources": ["Biblia", "Cuaderno de notas", "Guía de estudio básico"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "El Corazón del Predicador",
            "description": "Desarrollando la vida espiritual y el carácter del predicador",
            "content": """
            Un predicador efectivo debe ser primero un discípulo fiel. Este taller 
            se enfoca en el desarrollo del carácter cristiano, la vida devocional, 
            y la integridad personal del predicador.
            
            Temas clave:
            - La vida devocional del predicador
            - Integridad y transparencia
            - Manejo de las tentaciones del ministerio
            - Crecimiento espiritual continuo
            """,
            "order": 2,
            "duration_minutes": 50,
            "category": "fundamentals", 
            "resources": ["Diario espiritual", "Plan de lectura bíblica"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Hermenéutica Bíblica",
            "description": "Principios de interpretación bíblica para predicadores",
            "content": """
            Aprende los principios fundamentales para interpretar correctamente 
            las Escrituras. Este taller te equipará con herramientas exegéticas 
            básicas para extraer el significado correcto del texto bíblico.
            
            Contenido:
            - Principios básicos de hermenéutica
            - Contexto histórico y cultural
            - Géneros literarios bíblicos
            - Aplicación práctica de principios interpretativos
            """,
            "order": 3,
            "duration_minutes": 60,
            "category": "fundamentals",
            "resources": ["Manual de hermenéutica", "Diccionario bíblico"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Estructura del Sermón",
            "description": "Aprende a organizar tus sermones de manera efectiva y clara",
            "content": """
            Un sermón bien estructurado facilita la comprensión y retención del mensaje. 
            Aprenderás diferentes tipos de estructura sermonaria y cómo elegir la 
            más apropiada para cada texto y ocasión.
            
            Estructuras que aprenderás:
            - Sermón expositivo
            - Sermón temático
            - Sermón textual
            - Introducción y conclusión efectivas
            """,
            "order": 4,
            "duration_minutes": 55,
            "category": "preaching",
            "resources": ["Plantillas de sermón", "Ejemplos prácticos"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Comunicación Efectiva",
            "description": "Técnicas de oratoria y comunicación para predicadores",
            "content": """
            La comunicación efectiva es clave para transmitir el mensaje de Dios. 
            Este taller cubre técnicas de oratoria, uso de la voz, lenguaje corporal, 
            y cómo conectar con diferentes audiencias.
            
            Habilidades a desarrollar:
            - Proyección y modulación de la voz
            - Lenguaje corporal efectivo
            - Manejo del nerviosismo
            - Conexión emocional con la audiencia
            """,
            "order": 5,
            "duration_minutes": 40,
            "category": "preaching",
            "resources": ["Ejercicios de voz", "Video ejemplos"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Uso de Ilustraciones",
            "description": "Cómo usar ilustraciones efectivas en tus sermones",
            "content": """
            Las ilustraciones ayudan a clarificar y aplicar la verdad bíblica. 
            Aprende a seleccionar, adaptar y usar ilustraciones que refuercen 
            tu mensaje sin distraer de la Palabra de Dios.
            
            Tipos de ilustraciones:
            - Historias personales
            - Analogías y metáforas
            - Ejemplos históricos
            - Ilustraciones culturalmente relevantes
            """,
            "order": 6,
            "duration_minutes": 35,
            "category": "preaching",
            "resources": ["Banco de ilustraciones", "Guía de selección"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Predicación Expositiva",
            "description": "Dominando el arte de la predicación expositiva verso por verso",
            "content": """
            La predicación expositiva es el método más fiel para presentar la Palabra de Dios. 
            Aprende a desarrollar sermones que sigan el flujo natural del texto bíblico 
            y comuniquen el mensaje original del autor inspirado.
            
            Elementos clave:
            - Selección del texto bíblico
            - Análisis del contexto
            - Desarrollo de puntos principales
            - Aplicación contemporánea
            """,
            "order": 7,
            "duration_minutes": 65,
            "category": "preaching",
            "resources": ["Guía de exposición", "Ejemplos de sermones expositivos"],
            "created_at": datetime.utcnow()
        },
        
        # Leadership (8-14)
        {
            "title": "Liderazgo Pastoral",
            "description": "Fundamentos del liderazgo cristiano en el contexto pastoral",
            "content": """
            El liderazgo pastoral requiere sabiduría, humildad y visión. Este taller 
            explora los principios bíblicos del liderazgo y cómo aplicarlos en el 
            ministerio pastoral contemporáneo.
            
            Principios de liderazgo:
            - Liderazgo de servicio
            - Desarrollo de visión ministerial
            - Toma de decisiones sabias
            - Delegación efectiva
            """,
            "order": 8,
            "duration_minutes": 50,
            "category": "leadership",
            "resources": ["Manual de liderazgo", "Casos de estudio"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Formación de Discípulos",
            "description": "Estrategias para formar discípulos comprometidos",
            "content": """
            El llamado de Cristo es hacer discípulos. Aprende metodologías prácticas 
            para formar discípulos maduros que se reproduzcan en otros.
            
            Estrategias incluidas:
            - Modelo de discipulado uno-a-uno
            - Grupos pequeños efectivos
            - Mentoreo espiritual
            - Desarrollo de líderes
            """,
            "order": 9,
            "duration_minutes": 45,
            "category": "leadership",
            "resources": ["Plan de discipulado", "Materiales de estudio"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Administración de la Iglesia",
            "description": "Principios de administración y gestión ministerial",
            "content": """
            Una iglesia bien administrada puede enfocarse mejor en su misión. 
            Aprende principios de administración que honren a Dios y sirvan 
            efectivamente a la congregación.
            
            Áreas administrativas:
            - Planificación estratégica
            - Gestión financiera básica
            - Organización de ministerios
            - Evaluación y mejora continua
            """,
            "order": 10,
            "duration_minutes": 40,
            "category": "leadership",
            "resources": ["Plantillas administrativas", "Herramientas de planificación"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Resolución de Conflictos",
            "description": "Manejo bíblico de conflictos en la iglesia",
            "content": """
            Los conflictos son inevitables en cualquier comunidad. Aprende principios 
            bíblicos para manejar conflictos de manera constructiva y restaurativa.
            
            Habilidades a desarrollar:
            - Principios bíblicos de reconciliación
            - Mediación efectiva
            - Comunicación en crisis
            - Restauración de relaciones
            """,
            "order": 11,
            "duration_minutes": 55,
            "category": "leadership",
            "resources": ["Manual de resolución", "Casos prácticos"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Desarrollo de Equipos",
            "description": "Formando equipos ministeriales efectivos",
            "content": """
            El ministerio es trabajo en equipo. Aprende a identificar, capacitar 
            y coordinar equipos que multipliquen el impacto del ministerio.
            
            Elementos del desarrollo:
            - Identificación de dones espirituales
            - Capacitación de voluntarios
            - Coordinación de equipos
            - Evaluación de desempeño
            """,
            "order": 12,
            "duration_minutes": 45,
            "category": "leadership",
            "resources": ["Test de dones", "Manuales de capacitación"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Visión y Planificación",
            "description": "Desarrollando visión ministerial y planificación estratégica",
            "content": """
            Sin visión, el pueblo se desenfrena. Aprende a desarrollar una visión 
            clara para tu ministerio y crear planes estratégicos para alcanzarla.
            
            Proceso de planificación:
            - Desarrollo de declaración de misión
            - Establecimiento de objetivos
            - Creación de estrategias
            - Implementación y seguimiento
            """,
            "order": 13,
            "duration_minutes": 50,
            "category": "leadership",
            "resources": ["Plantilla de visión", "Herramientas de planificación"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Multiplicación Ministerial",
            "description": "Estrategias para multiplicar el ministerio y plantar iglesias",
            "content": """
            El crecimiento del Reino requiere multiplicación. Explora estrategias 
            para expandir el ministerio a través de plantación de iglesias y 
            desarrollo de nuevos líderes.
            
            Aspectos de multiplicación:
            - Identificación de oportunidades
            - Preparación de plantadores
            - Apoyo a nuevas obras
            - Sostenibilidad a largo plazo
            """,
            "order": 14,
            "duration_minutes": 60,
            "category": "leadership",
            "resources": ["Manual de plantación", "Red de apoyo"],
            "created_at": datetime.utcnow()
        },
        
        # Pastoral Care (15-18)
        {
            "title": "Consejería Pastoral",
            "description": "Principios básicos de consejería bíblica pastoral",
            "content": """
            Los pastores son llamados a cuidar las almas. Aprende principios 
            fundamentales de consejería bíblica para ayudar a las personas 
            en sus luchas espirituales y emocionales.
            
            Principios de consejería:
            - Escucha activa y empática
            - Aplicación de principios bíblicos
            - Identificación de problemas comunes
            - Referencia a profesionales cuando sea necesario
            """,
            "order": 15,
            "duration_minutes": 55,
            "category": "pastoral",
            "resources": ["Manual de consejería", "Recursos de apoyo"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Cuidado de Familias",
            "description": "Ministerio pastoral enfocado en fortalecer familias",
            "content": """
            La familia es la unidad básica de la sociedad y la iglesia. Aprende 
            estrategias efectivas para ministrar a familias y fortalecer 
            los vínculos familiares según principios bíblicos.
            
            Áreas de ministerio familiar:
            - Consejería matrimonial básica
            - Orientación para padres
            - Ministerio con adolescentes
            - Sanidad de relaciones familiares
            """,
            "order": 16,
            "duration_minutes": 50,
            "category": "pastoral",
            "resources": ["Materiales familiares", "Programas de apoyo"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Cuidado en Crisis",
            "description": "Ministerio pastoral durante tiempos de crisis y dolor",
            "content": """
            Las crisis son oportunidades para demostrar el amor de Cristo. 
            Aprende a ministrar efectivamente durante tiempos de enfermedad, 
            muerte, pérdida y otras crisis de la vida.
            
            Ministerio en crisis:
            - Presencia pastoral significativa
            - Palabras de consuelo apropiadas
            - Apoyo práctico y espiritual
            - Acompañamiento en el duelo
            """,
            "order": 17,
            "duration_minutes": 45,
            "category": "pastoral",
            "resources": ["Guía de crisis", "Recursos de duelo"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Visitación Pastoral",
            "description": "El arte de la visitación pastoral efectiva",
            "content": """
            La visitación pastoral es una disciplina fundamental del ministerio. 
            Aprende cómo hacer visitas pastorales significativas que fortalezcan 
            la fe y profundicen las relaciones.
            
            Elementos de visitación:
            - Planificación de visitas
            - Conversación pastoral efectiva
            - Oración y ministración
            - Seguimiento apropiado
            """,
            "order": 18,
            "duration_minutes": 40,
            "category": "pastoral",
            "resources": ["Guía de visitación", "Registro pastoral"],
            "created_at": datetime.utcnow()
        },
        
        # Evangelism (19-21)
        {
            "title": "Evangelismo Personal",
            "description": "Compartiendo el evangelio de manera personal y efectiva",
            "content": """
            Todo cristiano es llamado a ser testigo. Aprende métodos prácticos 
            para compartir el evangelio de manera natural y efectiva en 
            conversaciones cotidianas.
            
            Estrategias evangelísticas:
            - Construcción de relaciones auténticas
            - Presentación clara del evangelio
            - Manejo de objeciones comunes
            - Seguimiento de nuevos convertidos
            """,
            "order": 19,
            "duration_minutes": 50,
            "category": "evangelism",
            "resources": ["Guía evangelística", "Tratados y recursos"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Evangelismo Masivo",
            "description": "Organización y ejecución de campañas evangelísticas",
            "content": """
            Las campañas evangelísticas pueden alcanzar multitudes para Cristo. 
            Aprende a planificar, organizar y ejecutar eventos evangelísticos 
            efectivos en tu comunidad.
            
            Planificación de campañas:
            - Desarrollo de estrategia
            - Organización de equipos
            - Promoción y publicidad
            - Seguimiento de decisiones
            """,
            "order": 20,
            "duration_minutes": 55,
            "category": "evangelism",
            "resources": ["Manual de campañas", "Materiales promocionales"],
            "created_at": datetime.utcnow()
        },
        {
            "title": "Misiones y Alcance",
            "description": "Desarrollando una visión misionera local y global",
            "content": """
            La iglesia existe para la misión. Aprende a desarrollar una cultura 
            misionera en tu congregación que alcance tanto a la comunidad local 
            como a los confines de la tierra.
            
            Componentes misioneros:
            - Visión misionera bíblica
            - Desarrollo de programas de alcance
            - Apoyo a misioneros
            - Participación en la Gran Comisión
            """,
            "order": 21,
            "duration_minutes": 60,
            "category": "evangelism",
            "resources": ["Manual misionero", "Contactos ministeriales"],
            "created_at": datetime.utcnow()
        }
    ]
    
    # Check if workshops already exist
    count = await workshops_collection.count_documents({})
    if count == 0:
        result = await workshops_collection.insert_many(workshops)
        print(f"✓ Inserted {len(workshops)} workshops")
        return len(workshops)
    else:
        print(f"ℹ Workshops collection already has {count} documents")
        return 0

async def create_indexes(db):
    """Create database indexes for better performance"""
    
    # Users collection indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("created_at")
    
    # Conversations collection indexes
    await db.conversations.create_index([("user_id", 1), ("assistant_type", 1)])
    await db.conversations.create_index("updated_at")
    
    # Workshops collection indexes
    await db.workshops.create_index("order", unique=True)
    await db.workshops.create_index("category")
    
    # Donations collection indexes
    await db.donations.create_index("created_at")
    await db.donations.create_index("status")
    
    print("✓ Created database indexes")

if __name__ == "__main__":
    asyncio.run(init_database())