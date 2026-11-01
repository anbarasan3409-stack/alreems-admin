import { useState, useEffect } from 'react';
import CourseService from '@/services/courses/courseServices';
import ToastService from '@/utils/ToastService';

export const useCourseManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCredits, setSelectedCredits] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3,
    teacherID: '',
    price: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: 3,
    teacherID: '',
    price: ''
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const coursesPerPage = 8;

  const credits = ['all', '1', '2', '3', '4', '5'];

  // Fetch courses data on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CourseService.getAllCourses();
        setCourses(data || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again.');
        ToastService.error('Failed to load courses. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on search term and credits
  const filteredCourses = (courses || []).filter(course => {
    const matchesSearch = course.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.Code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.Description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCredits = selectedCredits === 'all' || course.Credits.toString() === selectedCredits;

    return matchesSearch && matchesCredits;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewCourse = (courseId) => {

    ToastService.info('Opening course details...');
    // Navigate to course detail view
  };

  const handleEditCourse = (courseId) => {
    const course = (courses || []).find(c => c.ID === courseId);
    if (course) {
      setCourseToEdit(course);
      setShowEditConfirmModal(true);
    }
  };

  const handleConfirmEdit = () => {
    if (courseToEdit) {
      setEditingCourse(courseToEdit);
      setEditFormData({
        name: courseToEdit.Name,
        code: courseToEdit.Code,
        description: courseToEdit.Description || '',
        credits: courseToEdit.Credits,
        teacherID: courseToEdit.TeacherID,
        price: courseToEdit.Price !== undefined ? courseToEdit.Price : ''
      });
      setShowEditModal(true);
      setShowEditConfirmModal(false);
      setCourseToEdit(null);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingCourse(null);
    setEditFormData({
      name: '',
      code: '',
      description: '',
      credits: 3,
      teacherID: '',
      price: ''
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitEditCourse = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...editFormData,
        price: editFormData.price === '' ? 0 : parseFloat(editFormData.price)
      };
      const updatedCourse = await CourseService.updateCourse(editingCourse.ID, payload);
      // Update course in local state
      setCourses(prevCourses => (prevCourses || []).map(course =>
        course.ID === editingCourse.ID ? { ...course, ...updatedCourse, Price: payload.price } : course
      ));
      ToastService.success('Course updated successfully!');
      handleCloseEditModal();
    } catch (error) {
      console.error('Update failed:', error);
      ToastService.error('Failed to update course. Please try again.');
    }
  };

  const handleCreateCourse = () => {

    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({
      name: '',
      code: '',
      description: '',
      credits: 3,
      teacherID: '',
      price: ''
    });
  };

  const handleCreateFormChange = (field, value) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitCreateCourse = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...createFormData,
        price: createFormData.price === '' ? 0 : parseFloat(createFormData.price)
      };
      const newCourse = await CourseService.createCourse(payload);
      // Add new course to local state
      setCourses(prevCourses => [{ ...newCourse, Price: payload.price }, ...(prevCourses || [])]);
      ToastService.success('Course created successfully!');
      handleCloseCreateModal();
    } catch (error) {
      console.error('Create failed:', error);
      ToastService.error('Failed to create course. Please try again.');
    }
  };

  const handleDeleteCourse = (courseId) => {
    const course = (courses || []).find(c => c.ID === courseId);
    if (course) {
      setCourseToDelete(course);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (courseToDelete) {
      try {
        await CourseService.deleteCourse(courseToDelete.ID);
        // Remove course from local state
        setCourses(prevCourses => (prevCourses || []).filter(course => course.ID !== courseToDelete.ID));
        ToastService.success('Course deleted successfully!');
        setShowDeleteModal(false);
        setCourseToDelete(null);
      } catch (error) {
        console.error('Delete failed:', error);
        ToastService.error('Failed to delete course. Please try again.');
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  const handleCloseEditConfirmModal = () => {
    setShowEditConfirmModal(false);
    setCourseToEdit(null);
  };

  const handleExportCourses = async () => {

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      ToastService.success('Course list exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      ToastService.error('Failed to export course list. Please try again.');
    }
  };

  const getCreditsColor = (credits) => {
    switch (credits) {
      case 1:
        return 'bg-blue-100 text-blue-700';
      case 2:
        return 'bg-green-100 text-green-700';
      case 3:
        return 'bg-yellow-100 text-yellow-700';
      case 4:
        return 'bg-orange-100 text-orange-700';
      case 5:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return {
    // State
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

    // Setters
    setCurrentPage,
    setSearchTerm,
    setSelectedCredits,

    // Handlers
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

    // Utilities
    getCreditsColor,
  };
};
