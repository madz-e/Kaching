import {
    Cancel01Icon,
    CreditCardIcon,
    BanknoteIcon,
    Camera01Icon,
    Loading03Icon,
    Calendar03Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from "react";
import { CategoryIcon } from "@/Components/CategoryIcon.jsx";
import axios from 'axios';

export function AddExpense({ onClose, categories, onSave }) {
    const [paymentMethod, setPaymentMethod] = useState('card')
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedSubcategory, setSelectedSubcategory] = useState(null)
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [currency, setCurrency] = useState('MKD')
    const [isScanning, setIsScanning] = useState(false)

    const handleCategorySelect = (category) => {
        setSelectedCategory(category)
        setSelectedSubcategory(null)
    }

    const handleReceiptScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        const formData = new FormData();
        formData.append('receipt', file);

        try {
            const response = await axios.post('/api/scan-receipt', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const data = response.data;

            if (data.amount) {
                setAmount(data.amount.toString());
            }
            if (data.date) {
                setDate(data.date);
            }

            if (data.category_id && categories) {
                let matchedCategory = null;
                let matchedSubcategory = null;

                for (const cat of categories) {
                    if (cat.id === data.category_id) {
                        matchedCategory = cat;
                        break;
                    }
                    const sub = cat.subcategories?.find(s => s.id === data.category_id);
                    if (sub) {
                        matchedCategory = cat;
                        matchedSubcategory = sub;
                        break;
                    }
                }

                if (matchedCategory) {
                    setSelectedCategory(matchedCategory);
                    if (matchedSubcategory) {
                        setSelectedSubcategory(matchedSubcategory);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            const errors = error.response?.data?.errors;
            alert(errors ? JSON.stringify(errors) : (error.response?.data?.message || error.message));
        } finally {
            setIsScanning(false);
        }
    };

    const handleSave = () => {
        const val = parseFloat(amount)
        if (val > 0 && selectedCategory) {
            onSave({
                category_id: selectedSubcategory?.id || selectedSubcategory || selectedCategory.id,
                amount: val,
                currency: currency,
                payment_method: paymentMethod,
                type: selectedCategory.name === 'Income' ? 'income' : 'expense',
                name: (typeof selectedSubcategory === 'string' ? selectedSubcategory : selectedSubcategory?.name) || selectedCategory.name,
                date: date,
            })
        }
    }

    return (
        <div className="flex flex-col overflow-y-auto scrollbar-hide p-6 bg-gradient-to-br from-indigo-100 via-purple-100/80 to-pink-100 absolute inset-0 z-50 backdrop-blur-2xl">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 cursor-pointer bg-white/70 hover:bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-full shadow-lg shadow-purple-200/50 border border-white/80 text-violet-700 text-xs font-semibold tracking-wide transition-all active:scale-95">
                    {isScanning ? (
                        <div className="animate-spin flex items-center justify-center">
                            <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={2} className="text-violet-600" />
                        </div>
                    ) : (
                        <HugeiconsIcon icon={Camera01Icon} size={16} strokeWidth={2} className="text-violet-600 drop-shadow-sm" />
                    )}
                    <span>{isScanning ? 'Reading...' : 'Scan Receipt'}</span>
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleReceiptScan}
                        disabled={isScanning}
                    />
                </label>

                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-xl text-slate-700 shadow-md shadow-purple-200/40 border border-white/80 transition-all active:scale-95"
                >
                    <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2} />
                </button>
            </div>

            {/* Header & Amount Section */}
            <div className="flex flex-col items-center">
                <h1 className="text-sm font-semibold tracking-wider text-violet-900/60 uppercase mt-1">Add Expense</h1>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-violet-300 to-transparent mt-1.5 mb-2 mx-auto" />

                {/* Amount Input Box (Expanded width and responsive font sizing for long numbers) */}
                <div className="flex w-full px-2 py-4 items-center justify-center gap-2">
                    <input
                        type="number"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full max-w-[280px] text-center bg-transparent border-none text-4xl sm:text-5xl font-light text-slate-800 focus:outline-none"
                    />
                    <span className="text-3xl sm:text-4xl text-slate-400 font-light shrink-0">{currency}</span>
                </div>

                {/* Date Picker (Simple & Flat) */}
                <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
                    <HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={2} className="text-violet-500" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-slate-700"
                    />
                </div>

                {/* Glossy Payment Method Switcher */}
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl flex p-1.5 gap-1.5 shadow-lg shadow-purple-200/40 mb-4 w-full max-w-xs">
                    <button
                        onClick={() => setPaymentMethod('card')}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all
                        ${paymentMethod === 'card'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-300/50 scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-700'}`}>
                        <HugeiconsIcon icon={CreditCardIcon} size={16} strokeWidth={2} />
                        Card
                    </button>
                    <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all
                        ${paymentMethod === 'cash'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-300/50 scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-700'}`}>
                        <HugeiconsIcon icon={BanknoteIcon} size={16} strokeWidth={2} />
                        Cash
                    </button>
                </div>

                {/* Categories Grid */}
                <div className="flex flex-col w-full">
                    <span className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-violet-900/60">Category</span>
                    <div className="grid grid-cols-3 gap-3">
                        {categories.map((category) => {
                            const isSelected = selectedCategory?.id === category.id
                            return (
                                <button
                                    key={`category-${category.name}`}
                                    onClick={() => handleCategorySelect(category)}
                                    className={`relative overflow-hidden flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all aspect-square border ${
                                        isSelected
                                            ? 'bg-gradient-to-b from-indigo-200/90 via-purple-200/80 to-pink-200/80 border-white shadow-xl shadow-purple-400/30 scale-105 ring-2 ring-indigo-400/50'
                                            : 'bg-gradient-to-b from-white/70 via-white/40 to-white/30 hover:from-white/90 hover:to-white/50 border-white/60 shadow-md shadow-purple-100/50'
                                    }`}>
                                    {/* Top Glossy Sheen Overlay */}
                                    <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-2xl" />

                                    <CategoryIcon category={category.name} size="sm" />
                                    <span className="text-sm font-bold text-slate-800 mt-1.5 text-center leading-tight tracking-tight line-clamp-2 z-10">{category.name}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Subcategories Grid */}
                    {selectedCategory && selectedCategory.subcategories && (
                        <>
                            <span className="px-2 pt-5 pb-2 text-xs font-bold uppercase tracking-wider text-violet-900/60">Subcategory</span>
                            <div className="grid grid-cols-3 gap-2.5">
                                {selectedCategory.subcategories.map((subcategory) => {
                                    const subName = typeof subcategory === 'string' ? subcategory : subcategory.name;
                                    const isSelected = typeof selectedSubcategory === 'string'
                                        ? selectedSubcategory === subName
                                        : selectedSubcategory?.id === subcategory.id;

                                    return (
                                        <div
                                            key={subName}
                                            className={`rounded-xl transition-all ${
                                                isSelected ? 'bg-gradient-to-r from-indigo-500 to-pink-500 p-[1.5px] shadow-lg shadow-pink-200/40 scale-[1.02]' : 'p-0'
                                            }`}
                                        >
                                            <button
                                                onClick={() => setSelectedSubcategory(subcategory)}
                                                className={`relative overflow-hidden w-full h-full px-2 py-3 rounded-xl text-sm font-medium transition-all text-center flex items-center justify-center leading-snug whitespace-normal ${
                                                    isSelected
                                                        ? 'bg-white/90 backdrop-blur-md text-violet-900 font-semibold shadow-none'
                                                        : 'bg-gradient-to-b from-white/70 via-white/40 to-white/30 hover:from-white/90 hover:to-white/50 backdrop-blur-md border border-white/60 text-slate-700 shadow-sm'
                                                }`}
                                            >
                                                {/* Top Glossy Sheen Overlay */}
                                                <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-xl" />

                                                <span className="font-bold text-slate-800 tracking-tight line-clamp-2 z-10">{subName}</span>
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}

                    {/* Save Button */}
                    <div className="p-4 pt-6 shrink-0">
                        <button
                            disabled={!(parseFloat(amount) > 0)}
                            onClick={handleSave}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-base shadow-xl shadow-purple-400/40 hover:shadow-purple-400/60 active:scale-[0.99] transition-all disabled:opacity-40 disabled:shadow-none"
                        >
                            Save Expense
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
