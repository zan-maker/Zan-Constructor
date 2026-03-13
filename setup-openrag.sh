#!/bin/bash

echo "Setting up OpenRAG for estimator tool..."

# Create directory for OpenRAG data
mkdir -p openrag-data
mkdir -p openrag-data/knowledge-base

# Create initial knowledge base for landscaping industry
cat > openrag-data/knowledge-base/landscaping-pricing.md << 'EOF'
# Landscaping Industry Pricing Guide

## Labor Rates (Hourly)
- General labor: $25-35/hour
- Skilled labor (masonry, irrigation): $40-60/hour
- Supervisor/foreman: $50-75/hour

## Material Costs (Per Unit)
- Sod: $0.30-0.60 per sq ft
- Mulch: $20-40 per cubic yard
- Plants (small): $5-15 each
- Plants (large): $50-200 each
- Irrigation components: $2-10 per linear foot

## Project Markup
- Standard markup: 20-30%
- Emergency/after-hours: +50%
- Complex projects: +10-20%
- Seasonal adjustments: +15% (spring), -10% (winter)

## Common Project Estimates
- Lawn installation: $1,000-3,000 (500-1,000 sq ft)
- Garden bed: $500-2,000 (depending on plants/materials)
- Irrigation system: $2,000-5,000 (standard residential)
- Patio/paver installation: $3,000-10,000 (200-500 sq ft)

## Regional Variations
- Urban areas: +20-30%
- Suburban areas: Standard rates
- Rural areas: -10-20% (but + travel costs)

## Best Practices
- Always include 10% contingency
- Itemize labor and materials separately
- Provide 3 pricing tiers when possible
- Include maintenance recommendations
EOF

echo "Knowledge base created for landscaping industry"

# Create configuration file
cat > openrag-data/.env << 'EOF'
# OpenRAG Configuration for Estimator Tool
OPENRAG_INDUSTRIES=landscaping,plumbing,hvac,electrical
OPENRAG_LLM_PROVIDER=openrouter
OPENRAG_LLM_MODEL=deepseek/deepseek-chat
OPENRAG_VECTOR_STORE=opensearch
OPENRAG_DATA_DIR=./openrag-data
EOF

echo "Configuration file created"

echo "Setup complete! To start OpenRAG:"
echo "1. Run: ~/.local/bin/uvx openrag --tui"
echo "2. Choose Podman (option 1) when prompted"
echo "3. Follow the setup wizard"
echo ""
echo "Or use the SDK directly with:"
echo "from openrag_sdk import OpenRAGClient"
echo "client = OpenRAGClient(base_url='http://localhost:3000')"