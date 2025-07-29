const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const ivm = require('isolated-vm');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Webhook notification function
async function sendWebhook(data) {
  const webhookUrl = process.env.WEBHOOK_URL;
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (webhookUrl) {
    try {
      await axios.post(webhookUrl, {
        timestamp: new Date().toISOString(),
        event: 'code_execution',
        ...data
      });
    } catch (error) {
      console.error('Webhook notification failed:', error.message);
    }
  }
  
  if (slackWebhookUrl) {
    try {
      await axios.post(slackWebhookUrl, {
        text: `🤖 Code Execution Alert`,
        attachments: [{
          color: data.success ? 'good' : 'danger',
          fields: [
            { title: 'Status', value: data.success ? 'Success' : 'Error', short: true },
            { title: 'Language', value: data.language || 'javascript', short: true },
            { title: 'Execution Time', value: `${data.executionTime}ms`, short: true },
            { title: 'Output', value: data.output ? data.output.substring(0, 500) : 'No output', short: false }
          ],
          timestamp: Math.floor(Date.now() / 1000)
        }]
      });
    } catch (error) {
      console.error('Slack webhook notification failed:', error.message);
    }
  }
}

// Safe code execution function
async function executeCode(code, language = 'javascript', timeout = 5000) {
  const startTime = Date.now();
  
  try {
    if (language === 'javascript' || language === 'js') {
      return await executeJavaScript(code, timeout);
    } else if (language === 'python' || language === 'py') {
      return await executePython(code, timeout);
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }
  } finally {
    const executionTime = Date.now() - startTime;
    console.log(`Code execution completed in ${executionTime}ms`);
  }
}

// JavaScript execution using isolated-vm
async function executeJavaScript(code, timeout) {
  const isolate = new ivm.Isolate({ memoryLimit: 32 });
  const context = await isolate.createContext();
  
  // Create a safe console object
  const jail = context.global;
  await jail.set('global', jail.derefInto());
  
  // Add console functionality
  const logs = [];
  await jail.set('_log', function(...args) {
    logs.push(args.map(arg => String(arg)).join(' '));
  });
  
  await context.eval(`
    global.console = {
      log: _log,
      error: _log,
      warn: _log,
      info: _log
    };
  `);
  
  try {
    const result = await context.eval(code, { timeout });
    return {
      success: true,
      output: logs.length > 0 ? logs.join('\n') : String(result),
      logs: logs
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      logs: logs
    };
  } finally {
    isolate.dispose();
  }
}

// Python execution using child process
async function executePython(code, timeout) {
  const { spawn } = require('child_process');
  
  return new Promise((resolve) => {
    const python = spawn('python3', ['-c', code], {
      timeout: timeout,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          output: stdout.trim(),
          logs: []
        });
      } else {
        resolve({
          success: false,
          error: stderr.trim() || `Process exited with code ${code}`,
          logs: []
        });
      }
    });
    
    python.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        logs: []
      });
    });
    
    // Handle timeout
    setTimeout(() => {
      python.kill('SIGKILL');
      resolve({
        success: false,
        error: 'Execution timeout',
        logs: []
      });
    }, timeout);
  });
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Railway Code Executor API',
    version: '1.0.0',
    endpoints: {
      execute: 'POST /api/execute',
      health: 'GET /api/health'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Main code execution endpoint
app.post('/api/execute', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { code, language = 'javascript', timeout = 5000 } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required'
      });
    }
    
    if (typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Code must be a string'
      });
    }
    
    if (code.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Code too long (max 10000 characters)'
      });
    }
    
    const validTimeout = Math.min(Math.max(timeout, 1000), 10000); // 1-10 seconds
    
    console.log(`Executing ${language} code from IP: ${req.ip}`);
    
    const result = await executeCode(code, language, validTimeout);
    const executionTime = Date.now() - startTime;
    
    const response = {
      ...result,
      language,
      executionTime,
      timestamp: new Date().toISOString()
    };
    
    // Send webhook notification
    await sendWebhook({
      ...response,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json(response);
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('Execution error:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      executionTime,
      timestamp: new Date().toISOString()
    };
    
    // Send webhook notification for errors
    await sendWebhook({
      ...errorResponse,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(500).json(errorResponse);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Railway Code Executor API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Execute endpoint: http://localhost:${PORT}/api/execute`);
});

module.exports = app;

