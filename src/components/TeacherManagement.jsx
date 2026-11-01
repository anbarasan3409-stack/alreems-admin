import { Search, Filter, ChevronLeft, ChevronRight, Mail, Phone, Calendar, Award, BookOpen, Eye, Edit, Trash2, UserPlus, Download, Star, Users, Clock } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import ToastService from '@/utils/ToastService';
import { useTeacherManagement } from '@/hooks/teacherHooks';
import { useState } from 'react';
import AddTeacherModal from './AddTeacherModal';
import EditTeacherModal from './EditTeacherModal';
import ConfirmationModal from './ConfirmationModal';
import TeacherDetails from './TeacherDetails';

export default function TeacherManagement() {
  const {
    currentPage,
    searchTerm,
    selectedSubject,
    selectedStatus,
    selectedDepartment,
    teachers,
    loading,
    error,
    teachersPerPage,
    filteredTeachers,
    currentTeachers,
    totalPages,
    startIndex,
    endIndex,
    subjects,
    departments,
    statuses,
    isAddModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedTeacher,
    teacherToDelete,
    setCurrentPage,
    setSearchTerm,
    setSelectedSubject,
    setSelectedStatus,
    setSelectedDepartment,
    handlePageChange,
    handleViewTeacher,
    handleEditTeacher,
    handleUpdateTeacher,
    handleDeleteTeacher,
    confirmDeleteTeacher,
    cancelDeleteTeacher,
    handleAddTeacher,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    handleExportTeachers,
    getRatingColor,
    getStatusColor,
    renderStars,
  } = useTeacherManagement();

  const [currentView, setCurrentView] = useState('list'); // 'list' or 'details'
  const [selectedTeacherForDetails, setSelectedTeacherForDetails] = useState(null);

  const handleViewTeacherDetails = (teacherId) => {
    setSelectedTeacherForDetails(teacherId);
    setCurrentView('details');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedTeacherForDetails(null);
  };

  // Render details view
  if (currentView === 'details') {
    return (
      <TeacherDetails
        teacherId={selectedTeacherForDetails}
        onBack={handleBackToList}
      />
    );
  }

  // Render list view
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Teacher Management</h1>
        <p className="text-gray-600">Manage all teachers across the platform</p>
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
                placeholder="Search teachers by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>
          </div>

          {/* Subject Filter */}
          <div className="w-full lg:w-40">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="w-full lg:w-40">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
            >
              {departments.map(department => (
                <option key={department} value={department}>
                  {department === 'all' ? 'All Departments' : department}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-40">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleExportTeachers}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download size={16} />
            Export List
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: COLORS.secondary,
              color: COLORS.background
            }}
          >
            <UserPlus size={16} />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="divide-y divide-gray-100">
          {currentTeachers.map((teacher) => {
            // Generate letter avatar from teacher name
            const getLetterAvatar = (name) => {
              if (!name) return 'T';
              const names = name.split(' ');
              if (names.length === 1) {
                return names[0].charAt(0).toUpperCase();
              }
              return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
            };

            // Generate consistent color for each teacher based on their ID
            const getAvatarColor = (id) => {
              const colors = [
                '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
                '#EF4444', '#06B6D4', '#84CC16', '#F97316',
                '#6366F1', '#EC4899', '#14B8A6', '#F59E0B'
              ];
              return colors[id % colors.length];
            };

            return (
              <div
                key={teacher.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Letter Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ backgroundColor: getAvatarColor(teacher.id) }}
                    >
                      {getLetterAvatar(teacher.name)}
                    </div>

                    {/* Teacher Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg truncate" style={{ color: COLORS.text }}>
                              {teacher.name}
                            </h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              ID: {teacher.id}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{teacher.email}</p>
                          <p className="text-xs text-gray-500">{teacher.qualifications} • {teacher.experience}</p>
                        </div>

                        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <BookOpen size={14} />
                            <span className="truncate max-w-24">{teacher.subject}</span>
                          </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{teacher.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {renderStars(teacher.rating)}
                          </div>
                          <span className="ml-1">({teacher.rating})</span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile view additional info */}
                    <div className="md:hidden mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span>{teacher.subject}</span>
                      <span>•</span>
                      <span>{teacher.department}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        {renderStars(teacher.rating)}
                        <span className="ml-1">({teacher.rating})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance, Status and Actions */}
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right hidden lg:block">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={16} style={{ color: getRatingColor(teacher.rating) }} />
                      <span className="font-medium" style={{ color: getRatingColor(teacher.rating) }}>
                        {teacher.studentsTaught} students
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {teacher.sessionsTaught} sessions taught
                    </div>
                    <div className="text-xs text-gray-500">
                      Last active: {teacher.lastActive}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(teacher.status)}`}>
                      {teacher.status}
                    </span>
                    <span className="text-xs text-gray-500 hidden lg:block">
                      {teacher.experience}
                    </span>
                    <span className="text-xs text-gray-500 hidden lg:block">
                      Rating: {teacher.rating}/5.0
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewTeacherDetails(teacher.id)}
                      className="p-2 text-gray-500 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditTeacher(teacher.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Teacher"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Teacher"
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredTeachers.length)} of {filteredTeachers.length} teachers
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

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No teachers found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Add Teacher Modal */}
      <AddTeacherModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSubmit={handleAddTeacher}
      />

      {/* Edit Teacher Modal */}
      <EditTeacherModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateTeacher}
        teacher={selectedTeacher}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeleteTeacher}
        onConfirm={confirmDeleteTeacher}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${teacherToDelete?.name || 'this teacher'}? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Teacher"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
