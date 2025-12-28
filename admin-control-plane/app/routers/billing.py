"""
Billing Router
Manages subscription plans, invoices, and payment methods
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from app.middleware.auth import get_current_user
from app.services.firebase_service import _initialize_firebase
from firebase_admin import firestore
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class PlanInfo(BaseModel):
    """Subscription plan information"""
    name: str
    price: float
    annual_price: float
    description: str
    features: List[str]
    popular: bool = False


class InvoiceInfo(BaseModel):
    """Invoice information"""
    id: str
    date: str
    amount: float
    status: str
    download_url: Optional[str] = None


class PaymentMethodInfo(BaseModel):
    """Payment method information"""
    type: str
    last4: str
    expiry_month: int
    expiry_year: int
    verified: bool = False


class CurrentPlanInfo(BaseModel):
    """Current subscription plan"""
    name: str
    price: float
    billing_cycle: str
    renewal_date: str
    features: List[str]


@router.get("/plans", response_model=List[PlanInfo])
async def list_plans(
    current_user: dict = Depends(get_current_user)
):
    """List all available subscription plans"""
    # For now, return static plans. In production, this would come from a database
    plans = [
        PlanInfo(
            name="Starter",
            price=99.0,
            annual_price=990.0,
            description="Perfect for small teams getting started with compliance",
            features=[
                "50 documents/month",
                "1,000 API calls/month",
                "1 API key",
                "3 team members",
                "3 frameworks",
                "Email support",
            ],
            popular=False
        ),
        PlanInfo(
            name="Professional",
            price=299.0,
            annual_price=2990.0,
            description="For growing teams with advanced compliance needs",
            features=[
                "200 documents/month",
                "10,000 API calls/month",
                "5 API keys",
                "10 team members",
                "10 frameworks",
                "Priority support",
                "Google Drive integration",
                "SharePoint integration",
            ],
            popular=True
        ),
        PlanInfo(
            name="Enterprise",
            price=999.0,
            annual_price=9990.0,
            description="For large organizations with complex compliance requirements",
            features=[
                "Unlimited documents",
                "Unlimited API calls",
                "Unlimited API keys",
                "Unlimited team members",
                "All 23 frameworks",
                "24/7 priority support",
                "All integrations",
                "Custom compliance frameworks",
                "Dedicated account manager",
                "SLA guarantee",
            ],
            popular=False
        ),
    ]
    return plans


@router.get("/current-plan", response_model=CurrentPlanInfo)
async def get_current_plan(
    current_user: dict = Depends(get_current_user)
):
    """Get current subscription plan for the user"""
    try:
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        db = firestore.client()
        user_id = current_user.get('user_id')
        
        # Get user's subscription from Firestore
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        data = user_doc.to_dict()
        plan_name = data.get('subscription_plan', 'Starter')
        
        # Default plan info
        plan_info = {
            'Starter': {
                'price': 99.0,
                'features': [
                    '50 documents per month',
                    '1,000 API calls per month',
                    '1 API key',
                    '3 team members',
                    '3 frameworks (LGPD, ISO 27001, HIPAA)',
                    '100 chat messages per month',
                    'Email support',
                ]
            },
            'Professional': {
                'price': 299.0,
                'features': [
                    '200 documents per month',
                    '10,000 API calls per month',
                    '5 API keys',
                    '10 team members',
                    '10 frameworks',
                    'Priority support',
                    'Google Drive integration',
                    'SharePoint integration',
                ]
            },
            'Enterprise': {
                'price': 999.0,
                'features': [
                    'Unlimited documents',
                    'Unlimited API calls',
                    'Unlimited API keys',
                    'Unlimited team members',
                    'All 23 frameworks',
                    '24/7 priority support',
                    'All integrations',
                    'Custom compliance frameworks',
                    'Dedicated account manager',
                    'SLA guarantee',
                ]
            }
        }
        
        plan_data = plan_info.get(plan_name, plan_info['Starter'])
        renewal_date = data.get('subscription_renewal_date', '2024-02-15')
        
        return CurrentPlanInfo(
            name=plan_name,
            price=plan_data['price'],
            billing_cycle='monthly',
            renewal_date=renewal_date,
            features=plan_data['features']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current plan: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/invoices", response_model=List[InvoiceInfo])
async def list_invoices(
    current_user: dict = Depends(get_current_user)
):
    """List invoices for the current user"""
    try:
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        db = firestore.client()
        user_id = current_user.get('user_id')
        
        # Query invoices from Firestore
        invoices_ref = db.collection('invoices').where('user_id', '==', user_id).order_by('date', direction=firestore.Query.DESCENDING).limit(10)
        docs = invoices_ref.stream()
        
        invoices = []
        for doc in docs:
            data = doc.to_dict()
            invoices.append(InvoiceInfo(
                id=doc.id,
                date=data.get('date', ''),
                amount=data.get('amount', 0.0),
                status=data.get('status', 'paid'),
                download_url=data.get('download_url')
            ))
        
        # If no invoices, return empty list (in production, this would be populated)
        return invoices
        
    except Exception as e:
        logger.error(f"Error listing invoices: {e}", exc_info=True)
        return []


@router.get("/payment-method", response_model=PaymentMethodInfo)
async def get_payment_method(
    current_user: dict = Depends(get_current_user)
):
    """Get current payment method"""
    try:
        if not _initialize_firebase():
            raise HTTPException(status_code=500, detail="Firebase not initialized")
        
        db = firestore.client()
        user_id = current_user.get('user_id')
        
        # Get payment method from Firestore
        payment_ref = db.collection('payment_methods').where('user_id', '==', user_id).limit(1)
        docs = payment_ref.stream()
        
        for doc in docs:
            data = doc.to_dict()
            return PaymentMethodInfo(
                type=data.get('type', 'card'),
                last4=data.get('last4', '4242'),
                expiry_month=data.get('expiry_month', 12),
                expiry_year=data.get('expiry_year', 2025),
                verified=data.get('verified', True)
            )
        
        # Default if no payment method found
        return PaymentMethodInfo(
            type='card',
            last4='4242',
            expiry_month=12,
            expiry_year=2025,
            verified=True
        )
        
    except Exception as e:
        logger.error(f"Error getting payment method: {e}", exc_info=True)
        return PaymentMethodInfo(
            type='card',
            last4='4242',
            expiry_month=12,
            expiry_year=2025,
            verified=True
        )

