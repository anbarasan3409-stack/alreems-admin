import React from 'react';
import { Search, Plus, Download, Eye, Edit, Trash2, BookOpen } from 'lucide-react';
import { useCourseManagement } from '@/hooks/courseHooks';
import ToastService from '@/utils/ToastService';
import CreateCourseModal from './CreateCourseModal';
import EditCourseModal from './EditCourseModal';
import { DeleteConfirmationModal, EditConfirmationModal } from './ConfirmationModals';
import CourseDetails from './CourseDetails';

export default function CourseManagement() {
  const {
    currentPage,
    searchTerm,
    selectedCredits,
    courses,
    loading,
    error,
    showCreateModal,
    createFormData,
    showEditModal,
    editFormData,
    editingCourse,
    showDeleteModal,
    showEditConfirmModal,
    courseToDelete,
    courseToEdit,
    coursesPerPage,
    filteredCourses,
    currentCourses,
    totalPages,
    startIndex,
    endIndex,
    credits,
    setCurrentPage,
    setSearchTerm,
    setSelectedCredits,
    handlePageChange,
    handleViewCourse,
    handleEditCourse,
    handleCreateCourse,
    handleCloseCreateModal,
    handleCreateFormChange,
    handleSubmitCreateCourse,
    handleConfirmEdit,
    handleCloseEditModal,
    handleEditFormChange,
    handleSubmitEditCourse,
    handleDeleteCourse,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleCloseEditConfirmModal,
    handleExportCourses,
    getCreditsColor,
  } = useCourseManagement();

  const [currentView, setCurrentView] = React.useState('list'); // 'list' or 'details'
  const [selectedCourseForDetails, setSelectedCourseForDetails] = React.useState(null);

  const handleViewCourseDetails = (courseId) => {
    setSelectedCourseForDetails(courseId);
    setCurrentView('details');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCourseForDetails(null);
  };

  // Render details view
  if (currentView === 'details') {
    return (
      <CourseDetails
        courseId={selectedCourseForDetails}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Courses</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all courses in the system</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateCourse}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Course
          </button>
          <button
            onClick={handleExportCourses}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>


        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900">{filteredCourses?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Page</p>
              <p className="text-2xl font-bold text-gray-900">{currentPage} of {totalPages}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCourses.map((course) => (
                <tr key={course.ID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{course.Name}</div>
                        <div className="text-sm text-gray-500">ID: {course.ID}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.Code}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-emerald-600">
                      AED {course.Price || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {course.Description || 'No description available'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCourseDetails(course.ID)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Course"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditCourse(course.ID)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                        title="Edit Course"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.ID)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete Course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {(currentCourses?.length || 0) === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first course.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleCreateCourse}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Add Course
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCourses?.length || 0)} of {filteredCourses?.length || 0} courses
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm border rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      <CreateCourseModal
        showCreateModal={showCreateModal}
        handleCloseCreateModal={handleCloseCreateModal}
        createFormData={createFormData}
        handleCreateFormChange={handleCreateFormChange}
        handleSubmitCreateCourse={handleSubmitCreateCourse}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        showEditModal={showEditModal}
        handleCloseEditModal={handleCloseEditModal}
        editFormData={editFormData}
        handleEditFormChange={handleEditFormChange}
        handleSubmitEditCourse={handleSubmitEditCourse}
        editingCourse={editingCourse}
      />

      {/* Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        courseName={courseToDelete?.Name}
      />
      <EditConfirmationModal
        isOpen={showEditConfirmModal}
        onClose={handleCloseEditConfirmModal}
        onConfirm={handleConfirmEdit}
        courseName={courseToEdit?.Name}
      />
    </div>
  );
}
