'use client';

import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');

    const inventory = [
        { id: 1, name: "Organic Honeycrisp Apples", stock: 120, status: "In Stock" },
        { id: 2, name: "Artisan Sourdough Bread", stock: 15, status: "Low Stock" },
        { id: 3, name: "Premium Grass-Fed Ribeye", stock: 42, status: "In Stock" },
        { id: 4, name: "Farm Fresh Eggs (Dozen)", stock: 8, status: "Critical" },
    ];

    const totalRevenue = inventory.reduce((acc, item) => {
        const prices: { [key: number]: number } = { 1: 3.99, 2: 6.49, 3: 24.99, 4: 5.99 };
        return acc + (item.stock * (prices[item.id] || 0));
    }, 0);

    const orders = useCartStore((state) => state.orders);
    const updateOrderStatus = useCartStore((state) => state.updateOrderStatus);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Kaiser Inventory Management</h1>
                    <span className="bg-kaiser-green-100 text-kaiser-green-700 px-4 py-2 rounded-full font-semibold">Admin Mode</span>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 border-b border-gray-200">
                    <button
                        className={`pb-4 px-2 font-semibold ${activeTab === 'inventory' ? 'text-kaiser-green-600 border-b-2 border-kaiser-green-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        Inventory Overview
                    </button>
                    <button
                        className={`pb-4 px-2 font-semibold ${activeTab === 'orders' ? 'text-kaiser-green-600 border-b-2 border-kaiser-green-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Active Orders
                    </button>
                </div>

                {activeTab === 'inventory' ? (
                    <>
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                                <h3 className="text-gray-500 font-medium">Total Items in Stock</h3>
                                <p className="text-3xl font-bold text-gray-900">{inventory.reduce((acc, i) => acc + i.stock, 0)}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
                                <h3 className="text-gray-500 font-medium">Total Potential Revenue</h3>
                                <p className="text-3xl font-bold text-kaiser-green-600">${totalRevenue.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Product Name</th>
                                        <th className="p-4">Stock Level</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {inventory.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-mono text-gray-500">#{item.id}</td>
                                            <td className="p-4 font-semibold text-gray-900">{item.name}</td>
                                            <td className="p-4 text-gray-700">{item.stock} units</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'In Stock' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
                                <tr>
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Items</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No active orders found.</td></tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-mono font-bold text-gray-900">#{order.id}</td>
                                            <td className="p-4">
                                                <div className="font-semibold">{order.customer.name}</div>
                                                <div className="text-xs text-gray-500">{order.customer.address}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                            </td>
                                            <td className="p-4 font-bold text-kaiser-green-600">${order.total.toFixed(2)}</td>
                                            <td className="p-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                                    className="bg-gray-100 border-none rounded-lg text-sm font-medium px-3 py-1 cursor-pointer focus:ring-2 focus:ring-kaiser-green-500"
                                                >
                                                    <option>Pending Pickup</option>
                                                    <option>Packing</option>
                                                    <option>Out for Delivery</option>
                                                    <option>Completed</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
