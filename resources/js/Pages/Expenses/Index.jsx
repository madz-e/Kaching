import { BottomNav } from "@/Components/BottomNav.jsx";
import { AddExpense } from "@/Pages/Expenses/AddExpense.jsx";
import { DailyExpenses } from "@/Components/DailyExpenses";
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import Overview from "@/Pages/Expenses/Overview.jsx";
import { Insights } from "@/Pages/Expenses/Insights.jsx";
import Budget from "@/Pages/Expenses/Budget.jsx";

export default function Index({ expenses, categories }) {
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [overviewSubTab, setOverviewSubTab] = useState('overview');

    const handleSaveExpense = (newData) => {
        router.post('/expenses', {
            ...newData,
            date: selectedDate.toISOString().split('T')[0],
            currency: 'MKD',
        }, {
            onSuccess: () => setIsAdding(false),
        });
    };

    const handleLogout = () => {
        router.post('/logout');
    }

    return (
        <div className="min-h-screen bg-slate-100 flex justify-center">
            <div className="w-full max-w-sm min-h-screen relative flex flex-col">
                <button
                    onClick={handleLogout}
                    className="absolute top-4 right-4 mb-5 z-10 text-sm text-slate-500 bg-white/80 px-3 py-1.5 rounded-full shadow-sm"
                >
                    Logout
                </button>

                {activeTab === 'home' && (
                    <DailyExpenses
                        expenses={expenses}
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                    />
                )}
                {activeTab === 'overview' && overviewSubTab === 'overview' && <Overview expenses={expenses} />}
                {activeTab === 'overview' && overviewSubTab === 'insights' && <Insights expenses={expenses} />}
                {activeTab === 'overview' && overviewSubTab === 'budget' && <Budget expenses={expenses} />}

                <BottomNav
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onAddClick={() => setIsAdding(true)}
                    overviewSubTab={overviewSubTab}
                    onOverviewSubTabChange={setOverviewSubTab}
                />

                {isAdding && (
                    <AddExpense
                        categories={categories}
                        onClose={() => setIsAdding(false)}
                        onSave={handleSaveExpense}
                    />
                )}
            </div>
        </div>
    );
}
