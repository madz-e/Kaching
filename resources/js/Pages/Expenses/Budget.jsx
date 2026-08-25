import { useMemo, useState } from "react";
import {
    Wallet01Icon,
    PiggyBankIcon,
    BitcoinReceiptIcon,
    ShoppingCart01Icon,
    CheckCircle,
    ChartLineIcon,
    AlertCircleIcon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const STRATEGIES = {
    strict: {
        id: 'strict',
        name: 'Super Saver',
        savingsRate: 0.30,
        description: 'Aggressive wealth building. Maximizes future savings.'
    },
    balanced: {
        id: 'balanced',
        name: 'Balanced (50/30/20)',
        savingsRate: 0.20,
        description: 'Healthy mix of savings, needs, and discretionary spending.'
    },
    relaxed: {
        id: 'relaxed',
        name: 'Relaxed',
        savingsRate: 0.10,
        description: 'Lower savings rate prioritizing lifestyle flexibility.'
    }
};

export default function Budget({ expenses }) {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());

    // Strategy selection
    const [strategyKey, setStrategyKey] = useState('balanced');
    const strategy = STRATEGIES[strategyKey];

    // Income handling: auto vs manual override
    const allItems = useMemo(() => Object.values(expenses).flat(), [expenses]);

    const prevMonthFiltered = useMemo(() => {
        let targetMonth = month - 1;
        let targetYear = year;
        if (targetMonth < 0) {
            targetMonth = 11;
            targetYear = year - 1;
        }
        return allItems.filter(exp => {
            const d = new Date(exp.date);
            return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        });
    }, [allItems, month, year]);

    // Calculate actual previous month's income automatically
    const autoCalculatedIncome = useMemo(() => {
        return prevMonthFiltered
            .filter(exp => (exp.category?.parent?.name || exp.category?.name) === 'Income')
            .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    }, [prevMonthFiltered]);

    const [isManualIncome, setIsManualIncome] = useState(false);
    const [manualIncomeInput, setManualIncomeInput] = useState('');

    const effectiveIncome = isManualIncome ? (parseFloat(manualIncomeInput) || 0) : autoCalculatedIncome;

    // Calculate historical averages for Bills & Groceries from prev month
    const historicalBills = useMemo(() => {
        return prevMonthFiltered
            .filter(exp => {
                const parent = exp.category?.parent?.name || '';
                const child = exp.category?.name || '';
                return parent === 'Bills' || parent === 'Utilities' || child.toLowerCase().includes('bill') || child.toLowerCase().includes('utility');
            })
            .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    }, [prevMonthFiltered]);

    const historicalGroceries = useMemo(() => {
        return prevMonthFiltered
            .filter(exp => {
                const parent = exp.category?.parent?.name || '';
                const child = exp.category?.name || '';
                return parent === 'Groceries' || parent === 'Food' || child.toLowerCase().includes('grocery') || child.toLowerCase().includes('market');
            })
            .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    }, [prevMonthFiltered]);

    // Fallback estimates if no data found
    const targetBills = historicalBills > 0 ? historicalBills : Math.round(effectiveIncome * 0.25);
    const targetGroceries = historicalGroceries > 0 ? historicalGroceries : Math.round(effectiveIncome * 0.15);

    // Remaining allocations based on chosen strategy
    const targetSavings = Math.round(effectiveIncome * strategy.savingsRate);
    const totalNeedsAndSavings = targetBills + targetGroceries + targetSavings;
    const disposableWants = Math.max(0, effectiveIncome - totalNeedsAndSavings);

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-indigo-100 via-purple-100/80 to-pink-100 p-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <span className="text-violet-600 text-sm font-bold tracking-wider uppercase block mb-1">
                    Financial Planner
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-violet-950">
                    Budget Blueprint
                </h1>
                <p className="text-base font-medium text-slate-700 mt-1">Automated allocations based on last month's activity.</p>
            </div>

            {/* Income Configuration Card */}
            <div className="bg-white rounded-2xl border border-white/80 p-5 mb-5 shadow-md shadow-purple-100/50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <HugeiconsIcon icon={Wallet01Icon} size={18} strokeWidth={2} className="text-violet-600" />
                        <span className="text-sm font-bold uppercase tracking-wider text-violet-500">Monthly Income Base</span>
                    </div>
                    <button
                        onClick={() => setIsManualIncome(!isManualIncome)}
                        className="text-sm font-semibold text-violet-700 hover:text-violet-900 transition-colors"
                    >
                        {isManualIncome ? 'Use auto-detected' : 'Edit manually'}
                    </button>
                </div>

                {isManualIncome ? (
                    <div className="flex items-center gap-2.5">
                        <input
                            type="number"
                            value={manualIncomeInput}
                            onChange={(e) => setManualIncomeInput(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-semibold text-violet-950 focus:outline-none focus:border-violet-400 transition-colors"
                        />
                        <span className="text-sm font-bold text-violet-600 shrink-0">MKD</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold tracking-tight text-violet-950">
                            {autoCalculatedIncome.toLocaleString()} <span className="text-sm font-bold text-violet-600">MKD</span>
                        </span>
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                            <HugeiconsIcon icon={CheckCircle} size={16} strokeWidth={2} />
                            Auto-detected
                        </div>
                    </div>
                )}
            </div>

            {/* Strategy Selection */}
            <div className="mb-6">
                <label className="text-sm font-bold uppercase tracking-wider text-violet-800 block mb-2 px-0.5">Savings Strategy</label>
                <div className="grid grid-cols-3 gap-3">
                    {Object.values(STRATEGIES).map(s => {
                        const isSelected = strategyKey === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setStrategyKey(s.id)}
                                className={`text-left p-6 rounded-2xl border transition-all flex flex-col items-center justify-between ${
                                    isSelected
                                        ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                                        : 'bg-white text-slate-800 border-white/80 hover:border-slate-200 shadow-sm'
                                }`}
                            >
                                <span className="text-sm font-bold">{s.name.split(' ')[0]}</span>
                                <span className={`text-xs font-semibold mt-1 ${isSelected ? 'text-violet-200' : 'text-violet-700'}`}>
                                    {s.savingsRate * 100}% save
                                </span>
                            </button>
                        );
                    })}
                </div>
                <p className="text-sm font-medium text-slate-600 mt-2 px-0.5 italic">{strategy.description}</p>
            </div>

            {/* Allocation Breakdown */}
            <div className="space-y-3 mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-violet-800 px-0.5">Allocation Breakdown</h2>

                <div className="bg-white rounded-2xl border border-white/80 shadow-md shadow-purple-100/50 p-2 space-y-1">
                    {/* Savings Allocation */}
                    <div className="p-3.5 flex items-center justify-between rounded-xl hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-3.5 min-w-0 pr-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                                <HugeiconsIcon icon={PiggyBankIcon} size={20} strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-base font-bold text-violet-950 block">Target Savings</span>
                                <span className="text-sm font-medium text-slate-600 block">{strategy.savingsRate * 100}% of monthly income</span>
                            </div>
                        </div>
                        <span className="text-base font-bold text-emerald-700 shrink-0 text-right">
                            {targetSavings.toLocaleString()} <span className="text-sm font-semibold text-slate-600">MKD</span>
                        </span>
                    </div>

                    {/* Bills Allocation */}
                    <div className="p-3.5 flex items-center justify-between rounded-xl hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-3.5 min-w-0 pr-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold shrink-0">
                                <HugeiconsIcon icon={BitcoinReceiptIcon} size={20} strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-base font-bold text-violet-950 block">Bills & Utilities</span>
                                <span className="text-sm font-medium text-slate-600 block">Based on historical fixed expenses</span>
                            </div>
                        </div>
                        <span className="text-base font-bold text-violet-950 shrink-0 text-right">
                            {targetBills.toLocaleString()} <span className="text-sm font-semibold text-slate-600">MKD</span>
                        </span>
                    </div>

                    {/* Groceries Allocation */}
                    <div className="p-3.5 flex items-center justify-between rounded-xl hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-3.5 min-w-0 pr-4">
                            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center font-bold shrink-0">
                                <HugeiconsIcon icon={ShoppingCart01Icon} size={20} strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-base font-bold text-violet-950 block">Groceries & Market</span>
                                <span className="text-sm font-medium text-slate-600 block">Essential food budget estimation</span>
                            </div>
                        </div>
                        <span className="text-base font-bold text-violet-950 shrink-0 text-right">
                            {targetGroceries.toLocaleString()} <span className="text-sm font-semibold text-slate-600">MKD</span>
                        </span>
                    </div>

                    {/* Expendable / Wants */}
                    <div className="p-3.5 flex items-center justify-between rounded-xl bg-violet-50/60 border border-violet-100/60">
                        <div className="flex items-center gap-3.5 min-w-0 pr-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-900 text-white flex items-center justify-center font-bold shrink-0">
                                <HugeiconsIcon icon={ChartLineIcon} size={20} strokeWidth={2} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-base font-bold text-violet-950 block">Expendable (Wants)</span>
                                <span className="text-sm font-semibold text-violet-700 block">Guilt-free flexible spending</span>
                            </div>
                        </div>
                        <span className="text-base font-bold text-violet-950 shrink-0 text-right">
                            {disposableWants.toLocaleString()} <span className="text-sm font-semibold text-slate-600">MKD</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Warning Box */}
            {totalNeedsAndSavings > effectiveIncome && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900 font-semibold text-sm mt-auto shadow-sm">
                    <HugeiconsIcon icon={AlertCircleIcon} size={20} strokeWidth={2} className="shrink-0 mt-0.5 text-rose-600" />
                    <span>Allocations exceed your current effective income. Consider adjusting your strategy or savings rate.</span>
                </div>
            )}
        </div>
    );
}
