import { Admin } from './admin.model.js';
import { SiteSetting } from './site-setting.model.js';
import { MediaAsset } from './media-asset.model.js';
import { Service } from './service.model.js';
import { Package } from './package.model.js';
import { PackageFeature } from './package-feature.model.js';
import { ServicePackage } from './service-package.model.js';
import { Gallery } from './gallery.model.js';
import { GalleryImage } from './gallery-image.model.js';
import { Client } from './client.model.js';
import { Event } from './event.model.js';
import { Payment } from './payment.model.js';
import { Reservation } from './reservation.model.js';
import { AvailabilityBlock } from './availability-block.model.js';
import { Faq } from './faq.model.js';
import { SeasonalTheme } from './seasonal-theme.model.js';
import { LegalDocument } from './legal-document.model.js';

// Servicios ↔ imágenes
Service.belongsTo(MediaAsset, { as: 'heroMedia', foreignKey: 'heroMediaId' });
Service.belongsTo(MediaAsset, { as: 'coverMedia', foreignKey: 'coverMediaId' });

// Servicios ↔ paquetes (M:N)
Service.belongsToMany(Package, { through: ServicePackage, as: 'packages', foreignKey: 'serviceId', otherKey: 'packageId' });
Package.belongsToMany(Service, { through: ServicePackage, as: 'services', foreignKey: 'packageId', otherKey: 'serviceId' });
Package.hasMany(PackageFeature, { as: 'features', foreignKey: 'packageId', onDelete: 'CASCADE' });
PackageFeature.belongsTo(Package, { foreignKey: 'packageId' });

// Galerías
Service.hasOne(Gallery, { as: 'gallery', foreignKey: 'serviceId' });
Gallery.belongsTo(Service, { as: 'service', foreignKey: 'serviceId' });
Gallery.belongsTo(MediaAsset, { as: 'coverMedia', foreignKey: 'coverMediaId' });
Gallery.hasMany(GalleryImage, { as: 'images', foreignKey: 'galleryId', onDelete: 'CASCADE' });
GalleryImage.belongsTo(Gallery, { foreignKey: 'galleryId' });
GalleryImage.belongsTo(MediaAsset, { as: 'media', foreignKey: 'mediaId' });

// Agenda
Client.hasMany(Event, { as: 'events', foreignKey: 'clientId' });
Event.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
Event.belongsTo(Service, { as: 'service', foreignKey: 'serviceId' });
Event.belongsTo(Package, { as: 'package', foreignKey: 'packageId' });
Event.hasMany(Payment, { as: 'payments', foreignKey: 'eventId', onDelete: 'CASCADE' });
Payment.belongsTo(Event, { as: 'event', foreignKey: 'eventId' });
Event.hasOne(Reservation, { as: 'reservation', foreignKey: 'eventId', onDelete: 'CASCADE' });
Reservation.belongsTo(Event, { as: 'event', foreignKey: 'eventId' });
Reservation.belongsTo(MediaAsset, { as: 'coverMedia', foreignKey: 'coverMediaId' });

// Contenido
Faq.belongsTo(Service, { as: 'service', foreignKey: 'serviceId' });
SeasonalTheme.belongsTo(MediaAsset, { as: 'heroMedia', foreignKey: 'heroMediaId' });

export {
  Admin,
  SiteSetting,
  MediaAsset,
  Service,
  Package,
  PackageFeature,
  ServicePackage,
  Gallery,
  GalleryImage,
  Client,
  Event,
  Payment,
  Reservation,
  AvailabilityBlock,
  Faq,
  SeasonalTheme,
  LegalDocument,
};
