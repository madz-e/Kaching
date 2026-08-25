import { CategoryIcon } from "@/Components/CategoryIcon.jsx";
import { Delete01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { router } from '@inertiajs/react';
import { motion, useMotionValue, animate } from 'framer-motion';

export function ExpenseItem({ expense, deletable = true }) {
    const category = expense.category?.parent || expense.category;

    const x = useMotionValue(0);

    const handleDragEnd = (_, info) => {
        if (info.offset.x < -60) {
            animate(x, -70, { type: 'spring', stiffness: 300, damping: 30 });
        } else {
            animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
        }
    };

    const handleDelete = () => {
        router.delete(`/expenses/${expense.id}`, { preserveScroll: true });
    };

    if (!deletable) {
        return (
            <div className="flex items-center justify-between bg-white rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <CategoryIcon category={category} />
                    <p className="font-medium text-lg text-violet-950">{expense.name || category?.name || 'Uncategorized'}</p>
                </div>
                <p className={`font-medium text-lg ${expense.type==='income'?'text-green-600':'text-violet-950'}`}>{expense.amount} MKD</p>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end pr-6">
                <button onClick={handleDelete} className="text-white">
                    <HugeiconsIcon icon={Delete01Icon} size={20} strokeWidth={2} className="text-white" />
                </button>
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: -70, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="flex items-center justify-between bg-white rounded-2xl p-4 relative z-10"
            >
                <div className="flex items-center gap-3">
                    <CategoryIcon category={category} />
                    <p className="font-medium text-lg text-violet-950">{expense.name || category?.name || 'Uncategorized'}</p>
                </div>
                <p className={`font-medium text-lg ${expense.type==='income'?'text-green-600':'text-violet-950'}`}>{expense.amount} MKD</p>
            </motion.div>
        </div>
    )
}
