import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Link from '@/models/Link';
import Click from '@/models/Click';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const slug = (await params).slug;

    const link = await Link.findOne({ slug });
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Optional: Fetch advanced stats here if needed, but usually we just return the link
    return NextResponse.json(link);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch link' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const slug = (await params).slug;
    const { targetUrl } = await request.json();

    if (!targetUrl) {
      return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
    }

    try {
      new URL(targetUrl);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Target URL format' }, { status: 400 });
    }

    const updatedLink = await Link.findOneAndUpdate(
      { slug },
      { targetUrl },
      { new: true }
    );

    if (!updatedLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLink);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const slug = (await params).slug;

    const deletedLink = await Link.findOneAndDelete({ slug });
    
    if (!deletedLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Also delete associated clicks
    await Click.deleteMany({ slug });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
