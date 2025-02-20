import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cookie from 'js-cookie';
import { toast } from 'react-toastify';
import config from '../config';

const CommentTestPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entryId, setEntryId] = useState('');

  const fetchComments = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = cookie.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${config.apiUrl}/qems/cms/entries/${id}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        setComments(response.data.data || []);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Test Page - Fetch Error:', err);
      setError(err.message);
      toast.error(`Failed to fetch comments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Comments API Test</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={entryId}
          onChange={(e) => setEntryId(e.target.value)}
          placeholder="Enter Entry ID"
          className="border p-2 mr-2 w-64"
        />
        <button
          onClick={() => fetchComments(entryId)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Fetch Comments
        </button>
      </div>

      {loading && <div className="text-gray-500">Loading comments...</div>}

      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="border p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">
                  User: {comment.postedByUsername} ({comment.postedByUserId})
                </span>
                <span className="text-gray-500">
                  {new Date(comment.postedAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-gray-800">{comment.comment}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Comment ID: {comment.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && (
          <div className="text-gray-500">No comments found for this entry</div>
        )
      )}
    </div>
  );
};

export default CommentTestPage; 