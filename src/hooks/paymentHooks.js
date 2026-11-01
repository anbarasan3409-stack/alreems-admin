import { useState, useEffect, useMemo } from 'react';
import PaymentService from '@/services/payments/paymentServices';
import { StudentService } from '@/services/students/studentServices';
import { CourseService } from '@/services/courses/courseServices';
import ToastService from '@/utils/ToastService';

export const usePaymentManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paymentsPerPage = 10;

  // Fetch payments, subscriptions, students, and courses data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [paymentsData, subscriptionsData, studentsData, coursesData] = await Promise.all([
          PaymentService.getAllPayments().catch(() => []),
          PaymentService.getAllSubscriptions().catch(() => []),
          StudentService.getAllStudents().catch(() => []),
          CourseService.getAllCourses().catch(() => [])
        ]);
        setPayments(paymentsData || []);
        setSubscriptions(subscriptionsData || []);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again.');
        ToastService.error('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Quick lookup maps by ID
  const studentMap = useMemo(() => {
    const map = {};
    (students || []).forEach(s => {
      const id = s.id || s.ID;
      if (id) map[id] = s;
    });
    return map;
  }, [students]);

  const courseMap = useMemo(() => {
    const map = {};
    (courses || []).forEach(c => {
      const id = c.id || c.ID;
      if (id) map[id] = c;
    });
    return map;
  }, [courses]);

  // Filter payments based on search term
  const filteredPayments = (payments || []).filter(payment => {
    const term = searchTerm.toLowerCase();
    const txn = (payment.transactionID || payment.TransactionID || '').toLowerCase();
    const method = (payment.method || payment.Method || '').toLowerCase();
    const status = (payment.status || payment.Status || '').toLowerCase();

    const sId = payment.studentID || payment.StudentID || payment.studentId;
    const studentObj = payment.student || payment.Student || studentMap[sId];
    const studentName = (studentObj?.name || studentObj?.Name || '').toLowerCase();
    const studentEmail = (studentObj?.email || studentObj?.Email || '').toLowerCase();

    const cId = payment.courseID || payment.CourseID || payment.courseId;
    const courseObj = payment.course || payment.Course || courseMap[cId];
    const courseName = (courseObj?.name || courseObj?.Name || '').toLowerCase();
    const courseCode = (courseObj?.code || courseObj?.Code || '').toLowerCase();
    const studentId = String(sId || '');

    return txn.includes(term) ||
           method.includes(term) ||
           status.includes(term) ||
           studentName.includes(term) ||
           studentEmail.includes(term) ||
           courseName.includes(term) ||
           courseCode.includes(term) ||
           studentId.includes(term);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const startIndex = (currentPage - 1) * paymentsPerPage;
  const endIndex = startIndex + paymentsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewPayment = (id) => {
    ToastService.info(`Viewing payment details for ID: ${id}`);
  };

  const handleAddPaymentRecord = async (paymentData) => {
    try {
      const newPayment = await PaymentService.createPayment(paymentData);
      setPayments(prev => [newPayment, ...(prev || [])]);
      ToastService.success('Payment record created successfully');
      return true;
    } catch (error) {
      const errMsg = error.response?.data?.error || error.response?.data?.details || 'Failed to create payment record';
      ToastService.error(errMsg);
      return false;
    }
  };

  const handleUpdatePaymentStatus = async (id, newStatus) => {
    try {
      const updated = await PaymentService.updatePaymentStatus(id, newStatus);
      setPayments(prev => (prev || []).map(payment =>
        (payment.ID === id || payment.id === id) ? { ...payment, ...updated, status: newStatus } : payment
      ));
      ToastService.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      ToastService.error('Failed to update payment status');
    }
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await PaymentService.deletePayment(id);
        setPayments(prev => (prev || []).filter(payment => (payment.ID !== id && payment.id !== id)));
        ToastService.success('Payment deleted successfully');
      } catch (error) {
        ToastService.error('Failed to delete payment');
      }
    }
  };

  const handleExportPayments = () => {
    try {
      const recordsToExport = filteredPayments && filteredPayments.length > 0 ? filteredPayments : payments;
      if (!recordsToExport || recordsToExport.length === 0) {
        ToastService.warn('No payment records to export');
        return;
      }

      const headers = [
        'Transaction ID',
        'Student ID',
        'Student Name',
        'Student Email',
        'Course ID',
        'Course Name',
        'Course Code',
        'Amount (AED)',
        'Payment Method',
        'Status',
        'Payment Date',
        'Created At'
      ];

      const escapeCSV = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

      const rows = recordsToExport.map(p => {
        const txnId = p.transactionID || p.TransactionID || p.ID || p.id || '';
        const studentId = p.studentID || p.StudentID || p.studentId || '';
        const studentObj = p.student || p.Student || studentMap[studentId];
        const studentName = studentObj?.Name || studentObj?.name || '';
        const studentEmail = studentObj?.Email || studentObj?.email || '';
        const courseId = p.courseID || p.CourseID || p.courseId || '';
        const courseObj = p.course || p.Course || courseMap[courseId];
        const courseName = courseObj?.Name || courseObj?.name || '';
        const courseCode = courseObj?.Code || courseObj?.code || '';
        const amount = p.amount !== undefined ? p.amount : (p.Amount !== undefined ? p.Amount : 0);
        const method = p.method || p.Method || '';
        const status = p.status || p.Status || '';
        const pDate = p.paymentDate || p.PaymentDate ? formatDateOnly(p.paymentDate || p.PaymentDate) : 'N/A';
        const createdAt = p.createdAt || p.CreatedAt ? formatDate(p.createdAt || p.CreatedAt) : 'N/A';

        return [
          escapeCSV(txnId),
          escapeCSV(studentId),
          escapeCSV(studentName),
          escapeCSV(studentEmail),
          escapeCSV(courseId),
          escapeCSV(courseName),
          escapeCSV(courseCode),
          amount,
          escapeCSV(method),
          escapeCSV(status),
          escapeCSV(pDate),
          escapeCSV(createdAt)
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      ToastService.success('Payments exported successfully!');
    } catch (err) {
      console.error('Failed to export payments:', err);
      ToastService.error('Failed to export payments list');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  // Format date and time in UAE timezone (Gulf Standard Time, UTC+4)
  const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Dubai',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
  };

  // Format date only in UAE timezone
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Dubai',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return {
    currentPage,
    searchTerm,
    payments,
    subscriptions,
    students,
    courses,
    studentMap,
    courseMap,
    loading,
    error,
    paymentsPerPage,
    filteredPayments,
    currentPayments,
    totalPages,
    startIndex,
    endIndex,
    setCurrentPage,
    setSearchTerm,
    handlePageChange,
    handleViewPayment,
    handleAddPaymentRecord,
    handleUpdatePaymentStatus,
    handleDeletePayment,
    handleExportPayments,
    getStatusColor,
    formatCurrency,
    formatDate,
    formatDateOnly,
  };
};
