import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Link from '@/models/Link';
import { nanoid } from 'nanoid';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const query: any = {};
    if (search) {
      query.$or = [
        { slug: { $regex: search, $options: 'i' } },
        { targetUrl: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const sort: any = {};
    sort[sortField] = sortOrder === 'desc' ? -1 : 1;

    const [links, total] = await Promise.all([
      Link.find(query).sort(sort).skip(skip).limit(limit),
      Link.countDocuments(query)
    ]);

    return NextResponse.json({
      links,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const { targetUrl, customAlias } = await request.json();

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(targetUrl);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid Target URL format' },
        { status: 400 }
      );
    }

    let slug = customAlias;

    if (slug) {
      const existing = await Link.findOne({ slug });
      if (existing) {
        return NextResponse.json(
          { error: 'Custom alias is already in use' },
          { status: 400 }
        );
      }
    } else {
      // Generate a unique 7-character slug
      let isUnique = false;
      while (!isUnique) {
        slug = nanoid(7);
        const existing = await Link.findOne({ slug });
        if (!existing) {
          isUnique = true;
        }
      }
    }

    const link = await Link.create({
      slug,
      targetUrl,
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}
