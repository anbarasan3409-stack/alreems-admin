import { useState, useEffect } from 'react';
import { Star, Trash2, Eye, EyeOff, Search, MessageSquare } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import apiInstance, { EndPoints } from '@/api/apiInstance';
import ToastService from '@/utils/ToastService';

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('all');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await apiInstance.get(EndPoints.FEEDBACKS);
      setFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch {
      ToastService.error('Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await apiInstance.put(EndPoints.FEEDBACK_TOGGLE_FEATURED(id));
      setFeedbacks(feedbacks.map(f => f.id === id ? res.data.feedback : f));
      ToastService.success(res.data.message);
    } catch {
      ToastService.error('Failed to update feedback');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await apiInstance.delete(EndPoints.FEEDBACK_DELETE(id));
      setFeedbacks(feedbacks.filter(f => f.id !== id));
      ToastService.success('Feedback deleted');
    } catch {
      ToastService.error('Failed to delete feedback');
    }
  };

  const filtered = feedbacks.filter(f => {
    const matchSearch =
      f.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.course?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFeatured =
      filterFeatured === 'all' ||
      (filterFeatured === 'featured' && f.featured) ||
      (filterFeatured === 'unfeatured' && !f.featured);
    return matchSearch && matchFeatured;
  });

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>Feedbacks</h1>
          <p className="text-gray-500 text-sm mt-1">Manage student feedbacks and feature them as testimonials on the website.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 bg-white">
          <MessageSquare size={16} style={{ color: COLORS.secondary }} />
          <span style={{ color: COLORS.text }}>{feedbacks.length} total</span>
          <span className="mx-1 text-gray-300">|</span>
          <Star size={16} className="text-yellow-400 fill-yellow-400" />
          <span style={{ color: COLORS.text }}>{feedbacks.filter(f => f.featured).length} featured</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, course, or message..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={filterFeatured}
          onChange={e => setFilterFeatured(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none bg-white"
        >
          <option value="all">All Feedbacks</option>
          <option value="featured">Featured (Testimonials)</option>
          <option value="unfeatured">Not Featured</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: COLORS.secondary }}></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <MessageSquare size={48} className="mb-3 opacity-30" />
          <p className="font-medium">No feedbacks found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(feedback => (
            <div
              key={feedback.id}
              className={`bg-white rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200 ${
                feedback.featured ? 'border-yellow-300 ring-1 ring-yellow-200' : 'border-gray-100'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{feedback.student_name || 'Anonymous'}</p>
                  {feedback.course && (
                    <p className="text-xs text-gray-500 mt-0.5">{feedback.course}</p>
                  )}
                </div>
                {feedback.featured && (
                  <span className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" /> Testimonial
                  </span>
                )}
              </div>

              {/* Stars */}
              <div className="flex items-center gap-2">
                {renderStars(feedback.rating)}
                <span className="text-xs text-gray-400">{feedback.rating}/5</span>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-700 leading-relaxed flex-grow italic">"{feedback.message}"</p>

              {/* Date */}
              <p className="text-xs text-gray-400">{formatDate(feedback.created_at)}</p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleToggleFeatured(feedback.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    feedback.featured
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {feedback.featured ? <><EyeOff size={13} /> Unfeature</> : <><Eye size={13} /> Feature as Testimonial</>}
                </button>
                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-50 border border-gray-100 hover:border-red-200 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
