import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      employeeName,
      employeeEmail,
      lastWorkingDate,
      reason,
      accountDisabled,
      emailAccessRevoked,
      systemAccessRevoked,
      apiKeysRevoked,
      assetsReturned,
      securityReviewCompleted,
      additionalNotes,
    } = body;

    if (!employeeName || !employeeEmail || !lastWorkingDate) {
      return NextResponse.json(
        {
          error: 'Employee name, email and last working date are required.',
        },
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
        {
          error: 'Unauthorized. Please login first.',
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('offboarding_records')
      .insert({
        user_id: user.id,
        employee_name: employeeName,
        employee_email: employeeEmail,
        last_working_date: lastWorkingDate,
        reason: reason || '',
        account_disabled: Boolean(accountDisabled),
        email_access_revoked: Boolean(emailAccessRevoked),
        system_access_revoked: Boolean(systemAccessRevoked),
        api_keys_revoked: Boolean(apiKeysRevoked),
        assets_returned: Boolean(assetsReturned),
        security_review_completed: Boolean(securityReviewCompleted),
        additional_notes: additionalNotes || '',
      })
      .select()
      .single();

    if (error) {
      console.log('OFFBOARDING DATABASE ERROR:', error);

      return NextResponse.json(
        {
          error: 'Failed to save offboarding record.',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Offboarding record submitted successfully.',
      record: data,
    });
  } catch (error) {
    console.log('OFFBOARDING ERROR:', error);

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