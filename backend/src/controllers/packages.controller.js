import { sequelize } from '../config/database.js';
import { Package, PackageFeature, Service, ServicePackage } from '../models/index.js';
import { notFound } from '../utils/app-error.js';
import { toPackage } from '../services/serializers.js';

const includes = [
  { model: PackageFeature, as: 'features' },
  { model: Service, as: 'services', attributes: ['id'], through: { attributes: [] } },
];

async function findPackageOr404(id) {
  const pkg = await Package.findByPk(id, { include: includes });
  if (!pkg) throw notFound('El paquete');
  return pkg;
}

/** Público: paquetes activos; opcionalmente filtrados por servicio (?service=slug). */
export async function listPublic(req, res) {
  const { service: slug } = req.valid.query;
  const where = { isActive: true };
  const include = [{ model: PackageFeature, as: 'features' }];
  if (slug) {
    include.push({ model: Service, as: 'services', where: { slug, isVisible: true }, attributes: ['id'], through: { attributes: ['sortOrder'] } });
  }
  const packages = await Package.findAll({ where, include, order: [['sortOrder', 'ASC']] });
  // Con servicio: el orden que Armando le dio dentro de ese servicio (empates: orden general).
  if (slug) {
    const inService = (pkg) => pkg.services?.[0]?.ServicePackage?.sortOrder ?? 0;
    packages.sort((a, b) => inService(a) - inService(b) || a.sortOrder - b.sortOrder);
  }
  res.json(packages.map((pkg) => toPackage(pkg, { forPublic: true })));
}

export async function listAdmin(_req, res) {
  const packages = await Package.findAll({ include: includes, order: [['sortOrder', 'ASC']] });
  res.json(packages.map((pkg) => toPackage(pkg)));
}

async function replaceFeatures(packageId, features, transaction) {
  if (!features) return;
  await PackageFeature.destroy({ where: { packageId }, transaction });
  await PackageFeature.bulkCreate(
    features.map((f, index) => ({ packageId, label: f.label, value: f.value ?? null, sortOrder: index })),
    { transaction },
  );
}

/** Cambia los servicios del paquete. Donde se agrega por primera vez, queda al final de ese servicio. */
async function replaceServices(pkg, serviceIds, transaction) {
  if (!serviceIds) return;
  const wanted = new Set(serviceIds);
  const current = await ServicePackage.findAll({ where: { packageId: pkg.id }, transaction });
  for (const link of current) {
    if (!wanted.has(link.serviceId)) await link.destroy({ transaction });
  }
  const linked = new Set(current.map((link) => link.serviceId));
  for (const serviceId of wanted) {
    if (linked.has(serviceId)) continue;
    const last = (await ServicePackage.max('sortOrder', { where: { serviceId }, transaction })) ?? -1;
    await ServicePackage.create({ serviceId, packageId: pkg.id, sortOrder: last + 1 }, { transaction });
  }
}

export async function create(req, res) {
  const { features, serviceIds, ...data } = req.valid.body;
  const id = await sequelize.transaction(async (transaction) => {
    const maxOrder = (await Package.max('sortOrder', { transaction })) ?? -1;
    const pkg = await Package.create({ ...data, sortOrder: maxOrder + 1 }, { transaction });
    await replaceFeatures(pkg.id, features ?? [], transaction);
    await replaceServices(pkg, serviceIds, transaction);
    return pkg.id;
  });
  res.status(201).json(toPackage(await findPackageOr404(id)));
}

export async function update(req, res) {
  const { features, serviceIds, ...data } = req.valid.body;
  const pkg = await findPackageOr404(req.valid.params.id);
  await sequelize.transaction(async (transaction) => {
    await pkg.update(data, { transaction });
    await replaceFeatures(pkg.id, features, transaction);
    await replaceServices(pkg, serviceIds, transaction);
  });
  res.json(toPackage(await findPackageOr404(pkg.id)));
}

export async function setActive(req, res) {
  const pkg = await findPackageOr404(req.valid.params.id);
  await pkg.update({ isActive: req.valid.body.isActive });
  res.json(toPackage(pkg));
}

export async function reorder(req, res) {
  await sequelize.transaction(async (transaction) => {
    for (const [index, id] of req.valid.body.ids.entries()) {
      await Package.update({ sortOrder: index }, { where: { id }, transaction });
    }
  });
  res.json({ message: 'Orden actualizado.' });
}

export async function remove(req, res) {
  const pkg = await findPackageOr404(req.valid.params.id);
  await pkg.destroy();
  res.status(204).end();
}
