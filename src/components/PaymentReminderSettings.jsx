'use client';
import React, { useState, useEffect } from 'react';
import {
  BellRing,
  Calendar,
  Clock,
  Mail,
  Send,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Info,
  Users,
  BookOpen,
  Eye,
  Check
} from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import ToastService from '@/utils/ToastService';
import { useAuth } from '@/context/AuthContext';

export default function PaymentReminderSettings({
  settings,
  loading,
  actionLoading,
  updateSettings,
  triggerRemindersNow,
  sendTestEmail
}) {
  const { user } = useAuth();

  // Local form state
  const [formData, setFormData] = useState({
    enabled: false,
    scheduleType: 'monthly',
    dayOfMonth: 1,
    specificDate: '',
    sendTime: '09:00',
    emailSubject: 'Payment Reminder: Upcoming Course Tuition Fee - Al Reems Academy',
    customMessage: 'This is a friendly reminder regarding the upcoming tuition fee payment for the course(s) you are currently enrolled in at Al Reems Academy.'
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState(user?.email || '');
  const [previewTab, setPreviewTab] = useState('settings'); // 'settings' | 'preview'

  // Sync form with loaded settings
  useEffect(() => {
    if (settings) {
      const hour = String(settings.sendHour ?? 9).padStart(2, '0');
      const minute = String(settings.sendMinute ?? 0).padStart(2, '0');

      setFormData({
        enabled: Boolean(settings.enabled),
        scheduleType: settings.scheduleType || 'monthly',
        dayOfMonth: Number(settings.dayOfMonth) || 1,
        specificDate: settings.specificDate || '',
        sendTime: `${hour}:${minute}`,
        emailSubject: settings.emailSubject || 'Payment Reminder: Upcoming Course Tuition Fee - Al Reems Academy',
        customMessage: settings.customMessage || 'This is a friendly reminder regarding the upcoming tuition fee payment for the course(s) you are currently enrolled in at Al Reems Academy.'
      });
      setIsDirty(false);
    }
  }, [settings]);

  useEffect(() => {
    if (user?.email && !testEmailAddress) {
      setTestEmailAddress(user.email);
    }
  }, [user, testEmailAddress]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      const [hStr, mStr] = formData.sendTime.split(':');
      const sendHour = parseInt(hStr, 10) || 0;
      const sendMinute = parseInt(mStr, 10) || 0;

      await updateSettings({
        ...settings,
        enabled: formData.enabled,
        scheduleType: formData.scheduleType,
        dayOfMonth: parseInt(formData.dayOfMonth, 10),
        specificDate: formData.specificDate,
        sendHour,
        sendMinute,
        emailSubject: formData.emailSubject,
        customMessage: formData.customMessage
      });
      setIsDirty(false);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleToggleEnable = async () => {
    const newEnabled = !formData.enabled;
    handleChange('enabled', newEnabled);
    try {
      const [hStr, mStr] = formData.sendTime.split(':');
      await updateSettings({
        ...settings,
        enabled: newEnabled,
        scheduleType: formData.scheduleType,
        dayOfMonth: parseInt(formData.dayOfMonth, 10),
        specificDate: formData.specificDate,
        sendHour: parseInt(hStr, 10) || 0,
        sendMinute: parseInt(mStr, 10) || 0,
        emailSubject: formData.emailSubject,
        customMessage: formData.customMessage
      });
      setIsDirty(false);
    } catch (err) {
      // Revert if error
      handleChange('enabled', !newEnabled);
    }
  };

  const handleConfirmSendNow = async () => {
    setShowConfirmModal(false);
    try {
      await triggerRemindersNow();
    } catch (err) {
      // Handled in hook
    }
  };

  const handleSendTest = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      ToastService.error('Please enter a valid email address');
      return;
    }
    setShowTestModal(false);
    try {
      await sendTestEmail(testEmailAddress);
    } catch (err) {
      // Handled in hook
    }
  };

  // Helper to compute next scheduled run
  const computeNextRun = () => {
    if (!formData.enabled) return 'Scheduler is currently disabled';

    const now = new Date();
    const [h, m] = formData.sendTime.split(':').map(Number);

    if (formData.scheduleType === 'monthly') {
      const day = formData.dayOfMonth;
      let nextDate = new Date(now.getFullYear(), now.getMonth(), day, h, m, 0);

      // If scheduled time today or earlier in the current month has already passed
      if (nextDate <= now) {
        nextDate = new Date(now.getFullYear(), now.getMonth() + 1, day, h, m, 0);
      }

      return nextDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (formData.scheduleType === 'specific_date') {
      if (!formData.specificDate) return 'Specific date not set';
      const [y, mon, d] = formData.specificDate.split('-').map(Number);
      const nextDate = new Date(y, mon - 1, d, h, m, 0);

      if (nextDate <= now) {
        return `Date has passed (${formData.specificDate})`;
      }

      return nextDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return 'Pending schedule setup';
  };

  const formatLastRunDate = (dateStr) => {
    if (!dateStr) return 'Never executed';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Scheduler Status Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                formData.enabled ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Payment Reminder Mail Scheduler</h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    formData.enabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      formData.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
                  {formData.enabled ? 'Scheduler Active' : 'Scheduler Paused'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Automatically send email reminders for tuition fee payments to students for their enrolled courses on the scheduled date.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              {formData.enabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              type="button"
              onClick={handleToggleEnable}
              disabled={loading || actionLoading}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                formData.enabled ? 'bg-amber-700' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  formData.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Users size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Active Students</p>
                <p className="text-lg font-bold text-gray-900">
                  {settings?.activeStudentsCount ?? '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Enrolled Courses</p>
                <p className="text-lg font-bold text-gray-900">
                  {settings?.activeEnrollmentsCount ?? '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <Calendar size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase">Next Scheduled Run</p>
                <p className="text-sm font-semibold text-gray-900 truncate" title={computeNextRun()}>
                  {computeNextRun()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Clock size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase">Last Executed</p>
                <p className="text-sm font-semibold text-gray-900 truncate" title={formatLastRunDate(settings?.lastRunAt)}>
                  {formatLastRunDate(settings?.lastRunAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Last Run Log Details */}
        {settings?.lastRunStatus && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-center gap-2">
            <Info size={16} className="text-blue-600 flex-shrink-0" />
            <span><strong>Latest Execution Log:</strong> {settings.lastRunStatus}</span>
          </div>
        )}
      </div>

      {/* Tabs for Configuration vs Email Preview */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setPreviewTab('settings')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              previewTab === 'settings'
                ? 'border-[#3B0200] text-[#3B0200]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Clock size={16} />
            Schedule & Email Configuration
          </button>
          <button
            onClick={() => setPreviewTab('preview')}
            className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              previewTab === 'preview'
                ? 'border-[#3B0200] text-[#3B0200]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Eye size={16} />
            Live Email Preview
          </button>
        </div>

        {/* Quick action buttons in tab bar */}
        <div className="flex items-center gap-2 pb-2">
          <button
            onClick={() => setShowTestModal(true)}
            disabled={actionLoading || loading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Mail size={14} />
            Send Test Preview
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={actionLoading || loading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 rounded-lg hover:bg-amber-800 transition-colors shadow-sm disabled:opacity-50"
          >
            {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            Trigger Reminders Now
          </button>
        </div>
      </div>

      {/* Content depending on tab */}
      {previewTab === 'settings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Schedule Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="text-amber-700" size={20} />
                Scheduler Timing
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Configure when the automated reminder emails should be dispatched to students.
              </p>
            </div>

            {/* Schedule Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">Frequency</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('scheduleType', 'monthly')}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    formData.scheduleType === 'monthly'
                      ? 'border-[#3B0200] bg-amber-50/40 ring-1 ring-[#3B0200]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900">Monthly Recurring</p>
                  <p className="text-xs text-gray-500 mt-0.5">Send on a set day of every month</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('scheduleType', 'specific_date')}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    formData.scheduleType === 'specific_date'
                      ? 'border-[#3B0200] bg-amber-50/40 ring-1 ring-[#3B0200]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-bold text-gray-900">Specific Date</p>
                  <p className="text-xs text-gray-500 mt-0.5">One-time calendar date</p>
                </button>
              </div>
            </div>

            {/* Monthly Day of Month Selector */}
            {formData.scheduleType === 'monthly' ? (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Day of the Month
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={formData.dayOfMonth}
                    onChange={(e) => handleChange('dayOfMonth', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const suffix =
                        day === 1 || day === 21 || day === 31
                          ? 'st'
                          : day === 2 || day === 22
                          ? 'nd'
                          : day === 3 || day === 23
                          ? 'rd'
                          : 'th';
                      return (
                        <option key={day} value={day}>
                          {day}
                          {suffix} of every month {day === 1 ? '(Default - Beginning of month)' : ''} {day === 25 ? '(Common for salary/tuition reminders)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <p className="text-xs text-gray-500">
                  For months with fewer days (e.g., February), reminders will automatically trigger on the final day of the month.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Select Calendar Date
                </label>
                <input
                  type="date"
                  value={formData.specificDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleChange('specificDate', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
                <p className="text-xs text-gray-500">
                  Reminder emails will be sent on this exact calendar date.
                </p>
              </div>
            )}

            {/* Time of Day */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Clock size={16} className="text-gray-500" />
                Dispatch Time
              </label>
              <input
                type="time"
                value={formData.sendTime}
                onChange={(e) => handleChange('sendTime', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
              />
              <p className="text-xs text-gray-500">
                The scheduler checks the system clock and dispatches reminder emails at this time.
              </p>
            </div>
          </div>

          {/* Column 2: Email Content Customizer */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Mail className="text-amber-700" size={20} />
                Email Content
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Customize the reminder email subject and message sent to enrolled students.
              </p>
            </div>

            {/* Subject Line */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Email Subject Line</label>
              <input
                type="text"
                value={formData.emailSubject}
                onChange={(e) => handleChange('emailSubject', e.target.value)}
                placeholder="Payment Reminder: Upcoming Course Tuition Fee - Al Reems Academy"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
              />
            </div>

            {/* Custom Intro Message */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Introductory Message</label>
              <textarea
                rows={3}
                value={formData.customMessage}
                onChange={(e) => handleChange('customMessage', e.target.value)}
                placeholder="This is a friendly reminder regarding the upcoming tuition fee payment..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
              />
              <p className="text-xs text-gray-500">
                This message appears at the top of the email before the list of courses the student has enrolled in.
              </p>
            </div>

            {/* Mandatory Disclaimer Display (Always Enforced) */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle size={18} className="text-amber-700" />
                Automatic Student Notice (Included in All Reminders)
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                &ldquo;Important Notice: Please ignore this email if you have already completed your payment for this period.&rdquo;
              </p>
              <p className="text-[11px] text-amber-700 italic">
                This notice is automatically appended to all reminder emails so that students who have already paid know they can safely disregard it.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Live Email Preview Tab */
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Student Email Preview</h3>
              <p className="text-sm text-gray-500">
                This is a live representation of how the reminder email will render in the student&apos;s email inbox.
              </p>
            </div>
            <button
              onClick={() => setShowTestModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
            >
              <Send size={14} />
              Send This Preview to Email
            </button>
          </div>

          {/* Email Canvas Preview */}
          <div className="max-w-2xl mx-auto border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
            {/* Email Header */}
            <div className="bg-[#3B0200] p-6 text-center text-white">
              <h2 className="text-xl font-bold tracking-wider">AL REEMS ACADEMY</h2>
              <p className="text-amber-200 text-xs mt-1 font-medium">Tuition Fee Payment Reminder</p>
            </div>

            {/* Email Body */}
            <div className="p-6 space-y-5 text-gray-800 text-sm">
              <div className="border-b border-gray-100 pb-3 text-xs text-gray-500">
                <strong>Subject:</strong> {formData.emailSubject}
              </div>

              <div>
                <p className="font-bold text-base text-gray-900 mb-2">Dear [Student Name],</p>
                <p className="text-gray-600 leading-relaxed">
                  {formData.customMessage ||
                    'This is a friendly reminder regarding the upcoming tuition fee payment for the course(s) you are currently enrolled in at Al Reems Academy.'}
                </p>
              </div>

              {/* Course Table Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-700">
                  Your Enrolled Courses
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="py-2 px-4 text-left font-semibold">Course</th>
                      <th className="py-2 px-4 text-left font-semibold">Code</th>
                      <th className="py-2 px-4 text-right font-semibold">Fee (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-900">Quran Memorization & Tajweed</td>
                      <td className="py-2.5 px-4 text-gray-500 font-mono">QRN-101</td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#3B0200]">150.00 AED</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-gray-900">Islamic Studies & Arabic</td>
                      <td className="py-2.5 px-4 text-gray-500 font-mono">ARB-201</td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#3B0200]">150.00 AED</td>
                    </tr>
                    <tr className="bg-amber-50/60 font-bold">
                      <td colSpan={2} className="py-2.5 px-4 text-amber-900">
                        Total Estimated Due:
                      </td>
                      <td className="py-2.5 px-4 text-right text-amber-900 text-sm">300.00 AED</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Highlighted Notice */}
              <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                <p className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <AlertTriangle size={16} className="text-amber-600" />
                  Important Notice
                </p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  <strong>Please ignore this email if you have already completed your payment.</strong> If your payment was recently processed, no further action is required.
                </p>
              </div>

              {/* CTA Button */}
              <div className="text-center pt-2">
                <span className="inline-block bg-[#3B0200] text-white px-6 py-2.5 rounded-lg font-semibold text-xs shadow-sm">
                  Access Student Portal &amp; Pay
                </span>
              </div>
            </div>

            {/* Email Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 text-center text-xs text-gray-400">
              <p>&copy; 2026 Al Reems Academy. All rights reserved.</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating or Bottom Save Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-sm">
          {isDirty ? (
            <span className="text-amber-700 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              You have unsaved changes
            </span>
          ) : (
            <span className="text-gray-500 flex items-center gap-1.5">
              <Check size={16} className="text-emerald-600" />
              Settings are up to date
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Save Reminder Settings
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Immediate Send */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Send size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Trigger Reminders Now?</h3>
                <p className="text-xs text-gray-500">Manual Broadcast Execution</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              This will immediately send payment reminder emails for enrolled courses to{' '}
              <strong>{settings?.activeStudentsCount ?? 'all'} active students</strong>.
            </p>

            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              Every email includes the notice:{' '}
              <em>&ldquo;Please ignore this email if you have already completed your payment.&rdquo;</em>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSendNow}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm"
              >
                Yes, Send Reminders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-blue-700">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Send Test Reminder Email</h3>
                <p className="text-xs text-gray-500">Preview rendering in your inbox</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Destination Email</label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-gray-500">
                A sample reminder email will be sent containing your current template settings.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTest}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Send Test Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
