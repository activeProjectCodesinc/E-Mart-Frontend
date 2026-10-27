import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@/icons';
import { useAnimatedIcon } from '@/utils/useAnimatedIcon';
import { usePortalBase } from '@/utils/usePortalBase';
import ProductStepIndicator from '@/components/vendor/products/form/ProductStepIndicator';
import ProductBasicInfoStep from '@/components/vendor/products/form/ProductBasicInfoStep';
import ProductPricingInventoryStep from '@/components/vendor/products/form/ProductPricingInventoryStep';
import ProductImagesPublishStep from '@/components/vendor/products/form/ProductImagesPublishStep';
import UploadSuccessModal from '@/components/vendor/products/form/UploadSuccessModal';
import UploadErrorModal from '@/components/vendor/products/form/UploadErrorModal';
import { useCreateProduct, useUpdateProduct, useAdminProductDetail, useCategories, useUploadProductImages } from '@/hooks';

const DEFAULT_BLANK_PRODUCT = {
  name: '',
  sku: '',
  unit: '1kg',
  category: 'Fruits & Vegetables',
  brand: '',
  shortDescription: '',
  detailedDescription: '',
  price: '',
  hasDiscount: false,
  stock: '',
  lowStockAlert: '10',
  stockStatus: 'Active',
  allowPurchase: true,
  images: [],
  imageFiles: [],
  tags: ['fresh', 'organic'],
  countryOfOrigin: 'Pakistan',
  status: 'Active',
};

export const AddEditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRoute } = usePortalBase();
  const [backRef, backTrigger] = useAnimatedIcon();
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  const isEditing = Boolean(id);
  const { product: apiProduct } = useAdminProductDetail(id);
  const { categories } = useCategories();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutateAsync: uploadProductImages, isPending: isUploadingImages } = useUploadProductImages();
  const [formData, setFormData] = useState(DEFAULT_BLANK_PRODUCT);

  useEffect(() => {
    if (apiProduct) {
      setFormData({
        ...DEFAULT_BLANK_PRODUCT,
        name: apiProduct.name || '',
        sku: apiProduct.sku || apiProduct.productCode || '',
        unit: apiProduct.unit || '1kg',
        category: apiProduct.category?.name || apiProduct.category || 'Fruits & Vegetables',
        categoryId: apiProduct.category?.id || apiProduct.categoryId,
        brand: typeof apiProduct.brand === 'object' ? apiProduct.brand?.name : (apiProduct.brand || ''),
        shortDescription: apiProduct.shortDescription || '',
        detailedDescription: apiProduct.description || '',
        price: apiProduct.price || '',
        stock: apiProduct.stock ?? '',
        lowStockAlert: String(apiProduct.lowStockAlert ?? '10'),
        images: apiProduct.imageUrl ? [apiProduct.imageUrl] : (apiProduct.images || []),
        status: apiProduct.status || 'Active',
      });
    }
  }, [apiProduct]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateProduct = () => {
    const missing = [];
    if (!formData.name?.trim()) missing.push('Product Name');
    if (!formData.unit?.trim()) missing.push('Unit');
    if (!formData.category?.trim()) missing.push('Category');
    if (!formData.shortDescription?.trim()) missing.push('Short Description');
    if (!formData.price || Number(formData.price) <= 0) missing.push('Selling Price');
    if (formData.stock === '' || formData.stock === undefined) missing.push('Stock Quantity');
    return missing;
  };

  const handlePublish = () => {
    const missing = validateProduct();
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowErrorModal(true);
      return;
    }

    const matchedCat = categories.find(
      (c) => c.name === formData.category || c.id === formData.categoryId
    );
    const categoryId = matchedCat?.id || categories[0]?.id || '01a1780d-1826-726b-88ba-61457d272fe2';

    const payload = {
      name: formData.name,
      unit: formData.unit,
      categoryId,
      brand: formData.brand || undefined,
      shortDescription: formData.shortDescription,
      description: formData.detailedDescription || undefined,
      price: Number(formData.price),
      stock: Number(formData.stock),
      lowStockAlert: Number(formData.lowStockAlert || 10),
      stockStatus: Number(formData.stock) > 0 ? 'in_stock' : 'out_of_stock',
      allowPurchase: formData.allowPurchase ?? true,
      origin: formData.countryOfOrigin || 'Pakistan',
      tags: formData.tags || ['fresh'],
    };

    const uploadFilesForProduct = async (prodId) => {
      if (prodId && formData.imageFiles && formData.imageFiles.length > 0) {
        const fd = new FormData();
        formData.imageFiles.forEach((file) => fd.append('files', file));
        try {
          await uploadProductImages({ id: prodId, formData: fd });
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      }
      setShowSuccessModal(true);
    };

    if (isEditing) {
      updateProduct(
        { id, ...payload },
        {
          onSuccess: () => uploadFilesForProduct(id),
        }
      );
    } else {
      createProduct(payload, {
        onSuccess: (res) => {
          const newProductId = res?.data?.product?.id || res?.product?.id || res?.id;
          uploadFilesForProduct(newProductId);
        },
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-5xl mx-auto pb-10">
      <div>
        <Link
          to={getRoute('/products')}
          onMouseEnter={backTrigger.onMouseEnter}
          onMouseLeave={backTrigger.onMouseLeave}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeftIcon ref={backRef} animateOnHover={false} size={14} />
          <span>Back to Products</span>
        </Link>

        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          {isEditing ? `Edit Product: ${formData.name || ''}` : 'Add New Product'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {isEditing ? 'Modify pricing, inventory, and product details.' : 'Fill in the basic information about your product'}
        </p>
      </div>

      <ProductStepIndicator currentStep={step} onSelectStep={setStep} />

      {step === 1 && (
        <ProductBasicInfoStep
          formData={formData}
          onChange={handleFieldChange}
          onNext={() => setStep(2)}
          onCancel={() => navigate(getRoute('/products'))}
        />
      )}

      {step === 2 && (
        <ProductPricingInventoryStep
          formData={formData}
          onChange={handleFieldChange}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
          onCancel={() => navigate(getRoute('/products'))}
        />
      )}

      {step === 3 && (
        <ProductImagesPublishStep
          formData={formData}
          onChange={handleFieldChange}
          onPublish={handlePublish}
          onBack={() => setStep(2)}
          isSubmitting={isCreating || isUpdating || isUploadingImages}
        />
      )}

      <UploadSuccessModal
        isOpen={showSuccessModal}
        product={formData}
        onAddAnother={() => {
          setFormData(DEFAULT_BLANK_PRODUCT);
          setStep(1);
          setShowSuccessModal(false);
        }}
        onBackToProducts={() => {
          setShowSuccessModal(false);
          navigate(getRoute('/products'));
        }}
      />

      <UploadErrorModal
        isOpen={showErrorModal}
        missingFields={missingFields}
        onClose={() => setShowErrorModal(false)}
        onFixErrors={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default AddEditProductPage;
