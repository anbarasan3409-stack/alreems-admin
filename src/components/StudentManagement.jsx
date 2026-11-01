import React from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Mail, Phone, Calendar, Eye, Edit, Trash2, UserPlus, Download } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import ToastService from '@/utils/ToastService';
import { useStudentManagement } from '@/hooks/studentHooks';
import StudentDetails from './StudentDetails';
import ConfirmationModal from './ConfirmationModal';
import AddStudentModal from './AddStudentModal';

export default function StudentManagement() {
  const {
    currentPage,
    searchTerm,
    students,
    loading,
    error,
    studentsPerPage,
    filteredStudents,
    currentStudents,
    totalPages,
    startIndex,
    endIndex,
    isDeleteModalOpen,
    studentToDelete,
    setCurrentPage,
    setSearchTerm,
    handlePageChange,
    handleViewStudent,
    handleEditStudent,
    handleCreateStudent,
    handleDeleteStudent,
    confirmDeleteStudent,
    cancelDeleteStudent,
    handleExportStudents,
    getStatusColor,
  } = useStudentManagement();

  const [currentView, setCurrentView] = React.useState('list'); // 'list' or 'details'
  const [selectedStudentForDetails, setSelectedStudentForDetails] = React.useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const handleViewStudentDetails = (studentId) => {
    setSelectedStudentForDetails(studentId);
    setCurrentView('details');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedStudentForDetails(null);
  };

  // Render details view
  if (currentView === 'details') {
    return (
      <StudentDetails
        studentId={selectedStudentForDetails}
        onBack={handleBackToList}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Student Management</h1>
          <p className="text-gray-600">Manage all students across the platform</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
          <span className="ml-3 text-gray-600">Loading students...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Student Management</h1>
          <p className="text-gray-600">Manage all students across the platform</p>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Error loading students</h3>
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Student Management</h1>
        <p className="text-gray-600">Manage all students across the platform</p>
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
                placeholder="Search students by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleExportStudents}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download size={16} />
            Export List
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
            style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.secondary})` }}
          >
            <UserPlus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="divide-y divide-gray-100">
          {currentStudents.map((student) => (
            <div
              key={student.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondary}80)` }}
                  >
                    {student.name ? student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg truncate" style={{ color: COLORS.text }}>{student.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{student.email}</p>
                      </div>

                      <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          <span className="truncate max-w-32">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span>{student.phoneNumber || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-32">{student.address || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile view additional info */}
                    <div className="md:hidden mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span>{student.email}</span>
                      <span>•</span>
                      <span>{student.phoneNumber || 'No phone'}</span>
                    </div>
                  </div>
                </div>

                {/* Performance, Status and Actions */}
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right hidden lg:block">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={16} style={{ color: COLORS.secondary }} />
                      <span className="font-medium" style={{ color: COLORS.text }}>
                        {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Never logged in'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Joined: {new Date(student.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {student.id}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor('active')}`}>
                      Active
                    </span>
                    <span className="text-xs text-gray-500 hidden lg:block">
                      {student.address ? 'Has address' : 'No address'}
                    </span>
                    <span className="text-xs text-gray-500 hidden lg:block">
                      Profile: {student.profilePicture ? 'Yes' : 'No'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewStudentDetails(student.id)}
                      className="p-2 text-gray-500 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditStudent(student.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Student"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Student"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
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

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No students found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeleteStudent}
        onConfirm={confirmDeleteStudent}
        title="Delete Student"
        message={`Are you sure you want to delete ${studentToDelete?.name || 'this student'}? This action cannot be undone and will remove all associated data including enrollments.`}
        confirmText="Delete Student"
        variant="danger"
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateStudent}
      />
    </div>
  );
}
