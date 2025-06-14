from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

class UserProfile(BaseModel):
    ministry_name: Optional[str] = None
    location: Optional[str] = None
    years_in_ministry: Optional[int] = None
    denomination: Optional[str] = None
    congregation_size: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class EnhancedUser(BaseModel):
    id: Optional[str] = Field(alias="_id")
    email: EmailStr
    full_name: str
    password_hash: str
    role: UserRole = UserRole.USER
    profile: Optional[UserProfile] = None
    facebook_id: Optional[str] = None
    email_verified: bool = False
    created_at: datetime
    last_login: Optional[datetime] = None
    preferences: Dict[str, Any] = {}
    progress: Dict[str, Any] = {}

class ConversationMetadata(BaseModel):
    user_satisfaction: Optional[int] = None  # 1-5 rating
    conversation_tags: List[str] = []
    ai_model_used: str = "gpt-4"
    response_time: Optional[float] = None
    token_usage: Optional[int] = None

class EnhancedMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class EnhancedConversation(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    assistant_type: str
    title: Optional[str] = None
    messages: List[EnhancedMessage] = []
    metadata: Optional[ConversationMetadata] = None
    created_at: datetime
    updated_at: datetime
    archived: bool = False

class WorkshopProgress(BaseModel):
    workshop_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    time_spent: Optional[int] = None  # minutes
    completion_percentage: int = 0
    notes: Optional[str] = None
    rating: Optional[int] = None  # 1-5

class DonationRecord(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: Optional[str] = None
    amount: float
    currency: str = "USD"
    payment_method: str  # stripe, paypal
    payment_id: str
    status: str  # pending, completed, failed
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    message: Optional[str] = None
    receipt_url: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None