import { sequelize } from '../config/database.js';
import { Package, PackageFeature, Service } from '../models/index.js';
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
    include.push({ model: Service, as: 'services', where: { slug, isVisible: true }, attributes: [], through: { attributes: [] } });
  }
  const packages = await Package.findAll({ where, include, order: [['sortOrder', 'ASC']] });
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

async function replaceServices(pkg, serviceIds, transaction) {
  if (serviceIds) await pkg.setServices(serviceIds, { transaction });
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
