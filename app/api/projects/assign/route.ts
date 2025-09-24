import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/libs/mongodb';
import Project from '@/app/libs/models/Project';
import User from '@/app/libs/models/User';
import { getAuthUser } from '@/app/libs/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const { user, error } = await getAuthUser(request);
    
    if (error || !user) {
      return error || NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Only supervisors (bursary or admin) can assign students to projects
    if (user.role !== 'bursary' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only supervisors can assign students to projects' },
        { status: 403 }
      );
    }

    const { projectId, studentId } = await request.json();

    if (!projectId || !studentId) {
      return NextResponse.json(
        { error: 'Project ID and student ID are required' },
        { status: 400 }
      );
    }

    // Find the project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify the supervisor owns this project
    if (project.supervisor.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'You are not authorized to modify this project' },
        { status: 403 }
      );
    }

    // Verify the student exists
    const student = await User.findById(studentId);
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (student.role !== 'student') {
      return NextResponse.json(
        { error: 'User is not a student' },
        { status: 400 }
      );
    }

    // Check if project is already at max capacity
    if (project.assignedStudents.length >= project.maxStudents) {
      return NextResponse.json(
        { error: 'Project has reached maximum student capacity' },
        { status: 400 }
      );
    }

    // Check if student is already assigned to this project
    if (project.assignedStudents.some(id => id.toString() === studentId)) {
      return NextResponse.json(
        { error: 'Student is already assigned to this project' },
        { status: 400 }
      );
    }

    // Add student to project
    project.assignedStudents.push(studentId);
    
    // If project reaches max capacity, close it
    if (project.assignedStudents.length >= project.maxStudents) {
      project.status = 'Closed';
    }

    await project.save();

    return NextResponse.json({
      message: 'Student assigned to project successfully',
      project
    });

  } catch (error) {
    console.error('Assign student to project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
