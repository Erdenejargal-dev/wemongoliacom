import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Hotel from '@/lib/models/Hotel';
import Business from '@/lib/models/Business';

// GET - Get a single hotel
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();

    const hotel = await Hotel.findById(id).populate('businessId', 'businessName logo rating contactInfo');

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json(hotel, { status: 200 });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json({ error: 'Failed to fetch hotel' }, { status: 500 });
  }
}

// PUT - Update a hotel
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

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    if (hotel.businessId.toString() !== business._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized to update this hotel' }, { status: 403 });
    }

    const body = await req.json();

    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedHotel, { status: 200 });
  } catch (error: any) {
    console.error('Error updating hotel:', error);
    return NextResponse.json({ error: error.message || 'Failed to update hotel' }, { status: 500 });
  }
}

// DELETE - Delete a hotel
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

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    if (hotel.businessId.toString() !== business._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized to delete this hotel' }, { status: 403 });
    }

    await Hotel.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Hotel deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete hotel' }, { status: 500 });
  }
}
