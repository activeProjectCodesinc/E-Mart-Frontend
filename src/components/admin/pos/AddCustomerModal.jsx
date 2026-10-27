import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XIcon, UserIcon, MapPinIcon, PhoneIcon } from '@/icons';
import { toast } from '@/utils/toast';

export const AddCustomerModal = ({
  isOpen,
  onClose,
  onAddCustomer,
  initialData = null,
  isHomeDelivery = false,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Lahore');
  const [area, setArea] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name === 'Walk-in Customer' ? '' : initialData.name || '');
        setPhone(initialData.phone === '—' || initialData.phone === '+92 300 0000000' ? '' : initialData.phone || '');
        setEmail(initialData.email === '—' || initialData.email === 'walkin@store.com' ? '' : initialData.email || '');
        setAddressLine(initialData.addressLine || '');
        setCity(initialData.city || 'Lahore');
        setArea(initialData.area || '');
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setAddressLine('');
        setCity('Lahore');
        setArea('');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter customer full name');
      return;
    }

    if (isHomeDelivery) {
      if (!phone.trim()) {
        toast.error('Contact phone number is required for Home Delivery');
        return;
      }
      if (!addressLine.trim()) {
        toast.error('Delivery street address is required for Home Delivery');
        return;
      }
      if (!city.trim()) {
        toast.error('City is required for Home Delivery');
        return;
      }
    }

    const customerData = {
      id: initialData?.id && initialData.id !== 'walk-in' ? initialData.id : `c-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || '—',
      email: email.trim() || '',
      addressLine: addressLine.trim() || '',
      city: city.trim() || 'Lahore',
      area: area.trim() || '',
    };

    onAddCustomer(customerData);
    toast.success(`Customer ${customerData.name} saved successfully!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#f95900] flex items-center justify-center border border-orange-100">
                  <UserIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isHomeDelivery
                      ? 'Home Delivery Customer Details'
                      : initialData
                      ? 'Edit Customer Details'
                      : 'Add New Customer'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isHomeDelivery
                      ? 'Enter recipient contact & delivery address'
                      : 'Record customer contact information'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <XIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Customer Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number {isHomeDelivery ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={isHomeDelivery}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +92 301 9876543"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                    />
                    <PhoneIcon
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ayesha@example.com"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Delivery Address {isHomeDelivery && <span className="text-rose-500">*</span>}
                  </span>
                  {isHomeDelivery && (
                    <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      Required for Home Delivery
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Street / House / Building Address {isHomeDelivery && <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={isHomeDelivery}
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="e.g. House 42, Street 7, Block B"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                    />
                    <MapPinIcon
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City {isHomeDelivery && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={isHomeDelivery}
                      list="pos-cities-list"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lahore"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                    />
                    <datalist id="pos-cities-list">
                      <option value="Lahore" />
                      <option value="Karachi" />
                      <option value="Islamabad" />
                      <option value="Rawalpindi" />
                      <option value="Faisalabad" />
                      <option value="Multan" />
                      <option value="Peshawar" />
                      <option value="Sialkot" />
                      <option value="Gujranwala" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Area / Zone / Sector
                    </label>
                    <input
                      type="text"
                      list="pos-areas-list"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Gulberg III"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-800"
                    />
                    <datalist id="pos-areas-list">
                      <option value="Gulberg III" />
                      <option value="DHA Phase 5" />
                      <option value="DHA Phase 6" />
                      <option value="Johar Town" />
                      <option value="Model Town" />
                      <option value="Bahria Town" />
                      <option value="Cantt" />
                      <option value="Blue Area" />
                      <option value="Clifton" />
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#f95900] hover:bg-[#ea5000] text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 shadow-orange-500/25"
                >
                  Save Customer Details
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddCustomerModal;
