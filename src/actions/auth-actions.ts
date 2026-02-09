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

    // 1. Create Auth User
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

    // 2. Create Profile Entry
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: authData.user.id,
            email: email,
            role: 'manager',
            assigned_store_id: storeId
        });

    if (profileError) {
        // Rollback? ideally yes, but for now just report
        return { message: 'User created but profile failed: ' + profileError.message, success: false };
    }

    return { message: 'Manager created successfully!', success: true };
}
