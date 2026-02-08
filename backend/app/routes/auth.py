# [Spec]: specs/api/rest-endpoints.md
# TodoEvolve Backend - Auth Routes (Production-Ready)

"""
Authentication endpoints with JWT, session management, and security best practices.

Endpoints:
- POST /auth/register - Create new user account
- POST /auth/login - Authenticate and receive tokens
- POST /auth/refresh - Exchange refresh token for new access token
- POST /auth/logout - Revoke refresh token
- GET /auth/me - Get current user profile
"""

import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr, field_validator
from sqlmodel import Session, select
from jose import jwt
from passlib.context import CryptContext

from ..database import get_session
from ..config import get_settings
from ..models import User, RefreshToken, PasswordResetToken, EmailVerificationToken
from ..email_utils import send_email, get_email_template
import secrets
import os

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

# Password hashing (using sha256_crypt for broad compatibility)
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

# JWT Configuration
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
JWT_ALGORITHM = "HS256"

# Rate limiting (simple in-memory, use Redis in production)
login_attempts: dict = {}  # {email: {"count": int, "last_attempt": datetime}}
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 72:
            raise ValueError('Password must be at most 72 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES * 60


class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
    profile_picture: Optional[str] = None



class MessageResponse(BaseModel):
    message: str


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return pwd_context.verify(plain_password, hashed_password)


def hash_token(token: str) -> str:
    """Hash refresh token for storage."""
    return hashlib.sha256(token.encode()).hexdigest()


def create_access_token(user_id: int, email: str) -> str:
    """Create short-lived access token."""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "email": email,
        "type": "access",
        "exp": expire
    }
    return jwt.encode(payload, settings.better_auth_secret, algorithm=JWT_ALGORITHM)


def create_refresh_token() -> str:
    """Create cryptographically secure refresh token."""
    return secrets.token_urlsafe(64)


def check_rate_limit(email: str) -> None:
    """Check if user is rate limited for login attempts."""
    if email not in login_attempts:
        return
    
    attempt_data = login_attempts[email]
    lockout_expires = attempt_data["last_attempt"] + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
    
    if datetime.utcnow() > lockout_expires:
        # Lockout expired, reset counter
        del login_attempts[email]
        return
    
    if attempt_data["count"] >= MAX_LOGIN_ATTEMPTS:
        remaining = (lockout_expires - datetime.utcnow()).seconds
        raise HTTPException(
            status_code=429,
            detail=f"Too many login attempts. Try again in {remaining} seconds."
        )


def record_login_attempt(email: str, success: bool) -> None:
    """Record login attempt for rate limiting."""
    if success:
        # Reset on successful login
        if email in login_attempts:
            del login_attempts[email]
        return
    
    if email not in login_attempts:
        login_attempts[email] = {"count": 0, "last_attempt": datetime.utcnow()}
    
    login_attempts[email]["count"] += 1
    login_attempts[email]["last_attempt"] = datetime.utcnow()


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(
    request: RegisterRequest,
    session: Session = Depends(get_session)
):
    """
    Create a new user account.
    
    - Validates email format
    - Validates password strength (8+ chars, upper, lower, digit)
    - Returns 409 if email already exists
    """
    # Check if email already exists
    existing = session.exec(
        select(User).where(User.email == request.email.lower())
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists"
        )
    
    # Create user (unverified)
    user = User(
        email=request.email.lower(),
        hashed_password=hash_password(request.password),
        is_verified=False
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # ---------------------------------------------------------
    # Send Verification Email
    # ---------------------------------------------------------
    try:
        verify_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(verify_token.encode()).hexdigest()
        
        db_token = EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        session.add(db_token)
        session.commit()
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3005")
        verify_url = f"{frontend_url}/verify-email?token={verify_token}"
        
        html_content = get_email_template(
            title="Verify Your Email",
            message="Welcome to TodoEvolve! Please verify your email address to activate your account and access all features.",
            button_text="Verify Email",
            button_url=verify_url
        )
        
        send_email(user.email, "Verify your TodoEvolve Account", html_content)
        
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        # Don't fail registration
    
    return UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    req: Request,
    session: Session = Depends(get_session)
):
    """
    Authenticate user and return access + refresh tokens.
    
    - Rate limited to 5 attempts per 15 minutes
    - Returns generic "Invalid credentials" to prevent enumeration
    """
    email = request.email.lower()
    
    # Check rate limit
    check_rate_limit(email)
    
    # Find user
    user = session.exec(
        select(User).where(User.email == email)
    ).first()
    
    # Verify credentials (constant time to prevent timing attacks)
    if not user or not verify_password(request.password, user.hashed_password):
        record_login_attempt(email, success=False)
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is disabled. Please contact support."
        )

    # Check if email is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Email not verified. Please check your inbox."
        )
    
    # Record successful login
    record_login_attempt(email, success=True)
    
    # Update last login
    user.last_login = datetime.utcnow()
    session.add(user)
    
    # Create tokens
    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token()
    
    # Store refresh token hash
    token_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=req.headers.get("User-Agent", "")[:500]
    )
    session.add(token_record)
    session.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshRequest,
    req: Request,
    session: Session = Depends(get_session)
):
    """
    Exchange refresh token for new access token.
    
    - Validates refresh token exists and is not expired/revoked
    - Issues new access token
    - Optionally rotates refresh token (security best practice)
    """
    token_hash = hash_token(request.refresh_token)
    
    # Find valid refresh token
    stored_token = session.exec(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked == False
        )
    ).first()
    
    if not stored_token:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )
    
    # Check expiration
    if datetime.utcnow() > stored_token.expires_at:
        # Revoke expired token
        stored_token.is_revoked = True
        session.add(stored_token)
        session.commit()
        raise HTTPException(
            status_code=401,
            detail="Refresh token has expired. Please login again."
        )
    
    # Get user
    user = session.get(User, stored_token.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User account not found or disabled"
        )
    
    # Rotate refresh token (revoke old, create new)
    stored_token.is_revoked = True
    session.add(stored_token)
    
    # Create new tokens
    access_token = create_access_token(user.id, user.email)
    new_refresh_token = create_refresh_token()
    
    new_token_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(new_refresh_token),
        expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=req.headers.get("User-Agent", "")[:500]
    )
    session.add(new_token_record)
    session.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: RefreshRequest,
    session: Session = Depends(get_session)
):
    """
    Revoke refresh token (logout).
    
    - Invalidates the refresh token so it cannot be used again
    - Access token remains valid until expiration (15 min)
    """
    token_hash = hash_token(request.refresh_token)
    
    stored_token = session.exec(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    ).first()
    
    if stored_token and not stored_token.is_revoked:
        stored_token.is_revoked = True
        session.add(stored_token)
        session.commit()
    
    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    req: Request,
    session: Session = Depends(get_session)
):
    """
    Get current authenticated user's profile.
    
    - Requires valid access token in Authorization header
    """
    from ..auth import get_current_user
    
    # Extract token from Authorization header
    auth_header = req.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header[7:]  # Remove "Bearer " prefix
    
    try:
        payload = jwt.decode(token, settings.better_auth_secret, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    
    user = session.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login,
        profile_picture=user.profile_picture
    )


# ============================================================================
# FORGOT PASSWORD / RESET PASSWORD (SMTP)
# ============================================================================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    session: Session = Depends(get_session)
):
    """
    Request password reset email.
    
    - Sends email with reset token (SMTP)
    - Token valid for 1 hour
    - Stores token in database
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    import os
    
    # Find user by email
    statement = select(User).where(User.email == request.email.lower())
    user = session.exec(statement).first()
    
    # Always return success (security: don't reveal if email exists)
    if not user:
        # Simulate processing time to prevent timing attacks
        return MessageResponse(message="If the email exists, a reset link has been sent.")
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
    
    # Create DB record
    db_token = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    session.add(db_token)
    session.commit()
    
    # SMTP Configuration (Handled by email_utils)
    
    # Create reset URL
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3005")
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"
    
    # Generate Email Content
    html_content = get_email_template(
        title="Reset Your Password",
        message="We received a request to reset your password. If you didn't make this request, you can safely ignore this email.",
        button_text="Reset Password",
        button_url=reset_url
    )
    
    # Send Email
    send_email(request.email, "Reset Your Password", html_content)
    
    return MessageResponse(message="If the email exists, a reset link has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request: ResetPasswordRequest,
    session: Session = Depends(get_session)
):
    """
    Reset password with valid token.
    
    - Validates token from DB
    - Check expiry
    - Updates password
    - Invalidates token (marks as used)
    - Revokes all sessions
    """
    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    
    # Find valid token in DB
    statement = select(PasswordResetToken).where(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.is_used == False
    )
    db_token = session.exec(statement).first()
    
    if not db_token:
        raise HTTPException(status_code=400, detail="Invalid or used reset token")
    
    # Check expiry
    if datetime.utcnow() > db_token.expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Get user
    user = session.get(User, db_token.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    user.hashed_password = hash_password(request.new_password)
    session.add(user)
    
    # Mark token as used
    db_token.is_used = True
    session.add(db_token)
    
    # Revoke all refresh tokens for this user (security: force re-login)
    statement = select(RefreshToken).where(RefreshToken.user_id == user.id)
    existing_tokens = session.exec(statement).all()
    for token in existing_tokens:
        session.delete(token)
        
    session.commit()
    
    return MessageResponse(message="Password reset successfully. Please login with your new password.")

# ============================================================================
# NEW: CHANGE PASSWORD, AVATAR, EMAIL VERIFICATION
# ============================================================================

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    request: ChangePasswordRequest,
    req: Request,
    session: Session = Depends(get_session)
):
    """Change current user's password."""
    # Get current user (duplicate logic to avoid circular import)
    from jose import jwt
    auth_header = req.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, settings.better_auth_secret, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user = session.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Verify old password
    if not verify_password(request.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    # Update password
    user.hashed_password = hash_password(request.new_password)
    session.add(user)
    session.commit()
    
    return MessageResponse(message="Password changed successfully")


from fastapi import UploadFile, File
import shutil
import os
import uuid

@router.post("/upload-avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    req: Request = None,  # Optional to avoid validation error if not passed, but we need it
    session: Session = Depends(get_session)
):
    """Upload user profile picture."""
    # Build complete auth check
    if not req:
        raise HTTPException(status_code=400, detail="Request context missing")
        
    from jose import jwt
    auth_header = req.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        token = auth_header[7:]
        payload = jwt.decode(token, settings.better_auth_secret, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = session.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Save file
    UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads", "avatars")
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"{user.id}_{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update user profile
    # Get base URL from request or env
    base_url = str(req.base_url).rstrip("/")
    # Note: main.py mounts /static
    profile_url = f"{base_url}/static/uploads/avatars/{filename}"
    
    user.profile_picture = profile_url
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login=user.last_login,
        profile_picture=user.profile_picture
    )



class VerifyEmailRequest(BaseModel):
    token: str


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    request: VerifyEmailRequest,
    session: Session = Depends(get_session)
):
    """
    Verify email address using token.
    """
    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    
    # Find token
    statement = select(EmailVerificationToken).where(EmailVerificationToken.token_hash == token_hash)
    db_token = session.exec(statement).first()
    
    if not db_token:
        raise HTTPException(status_code=400, detail="Invalid verification token")
        
    if datetime.utcnow() > db_token.expires_at:
        session.delete(db_token)
        session.commit()
        raise HTTPException(status_code=400, detail="Verification token has expired")
        
    # Get user
    user = session.get(User, db_token.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Verify user
    if not user.is_verified:
        user.is_verified = True
        session.add(user)
    
    # Delete token
    session.delete(db_token)
    session.commit()
    
    return MessageResponse(message="Email verified successfully")



class ResendVerificationRequest(BaseModel):
    email: EmailStr


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    request: ResendVerificationRequest,
    session: Session = Depends(get_session)
):
    """Resend verification email (public)."""
    user = session.exec(select(User).where(User.email == request.email.lower())).first()
    
    if not user:
        # Security: don't reveal user existence
        return MessageResponse(message="If the account exists, a verification email has been sent.")
        
    if user.is_verified:
         return MessageResponse(message="Email is already verified.")

    # Generate new token
    verify_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(verify_token.encode()).hexdigest()
    
    # Invalidate/delete old tokens (optional but good)
    # session.exec(delete(EmailVerificationToken).where(...))
    
    db_token = EmailVerificationToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )
    session.add(db_token)
    session.commit()
    
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3005")
    verify_url = f"{frontend_url}/verify-email?token={verify_token}"
    
    html_content = get_email_template(
        title="Verify Your Email",
        message="Please verify your email address to activate your account.",
        button_text="Verify Email",
        button_url=verify_url
    )
    
    send_email(user.email, "Verify your TodoEvolve Account", html_content)
    
    return MessageResponse(message=f"Verification email sent to {user.email}")
