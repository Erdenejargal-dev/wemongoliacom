import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';
import Business from '@/lib/models/Business';

// GET - Get a single tour
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();

    const tour = await Tour.findById(id).populate('businessId', 'businessName logo rating contactInfo');

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json(tour, { status: 200 });
  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json({ error: 'Failed to fetch tour' }, { status: 500 });
  }
}

// PUT - Update a tour
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const business = await Business.findOne({ userId: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const tour = await Tour.findById(id);
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    if (tour.businessId.toString() !== business._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized to update this tour' }, { status: 403 });
    }

    const body = await req.json();

    const updatedTour = await Tour.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedTour, { status: 200 });
  } catch (error: any) {
    console.error('Error updating tour:', error);
    return NextResponse.json({ error: error.message || 'Failed to update tour' }, { status: 500 });
  }
}

// DELETE - Delete a tour
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const business = await Business.findOne({ userId: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const tour = await Tour.findById(id);
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    if (tour.businessId.toString() !== business._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized to delete this tour' }, { status: 403 });
    }

    await Tour.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Tour deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting tour:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete tour' }, { status: 500 });
  }
}
