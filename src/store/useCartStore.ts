import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
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
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;
    setSearchQuery: (query: string) => void;
    placeOrder: (customer: Order['customer']) => string; // Returns Order ID
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    count: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            orders: [],
            searchQuery: '',
            addItem: (item) => set((state) => {
                const existingItem = state.items.find((i) => i.id === item.id);
                if (existingItem) {
                    return {
                        items: state.items.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    };
                }
                return { items: [...state.items, { ...item, quantity: 1 }] };
            }),
            removeItem: (id) => set((state) => ({
                items: state.items.filter((i) => i.id !== id),
            })),
            clearCart: () => set({ items: [] }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            placeOrder: (customer) => {
                const state = get();
                const subtotal = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                const total = subtotal + 5.00; // $5 Delivery Fee
                const orderId = `KS-${Math.floor(1000 + Math.random() * 9000)}`;

                const newOrder: Order = {
                    id: orderId,
                    customer,
                    items: [...state.items],
                    total,
                    date: new Date().toISOString(),
                    status: 'Pending Pickup'
                };

                set((state) => ({
                    orders: [newOrder, ...state.orders],
                    items: [] // Clear cart
                }));

                return orderId;
            },
            updateOrderStatus: (orderId, status) => set((state) => ({
                orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
            })),
            count: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
        }),
        {
            name: 'kaiser-cart-storage',
            // We don't want to persist searchQuery usually, but for simplicity we can or use partialize
            partialize: (state) => ({ items: state.items, orders: state.orders }),
        }
    )
);
