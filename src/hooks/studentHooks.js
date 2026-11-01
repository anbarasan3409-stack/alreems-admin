import { useState, useEffect } from 'react';
import StudentService from '@/services/students/studentServices';
import ToastService from '@/utils/ToastService';
import apiInstance, { EndPoints } from '@/api/apiInstance';

export const useStudentManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const studentsPerPage = 8;

  // Fetch students data on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await StudentService.getAllStudents();
        setStudents(data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setError('Failed to load students. Please try again.');
        ToastService.error('Failed to load students. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search term
  const filteredStudents = (students || []).filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewStudent = (studentId) => {

    ToastService.info('Opening student details...');
    // Navigate to student detail view
  };

  const handleEditStudent = async (studentId) => {

    ToastService.info('Opening student edit form...');
    // Open edit modal or navigate to edit page
  };

  const handleCreateStudent = async (studentData) => {
    try {
      const newStudent = await StudentService.createStudent(studentData);
      setStudents(prev => [...(prev || []), newStudent]);
      ToastService.success('Student created successfully!');
      return true;
    } catch (error) {
      console.error('Create student failed:', error);
      ToastService.error(error?.response?.data?.error || 'Failed to create student. Please try again.');
      return false;
    }
  };

  const handleDeleteStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      await StudentService.deleteStudent(studentToDelete.id);
      // Remove student from local state
      setStudents(prevStudents => (prevStudents || []).filter(student => student.id !== studentToDelete.id));
      ToastService.success('Student deleted successfully!');
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      ToastService.error('Failed to delete student. Please try again.');
    }
  };

  const cancelDeleteStudent = () => {
    setIsDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  const handleExportStudents = async () => {
    try {
      const response = await apiInstance.get(EndPoints.EXPORT_STUDENTS, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      ToastService.success('Student list exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      ToastService.error('Failed to export student list. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return {
    // State
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

    // Setters
    setCurrentPage,
    setSearchTerm,

    // Handlers
    handlePageChange,
    handleViewStudent,
    handleEditStudent,
    handleCreateStudent,
    handleDeleteStudent,
    confirmDeleteStudent,
    cancelDeleteStudent,
    handleExportStudents,

    // Utilities
    getStatusColor,
  };
};
