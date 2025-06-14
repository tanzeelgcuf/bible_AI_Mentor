from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import openai
import os
from bson import ObjectId
import asyncio
import httpx
import time
import logging
from collections import defaultdict

# Import the get_current_user function from auth module
from app.core.auth import get_current_user
from app.core.database import (
    client, 
    db, 
    users_collection, 
    conversations_collection, 
    workshops_collection, 
    donations_collection
)
# Environment variables
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "one_million_preachers")
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")

# Initialize FastAPI
app = FastAPI(
    title="One Million Preachers API",
    description="AI-powered platform for training Hispanic preachers",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OpenAI client
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY



# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Metrics collector
class MetricsCollector:
    def __init__(self):
        self.request_count = defaultdict(int)
        self.error_count = defaultdict(int)
        self.ai_usage = defaultdict(int)
        
    def record_request(self, endpoint: str, status_code: int):
        self.request_count[endpoint] += 1
        if status_code >= 400:
            self.error_count[endpoint] += 1
    
    def record_ai_usage(self, assistant_type: str):
        self.ai_usage[assistant_type] += 1

metrics = MetricsCollector()

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    facebook_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class FacebookAuth(BaseModel):
    facebook_id: str
    access_token: str
    email: str
    full_name: str

class User(BaseModel):
    id: str
    email: str
    full_name: str
    role: str = "user"
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class MessageRequest(BaseModel):
    content: str
    assistant_type: str  # bible_mentor, sermon_coach, exegesis_guide

class Message(BaseModel):
    role: str
    content: str
    timestamp: datetime

class Conversation(BaseModel):
    id: str
    user_id: str
    assistant_type: str
    messages: List[Message]
    created_at: datetime

class Workshop(BaseModel):
    id: str
    title: str
    description: str
    content: str
    order: int
    duration_minutes: int
    resources: List[str]
    category: str

class DonationRequest(BaseModel):
    amount: float
    currency: str = "USD"
    donor_name: Optional[str] = None
    donor_email: Optional[EmailStr] = None
    message: Optional[str] = None

# Helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# AI Assistant Prompts
AI_PROMPTS = {
    "bible_mentor": """Eres un mentor bíblico experimentado que ayuda a predicadores hispanos. 
    Proporciona orientación basada en las Escrituras, interpretación bíblica culturalmente relevante, 
    y consejos pastorales sabios. Responde siempre en español con un tono cálido y pastoral.
    
    ESPECIALIDADES:
    - Interpretación bíblica contextual
    - Aplicación cultural hispana de principios bíblicos
    - Consejería pastoral basada en las Escrituras
    - Desarrollo espiritual del predicador
    
    Mantén tus respuestas entre 200-400 palabras, usa referencias bíblicas específicas,
    y proporciona aplicaciones prácticas para el ministerio.""",
    
    "sermon_coach": """Eres un entrenador de sermones especializado en ayudar a predicadores hispanos. 
    Ayuda con la estructura del sermón, técnicas de comunicación, engagement de la audiencia, 
    y adaptación cultural. Proporciona consejos prácticos y ejemplos específicos. Responde en español.
    
    ESPECIALIDADES:
    - Estructura de sermones expositivos y temáticos
    - Técnicas de oratoria y comunicación efectiva
    - Engagement con audiencias hispanas
    - Uso de ilustraciones y aplicaciones culturalmente relevantes
    - Preparación y organización de contenido
    
    Ofrece consejos estructurados, ejemplos prácticos, y técnicas específicas
    que los predicadores puedan implementar inmediatamente.""",
    
    "exegesis_guide": """Eres un guía de exégesis bíblica que ayuda con el análisis profundo de textos bíblicos 
    para predicadores hispanos. Proporciona contexto histórico, análisis del idioma original, insights teológicos, 
    y aplicaciones prácticas. Mantén rigor académico pero accesible. Responde en español.
    
    ESPECIALIDADES:
    - Análisis de contexto histórico y cultural
    - Explicación de conceptos en idiomas originales (hebreo, griego)
    - Estructuras literarias y géneros bíblicos
    - Teología bíblica y sistemática
    - Comentarios académicos accesibles
    
    Proporciona análisis profundo pero comprensible, con múltiples perspectivas
    interpretativas responsables y aplicaciones homilético."""
}

# API Routes

@app.get("/")
async def root():
    return {"message": "Bienvenido a Un Millón de Predicadores API"}

@app.get("/api/health")
async def health_check():
    try:
        # Test database connection
        await db.command("ping")
        return {
            "status": "healthy", 
            "timestamp": datetime.utcnow(),
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

# Authentication endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    metrics.record_request("/api/auth/register", 200)
    
    # Check if user exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_dict = {
        "email": user.email,
        "password_hash": hashed_password,
        "full_name": user.full_name,
        "facebook_id": user.facebook_id,
        "role": "user",
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "email_verified": False,
        "preferences": {
            "language": "es",
            "notifications": True
        },
        "progress": {
            "workshops_completed": [],
            "total_conversations": 0,
            "favorite_assistant": None
        }
    }
    
    result = await users_collection.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    logger.info(f"New user registered: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    metrics.record_request("/api/auth/login", 200)
    
    # Find user
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        metrics.record_request("/api/auth/login", 401)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update last login
    await users_collection.update_one(
        {"_id": db_user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user["_id"])}, expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/facebook", response_model=Token)
async def facebook_login(facebook_data: FacebookAuth):
    metrics.record_request("/api/auth/facebook", 200)
    
    try:
        # Verify Facebook token with Facebook API
        async with httpx.AsyncClient() as client:
            fb_response = await client.get(
                f"https://graph.facebook.com/me?access_token={facebook_data.access_token}&fields=id,email,name"
            )
            
            if fb_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Facebook token"
                )
            
            fb_user_data = fb_response.json()
            
            # Verify the Facebook ID matches
            if fb_user_data["id"] != facebook_data.facebook_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Facebook ID mismatch"
                )
        
        # Check if user exists
        existing_user = await users_collection.find_one({
            "$or": [
                {"facebook_id": facebook_data.facebook_id},
                {"email": facebook_data.email}
            ]
        })
        
        if existing_user:
            # Update last login and Facebook ID if needed
            await users_collection.update_one(
                {"_id": existing_user["_id"]},
                {
                    "$set": {
                        "facebook_id": facebook_data.facebook_id,
                        "last_login": datetime.utcnow()
                    }
                }
            )
            user_id = str(existing_user["_id"])
        else:
            # Create new user
            user_dict = {
                "email": facebook_data.email,
                "full_name": facebook_data.full_name,
                "facebook_id": facebook_data.facebook_id,
                "password_hash": None,  # No password for Facebook users
                "role": "user",
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "email_verified": True,  # Facebook emails are considered verified
                "preferences": {
                    "language": "es",
                    "notifications": True
                },
                "progress": {
                    "workshops_completed": [],
                    "total_conversations": 0,
                    "favorite_assistant": None
                }
            }
            
            result = await users_collection.insert_one(user_dict)
            user_id = str(result.inserted_id)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )
        
        logger.info(f"Facebook user logged in: {facebook_data.email}")
        return {"access_token": access_token, "token_type": "bearer"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Facebook authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Facebook authentication failed: {str(e)}"
        )

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return User(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )

# AI Assistants endpoints
@app.post("/api/ai/chat")
async def chat_with_assistant(
    message_request: MessageRequest,
    current_user: dict = Depends(get_current_user)
):
    metrics.record_request("/api/ai/chat", 200)
    metrics.record_ai_usage(message_request.assistant_type)
    
    try:
        if not OPENAI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service not configured"
            )
        
        # Get conversation history
        conversation = await conversations_collection.find_one({
            "user_id": ObjectId(current_user["_id"]),
            "assistant_type": message_request.assistant_type
        })
        
        # Prepare messages for OpenAI
        messages = [{"role": "system", "content": AI_PROMPTS[message_request.assistant_type]}]
        
        if conversation and conversation.get("messages"):
            # Add last 6 messages for context (to stay within token limits)
            for msg in conversation["messages"][-6:]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        # Add current user message
        messages.append({"role": "user", "content": message_request.content})
        
        # Call OpenAI
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=800,
            temperature=0.7,
            presence_penalty=0.1,
            frequency_penalty=0.1
        )
        
        assistant_response = response.choices[0].message.content.strip()
        
        # Save conversation
        new_messages = [
            {
                "role": "user",
                "content": message_request.content,
                "timestamp": datetime.utcnow()
            },
            {
                "role": "assistant",
                "content": assistant_response,
                "timestamp": datetime.utcnow()
            }
        ]
        
        if conversation:
            # Update existing conversation
            await conversations_collection.update_one(
                {"_id": conversation["_id"]},
                {
                    "$push": {"messages": {"$each": new_messages}},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
        else:
            # Create new conversation
            await conversations_collection.insert_one({
                "user_id": ObjectId(current_user["_id"]),
                "assistant_type": message_request.assistant_type,
                "messages": new_messages,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
        
        # Update user progress
        await users_collection.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$inc": {"progress.total_conversations": 1}}
        )
        
        logger.info(f"AI chat completed for user {current_user['email']} with {message_request.assistant_type}")
        return {"response": assistant_response}
        
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}")
        metrics.record_request("/api/ai/chat", 500)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing request: {str(e)}"
        )

@app.get("/api/conversations", response_model=List[Conversation])
async def get_conversations(current_user: dict = Depends(get_current_user)):
    conversations = await conversations_collection.find(
        {"user_id": ObjectId(current_user["_id"])}
    ).sort("updated_at", -1).to_list(100)
    
    return [
        Conversation(
            id=str(conv["_id"]),
            user_id=str(conv["user_id"]),
            assistant_type=conv["assistant_type"],
            messages=[
                Message(
                    role=msg["role"],
                    content=msg["content"],
                    timestamp=msg["timestamp"]
                ) for msg in conv["messages"]
            ],
            created_at=conv["created_at"]
        ) for conv in conversations
    ]

# Workshops endpoints
@app.get("/api/workshops", response_model=List[Workshop])
async def get_workshops(current_user: dict = Depends(get_current_user)):
    workshops = await workshops_collection.find({}).sort("order", 1).to_list(100)
    return [
        Workshop(
            id=str(workshop["_id"]),
            title=workshop["title"],
            description=workshop["description"],
            content=workshop["content"],
            order=workshop["order"],
            duration_minutes=workshop["duration_minutes"],
            resources=workshop.get("resources", []),
            category=workshop.get("category", "general")
        ) for workshop in workshops
    ]

@app.get("/api/workshops/{workshop_id}", response_model=Workshop)
async def get_workshop(workshop_id: str, current_user: dict = Depends(get_current_user)):
    try:
        workshop = await workshops_collection.find_one({"_id": ObjectId(workshop_id)})
    except:
        # Try finding by order number if ObjectId fails
        try:
            order_num = int(workshop_id)
            workshop = await workshops_collection.find_one({"order": order_num})
        except:
            workshop = None
    
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    return Workshop(
        id=str(workshop["_id"]),
        title=workshop["title"],
        description=workshop["description"],
        content=workshop["content"],
        order=workshop["order"],
        duration_minutes=workshop["duration_minutes"],
        resources=workshop.get("resources", []),
        category=workshop.get("category", "general")
    )

# Export endpoints
@app.get("/api/export/conversation/{conversation_id}")
async def export_conversation_pdf(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        conversation = await conversations_collection.find_one({
            "_id": ObjectId(conversation_id),
            "user_id": ObjectId(current_user["_id"])
        })
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Simple text export for now (can be enhanced with PDF generation)
        assistant_names = {
            'bible_mentor': 'Mentor Bíblico',
            'sermon_coach': 'Entrenador de Sermones',
            'exegesis_guide': 'Guía de Exégesis'
        }
        
        assistant_name = assistant_names.get(conversation['assistant_type'], 'Asistente IA')
        
        export_text = f"""
UN MILLÓN DE PREDICADORES
Conversación con {assistant_name}

Usuario: {current_user['full_name']}
Fecha: {datetime.now().strftime('%d/%m/%Y %H:%M')}

""" + "="*50 + "\n\n"
        
        for msg in conversation.get('messages', []):
            if msg['role'] == 'user':
                export_text += f"PREGUNTA: {msg['content']}\n\n"
            else:
                export_text += f"RESPUESTA ({assistant_name}): {msg['content']}\n\n"
                export_text += "-"*30 + "\n\n"
        
        export_text += f"""
{"="*50}
Este documento fue generado por Un Millón de Predicadores
Una iniciativa para capacitar predicadores hispanos con IA
www.unmillondepredicadores.org
"""
        
        return {
            "message": "Export functionality available - implement with reportlab or weasyprint",
            "content": export_text,
            "download_url": f"/api/downloads/{conversation_id}.txt"
        }
        
    except Exception as e:
        logger.error(f"Export error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Export error: {str(e)}")

# Donations endpoint
@app.post("/api/donations")
async def create_donation(donation: DonationRequest):
    donation_record = {
        "amount": donation.amount,
        "currency": donation.currency,
        "donor_name": donation.donor_name,
        "donor_email": donation.donor_email,
        "message": donation.message,
        "status": "pending",
        "payment_method": "manual",
        "created_at": datetime.utcnow()
    }
    
    result = await donations_collection.insert_one(donation_record)
    
    logger.info(f"Donation created: ${donation.amount} from {donation.donor_name}")
    return {
        "message": "Donación registrada exitosamente",
        "donation_id": str(result.inserted_id)
    }

# Analytics endpoints (Admin only)
@app.get("/api/analytics/metrics")
async def get_system_metrics(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get basic metrics
    total_users = await users_collection.count_documents({})
    total_conversations = await conversations_collection.count_documents({})
    total_donations = await donations_collection.count_documents({})
    
    # Get workshop completion stats
    users_with_progress = await users_collection.find(
        {"progress.workshops_completed": {"$exists": True}}
    ).to_list(1000)
    
    avg_workshops_completed = 0
    if users_with_progress:
        total_completions = sum(len(user.get("progress", {}).get("workshops_completed", [])) for user in users_with_progress)
        avg_workshops_completed = total_completions / len(users_with_progress)
    
    return {
        "total_users": total_users,
        "total_conversations": total_conversations,
        "total_donations": total_donations,
        "avg_workshops_completed": round(avg_workshops_completed, 2),
        "ai_usage": dict(metrics.ai_usage),
        "request_metrics": dict(metrics.request_count),
        "error_metrics": dict(metrics.error_count)
    }

# Include payment routes
from app.api.payments import router as payments_router
app.include_router(payments_router)

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Starting One Million Preachers API...")
    try:
        # Test database connection
        await db.command("ping")
        logger.info("✓ Connected to MongoDB")
        
        # Initialize workshops if none exist
        workshop_count = await workshops_collection.count_documents({})
        if workshop_count == 0:
            logger.info("Initializing workshops...")
            from scripts.init_db import init_workshops
            await init_workshops(db)
        
        logger.info("🚀 One Million Preachers API is ready!")
        
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down One Million Preachers API...")
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)