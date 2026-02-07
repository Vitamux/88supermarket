'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../lib/supabase';
import { MapPin, Search, ChevronDown, Check, Store } from 'lucide-react';
import { useLanguageStore } from '../store/useLanguageStore';
import { translations } from '../lib/translations';

interface StoreType {
    id: string;
    name: string;
    address: string;
    district?: string;
    phone: string;
}

export default function LocationModal() {
    const { selectedStoreId, setSelectedStoreId, isLocationModalOpen, setIsLocationModalOpen } = useCartStore();
    const { lang } = useLanguageStore();
    const t = translations[lang];
    // const [isOpen, setIsOpen] = useState(false); // Removed local state
    const [files, setFiles] = useState<StoreType[]>([]);
    const [stores, setStores] = useState<StoreType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);

    // useEffect(() => {
    //     // Open modal if no store is selected
    //     if (!selectedStoreId) {
    //         setIsOpen(true);
    //     }
    // }, [selectedStoreId]);

    useEffect(() => {
        const fetchStores = async () => {
            const { data } = await supabase.from('stores').select('*');
            if (data) {
                setStores(data);
                // Set initial expanded district
                const firstDistrict = data[0]?.district || 'Other';
                setExpandedDistrict(firstDistrict);
            }
        };
        fetchStores();
    }, []);

    const handleSelectStore = (storeId: string) => {
        setSelectedStoreId(storeId);
        setIsLocationModalOpen(false);
    };

    // Group stores by district
    const groupedStores = stores.reduce((acc, store) => {
        const district = store.district || 'Other';
        if (!acc[district]) acc[district] = [];
        acc[district].push(store);
        return acc;
    }, {} as Record<string, StoreType[]>);

    // Filter grouped stores by search
    const filteredGroups = Object.keys(groupedStores).reduce((acc, district) => {
        const districtStores = groupedStores[district].filter(store =>
            store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            district.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (districtStores.length > 0) {
            acc[district] = districtStores;
        }
        return acc;
    }, {} as Record<string, StoreType[]>);

    // Map DB district names (Armenian) to translation keys
    const getLocalizedDistrict = (districtName: string) => {
        const map: Record<string, string> = {
            'Կենտրոն': t.district_Kentron,
            'Արաբկիր': t.district_Arabkir,
            'Շենգավիթ': t.district_Shengavit,
            'Սյունիք': t.district_Syunik,
            'Շիրակ': t.district_Shirak,
        };
        return map[districtName] || districtName;
    };

    if (!isLocationModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border-2 border-gray-50 overflow-hidden relative fade-in slide-in-from-bottom-10 duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/10 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none"></div>

                <div className="p-10 pb-0">
                    <button
                        onClick={() => setIsLocationModalOpen(false)}
                        className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"
                    >
                        <ChevronDown className="w-6 h-6 rotate-180" />
                    </button>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                            <MapPin className="text-[#39FF14] w-6 h-6 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter italic">
                            {t.selectStore}
                        </h2>
                    </div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] ml-16 mb-8">
                        {t.locationTitle}
                    </p>

                    <div className="relative group mb-8">
                        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#39FF14] transition-all" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.searchBranches}
                            className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#39FF14]/10 focus:border-[#39FF14] outline-none shadow-sm transition-all font-black text-gray-900 placeholder-gray-300 uppercase tracking-widest text-[11px]"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="h-[400px] overflow-y-auto px-10 pb-10 space-y-4 scrollbar-hide">
                    {Object.keys(filteredGroups).length === 0 ? (
                        <div className="text-center py-20 opacity-50">
                            <Store className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="font-black text-gray-900 uppercase tracking-widest text-xs">{t.noProducts}</p>
                        </div>
                    ) : (
                        Object.entries(filteredGroups).map(([district, districtStores]) => (
                            <div key={district} className="border-2 border-gray-100 rounded-3xl overflow-hidden bg-gray-50/30">
                                <button
                                    onClick={() => setExpandedDistrict(expandedDistrict === district ? null : district)}
                                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${expandedDistrict === district ? 'bg-[#39FF14] shadow-[0_0_10px_#39FF14]' : 'bg-gray-300'}`}></div>
                                        {getLocalizedDistrict(district)}
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedDistrict === district ? 'rotate-180' : ''}`} />
                                </button>

                                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedDistrict === district || searchQuery ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-4 space-y-2">
                                        {districtStores.map(store => (
                                            <button
                                                key={store.id}
                                                onClick={() => handleSelectStore(store.id)}
                                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all group relative overflow-hidden ${selectedStoreId === store.id ? 'bg-black border-black text-white shadow-xl' : 'bg-white border-transparent hover:border-[#39FF14]/30 hover:shadow-lg'}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className={`font-black uppercase tracking-tight italic mb-1 ${selectedStoreId === store.id ? 'text-[#39FF14]' : 'text-gray-900'}`}>{store.name}</h3>
                                                        <p className={`text-[10px] uppercase tracking-widest font-bold ${selectedStoreId === store.id ? 'text-gray-400' : 'text-gray-400'}`}>{store.address}</p>
                                                    </div>
                                                    {selectedStoreId === store.id && (
                                                        <div className="bg-[#39FF14] rounded-full p-1">
                                                            <Check className="w-4 h-4 text-black stroke-[4px]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {selectedStoreId && (
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-center">
                        <button
                            onClick={() => setIsLocationModalOpen(false)}
                            className="bg-[#39FF14] text-black px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_20px_rgba(57,255,20,0.3)] hover:scale-105 active:scale-95 transition-all"
                        >
                            Confirm Selection
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
