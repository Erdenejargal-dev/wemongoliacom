import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Content from '@/lib/models/Content';

// GET all content
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    
    const query = section ? { section, isActive: true } : { isActive: true };
    const content = await Content.find(query).sort({ order: 1 });
    
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// POST new content
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const content = await Content.create(body);
    
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 400 }
    );
  }
}
