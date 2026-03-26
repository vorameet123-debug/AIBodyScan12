"""
OpenAPI/Swagger Documentation Configuration

Configures FastAPI's built-in OpenAPI documentation with:
- Custom API metadata
- Security schemes
- Tag descriptions
- Enhanced Swagger UI

Usage:
    from api.openapi_config import configure_openapi
    configure_openapi(app)
"""
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

# API Metadata
API_TITLE = "AIBodyScan API"
API_VERSION = "1.2.0"
API_DESCRIPTION = """
## AI-Powered Body Measurement & Fashion Intelligence

AIBodyScan API provides endpoints for:

* 📸 **Body Scanning** - AI-powered body measurements from photos
* 👔 **Wardrobe Management** - Track and analyze your clothing
* 🎨 **Fashion Intelligence** - Style recommendations and trend analysis
* 💳 **Subscriptions** - Premium feature access via Razorpay

### Authentication

Most endpoints require a Bearer token:

```
Authorization: Bearer <your_token>
```

Get a token via `/api/v1/auth/login` or `/api/v1/auth/register`.

### Rate Limits

| User Type | Limit |
|-----------|-------|
| Anonymous | 20/min |
| Authenticated | 100/min |
| Premium | 500/min |

### Need Help?

- 📧 Email: aibodyscan123@gmail.com
- 📖 Docs: https://docs.aibodyscan.com
"""

# Tag descriptions for grouping endpoints
TAGS_METADATA = [
    {
        "name": "Authentication",
        "description": "User registration, login, and token management.",
    },
    {
        "name": "Body",
        "description": "Body measurement processing and history.",
    },
    {
        "name": "Wardrobe",
        "description": "Clothing item management and analysis.",
    },
    {
        "name": "Fashion",
        "description": "Fashion intelligence, trends, and recommendations.",
    },
    {
        "name": "Payments",
        "description": "Subscription and payment processing via Razorpay.",
    },
    {
        "name": "User",
        "description": "User profile and account management.",
    },
    {
        "name": "Health",
        "description": "Service health and readiness endpoints.",
    },
]


def custom_openapi(app: FastAPI):
    """Generate custom OpenAPI schema."""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=API_TITLE,
        version=API_VERSION,
        description=API_DESCRIPTION,
        routes=app.routes,
        tags=TAGS_METADATA,
    )
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token from /auth/login",
        },
        "APIKeyAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "API key for server-to-server communication",
        },
    }
    
    # Add server URLs
    openapi_schema["servers"] = [
        {"url": "http://localhost:8000", "description": "Development"},
        {"url": "https://staging-api.aibodyscan.com", "description": "Staging"},
        {"url": "https://api.aibodyscan.com", "description": "Production"},
    ]
    
    # Add contact and license info
    openapi_schema["info"]["contact"] = {
        "name": "AIBodyScan Support",
        "email": "aibodyscan123@gmail.com",
        "url": "https://aibodyscan.com",
    }
    
    openapi_schema["info"]["license"] = {
        "name": "Proprietary",
        "url": "https://aibodyscan.com/terms",
    }
    
    # Add external docs link
    openapi_schema["externalDocs"] = {
        "description": "Full Documentation",
        "url": "https://docs.aibodyscan.com",
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


def configure_openapi(app: FastAPI) -> None:
    """
    Configure OpenAPI documentation for the app.
    
    Usage:
        app = FastAPI()
        configure_openapi(app)
    """
    # Override OpenAPI schema generation
    app.openapi = lambda: custom_openapi(app)
    
    # Configure Swagger UI
    app.docs_url = "/docs"
    app.redoc_url = "/redoc"
    app.openapi_url = "/openapi.json"
    
    # Custom Swagger UI options (if needed)
    # These are set in the FastAPI constructor, but noted here for reference:
    # swagger_ui_parameters = {
    #     "deepLinking": True,
    #     "persistAuthorization": True,
    #     "displayRequestDuration": True,
    # }


# Version info for headers
def get_api_version() -> dict:
    """Get API version info for response headers."""
    return {
        "version": API_VERSION,
        "title": API_TITLE,
    }
