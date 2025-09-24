import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import ProjectReport from '@/app/libs/models/ProjectReport';
import Project from '@/app/libs/models/Project';
import { getAuthUser } from '@/app/libs/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const { user, error } = await getAuthUser(request);
    
    if (error || !user) {
      return error || NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // If user is a student, they can only see their own reports
    if (user.role === 'student') {
      query.student = user._id;
    } 
    // If user is a supervisor, they can see reports for projects they supervise
    else if (user.role === 'bursary' || user.role === 'admin') {
      if (projectId) {
        // Verify the supervisor is assigned to this project
        const project = await Project.findById(projectId);
        if (!project) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        
        if (project.supervisor.toString() !== user._id.toString()) {
          return NextResponse.json({ error: 'Unauthorized access to project reports' }, { status: 403 });
        }
        
        query.project = projectId;
      } else {
        // Get all projects supervised by this user
        const supervisedProjects = await Project.find({ supervisor: user._id }).select('_id');
        query.project = { $in: supervisedProjects.map(p => p._id) };
      }
    }

    if (studentId && (user.role === 'bursary' || user.role === 'admin')) {
      query.student = studentId;
    }

    if (status) {
      query.status = status;
    }

    const reports = await ProjectReport.find(query)
      .populate('project', 'title department')
      .populate('student', 'firstName lastName email matricNo')
      .sort({ submissionDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ProjectReport.countDocuments(query);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get project reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const { user, error } = await getAuthUser(request);
    
    if (error || !user) {
      return error || NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only students can submit reports
    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can submit project reports' },
        { status: 403 }
      );
    }

    const { projectId, title, content, attachmentUrl } = await request.json();

    if (!projectId || !title || !content) {
      return NextResponse.json(
        { error: 'Project ID, title, and content are required' },
        { status: 400 }
      );
    }

    // Verify the project exists and student is assigned to it
    const project = await Project.findById(projectId);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isAssigned = project.assignedStudents.some(
      (studentId: any) => studentId.toString() === user._id.toString()
    );

    if (!isAssigned) {
      return NextResponse.json(
        { error: 'You are not assigned to this project' },
        { status: 403 }
      );
    }

    // Create new project report
    const newReport = new ProjectReport({
      project: projectId,
      student: user._id,
      title,
      content,
      attachmentUrl,
      status: 'Submitted',
      submissionDate: new Date()
    });

    await newReport.save();

    return NextResponse.json({
      message: 'Project report submitted successfully',
      report: newReport
    }, { status: 201 });

  } catch (error) {
    console.error('Submit project report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
