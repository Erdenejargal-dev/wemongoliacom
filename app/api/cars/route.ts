import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Car from '@/lib/models/Car';
import Business from '@/lib/models/Business';

// GET - Get all cars or cars by business
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');
    const city = searchParams.get('city');
    const category = searchParams.get('category');

    let query: any = { isActive: true };

    if (businessId) {
      query.businessId = businessId;
    }

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (category) {
      query.category = category;
    }

    const cars = await Car.find(query).populate('businessId', 'businessName logo rating');

    return NextResponse.json(cars, { status: 200 });
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
  }
}

// POST - Create a new car
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

    const car = await Car.create({
      businessId: business._id,
      ...body,
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error: any) {
    console.error('Error creating car:', error);
    return NextResponse.json({ error: error.message || 'Failed to create car' }, { status: 500 });
  }
}
