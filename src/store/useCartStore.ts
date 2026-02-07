import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface CartItem {
    id: number;
    name: string;
    display_names: { en: string; ru: string; am: string };
    price: number;
    quantity: number;
    image_url?: string;
}

export interface Order {
    id: string;
    customer: {
        name: string;
        address: string;
        phone: string;
    };
    items: CartItem[];
    total: number;
    date: string; // ISO string
    status: 'Pending Pickup' | 'Packing' | 'Out for Delivery' | 'Completed';
}

interface CartStore {
    items: CartItem[];
    orders: Order[];
    searchQuery: string;
    selectedStoreId: string | null;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, delta: number) => void;
    clearCart: () => void;
    setSearchQuery: (query: string) => void;
    setSelectedStoreId: (id: string | null) => void;
    placeOrder: (customer: Order['customer']) => Promise<string>;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    getItemCount: () => number;
    getTotalPrice: () => number;
    isLocationModalOpen: boolean;
    setIsLocationModalOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            orders: [],
            searchQuery: '',
            selectedStoreId: null,
            isLocationModalOpen: false,
            setIsLocationModalOpen: (isOpen) => set({ isLocationModalOpen: isOpen }),
            addItem: (item) => set((state) => {
                const existingItem = state.items.find((i) => i.id === item.id);
                if (existingItem) {
                    return {
                        items: state.items.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    };
                }
                // Ensure display_names is present or fall back to name for all keys to avoid errors
                const safeItem = {
                    ...item,
                    display_names: item.display_names || { en: item.name, ru: item.name, am: item.name },
                    quantity: 1
                };
                return { items: [...state.items, safeItem] };
            }),
            removeItem: (id) => set((state) => ({
                items: state.items.filter((i) => i.id !== id),
            })),
            updateQuantity: (id, delta) => set((state) => ({
                items: state.items.map((item) => {
                    if (item.id === id) {
                        const newQuantity = Math.max(1, item.quantity + delta);
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                })
            })),
            clearCart: () => set({ items: [] }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setSelectedStoreId: (id) => set({ selectedStoreId: id }),
            placeOrder: async (customer) => {
                const state = get();
                const total = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                const { data, error } = await supabase
                    .from('orders')
                    .insert([
                        {
                            customer_name: customer.name,
                            total_price: total,
                            items: state.items,
                            store_id: state.selectedStoreId
                        }
                    ])
                    .select()
                    .single();

                if (error) {
                    console.error('Error placing order:', error);
                    alert('Failed to place order. Please try again.');
                    return '';
                }

                alert('Order sent to 88 Supermarket');
                set({ items: [] });
                return data.id;
            },
            updateOrderStatus: (orderId, status) => set((state) => ({
                orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
            })),
            getItemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            getTotalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        }),
        {
            name: 'eighty-eight-cart-storage',
            partialize: (state) => ({ items: state.items, orders: state.orders, selectedStoreId: state.selectedStoreId }),
        }
    )
);
