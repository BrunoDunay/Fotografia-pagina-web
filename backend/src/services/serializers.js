/** Convierte un MediaAsset a la forma que consume el frontend. */
export function toMedia(asset) {
  if (!asset) return null;
  return {
    id: asset.id,
    url: asset.secureUrl,
    publicId: asset.cloudinaryPublicId,
    width: asset.width,
    height: asset.height,
    alt: asset.altText,
  };
}

export const toNumber = (value) => (value === null || value === undefined ? null : Number(value));

/** `forPublic`: no envía el precio de los paquetes que el fotógrafo marcó como no visibles. */
export function toPackage(pkg, { forPublic = false } = {}) {
  const json = pkg.toJSON ? pkg.toJSON() : pkg;
  return {
    id: json.id,
    name: json.name,
    subtitle: json.subtitle,
    price: forPublic && json.isPriceProvisional ? null : toNumber(json.price),
    currency: json.currency,
    isPriceProvisional: json.isPriceProvisional,
    isFeatured: json.isFeatured,
    isActive: json.isActive,
    sortOrder: json.sortOrder,
    features: (json.features ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ id, label, value, sortOrder }) => ({ id, label, value, sortOrder })),
    serviceIds: json.services?.map((s) => s.id),
  };
}

export function toServiceSummary(service) {
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    shortDescription: service.shortDescription,
    cover: toMedia(service.coverMedia),
    sortOrder: service.sortOrder,
    isVisible: service.isVisible,
    isProvisional: service.isProvisional,
  };
}

export function toServiceDetail(service) {
  return {
    ...toServiceSummary(service),
    description: service.description,
    heroTitle: service.heroTitle,
    heroSubtitle: service.heroSubtitle,
    heroDescription: service.heroDescription,
    hero: toMedia(service.heroMedia),
    video: toMedia(service.videoMedia),
    seoTitle: service.seoTitle,
    seoDescription: service.seoDescription,
  };
}
