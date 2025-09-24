'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Table from '../../../components/shared/Table';
import Button from '../../../components/shared/Button';
import StatusTag from '../../../components/shared/StatusTag';
import AuthService from '../../../libs/authService';
import {
  FiFileText,
  FiUpload,
  FiRefreshCw,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiBookOpen
} from 'react-icons/fi';
import SubmitReportModal from '../../../components/modals/SubmitReportModal';

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

interface Report {
  _id: string;
  title: string;
  content: string;
  status: string;
  submissionDate: string;
  reviewDate?: string;
  feedback?: string;
  project: {
    _id: string;
    title: string;
  };
}

export default function StudentProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated using AuthService
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const userRole = AuthService.getUserRole();
    if (userRole !== 'student') {
      router.push('/');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch projects assigned to the student
      const projectsResponse = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      }

      // Fetch reports submitted by the student
      const reportsResponse = await fetch('/api/project-reports', {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.reports || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const projectColumns = [
    {
      header: 'Project Title',
      accessor: 'title',
      render: (row: Project) => (
        <div className="flex items-center">
          <FiBookOpen className="mr-2 text-indigo-500" size={16} />
          <span className="font-medium">{row.title}</span>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Supervisor',
      accessor: 'supervisor',
      render: (row: Project) => (
        <div className="flex items-center">
          <FiUser className="mr-2 text-blue-500" size={14} />
          <span>{row.supervisor ? `${row.supervisor.firstName} ${row.supervisor.lastName}` : 'Not assigned'}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: Project) => <StatusTag status={row.status} />
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (row: Project) => (
        <Button
          size="sm"
          onClick={() => {
            setSelectedProject(row);
            setIsModalOpen(true);
          }}
          className="flex items-center"
        >
          <FiUpload className="mr-1" size={14} />
          Submit Report
        </Button>
      )
    }
  ];

  const reportColumns = [
    {
      header: 'Date',
      accessor: 'submissionDate',
      render: (row: Report) => (
        <div className="flex items-center">
          <FiCalendar className="mr-2 text-gray-400" size={14} />
          {new Date(row.submissionDate).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Project',
      accessor: 'project',
      render: (row: Report) => (
        <div className="max-w-xs truncate" title={row.project?.title}>
          {row.project?.title || 'Unknown Project'}
        </div>
      )
    },
    {
      header: 'Report Title',
      accessor: 'title',
      render: (row: Report) => (
        <div className="flex items-center">
          <FiFileText className="mr-2 text-indigo-500" size={14} />
          <span className="font-medium">{row.title}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row: Report) => <StatusTag status={row.status} />
    },
    {
      header: 'Feedback',
      accessor: 'feedback',
      render: (row: Report) => (
        <div className="max-w-xs truncate" title={row.feedback}>
          {row.feedback || 'No feedback yet'}
        </div>
      )
    }
  ];

  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <FiRefreshCw className="animate-spin h-5 w-5" />
          <span className="text-lg">Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Projects" role="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">My Projects</h2>
            <p className="text-sm text-gray-600 mt-1">View your assigned projects and submit reports</p>
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center"
          >
            <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Projects Table */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiBookOpen className="mr-2 text-indigo-500" />
              Assigned Projects
              {projects.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                  {projects.length}
                </span>
              )}
            </h3>
          </div>

          {projects.length > 0 ? (
            <div className="overflow-x-auto">
              <Table columns={projectColumns} data={projects} />
            </div>
          ) : (
            <div className="text-center py-8">
              <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No projects assigned</h3>
              <p className="text-sm text-gray-500">You haven't been assigned to any projects yet.</p>
            </div>
          )}
        </div>

        {/* Reports Table */}
        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiFileText className="mr-2 text-indigo-500" />
              My Reports
              {reports.length > 0 && (
                <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                  {reports.length}
                </span>
              )}
            </h3>
          </div>

          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <Table columns={reportColumns} data={reports} />
            </div>
          ) : (
            <div className="text-center py-8">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No reports submitted</h3>
              <p className="text-sm text-gray-500">You haven't submitted any project reports yet.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedProject && (
        <SubmitReportModal
          project={selectedProject}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
          onSubmit={() => {
            fetchData();
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
