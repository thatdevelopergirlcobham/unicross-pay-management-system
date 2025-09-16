import DashboardCard from '../../components/shared/DashboardCard';
import Table from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import OverviewChart from '../../components/charts/OverviewChart';
import { FiTrendingUp, FiTrendingDown, FiFileText } from 'react-icons/fi';
import { dummyReports } from '../../libs/data';

export default function AdminDashboard() {
  const columns = [
    { header: 'Report Type', accessor: 'type' },
    { header: 'Date Generated', accessor: 'date' },
    { header: 'Actions', accessor: 'actions', render: () => <Button variant="secondary" className="text-xs !px-2 !py-1">Download</Button> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Administrator Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Total Revenue (YTD)" value="₦65.8M" icon={<FiTrendingUp size={24} />} />
        <DashboardCard title="Total Expenses (YTD)" value="₦28.3M" icon={<FiTrendingDown size={24} />} />
        <DashboardCard title="Reports Generated" value="12" icon={<FiFileText size={24} />} />
      </div>
       <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Financial Overview (in Millions)</h3>
          <OverviewChart />
        </div>
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Available Reports</h3>
          <Button>Generate New Report</Button>
        </div>
        <Table columns={columns} data={dummyReports} />
      </div>
    </div>
  );
}