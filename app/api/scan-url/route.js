import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Get logged-in user from server session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    // Basic phishing detection
    let riskLevel = 'LOW';
    let status = 'Safe Website';
    let recommendation = 'Safe to Visit';

    const suspiciousKeywords = [
      'login-free',
      'secure-bank',
      'update-account',
      'verify',
      'free',
      'paypal',
    ];

    const lowerUrl = url.toLowerCase();

    const hasSuspiciousKeyword = suspiciousKeywords.some((keyword) =>
      lowerUrl.includes(keyword)
    );

    const isHttps = lowerUrl.startsWith('https://');

    if (!isHttps || hasSuspiciousKeyword) {
      riskLevel = 'HIGH';
      status = 'Suspicious or Phishing Website Detected';
      recommendation =
        'Avoid visiting this link; it contains suspicious patterns.';
    }

    // Save scan history
    const { error: dbError } = await supabase
      .from('scan_history')
      .insert({
        user_id: user.id,
        scan_type: 'url',
        input_content: url,
        risk_level: riskLevel,
        status,
        recommendation,
      });

    if (dbError) {
      console.log('Database saving error:', dbError);

      return NextResponse.json(
        {
          error: 'Failed to save scan history',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url,
      riskLevel,
      status,
      recommendation,
    });
  } catch (error) {
    console.log('URL scan error:', error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}