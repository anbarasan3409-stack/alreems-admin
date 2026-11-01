import { useState, useEffect } from 'react';
import teacherServices from '@/services/teachers/teacherServices';
import ToastService from '@/utils/ToastService';
import { Star } from 'lucide-react';

export const useTeacherManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const teachersPerPage = 8;

  const subjects = ['all', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'History', 'Computer Science', 'Spanish', 'Economics', 'Psychology'];
  const departments = ['all', 'STEM', 'Humanities', 'Technology', 'Languages', 'Social Sciences'];
  const statuses = ['all', 'active', 'inactive', 'on-leave'];

  // Fetch teachers data on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await teacherServices.getAllTeachers();
        setTeachers(data || []);
      } catch (err) {
        console.error('Failed to fetch teachers:', err);
        setError('Failed to load teachers. Please try again.');
        ToastService.error('Failed to load teachers. Please refresh the page.');
        setTeachers([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Filter teachers based on search term, subject, department, and status
  const filteredTeachers = (teachers || []).filter(teacher => {
    const matchesSearch = teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || teacher.subject === selectedSubject;
    const matchesDepartment = selectedDepartment === 'all' || teacher.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || teacher.status === selectedStatus;

    return matchesSearch && matchesSubject && matchesDepartment && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);
  const startIndex = (currentPage - 1) * teachersPerPage;
  const endIndex = startIndex + teachersPerPage;
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewTeacher = (teacherId) => {

    ToastService.info('Opening teacher details...');
    // Navigate to teacher detail view
  };

  const handleEditTeacher = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setSelectedTeacher(teacher);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateTeacher = async (teacherId, teacherData) => {
    try {
      const updatedTeacher = await teacherServices.updateTeacher(teacherId, teacherData);
      // Update local state
      setTeachers(prevTeachers => 
        prevTeachers.map(teacher => 
          teacher.id === teacherId ? updatedTeacher : teacher
        )
      );
      ToastService.success('Teacher updated successfully!');
      setIsEditModalOpen(false);
      setSelectedTeacher(null);
      return updatedTeacher;
    } catch (error) {
      console.error('Update teacher failed:', error);
      ToastService.error('Failed to update teacher. Please try again.');
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleDeleteTeacher = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    try {
      await teacherServices.deleteTeacher(teacherToDelete.id);
      // Remove teacher from local state
      setTeachers(prevTeachers => (prevTeachers || []).filter(teacher => teacher.id !== teacherToDelete.id));
      ToastService.success('Teacher deleted successfully!');
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      ToastService.error('Failed to delete teacher. Please try again.');
    }
  };

  const cancelDeleteTeacher = () => {
    setIsDeleteModalOpen(false);
    setTeacherToDelete(null);
  };

  const handleAddTeacher = async (teacherData) => {
    try {
      const newTeacher = await teacherServices.createTeacher(teacherData);
      // Add to local state
      setTeachers(prevTeachers => [...prevTeachers, newTeacher]);
      ToastService.success('Teacher added successfully!');
      setIsAddModalOpen(false);
      return newTeacher;
    } catch (error) {
      console.error('Add teacher failed:', error);
      ToastService.error('Failed to add teacher. Please try again.');
      throw error; // Re-throw to let modal handle it
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleExportTeachers = async () => {

    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      ToastService.success('Teacher list exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      ToastService.error('Failed to export teacher list. Please try again.');
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.8) return '#4CAF50';
    if (rating >= 4.5) return '#2196F3';
    if (rating >= 4.0) return '#FF9800';
    return '#F44336';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-700';
      case 'on-leave':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={14} className="text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={14} className="text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={14} className="text-gray-300" />
      );
    }

    return stars;
  };

  return {
    // State
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

    // Setters
    setCurrentPage,
    setSearchTerm,
    setSelectedSubject,
    setSelectedStatus,
    setSelectedDepartment,

    // Handlers
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

    // Utilities
    getRatingColor,
    getStatusColor,
    renderStars,
  };
};
