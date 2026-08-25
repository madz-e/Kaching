import { useMemo, useState } from "react";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    ChartIncreaseIcon,
    ChartDecreaseIcon,
    AlertCircleIcon,
    Calendar01Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CategoryIcon } from "@/Components/CategoryIcon.jsx";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getPrevMonthYear(month, year) {
    if (month === 0) return { month: 11, year: year - 1 };
    return { month: month - 1, year };
}

function groupByCategory(items) {
    const grouped = {};
    items.forEach(exp => {
        const parent = exp.category?.parent;
        if (!parent) return;

        const name = parent.name;
        if (!grouped[name]) {
            grouped[name] = { name, amount: 0, category: parent };
        }
        grouped[name].amount += parseFloat(exp.amount);
    });
    return grouped;
}

function compareCategories(thisMonth, lastMonth) {
    const allNames = new Set([...Object.keys(thisMonth), ...Object.keys(lastMonth)]);

    const comparisons = [];
    allNames.forEach(name => {
        const current = thisMonth[name]?.amount || 0;
        const previous = lastMonth[name]?.amount || 0;
        const category = thisMonth[name]?.category || lastMonth[name]?.category;

        let percentChange = null;
        if (previous > 0) {
            percentChange = ((current - previous) / previous) * 100;
        } else if (current > 0) {
            percentChange = 100;
        }

        comparisons.push({ name, current, previous, category, percentChange });
    });

    return comparisons;
}

export function Insights({ expenses }) {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());

    const prevMonthNav = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonthNav = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const allItems = useMemo(() => Object.values(expenses).flat(), [expenses]);

    const isExpense = (exp) => {
        const parentName = exp.category?.parent?.name || exp.category?.name || '';
        return parentName !== 'Income';
    };

    const thisMonthItems = allItems.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === month && d.getFullYear() === year && isExpense(exp);
    });

    const { month: prevMonthNum, year: prevYear } = getPrevMonthYear(month, year);
    const lastMonthItems = allItems.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === prevMonthNum && d.getFullYear() === prevYear && isExpense(exp);
    });

    const thisMonthTotal = thisMonthItems.reduce((s, e) => s + parseFloat(e.amount), 0);
    const lastMonthTotal = lastMonthItems.reduce((s, e) => s + parseFloat(e.amount), 0);

    let overallPercentChange = null;
    if (lastMonthTotal > 0) {
        overallPercentChange = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    }

    const thisMonthByCategory = groupByCategory(thisMonthItems);
    const lastMonthByCategory = groupByCategory(lastMonthItems);
    const categoryComparisons = compareCategories(thisMonthByCategory, lastMonthByCategory);

    const validComparisons = categoryComparisons.filter(c => c.percentChange !== null || c.current > 0 || c.previous > 0);
    validComparisons.sort((a, b) => b.current - a.current);

    const biggestIncrease = [...validComparisons]
        .filter(c => c.percentChange !== null && c.percentChange > 0)
        .sort((a, b) => b.percentChange - a.percentChange)[0];

    const biggestDecrease = [...validComparisons]
        .filter(c => c.percentChange !== null && c.percentChange < 0)
        .sort((a, b) => a.percentChange - b.percentChange)[0];

    const amountSaved = biggestDecrease ? biggestDecrease.previous - biggestDecrease.current : 0;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDayCount = (month === now.getMonth() && year === now.getFullYear()) ? now.getDate() : daysInMonth;
    const thisMonthDailyAvg = currentDayCount > 0 ? thisMonthTotal / currentDayCount : 0;
    const lastMonthDailyAvg = lastMonthTotal / daysInMonth;

    const topCategory = validComparisons[0];
    const topCategoryShare = thisMonthTotal > 0 && topCategory ? (topCategory.current / thisMonthTotal) * 100 : 0;

    const maxBarValue = Math.max(...validComparisons.map(c => Math.max(c.current, c.previous)), 1);

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 p-4 pb-24 overflow-y-auto">
            {/* Header / Date Navigation */}
            <div className="pt-14 pb-4 px-6 text-center">
                <h3 className="text-violet-400 text-sm font-bold tracking-widest">SPENDING INSIGHTS</h3>
                <div className="flex items-center justify-center gap-4 mt-4">
                    <button onClick={prevMonthNav} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-violet-400 hover:bg-white transition">
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
                    </button>
                    <h2 className="text-violet-900 font-semibold text-lg w-32 text-center">{MONTHS[month]} {year}</h2>
                    <button onClick={nextMonthNav} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-violet-400 hover:bg-white transition">
                        <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Overall Monthly Shift */}
            {overallPercentChange !== null && (
                <div className="px-6 mb-5 text-center">
                    <p className="text-slate-600 text-base leading-relaxed">
                        You've spent{' '}
                        <span className={overallPercentChange >= 0 ? 'text-rose-500 font-semibold' : 'text-emerald-600 font-semibold'}>
                            {Math.abs(Math.round(overallPercentChange))}% {overallPercentChange >= 0 ? 'more' : 'less'}
                        </span>{' '}
                        compared to this time last month.
                    </p>
                </div>
            )}

            {/* Quick Highlights: Increase & Decrease Cards */}
            {biggestIncrease && (
                <div className="mx-4 mb-3 bg-white/70 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <HugeiconsIcon icon={ChartIncreaseIcon} size={20} strokeWidth={2} className="text-rose-500" />
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        Spent <span className="font-semibold text-rose-500">{Math.round(biggestIncrease.percentChange)}% more</span> on{' '}
                        <span className="font-semibold">{biggestIncrease.name}</span>.
                    </p>
                </div>
            )}

            {biggestDecrease && (
                <div className="mx-4 mb-3 bg-white/70 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <HugeiconsIcon icon={ChartDecreaseIcon} size={20} strokeWidth={2} className="text-emerald-600" />
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        Spent <span className="font-semibold text-emerald-600">{Math.abs(Math.round(biggestDecrease.percentChange))}% less</span> on{' '}
                        <span className="font-semibold">{biggestDecrease.name}</span>, saving <span className="font-semibold">{amountSaved.toLocaleString()} MKD</span>.
                    </p>
                </div>
            )}

            {/* Daily Burn Rate */}
            <div className="mx-4 mb-3 bg-white/70 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3 text-violet-900 font-medium text-sm">
                    <HugeiconsIcon icon={Calendar01Icon} size={16} strokeWidth={2} className="text-violet-500" />
                    <span>Daily Spending Pace</span>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 font-medium mb-0.5">This month</p>
                        <p className="font-semibold text-slate-800 text-lg">
                            {Math.round(thisMonthDailyAvg).toLocaleString()} <span className="text-sm font-normal text-slate-500">MKD/day</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium mb-0.5">Last month</p>
                        <p className="font-semibold text-slate-600 text-lg">
                            {Math.round(lastMonthDailyAvg).toLocaleString()} <span className="text-sm font-normal text-slate-500">MKD/day</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Category Comparison */}
            <div className="mx-4 mb-3 bg-white/70 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-slate-800 mb-4">Category Comparison</h4>

                {validComparisons.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-8">Not enough data to compare yet.</p>
                ) : (
                    <div className="space-y-4">
                        {validComparisons.map((item) => {
                            const currentWidth = `${Math.min(100, (item.current / maxBarValue) * 100)}%`;
                            const isUp = item.percentChange !== null && item.percentChange > 0;

                            return (
                                <div key={item.name}>
                                    <div className="flex justify-between items-baseline mb-1.5">
                                        <span className="font-medium text-slate-700 text-sm">{item.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 text-sm">{item.current.toLocaleString()} MKD</span>
                                            {item.percentChange !== null && (
                                                <span className={`text-xs font-medium ${isUp ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                    {isUp ? '+' : '-'}{Math.abs(Math.round(item.percentChange))}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isUp ? 'bg-rose-400' : 'bg-indigo-500'}`}
                                            style={{ width: currentWidth }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Last month: {item.previous.toLocaleString()} MKD</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Habit Awareness */}
            {topCategory && topCategoryShare > 0 && (
                <div className="mx-4 mb-4 bg-amber-50/80 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <HugeiconsIcon icon={AlertCircleIcon} size={18} strokeWidth={2} className="text-amber-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-amber-900 mb-1">Spending concentration</h4>
                            <p className="text-sm text-amber-800/90 leading-relaxed">
                                <span className="font-semibold">{Math.round(topCategoryShare)}%</span> of your spending this month went to{' '}
                                <span className="font-semibold">{topCategory.name}</span>.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
