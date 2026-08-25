import React from 'react'
import {
    Restaurant01Icon,
    Car01Icon,
    ShoppingBag01Icon,
    Favorite,
    FilmIcon,
    Coffee01Icon,
    FileAttachmentIcon,
    BookOpen01Icon,
    Dumbbell01Icon,
    MoreHorizontalIcon,
    Coins01Icon,
    Home01Icon
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

// This object maps your Database names to Colors and Icons
export const CATEGORY_STYLES = {
    Food: {
        bg: '#f97316',
        text: 'text-orange-600',
        Icon: Restaurant01Icon,
    },
    Drinks: {
        bg: '#ec4899',
        text: 'text-pink-600',
        Icon: Coffee01Icon,
    },
    Housing: {
        bg: '#3b82f6',
        text: 'text-blue-600',
        Icon: Home01Icon,
    },
    Transport: {
        bg: '#06b6d4',
        text: 'text-cyan-600',
        Icon: Car01Icon,
    },
    Shopping: {
        bg: '#14b8a6',
        text: 'text-teal-600',
        Icon: ShoppingBag01Icon,
    },
    Health: {
        bg: '#f43f5e',
        text: 'text-rose-600',
        Icon: Favorite,
    },
    Entertainment: {
        bg: '#8b5cf6',
        text: 'text-purple-600',
        Icon: FilmIcon,
    },
    Bills: {
        bg: '#6366f1',
        text: 'text-indigo-600',
        Icon: FileAttachmentIcon,
    },
    Education: {
        bg: '#10b981',
        text: 'text-emerald-600',
        Icon: BookOpen01Icon,
    },
    Income: {
        bg: '#eab308',
        text: 'text-yellow-500',
        Icon: Coins01Icon,
    },
    Misc: {
        bg: '#94a3b8',
        text: 'text-slate-500',
        Icon: MoreHorizontalIcon,
    },
}

export function CategoryIcon({ category, size = 'md' }) {
    // Logic:
    // 1. Check if category is an object (from Laravel) or just a string
    const categoryName = typeof category === 'object' ? category?.name : category;

    // 2. Find the style based on the name, fallback to 'Other' if not found
    const style = CATEGORY_STYLES[categoryName] || {
        bg: 'bg-slate-100',
        text: 'text-slate-400',
        Icon: MoreHorizontalIcon,
    };
    const { bg, text, Icon } = style;

    // 3. Simple size logic
    const sizeClasses = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12';
    const iconSize = size === 'sm' ? 18 : 22;

    return (
        <div
            className={`${sizeClasses} rounded-full flex items-center justify-center shrink-0`}
            style={{ backgroundColor: `${bg}30` }}
        >
            <HugeiconsIcon icon={Icon} size={iconSize} strokeWidth={1.8} className={text} />
        </div>
    )
}
