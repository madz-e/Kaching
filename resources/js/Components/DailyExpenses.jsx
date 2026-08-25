import {useState} from "react";
import {ExpenseItem} from "@/Components/ExpenseItem.jsx";
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function DailyExpenses({expenses, selectedDate, onDateChange}) {
    const currentDate = selectedDate;
    const dateKey = currentDate.toISOString().split('T')[0]; //datata ja seckame
    //trosoci filtrirame po data or ako nema davame praznna lista TROSOCI TUKA
    const dayItems = expenses[dateKey] || [];

    const totalIncome=dayItems.filter(expense => expense.type==='income')
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const totalExpense=dayItems.filter(expense => expense.type==='expense')
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const balance = totalIncome-totalExpense;

    // console.log(dayItems)

    const goBack = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 1);
        onDateChange(prev);
    }

    const goForward = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 1);
        const today = new Date().toISOString().split('T')[0];
        if (next.toISOString().split('T')[0] > today) return;
        onDateChange(next);
    };

    const dateString = currentDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
    }).toUpperCase();

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 p-4">
            <div className="text-center flex mt-5 ">
                <button
                    onClick={goBack}
                    className="p-5 flex-1  flex items-center justify-center text-violet-400">
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={24} strokeWidth={2} />
                </button>
                <div className="">
                    <span className="text-violet-400 text-base font-bold tracking-widest mb-2">
                    {dateString}
                    </span>
                    <h1 className={`text-5xl font-medium tracking-tight mt-2 mb-2 ${balance>0?'text-green-600':'text-violet-950'}`}>
                        {Math.abs(balance).toLocaleString()} MKD
                    </h1>
                </div>
                <button
                    onClick={goForward}
                    className="p-5 flex-1 flex items-center justify-center text-violet-400">
                    <HugeiconsIcon icon={ArrowRight01Icon} size={24} strokeWidth={2} />
                </button>
            </div>
            <div className="w-1/2 h-px bg-violet-300 m-4 mx-auto" />
            {dayItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-slate-400 text-sm">Today's a new start!💞</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2 mt-4">
                    {dayItems.map((expense) => (
                        <ExpenseItem key={expense.id} expense={expense} />
                    ))}
                </div>
            )}
        </div>
    )
}
