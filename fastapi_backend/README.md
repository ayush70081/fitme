# FastAPI Meal Planner Backend

A FastAPI-based backend service for AI-powered meal planning with nutrition analysis.

## Features

- 🤖 AI-powered meal plan generation using Google Gemini
- 🥗 Nutrition analysis using Google Gemini AI
- 💾 MongoDB integration for data persistence
- ⚡ Redis caching for performance optimization (optional)
- 🔒 JWT authentication and authorization
- 📝 Rate limiting and security features

## Prerequisites

- Python 3.8+
- MongoDB
- Redis (optional, fallback to in-memory cache)
- Google Gemini API key

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd fastapi_backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/fitness_tracker
   GEMINI_API_KEY=your_gemini_api_key_here
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret_here
   JWT_ALGORITHM=HS256
   JWT_EXPIRE_MINUTES=30
   ```

5. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

6. **Start Redis** (optional, if running locally):
   ```bash
   redis-server
   ```

## API Keys Setup

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

## Running the Server

1. **Development mode**:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Production mode**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

The server will start at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Interactive API docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Meal Planning
- `POST /api/mealplan/generate` - Generate daily meal plan
- `GET /api/mealplan/` - Get user's meal plans
- `GET /api/mealplan/{plan_id}` - Get specific meal plan
- `DELETE /api/mealplan/{plan_id}` - Delete meal plan
- `POST /api/mealplan/regenerate/{plan_id}` - Regenerate meal plan
- `POST /api/mealplan/nutrition/analyze` - Analyze nutrition for food items

## Usage Example

### Generate Meal Plan

```python
import requests

# Login first
login_response = requests.post("http://localhost:8000/api/auth/login", json={
    "email": "user@example.com",
    "password": "password"
})
token = login_response.json()["access_token"]

# Generate meal plan
headers = {"Authorization": f"Bearer {token}"}
meal_plan_request = {
    "user_profile": {
        "age": 30,
        "weight": 70,
        "height": 175,
        "gender": "male",
        "activity_level": "moderately_active",
        "fitness_goal": "maintenance",
        "dietary_preferences": ["vegetarian"],
        "allergies": [],
        "disliked_foods": [],
        "preferred_cuisines": ["italian", "mediterranean"]
    },
    "budget_range": "medium",
    "cooking_skill": "intermediate",
    "meal_focus": "balanced",
    "max_prep_time": 30
}

response = requests.post(
    "http://localhost:8000/api/mealplan/generate",
    json=meal_plan_request,
    headers=headers
)

meal_plan = response.json()
print(meal_plan)
```

## Rate Limits

- Meal plan generation: 5 requests per minute
- Nutrition analysis: 30 requests per minute
- Other endpoints: No specific limits (general FastAPI rate limiting applies)

## Caching

- Generated meal plans are cached for 24 hours
- Nutrition data is cached for 24 hours
- Fallback to in-memory cache if Redis is unavailable

## Error Handling

The API returns structured error responses:

```json
{
    "success": false,
    "message": "Error description",
    "detail": "Detailed error information"
}
```

## Testing

Test the Gemini integration:
```bash
python simple_gemini_test.py
```

Run tests (when implemented):
```bash
pytest
```

## Architecture

- **FastAPI**: Modern async web framework
- **Pydantic**: Data validation and serialization
- **Motor**: Async MongoDB driver
- **Google Generative AI**: For meal plan generation and nutrition analysis
- **Redis**: For caching (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.