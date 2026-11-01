'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import DashboardContent from '@/components/DashboardContent';
import SessionManagement from '@/components/SessionManagement';
import StudentManagement from '@/components/StudentManagement';
import TeacherManagement from '@/components/TeacherManagement';
import CourseManagement from '@/components/CourseManagement';
import Settings from '@/components/Settings';
import PaymentManagments from '@/components/PaymentManagments';
import Enquiries from '@/components/Enquiries';
import Feedbacks from '@/components/Feedbacks';
import StudentProfile from '@/components/StudentProfile';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = (component) => {
    setActiveComponent(component);
    setSelectedStudent(null);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setActiveComponent('studentProfile');
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <DashboardContent onStudentSelect={handleStudentSelect} />;
      case 'sessions':
        return <SessionManagement />;
      case 'students':
        return <StudentManagement onStudentSelect={handleStudentSelect} />;
      case 'teachers':
        return <TeacherManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'payments':
        return <PaymentManagments />;
      case 'enquiries':
        return <Enquiries />;
      case 'feedbacks':
        return <Feedbacks />;
      case 'settings':
        return <Settings />;
      case 'studentProfile':
        return <StudentProfile student={selectedStudent} />;
      default:
        return <DashboardContent onStudentSelect={handleStudentSelect} />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          activeComponent={activeComponent}
          onMenuClick={handleMenuClick}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="lg:ml-64">
          {/* Topbar */}
          <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Page content */}
          <div className="min-h-screen">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
