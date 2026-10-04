'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  HelpCircle, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Phone, 
  Mail, 
  AlertTriangle,
  LifeBuoy
} from 'lucide-react';

export const VoterSupportModal: React.FC = () => {
  const { isSupportModalOpen, closeSupportModal, submitSupportTicket, user } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [issueCategory, setIssueCategory] = useState<'Voting Bug' | 'Pandal Details Incorrect' | 'Emergency / Crowd' | 'Lost & Found' | 'Other'>('Voting Bug');
  const [pandalName, setPandalName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  if (!isSupportModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    const generatedId = `DGP-TCK-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketId(generatedId);

    submitSupportTicket({
      userName: name || 'Durgapur Voter',
      userEmail: email || 'voter@durgapurpuja.org',
      contactNumber: phone || '+91 98000 00000',
      issueCategory,
      pandalName: pandalName || undefined,
      message,
    });

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setMessage('');
    setPandalName('');
    closeSupportModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        className="relative w-full max-w-lg glass-modal rounded-3xl p-6 sm:p-7 overflow-hidden my-6 border-2 border-sindoor-300 shadow-2xl"
      >
        <button
          onClick={closeSupportModal}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-sindoor-50 text-sindoor-600 border border-sindoor-200">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-black text-xl text-gray-900 leading-tight">
                  Voter Helpdesk & Issue Reporting
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Report a discrepancy, lost item, or voting grievance to the Central Cell.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sen"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sindoor-400 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98321 00000"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sindoor-400 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Issue Category
                  </label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sindoor-400 bg-white font-medium"
                  >
                    <option value="Voting Bug">Voting Bug / Vote not counted</option>
                    <option value="Pandal Details Incorrect">Pandal Details Incorrect</option>
                    <option value="Emergency / Crowd">Emergency / Crowd Congestion</option>
                    <option value="Lost & Found">Lost & Found (Belongings/Persons)</option>
                    <option value="Other">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Related Pandal Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={pandalName}
                    onChange={(e) => setPandalName(e.target.value)}
                    placeholder="e.g. Marxgunj / Chaturanga"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sindoor-400 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Describe the Issue or Emergency *
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide precise details so the Durgapur Municipal Helpdesk can assist promptly..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sindoor-400 bg-white"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 text-[11px] text-amber-900 border border-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-marigold-600 shrink-0" />
                <span>
                  For medical or police emergencies on-ground, dial <strong>112</strong> or contact nearest police assistance booth immediately.
                </span>
              </div>

              <button
                type="submit"
                className="w-full btn-festive-primary py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-festive"
              >
                <Send className="w-4 h-4" />
                <span>Submit Grievance Ticket</span>
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-black text-xl text-gray-900">
              Grievance Ticket Registered!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-sm mx-auto">
              Your ticket <strong className="text-gray-900">{ticketId}</strong> has been forwarded to the Durgapur Puja Monitoring Control Room.
            </p>
            <div className="mt-5 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-500">
              Average response time: <strong>15 - 30 minutes</strong> via SMS/Call.
            </div>
            <button
              onClick={handleReset}
              className="mt-6 btn-festive-primary px-6 py-2 rounded-xl font-bold text-xs sm:text-sm"
            >
              Close Helpdesk
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
