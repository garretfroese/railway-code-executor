# Railway Code Executor - Deployment Guide

## 🚀 Quick Deploy to Railway

### Option 1: One-Click Deploy (Recommended)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/nodejs?referralCode=alphasec)

### Option 2: Manual Railway Deployment

1. **Go to Railway**: https://railway.com/new
2. **Sign in** with your GitHub account
3. **Click "Deploy from GitHub repo"**
4. **Select** `garretfroese/railway-code-executor`
5. **Deploy** - Railway will automatically detect it's a Node.js project

### Option 3: Railway CLI Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Clone and deploy
git clone https://github.com/garretfroese/railway-code-executor.git
cd railway-code-executor
railway deploy
```

## 🔧 Environment Variables (Optional)

Set these in Railway dashboard under Variables:

```bash
# Webhook URLs for notifications (optional)
WEBHOOK_URL=https://your-webhook-endpoint.com/notify
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Port (Railway sets this automatically)
PORT=3000
```

## 📡 Your API Endpoints

Once deployed, your API will be available at:
- **Base URL**: `https://your-app-name.railway.app`
- **Health Check**: `GET https://your-app-name.railway.app/api/health`
- **Code Execution**: `POST https://your-app-name.railway.app/api/execute`

## 🧪 Test Your Deployed API

### JavaScript Example:
```bash
curl -X POST https://your-app-name.railway.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "console.log(\"Hello from Railway!\"); 2 + 2;",
    "language": "javascript"
  }'
```

### Python Example:
```bash
curl -X POST https://your-app-name.railway.app/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello from Python on Railway!\"); result = 5 * 5; print(f\"Result: {result}\")",
    "language": "python"
  }'
```

## 🤖 For AI Agents (ChatGPT, Claude, etc.)

Provide this information to AI agents:

```
API Endpoint: https://your-app-name.railway.app/api/execute
Method: POST
Content-Type: application/json

Request Body:
{
  "code": "your_code_here",
  "language": "javascript" or "python",
  "timeout": 5000 (optional, 1000-10000ms)
}

Response:
{
  "success": true/false,
  "output": "execution_output",
  "logs": ["console_logs"],
  "language": "javascript",
  "executionTime": 45,
  "timestamp": "2025-01-29T10:30:00.000Z"
}
```

## 🛡️ Security Features

- ✅ Rate limiting: 100 requests per 15 minutes per IP
- ✅ CORS enabled for all origins
- ✅ Isolated code execution environment
- ✅ Input validation and sanitization
- ✅ Memory limits (32MB for JavaScript)
- ✅ Execution timeouts (1-10 seconds)
- ✅ Security headers via Helmet.js

## 📊 Monitoring

- **Railway Dashboard**: View logs, metrics, and deployments
- **Health Check**: Monitor API status at `/api/health`
- **Webhook Notifications**: Get notified of all code executions
- **Rate Limit Headers**: Check `X-RateLimit-*` headers in responses

## 🔄 Auto-Deployment

Railway automatically redeploys when you push to the `main` branch of your GitHub repository.

## 💰 Pricing

Railway offers:
- **Free Tier**: $5 credit per month (sufficient for testing)
- **Pro Plan**: $20/month for production use

## 🆘 Troubleshooting

### Common Issues:

1. **Build Fails**: Check Railway build logs in dashboard
2. **API Not Responding**: Verify the service is running in Railway dashboard
3. **Rate Limited**: Wait 15 minutes or check IP restrictions
4. **Code Execution Fails**: Check request format and code syntax

### Support:
- Railway Documentation: https://docs.railway.app
- GitHub Issues: https://github.com/garretfroese/railway-code-executor/issues

## 📝 Project Structure

```
railway-code-executor/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── README.md             # Project documentation
├── DEPLOYMENT.md         # This deployment guide
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
└── test.js              # Local testing script
```

## 🎯 Next Steps

1. **Deploy** using one of the methods above
2. **Test** the API with the provided examples
3. **Configure** webhook notifications (optional)
4. **Share** the API endpoint with AI agents
5. **Monitor** usage through Railway dashboard

Your Railway Code Executor API is now ready for production use! 🎉

