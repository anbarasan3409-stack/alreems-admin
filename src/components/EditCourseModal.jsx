import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function EditCourseModal({
  showEditModal,
  handleCloseEditModal,
  editFormData,
  handleEditFormChange,
  handleSubmitEditCourse,
  courseName
}) {
  if (!showEditModal) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={handleCloseEditModal}>
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                <Edit size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Course</h2>
                <p className="text-sm text-gray-600">Modify course details for "{courseName}"</p>
              </div>
            </div>
            <button
              onClick={handleCloseEditModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Trash2 size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmitEditCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Course Name *
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => handleEditFormChange('name', e.target.value)}
                placeholder="e.g., Advanced Mathematics"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Course Code *
              </label>
              <input
                type="text"
                value={editFormData.code}
                onChange={(e) => handleEditFormChange('code', e.target.value)}
                placeholder="e.g., MATH-301"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>




            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Teacher ID *
              </label>
              <input
                type="number"
                value={editFormData.teacherID}
                onChange={(e) => handleEditFormChange('teacherID', parseInt(e.target.value))}
                placeholder="e.g., 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Price (AED) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={editFormData.price !== undefined ? editFormData.price : ''}
                onChange={(e) => handleEditFormChange('price', e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="e.g., 150"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Description
              </label>
              <textarea
                value={editFormData.description}
                onChange={(e) => handleEditFormChange('description', e.target.value)}
                placeholder="Brief description of the course content..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
