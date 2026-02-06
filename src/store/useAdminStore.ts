import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminRole = 'owner' | 'manager';

export interface AdminProfile {
    id: string;
    email: string;
    role: AdminRole;
    assigned_store_id: string | null;
}

interface AdminState {
    profile: AdminProfile | null;
    activeStoreId: string | null; // For owners to switch branches, for managers it's fixed
    setProfile: (profile: AdminProfile | null) => void;
    setActiveStoreId: (storeId: string | null) => void;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            profile: null,
            activeStoreId: null,
            setProfile: (profile) => set({
                profile,
                activeStoreId: profile?.role === 'manager' ? profile.assigned_store_id : null
            }),
            setActiveStoreId: (activeStoreId) => set({ activeStoreId }),
        }),
        {
            name: '88-admin-storage',
        }
    )
);
