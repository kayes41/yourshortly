import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Link from '@/models/Link';
import Click from '@/models/Click';
import crypto from 'crypto';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase();
    const slug = (await params).slug;

    const link = await Link.findOne({ slug });

    if (!link) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }

    // Extract analytics data
    const headers = request.headers;
    const userAgent = headers.get('user-agent') || 'Unknown';
    const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'Unknown';
    
    // In production (e.g. Vercel), headers often contain geolocation
    const country = headers.get('x-vercel-ip-country') || 'Unknown';
    
    // Hash IP for privacy
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // Parse Browser and Device from User Agent (Simple parsing)
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let device = 'Desktop';
    if (/Mobile|Android|iP(hone|od|ad)/i.test(userAgent)) device = 'Mobile';
    else if (/Tablet|iPad/i.test(userAgent)) device = 'Tablet';

    // Asynchronously record the click and update the link count
    // We don't await this so the redirect happens instantly
    Promise.all([
      Click.create({
        slug,
        country,
        browser,
        device,
        ipHash
      }),
      Link.updateOne({ slug }, { $inc: { clicks: 1 } })
    ]).catch(err => console.error('Failed to record analytics:', err));

    // Perform the fast redirect
    return NextResponse.redirect(link.targetUrl, 302);
  } catch (error) {
    console.error('Redirect error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
