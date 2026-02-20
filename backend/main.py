from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn

from database import SessionLocal, engine, Base
from models import User, PullRequest, Review, Comment
from schemas import (
    UserCreate, UserResponse, Token,
    PRCreate, PRResponse, PRUpdate,
    ReviewCreate, ReviewResponse, ReviewUpdate,
    CommentCreate, CommentResponse
)
from auth import get_current_user, create_access_token, verify_password, get_password_hash
from ai_reviewer import AIReviewer

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intelligent PR & Code Review System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize AI Reviewer
ai_reviewer = AIReviewer()

# Authentication endpoints
@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Pull Request endpoints
@app.post("/prs", response_model=PRResponse)
def create_pr(pr: PRCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_pr = PullRequest(
        title=pr.title,
        description=pr.description,
        code_changes=pr.code_changes,
        author_id=current_user.id,
        status="open"
    )
    db.add(db_pr)
    db.commit()
    db.refresh(db_pr)
    
    # Generate AI review automatically
    ai_review = ai_reviewer.review_code(pr.code_changes, pr.description)
    
    # Create AI review comment
    ai_comment = Comment(
        content=f"🤖 AI Review:\n\n{ai_review}",
        pr_id=db_pr.id,
        author_id=current_user.id,  # System user or current user
        is_ai_generated=True
    )
    db.add(ai_comment)
    db.commit()
    
    return db_pr

@app.get("/prs", response_model=List[PRResponse])
def list_prs(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(PullRequest)
    
    # Developers see their own PRs, reviewers see all
    if current_user.role == "developer":
        query = query.filter(PullRequest.author_id == current_user.id)
    
    if status:
        query = query.filter(PullRequest.status == status)
    
    prs = query.offset(skip).limit(limit).all()
    return prs

@app.get("/prs/{pr_id}", response_model=PRResponse)
def get_pr(pr_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    
    # Developers can only see their own PRs
    if current_user.role == "developer" and pr.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return pr

@app.put("/prs/{pr_id}", response_model=PRResponse)
def update_pr(
    pr_id: int,
    pr_update: PRUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    
    # Only author can update
    if pr.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if pr_update.title:
        pr.title = pr_update.title
    if pr_update.description:
        pr.description = pr_update.description
    if pr_update.code_changes:
        pr.code_changes = pr_update.code_changes
    if pr_update.status:
        pr.status = pr_update.status
    
    db.commit()
    db.refresh(pr)
    return pr

# Review endpoints
@app.post("/prs/{pr_id}/reviews", response_model=ReviewResponse)
def create_review(
    pr_id: int,
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "reviewer":
        raise HTTPException(status_code=403, detail="Only reviewers can create reviews")
    
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    
    # Check if reviewer already reviewed
    existing_review = db.query(Review).filter(
        Review.pr_id == pr_id,
        Review.reviewer_id == current_user.id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this PR")
    
    db_review = Review(
        pr_id=pr_id,
        reviewer_id=current_user.id,
        status=review.status,
        feedback=review.feedback
    )
    db.add(db_review)
    
    # Update PR status based on review
    if review.status == "approved":
        # Check if all reviews are approved
        all_reviews = db.query(Review).filter(Review.pr_id == pr_id).all()
        if all(r.status == "approved" for r in all_reviews):
            pr.status = "merged"
    elif review.status == "rejected":
        pr.status = "rejected"
    
    db.commit()
    db.refresh(db_review)
    return db_review

@app.get("/prs/{pr_id}/reviews", response_model=List[ReviewResponse])
def list_reviews(pr_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    
    reviews = db.query(Review).filter(Review.pr_id == pr_id).all()
    return reviews

# Comment endpoints
@app.post("/prs/{pr_id}/comments", response_model=CommentResponse)
def create_comment(
    pr_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    
    db_comment = Comment(
        content=comment.content,
        pr_id=pr_id,
        author_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@app.get("/prs/{pr_id}/comments", response_model=List[CommentResponse])
def list_comments(pr_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    
    comments = db.query(Comment).filter(Comment.pr_id == pr_id).all()
    return comments

# AI Review endpoint
@app.post("/prs/{pr_id}/ai-review")
def get_ai_review(pr_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
    
    ai_review = ai_reviewer.review_code(pr.code_changes, pr.description)
    return {"review": ai_review}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
