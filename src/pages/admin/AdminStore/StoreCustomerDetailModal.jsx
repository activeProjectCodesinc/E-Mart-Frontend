import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  XIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  TrashIcon,
  PlusIcon,
  ReceiptTextIcon,
  CartIcon,
  TrendingUpIcon,
} from '@/icons';
import { useApiQuery } from '@/hooks/useApiQuery';
import { post, del } from '@/services/apiServices';
import { apiRoutes } from '@/services/apiRoutes';
import { QUERY_KEYS } from '@/services/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/utils/toast';

export const StoreCustomerDetailModal = ({ customerId, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'notes'
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const detailUrl = apiRoutes.admin?.store?.customers?.detail
    ? apiRoutes.admin.store.customers.detail(customerId)
    : `/admin/store/customers/${customerId}`;

  const queryKey = QUERY_KEYS.ADMIN?.STORE?.CUSTOMERS?.DETAIL
    ? QUERY_KEYS.ADMIN.STORE.CUSTOMERS.DETAIL(customerId)
    : ['store', 'customer', customerId];

  const { data: response, isLoading, isError, refetch } = useApiQuery(
    queryKey,
    detailUrl,
    {
      enabled: !!customerId && isOpen,
      staleTime: 30 * 1000,
    }
  );

  const customer = response?.data?.customer;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setIsSubmittingNote(true);
      const notesUrl = apiRoutes.admin?.store?.customers?.notes
        ? apiRoutes.admin.store.customers.notes(customerId)
        : `/admin/store/customers/${customerId}/notes`;

      await post(notesUrl, { body: newNote.trim() });
      toast.success('Store note added successfully');
      setNewNote('');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch (err) {
      console.error('Failed to add note:', err);
      toast.error('Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setDeletingNoteId(noteId);
      const deleteUrl = apiRoutes.admin?.store?.customers?.deleteNote
        ? apiRoutes.admin.store.customers.deleteNote(customerId, noteId)
        : `/admin/store/customers/${customerId}/notes/${noteId}`;

      await del(deleteUrl);
      toast.success('Note removed');
      queryClient.invalidateQueries({ queryKey });
      refetch();
    } catch (err) {
      console.error('Failed to delete note:', err);
      toast.error('Failed to remove note');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s === 'processing' || s === 'shipped') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (s === 'pending') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s === 'cancelled' || s === 'rejected') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                {(customer?.name || 'C')[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    {customer?.name || 'Customer Profile'}
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-orange-50 text-orange-600 rounded-md border border-orange-200">
                    CUST-{customerId?.slice(0, 6).toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Store customer 360 purchasing habits and history
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <XIcon size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Loading customer 360 records...
                </p>
              </div>
            ) : isError || !customer ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-semibold text-rose-600">
                  Could not load customer details
                </p>
                <p className="text-xs text-slate-400">
                  Please check network connection or try again.
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Contact Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <PhoneIcon size={14} className="text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{customer.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MailIcon size={14} className="text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{customer.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarDaysIcon size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">Since {formatDate(customer.customerSince)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <ClockIcon size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">Last: {formatDate(customer.lastOrderAt)}</span>
                  </div>
                </div>

                {/* 4 Key Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                    <span className="text-[11px] font-medium text-slate-500 block">Total Orders</span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">
                      {customer.stats?.totalOrders ?? customer.totalOrders ?? 0}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Store Lifetime</span>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                    <span className="text-[11px] font-medium text-slate-500 block">Total Spent</span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">
                      PKR {Number(customer.stats?.totalSpent ?? customer.totalSpent ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Delivered Orders</span>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                    <span className="text-[11px] font-medium text-slate-500 block">Avg. Order Value</span>
                    <span className="text-lg font-bold text-slate-900 mt-1 block">
                      PKR {Number(customer.stats?.averageOrder ?? (Number(customer.totalSpent || 0) / Math.max(1, customer.totalOrders || 1))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Per Transaction</span>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                    <span className="text-[11px] font-medium text-slate-500 block">Status</span>
                    <div className="mt-1">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Account verified</span>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                      activeTab === 'orders'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <CartIcon size={14} />
                    <span>Recent Orders ({customer.recentOrders?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                      activeTab === 'addresses'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <MapPinIcon size={14} />
                    <span>Addresses & Spend ({customer.addresses?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                      activeTab === 'notes'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ReceiptTextIcon size={14} />
                    <span>Private Store Notes ({customer.notes?.length || 0})</span>
                  </button>
                </div>

                {/* Tab 1: Recent Store Orders */}
                {activeTab === 'orders' && (
                  <div className="space-y-3">
                    {!customer.recentOrders || customer.recentOrders.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No orders recorded for this customer yet.
                      </div>
                    ) : (
                      <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500">
                              <th className="py-2.5 px-3">Order #</th>
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3 text-center">Items</th>
                              <th className="py-2.5 px-3 text-right">Total</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {customer.recentOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-3 font-semibold text-orange-600">
                                  #{ord.orderNumber || ord.id.slice(0, 8)}
                                </td>
                                <td className="py-2.5 px-3 text-slate-500">
                                  {formatDateTime(ord.placedAt)}
                                </td>
                                <td className="py-2.5 px-3 text-center font-medium text-slate-700">
                                  {ord.itemsCount ?? 1}
                                </td>
                                <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                                  PKR {Number(ord.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                                      ord.status
                                    )}`}
                                  >
                                    {ord.status || 'Delivered'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Addresses & Monthly Spend */}
                {activeTab === 'addresses' && (
                  <div className="space-y-5">
                    {/* Saved Addresses */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                        Saved Delivery Locations
                      </h3>
                      {!customer.addresses || customer.addresses.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No saved addresses on file (POS Counter or Walk-in client).</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {customer.addresses.map((addr, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">
                                  {addr.label || 'Delivery Address'}
                                </span>
                                {addr.lastUsedAt && (
                                  <span className="text-[10px] text-slate-400">
                                    Last used {formatDate(addr.lastUsedAt)}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 text-[11px] leading-relaxed">
                                {addr.address}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Monthly Spend Summary */}
                    {customer.orderSummary && customer.orderSummary.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                          Monthly Spend Breakdown
                        </h3>
                        <div className="grid grid-cols-3 gap-2.5">
                          {customer.orderSummary.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white border border-slate-200/80 rounded-xl text-xs"
                            >
                              <span className="font-semibold text-slate-500 block text-[11px]">
                                {item.month}
                              </span>
                              <span className="font-bold text-slate-900 mt-1 block">
                                PKR {Number(item.spent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {item.orders} {item.orders === 1 ? 'order' : 'orders'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Private Store Notes */}
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    {/* Add Note Form */}
                    <form onSubmit={handleAddNote} className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Add Internal Store Note
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="e.g. VIP client, prefers evening deliveries, allergic to nuts..."
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                        <button
                          type="submit"
                          disabled={!newNote.trim() || isSubmittingNote}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          <PlusIcon size={14} />
                          <span>{isSubmittingNote ? 'Saving...' : 'Add Note'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Notes are strictly private to store staff and never shown to the customer.
                      </p>
                    </form>

                    {/* Notes List */}
                    <div className="space-y-2 pt-2">
                      {!customer.notes || customer.notes.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4 text-center">
                          No private notes recorded for this customer yet.
                        </p>
                      ) : (
                        customer.notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <p className="text-slate-800 font-medium leading-relaxed">
                                {note.body}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>By {note.author || 'Store Staff'}</span>
                                <span>•</span>
                                <span>{formatDateTime(note.createdAt)}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={deletingNoteId === note.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                              title="Delete Note"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors shadow-2xs"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StoreCustomerDetailModal;
