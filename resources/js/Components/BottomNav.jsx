import {
    Home01Icon,
    Analytics01Icon,
    Add01Icon,
    ChartLineIcon,
    Wallet01Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion, AnimatePresence } from 'framer-motion';

export function BottomNav({ activeTab, onTabChange, onAddClick, overviewSubTab, onOverviewSubTabChange }) {
    const isOverviewMode = activeTab === 'overview';

    return (
        <div className="absolute bottom-0 left-0 right-0 z-30 sticky bottom-0">
            <div
                className="bg-white/90 backdrop-blur-md px-2 pb-3 pt-3 flex items-center justify-between"
                style={{ borderRadius: '12px 12px 0 0', boxShadow: '0 -4px 30px rgba(139, 92, 246, 0.08)' }}
            >
                {/* Home / Daily Tab */}
                <div className="flex-1 flex items-center justify-center h-14">
                    <button
                        onClick={() => onTabChange('home')}
                        className={`flex flex-col items-center gap-1 transition-all ${
                            activeTab === 'home' ? 'text-violet-500' : 'text-slate-400'
                        }`}
                    >
                        <HugeiconsIcon
                            icon={Home01Icon}
                            size={20}
                            strokeWidth={activeTab === 'home' ? 2.5 : 1.8}
                        />
                        <span className="text-sm font-medium">Daily</span>
                    </button>
                </div>

                {/* Insights Tab */}
                <AnimatePresence>
                    {isOverviewMode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.6, width: 0, marginRight: 0 }}
                            animate={{ opacity: 1, scale: 1, width: 'auto', marginRight: '10px' }}
                            exit={{ opacity: 0, scale: 0.6, width: 0, marginRight: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="flex items-center justify-center h-14 overflow-hidden"
                        >
                            <button
                                onClick={() => onOverviewSubTabChange('insights')}
                                className={`flex flex-col items-center gap-1 px-1 transition-all ${
                                    overviewSubTab === 'insights' ? 'text-violet-500' : 'text-slate-400'
                                }`}
                            >
                                <HugeiconsIcon
                                    icon={ChartLineIcon}
                                    size={20}
                                    strokeWidth={overviewSubTab === 'insights' ? 2.5 : 1.8}
                                />
                                <span className="text-sm font-medium whitespace-nowrap">Insights</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Centered Add Button with increased wrapper margins */}
                <div className="relative flex items-center justify-center -mt-10 mx-3">
                    <div className="absolute rounded-full" style={{ width: 96, height: 96, backgroundColor: 'rgba(196,181,253,0.20)' }} />
                    <div className="absolute rounded-full" style={{ width: 84, height: 84, backgroundColor: 'rgba(167,139,250,0.30)' }} />
                    <div className="absolute rounded-full" style={{ width: 72, height: 72, backgroundColor: 'rgba(139,92,246,0.20)' }} />
                    <button
                        onClick={onAddClick}
                        className="relative w-14 h-14 bg-gradient-to-br from-indigo-400 to-pink-300 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                        style={{ boxShadow: '0 0 0 3px rgba(139,92,246,0.3), 0 0 20px 4px rgba(139,92,246,0.35), 0 4px 12px rgba(0,0,0,0.15)' }}
                    >
                        <HugeiconsIcon icon={Add01Icon} size={28} strokeWidth={2} />
                    </button>
                </div>

                {/* Budget Tab */}
                <AnimatePresence>
                    {isOverviewMode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.6, width: 0, marginLeft: 0 }}
                            animate={{ opacity: 1, scale: 1, width: 'auto', marginLeft: '10px' }}
                            exit={{ opacity: 0, scale: 0.6, width: 0, marginLeft: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="flex items-center justify-center h-14 overflow-hidden"
                        >
                            <button
                                onClick={() => onOverviewSubTabChange('budget')}
                                className={`flex flex-col items-center gap-1 px-1 transition-all ${
                                    overviewSubTab === 'budget' ? 'text-violet-500' : 'text-slate-400'
                                }`}
                            >
                                <HugeiconsIcon
                                    icon={Wallet01Icon}
                                    size={20}
                                    strokeWidth={overviewSubTab === 'budget' ? 2.5 : 1.8}
                                />
                                <span className="text-sm font-medium whitespace-nowrap">Budget</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Overview Tab */}
                <div className="flex-1 flex items-center justify-center h-14">
                    <button
                        onClick={() => {
                            onTabChange('overview');
                            onOverviewSubTabChange('overview');
                        }}
                        className={`flex flex-col items-center gap-1 transition-all ${
                            activeTab === 'overview' && overviewSubTab === 'overview' ? 'text-violet-500' : 'text-slate-400'
                        }`}
                    >
                        <HugeiconsIcon
                            icon={Analytics01Icon}
                            size={20}
                            strokeWidth={activeTab === 'overview' && overviewSubTab === 'overview' ? 2.5 : 1.8}
                        />
                        <span className="text-sm font-medium">Overview</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
