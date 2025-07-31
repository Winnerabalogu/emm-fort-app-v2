/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { Download, Search, Users } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import DownlineStats from '@/components/dashboard/downlines/DownlineStats';
import { formatNaira } from '@/lib/utils/formatCurrency';
import { Tier } from '@prisma/client';

interface Downline {
  id: string;
  name: string;
  tier: Tier;
  joinDate: string;
  status: 'Paid' | 'Unsubscribed';
  earnings: number;
}

interface DownlinesClientComponentProps {
  initialDownlines: Downline[];
}

export default function DownlinesClientComponent({ initialDownlines }: DownlinesClientComponentProps) {
  const { openModal } = useModal();
  const [downlines, setDownlines] = useState(initialDownlines);
  const [searchTerm, setSearchTerm] = useState('');
  
const filteredDownlines = useMemo(() => {
    if (!searchTerm) return downlines;
    return downlines.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [downlines, searchTerm]);

  const totalEarningsFromDownlines = useMemo(() => {
    return downlines.reduce((sum, d) => sum + d.earnings, 0);
  }, [downlines]);

  const handleRowClick = (downlineId: string) => {
    openModal('DOWNLINE_OVERVIEW', { downlineId });
  };
  

  const handleExport = () => {    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Tier,Join Date,Status,Earnings\n"; 
    filteredDownlines.forEach(d => {
        const row = [d.id, d.name, d.tier, new Date(d.joinDate).toLocaleDateString(), d.status, d.earnings].join(",");
        csvContent += row + "\r\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "downlines_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

   if (initialDownlines.length === 0) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-text-primary">Your Downlines</h1>
            <EmptyState Icon={Users} message="No Downlines Yet" description="Your referred users will appear here once they sign up." />
        </div>
    );
  }

   return (
     <div className="space-y-6 h-dvh sm:p-8">
       <h1 className="text-2xl font-bold text-text-primary">Downline Performance</h1>
       
       <DownlineStats totalEarnings={totalEarningsFromDownlines} downlines={downlines} />
 
       <div className="p-4 bg-white rounded-lg shadow-soft flex flex-col sm:flex-row gap-4 justify-between items-center">
         <div className="relative w-full sm:max-w-xs">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
           <input
             type="text" placeholder="Search by name..." value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg"
           />
         </div>
         <button onClick={handleExport} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700">
             <Download className="h-4 w-4" /> Export CSV
         </button>
       </div>
 
       <div className="bg-white rounded-lg shadow-soft overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left text-gray-500">
             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
               <tr>
                 <th scope="col" className="px-6 py-3">Name</th>
                 <th scope="col" className="px-6 py-3">Status</th>
                 <th scope="col" className="px-6 py-3 text-right">Earnings Generated</th>
               </tr>
             </thead>
             <tbody>
               {filteredDownlines.length > 0 ? filteredDownlines.map((d) => (
                 <tr 
                   key={d.id} 
                   className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                   onClick={() => handleRowClick(d.id)}
                 >
                   <td scope="row" className="px-6 py-4 font-medium text-gray-900">
                     <div className="flex flex-col">
                         <span>{d.name}</span>
                         <span className="text-xs text-gray-400 capitalize">{d.tier.toLowerCase()} Tier</span>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${ d.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' }`}>
                       {d.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 font-semibold text-right text-green-600">{formatNaira(d.earnings)}</td>
                 </tr>
               )) : (
                  <tr>
                     <td colSpan={3} className="text-center p-8 text-gray-500">No downlines match your search.</td>
                  </tr>
               )}
             </tbody>
           </table>
         </div>
       </div>
     </div>
   );
 }
 