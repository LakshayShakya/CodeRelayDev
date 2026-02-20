from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class UserRole(str, enum.Enum):
    DEVELOPER = "developer"
    REVIEWER = "reviewer"

class PRStatus(str, enum.Enum):
    OPEN = "open"
    REVIEWING = "reviewing"
    APPROVED = "approved"
    REJECTED = "rejected"
    MERGED = "merged"

class ReviewStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CHANGES_REQUESTED = "changes_requested"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "developer" or "reviewer"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    authored_prs = relationship("PullRequest", back_populates="author", foreign_keys="PullRequest.author_id")
    reviews = relationship("Review", back_populates="reviewer")
    comments = relationship("Comment", back_populates="author")

class PullRequest(Base):
    __tablename__ = "pull_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    code_changes = Column(Text, nullable=False)  # JSON string or diff
    status = Column(String, default="open")
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author = relationship("User", back_populates="authored_prs", foreign_keys=[author_id])
    reviews = relationship("Review", back_populates="pr", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="pr", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    pr_id = Column(Integer, ForeignKey("pull_requests.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False)  # "approved", "rejected", "changes_requested"
    feedback = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    pr = relationship("PullRequest", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    pr_id = Column(Integer, ForeignKey("pull_requests.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    pr = relationship("PullRequest", back_populates="comments")
    author = relationship("User", back_populates="comments")
