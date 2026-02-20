import os
import json
from typing import Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class AIReviewer:
    def __init__(self):
        # Try to use OpenAI API if key is available, otherwise use mock
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
            self.use_ai = True
        else:
            self.use_ai = False
            print("⚠️  OPENAI_API_KEY not found. Using mock AI reviews.")
    
    def review_code(self, code_changes: str, description: Optional[str] = None) -> str:
        """
        Generate intelligent code review using AI
        """
        if self.use_ai:
            return self._openai_review(code_changes, description)
        else:
            return self._mock_review(code_changes, description)
    
    def _openai_review(self, code_changes: str, description: Optional[str] = None) -> str:
        """
        Use OpenAI API for code review
        """
        prompt = f"""You are an expert code reviewer. Review the following code changes and provide constructive feedback.

PR Description: {description or "No description provided"}

Code Changes:
{code_changes}

Please provide a comprehensive code review covering:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance considerations
4. Security concerns
5. Suggestions for improvement

Format your response in a clear, structured way."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert code reviewer providing constructive feedback."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating AI review: {str(e)}. Falling back to mock review.\n\n{self._mock_review(code_changes, description)}"
    
    def _mock_review(self, code_changes: str, description: Optional[str] = None) -> str:
        """
        Mock AI review for demonstration purposes
        """
        review_points = [
            "✅ Code structure looks good overall",
            "⚠️  Consider adding error handling for edge cases",
            "💡 Suggestion: Extract magic numbers into named constants",
            "🔍 Review: Check for potential null pointer exceptions",
            "📝 Documentation: Add docstrings for complex functions",
            "⚡ Performance: Consider caching if this is called frequently",
            "🔒 Security: Validate all user inputs before processing"
        ]
        
        return "\n".join(review_points) + "\n\n" + "This is a mock AI review. Set OPENAI_API_KEY environment variable for real AI-powered reviews."
