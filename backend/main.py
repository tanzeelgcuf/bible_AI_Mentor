# backend/main.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import openai
import os
from bson import ObjectId
import asyncio

# Environment variables
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "one_million_preachers")
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

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
openai.api_key = OPENAI_API_KEY

# Database connection
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db.users
conversations_collection = db.conversations
workshops_collection = db.workshops
donations_collection = db.donations

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    facebook_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

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

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user

# AI Assistant Prompts
AI_PROMPTS = {
    "bible_mentor": """Eres un mentor bíblico experimentado que ayuda a predicadores hispanos. 
    Proporciona orientación basada en las Escrituras, interpretación bíblica culturalmente relevante, 
    y consejos pastorales sabios. Responde siempre en español con un tono cálido y pastoral.""",
    
    "sermon_coach": """Eres un entrenador de sermones especializado en ayudar a predicadores hispanos. 
    Ayuda con la estructura del sermón, técnicas de comunicación, engagement de la audiencia, 
    y adaptación cultural. Proporciona consejos prácticos y ejemplos específicos. Responde en español.""",
    
    "exegesis_guide": """Eres un guía de exégesis bíblica que ayuda con el análisis profundo de textos bíblicos. 
    Proporciona contexto histórico, análisis del idioma original, insights teológicos, 
    y aplicaciones prácticas. Mantén rigor académico pero accesible. Responde en español."""
}

# API Routes

@app.get("/")
async def root():
    return {"message": "Bienvenido a Un Millón de Predicadores API"}

# Authentication endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
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
        "preferences": {
            "language": "es",
            "notifications": True
        }
    }
    
    result = await users_collection.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    # Find user
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
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
    
    return {"access_token": access_token, "token_type": "bearer"}

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
    try:
        # Get conversation history
        conversation = await conversations_collection.find_one({
            "user_id": ObjectId(current_user["_id"]),
            "assistant_type": message_request.assistant_type
        })
        
        # Prepare messages for OpenAI
        messages = [{"role": "system", "content": AI_PROMPTS[message_request.assistant_type]}]
        
        if conversation and conversation.get("messages"):
            # Add conversation history
            for msg in conversation["messages"][-10:]:  # Last 10 messages for context
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
            max_tokens=1000,
            temperature=0.7
        )
        
        assistant_response = response.choices[0].message.content
        
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
        
        return {"response": assistant_response}
        
    except Exception as e:
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
            resources=workshop.get("resources", [])
        ) for workshop in workshops
    ]

@app.get("/api/workshops/{workshop_id}", response_model=Workshop)
async def get_workshop(workshop_id: str, current_user: dict = Depends(get_current_user)):
    workshop = await workshops_collection.find_one({"_id": ObjectId(workshop_id)})
    if not workshop:
        raise HTTPException(status_code=404, detail="Workshop not found")
    
    return Workshop(
        id=str(workshop["_id"]),
        title=workshop["title"],
        description=workshop["description"],
        content=workshop["content"],
        order=workshop["order"],
        duration_minutes=workshop["duration_minutes"],
        resources=workshop.get("resources", [])
    )

# Donations endpoint
@app.post("/api/donations")
async def create_donation(donation: DonationRequest):
    # In a real implementation, integrate with PayPal/Stripe
    donation_record = {
        "amount": donation.amount,
        "currency": donation.currency,
        "donor_name": donation.donor_name,
        "donor_email": donation.donor_email,
        "message": donation.message,
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    result = await donations_collection.insert_one(donation_record)
    
    return {
        "message": "Donación registrada exitosamente",
        "donation_id": str(result.inserted_id)
    }

# PDF Export endpoint
@app.get("/api/export/conversation/{conversation_id}")
async def export_conversation_pdf(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    # This would integrate with a PDF generation library
    # For now, return a placeholder response
    return {
        "message": "PDF export functionality - implement with reportlab or weasyprint",
        "download_url": f"/api/downloads/{conversation_id}.pdf"
    }

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)