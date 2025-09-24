import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
