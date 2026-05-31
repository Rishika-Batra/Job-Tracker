import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Job } from '@/lib/types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { company, role, url, notes, status, applied_date } = body;

    // Guard: only allow known statuses
    const VALID_STATUSES = ['applied', 'interview', 'offer', 'accepted', 'rejected'];
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status "${status}". Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Build the update payload
    const updateData: Partial<Job> = {};
    if (company !== undefined) updateData.company = company;
    if (role !== undefined) updateData.role = role;
    if (url !== undefined) updateData.url = url;
    if (notes !== undefined) updateData.notes = notes;
    if (applied_date !== undefined) updateData.applied_date = applied_date;
    
    // Explicitly update updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // If status change is requested, handle status history log
    if (status !== undefined) {
      // 1. Fetch current status of the job
      const { data: currentJob, error: fetchError } = await supabase
        .from('jobs')
        .select('status')
        .eq('id', id)
        .single();

      if (fetchError || !currentJob) {
        return NextResponse.json(
          { error: fetchError?.message || 'Job not found' },
          { status: 404 }
        );
      }

      const oldStatus = currentJob.status;

      // Only insert history and update status if it actually changed
      if (oldStatus !== status) {
        updateData.status = status;

        // 2. Insert record into status_history
        const { error: historyError } = await supabase
          .from('status_history')
          .insert({
            job_id: id,
            old_status: oldStatus,
            new_status: status,
          });

        if (historyError) {
          return NextResponse.json(
            { error: `Failed to log status history: ${historyError.message}` },
            { status: 500 }
          );
        }
      }
    }

    // 3. Update the job
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updatedJob);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete the job from the database
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
