#!/bin/bash

# Bear MCP Server Setup Script

set -e

echo "🐻 Setting up Bear MCP Server..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This server only works on macOS (Bear App requirement)"
    exit 1
fi

# Check if Bear is installed
if ! open -Ra "Bear" 2>/dev/null; then
    echo "❌ Error: Bear App is not installed. Please install Bear from the Mac App Store."
    exit 1
fi

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Create project structure
echo "📁 Creating project structure..."
mkdir -p src dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building TypeScript..."
npm run build

# Make the binary executable
chmod +x dist/index.js

echo "✅ Build complete!"

# Get Bear token
echo ""
echo "🔑 Bear API Token Setup:"
echo "To use all features, you'll need a Bear API token."
echo ""
echo "To get your token:"
echo "1. Open Bear App"
echo "2. Go to Help → Advanced → API Token → Copy Token"
echo "3. The token will be copied to your clipboard"
echo ""

# Check if Claude Desktop config exists
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CLAUDE_CONFIG" ]; then
    echo "📋 Claude Desktop config found at: $CLAUDE_CONFIG"
    echo ""
    echo "Add this to your Claude Desktop configuration:"
    echo ""
    cat << EOF
{
  "mcpServers": {
    "bear": {
      "command": "node",
      "args": ["$(pwd)/dist/index.js"],
      "env": {
        "BEAR_TOKEN": "your-bear-api-token-here"
      }
    }
  }
}
EOF
    echo ""
    echo "Replace 'your-bear-api-token-here' with your actual Bear token."
else
    echo "📋 Claude Desktop config not found. You'll need to create:"
    echo "$CLAUDE_CONFIG"
    echo ""
    echo "See claude_desktop_config.json.example for the configuration format."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Get your Bear API token (instructions above)"
echo "2. Add the server to your Claude Desktop config"
echo "3. Restart Claude Desktop"
echo "4. Start using Bear tools in your conversations!"
echo ""
echo "Available tools:"
echo "  • bear_create_note    - Create new notes"
echo "  • bear_open_note      - Open existing notes"
echo "  • bear_add_text       - Add text to notes"
echo "  • bear_search         - Search through notes"
echo "  • bear_get_tags       - Get all tags"
echo "  • bear_grab_url       - Create notes from web content"
echo "  • And many more!"
echo ""
echo "📖 See README.md for detailed usage examples."