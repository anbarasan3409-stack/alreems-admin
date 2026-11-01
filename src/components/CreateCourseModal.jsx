import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import apiInstance, { EndPoints } from '@/api/apiInstance';

export default function CreateCourseModal({
  showCreateModal,
  handleCloseCreateModal,
  createFormData,
  handleCreateFormChange,
  handleSubmitCreateCourse
}) {
  const [teachers, setTeachers] = useState([]);
  const [teacherName, setTeacherName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await apiInstance.get(EndPoints.TEACHERS);
        setTeachers(response.data || []);
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
      }
    };
    if (showCreateModal) {
      fetchTeachers();
    }
  }, [showCreateModal]);

  useEffect(() => {
    if (!showCreateModal) {
      setTeacherName('');
      setIsDropdownOpen(false);
      setSearchTerm('');
    }
  }, [showCreateModal]);
  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={handleCloseCreateModal}>
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                <Plus size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
                <p className="text-sm text-gray-600">Add a new course to the platform</p>
              </div>
            </div>
            <button
              onClick={handleCloseCreateModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Trash2 size={20} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmitCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Course Name *
              </label>
              <input
                type="text"
                value={createFormData.name}
                onChange={(e) => handleCreateFormChange('name', e.target.value)}
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
                value={createFormData.code}
                onChange={(e) => handleCreateFormChange('code', e.target.value)}
                placeholder="e.g., MATH-301"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>




            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Teacher *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => {
                    setTeacherName(e.target.value);
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                  placeholder="Search and select teacher"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  ▼
                </button>
              </div>
              {isDropdownOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto">
                  {teachers
                    .filter(teacher => teacher.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(teacher => (
                      <li
                        key={teacher.id}
                        onClick={() => {
                          setTeacherName(teacher.name);
                          handleCreateFormChange('teacherID', teacher.id);
                          setIsDropdownOpen(false);
                          setSearchTerm('');
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                      >
                        {teacher.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Price (AED) *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={createFormData.price !== undefined ? createFormData.price : ''}
                onChange={(e) => handleCreateFormChange('price', e.target.value === '' ? '' : parseFloat(e.target.value))}
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
                value={createFormData.description}
                onChange={(e) => handleCreateFormChange('description', e.target.value)}
                placeholder="Brief description of the course content..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
