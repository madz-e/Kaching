import {useMemo, useState} from "react";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    ArrowDown01Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {ExpenseItem} from "@/Components/ExpenseItem.jsx";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {CATEGORY_STYLES} from "@/Components/CategoryIcon.jsx";


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

function getPrevMonthYear(month, year) {
    if (month === 0) return { month: 11, year: year - 1 };
    return { month: month - 1, year };
}

const RADIAN = Math.PI / 180;
function getWordsAsLines(text) {
    if (!text) return [];
    return text.split(' ');
}
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, name, payload }) => {
    if (percent === 0) return null;
    const radius = outerRadius + 22;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = Math.round(percent * 100);
    const amount = payload.amount ? payload.amount.toLocaleString() : '';
    const nameLines = getWordsAsLines(name);
    const textAnchor = x > cx ? 'start' : 'end';

    return (
        <text
            x={x}
            y={y}
            fill="#475569"
            textAnchor={textAnchor}
            dominantBaseline="central"
            className="text-[11px]"
        >
            {nameLines.map((line, idx) => (
                <tspan
                    key={idx}
                    x={x}
                    dy={idx === 0 ? `-${nameLines.length * 5}px` : '12px'}
                    className="font-semibold fill-slate-700"
                >
                    {line}
                </tspan>
            ))}
            <tspan x={x} dy="14" className="fill-violet-500 font-medium">
                {percentage}%
            </tspan>
        </text>
    );
};

export default function Overview({expenses}){
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());
    const [typeFilter, setTypeFilter] = useState('expense');
    const [paymentType, setPaymentType] = useState('all');
    const [selectedParent, setSelectedParent] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    const toggleParent = (id) => {
        setSelectedParent(prev => (prev === id ? null : id));
        setSelectedSubcategory(null);
    };

    const toggleSubcategory = (id) => {
        setSelectedSubcategory(prev => (prev === id ? null : id));
    };

    const getExpensesForLeafCategory = (categoryId) => {
        return typeFilteredItems.filter(exp => exp.category?.id === categoryId);
    };

    const ORANGE_SHADES = [
        '#fed7aa',
        '#fdba74',
        '#fb923c',
        '#f97316',
        '#ea580c',
        '#c2410c',
    ];

    const getCategoryColor = (name, index = 0) => {
        if (typeFilter === 'income') {
            return ORANGE_SHADES[index % ORANGE_SHADES.length];
        }
        return `${(CATEGORY_STYLES[name] || CATEGORY_STYLES.Misc).bg}80`;
    };

    const allItems = useMemo(()=>Object.values(expenses).flat(),[expenses]);

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const monthFiltered = allItems.filter(exp=>{
        const d = new Date(exp.date);
        return d.getMonth()===month&&d.getFullYear()===year;
    });

    const typeFilteredItems = monthFiltered.filter(exp => {
        const parentName = exp.category?.parent?.name || exp.category?.name || '';
        const isIncome = parentName === 'Income';

        if (typeFilter === 'income' && !isIncome) return false;
        if (typeFilter === 'expense' && isIncome) return false;

        if (paymentType !== 'all' && exp.payment_method !== paymentType) return false;

        return true;
    });

    const paymentFilteredMonth = monthFiltered.filter(exp =>
        paymentType === 'all' || exp.payment_method === paymentType
    );

    const incomeTotal = paymentFilteredMonth
        .filter(exp => (exp.category?.parent?.name || exp.category?.name) === 'Income')
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    const expenseTotal = paymentFilteredMonth
        .filter(exp => (exp.category?.parent?.name || exp.category?.name) !== 'Income')
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    const balance = incomeTotal - expenseTotal;
    const maxTotal = Math.max(incomeTotal, expenseTotal, 1);

    const allEntriesSorted = [...paymentFilteredMonth].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    const byCategory = {};
    typeFilteredItems.forEach(exp => {
        const parent = exp.category?.parent;
        if (!parent) return;

        const name = parent.name;
        if (!byCategory[name]) {
            byCategory[name] = { name, amount: 0, category: parent };
        }
        byCategory[name].amount += parseFloat(exp.amount);
    });
    const categoryList = useMemo(() => {
        const grouped = {};
        typeFilteredItems.forEach(exp => {
            const isIncome = typeFilter === 'income';
            const targetCategory = isIncome ? exp.category : exp.category?.parent;
            if (!targetCategory) return;

            const name = targetCategory.name;
            if (!grouped[name]) {
                grouped[name] = { name, amount: 0, category: targetCategory };
            }
            grouped[name].amount += parseFloat(exp.amount);
        });
        return Object.values(grouped);
    }, [typeFilteredItems, typeFilter]);

    const getSubCategories = (parentId) => {
        const grouped = {};
        typeFilteredItems.forEach(exp => {
            if (exp.category?.parent?.id !== parentId) return;

            const childId = exp.category?.id;
            if (!childId) return;

            if (!grouped[childId]) {
                grouped[childId] = { name: exp.category.name, amount: 0, category: exp.category };
            }
            grouped[childId].amount += parseFloat(exp.amount);
        });
        return Object.values(grouped);
    };

    const chartTotal = categoryList.reduce((sum, item) => sum + item.amount, 0);

    const { month: prevMonthNum, year: prevYear } = getPrevMonthYear(month, year);

    const prevMonthFiltered = allItems.filter(exp => {
        const d = new Date(exp.date);
        return d.getMonth() === prevMonthNum && d.getFullYear() === prevYear;
    });

    const thisMonthByCategory = groupByCategory(typeFilteredItems);
    const lastMonthByCategory = groupByCategory(prevMonthFiltered);

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
    const categoryComparisons = compareCategories(thisMonthByCategory, lastMonthByCategory);

    const biggestMover = categoryComparisons
        .filter(c => c.percentChange !== null)
        .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))[0];
    console.log(biggestMover);

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 p-4">
            <div className="pt-16 pb-4 px-6 text-center">
                <h3 className="text-violet-400 text-sm font-bold tracking-widest">OVERVIEW</h3>
                <div className="flex items-center justify-center gap-4 mt-4">
                    <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-violet-400">
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
                    </button>
                    <h2 className="text-violet-900 font-medium text-lg w-28 text-center">{MONTHS[month]} {year}</h2>
                    <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-violet-400">
                        <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
                    </button>
                </div>
            </div>
            <div className="flex bg-white/40 rounded-2xl p-1 gap-1">
                {['expense','income','balance'].map(t=>(
                    <button key={t}
                            onClick={()=>setTypeFilter(t)}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all
                        ${typeFilter=== t ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500'}`}
                    >{t}
                    </button>
                ))}
            </div>
            <div className="px-6 mb-4 mt-2 flex justify-center gap-2">
                {['all','card','cash'].map(p=>(
                    <button key={p}
                            onClick={()=>setPaymentType(p)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all border
                        ${paymentType===p? 'bg-violet-400 text-white border-violet-400'
                                : 'bg-white/50 text-slate-500 border-white/60'}`}>{p}</button>
                ))}
            </div>

            <div>
                {typeFilter === 'balance' ? (
                    <div className="px-6 mb-4">
                        <div className="flex flex-col items-center mb-4">
                        <span className={`text-3xl font-medium ${balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {balance >= 0 ? '+' : ''}{balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                            <span className="text-xs text-violet-400 font-medium mt-0.5">{MONTHS[month]}</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                                    <span>Income</span>
                                    <span>{incomeTotal.toLocaleString()}</span>
                                </div>
                                <div className="h-4 rounded-full bg-white/40 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-400"
                                        style={{ width: `${(incomeTotal / maxTotal) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                                    <span>Expenses</span>
                                    <span>{expenseTotal.toLocaleString()}</span>
                                </div>
                                <div className="h-4 rounded-full bg-white/40 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-rose-400"
                                        style={{ width: `${(expenseTotal / maxTotal) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : categoryList.length > 0 && (
                    <div className="flex justify-center mb-4">
                        <div className="relative" style={{ width: 320, height: 240 }}>
                            <ResponsiveContainer width={320} height={240}>
                                <PieChart>
                                    <Pie
                                        data={categoryList}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="amount"
                                        strokeWidth={0}
                                        label={renderCustomizedLabel}
                                        isAnimationActive={false}
                                    >
                                        {categoryList.map((item,index) => (
                                            <Cell key={item.name} fill={getCategoryColor(item.name,index)} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-medium text-violet-950">
                                {chartTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </span>
                                <span className="text-xs text-violet-400 font-medium mt-0.5">
                                MKD
                            </span>
                            </div>
                        </div>
                    </div>
                )}

                {typeFilter !== 'balance' && (
                    <div className="px-6 mb-3">
                        <h3 className="text-sm font-semibold text-slate-600 pb-6">By Category</h3>
                        {categoryList.length > 0 && (
                            <div className="px-6 mb-5">
                                <div className="flex overflow-hidden rounded-full h-5">
                                    {categoryList.map((item) => (
                                        <div
                                            key={item.name}
                                            style={{
                                                width: `${(item.amount / chartTotal) * 100}%`,
                                                backgroundColor: getCategoryColor(item.name),
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div>
                <div className="flex flex-col gap-2 mt-4">
                    {typeFilter === 'balance' ? (
                        allEntriesSorted.map((exp) => (
                            <ExpenseItem key={exp.id} expense={exp} />
                        ))
                    ) : (categoryList.length > 0 && categoryList.map((item) => (
                            <div key={item.category.id}>
                                <div
                                    onClick={() => {
                                        if (typeFilter === 'income') {
                                            toggleSubcategory(item.category.id);
                                        } else {
                                            toggleParent(item.category.id);
                                        }
                                    }}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <div className="flex-1">
                                        <ExpenseItem
                                            expense={{
                                                amount: item.amount,
                                                category: item.category,
                                                name: item.name,
                                            }}
                                            deletable={false}
                                        />
                                    </div>
                                    <HugeiconsIcon
                                        icon={ArrowDown01Icon}
                                        size={20}
                                        strokeWidth={2}
                                        className={`text-slate-400 transition-transform ${
                                            (typeFilter === 'income' ? selectedSubcategory : selectedParent) === item.category.id ? 'rotate-180' : ''
                                        }`}
                                    />
                                </div>

                                {/* INCOME: expand directly to individual expenses */}
                                {typeFilter === 'income' && selectedSubcategory === item.category.id && (
                                    <div className="flex flex-col gap-2 mt-2 ml-4">
                                        {getExpensesForLeafCategory(item.category.id).map((exp) => (
                                            <ExpenseItem key={exp.id} expense={exp} />
                                        ))}
                                    </div>
                                )}

                                {/* EXPENSE: expand to subcategories first */}
                                {typeFilter !== 'income' && selectedParent === item.category.id && (
                                    <div className="flex flex-col gap-2 mt-2 ml-4">
                                        {getSubCategories(item.category.id).map((sub) => (
                                            <div key={sub.category.id}>
                                                <div
                                                    onClick={() => toggleSubcategory(sub.category.id)}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                >
                                                    <div className="flex-1">
                                                        <ExpenseItem
                                                            expense={{ amount: sub.amount, category: sub.category, name: sub.name }}
                                                            deletable={false}
                                                        />
                                                    </div>
                                                    <HugeiconsIcon
                                                        icon={ArrowDown01Icon}
                                                        size={20}
                                                        strokeWidth={2}
                                                        className={`text-slate-400 transition-transform ${
                                                            selectedSubcategory === sub.category.id ? 'rotate-180' : ''
                                                        }`}
                                                    />
                                                </div>
                                                {selectedSubcategory === sub.category.id && (
                                                    <div className="flex flex-col gap-2 mt-2 ml-4">
                                                        {getExpensesForLeafCategory(sub.category.id).map((exp) => (
                                                            <ExpenseItem key={exp.id} expense={exp} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
