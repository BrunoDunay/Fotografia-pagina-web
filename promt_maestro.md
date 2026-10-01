# Proyecto: Sitio web profesional y sistema administrativo para Armando Ovalle Wedding Studio

Quiero desarrollar un sitio web profesional para un fotógrafo llamado **Jorge Armando Ovalle**, cuya marca es:

**Armando Ovalle Wedding Studio**

El fotógrafo está especializado principalmente en fotografía de bodas, pero también trabaja en múltiples tipos de eventos, sesiones y fotografía comercial.

El proyecto debe desarrollarse como una aplicación web completa, con:

1. Una parte pública orientada a clientes y visitantes.
2. Un panel administrativo privado para que el fotógrafo pueda administrar el contenido de su página, eventos, clientes, paquetes, disponibilidad y otra información.

El objetivo es que el sitio funcione como:

* Portafolio profesional
* Página comercial
* Catálogo de servicios
* Agenda digital
* Sistema sencillo de administración
* Sistema de reservaciones visuales para clientes

No quiero construir una plataforma empresarial excesivamente compleja. La prioridad es que el sitio sea visualmente atractivo, profesional, rápido y sencillo de administrar.

---

# 1. INFORMACIÓN REAL DEL FOTÓGRAFO

Utilizar inicialmente la siguiente información real.

## Nombre

Jorge Armando Ovalle

## Marca

Armando Ovalle Wedding Studio

## Instagram

armandoovalle.ws

## Facebook

Armando Ovalle Wedding Studio

## Email

[Ovalle.photo00@gmail.com](mailto:Ovalle.photo00@gmail.com)

## Teléfono / WhatsApp

+52 449 9995998

## Formación

Estudió:

Diseño y Producción de Contenidos

Universidad Cuauhtémoc de Aguascalientes

## Experiencia

Tiene aproximadamente:

* 7 años en el sector de la fotografía
* más de 200 eventos cubiertos

Estos números deben tratarse como datos editables desde el panel administrativo, ya que pueden cambiar con el tiempo.

---

# 2. SERVICIOS

Actualmente algunos de los servicios y tipos de fotografía que ofrece incluyen:

* Bodas
* Bodas en la playa
* XV años
* Graduaciones
* Baby showers
* Shows
* Conciertos
* Party clubs / antros
* Bares
* Restaurantes
* Fotos de estudio
* Sesiones individuales
* Sesiones al aire libre
* Save the Date
* Pedidas de mano
* Otros eventos sociales

No asumir que esta lista es definitiva.

La arquitectura debe permitir agregar, editar, ocultar o eliminar servicios desde el panel administrativo.

---

# 3. INFORMACIÓN PROVISIONAL

Cuando no exista información real proporcionada en este documento, utilizar información preliminar/provisional.

Por ejemplo:

* precios
* nombres exactos de paquetes
* cantidades exactas de fotografías
* horarios
* descripciones comerciales
* características específicas de cada paquete
* información que todavía no haya sido proporcionada

IMPORTANTE:

La información provisional debe estar estructurada de manera que posteriormente pueda sustituirse fácilmente desde el panel administrativo.

No inventar datos como si fueran información oficial del fotógrafo.

Si se necesita mostrar un precio temporalmente, utilizar un valor claramente provisional.

---

# 4. REFERENCIAS VISUALES DEL PROYECTO

Existe una carpeta llamada:

ideas/

Esta carpeta está ubicada al mismo nivel que:

frontend/
backend/

Es decir:

/
├── frontend/
├── backend/
└── ideas/

Dentro de `ideas/` existen imágenes que contienen referencias de diseño para diferentes partes del proyecto.

Estas imágenes son MUY IMPORTANTES.

Antes de comenzar a diseñar los componentes y páginas, debes inspeccionar las imágenes disponibles dentro de:

ideas/

y utilizarlas como referencias visuales para determinar:

* estilo
* composición
* distribución
* jerarquía visual
* espaciado
* tratamiento de imágenes
* tarjetas
* navbar
* botones
* tipografía
* galerías
* composición de secciones
* estética general

Puede haber referencias específicas para:

* Home
* Navbar
* Sobre mí
* Galerías
* servicios
* otras páginas

No quiero que ignores estas referencias para crear una plantilla genérica de fotógrafo.

Las referencias deben influir directamente en el diseño final.

Sin embargo, no necesariamente debes copiar literalmente cada imagen.

La intención es tomar las ideas visuales y adaptarlas coherentemente al proyecto de Armando Ovalle Wedding Studio.

Si existen varias referencias contradictorias, analiza cuál es el lenguaje visual común y crea una identidad coherente.

Antes de implementar la interfaz definitiva, identifica qué referencias existen y explica brevemente qué elementos visuales importantes detectaste.

---

# 5. SISTEMA DE COLORES

Quiero que los colores principales de la página se definan mediante variables CSS.

El archivo principal será:

frontend/src/styles.css

o el archivo global equivalente que utilice el proyecto Angular.

Definir ahí las variables de color.

Ejemplo conceptual:

:root {
--color-primary: ...;
--color-secondary: ...;
--color-background: ...;
--color-surface: ...;
--color-text: ...;
--color-text-muted: ...;
--color-border: ...;
--color-accent: ...;
}

No colocar colores arbitrarios repetidos directamente en los componentes.

Toda la aplicación debe utilizar las variables globales.

Si posteriormente se cambia un color principal, debe poder modificarse desde un solo lugar.

Los colores exactos NO están definidos todavía.

Deben determinarse a partir de:

1. Las referencias visuales de `ideas/`
2. Las fotografías
3. El concepto de Armando Ovalle Wedding Studio
4. Una estética fotográfica profesional, elegante y moderna

No asumir automáticamente que debe utilizarse negro puro.

El sistema debe tener una paleta coherente y reutilizable.

---

# 6. STACK TECNOLÓGICO

## Frontend

Usar:

* Angular
* TypeScript
* Angular Router
* Reactive Forms
* HTTP Client
* Guards
* Interceptors
* Lazy loading cuando sea conveniente

## Backend

Usar:

* Node.js
* Express
* PostgreSQL
* JWT
* bcrypt
* API REST

---

# 7. BASE DE DATOS

Utilizar PostgreSQL.

La información estructurada será almacenada en PostgreSQL.

Entre las entidades iniciales:

* Admin/User
* Client
* Event
* Service/EventType
* Package
* Payment
* Gallery
* GalleryImage
* Reservation
* FAQ
* SiteSettings
* SeasonalTheme

La estructura puede ampliarse si es necesario.

Las imágenes NO deben almacenarse directamente en PostgreSQL.

---

# 8. ALMACENAMIENTO DE IMÁGENES

Las fotografías serán uno de los elementos principales del sitio.

Utilizar un servicio externo de almacenamiento de imágenes.

Preferentemente:

Cloudinary

o un servicio equivalente.

El sistema debe permitir:

* subir imágenes
* optimizarlas
* generar thumbnails
* entregar diferentes tamaños
* utilizar CDN
* limitar tamaño de archivo
* limitar cantidad de fotografías
* validar formatos

El fotógrafo no debe tener que preocuparse por optimizar manualmente cada fotografía.

---

# 9. VIDEOS

Cada servicio puede tener un video destacado.

Ejemplos:

* bodas
* XV años
* baby shower
* conciertos
* etc.

Para evitar problemas con archivos excesivamente pesados, inicialmente los videos se manejarán mediante URLs externas.

Por ejemplo:

* YouTube
* Vimeo

Desde el panel administrativo el fotógrafo podrá cambiar la URL del video.

No implementar inicialmente almacenamiento directo de videos pesados.

---

# 10. HOME

La Home tendrá:

1. Navbar
2. Hero
3. Propuesta de valor
4. Sobre mí resumido
5. Servicios
6. posiblemente otras secciones visuales definidas posteriormente a partir de las referencias de `ideas/`
7. FAQ
8. Contacto
9. Footer

La composición definitiva debe surgir de las referencias visuales disponibles.

---

# 11. NAVBAR

Debe existir un navbar desde el inicio de la Home.

Debe ser:

* elegante
* moderno
* responsive
* coherente con las referencias visuales
* fácil de navegar

Debe utilizar Angular Router.

Debe poder adaptarse a los temas estacionales.

El diseño exacto debe determinarse después de revisar las imágenes de:

ideas/

---

# 12. HERO PRINCIPAL

La Home tendrá un Hero visualmente dominante.

Debe utilizar una fotografía grande y de alta calidad.

Puede contener:

* imagen
* título
* subtítulo
* CTA

El diseño exacto NO está definido todavía.

Utilizar las referencias de `ideas/` para determinar la composición.

El fotógrafo podrá cambiar desde el panel:

* imagen
* título
* subtítulo
* CTA si se decide incluirlo

---

# 13. PROPUESTA DE VALOR

Debajo del Hero habrá una sección breve.

Debe contener una frase sencilla que represente la propuesta de valor del fotógrafo.

No debe ser una sección extensa.

El texto debe poder editarse desde el panel.

Utilizar inicialmente una frase provisional si no existe una definitiva.

---

# 14. SOBRE MÍ EN HOME

Debe existir una sección breve de Sobre mí.

Puede contener:

* fotografía
* pequeño texto
* nombre
* experiencia
* CTA

Ejemplo conceptual:

Jorge Armando Ovalle

Fotógrafo especializado en bodas y eventos.

Más de 7 años de experiencia.

Más de 200 eventos cubiertos.

Botón:

"Conocer más"

Debe llevar a:

/about

---

# 15. PÁGINA SOBRE MÍ

La página completa de Sobre mí debe contener información más detallada.

Utilizar los datos reales:

Jorge Armando Ovalle

Diseño y Producción de Contenidos

Universidad Cuauhtémoc de Aguascalientes

Más de 7 años en fotografía.

Más de 200 eventos cubiertos.

La página puede incluir:

* presentación
* historia
* formación
* experiencia
* especialización
* filosofía
* servicios
* tipo de eventos
* posibilidad de trabajar fuera de Aguascalientes
* posibilidad de trabajar fuera de México

No implementar mapa.

Debe indicarse que los eventos fuera de Aguascalientes o México pueden requerir una cotización diferente.

Toda esta información debe poder editarse posteriormente desde el panel.

---

# 16. SERVICIOS EN HOME

Debajo de Sobre mí debe existir un grid de cards.

Las cards representarán los servicios.

Inicialmente contemplar:

* Bodas
* Bodas en la playa
* XV años
* Graduaciones
* Baby showers
* Shows
* Conciertos
* Party clubs / antros
* Bares
* Restaurantes
* Fotos de estudio
* Sesiones al aire libre
* Save the Date
* Pedidas de mano

No es necesario que todos tengan exactamente el mismo contenido.

El sistema debe permitir agregar nuevos servicios.

Cada card tendrá:

* imagen
* título
* posiblemente descripción
* enlace

La portada de cada servicio podrá editarse desde el panel.

---

# 17. RUTAS DE SERVICIOS

Cada servicio tendrá una ruta individual.

Ejemplos:

/events/weddings

/events/beach-weddings

/events/quinceanos

/events/graduations

/events/baby-showers

/events/concerts

/events/nightclubs

/events/restaurants

/events/studio

/events/save-the-date

/events/proposals

etc.

Los slugs deben ser amigables para SEO.

---

# 18. PÁGINA INDIVIDUAL DE SERVICIO

Cada servicio tendrá una página propia.

Estructura aproximada:

1. Hero
2. Información
3. Video destacado
4. Paquetes
5. Galería
6. CTA
7. FAQ si posteriormente resulta necesario

El diseño exacto debe basarse en las referencias visuales de `ideas/`.

---

# 19. HERO DE CADA SERVICIO

Cada servicio tendrá su propio Hero.

Ejemplo:

Bodas:

imagen de boda

XV años:

imagen de XV años

Conciertos:

imagen de concierto

etc.

El administrador podrá modificar:

* imagen
* título
* subtítulo
* descripción

---

# 20. VIDEOS POR SERVICIO

Cada página individual puede tener un video destacado.

Ejemplo:

Hero

↓

Video de boda

↓

Galería

El video debe ser visualmente relevante y no interrumpir la experiencia fotográfica.

Utilizar URL externa inicialmente.

---

# 21. PAQUETES Y PRECIOS

Actualmente el fotógrafo maneja aproximadamente 5 paquetes distintos.

No tenemos todavía los precios reales.

Crear inicialmente aproximadamente 5 paquetes provisionales.

Los nombres, precios y características serán temporales.

Los paquetes pueden incluir características como:

* fotografías digitales
* fotografías impresas
* fotografías en USB
* USB entregada en una caja de madera personalizada
* tomas con dron
* otros beneficios

No asumir que todos los paquetes incluyen exactamente lo mismo.

La estructura debe permitir que cada paquete tenga características configurables.

Los precios deberán ser completamente editables desde el panel.

---

# 22. GALERÍAS

Cada servicio tendrá su propia galería.

La galería debe:

* utilizar lazy loading
* estar paginada
* utilizar skeletons
* utilizar imágenes optimizadas
* permitir ampliar imágenes
* mostrar contador
* navegar entre imágenes
* cerrar con ESC
* tener botones anterior/siguiente
* ser responsive

Ejemplo:

15 / 48

La implementación debe ser reutilizable entre todos los servicios.

---

# 23. DISPONIBILIDAD

Debe existir una página pública:

/availability

La página mostrará un calendario.

El visitante solamente podrá ver:

Disponible

u

Ocupado

No podrá ver información privada.

No habrá reservación automática.

No habrá pago automático.

La función es únicamente:

"Quiero saber si el fotógrafo está disponible ese día."

---

# 24. AGENDA DEL FOTÓGRAFO

Desde el panel, el fotógrafo tendrá un calendario administrativo.

Podrá crear un evento directamente desde una fecha.

Información inicial:

* cliente
* nombre del evento
* tipo de evento
* paquete
* fecha
* horario
* precio
* pagos
* notas

Al guardar:

La fecha pasa automáticamente a:

OCUPADO

en el calendario público.

---

# 25. PAGOS ADMINISTRATIVOS

El fotógrafo podrá registrar manualmente:

* precio total
* pagos realizados
* cantidad
* fecha del pago
* saldo
* estado

Por ejemplo:

Total:

$20,000

Pagado:

$10,000

Pendiente:

$10,000

El cliente NO podrá ver esta información.

El objetivo es que el fotógrafo pueda reemplazar parcialmente su agenda/cuaderno actual sin hacer que el sistema sea complicado.

---

# 26. RESERVACIÓN DIGITAL

Cada evento podrá tener una página pública única.

Ejemplo:

/reservation/:id

Debe ser visualmente atractiva.

Debe funcionar como un "ticket digital".

Debe mostrar:

* nombre
* tipo de evento
* fecha
* paquete
* horario si se decide mostrarlo
* contador
* información relevante

NO mostrar pagos.

---

# 27. ESTADO DEL TICKET

Antes del evento:

"Faltan X días"

El día:

"Hoy es el gran día"

Después:

"Evento realizado"

Esto debe calcularse automáticamente.

---

# 28. COMPARTIR RESERVACIÓN

El ticket debe poder guardarse visualmente como una captura o imagen bonita.

La intención es que el cliente pueda compartirlo en:

* Instagram Stories
* WhatsApp Status
* redes sociales

Si es técnicamente viable, implementar generación de imagen.

---

# 29. FAQ

Crear inicialmente preguntas basadas en información real proporcionada por el fotógrafo.

## Entrega

Pregunta:

¿Cuánto tardan en estar listas las fotografías?

Respuesta provisional:

Las fotografías suelen estar listas aproximadamente entre un mes y medio y tres meses después del evento, dependiendo del tipo y volumen de trabajo.

El texto deberá poder modificarse desde el panel.

---

## Cantidad de fotografías

Pregunta:

¿Cuántas fotografías recibiré?

Respuesta:

La cantidad de fotografías varía dependiendo del tipo de evento y del paquete contratado.

No establecer una cantidad falsa.

---

## Fuera de Aguascalientes

Pregunta:

¿Trabajas fuera de Aguascalientes?

Respuesta:

Sí. Los eventos fuera de Aguascalientes pueden requerir una cotización diferente dependiendo de la ubicación y las condiciones del evento.

---

## Fuera de México

Pregunta:

¿Trabajas fuera de México?

Respuesta:

Sí. Es posible realizar cobertura fuera de México, pero requiere una cotización personalizada considerando ubicación, traslados y demás gastos relacionados.

---

## Apartar fecha

Pregunta:

¿Cómo puedo apartar mi fecha?

Respuesta:

La fecha se aparta mediante la firma del contrato y el pago del apartado correspondiente.

---

## Contrato

Pregunta:

¿Se firma contrato?

Respuesta:

Sí. El servicio se formaliza mediante un contrato.

---

## Segundo fotógrafo

Pregunta:

¿Trabajas con un segundo fotógrafo?

Respuesta:

Dependiendo del evento, puede participar un segundo fotógrafo o videógrafo.

Cuando existen eventos simultáneos, puede enviarse personal adicional para cubrir uno de ellos. El fotógrafo principal procura supervisar el trabajo y mantener los estándares de calidad.

No presentar esta información como una regla absoluta si puede variar según el evento.

---

## Fotografías editadas

Pregunta:

¿Las fotografías se entregan editadas?

Respuesta:

Sí. Las fotografías entregadas pasan por un proceso de selección y edición.

---

# 30. CONTACTO

No implementar formulario público.

Mostrar:

Jorge Armando Ovalle

Armando Ovalle Wedding Studio

WhatsApp:

+52 449 9995998

Email:

[Ovalle.photo00@gmail.com](mailto:Ovalle.photo00@gmail.com)

Instagram:

armandoovalle.ws

Facebook:

Armando Ovalle Wedding Studio

Estos datos deben ser editables desde el panel.

---

# 31. WHATSAPP

Debe existir un botón flotante de WhatsApp visible en la página pública.

Debe utilizar:

+52 449 9995998

El mensaje automático será genérico.

Ejemplo:

"Hola, me interesa conocer más sobre los servicios de Armando Ovalle Wedding Studio."

No agregar automáticamente fechas ni datos que el usuario no haya proporcionado.

El mensaje debe poder editarse desde el panel.

---

# 32. INSTAGRAM Y FACEBOOK

Los enlaces deben aparecer en:

* Contacto
* Footer

No es necesario integrar los feeds.

Solamente proporcionar enlaces a los perfiles.

---

# 33. CONTRATO

Crear una página:

/contract

El contrato debe poder visualizarse como contenido diseñado dentro de la página.

NO limitarse a mostrar un PDF incrustado.

Debe tener:

* encabezado
* secciones
* títulos
* numeración
* diseño legible

También permitir descarga del documento como PDF si resulta conveniente.

El contenido será provisional inicialmente y posteriormente se sustituirá por el contrato real.

---

# 34. LEGAL

En el footer incluir:

* Términos y condiciones
* Aviso de privacidad

Los documentos pueden descargarse como PDF.

---

# 35. PANEL ADMINISTRATIVO

Crear:

/login

y:

/panel

El panel debe estar protegido.

El público no puede acceder.

Usar Angular Guards.

Las APIs también deben estar protegidas mediante JWT.

---

# 36. PANEL — ESTRUCTURA

Proponer una interfaz:

Aside izquierdo

*

Main central

El aside tendrá categorías similares a:

* Dashboard
* Eventos
* Clientes
* Disponibilidad
* Servicios
* Paquetes
* Galerías
* Reservaciones
* Pagos
* FAQ
* Temas
* Configuración

No es obligatorio mantener exactamente esta lista si la arquitectura final requiere organizarla mejor.

---

# 37. ADMINISTRACIÓN DE CONTENIDO

El fotógrafo debe poder editar la mayor parte del contenido público.

Como mínimo:

## Home

* Hero
* propuesta de valor
* Sobre mí resumido
* contenido editable

## Sobre mí

* nombre
* descripción
* formación
* experiencia
* número de eventos
* especialidades
* información adicional

## Contacto

* teléfono
* WhatsApp
* email
* Instagram
* Facebook

## Servicios

* nombre
* descripción
* imagen de portada
* Hero
* texto
* video
* galerías
* paquetes

## FAQ

* preguntas
* respuestas
* orden
* activación/desactivación

---

# 38. ADMINISTRACIÓN DE IMÁGENES

El fotógrafo podrá:

* cambiar Hero principal
* cambiar Hero de cada servicio
* cambiar imagen de portada de cada servicio
* agregar fotografías
* eliminar fotografías
* ordenar fotografías
* seleccionar portada

No permitir cantidades ilimitadas.

---

# 39. ADMINISTRACIÓN DE VIDEOS

El fotógrafo podrá modificar la URL del video de cada servicio.

Preferir URLs externas en lugar de subir videos directamente.

---

# 40. ADMINISTRACIÓN DE PAQUETES

El fotógrafo podrá:

* crear paquetes
* editar paquetes
* modificar precios
* cambiar características
* activar/desactivar paquetes

Inicialmente contemplar aproximadamente 5 paquetes.

---

# 41. CRM

El panel debe tener una sección de clientes.

Debe permitir:

* crear
* consultar
* editar
* eliminar

Cada cliente podrá tener eventos relacionados.

Información inicial:

* nombre
* teléfono
* email
* notas
* eventos

---

# 42. TEMAS ESTACIONALES

Crear un sistema de temas reutilizable.

Ejemplos:

* Navidad
* Día de la Independencia
* Primavera
* Verano
* Otoño
* Invierno
* Feria de San Marcos

Los temas pueden modificar:

* imagen del Hero
* pequeños elementos del navbar
* detalles visuales
* decoraciones
* efectos sutiles

Ejemplos:

Navidad:

* copos de nieve

Otoño:

* hojas

Septiembre:

* pequeños elementos decorativos relacionados con la festividad

No sobrecargar la página.

Las fotografías deben seguir siendo protagonistas.

---

# 43. TEMAS AUTOMÁTICOS

El fotógrafo podrá:

* activar manualmente un tema
* configurar inicio y final
* activar modo automático

Ejemplo:

Tema Navidad

Inicio: 1 de diciembre

Fin: 31 de diciembre

Durante ese periodo puede activarse automáticamente.

El fotógrafo debe poder desactivar el comportamiento automático.

---

# 44. COMPONENTES REUTILIZABLES

La estructura Angular debe incluir:

src/app/components/

Por ejemplo:

components/
navbar/
footer/
skeletons/
buttons/
cards/
gallery/
modal/
calendar/
etc.

No crear componentes gigantes.

Las piezas reutilizables deben mantenerse independientes.

---

# 45. SKELETONS

Crear:

components/skeletons/

Con componentes reutilizables.

Ejemplos:

* skeleton-card
* skeleton-gallery
* skeleton-image
* skeleton-text
* skeleton-table
* skeleton-calendar
* skeleton-dashboard

La aplicación debe utilizar estos skeletons durante las cargas.

---

# 46. CORE

Crear:

src/app/core/

con:

guards/
interceptors/
services/
types/

Aquí estarán:

* autenticación
* servicios HTTP
* tipos/interfaces
* guards
* interceptors
* lógica compartida

---

# 47. PAGES

Crear:

src/app/pages/

con páginas independientes.

Por ejemplo:

pages/
home/
login/
about/
events/
availability/
contract/
faq/
contact/
panel/

Los servicios individuales pueden manejarse mediante rutas dinámicas.

Por ejemplo:

/events/:slug

---

# 48. PANEL

El panel puede tener su propio layout.

Ejemplo:

pages/panel/

```
layout/
dashboard/
events/
clients/
services/
packages/
galleries/
payments/
reservations/
faq/
themes/
settings/
```

No es obligatorio utilizar exactamente esta estructura si existe una organización mejor.

---

# 49. BACKEND

La estructura inicial debe ser:

backend/
└── src/
├── server.js
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
└── utils/

---

# 50. CONFIG

Dentro de config:

* database
* initialize-data
* configuración de servicios externos
* otras configuraciones necesarias

initialize-data deberá encargarse de crear la cuenta administrativa inicial si todavía no existe.

---

# 51. AUTENTICACIÓN

Usar:

bcrypt

para passwords.

Usar:

JWT

para sesiones/autenticación.

No guardar passwords en texto plano.

No permitir registro público.

Solamente debe existir la cuenta administrativa.

Las credenciales iniciales deben utilizar variables de entorno.

---

# 52. ROUTES

Crear API REST organizada.

Ejemplo:

/api/auth

/api/events

/api/clients

/api/services

/api/packages

/api/galleries

/api/payments

/api/reservations

/api/availability

/api/settings

/api/faqs

/api/themes

---

# 53. ERRORES

Implementar middleware global de errores.

Los mensajes deben ser claros.

Ejemplo:

No:

"SequelizeValidationError: ..."

Sí:

"No se pudo guardar el evento. Verifica que la fecha y el cliente sean válidos."

No exponer información interna en producción.

---

# 54. VARIABLES DE ENTORNO

Utilizar .env.

Ejemplo:

DATABASE_URL

JWT_SECRET

ADMIN_EMAIL

ADMIN_PASSWORD

CLOUDINARY_CLOUD_NAME

CLOUDINARY_API_KEY

CLOUDINARY_API_SECRET

etc.

Crear:

.env.example

No subir .env al repositorio.

---

# 55. PERFORMANCE

La aplicación debe utilizar:

* lazy loading de imágenes
* paginación
* skeletons
* CDN
* imágenes optimizadas
* thumbnails
* lazy loading de rutas
* carga bajo demanda

La experiencia debe seguir siendo rápida aunque existan muchas fotografías.

---

# 56. RESPONSIVE

Debe funcionar correctamente en:

* móvil
* tablet
* iPad
* laptop
* desktop
* monitores grandes
* televisores/pantallas grandes

Las galerías y Hero deben adaptarse correctamente a diferentes relaciones de aspecto.

---

# 57. MICROINTERACCIONES

Sí utilizar microinteracciones.

Ejemplos:

* hover en cards
* transiciones
* aparición de elementos
* navegación de galerías
* pequeñas animaciones
* interacción del navbar
* estados del calendario

Pero no abusar.

La fotografía debe ser el elemento protagonista.

---

# 58. SEO

Implementar:

* títulos
* meta descriptions
* Open Graph
* URLs amigables
* alt text
* headings semánticos

Especialmente para las páginas de servicios.

---

# 59. NO IMPLEMENTAR

No implementar:

* pagos online
* checkout
* registro público
* login de clientes
* galería privada
* almacenamiento masivo de fotografías finales
* cotizador
* testimonios
* reseñas
* blog
* newsletter
* cupones
* landing pages
* mapa
* modo oscuro
* encuentra tu estilo
* firma electrónica
* facturación
* automatizaciones externas

---

# 60. INFORMACIÓN QUE DEBE SER EDITABLE

Siempre que sea posible, evitar hardcodear información comercial.

Debe poder editarse desde el panel:

* nombre
* descripción
* experiencia
* cantidad de eventos
* contacto
* redes
* propuesta de valor
* Hero
* servicios
* portadas
* galerías
* videos
* paquetes
* precios
* FAQ
* contrato
* mensaje de WhatsApp
* temas
* etc.

La información proporcionada en este documento es el contenido inicial.

La aplicación debe estar preparada para que el fotógrafo pueda cambiarla sin tocar código.

---

# 61. PRIORIDAD DE IMPLEMENTACIÓN

Trabajar por fases.

## Fase 1

Antes de implementar todo:

1. Inspeccionar el proyecto existente.
2. Inspeccionar `ideas/`.
3. Identificar referencias visuales.
4. Analizar estructura actual.
5. Analizar dependencias existentes.
6. Proponer arquitectura.
7. Proponer modelo de PostgreSQL.
8. Proponer estructura definitiva.
9. Proponer solución de almacenamiento.
10. Proponer rutas.
11. Proponer endpoints.

NO realizar cambios estructurales grandes hasta explicar la propuesta.

---

## Fase 2

Construir:

* Angular base
* backend
* PostgreSQL
* autenticación
* configuración
* modelos
* API base

---

## Fase 3

Construir sitio público:

* navbar
* Home
* Hero
* Sobre mí
* servicios
* páginas individuales
* paquetes
* galerías
* FAQ
* disponibilidad
* contrato
* contacto
* footer

---

## Fase 4

Construir panel:

* login
* dashboard
* clientes
* eventos
* agenda
* pagos
* servicios
* paquetes
* galerías
* configuración
* FAQ
* temas

---

## Fase 5

Construir:

* reservación/ticket
* contador
* estados de reservación
* temas estacionales
* activación automática
* generación de captura/imagen de reservación

---

## Fase 6

Optimizar:

* responsive
* performance
* SEO
* accesibilidad
* seguridad
* manejo de errores
* optimización de imágenes
* UX

---

# 62. PRINCIPIO DE DISEÑO

La página debe sentirse como el sitio web de un fotógrafo profesional, no como una plantilla genérica.

Las fotografías deben ser protagonistas.

El diseño debe sentirse:

* elegante
* moderno
* visual
* profesional
* limpio
* sofisticado
* dinámico

Pero la estética concreta debe derivarse de las referencias existentes en:

ideas/

No inventar una identidad visual completamente desconectada de esas referencias.

---

# 63. PRINCIPIO DEL PANEL ADMINISTRATIVO

La administración debe ser considerablemente más sencilla que la parte pública.

El fotógrafo no debe necesitar conocimientos técnicos.

Debe poder hacer tareas como:

"Hoy contraté una boda para el 24 de octubre."

Y resolverlo en pocos pasos:

1. Crear/seleccionar cliente.
2. Seleccionar fecha.
3. Seleccionar tipo de evento.
4. Seleccionar paquete.
5. Registrar precio.
6. Registrar pago/apartado.
7. Guardar.

Al guardar:

* el calendario público se actualiza
* se crea la reservación
* el fotógrafo puede compartir el enlace con el cliente

---

# 64. RESULTADO FINAL ESPERADO

El resultado debe ser un sistema que permita:

PUBLICAMENTE:

Ver el trabajo del fotógrafo.

Conocer quién es.

Conocer sus servicios.

Ver galerías.

Ver paquetes.

Consultar disponibilidad.

Consultar contrato.

Consultar FAQ.

Contactarlo por WhatsApp.

Ver sus redes sociales.

Consultar/compartir su reservación si ya fue contratado.

ADMINISTRATIVAMENTE:

Administrar clientes.

Administrar eventos.

Administrar agenda.

Administrar disponibilidad.

Administrar pagos.

Administrar servicios.

Administrar paquetes.

Administrar galerías.

Administrar contenido.

Administrar FAQ.

Administrar temas estacionales.

Administrar reservaciones.

Y todo esto debe poder crecer posteriormente sin tener que reconstruir la arquitectura.

---

# 65. INSTRUCCIÓN FINAL PARA CLAUDE CODE

Antes de escribir código:

1. Inspecciona el proyecto actual.
2. Inspecciona completamente la carpeta `ideas/`.
3. Identifica qué imágenes de referencia existen.
4. Analiza visualmente sus patrones.
5. Revisa el estado actual de `frontend/` y `backend/`.
6. Identifica qué ya existe y qué debe conservarse.
7. No sobrescribas trabajo existente sin explicar qué cambiarás.
8. Propón la arquitectura.
9. Propón el esquema de PostgreSQL.
10. Propón la estrategia de Cloudinary/almacenamiento.
11. Propón las rutas Angular.
12. Propón los endpoints REST.
13. Propón las relaciones entre entidades.
14. Explica cómo funcionará el calendario público y administrativo.
15. Explica cómo funcionará la reservación/ticket.
16. Explica cómo funcionará el sistema de temas estacionales.
17. Explica cómo se administrarán las imágenes.
18. Explica qué información será provisional y editable.

Después de presentar esta propuesta, espera confirmación antes de comenzar una implementación grande.

No construyas funcionalidades que no estén contempladas sin explicarlas primero.

Prioriza una arquitectura limpia, mantenible, escalable y sencilla de administrar.

La experiencia visual de la parte pública y la facilidad de uso del panel administrativo son igualmente importantes.
