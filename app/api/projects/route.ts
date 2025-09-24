import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import Project from '@/app/libs/models/Project';
import User from '@/app/libs/models/User';
import { getAuthUser } from '@/app/libs/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get('supervisorId');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (supervisorId) {
      query.supervisor = supervisorId;
    }

    if (department) {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('supervisor', 'firstName lastName email')
      .populate('assignedStudents', 'firstName lastName email matricNo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
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

    // Only supervisors (faculty) can create projects
    if (user.role !== 'admin' && user.role !== 'bursary') {
      return NextResponse.json(
        { error: 'Only faculty members can create projects' },
        { status: 403 }
      );
    }

    const { title, description, department, maxStudents } = await request.json();

    if (!title || !description || !department) {
      return NextResponse.json(
        { error: 'Title, description, and department are required' },
        { status: 400 }
      );
    }

    // Create new project
    const newProject = new Project({
      title,
      description,
      supervisor: user._id,
      department,
      maxStudents: maxStudents || 1,
      assignedStudents: [],
      status: 'Open'
    });

    await newProject.save();

    return NextResponse.json({
      message: 'Project created successfully',
      project: newProject
    }, { status: 201 });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
