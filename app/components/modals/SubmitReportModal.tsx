'use client';
import { useState } from 'react';
import Button from '../shared/Button';
import Input from '../shared/Input';
import AuthService from '../../libs/authService';

interface Project {
  _id: string;
  title: string;
  description: string;
  supervisor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  department: string;
  status: string;
}

interface SubmitReportModalProps {
  project: Project;
  onClose: () => void;
  onSubmit: () => void;
}

export default function SubmitReportModal({ project, onClose, onSubmit }: SubmitReportModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    attachmentUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = AuthService.getToken();
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await fetch('/api/project-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: project._id,
          title: formData.title,
          content: formData.content,
          attachmentUrl: formData.attachmentUrl || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Report submitted successfully!');
        onSubmit();
      } else {
        setError(data.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">Submit Project Report</h2>
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Project: <span className="font-medium text-gray-900">{project.title}</span></p>
          <p className="text-sm text-gray-600">Supervisor: <span className="font-medium text-gray-900">{project.supervisor ? `${project.supervisor.firstName} ${project.supervisor.lastName}` : 'Not assigned'}</span></p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Report Title"
            id="report-title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a title for your report"
            required
          />

          <div>
            <label htmlFor="report-content" className="block text-sm font-medium text-gray-700 mb-1">
              Report Content
            </label>
            <textarea
              id="report-content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Enter your report content here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm min-h-[150px]"
              required
            />
          </div>

          <Input
            label="Attachment URL (Optional)"
            id="attachment-url"
            type="text"
            name="attachmentUrl"
            value={formData.attachmentUrl}
            onChange={handleInputChange}
            placeholder="Link to additional resources or documents"
          />
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
