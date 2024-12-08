import React, { useState } from 'react';
import api from '../services/api';
import { AlertCircle, CheckCircle, Info, AlertTriangle, XCircle, Key } from 'lucide-react';
import { API_DOCS } from '../api-docs/routes';
import DebugPanel from './DebugPanel';

interface ApiResponse {
  status: number;
  data: any;
  error?: string;
  rawResponse?: string;
  contentType?: string;
  headers?: Record<string, string>;
}

export default function ApiTester() {
  const [endpoint, setEndpoint] = useState('/health');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [isAuthRequired, setIsAuthRequired] = useState(true);
  const [debugInfo, setDebugInfo] = useState<{
    request?: {
      method: string;
      url: string;
      headers?: Record<string, string>;
      data?: any;
    };
    response?: {
      status: number;
      data: any;
      headers?: Record<string, string>;
      error?: string;
    };
  }>({});

  const predefinedEndpoints = [
    // Health Check
    { value: '/health', label: 'Health Check', method: 'GET' },
    
    // Auth Endpoints
    { value: '/auth/register', label: 'Register', method: 'POST', requiresAuth: false },
    { value: '/auth/login', label: 'Login', method: 'POST', requiresAuth: false },
    { value: '/auth/logout', label: 'Logout', method: 'POST' },
    { value: '/auth/refresh', label: 'Refresh Token', method: 'POST' },
    
    // User Endpoints
    { value: '/users/profile', label: 'Get Profile', method: 'GET' },
    { value: '/users/profile', label: 'Update Profile', method: 'PUT' },
    { value: '/users/leaderboard', label: 'Get Leaderboard', method: 'GET' },
    
    // Task Endpoints
    { value: '/tasks', label: 'List Tasks', method: 'GET' },
    { value: '/tasks', label: 'Create Task (Admin)', method: 'POST' },
    { value: '/tasks/:taskId/submit', label: 'Submit Task', method: 'POST' },
    { value: '/tasks/:taskId/review', label: 'Review Task (Admin)', method: 'PUT' },
    
    // Transaction Endpoints
    { value: '/transactions', label: 'List Transactions', method: 'GET' },
    { value: '/transactions/withdraw', label: 'Request Withdrawal', method: 'POST' },
    
    // Notification Endpoints
    { value: '/notifications', label: 'List Notifications', method: 'GET' },
    { value: '/notifications/:id/read', label: 'Mark Notification Read', method: 'PUT' },
    { value: '/notifications/read-all', label: 'Mark All Read', method: 'PUT' },
    
    // Admin Endpoints
    { value: '/admin/users', label: 'List Users (Admin)', method: 'GET' },
    { value: '/admin/submissions/pending', label: 'Pending Submissions (Admin)', method: 'GET' },
    { value: '/admin/stats', label: 'Dashboard Stats (Admin)', method: 'GET' },
    
    // Custom Endpoint
    { value: 'custom', label: 'Custom Endpoint', method: 'GET' }
  ];

  const exampleRequests = {
    '/auth/register': {
      method: 'POST',
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      }
    },
    '/auth/login': {
      method: 'POST',
      body: {
        email: "test@example.com",
        password: "password123"
      }
    },
    '/users/profile': {
      method: 'PUT',
      body: {
        name: "Updated Name",
        country: "US",
        age: 25,
        phoneNumber: "+1234567890",
        bio: "Test bio",
        timezone: "America/New_York",
        language: "en",
        emailNotifications: true
      }
    },
    '/tasks': {
      method: 'POST',
      body: {
        title: "Test Task",
        description: "Test description",
        reward: 15.00,
        timeEstimate: "30 minutes",
        category: "Testing",
        difficulty: "Easy",
        timeInSeconds: 1800,
        steps: ["Step 1", "Step 2", "Step 3"],
        approvalType: "automatic"
      }
    },
    '/tasks/:taskId/submit': {
      method: 'POST',
      body: {
        screenshotUrl: "https://example.com/screenshot.jpg"
      }
    },
    '/tasks/:taskId/review': {
      method: 'PUT',
      body: {
        submissionId: 1,
        status: "approved"
      }
    },
    '/transactions/withdraw': {
      method: 'POST',
      body: {
        amount: 50.00
      }
    }
  };

  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEndpoint = e.target.value;
    setEndpoint(selectedEndpoint);
    
    // Find the selected endpoint configuration
    const endpointConfig = predefinedEndpoints.find(ep => ep.value === selectedEndpoint);
    if (endpointConfig) {
      setMethod(endpointConfig.method as 'GET' | 'POST' | 'PUT' | 'DELETE');
      setIsAuthRequired(endpointConfig.requiresAuth !== false); // Default to true if not specified
    }
    
    // Set example request body if available
    const example = exampleRequests[selectedEndpoint as keyof typeof exampleRequests];
    if (example) {
      setRequestBody(JSON.stringify(example.body, null, 2));
    } else {
      setRequestBody('');
    }
  };

  const handleTest = async () => {
    setLoading(true);
    try {
      let body = null;
      try {
        body = requestBody ? JSON.parse(requestBody) : null;
      } catch (e) {
        throw new Error('Invalid JSON in request body');
      }

      const finalEndpoint = endpoint === 'custom' ? customEndpoint : endpoint;
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if (token && isAuthRequired) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Update debug info with request details
      setDebugInfo({
        request: {
          method,
          url: `${import.meta.env.VITE_API_URL || 'https://bookmaster.fun/api'}${finalEndpoint}`,
          headers,
          data: body
        }
      });

      const response = await api({
        method,
        url: finalEndpoint,
        data: body,
        headers
      });

      // Update debug info with response
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: response.status,
          data: response.data,
          headers: response.headers as Record<string, string>,
          error: undefined
        }
      }));

      setResponse({
        status: response.status,
        data: response.data.parsed,
        rawResponse: response.data.raw,
        contentType: response.headers['content-type'],
        headers: response.headers as Record<string, string>
      });

      if ((endpoint === '/auth/login' || endpoint === '/auth/register') && response.data.parsed?.data?.token) {
        localStorage.setItem('token', response.data.parsed.data.token);
      }
    } catch (error: any) {
      console.error('API Error:', error);
      
      const errorResponse: ApiResponse = {
        status: error.response?.status || 500,
        data: error.response?.data?.parsed || error.response?.data || {},
        error: error.response?.data?.message || error.message,
        rawResponse: error.response?.data?.raw || error.response?.data,
        contentType: error.response?.headers?.['content-type'],
        headers: error.response?.headers
      };

      // Update debug info with error
      setDebugInfo(prev => ({
        ...prev,
        response: {
          status: errorResponse.status,
          data: errorResponse.data,
          headers: errorResponse.headers,
          error: errorResponse.error
        }
      }));

      setResponse(errorResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Tester</h2>

          <div className="space-y-4">
            {/* Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <div className="flex space-x-2">
                {(['GET', 'POST', 'PUT', 'DELETE'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      method === m
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
              <select
                value={endpoint}
                onChange={handleEndpointChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {predefinedEndpoints.map((ep) => (
                  <option key={ep.value} value={ep.value}>
                    {ep.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Endpoint Input */}
            {endpoint === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Endpoint</label>
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="/your/custom/endpoint"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            )}

            {/* Authentication Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auth-required"
                checked={isAuthRequired}
                onChange={(e) => setIsAuthRequired(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="auth-required" className="text-sm text-gray-700">
                Include Authorization Token
              </label>
            </div>

            {/* API Base URL Display */}
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                API Base URL: <span className="font-mono">{import.meta.env.VITE_API_URL || 'https://bookmaster.fun/api'}</span>
              </p>
            </div>

            {/* Request Body */}
            {method !== 'GET' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Body (JSON)</label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={5}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
                  placeholder="{\n  'key': 'value'\n}"
                />
              </div>
            )}

            {/* Authentication Status */}
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600 flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Authentication Status: {' '}
                <span className={`ml-1 ${localStorage.getItem('token') ? 'text-green-600' : 'text-red-600'}`}>
                  {localStorage.getItem('token') ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </p>
            </div>

            {/* Test Button */}
            <button
              onClick={handleTest}
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {loading ? 'Testing...' : 'Test Endpoint'}
            </button>
          </div>

          {/* Debug Panel */}
          <DebugPanel 
            request={debugInfo.request}
            response={debugInfo.response}
          />
        </div>
      </div>
    </div>
  );
}