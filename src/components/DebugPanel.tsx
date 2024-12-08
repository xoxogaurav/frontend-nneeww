import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface DebugPanelProps {
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
  data?: any;
}

export default function DebugPanel({ request, response, data }: DebugPanelProps) {
  if (!request && !response && !data) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 space-y-4">
      <h3 className="text-sm font-medium text-gray-900">Debug Information</h3>

      {request && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
            <Info className="h-4 w-4 mr-1" />
            Request
          </h4>
          <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-auto">
            {JSON.stringify({
              method: request.method,
              url: request.url,
              headers: request.headers,
              data: request.data
            }, null, 2)}
          </pre>
        </div>
      )}

      {response && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
            {response.error ? (
              <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            )}
            Response
          </h4>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              response.status >= 200 && response.status < 300
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              Status: {response.status}
            </span>
            {response.headers?.['content-type'] && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {response.headers['content-type']}
              </span>
            )}
          </div>
          <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-auto">
            {JSON.stringify(response.data, null, 2)}
          </pre>
        </div>
      )}

      {data && !request && !response && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
            <Info className="h-4 w-4 mr-1" />
            Data
          </h4>
          <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}