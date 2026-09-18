import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get currently logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('HISTORY AUTH ERROR:', authError);

      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: authError?.message || 'User not logged in',
        },
        { status: 401 }
      );
    }

    console.log('HISTORY USER:', user.id);

    // Get only this user's scan history
    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('HISTORY DATABASE ERROR:', error);

      return NextResponse.json(
        {
          error: 'Database error',
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log('HISTORY DATA:', data);

    return NextResponse.json({
      history: data || [],
    });
  } catch (error) {
    console.log('HISTORY SERVER ERROR:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}