// components/dashboard/TransactionTable.tsx
"use client";

import { useState, useMemo } from 'react';
import { formatNaira } from '@/lib/utils/formatCurrency';
import EmptyState from '@/components/ui/EmptyState';
import { Receipt, Download, ArrowUpRight, ArrowDownLeft , PiggyBank } from 'lucide-react';
import { Transaction, TransactionType } from '@/lib/types';

interface TransactionTableProps {
    transactions: Transaction[];
    title: string;
}


const getTransactionStyle = (type: TransactionType) => {
    switch(type) {
        case 'COMMISSION':
        case 'BONUS':
        case 'SUBSCRIPTION_FEE':
        case 'UPGRADE_FEE':
            return { Icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-100', sign: '+' };
        case 'WITHDRAWAL':
            return { Icon: ArrowDownLeft, color: 'text-red-600', bg: 'bg-red-100', sign: '-' };
        case 'SAVING':
            return { Icon: PiggyBank, color: 'text-indigo-600', bg: 'bg-indigo-100', sign: '' };
        default:
            return { Icon: Receipt, color: 'text-gray-600', bg: 'bg-gray-100', sign: '' };
    }
}

export default function TransactionTable({ transactions, title }: TransactionTableProps) {
    const [filter, setFilter] = useState('all');

    const filteredTransactions = useMemo(() => {
        if (filter === 'all') return transactions;
        return transactions.filter(t => t.type.toLowerCase() === filter);
    }, [transactions, filter]);    
    const availableFilters = ['all', ...Array.from(new Set(transactions.map(t => t.type.toLowerCase())))];

    const handleExport = () => {
        if (filteredTransactions.length === 0) {
            alert("No data to export.");
            return;
        }
        
        // Define CSV headers
        const headers = "Transaction ID,Type,Status,Date,Amount (NGN)";
        // Map filtered data to CSV rows
        const rows = filteredTransactions.map(t => {
            const rowData = [
                t.id, t.type, t.status,
                `"${new Date(t.date).toLocaleString()}"`, // <-- 3. Use 'date' instead of 'createdAt'
                t.amount
            ];
            return rowData.join(',');
        });

        // Combine headers and rows
        const csvContent = [headers, ...rows].join('\n');
        
        // Create a blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "transactions_export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">{title}</h2>
                <EmptyState 
                    Icon={Receipt}
                    message="No Transaction History"
                    description="Your transactions will appear here as you earn and withdraw."
                />
            </div>
        )
    }

    // If there are transactions, render the full component with the table.
    return (
        <div className="bg-white rounded-2xl shadow-soft">
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-b gap-4">
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full self-start sm:self-center">
                    {availableFilters.map(type => (
                        <button 
                            key={type}
                            onClick={() => setFilter(type)} 
                            className={`px-3 py-1.5 text-sm font-semibold rounded-full capitalize transition-colors ${filter === type ? 'bg-white shadow' : 'text-gray-600 hover:bg-white/60'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                 <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-900"
                >
                    <Download className="h-4 w-4" />
                    Export
                </button>            
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Details</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Now we check if the FILTERED results are empty */}
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((t) => {
                                const { Icon, color, bg, sign } = getTransactionStyle(t.type);
                                return (
                                <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                                    <td scope="row" className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${bg}`}><Icon className={`h-4 w-4 ${color}`} /></div>
                                            <div>
                                                <span className="capitalize">{t.type.toLowerCase()}</span>
                                                <p className="text-xs text-gray-500">{new Date(t.date).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.status}</span>
                                    </td>
                                    <td className={`px-6 py-4 font-semibold text-right ${color}`}>{sign}{formatNaira(t.amount)}</td>
                                </tr>
                                )
                            })
                        ) : (
                            // This row is shown when filters result in no matches
                            <tr>
                                <td colSpan={3}>
                                    <div className="p-4">
                                        <EmptyState 
                                            Icon={Receipt}
                                            message="No Transactions Found"
                                            description="No transactions match your current filter."
                                        />
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}