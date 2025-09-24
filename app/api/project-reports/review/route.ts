import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import ProjectReport from '@/app/libs/models/ProjectReport';
import Project from '@/app/libs/models/Project';
import { getAuthUser } from '@/app/libs/auth';

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const { user, error } = await getAuthUser(request);
    
    if (error || !user) {
      return error || NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only supervisors (bursary or admin) can review reports
    if (user.role !== 'bursary' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only supervisors can review project reports' },
        { status: 403 }
      );
    }

    const { reportId, status, feedback } = await request.json();

    if (!reportId || !status) {
      return NextResponse.json(
        { error: 'Report ID and status are required' },
        { status: 400 }
      );
    }

    if (!['Reviewed', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Find the report
    const report = await ProjectReport.findById(reportId).populate('project');
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Verify the supervisor is assigned to this project
    const project = report.project as any;
    
    if (project.supervisor.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'You are not authorized to review this report' },
        { status: 403 }
      );
    }

    // Update report status
    report.status = status;
    
    if (feedback) {
      report.feedback = feedback;
    }
    
    report.reviewDate = new Date();

    await report.save();

    return NextResponse.json({
      message: 'Report review submitted successfully',
      report
    });

  } catch (error) {
    console.error('Review project report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
