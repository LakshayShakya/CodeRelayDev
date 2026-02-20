from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str

# PR schemas
class PRBase(BaseModel):
    title: str
    description: Optional[str] = None
    code_changes: str

class PRCreate(PRBase):
    pass

class PRUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    code_changes: Optional[str] = None
    status: Optional[str] = None

class PRResponse(PRBase):
    id: int
    status: str
    author_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Review schemas
class ReviewBase(BaseModel):
    status: str
    feedback: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseModel):
    status: Optional[str] = None
    feedback: Optional[str] = None

class ReviewResponse(ReviewBase):
    id: int
    pr_id: int
    reviewer_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Comment schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    pr_id: int
    author_id: int
    is_ai_generated: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
