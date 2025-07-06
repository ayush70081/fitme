import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { testGeminiConnection } from '../services/geminiAPI';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  ExternalLink,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';

const GeminiDiagnostics = () => {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isPlaceholder = currentApiKey === 'your_gemini_api_key_here';
  const hasApiKey = currentApiKey && currentApiKey !== 'your_gemini_api_key_here';

  useEffect(() => {
    // Run initial test on component mount
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setTesting(true);
    try {
      const result = await testGeminiConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: `Unexpected error: ${error.message}`
      });
    }
    setTesting(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = () => {
    if (testing) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
    if (testResult?.success) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (!hasApiKey || isPlaceholder) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (testing) return 'Testing connection...';
    if (testResult?.success) return 'Gemini API is working correctly!';
    if (!hasApiKey) return 'No API key configured';
    if (isPlaceholder) return 'API key is still placeholder text';
    return testResult?.error || 'Connection failed';
  };

  const getStatusColor = () => {
    if (testing) return 'border-blue-200 bg-blue-50';
    if (testResult?.success) return 'border-green-200 bg-green-50';
    if (!hasApiKey || isPlaceholder) return 'border-yellow-200 bg-yellow-50';
    return 'border-red-200 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <Info className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Gemini API Diagnostics</h3>
      </div>

      {/* Status Card */}
      <div className={`rounded-lg border-2 p-4 mb-4 ${getStatusColor()}`}>
        <div className="flex items-center gap-3 mb-2">
          {getStatusIcon()}
          <span className="font-medium text-gray-900">{getStatusText()}</span>
        </div>
        {testResult?.success && testResult.message && (
          <div className="text-sm text-gray-600 mt-2">
            <strong>API Response:</strong> {testResult.message}
          </div>
        )}
        {testResult?.originalError && (
          <div className="text-sm text-red-600 mt-2">
            <strong>Technical Error:</strong> {testResult.originalError}
          </div>
        )}
      </div>

      {/* API Key Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">API Key Status</span>
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showApiKey ? 'Hide' : 'Show'} Key
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
          {hasApiKey ? (
            showApiKey ? currentApiKey : `${currentApiKey.substring(0, 8)}${'*'.repeat(Math.max(0, currentApiKey.length - 8))}`
          ) : (
            <span className="text-red-500">Not configured</span>
          )}
        </div>
        
        {hasApiKey && (
          <div className="mt-2 text-xs text-gray-500">
            Length: {currentApiKey.length} characters
            {isPlaceholder && <span className="text-red-500 ml-2">⚠️ Still using placeholder text</span>}
          </div>
        )}
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-900 mb-2">Setup Instructions</h4>
        <ol className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="font-medium">1.</span>
            <div>
              Get your API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
              >
                Google AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">2.</span>
            <div>
              Add it to your <code className="bg-blue-100 px-1 rounded">.env</code> file:
              <div className="mt-1 bg-blue-100 rounded p-2 font-mono text-xs">
                VITE_GEMINI_API_KEY=your_actual_api_key_here
              </div>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-medium">3.</span>
            <span>Restart your development server</span>
          </li>
        </ol>
      </div>

      {/* Environment Variables Debug Info */}
      <details className="mb-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
          Debug Information (Click to expand)
        </summary>
        <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs font-mono">
          <div><strong>Environment Mode:</strong> {import.meta.env.MODE}</div>
          <div><strong>Available VITE_ vars:</strong></div>
          <ul className="ml-4 mt-1">
            {Object.keys(import.meta.env)
              .filter(key => key.startsWith('VITE_'))
              .map(key => (
                <li key={key}>
                  {key}: {key === 'VITE_GEMINI_API_KEY' 
                    ? (import.meta.env[key] ? `${import.meta.env[key].substring(0, 8)}...` : 'undefined')
                    : import.meta.env[key]
                  }
                </li>
              ))
            }
          </ul>
        </div>
      </details>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={runDiagnostics}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
          Test Connection
        </button>
        
        {hasApiKey && (
          <button
            onClick={() => copyToClipboard(currentApiKey)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Key'}
          </button>
        )}
      </div>

      {/* Common Issues */}
      {!testResult?.success && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Common Issues</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Make sure the .env file is in the frontend directory</li>
            <li>• Restart the development server after adding the API key</li>
            <li>• Check that your API key has the correct permissions</li>
            <li>• Verify you're not exceeding API quotas</li>
            <li>• Ensure the API key doesn't have extra spaces or quotes</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default GeminiDiagnostics;