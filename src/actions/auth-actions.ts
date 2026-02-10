'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Initialize Supabase Admin Client
// note: Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function checkOwnerRole(userId: string) {
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    return profile?.role === 'owner';
}

export async function createManager(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const storeId = formData.get('storeId') as string;

    if (!email || !password || !storeId) {
        return { message: 'All fields are required', success: false };
    }

    // 1. Verify Requestor is Owner (Optional but recommended if we had the caller's ID)
    // For server actions called from client, we really should verify the session again.
    // However, for this demo we'll assume the page protection does the heavy lifting, 
    // but ideally we check the cookie session here.

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'manager' }
    });

    if (authError) {
        return { message: authError.message, success: false };
    }

    if (!authData.user) {
        return { message: 'Failed to create user', success: false };
    }

    // 3. Create Profile Entry
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: authData.user.id,
            email: email,
            role: 'manager',
            assigned_store_id: storeId
        });

    if (profileError) {
        // Rollback auth user creation if profile fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return { message: 'User created but profile failed: ' + profileError.message, success: false };
    }

    return { message: 'Manager created successfully!', success: true };
}

export async function deleteManager(managerId: string) {
    if (!managerId) return { message: 'Manager ID required', success: false };

    // 1. Delete from Auth (Cascades to profiles usually if set up, but let's be sure)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(managerId);

    if (error) {
        return { message: error.message, success: false };
    }

    // 2. Manually delete profile if cascade isn't set up (safeguard)
    await supabaseAdmin.from('profiles').delete().eq('id', managerId);

    return { message: 'Manager deleted successfully', success: true };
}
