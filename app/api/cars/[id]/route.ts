import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Car from '@/lib/models/Car';
import Business from '@/lib/models/Business';

// GET - Get a single car
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();

    const car = await Car.findById(id).populate('businessId', 'businessName logo rating contactInfo');

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json(car, { status: 200 });
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 });
  }
}

// PUT - Update a car
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

    const car = await Car.findById(id);
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    if (car.businessId.toString() !== business._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized to update this car' }, { status: 403 });
    }

    const body = await req.json();

    const updatedCar = await Car.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedCar, { status: 200 });
  } catch (error: any) {
    console.error('Error updating car:', error);
    return NextResponse.json({ error: error.message || 'Failed to update car' }, { status: 500 });
  }
}

// DELETE - Delete a car
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

    const car = await Car.findById(id);
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    if (car.businessId.toString() !== business._id.toString()) {
      return NextResponse.json({ error: 'Unauthorized to delete this car' }, { status: 403 });
    }

    await Car.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Car deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting car:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete car' }, { status: 500 });
  }
}
