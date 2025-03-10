import React, { useState, useEffect } from 'react';
import { fetchApi } from '../api/apiBase';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

const DatabaseTestPage: React.FC = () => {
  const [getResult, setGetResult] = useState<TestResult | null>(null);
  const [postResult, setPostResult] = useState<TestResult | null>(null);
  const [putResult, setPutResult] = useState<TestResult | null>(null);
  const [deleteResult, setDeleteResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/users');
  const [testId, setTestId] = useState('');
  const [formData, setFormData] = useState('{\n  "name": "Test User",\n  "email": "test@example.com",\n  "password_hash": "hash123",\n  "user_type": "free"\n}');

  // Available API endpoints for testing
  const endpoints = [
    { label: 'Users', value: '/api/users' },
    { label: 'Chatbots', value: '/api/chatbots' },
    { label: 'Chat Sessions', value: '/api/chat/sessions' },
    { label: 'Chat Messages', value: '/api/chat/messages' },
    { label: 'API Tokens', value: '/api/tokens' }
  ];

  // Update form data based on selected endpoint
  useEffect(() => {
    switch (selectedEndpoint) {
      case '/api/users':
        setFormData('{\n  "name": "Test User",\n  "email": "test@example.com",\n  "password_hash": "hash123",\n  "user_type": "free"\n}');
        break;
      case '/api/chatbots':
        setFormData('{\n  "name": "Test Chatbot",\n  "model": "gpt-3.5-turbo",\n  "provider": "openai",\n  "system_prompt": "You are a helpful assistant"\n}');
        break;
      case '/api/chat/sessions':
        setFormData('{\n  "user_id": "1",\n  "chatbot_id": "1",\n  "title": "Test Session"\n}');
        break;
      case '/api/chat/messages':
        setFormData('{\n  "session_id": "1",\n  "content": "Hello, this is a test message",\n  "role": "user"\n}');
        break;
      case '/api/tokens':
        setFormData('{\n  "name": "Test Token",\n  "value": "sk-test-token-value",\n  "provider": "openai",\n  "status": "active"\n}');
        break;
      default:
        setFormData('{}');
    }
  }, [selectedEndpoint]);

  // Test GET request
  const testGet = async () => {
    setIsLoading(true);
    setGetResult(null);
    try {
      const url = testId ? `${selectedEndpoint}/${testId}` : selectedEndpoint;
      const data = await fetchApi(url);
      setGetResult({
        success: true,
        message: 'GET request successful',
        data
      });
    } catch (error) {
      console.error('GET request failed:', error);
      setGetResult({
        success: false,
        message: 'GET request failed',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test POST request
  const testPost = async () => {
    setIsLoading(true);
    setPostResult(null);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(formData);
      } catch (e) {
        throw new Error('Invalid JSON data');
      }

      const data = await fetchApi(selectedEndpoint, {
        method: 'POST',
        body: JSON.stringify(parsedData)
      });
      
      setPostResult({
        success: true,
        message: 'POST request successful',
        data
      });
    } catch (error) {
      console.error('POST request failed:', error);
      setPostResult({
        success: false,
        message: 'POST request failed',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test PUT request
  const testPut = async () => {
    if (!testId) {
      setPutResult({
        success: false,
        message: 'PUT request failed',
        error: 'ID is required for PUT requests'
      });
      return;
    }

    setIsLoading(true);
    setPutResult(null);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(formData);
      } catch (e) {
        throw new Error('Invalid JSON data');
      }

      const data = await fetchApi(`${selectedEndpoint}/${testId}`, {
        method: 'PUT',
        body: JSON.stringify(parsedData)
      });
      
      setPutResult({
        success: true,
        message: 'PUT request successful',
        data
      });
    } catch (error) {
      console.error('PUT request failed:', error);
      setPutResult({
        success: false,
        message: 'PUT request failed',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test DELETE request
  const testDelete = async () => {
    if (!testId) {
      setDeleteResult({
        success: false,
        message: 'DELETE request failed',
        error: 'ID is required for DELETE requests'
      });
      return;
    }

    setIsLoading(true);
    setDeleteResult(null);
    try {
      const data = await fetchApi(`${selectedEndpoint}/${testId}`, {
        method: 'DELETE'
      });
      
      setDeleteResult({
        success: true,
        message: 'DELETE request successful',
        data
      });
    } catch (error) {
      console.error('DELETE request failed:', error);
      setDeleteResult({
        success: false,
        message: 'DELETE request failed',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format JSON for display
  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Database API Test Page</h1>
      
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Configuration</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">API Endpoint</label>
          <select 
            className="w-full p-2 border rounded"
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
          >
            {endpoints.map((endpoint) => (
              <option key={endpoint.value} value={endpoint.value}>
                {endpoint.label} ({endpoint.value})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">ID (for GET by ID, PUT, DELETE)</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            placeholder="Enter ID for specific operations"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Request Body (for POST, PUT)</label>
          <textarea 
            className="w-full p-2 border rounded font-mono text-sm"
            value={formData}
            onChange={(e) => setFormData(e.target.value)}
            rows={10}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 disabled:opacity-50"
            onClick={testGet}
            disabled={isLoading}
          >
            Test GET
          </button>
          
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 disabled:opacity-50"
            onClick={testPost}
            disabled={isLoading}
          >
            Test POST
          </button>
          
          <button 
            className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600 disabled:opacity-50"
            onClick={testPut}
            disabled={isLoading || !testId}
          >
            Test PUT
          </button>
          
          <button 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            onClick={testDelete}
            disabled={isLoading || !testId}
          >
            Test DELETE
          </button>
        </div>
        
        <div>
          {isLoading && (
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing request...</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GET Result */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">GET Result</h3>
          {getResult && (
            <div>
              <div className={`p-2 mb-2 rounded ${getResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {getResult.message}
                {!getResult.success && getResult.error && (
                  <div className="text-red-600 text-sm mt-1">{getResult.error}</div>
                )}
              </div>
              {getResult.data && (
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-60">
                  {formatJson(getResult.data)}
                </pre>
              )}
            </div>
          )}
        </div>
        
        {/* POST Result */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">POST Result</h3>
          {postResult && (
            <div>
              <div className={`p-2 mb-2 rounded ${postResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {postResult.message}
                {!postResult.success && postResult.error && (
                  <div className="text-red-600 text-sm mt-1">{postResult.error}</div>
                )}
              </div>
              {postResult.data && (
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-60">
                  {formatJson(postResult.data)}
                </pre>
              )}
            </div>
          )}
        </div>
        
        {/* PUT Result */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">PUT Result</h3>
          {putResult && (
            <div>
              <div className={`p-2 mb-2 rounded ${putResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {putResult.message}
                {!putResult.success && putResult.error && (
                  <div className="text-red-600 text-sm mt-1">{putResult.error}</div>
                )}
              </div>
              {putResult.data && (
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-60">
                  {formatJson(putResult.data)}
                </pre>
              )}
            </div>
          )}
        </div>
        
        {/* DELETE Result */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">DELETE Result</h3>
          {deleteResult && (
            <div>
              <div className={`p-2 mb-2 rounded ${deleteResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {deleteResult.message}
                {!deleteResult.success && deleteResult.error && (
                  <div className="text-red-600 text-sm mt-1">{deleteResult.error}</div>
                )}
              </div>
              {deleteResult.data && (
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-60">
                  {formatJson(deleteResult.data)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseTestPage;
