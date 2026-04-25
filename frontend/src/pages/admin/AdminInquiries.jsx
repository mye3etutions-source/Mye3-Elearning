import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiMail, FiPhone, FiCheckCircle, FiClock, FiTrash2 } from 'react-icons/fi';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/inquiries');
      setInquiries(res.data);
    } catch (error) {
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/inquiries/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchInquiries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await axios.delete(`/inquiries/${id}`);
      toast.success('Inquiry deleted');
      fetchInquiries();
    } catch (error) {
      toast.error('Failed to delete inquiry');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading inquiries...</div>;
  }

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInquiries = inquiries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(inquiries.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Contact Inquiries</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage messages from students and parents</p>
        </div>
        <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-bold text-sm">
          Total: {inquiries.length}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <th className="p-4">Date</th>
                <th className="p-4">Details</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Message</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] divide-y divide-slate-100">
              {currentInquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">No inquiries found.</td>
                </tr>
              ) : (
                currentInquiries.map((inq) => (
                  <tr key={inq._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-bold text-slate-700">{new Date(inq.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{new Date(inq.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{inq.name}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{inq.role}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{inq.source}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                        <FiPhone className="text-orange-500" /> <span className="font-medium">{inq.mobile}</span>
                      </div>
                      {inq.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <FiMail /> <span>{inq.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 max-w-xs">
                      {inq.subject && <div className="font-bold text-slate-700 mb-1 text-xs">{inq.subject}</div>}
                      <p className="text-slate-600 line-clamp-2" title={inq.message}>{inq.message || <span className="italic text-slate-400">No message</span>}</p>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                        className={`text-[11px] font-bold rounded-full px-3 py-1 outline-none border cursor-pointer ${
                          inq.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                          inq.status === 'Read' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        <option value="Unread">Unread</option>
                        <option value="Read">Read</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(inq._id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Inquiry"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs font-medium text-slate-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, inquiries.length)} of {inquiries.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInquiries;
