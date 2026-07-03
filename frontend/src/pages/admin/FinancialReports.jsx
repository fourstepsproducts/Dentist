import React from 'react';
import { Download, FileText, Printer, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';

const summaryCards = [
  { title: 'Total Revenue', value: '$124,500', trend: '+14%', up: true },
  { title: "Today's Revenue", value: '$2,850', trend: '+5%', up: true },
  { title: 'Pending Payments', value: '$12,400', trend: '-2%', up: false },
  { title: 'Total Discounts', value: '$4,200', trend: '+1%', up: true },
];

const mockInvoices = [
  { id: 'INV-001', patient: 'Alice Smith', treatment: 'Root Canal', doctor: 'Dr. Michael Chen', cost: '$800', discount: '$50', paid: '$750', due: '$0', status: 'Paid', date: 'Oct 12, 2026' },
  { id: 'INV-002', patient: 'Bob Johnson', treatment: 'Dental Implants', doctor: 'Dr. Sarah Wilson', cost: '$3,200', discount: '$200', paid: '$1,500', due: '$1,500', status: 'Partial', date: 'Oct 11, 2026' },
  { id: 'INV-003', patient: 'Charlie Brown', treatment: 'Teeth Whitening', doctor: 'Dr. James Anderson', cost: '$250', discount: '$0', paid: '$0', due: '$250', status: 'Unpaid', date: 'Oct 10, 2026' },
];

const FinancialReports = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of clinic revenue, outstanding payments, and treatments.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="text-slate-600 bg-white"><FileText size={16} className="mr-2" /> Export PDF</Button>
          <Button variant="outline" className="text-slate-600 bg-white"><Download size={16} className="mr-2" /> Export Excel</Button>
          <Button variant="primary" className="bg-blue-600"><Printer size={16} className="mr-2" /> Print Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => (
          <Card key={idx} className="bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                <span className={`flex items-center text-xs font-semibold ${card.up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {card.up ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                  {card.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
            <Select className="w-32 h-8 text-xs" options={[{label: 'Last 7 Days', value: '7d'}, {label: 'Last 30 Days', value: '30d'}]} />
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center bg-slate-50/50 rounded-lg m-4 border border-dashed border-slate-200">
            {/* Mock Chart Area */}
            <div className="flex flex-col items-center text-slate-400 gap-2">
              <TrendingUp size={48} className="opacity-20" />
              <span className="text-sm font-medium">Interactive Chart Placeholder</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      $
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Payment Received</div>
                      <div className="text-xs text-slate-500">From Patient #{1000 + i}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600">+$250.00</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <CardTitle className="text-lg">Treatment Cost Breakdown</CardTitle>
          <Select className="w-[180px]" options={[{label: 'All Statuses', value: 'all'}, {label: 'Paid', value: 'paid'}, {label: 'Unpaid', value: 'unpaid'}]} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice No</th>
                <th className="px-6 py-4 font-medium">Patient / Doctor</th>
                <th className="px-6 py-4 font-medium">Treatment</th>
                <th className="px-6 py-4 font-medium text-right">Cost</th>
                <th className="px-6 py-4 font-medium text-right">Paid</th>
                <th className="px-6 py-4 font-medium text-right">Due</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{inv.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{inv.patient}</div>
                    <div className="text-xs text-slate-500">{inv.doctor}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{inv.treatment}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">{inv.cost}</td>
                  <td className="px-6 py-4 text-right font-medium text-emerald-600">{inv.paid}</td>
                  <td className="px-6 py-4 text-right font-medium text-red-600">{inv.due}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Partial' ? 'warning' : 'danger'}>
                      {inv.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FinancialReports;
