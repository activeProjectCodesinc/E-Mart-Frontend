import { useState, useEffect } from 'react';
import { INITIAL_STORE_INFO } from '@/mock/vendor/vendorStore.mock';
import storeBannerImg from '@/assets/images/storeBanner.jpg';
import storeLogoImg from '@/assets/images/storeLogo.jpg';
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

  const mapStoreToFormData = (storeData) => {
    if (!storeData) return INITIAL_STORE_INFO;

    const categoryName =
      (typeof storeData.category === 'object' ? storeData.category?.name : storeData.category) ||
      'Supermarket';
    const categoryId =
      (typeof storeData.category === 'object' ? storeData.category?.id : null) ||
      storeData.categoryId ||
      '';

    const cityName =
      (typeof storeData.city === 'object' ? storeData.city?.name : storeData.city) ||
      'Lahore';
    const cityId =
      (typeof storeData.city === 'object' ? storeData.city?.id : null) ||
      storeData.cityId ||
      '';

    const areaName =
      (typeof storeData.area === 'object' ? storeData.area?.name : storeData.area) ||
      'Gulberg';
    const areaId =
      (typeof storeData.area === 'object' ? storeData.area?.id : null) ||
      storeData.areaId ||
      '';

    return {
      id: storeData.id || '',
      name: storeData.name || '',
      status: storeData.status || 'active',
      isOpen: storeData.isOpen !== undefined ? Boolean(storeData.isOpen) : true,
      category: categoryName,
      categoryId: categoryId,
      description: storeData.description || '',
      deliveryTime: storeData.deliveryTime || '30-45 mins',
      deliveryFee:
        storeData.deliveryFee !== undefined && storeData.deliveryFee !== null
          ? String(storeData.deliveryFee)
          : '150',
      addressLine: storeData.addressLine || storeData.address || '',
      city: cityName,
      cityId: cityId,
      area: areaName,
      areaId: areaId,
      latitude:
        storeData.latitude !== undefined && storeData.latitude !== null
          ? String(storeData.latitude)
          : '',
      longitude:
        storeData.longitude !== undefined && storeData.longitude !== null
          ? String(storeData.longitude)
          : '',
      logoUrl: storeData.logoUrl || null,
      bannerUrl: storeData.bannerUrl || null,
      banner: storeData.bannerUrl || storeData.banner || storeBannerImg,
      logo: storeData.logoUrl || storeData.logo || storeLogoImg,
    };
  };

  useEffect(() => {
    if (store) {
      setFormData(mapStoreToFormData(store));
    }
  }, [store]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };
      if (field === 'banner') {
        next.bannerUrl = value;
      }
      if (field === 'logo') {
        next.logoUrl = value;
      }
      return next;
    });
  };

  const handleCancel = () => {
    if (store) {
      setFormData(mapStoreToFormData(store));
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

    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      isOpen: Boolean(formData.isOpen),
      deliveryTime: formData.deliveryTime || '30-45 mins',
      deliveryFee: formData.deliveryFee !== '' ? Number(formData.deliveryFee) : 0,
      addressLine: formData.addressLine || '',
      city: formData.city || '',
      area: formData.area || '',
      latitude: formData.latitude !== '' ? Number(formData.latitude) : null,
      longitude: formData.longitude !== '' ? Number(formData.longitude) : null,
    };

    if (formData.categoryId) payload.categoryId = formData.categoryId;
    if (formData.cityId) payload.cityId = formData.cityId;
    if (formData.areaId) payload.areaId = formData.areaId;
    if (formData.logoUrl) payload.logoUrl = formData.logoUrl;
    if (formData.bannerUrl) payload.bannerUrl = formData.bannerUrl;

    updateStore(payload);
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
