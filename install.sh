#!/bin/bash

# OREA-Bot Installation Script
# Author: OREA_85
# Version: 1.0.0

echo "🤖 OREA-Bot Installation Script"
echo "================================"
echo "👨‍💻 Author: OREA_85"
echo "📞 WhatsApp: 085891389246"
echo "🏦 BCA: 6370506149"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "📥 Please install Node.js 16+ first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version is too old!"
    echo "📥 Please upgrade to Node.js 16+"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p downloads temp logs backups

echo "✅ Directories created successfully!"

# Copy environment file
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Environment file created!"
    echo ""
    echo "⚠️  Please edit .env file with your credentials:"
    echo "   - BOT_TOKEN: Get from @BotFather"
    echo "   - OPENAI_API_KEY: Get from platform.openai.com"
    echo "   - MONGODB_URI: Your MongoDB connection string"
    echo "   - OWNER_NUMBER: Your WhatsApp number"
    echo "   - BCA_ACCOUNT: Your BCA account number"
else
    echo "✅ Environment file already exists!"
fi

# Install PM2 globally
echo ""
echo "🔧 Installing PM2 process manager..."
npm install -g pm2

if [ $? -ne 0 ]; then
    echo "❌ Failed to install PM2!"
    echo "📥 Please install manually: npm install -g pm2"
    exit 1
fi

echo "✅ PM2 installed successfully!"

# Create PM2 ecosystem file
echo ""
echo "📝 Creating PM2 ecosystem file..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'orea-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
};
EOF

echo "✅ PM2 ecosystem file created!"

# Make scripts executable
chmod +x *.sh

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Start the bot: npm start"
echo "3. Or use PM2: pm2 start ecosystem.config.js"
echo ""
echo "📞 Need help? Contact OREA_85:"
echo "   WhatsApp: 085891389246"
echo "   Telegram: @OREA_85"
echo ""
echo "🤖 OREA-Bot - Freedom Without Limits!"