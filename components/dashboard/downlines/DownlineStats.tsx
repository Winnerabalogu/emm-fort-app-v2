// components/dashboard/downlines/DownlineStats.tsx
import { formatNaira } from '@/lib/utils/formatCurrency';
import { Users, TrendingUp, Crown } from 'lucide-react';

interface Downline {
    id: string;
    name: string;
    earnings: number;
}

interface DownlineStatsProps {
    totalEarnings: number;
    downlines: Downline[];
}

export default function DownlineStats({ totalEarnings, downlines }: DownlineStatsProps) {
    const topDownlines = downlines.slice(0, 3);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-soft">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg"><TrendingUp className="h-6 w-6 text-green-600" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Downline Earnings</p>
                        <p className="text-2xl font-bold text-gray-800">{formatNaira(totalEarnings)}</p>
                    </div>
                </div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-soft">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg"><Users className="h-6 w-6 text-blue-600" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Downlines</p>
                        <p className="text-2xl font-bold text-gray-800">{downlines.length}</p>
                    </div>
                </div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold text-gray-800">Top Earners</h3>
                </div>
                <div className="space-y-2">
                    {topDownlines.length > 0 ? topDownlines.map((downline, index) => (
                        <div key={downline.id} className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">{index + 1}. {downline.name}</span>
                            <span className="font-semibold text-green-600">{formatNaira(downline.earnings)}</span>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500">No earnings from downlines yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}