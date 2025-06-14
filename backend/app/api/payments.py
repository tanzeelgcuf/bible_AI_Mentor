# backend/app/api/payments.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import stripe
import os
import httpx
import json
from datetime import datetime
from bson import ObjectId
from ..core.auth import get_current_user
from ..core.database import donations_collection

router = APIRouter(prefix="/payments", tags=["payments"])

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# PayPal Configuration
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "live")
PAYPAL_BASE_URL = "https://api-m.paypal.com" if PAYPAL_MODE == "live" else "https://api-m.sandbox.paypal.com"

# Pydantic Models
class StripePaymentIntent(BaseModel):
    amount: float
    currency: str = "USD"
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    message: Optional[str] = None

class PayPalOrder(BaseModel):
    amount: float
    currency: str = "USD"
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    message: Optional[str] = None

class PaymentConfirmation(BaseModel):
    payment_id: str
    payment_method: str  # "stripe" or "paypal"
    status: str

# Stripe Payment Endpoints
@router.post("/stripe/create-intent")
async def create_stripe_payment_intent(
    payment_data: StripePaymentIntent,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Create Stripe Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=int(payment_data.amount * 100),  # Convert to cents
            currency=payment_data.currency.lower(),
            metadata={
                "donor_name": payment_data.donor_name or "Anonymous",
                "donor_email": payment_data.donor_email or current_user.get("email", ""),
                "message": payment_data.message or "",
                "user_id": str(current_user["_id"]),
                "platform": "one_million_preachers"
            }
        )
        
        # Save to database
        donation_record = {
            "user_id": ObjectId(current_user["_id"]),
            "payment_intent_id": intent.id,
            "amount": payment_data.amount,
            "currency": payment_data.currency,
            "payment_method": "stripe",
            "status": "pending",
            "donor_name": payment_data.donor_name,
            "donor_email": payment_data.donor_email,
            "message": payment_data.message,
            "created_at": datetime.utcnow()
        }
        
        result = await donations_collection.insert_one(donation_record)
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "donation_id": str(result.inserted_id)
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")

@router.post("/stripe/confirm")
async def confirm_stripe_payment(
    confirmation: PaymentConfirmation,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Retrieve payment intent from Stripe
        intent = stripe.PaymentIntent.retrieve(confirmation.payment_id)
        
        # Update donation record
        await donations_collection.update_one(
            {"payment_intent_id": confirmation.payment_id},
            {
                "$set": {
                    "status": "completed" if intent.status == "succeeded" else "failed",
                    "completed_at": datetime.utcnow(),
                    "stripe_data": {
                        "status": intent.status,
                        "amount_received": intent.amount_received
                    }
                }
            }
        )
        
        return {
            "success": True,
            "status": intent.status,
            "message": "¡Donación procesada exitosamente!" if intent.status == "succeeded" else "Error en el pago"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Confirmation error: {str(e)}")

# PayPal Payment Endpoints
async def get_paypal_access_token():
    """Get PayPal access token for API calls"""
    auth = (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
    headers = {
        "Accept": "application/json",
        "Accept-Language": "en_US",
    }
    data = "grant_type=client_credentials"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_BASE_URL}/v1/oauth2/token",
            headers=headers,
            data=data,
            auth=auth
        )
        
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            raise HTTPException(status_code=400, detail="PayPal authentication failed")

@router.post("/paypal/create-order")
async def create_paypal_order(
    payment_data: PayPalOrder,
    current_user: dict = Depends(get_current_user)
):
    try:
        access_token = await get_paypal_access_token()
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        }
        
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": payment_data.currency,
                    "value": str(payment_data.amount)
                },
                "description": f"Donación para Un Millón de Predicadores - {payment_data.message or 'Apoyo ministerial'}"
            }],
            "application_context": {
                "return_url": "http://localhost:3000/donations/success",
                "cancel_url": "http://localhost:3000/donations/cancel"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PAYPAL_BASE_URL}/v2/checkout/orders",
                headers=headers,
                json=order_data
            )
            
            if response.status_code == 201:
                order = response.json()
                
                # Save to database
                donation_record = {
                    "user_id": ObjectId(current_user["_id"]),
                    "paypal_order_id": order["id"],
                    "amount": payment_data.amount,
                    "currency": payment_data.currency,
                    "payment_method": "paypal",
                    "status": "pending",
                    "donor_name": payment_data.donor_name,
                    "donor_email": payment_data.donor_email,
                    "message": payment_data.message,
                    "created_at": datetime.utcnow()
                }
                
                result = await donations_collection.insert_one(donation_record)
                
                return {
                    "order_id": order["id"],
                    "approval_url": next(link["href"] for link in order["links"] if link["rel"] == "approve"),
                    "donation_id": str(result.inserted_id)
                }
            else:
                raise HTTPException(status_code=400, detail="PayPal order creation failed")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PayPal error: {str(e)}")

@router.post("/paypal/capture-order")
async def capture_paypal_order(
    confirmation: PaymentConfirmation,
    current_user: dict = Depends(get_current_user)
):
    try:
        access_token = await get_paypal_access_token()
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PAYPAL_BASE_URL}/v2/checkout/orders/{confirmation.payment_id}/capture",
                headers=headers
            )
            
            if response.status_code == 201:
                capture_data = response.json()
                
                # Update donation record
                await donations_collection.update_one(
                    {"paypal_order_id": confirmation.payment_id},
                    {
                        "$set": {
                            "status": "completed",
                            "completed_at": datetime.utcnow(),
                            "paypal_data": capture_data
                        }
                    }
                )
                
                return {
                    "success": True,
                    "status": "completed",
                    "message": "¡Donación procesada exitosamente con PayPal!"
                }
            else:
                raise HTTPException(status_code=400, detail="PayPal capture failed")
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PayPal capture error: {str(e)}")

# General Payment Endpoints
@router.get("/donations")
async def get_user_donations(current_user: dict = Depends(get_current_user)):
    """Get all donations made by the current user"""
    try:
        donations = await donations_collection.find(
            {"user_id": ObjectId(current_user["_id"])}
        ).sort("created_at", -1).to_list(100)
        
        return [
            {
                "id": str(donation["_id"]),
                "amount": donation["amount"],
                "currency": donation["currency"],
                "payment_method": donation["payment_method"],
                "status": donation["status"],
                "message": donation.get("message", ""),
                "created_at": donation["created_at"],
                "completed_at": donation.get("completed_at")
            }
            for donation in donations
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching donations: {str(e)}")

@router.get("/donation/{donation_id}")
async def get_donation_details(
    donation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific donation details"""
    try:
        donation = await donations_collection.find_one({
            "_id": ObjectId(donation_id),
            "user_id": ObjectId(current_user["_id"])
        })
        
        if not donation:
            raise HTTPException(status_code=404, detail="Donation not found")
        
        return {
            "id": str(donation["_id"]),
            "amount": donation["amount"],
            "currency": donation["currency"],
            "payment_method": donation["payment_method"],
            "status": donation["status"],
            "donor_name": donation.get("donor_name"),
            "message": donation.get("message", ""),
            "created_at": donation["created_at"],
            "completed_at": donation.get("completed_at")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching donation: {str(e)}")