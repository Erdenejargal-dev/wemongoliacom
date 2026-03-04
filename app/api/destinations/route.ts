import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Destination from '@/lib/models/Destination';

// GET all destinations
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    
    let query: any = {};
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    
    const destinations = await Destination.find(query);
    
    return NextResponse.json(destinations);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

// POST new destination
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const destination = await Destination.create(body);
    
    return NextResponse.json(destination, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create destination' },
      { status: 400 }
    );
  }
}
