import { sequelize } from '../config/database.js';
import { Service, MediaAsset, Gallery, GalleryImage, Package, PackageFeature, Faq } from '../models/index.js';
import { notFound } from '../utils/app-error.js';
import { slugify } from '../utils/slugify.js';
import { toPackage, toServiceDetail, toServiceSummary } from '../services/serializers.js';

const mediaIncludes = [
  { model: MediaAsset, as: 'coverMedia' },
  { model: MediaAsset, as: 'heroMedia' },
];

async function findServiceOr404(where) {
  const service = await Service.findOne({ where, include: mediaIncludes });
  if (!service) throw notFound('El servicio');
  return service;
}

/** Público: servicios visibles para el grid de la Home. */
export async function listPublic(_req, res) {
  const services = await Service.findAll({
    where: { isVisible: true },
    include: [{ model: MediaAsset, as: 'coverMedia' }],
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
  });
  res.json(services.map(toServiceSummary));
}

/** Público: página individual del servicio con paquetes, FAQ y meta de galería. */
export async function getBySlug(req, res) {
  const service = await findServiceOr404({ slug: req.params.slug, isVisible: true });

  const [packages, faqs, gallery] = await Promise.all([
    service.getPackages({
      where: { isActive: true },
      include: [{ model: PackageFeature, as: 'features' }],
      joinTableAttributes: ['sortOrder'],
    }),
    Faq.findAll({ where: { serviceId: service.id, isActive: true }, order: [['sortOrder', 'ASC']] }),
    Gallery.findOne({ where: { serviceId: service.id }, attributes: ['id'] }),
  ]);

  const imageCount = gallery ? await GalleryImage.count({ where: { galleryId: gallery.id } }) : 0;

  // El orden lo define el panel de Paquetes (orden global), igual que en la Home.
  packages.sort((a, b) => a.sortOrder - b.sortOrder);

  res.json({
    ...toServiceDetail(service),
    packages: packages.map(toPackage),
    faqs: faqs.map(({ id, question, answer }) => ({ id, question, answer })),
    gallery: { imageCount },
  });
}

/** Admin: todos los servicios, incluidos los ocultos. */
export async function listAdmin(_req, res) {
  const services = await Service.findAll({
    include: [
      ...mediaIncludes,
      { model: Package, as: 'packages', attributes: ['id'], through: { attributes: ['sortOrder'] } },
      { model: Gallery, as: 'gallery', attributes: ['id'] },
    ],
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
  });
  const counts = await GalleryImage.count({ group: ['galleryId'] });
  const countByGallery = Object.fromEntries(counts.map((c) => [c.galleryId, Number(c.count)]));
  res.json(
    services.map((s) => ({
      ...toServiceDetail(s),
      packageIds: s.packages.map((p) => p.id),
      galleryId: s.gallery?.id ?? null,
      imageCount: s.gallery ? (countByGallery[s.gallery.id] ?? 0) : 0,
    })),
  );
}

export async function getAdmin(req, res) {
  const service = await findServiceOr404({ id: req.valid.params.id });
  const packages = await service.getPackages({ attributes: ['id'], joinTableAttributes: ['sortOrder'] });
  const gallery = await Gallery.findOne({ where: { serviceId: service.id } });
  res.json({ ...toServiceDetail(service), packageIds: packages.map((p) => p.id), galleryId: gallery?.id ?? null });
}

async function setPackages(service, packageIds, transaction) {
  if (!packageIds) return;
  await service.setPackages([], { transaction });
  for (const [index, packageId] of packageIds.entries()) {
    await service.addPackage(packageId, { through: { sortOrder: index }, transaction });
  }
}

export async function create(req, res) {
  const { packageIds, ...data } = req.valid.body;
  const id = await sequelize.transaction(async (transaction) => {
    const maxOrder = (await Service.max('sortOrder', { transaction })) ?? -1;
    const service = await Service.create(
      { ...data, slug: data.slug || slugify(data.name), sortOrder: maxOrder + 1 },
      { transaction },
    );
    await Gallery.create({ serviceId: service.id, title: service.name }, { transaction });
    await setPackages(service, packageIds, transaction);
    return service.id;
  });
  res.status(201).json(toServiceDetail(await findServiceOr404({ id })));
}

export async function update(req, res) {
  const { packageIds, ...data } = req.valid.body;
  const service = await findServiceOr404({ id: req.valid.params.id });
  await sequelize.transaction(async (transaction) => {
    if (data.slug === '') data.slug = slugify(data.name ?? service.name);
    await service.update(data, { transaction });
    await setPackages(service, packageIds, transaction);
  });
  res.json(toServiceDetail(await findServiceOr404({ id: service.id })));
}

export async function setVisibility(req, res) {
  const service = await findServiceOr404({ id: req.valid.params.id });
  await service.update({ isVisible: req.valid.body.isVisible });
  res.json(toServiceSummary(service));
}

export async function reorder(req, res) {
  const { ids } = req.valid.body;
  await sequelize.transaction(async (transaction) => {
    for (const [index, id] of ids.entries()) {
      await Service.update({ sortOrder: index }, { where: { id }, transaction });
    }
  });
  res.json({ message: 'Orden actualizado.' });
}

export async function remove(req, res) {
  const service = await findServiceOr404({ id: req.valid.params.id });
  await service.destroy();
  res.status(204).end();
}
