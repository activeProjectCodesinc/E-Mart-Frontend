import { SquarePenIcon, TrashIcon } from '@/icons';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200/80';
    case 'Disabled':
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200/80';
  }
};

export const BannersTable = ({
  banners,
  onEdit,
  onDelete = null,
  onToggleEnabled,
}) => {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className="w-full text-left border-collapse min-w-[840px]">
        <thead>
          <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
            <th className="py-3 px-4">Banner image</th>
            <th className="py-3 px-4">Placement / Category</th>
            <th className="py-3 px-4">Main title & Description</th>
            <th className="py-3 px-4">CTA / Destination</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
          {banners.length > 0 ? (
            banners.map((banner) => {
              const isEnabled = Boolean(banner.enabled);

              return (
                <tr
                  key={banner.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Banner image */}
                  <td className="py-4 px-4 align-top">
                    <div className="w-36 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 shadow-2xs">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="text-xs font-medium text-slate-700 truncate max-w-[144px]">
                        {banner.imageFileName || 'banner-image.jpg'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {banner.imageDimensions || '1200 × 600 px'}
                      </div>
                    </div>
                  </td>

                  {/* Placement / Category */}
                  <td className="py-4 px-4 align-top">
                    <div className="font-semibold text-slate-800">
                      {banner.placement}
                    </div>
                    {banner.placement === 'Homepage' ? (
                      <div className="text-xs text-slate-500 mt-0.5">
                        All store visitors
                      </div>
                    ) : (
                      <>
                        <div className="text-xs font-medium text-orange-600 mt-0.5">
                          {banner.category || 'Category'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Shown only in this category
                        </div>
                      </>
                    )}
                  </td>

                  {/* Main title & Description */}
                  <td className="py-4 px-4 align-top max-w-sm">
                    <div className="font-semibold text-slate-800">
                      {banner.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {banner.description}
                    </div>
                  </td>

                  {/* CTA / Destination */}
                  <td className="py-4 px-4 align-top">
                    <div className="font-semibold text-slate-800 text-xs">
                      {banner.ctaText}
                    </div>
                    <div className="text-orange-600 text-xs font-medium mt-0.5 break-all">
                      {banner.ctaLink}
                    </div>
                  </td>

                  {/* Status Badge & Toggle */}
                  <td className="py-4 px-4 align-top">
                    <div className="flex flex-col items-start gap-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStatusBadgeClass(
                          banner.status
                        )}`}
                      >
                        {banner.status}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleEnabled(banner.id)}
                          className={`relative inline-flex h-4 w-7 sm:h-4.5 sm:w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isEnabled ? 'bg-orange-500' : 'bg-slate-300'
                          }`}
                          title={isEnabled ? 'Disable banner' : 'Enable banner'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              isEnabled ? 'translate-x-3.5 sm:translate-x-3.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 px-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(banner)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-200 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50/50 transition-all cursor-pointer shadow-2xs"
                        title="Edit banner"
                      >
                        <SquarePenIcon size={13} animateOnHover={false} />
                        <span>Edit</span>
                      </button>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(banner.id)}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shadow-2xs"
                          title="Delete banner"
                        >
                          <TrashIcon size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                No banners match your search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BannersTable;
