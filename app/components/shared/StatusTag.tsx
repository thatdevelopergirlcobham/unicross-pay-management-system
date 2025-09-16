type StatusTagProps = { status: string };

export default function StatusTag({ status }: StatusTagProps) {
  const baseStyle = 'px-2.5 py-0.5 text-xs font-medium rounded-full inline-block';
  const statusStyles: { [key: string]: string } = {
    Paid: 'bg-green-100 text-green-800',
    Approved: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`${baseStyle} ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}