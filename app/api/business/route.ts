import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Business from '@/lib/models/Business';
import User from '@/lib/models/User';

// GET - Get business info for logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const business = await Business.findOne({ userId: session.user.id });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(business, { status: 200 });
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 });
  }
}

// POST - Create a new business
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if user already has a business
    const existingBusiness = await Business.findOne({ userId: session.user.id });
    if (existingBusiness) {
      return NextResponse.json({ error: 'Business already exists for this user' }, { status: 400 });
    }

    const body = await req.json();

    const business = await Business.create({
      userId: session.user.id,
      ...body,
    });

    // Update user role to business_owner
    await User.findByIdAndUpdate(session.user.id, { role: 'business_owner' });

    return NextResponse.json(business, { status: 201 });
  } catch (error: any) {
    console.error('Error creating business:', error);
    return NextResponse.json({ error: error.message || 'Failed to create business' }, { status: 500 });
  }
}

// PUT - Update business info
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();

    const business = await Business.findOneAndUpdate(
      { userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(business, { status: 200 });
  } catch (error: any) {
    console.error('Error updating business:', error);
    return NextResponse.json({ error: error.message || 'Failed to update business' }, { status: 500 });
  }
}
