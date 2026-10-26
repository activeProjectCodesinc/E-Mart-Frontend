import { useState, useEffect } from 'react';
import { INITIAL_STORE_INFO } from '@/mock/vendor/vendorStore.mock';
import StoreHeader from '@/components/vendor/store/StoreHeader';
import StoreBannerUpload from '@/components/vendor/store/StoreBannerUpload';
import StoreLogoUpload from '@/components/vendor/store/StoreLogoUpload';
import StoreDetailsForm from '@/components/vendor/store/StoreDetailsForm';
import StoreActionButtons from '@/components/vendor/store/StoreActionButtons';
import { useAdminStoreProfile, useUpdateStoreProfile } from '@/hooks';
import { toast } from '@/utils/toast';

export const VendorStorePage = () => {
  const { store, isLoading } = useAdminStoreProfile();
  const { mutate: updateStore, isPending } = useUpdateStoreProfile();
  const [formData, setFormData] = useState(INITIAL_STORE_INFO);

  useEffect(() => {
    if (store) {
      setFormData((prev) => ({
        ...prev,
        name: store.name || prev.name,
        description: store.description || prev.description,
        phone: store.phone || prev.phone,
        email: store.email || prev.email,
        address: store.address || prev.address,
        isOpen: store.isOpen !== undefined ? store.isOpen : prev.isOpen,
        banner: store.banner || prev.banner,
        logo: store.logo || prev.logo,
      }));
    }
  }, [store]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    if (store) {
      setFormData((prev) => ({
        ...prev,
        name: store.name || prev.name,
        description: store.description || prev.description,
        phone: store.phone || prev.phone,
        email: store.email || prev.email,
        address: store.address || prev.address,
        isOpen: store.isOpen !== undefined ? store.isOpen : prev.isOpen,
      }));
    } else {
      setFormData(INITIAL_STORE_INFO);
    }
    toast.info('Changes discarded');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error('Store name is required');
      return;
    }

    updateStore({
      name: formData.name,
      description: formData.description,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      isOpen: formData.isOpen,
    });
  };

  return (
    <div className={`space-y-4 sm:space-y-5 w-full transition-opacity ${isLoading ? 'opacity-80' : 'opacity-100'}`}>
      <StoreHeader />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
      >
        <StoreBannerUpload
          bannerUrl={formData.banner}
          onBannerChange={(url) => handleFieldChange('banner', url)}
        />

        <StoreLogoUpload
          logoUrl={formData.logo}
          onLogoChange={(url) => handleFieldChange('logo', url)}
        />

        <StoreDetailsForm
          formData={formData}
          onChange={handleFieldChange}
        />

        <StoreActionButtons
          onCancel={handleCancel}
          isSubmitting={isPending}
        />
      </form>
    </div>
  );
};

export default VendorStorePage;
