import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export async function POST(request) {
  try {
    const { emailText } = await request.json();

    if (!emailText || !emailText.trim()) {
      return NextResponse.json(
        { error: 'Email content is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

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
    const suspiciousKeywords = [
      'urgent',
      'password reset',
      'bank account',
      'win',
      'lottery',
      'verify your account',
      'click here immediately',
    ];

    const lowerEmail = emailText.toLowerCase();

    const isSuspicious = suspiciousKeywords.some((keyword) =>
      lowerEmail.includes(keyword)
    );

    let riskLevel = 'LOW';
    let status = 'Safe Email';
    let recommendation = 'This email does not show obvious phishing patterns.';

    if (isSuspicious) {
      riskLevel = 'HIGH';
      status = 'Potential Phishing Email Detected';
      recommendation =
        'Do not click links or share personal information. Verify the sender.';
    }

    // Save history
    const { error: dbError } = await supabase
      .from('scan_history')
      .insert({
        user_id: user.id,
        scan_type: 'email',
        input_content: emailText,
        risk_level: riskLevel,
        status,
        recommendation,
      });

    if (dbError) {
      console.log('EMAIL DATABASE ERROR:', dbError);

      return NextResponse.json(
        {
          error: 'Failed to save email scan history',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      emailText,
      riskLevel,
      status,
      recommendation,
    });

  } catch (error) {
    console.log('EMAIL SCAN ERROR:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}