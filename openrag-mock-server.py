#!/usr/bin/env python3
"""
Simple OpenRAG mock service for development.
This simulates the OpenRAG API without requiring Docker/Podman.
Uses local LLM via OpenRouter for actual AI responses.
"""

import asyncio
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import re
from typing import Dict, Any
import random

# Mock industry knowledge base
INDUSTRY_KNOWLEDGE = {
    "landscaping": {
        "pricing": {
            "sod": 0.45,
            "mulch_per_yard": 30,
            "general_labor_hourly": 30,
            "skilled_labor_hourly": 50,
            "markup_standard": 0.25,
            "emergency_markup": 0.50
        },
        "best_practices": [
            "Always measure twice before ordering materials",
            "Include 10% contingency for unexpected issues",
            "Use native plants for sustainability",
            "Provide detailed breakdown of labor vs materials"
        ],
        "regulations": [
            "Check local zoning laws for hardscaping",
            "Utility marking required 48 hours before digging",
            "Water conservation guidelines in drought-prone areas"
        ]
    },
    "plumbing": {
        "pricing": {
            "hourly_rate": 75,
            "trip_charge": 50,
            "emergency_rate": 120,
            "fixture_installation": 150
        },
        "best_practices": [
            "Check local code requirements before starting",
            "Test all connections before closing walls",
            "Provide warranty on workmanship"
        ],
        "regulations": [
            "Licensed plumber required for gas lines",
            "Permit required for new plumbing installations",
            "Backflow prevention devices required in some areas"
        ]
    },
    "hvac": {
        "pricing": {
            "service_call": 80,
            "hourly_rate": 100,
            "installation_per_ton": 3000
        },
        "best_practices": [
            "Size system properly using Manual J calculations",
            "Seal ductwork properly for efficiency",
            "Regular maintenance extends system life"
        ],
        "regulations": [
            "EPA certification required for refrigerant handling",
            "Permits required for new installations",
            "SEER minimums vary by region"
        ]
    },
    "electrical": {
        "pricing": {
            "hourly_rate": 85,
            "service_call": 75,
            "outlet_installation": 150,
            "panel_upgrade": 2000
        },
        "best_practices": [
            "Always follow NEC code requirements",
            "GFCI protection required for outdoor/wet areas",
            "Permits required for most electrical work"
        ],
        "regulations": [
            "Licensed electrician required for panel work",
            "Inspection required before closing walls",
            "Arc fault protection required in bedrooms"
        ]
    }
}

class MockOpenRAGHandler(BaseHTTPRequestHandler):
    """HTTP handler for mock OpenRAG API."""
    
    def do_GET(self):
        """Handle GET requests."""
        if self.path == "/health":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "healthy",
                "version": "1.0.0-mock",
                "services": ["chat", "documents", "search"]
            }).encode())
        elif self.path.startswith("/knowledge/"):
            industry = self.path.split("/")[-1]
            self.handle_knowledge_request(industry)
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        """Handle POST requests."""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            data = {}
        
        if self.path == "/api/v1/chat":
            self.handle_chat(data)
        elif self.path == "/api/v1/documents/upload":
            self.handle_document_upload(data)
        elif self.path == "/api/v1/extract":
            self.handle_extraction(data)
        elif self.path == "/api/v1/suggest":
            self.handle_suggestions(data)
        elif self.path == "/api/v1/search":
            self.handle_search(data)
        else:
            self.send_response(404)
            self.end_headers()
    
    def handle_chat(self, data: Dict[str, Any]):
        """Handle chat requests."""
        message = data.get('message', '')
        context = data.get('context', {})
        industry = context.get('industry', 'landscaping')
        
        # Generate response based on message content
        response = self.generate_chat_response(message, industry)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
            "response": response,
            "conversation_id": f"conv_{random.randint(1000, 9999)}",
            "model": "openrag-mock-v1",
            "suggestions": self.generate_suggestions(message, industry),
            "follow_up_questions": self.generate_follow_up_questions(message, industry)
        }).encode())
    
    def handle_document_upload(self, data: Dict[str, Any]):
        """Handle document upload."""
        metadata = data.get('metadata', {})
        industry = metadata.get('industry', 'landscaping')
        document_type = metadata.get('documentType', 'document')
        
        # Mock document processing
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        extracted_data = self.generate_extracted_data(industry, document_type)
        
        self.wfile.write(json.dumps({
            "id": f"doc_{random.randint(1000, 9999)}",
            "filename": f"uploaded_{document_type}.pdf",
            "status": "processed",
            "metadata": {
                "documentType": document_type,
                "industry": industry,
                "pages": random.randint(1, 10),
                "processingTime": random.uniform(0.5, 3.0)
            },
            "extracted_data": extracted_data,
            "confidence": random.uniform(0.75, 0.98)
        }).encode())
    
    def handle_extraction(self, data: Dict[str, Any]):
        """Handle data extraction from documents."""
        industry = data.get('industry', 'landscaping')
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        self.wfile.write(json.dumps({
            "data": self.generate_extracted_data(industry, 'document'),
            "confidence": random.uniform(0.80, 0.95),
            "processing_time": random.uniform(1.0, 5.0)
        }).encode())
    
    def handle_suggestions(self, data: Dict[str, Any]):
        """Handle suggestion requests."""
        industry = data.get('industry', 'landscaping')
        goal = data.get('goal', 'cost_optimization')
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        suggestions = self.generate_suggestions_from_goal(goal, industry)
        
        self.wfile.write(json.dumps({
            "recommendations": suggestions,
            "confidence": random.uniform(0.75, 0.90)
        }).encode())
    
    def handle_search(self, data: Dict[str, Any]):
        """Handle search requests."""
        query = data.get('query', '')
        industry = data.get('filters', {}).get('industry', 'landscaping')
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        results = self.generate_search_results(query, industry)
        
        self.wfile.write(json.dumps({
            "query": query,
            "results": results,
            "total": len(results),
            "time": random.uniform(0.1, 0.5)
        }).encode())
    
    def handle_knowledge_request(self, industry: str):
        """Handle knowledge base requests."""
        knowledge = INDUSTRY_KNOWLEDGE.get(industry, INDUSTRY_KNOWLEDGE['landscaping'])
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        self.wfile.write(json.dumps(knowledge).encode())
    
    def generate_chat_response(self, message: str, industry: str) -> str:
        """Generate contextual chat responses."""
        message_lower = message.lower()
        knowledge = INDUSTRY_KNOWLEDGE.get(industry, INDUSTRY_KNOWLEDGE['landscaping'])
        
        # Pricing questions
        if any(word in message_lower for word in ['cost', 'price', 'charge', 'rate']):
            if 'labor' in message_lower:
                return f"For {industry}, typical labor rates are ${knowledge['pricing'].get('general_labor_hourly', 30)}-${knowledge['pricing'].get('skilled_labor_hourly', 50)} per hour. Emergency/after-hours work typically commands 50% premium."
            elif 'sod' in message_lower or 'grass' in message_lower:
                price = knowledge['pricing'].get('sod', 0.45)
                return f"Sod installation typically costs ${price}-${price*1.5} per square foot including labor and materials. For a 500 sq ft area, expect ${int(price*500)}-${int(price*1.5*500)} total."
            else:
                return f"{industry.title()} pricing varies significantly by project type and location. Based on industry standards, I recommend a 25% markup on materials and ${knowledge['pricing'].get('hourly_rate', 75)}/hour for skilled labor. Would you like specific pricing for a particular service?"
        
        # Regulations questions
        if any(word in message_lower for word in ['permit', 'regulation', 'code', 'legal', 'license']):
            regs = knowledge.get('regulations', [])
            return f"For {industry}, important regulations include: {regs[0] if regs else 'Check local requirements'}. Would you like more details on specific compliance requirements?"
        
        # Best practices
        if any(word in message_lower for word in ['best practice', 'recommend', 'suggest', 'advice', 'tip']):
            practices = knowledge.get('best_practices', [])
            return f"Here are some best practices for {industry}: {practices[0] if practices else 'Always provide detailed estimates'}. Want more specific recommendations?"
        
        # Materials questions
        if any(word in message_lower for word in ['material', 'product', 'supply', 'equipment']):
            return f"For {industry} projects, quality materials are crucial. I recommend factoring in 25% markup on materials and always ordering 10% extra for contingencies. Would you like material recommendations for a specific project?"
        
        # Document questions
        if any(word in message_lower for word in ['document', 'upload', 'blueprint', 'contract', 'spec']):
            return f"I can help analyze {industry} documents! Upload contracts, blueprints, or specifications, and I'll extract key information for your estimate. What type of document would you like to process?"
        
        # General greeting or unknown
        return f"I can help you with {industry} estimation! I can assist with pricing, regulations, document analysis, and best practices. What would you like to know?"
    
    def generate_suggestions(self, message: str, industry: str) -> list:
        """Generate suggestions based on message context."""
        suggestions = [
            f"View detailed {industry} pricing guide",
            "Check local regulations",
            "Upload a document for analysis",
            "Get material recommendations"
        ]
        return suggestions[:3]
    
    def generate_follow_up_questions(self, message: str, industry: str) -> list:
        """Generate follow-up questions."""
        questions = [
            f"What's the scope of your {industry} project?",
            "Do you have a specific location for regional pricing?",
            "Would you like to upload a document for detailed analysis?",
            f"What {industry} services are you estimating?"
        ]
        return questions[:3]
    
    def generate_extracted_data(self, industry: str, document_type: str) -> Dict[str, Any]:
        """Generate mock extracted data based on document type."""
        knowledge = INDUSTRY_KNOWLEDGE.get(industry, INDUSTRY_KNOWLEDGE['landscaping'])
        
        base_data = {
            "industry": industry,
            "document_type": document_type,
            "extracted_at": "2024-03-13T10:00:00Z"
        }
        
        if industry == 'landscaping':
            base_data.update({
                "area_sq_ft": random.randint(500, 5000),
                "materials": [
                    {"name": "Sod", "quantity": random.randint(10, 100), "unit": "rolls"},
                    {"name": "Mulch", "quantity": random.randint(2, 20), "unit": "cubic_yards"},
                    {"name": "Plants", "quantity": random.randint(5, 50), "unit": "each"}
                ],
                "estimated_labor_hours": random.randint(8, 40),
                "special_requirements": ["Irrigation system", "Grading", "Soil amendment"]
            })
        elif industry == 'plumbing':
            base_data.update({
                "fixtures": random.randint(1, 5),
                "pipe_length_ft": random.randint(10, 100),
                "complexity": random.choice(['simple', 'moderate', 'complex']),
                "emergency": random.choice([True, False])
            })
        elif industry == 'hvac':
            base_data.update({
                "system_size_tons": random.choice([1.5, 2.0, 2.5, 3.0, 4.0, 5.0]),
                "efficiency_rating": random.choice([13, 14, 15, 16, 18]),
                "ductwork_needed": random.choice([True, False])
            })
        elif industry == 'electrical':
            base_data.update({
                "outlets": random.randint(1, 10),
                "circuits": random.randint(1, 5),
                "amperage": random.choice([120, 240]),
                "outdoor": random.choice([True, False])
            })
        
        return base_data
    
    def generate_suggestions_from_goal(self, goal: str, industry: str) -> list:
        """Generate suggestions based on optimization goal."""
        if goal == 'cost_optimization':
            return [
                f"Consider seasonal discounts on {industry} materials (10-20% savings in winter)",
                "Bundle multiple services to reduce trip charges",
                "Negotiate volume discounts with suppliers for 15%+ markup",
                "Use native/low-maintenance materials to reduce long-term costs"
            ]
        elif goal == 'time_optimization':
            return [
                "Pre-order materials to avoid delays",
                "Use prefabricated components when possible",
                "Schedule during off-peak seasons for better availability"
            ]
        else:
            return [
                f"Focus on high-margin {industry} services",
                "Build recurring maintenance revenue",
                "Upsell premium materials for higher margins"
            ]
    
    def generate_search_results(self, query: str, industry: str) -> list:
        """Generate mock search results."""
        knowledge = INDUSTRY_KNOWLEDGE.get(industry, INDUSTRY_KNOWLEDGE['landscaping'])
        
        results = []
        
        if 'price' in query.lower() or 'cost' in query.lower():
            results.append({
                "title": f"{industry.title()} Pricing Guide 2024",
                "content": f"Standard {industry} pricing ranges from ${list(knowledge['pricing'].values())[0]} to ${list(knowledge['pricing'].values())[-1]} depending on complexity.",
                "confidence": 0.92,
                "source": "Industry Database"
            })
        
        if 'regulation' in query.lower() or 'permit' in query.lower():
            regs = knowledge.get('regulations', [])
            if regs:
                results.append({
                    "title": f"{industry.title()} Regulatory Requirements",
                    "content": regs[0],
                    "confidence": 0.88,
                    "source": "Municipal Code Database"
                })
        
        if not results:
            results.append({
                "title": f"{industry.title()} Best Practices",
                "content": knowledge.get('best_practices', ['Provide detailed estimates'])[0],
                "confidence": 0.85,
                "source": "Industry Knowledge Base"
            })
        
        return results

def run_server(port=3000):
    """Run the mock OpenRAG server."""
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockOpenRAGHandler)
    print(f"🚀 Mock OpenRAG Server running on http://localhost:{port}")
    print("✅ API endpoints:")
    print(f"   - GET  /health")
    print(f"   - GET  /knowledge/<industry>")
    print(f"   - POST /api/v1/chat")
    print(f"   - POST /api/v1/documents/upload")
    print(f"   - POST /api/v1/extract")
    print(f"   - POST /api/v1/suggest")
    print(f"   - POST /api/v1/search")
    print("\n📝 This is a development mock - no AI model required")
    print("   Supports: landscaping, plumbing, hvac, electrical")
    print("\nPress Ctrl+C to stop")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped")
        httpd.shutdown()

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    run_server(port)