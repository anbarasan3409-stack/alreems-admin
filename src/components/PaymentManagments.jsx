import React from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  Download,
  Banknote,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Plus
} from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import ToastService from '@/utils/ToastService';
import { usePaymentManagement } from '@/hooks/paymentHooks';
import AddPaymentModal from '@/components/AddPaymentModal';

export default function PaymentManagments() {
  const {
    currentPage,
    searchTerm,
    payments,
    subscriptions,
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
    studentMap,
    courseMap,
  } = usePaymentManagement();

  const [activeTab, setActiveTab] = React.useState('payments');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Payment Management</h1>
          <p className="text-gray-600">Manage all payment transactions across the platform</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
          <span className="ml-3 text-gray-600">Loading payments...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Payment Management</h1>
          <p className="text-gray-600">Manage all payment transactions across the platform</p>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Error loading payments</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'refunded':
        return <RefreshCw size={16} className="text-blue-600" />;
      default:
        return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Payment Management</h1>
        <p className="text-gray-600">Manage all payment transactions across the platform</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" size={20} />
              <input
                type="text"
                placeholder="Search payments by transaction ID, method, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'payments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Payments
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'subscriptions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Subscriptions
              </button>
            </div>
            <button
              onClick={handleExportPayments}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download size={16} />
              Export List
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all shadow-sm font-medium"
            style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.secondary})` }}
          >
            <Plus size={16} />
            Add Record
          </button>
        </div>
      </div>

      {activeTab === 'payments' ? (
        <>
          {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {payments.filter(p => p.status?.toLowerCase() === 'completed').length}
              </p>
              <p className="text-sm text-green-700">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-900">
                {payments.filter(p => p.status?.toLowerCase() === 'pending').length}
              </p>
              <p className="text-sm text-yellow-700">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900">
                {payments.filter(p => p.status?.toLowerCase() === 'failed').length}
              </p>
              <p className="text-sm text-red-700">Failed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Banknote className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
              </p>
              <p className="text-sm text-blue-700">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="divide-y divide-gray-100">
          {currentPayments.map((payment) => {
            const pId = payment.ID || payment.id;
            const txnId = payment.transactionID || payment.TransactionID || pId;
            const method = payment.method || payment.Method || 'N/A';
            const status = payment.status || payment.Status || 'pending';
            const studentId = payment.studentID || payment.StudentID || payment.studentId;
            const courseId = payment.courseID || payment.CourseID || payment.courseId;

            const studentObj = payment.student || payment.Student || (studentMap && studentMap[studentId]);
            const studentName = studentObj?.name || studentObj?.Name;
            const studentEmail = studentObj?.email || studentObj?.Email;

            const courseObj = payment.course || payment.Course || (courseMap && courseMap[courseId]);
            const courseName = courseObj?.name || courseObj?.Name;
            const courseCode = courseObj?.code || courseObj?.Code;

            const studentLabel = studentName
              ? (studentEmail ? `${studentName} (${studentEmail})` : studentName)
              : (studentId ? `Student ID: ${studentId}` : 'Unknown Student');

            const courseLabel = courseName
              ? (courseCode ? `${courseName} (${courseCode})` : courseName)
              : (courseId ? `Course ID: ${courseId}` : 'Unknown Course');

            const pDate = payment.paymentDate || payment.PaymentDate;
            const createdDate = payment.createdAt || payment.CreatedAt;

            return (
              <div
                key={pId}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Payment Icon */}
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>

                    {/* Payment Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-lg truncate" style={{ color: COLORS.text }}>
                            Transaction #{txnId}
                          </h3>
                          <p className="text-sm text-gray-600 truncate font-medium">
                            {method} • {studentLabel}
                          </p>
                        </div>

                        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Banknote size={14} />
                            <span className="font-medium">{formatCurrency(payment.amount || payment.Amount)}</span>
                          </div>
                          <div className="flex items-center gap-2" title="Transaction Time (UAE GST)">
                            <Calendar size={14} />
                            <span>{formatDate(createdDate || pDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile view additional info */}
                      <div className="md:hidden mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span>{formatCurrency(payment.amount || payment.Amount)}</span>
                        <span>•</span>
                        <span>{formatDate(createdDate || pDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right hidden lg:block">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        {getStatusIcon(status)}
                        <span className="font-medium" style={{ color: COLORS.text }}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-gray-700 truncate max-w-[220px]" title={courseLabel}>
                        {courseLabel}
                      </div>
                      {pDate && (
                        <div className="text-xs text-gray-500">
                          Payment Date: {formatDateOnly(pDate)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(status)}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewPayment(pId)}
                        className="p-2 text-gray-500 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdatePaymentStatus(pId, status === 'completed' ? 'pending' : 'completed')}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Toggle Status"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(pId)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Payment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} payments
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg border ${
                  currentPage === page
                    ? 'bg-secondary text-white border-secondary'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {filteredPayments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-400 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No payments found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or add a new payment record manually</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm shadow-sm"
            style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.secondary})` }}
          >
            <Plus size={16} />
            Add Record
          </button>
        </div>
      )}
      
      </>
      ) : (
        /* Subscriptions Tab */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="divide-y divide-gray-100">
            {subscriptions?.length > 0 ? subscriptions.map((sub) => (
              <div key={sub.ID} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: COLORS.text }}>
                        Subscription #{sub.ID}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Student ID: {sub.StudentID} • Course ID: {sub.CourseID}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">
                        Current Period End: {formatDate(sub.CurrentPeriodEnd)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.Status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.Status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-600">No subscriptions found</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Payment Record Modal */}
      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPaymentRecord}
      />

    </div>
  );
}
