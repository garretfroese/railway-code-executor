# Railway Code Executor API

A secure, production-ready API service that allows AI agents (like ChatGPT) to execute code remotely with built-in safety measures, rate limiting, and webhook notifications.

## 🚀 Features

- **Safe Code Execution**: Isolated execution environment using `isolated-vm` for JavaScript and sandboxed processes for Python
- **Rate Limiting**: 100 requests per 15 minutes per IP address
- **CORS Enabled**: Allows cross-origin requests from any domain
- **Webhook Notifications**: Optional Slack and custom webhook notifications for code execution events
- **Security Headers**: Helmet.js for security headers
- **Request Logging**: Morgan logging for monitoring
- **Health Checks**: Built-in health check endpoints
- **Error Handling**: Comprehensive error handling and validation

## 📡 API Endpoints

### Health Check
```
GET /
GET /api/health
```

### Code Execution
```
POST /api/execute
```

## 🔧 Request Format

```json
{
  "code": "console.log('Hello, World!');",
  "language": "javascript",
  "timeout": 5000
}
```

### Parameters

- `code` (required): The code to execute (max 10,000 characters)
- `language` (optional): Programming language - `javascript`, `js`, `python`, or `py` (default: `javascript`)
- `timeout` (optional): Execution timeout in milliseconds (1000-10000, default: 5000)

## 📤 Response Format

### Success Response
```json
{
  "success": true,
  "output": "Hello, World!",
  "logs": ["Hello, World!"],
  "language": "javascript",
  "executionTime": 45,
  "timestamp": "2025-01-29T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "ReferenceError: undefinedVariable is not defined",
  "logs": [],
  "language": "javascript",
  "executionTime": 12,
  "timestamp": "2025-01-29T10:30:00.000Z"
}
```

## 🛡️ Security Features

- **Isolated Execution**: JavaScript runs in isolated-vm with memory limits
- **Process Sandboxing**: Python runs in separate processes with timeouts
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Code length and type validation
- **Security Headers**: Helmet.js protection
- **Memory Limits**: 32MB memory limit for JavaScript execution
- **Timeout Protection**: Configurable execution timeouts

## 🔔 Webhook Notifications

Configure webhook URLs in environment variables to receive notifications when code is executed:

### Custom Webhook
Set `WEBHOOK_URL` to receive POST requests with execution details.

### Slack Integration
Set `SLACK_WEBHOOK_URL` to receive formatted Slack notifications.

## 🌐 Environment Variables

```bash
PORT=3000                                    # Server port (Railway sets this automatically)
WEBHOOK_URL=https://your-webhook.com/notify  # Optional custom webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/... # Optional Slack webhook
```

## 🚀 Deployment to Railway

1. **Connect GitHub Repository**:
   - Fork or clone this repository
   - Connect it to your Railway account

2. **Deploy**:
   - Railway will automatically detect the Node.js project
   - Set environment variables in Railway dashboard if needed
   - Deploy with one click

3. **Access Your API**:
   - Railway provides a public URL: `https://your-app.railway.app`
   - Your API will be available at: `https://your-app.railway.app/api/execute`

## 📝 Usage Examples

### JavaScript Execution
```bash
curl -X POST https://your-app.railway.app/api/execute \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "const result = 2 + 2; console.log(result); result;",
    "language": "javascript"
  }'
```

### Python Execution
```bash
curl -X POST https://your-app.railway.app/api/execute \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "print(\\"Hello from Python!\\"); result = 5 * 5; print(f\\"Result: {result}\\")",
    "language": "python"
  }'
```

### Using with ChatGPT/AI Agents

You can provide this API endpoint to AI agents like ChatGPT with instructions like:

```
You can execute code by making POST requests to https://your-app.railway.app/api/execute
Send JSON with "code" and "language" fields. Supported languages: javascript, python.
The API will return the execution results including output and any errors.
```

## 🔍 Monitoring and Logs

- **Railway Logs**: View real-time logs in Railway dashboard
- **Health Checks**: Monitor API health at `/api/health`
- **Rate Limit Headers**: Check `X-RateLimit-*` headers in responses
- **Webhook Notifications**: Get notified of all code executions

## ⚠️ Limitations

- **Execution Time**: Maximum 10 seconds per request
- **Memory**: 32MB limit for JavaScript execution
- **Code Length**: Maximum 10,000 characters
- **Rate Limits**: 100 requests per 15 minutes per IP
- **Network Access**: Limited network access in execution environment
- **File System**: No persistent file system access

## 🛠️ Local Development

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd railway-code-executor
   npm install
   ```

2. **Set Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run Locally**:
   ```bash
   npm start
   ```

4. **Test the API**:
   ```bash
   curl -X POST http://localhost:3000/api/execute \\
     -H "Content-Type: application/json" \\
     -d '{"code": "console.log(\\"Hello, World!\\");"}'
   ```

## 📊 API Response Codes

- `200`: Successful execution (check `success` field for actual result)
- `400`: Bad request (invalid input)
- `429`: Rate limit exceeded
- `500`: Internal server error

## 🔐 Security Considerations

- This API executes arbitrary code - use appropriate network security
- Consider implementing authentication for production use
- Monitor usage through logs and webhooks
- The execution environment is isolated but not completely sandboxed
- Suitable for educational and development purposes

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check Railway logs for deployment issues
- Review API response errors for usage issues
- Monitor webhook notifications for execution problems

