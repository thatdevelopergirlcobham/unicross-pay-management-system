export const dummyStudentPayments = [
    { id: 'REC001', date: '2025-08-10', description: 'School Fees 2024/2025', amount: '₦75,000', status: 'Paid' },
    { id: 'REC002', date: '2025-08-11', description: 'Accommodation Fee', amount: '₦30,000', status: 'Paid' },
  ];
  
  export const dummyExpenses = [
    { id: 'EXP001', date: '2025-09-15', department: 'Registry', amount: '₦50,000', status: 'Pending' },
    { id: 'EXP002', date: '2025-09-14', department: 'Library', amount: '₦120,000', status: 'Approved' },
  ];
  
  export const dummyReports = [
    { id: 'REP001', type: 'Monthly Revenue', date: '2025-09-01', generatedBy: 'Admin' },
    { id: 'REP002', type: 'Departmental Expenses', date: '2025-09-01', generatedBy: 'Admin' },
  ];
  
  export const chartData = [
      { name: 'Apr', revenue: 9.8, expenses: 4.1 },
      { name: 'May', revenue: 11.2, expenses: 4.5 },
      { name: 'Jun', revenue: 12.5, expenses: 5.0 },
      { name: 'Jul', revenue: 10.5, expenses: 4.2 },
      { name: 'Aug', revenue: 14.1, expenses: 6.1 },
      { name: 'Sep', revenue: 8.5, expenses: 3.9 },
  ];

// Add this new array to your existing data file

export const dummyReceipts = [
    {
      receiptId: 'UNIPAY-2025-001',
      paymentId: 'PAY021',
      studentName: 'John Doe',
      matricNo: 'UNC/21/5001',
      date: '2025-08-10',
      description: 'School Fees 2024/2025',
      amountPaid: 75000,
      paymentMethod: 'Paystack',
      status: 'Paid'
    },
    {
      receiptId: 'UNIPAY-2025-002',
      paymentId: 'PAY022',
      studentName: 'John Doe',
      matricNo: 'UNC/21/5001',
      date: '2025-08-11',
      description: 'Accommodation Fee',
      amountPaid: 30000,
      paymentMethod: 'Flutterwave',
      status: 'Paid'
    },
     {
      receiptId: 'UNIPAY-2025-003',
      paymentId: 'PAY023',
      studentName: 'John Doe',
      matricNo: 'UNC/21/5001',
      date: '2025-09-02',
      description: 'Departmental Dues',
      amountPaid: 5000,
      paymentMethod: 'Paystack',
      status: 'Paid'
    },
  ];