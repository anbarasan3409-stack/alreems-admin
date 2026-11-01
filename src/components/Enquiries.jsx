import { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Mail, Phone, Calendar, MessageSquare, Download } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import apiInstance, { EndPoints } from '@/api/apiInstance';
import EnquiryService from '@/services/enquiries/enquiriesService';
import ToastService from '@/utils/ToastService';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const data = await EnquiryService.getAllEnquiries();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (error) {
      ToastService.error('Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await EnquiryService.updateEnquiryStatus(id, newStatus);
      setEnquiries(enquiries.map(enq => 
        (enq.id || enq.ID) === id ? { ...enq, status: newStatus } : enq
      ));
      ToastService.success('Status updated successfully');
    } catch (error) {
      ToastService.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await EnquiryService.deleteEnquiry(id);
        setEnquiries(enquiries.filter(enq => (enq.id || enq.ID) !== id));
        ToastService.success('Enquiry deleted successfully');
      } catch (error) {
        ToastService.error('Failed to delete enquiry');
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiInstance.get(EndPoints.EXPORT_ENQUIRIES, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'enquiries.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      ToastService.success('Enquiries exported successfully');
    } catch (error) {
      ToastService.error('Failed to export enquiries');
    }
  };

  const filteredEnquiries = enquiries.filter(enq => {
    const matchesSearch = 
      (enq.name || enq.Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enq.email || enq.Email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (enq.subject || enq.Subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const enqStatus = enq.status || enq.Status || 'new';
    const matchesStatus = statusFilter === 'all' || enqStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Enquiries</h1>
          <p className="text-gray-600">Manage student and public enquiries</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-fit"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-gray-900 placeholder-gray-500"
          />
        </div>

        <div className="relative">
          <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary appearance-none bg-white min-w-[200px] text-gray-900"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading enquiries...</div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No enquiries found</h3>
          <p className="text-gray-500">There are no enquiries matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enq) => (
            <div key={enq.id || enq.ID} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg" style={{ color: COLORS.text }}>{enq.subject || enq.Subject || 'No Subject'}</h3>
                    <div className="flex items-center gap-3">
                      <select
                        value={enq.status || enq.Status || 'new'}
                        onChange={(e) => handleStatusChange(enq.id || enq.ID, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-none cursor-pointer outline-none ${getStatusColor(enq.status || enq.Status || 'new')}`}
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button onClick={() => handleDelete(enq.id || enq.ID)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1"><Mail size={14} /> {enq.email || enq.Email}</div>
                    {(enq.phone || enq.Phone) && <div className="flex items-center gap-1"><Phone size={14} /> {enq.phone || enq.Phone}</div>}
                    <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(enq.created_at || enq.CreatedAt).toLocaleDateString()}</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap text-gray-700">{enq.message || enq.Message}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
