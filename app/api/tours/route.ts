import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';
import Business from '@/lib/models/Business';

// GET - Get all tours or tours by business
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    let query: any = { isActive: true };

    if (businessId) {
      query.businessId = businessId;
    }

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const tours = await Tour.find(query).populate('businessId', 'businessName logo rating');

    return NextResponse.json(tours, { status: 200 });
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 });
  }
}

// POST - Create a new tour
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user's business
    const business = await Business.findOne({ userId: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found. Please register your business first.' }, { status: 404 });
    }

    const body = await req.json();

    const tour = await Tour.create({
      businessId: business._id,
      ...body,
    });

    return NextResponse.json(tour, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tour:', error);
    return NextResponse.json({ error: error.message || 'Failed to create tour' }, { status: 500 });
  }
}
