/**
 * Documentos legales del estudio (versión definitiva).
 *
 * - Contrato: sigue la estructura del contrato que el fotógrafo firma con sus clientes
 *   (carátula, declaraciones y cláusulas). Los datos del cliente y del evento van en blanco.
 * - Términos y condiciones y aviso de privacidad: redactados para este sitio.
 *
 * `part` agrupa secciones bajo un mismo apartado; la numeración reinicia en cada apartado.
 * Todo se puede editar después en /panel/legal.
 */

const STUDIO = 'Armando Ovalle Wedding Studio';
const OWNER = 'Jorge Armando Ovalle Cruz';
const ADDRESS = 'Av. Eugenio Garza Sada No. 136, Fraccionamiento Los Pocitos, Aguascalientes, Ags.';
const PHONE = '+52 449 999 5998';
const EMAIL = 'Ovalle.photo00@gmail.com';

const BLANK = '____________________';
const COVER = 'Carátula';
const DECLARATIONS = 'Declaraciones';
const CLAUSES = 'Cláusulas';

const contractSections = [
  // ---------- Carátula (el "anverso" al que remiten las cláusulas) ----------
  { part: COVER, title: 'Lugar y fecha', body: 'Aguascalientes, Ags., a ____ de ______________ de ________.' },
  {
    part: COVER,
    title: 'Partes',
    body: `El presente contrato de prestación de servicios profesionales lo celebran, por una parte, la empresa denominada "${STUDIO.toUpperCase()}", representada en este acto por el C. ${OWNER}, en su carácter de prestador del servicio, con domicilio ubicado en ${ADDRESS}, con número telefónico ${PHONE} y correo electrónico ${EMAIL}; y, por la otra parte, el (la) C. ${BLANK}${BLANK}, a quien en lo sucesivo se le denominará "EL CLIENTE", quien señala como domicilio particular el ubicado en ${BLANK}${BLANK}, en la ciudad de ${BLANK}, con número telefónico ${BLANK} y correo electrónico ${BLANK}; conviniendo ambos en sujetarse al presente contrato al tenor del servicio contratado que enseguida se describe.`,
  },
  {
    part: COVER,
    title: 'Datos generales del evento',
    body: [
      `Nombre de los novios o festejados: ${BLANK}`,
      `Tipo de evento: ${BLANK}`,
      `Fecha del evento: ${BLANK}`,
      `Lugar de la ceremonia: ${BLANK}`,
      `Hora de la ceremonia: ${BLANK}`,
      `Nombre del salón o lugar de la recepción: ${BLANK}`,
      `Hora del evento: ${BLANK}`,
      `Tiempo de cobertura contratado: ${BLANK}`,
      `Teléfono celular de contacto: ${BLANK}`,
    ].join('\n'),
  },
  {
    part: COVER,
    title: 'Servicios contratados',
    body: [
      'Se describen aquí, de acuerdo con el paquete elegido por "EL CLIENTE", los servicios que incluye la contratación y la cantidad de cada uno:',
      '',
      '— Sesiones previas (por ejemplo, sesión Save the Date o sesión de fotos formales): número de fotografías y de locaciones.',
      '— Cobertura del evento: ceremonia, recepción y demás momentos acordados.',
      '— Entrega de fotografías: número de fotografías editadas y retocadas en alta definición, fotografías impresas, ampliaciones montadas y medio de entrega (estuche con USB y enlace de descarga por correo electrónico).',
      '— Cobertura en video, en su caso: filmación con equipo profesional, tomas aéreas con dron, momentos cubiertos y duración del tráiler resumen.',
      '— Invitación digital, en su caso.',
    ].join('\n'),
  },
  {
    part: COVER,
    title: 'Costo total del servicio',
    body: [
      `Costo total: $ ${BLANK} MXN (${BLANK} pesos 00/100 M.N.)`,
      `Anticipo (50%): $ ${BLANK} MXN`,
      `Saldo a cubrir el día del evento (50%): $ ${BLANK} MXN`,
      `Honorario por hora adicional de cobertura: $ ${BLANK} MXN`,
      `Cuenta bancaria para pagos por transferencia: ${BLANK}`,
    ].join('\n'),
  },
  {
    part: COVER,
    title: 'Autorización de uso de imágenes',
    body: '"EL CLIENTE" SÍ ( )  NO ( ) autoriza a "EL FOTÓGRAFO" para exhibir las imágenes del evento como muestra de su trabajo, en los términos de la cláusula octava.',
  },

  // ---------- Declaraciones ----------
  {
    part: DECLARATIONS,
    title: 'Declara "EL FOTÓGRAFO"',
    body: [
      'a) Que es una persona física, mayor de edad, con plena capacidad de goce y ejercicio, y que está capacitada para la prestación de los servicios objeto del presente Contrato.',
      'b) Que como persona física realiza las actividades encomendadas por sus clientes y, por tanto, el presente Contrato no es su única fuente de ingresos.',
      'c) Que cuenta con todos los conocimientos, experiencia, organización y elementos humanos, técnicos y materiales necesarios y suficientes para prestar "LOS SERVICIOS" descritos a "EL CLIENTE".',
    ].join('\n\n'),
  },
  {
    part: DECLARATIONS,
    title: 'Declara "EL CLIENTE"',
    body: [
      'a) Que es su intención contratar los servicios de "EL FOTÓGRAFO" que más adelante se describen, durante toda la vigencia del presente Contrato.',
      'b) Que desea celebrar el presente Contrato en los términos y condiciones que se pactan en su clausulado.',
    ].join('\n\n'),
  },
  {
    part: DECLARATIONS,
    title: 'Declaran "LAS PARTES"',
    body: [
      'a) Que es su voluntad celebrar el presente contrato de prestación de servicios, de conformidad con lo dispuesto por los artículos 1675, 1676, 1679, 1684, 1707, 1715, 1718, 1730 y siguientes del Código Civil de Aguascalientes, así como los demás que resulten aplicables.',
      'b) Que el objeto del presente Contrato es la prestación de los servicios que se identifican en el anverso de este Contrato.',
      'c) Que el servicio que proporcione "EL FOTÓGRAFO" a "EL CLIENTE" se especificará y describirá en el anverso del presente Contrato, así como en la factura correspondiente que le sea entregada para cada servicio, las cuales formarán parte integral del presente Contrato, y cada servicio solicitado se identificará como Anexo; por lo que "LAS PARTES" convienen las siguientes cláusulas.',
    ].join('\n\n'),
  },

  // ---------- Cláusulas ----------
  {
    part: CLAUSES,
    title: 'Objeto',
    body: '"EL FOTÓGRAFO" se obliga a prestar a favor de "EL CLIENTE" los servicios (en adelante, "LOS SERVICIOS") que se identifican en el anverso del presente Contrato, los cuales se describen de manera enunciativa, mas no limitativa.',
  },
  {
    part: CLAUSES,
    title: 'De los formatos',
    body: 'Para la prestación de "LOS SERVICIOS" señalados en la cláusula anterior, las imágenes serán proporcionadas en los formatos que se identifican en el anverso del presente Contrato. Asimismo, "EL FOTÓGRAFO" entregará a "EL CLIENTE" las imágenes con su firma digital, así como sin esta, por lo que "EL CLIENTE" se obliga a respetar lo señalado en la cláusula novena que más adelante se detalla.',
  },
  {
    part: CLAUSES,
    title: 'Obligaciones de "EL CLIENTE"',
    body: '"EL CLIENTE" se obliga a solicitar a "EL FOTÓGRAFO" "LOS SERVICIOS" de forma concreta y precisa, para que se identifiquen perfectamente.',
  },
  {
    part: CLAUSES,
    title: 'Obligaciones de "EL FOTÓGRAFO"',
    body: '"EL FOTÓGRAFO" se obliga a entregar a "EL CLIENTE" el servicio solicitado, que será descrito en el anverso del presente Contrato. "EL FOTÓGRAFO" se obliga a señalar en el anverso del presente Contrato "LOS SERVICIOS" solicitados por "EL CLIENTE", así como la cantidad de los mismos, el precio unitario, el subtotal por cada servicio y el total de "LOS SERVICIOS" prestados. "EL FOTÓGRAFO" se obliga a proporcionar todos los materiales que contengan "LOS SERVICIOS" prestados para que "EL CLIENTE" pueda utilizarlos según los fines que considere convenientes, de acuerdo con su naturaleza.',
  },
  {
    part: CLAUSES,
    title: 'De las bebidas y los alimentos',
    body: '"EL CLIENTE" deberá otorgar al menos un asiento para "EL FOTÓGRAFO" y su equipo de trabajo, así como un platillo de comida y/o cena el día del evento.',
  },
  {
    part: CLAUSES,
    title: 'De los honorarios',
    body: [
      'Por la prestación de "LOS SERVICIOS", "EL CLIENTE" pagará a "EL FOTÓGRAFO" la cantidad señalada en el anverso del presente Contrato. Los honorarios señalados corresponden a "LOS SERVICIOS" especificados en el anverso del presente Contrato, durante el tiempo solicitado el día del evento, por lo que, en caso de que este se incremente, se generará un honorario adicional, el cual se especificará en el anverso del presente Contrato por cada hora correspondiente.',
      'En caso de que "EL CLIENTE" solicite un comprobante fiscal por "LOS SERVICIOS" que se presten, a la cantidad anteriormente señalada se le añadirá el impuesto al valor agregado correspondiente. El comprobante fiscal contará con los requisitos legales vigentes y se emitirá una vez que hayan sido liquidados en su totalidad los honorarios señalados, así como el impuesto que corresponda, de conformidad con las disposiciones fiscales aplicables.',
    ].join('\n\n'),
  },
  {
    part: CLAUSES,
    title: 'Del pago de los honorarios',
    body: [
      '"LAS PARTES" acuerdan que el pago de los honorarios se realizará de la siguiente manera:',
      '— 50% de anticipo. Dicho honorario se pagará una vez que se determinen los servicios que serán prestados, las fechas y el lugar del evento. Asimismo, deberá firmarse el presente Contrato.',
      '— 50% restante. Dicho honorario deberá cubrirse el día del evento.',
      'El pago deberá realizarse en efectivo y/o mediante transferencia electrónica a la cuenta bancaria de "EL FOTÓGRAFO", la cual se especificará en el anverso del presente Contrato. En caso de incumplimiento de pago por parte de "EL CLIENTE" a "EL FOTÓGRAFO" en los términos descritos anteriormente, se generará un interés moratorio mensual del 9% sobre las cantidades insolutas y no pagadas a "EL FOTÓGRAFO" hasta la fecha de su liquidación total.',
    ].join('\n\n'),
  },
  {
    part: CLAUSES,
    title: 'De la propiedad',
    body: 'De conformidad con lo dispuesto por el artículo 38 de la Ley Federal del Derecho de Autor, la propiedad de las imágenes fotográficas corresponde a "EL CLIENTE". Sin embargo, "LAS PARTES" reconocen que los derechos patrimoniales sobre las mismas, así como las matrices o negativos, corresponden a "EL FOTÓGRAFO". Asimismo, "EL CLIENTE" autoriza a "EL FOTÓGRAFO" para exhibir las imágenes que haya efectuado como muestra de su trabajo y profesionalismo, otorgando el crédito correspondiente. Dicha autorización se manifiesta en el anverso del presente Contrato.',
  },
  {
    part: CLAUSES,
    title: 'Del uso de las imágenes',
    body: [
      '"EL FOTÓGRAFO" entregará a "EL CLIENTE" dos juegos de las imágenes correspondientes: un juego con su firma digital y un juego exclusivamente con las imágenes. Por lo anterior, de conformidad con lo dispuesto por el artículo 85 de la Ley Federal del Derecho de Autor, "EL FOTÓGRAFO" concede a "EL CLIENTE" el derecho de exhibir las imágenes y plasmarlas en cualquier medio, siempre que no exista ánimo de lucro por parte de "EL CLIENTE".',
      'En caso de que "EL CLIENTE" exhiba una o varias de las imágenes con ánimo de lucro, independientemente del medio que sea, con o sin la firma digital de "EL FOTÓGRAFO", "EL CLIENTE" deberá pagar a "EL FOTÓGRAFO" las regalías correspondientes, las cuales ascenderán al 50% del monto total que "EL CLIENTE" hubiese obtenido por la exhibición de las imágenes. Independientemente de lo anterior, "EL FOTÓGRAFO" se reserva el derecho de oponerse cuando la exhibición o su plasmación se realice en condiciones que perjudiquen su honor o su reputación profesional.',
      'Asimismo, con base en lo dispuesto por el artículo 32 de la Ley Federal del Derecho de Autor, el uso público de las imágenes por "EL CLIENTE" durará por el plazo de 5 (cinco) años contados a partir de la fecha de firma del presente Contrato. Concluido dicho plazo, "EL CLIENTE" se abstendrá de hacer uso público de los materiales entregados.',
    ].join('\n\n'),
  },
  {
    part: CLAUSES,
    title: 'De la reproducción',
    body: '"EL FOTÓGRAFO" concede a "EL CLIENTE" el derecho exclusivo de reproducir los materiales únicamente para su uso personal.',
  },
  {
    part: CLAUSES,
    title: 'De la conservación y modificaciones',
    body: [
      '"EL CLIENTE" se compromete a no alterar, manipular o modificar el contenido de los materiales entregados, respetando su integridad y valor original. No obstante, contará con un plazo de 7 (siete) días hábiles posteriores a la entrega de los materiales para solicitar modificaciones específicas, ya sean relativas a la edición, el estilo, correcciones o ajustes técnicos necesarios.',
      'Dichas modificaciones estarán sujetas a un costo adicional, el cual será variable y se determinará con base en la urgencia de la solicitud y la magnitud de los cambios requeridos. Cualquier ajuste fuera del plazo establecido se considerará como una nueva solicitud de servicio.',
      'En cuanto a la conservación, "EL FOTÓGRAFO" resguardará las imágenes durante 6 (seis) meses y el material de video durante 1 (una) semana como máximo, tras lo cual podrá proceder a su eliminación sin responsabilidad alguna.',
    ].join('\n\n'),
  },
  {
    part: CLAUSES,
    title: 'De la vigencia',
    body: 'El presente Contrato entrará en vigor el día de su firma y concluirá su ejecución en la fecha en la que "EL CLIENTE" acepte de conformidad el material fotográfico. En este acto, "LAS PARTES" acuerdan expresamente que "EL FOTÓGRAFO" tendrá la obligación de prestar "LOS SERVICIOS" señalados por el tiempo que se indique en el anverso del presente Contrato. Cualquier tiempo adicional generará el incremento en los honorarios pactados en la cláusula sexta del presente Contrato. "EL FOTÓGRAFO" se compromete a entregar las imágenes correspondientes dentro de los 60 (sesenta) días hábiles posteriores a la fecha en que se haya realizado el evento.',
  },
  {
    part: CLAUSES,
    title: 'De la transmisión a terceros',
    body: '"EL CLIENTE" acepta y reconoce que no podrá transmitir a terceros la propiedad de las imágenes objeto de este Contrato, salvo que medie autorización expresa de "EL FOTÓGRAFO". Asimismo, "EL FOTÓGRAFO" acepta y reconoce que no podrá transmitir a terceros la propiedad de las imágenes objeto de este Contrato, salvo que medie autorización expresa de "EL CLIENTE". En caso de falta de pago por parte de "EL CLIENTE" a "EL FOTÓGRAFO", este conserva el derecho de hacer uso de las imágenes a título de compensación por la falta de pago.',
  },
  {
    part: CLAUSES,
    title: 'Relación entre las partes y responsabilidad laboral',
    body: '"EL FOTÓGRAFO" manifiesta que es un prestador de servicios independiente y que proporcionará los servicios descritos en la cláusula primera del presente Contrato, entre otros, a cualquier persona física o moral como "EL CLIENTE", así como a muchos otros, por lo que en ningún momento durante la vigencia del presente Contrato podrá considerarse que existe una relación de trabajo en términos de la Ley Federal del Trabajo. De igual forma, "EL CLIENTE" manifiesta que en ningún momento durante la vigencia del presente Contrato las solicitudes que realice a "EL FOTÓGRAFO" se considerarán como una relación patronal en términos de la Ley Federal del Trabajo. Por lo anterior, "LAS PARTES" se obligan a mantenerse mutuamente libres y a salvo de cualquier reclamación judicial o procedimiento administrativo de carácter laboral o fiscal que se les instaure.',
  },
  {
    part: CLAUSES,
    title: 'Caso fortuito o fuerza mayor',
    body: '"EL FOTÓGRAFO" no será responsable por cualquier evento de caso fortuito o de fuerza mayor que le impida parcial o totalmente la ejecución de las obligaciones contraídas en virtud del presente Contrato, en el entendido de que el caso fortuito o la fuerza mayor, según corresponda, estén debidamente acreditados.',
  },
  {
    part: CLAUSES,
    title: 'Modificación',
    body: '"LAS PARTES" convienen que cualquier modificación al presente Contrato deberá formalizarse mediante acuerdo previo, expreso y por escrito, firmado por las partes del mismo. Las modificaciones que se realicen al presente Contrato se deberán anexar a este para formar parte integrante del mismo.',
  },
  {
    part: CLAUSES,
    title: 'Causas de rescisión',
    body: 'La violación por "EL FOTÓGRAFO" de cualquier cláusula consignada en este Contrato dará derecho a "EL CLIENTE" a reclamar su cumplimiento o a rescindirlo, bastando para ello que "EL CLIENTE" informe mediante aviso por escrito a "EL FOTÓGRAFO" con 5 (cinco) días de anticipación. En caso de rescisión del presente Contrato, "EL CLIENTE" tendrá derecho a retener a "EL FOTÓGRAFO" los pagos que se encuentren pendientes, por concepto de daños y perjuicios.',
  },
  {
    part: CLAUSES,
    title: 'Confidencialidad',
    body: '"EL FOTÓGRAFO" reconoce que todo tipo de información, consulta o documentación proporcionada por "EL CLIENTE", o creada por "EL FOTÓGRAFO" con base en la información o documentación proporcionada por "EL CLIENTE" para el cumplimiento de este Contrato, será considerada como confidencial, por lo que "EL FOTÓGRAFO" la recibe y/o crea en esos términos y únicamente podrá utilizarla para efectos de este Contrato. Ningún tipo de información o documentación proporcionada a "EL FOTÓGRAFO" podrá ser revelada total o parcialmente por este. Ambas partes reconocen y acuerdan que revelar o utilizar sin autorización previa información o documentación proporcionada por "EL CLIENTE" puede ocasionar daños irreparables o perjuicios; por lo tanto, "EL FOTÓGRAFO" acepta y se obliga a no divulgar, bajo ninguna forma ni circunstancia, ninguna información o documentación proporcionada para la prestación de "LOS SERVICIOS" señalados en la cláusula primera del presente Contrato; de lo contrario, indemnizará a "EL CLIENTE" por los daños y perjuicios ocasionados.',
  },
  {
    part: CLAUSES,
    title: 'Terminación anticipada',
    body: [
      'En caso de que alguna de las partes solicite la terminación anticipada del presente Contrato, estarán obligadas a lo siguiente.',
      'Si "EL CLIENTE" diere por terminado el presente Contrato:',
      '— En cualquier momento, "EL CLIENTE" perderá el derecho a la devolución del anticipo correspondiente.',
      '— Dentro de los 10 (diez) días anteriores a la fecha del evento, "EL CLIENTE" deberá pagar a "EL FOTÓGRAFO" el 25% restante correspondiente a la diferencia de la cantidad pactada.',
      'Si "EL FOTÓGRAFO" diere por terminado el presente Contrato:',
      '— En cualquier momento, "EL FOTÓGRAFO" deberá devolver a "EL CLIENTE" el 50% del anticipo efectivamente pagado.',
      'En caso de incumplimiento de pago por parte de "EL CLIENTE" a "EL FOTÓGRAFO" en los términos descritos anteriormente, se generará un interés moratorio mensual del 9% sobre las cantidades insolutas y no pagadas a "EL FOTÓGRAFO" hasta la fecha de su liquidación total.',
    ].join('\n\n'),
  },
  {
    part: CLAUSES,
    title: 'Notificaciones',
    body: '"LAS PARTES" convienen en que cualquier notificación relacionada con el presente Contrato se hará por escrito o por correo electrónico con confirmación de recibo, en el entendido de que, si una de las partes cambiara su domicilio o sus direcciones, deberá notificarlo inmediatamente a la otra, ya que de no hacerlo las notificaciones se tendrán por realizadas en el domicilio o las direcciones anteriores, surtiendo plenos efectos. "EL FOTÓGRAFO" indica como domicilio el señalado en el anverso del presente Contrato. "EL CLIENTE" indica como domicilio el señalado en el anverso del presente Contrato.',
  },
  {
    part: CLAUSES,
    title: 'Tribunales competentes y leyes aplicables',
    body: 'En caso de disputas o de cualquier tipo de controversia relativa a la interpretación o al cumplimiento de este Contrato, "LAS PARTES" convienen en sujetarse a lo dispuesto por las leyes mexicanas y en someterse a la jurisdicción de los tribunales de la ciudad de Aguascalientes, renunciando expresamente a cualquier otra jurisdicción que pudiera corresponderles con motivo de sus domicilios presentes o futuros o por cualquier otra causa.',
  },
  {
    part: CLAUSES,
    title: 'Medios de consulta, reclamaciones y quejas',
    body: [
      'Con el objeto de atender las consultas, reclamaciones y quejas de "EL CLIENTE", "EL FOTÓGRAFO" establece los siguientes medios para la atención de cualquier planteamiento que se le desee formular:',
      'a) El correo electrónico señalado en el anverso del presente Contrato.',
      'b) El domicilio señalado en el anverso del presente Contrato.',
      'c) El teléfono señalado en el anverso del presente Contrato.',
      'd) Cualquier otro medio, presente o futuro, que "EL FOTÓGRAFO" ponga a disposición de "EL CLIENTE".',
    ].join('\n\n'),
  },
  {
    part: CLAUSES,
    title: 'Acuerdo total',
    body: 'Este Contrato constituye el acuerdo completo entre "LAS PARTES" en relación con su objeto y no podrá ser modificado sino mediante acuerdo por escrito firmado por cada una de las partes. Enteradas las partes de su contenido y alcance legal, firman el presente Contrato en la ciudad de Aguascalientes, en la fecha señalada en el anverso del presente Contrato.',
  },
];

const termsSections = [
  {
    title: 'Quiénes somos',
    body: `Este sitio web es operado por ${OWNER}, bajo el nombre comercial ${STUDIO} (en adelante, "el Estudio"), con domicilio en ${ADDRESS}. Puedes contactarnos por teléfono o WhatsApp al ${PHONE} y por correo electrónico en ${EMAIL}.`,
  },
  {
    title: 'Aceptación de estos términos',
    body: 'Al navegar por este sitio aceptas estos Términos y Condiciones y nuestro Aviso de Privacidad. Si no estás de acuerdo con ellos, te pedimos no utilizar el sitio. El sitio está dirigido a personas mayores de edad; las personas menores de edad deben usarlo con la supervisión de su madre, padre o tutor.',
  },
  {
    title: 'Para qué sirve el sitio',
    body: 'El sitio tiene fines informativos: presenta los servicios de fotografía y video del Estudio, muestras de su trabajo, los paquetes disponibles, un calendario de disponibilidad y los medios de contacto. A través del sitio no se realizan compras ni pagos en línea.',
  },
  {
    title: 'Servicios, paquetes y cotizaciones',
    body: [
      'La descripción de los servicios y de los paquetes es de carácter informativo y puede cambiar sin previo aviso. Los precios que en su caso se muestren están expresados en pesos mexicanos y no constituyen una oferta vinculante: el precio definitivo es el que el Estudio confirma en la cotización de cada evento, de acuerdo con la fecha, el lugar y los servicios solicitados.',
      'Los eventos fuera de la ciudad de Aguascalientes pueden requerir una cotización distinta que considere traslados, hospedaje y demás gastos relacionados.',
    ].join('\n\n'),
  },
  {
    title: 'Disponibilidad y reservación de fechas',
    body: [
      'El calendario de disponibilidad es una referencia y puede no reflejar cambios de último momento. Consultar una fecha o solicitar una cotización no la aparta.',
      'Una fecha se considera reservada únicamente cuando el cliente y el Estudio han firmado el contrato de prestación de servicios y se ha cubierto el anticipo correspondiente. Las condiciones de pago, entrega, cambios y cancelaciones de cada evento son las establecidas en ese contrato, que prevalece sobre cualquier información publicada en el sitio.',
    ].join('\n\n'),
  },
  {
    title: 'Ticket digital y correo de confirmación',
    body: [
      'Al confirmar un evento, el Estudio puede enviar al cliente un correo electrónico con el resumen de lo contratado y un enlace a su "ticket digital", una página con el nombre del evento, la fecha y, si el cliente lo desea, el horario y el lugar.',
      'El enlace del ticket es privado y difícil de adivinar, pero cualquier persona que lo tenga puede abrirlo; el cliente decide con quién compartirlo. El ticket no muestra precios, pagos ni datos de contacto. El ticket y el correo son informativos y no sustituyen al contrato firmado.',
    ].join('\n\n'),
  },
  {
    title: 'Propiedad intelectual',
    body: 'Las fotografías, los videos, los textos, el logotipo, el nombre comercial y el diseño de este sitio están protegidos por la Ley Federal del Derecho de Autor y por la Ley Federal de Protección a la Propiedad Industrial. Queda prohibido copiarlos, descargarlos, reproducirlos, modificarlos, publicarlos o utilizarlos con cualquier fin, comercial o no, sin la autorización previa y por escrito del Estudio. Las imágenes de eventos se publican con la autorización de los clientes que aparecen en ellas.',
  },
  {
    title: 'Uso adecuado del sitio',
    body: 'Te comprometes a usar el sitio de forma lícita y a no intentar acceder a las áreas restringidas de administración, interferir con su funcionamiento, introducir programas dañinos ni extraer su contenido de forma masiva o automatizada.',
  },
  {
    title: 'Enlaces y servicios de terceros',
    body: 'El sitio incluye enlaces a servicios de terceros, como WhatsApp, Instagram y Facebook. Al usarlos sales de este sitio y quedas sujeto a los términos y a las políticas de privacidad de cada plataforma, sobre los cuales el Estudio no tiene control ni responsabilidad.',
  },
  {
    title: 'Responsabilidad',
    body: 'El Estudio procura que la información del sitio sea correcta y esté actualizada, y que el sitio se encuentre disponible; sin embargo, no garantiza que esté libre de errores ni que funcione sin interrupciones. En la medida que la ley lo permita, el Estudio no será responsable por daños derivados del uso del sitio o de la imposibilidad de usarlo. Lo anterior no limita los derechos que la Ley Federal de Protección al Consumidor reconoce a los consumidores, ni las obligaciones que el Estudio asume en el contrato de cada evento.',
  },
  {
    title: 'Protección de datos personales',
    body: 'El tratamiento de los datos personales que nos proporciones se rige por nuestro Aviso de Privacidad, disponible en este mismo sitio.',
  },
  {
    title: 'Cambios a estos términos',
    body: 'El Estudio puede modificar estos Términos y Condiciones en cualquier momento. La versión vigente es la publicada en esta página, con su número de versión y fecha de actualización. Los cambios no afectan a los contratos ya firmados.',
  },
  {
    title: 'Legislación aplicable y jurisdicción',
    body: 'Estos Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia relacionada con el uso del sitio, las partes se someten a los tribunales competentes de la ciudad de Aguascalientes, Aguascalientes, sin perjuicio de la competencia de la Procuraduría Federal del Consumidor (PROFECO) en los asuntos que le correspondan.',
  },
  {
    title: 'Contacto',
    body: `Para cualquier duda o comentario sobre estos términos, escríbenos a ${EMAIL} o por WhatsApp al ${PHONE}.`,
  },
];

const privacySections = [
  {
    title: 'Responsable del tratamiento',
    body: `${OWNER}, quien opera bajo el nombre comercial ${STUDIO} (en adelante, "el Responsable"), con domicilio en ${ADDRESS}, es responsable del tratamiento de tus datos personales. Para cualquier asunto relacionado con este aviso puedes escribir a ${EMAIL} o llamar al ${PHONE}.`,
  },
  {
    title: 'Datos personales que recabamos',
    body: [
      'Recabamos tus datos cuando nos contactas (por WhatsApp, teléfono, correo electrónico o redes sociales), cuando solicitas una cotización y cuando contratas nuestros servicios:',
      '— Datos de identificación y contacto: nombre completo, domicilio, teléfono y correo electrónico.',
      '— Datos del evento: tipo de evento, fecha, horarios, lugares y nombre de los festejados.',
      '— Datos de pago: montos, fechas y forma de pago de los anticipos y abonos, y los datos fiscales necesarios si solicitas factura. No recabamos ni almacenamos números de tarjeta.',
      '— Imagen y voz: las fotografías y los videos en los que apareces tú y tus invitados, captados durante las sesiones y eventos contratados.',
      'No solicitamos datos personales sensibles. Cuando en un evento participan niñas, niños o adolescentes (por ejemplo, en XV años, bautizos o primeras comuniones), su imagen se capta por encargo y con el consentimiento de su madre, padre o tutor, que es quien contrata el servicio.',
    ].join('\n\n'),
  },
  {
    title: 'Finalidades del tratamiento',
    body: [
      'Finalidades primarias, necesarias para atenderte y prestarte el servicio:',
      '— Responder tus solicitudes de información y elaborar cotizaciones.',
      '— Elaborar y cumplir el contrato de prestación de servicios, reservar tu fecha y organizar la cobertura del evento.',
      '— Registrar y dar seguimiento a tus pagos y, en su caso, emitir comprobantes fiscales.',
      '— Enviarte la confirmación de tu evento y tu ticket digital, y comunicarnos contigo sobre el servicio.',
      '— Editar, resguardar y entregarte tus fotografías y videos.',
      'Finalidades secundarias, que no son necesarias para prestarte el servicio:',
      '— Exhibir una selección de fotografías y videos de tu evento como muestra de nuestro trabajo en este sitio web, en redes sociales y en material promocional.',
      '— Enviarte información sobre promociones o nuevos servicios.',
      `La exhibición de tus imágenes requiere tu autorización, que se recaba en el contrato. Puedes negarte a las finalidades secundarias, o retirar tu autorización en cualquier momento, escribiendo a ${EMAIL}; tu negativa no será motivo para negarte los servicios contratados.`,
    ].join('\n\n'),
  },
  {
    title: 'Con quién compartimos tus datos',
    body: [
      'No vendemos, rentamos ni cedemos tus datos personales.',
      'Para operar utilizamos proveedores que tratan datos por cuenta nuestra y siguiendo nuestras instrucciones (encargados): servicios de alojamiento del sitio web y de su base de datos, de almacenamiento de imágenes y videos, y de correo electrónico, algunos de los cuales se ubican fuera de México; así como el personal de apoyo (segundos fotógrafos, videógrafos y editores) y, en su caso, el laboratorio de impresión, que participan en tu evento.',
      'Fuera de lo anterior, solo compartiremos tus datos cuando lo exija una ley o lo requiera una autoridad competente mediante mandato fundado y motivado, casos en los que no se necesita tu consentimiento. Cualquier otra transferencia se hará únicamente con tu autorización previa.',
    ].join('\n\n'),
  },
  {
    title: 'Derechos ARCO y revocación del consentimiento',
    body: [
      'Tienes derecho a conocer qué datos personales tenemos de ti, para qué los utilizamos y las condiciones del uso que les damos (Acceso); a solicitar la corrección de tu información cuando esté desactualizada, sea inexacta o esté incompleta (Rectificación); a que la eliminemos de nuestros registros cuando consideres que no se está utilizando conforme a la ley (Cancelación); y a oponerte al uso de tus datos para fines específicos (Oposición). También puedes revocar el consentimiento que nos hayas otorgado.',
      `Para ejercer cualquiera de estos derechos, envía una solicitud a ${EMAIL} que contenga: (1) tu nombre completo y un medio para comunicarte la respuesta; (2) copia de una identificación oficial o, en su caso, el documento que acredite la representación legal; (3) la descripción clara y precisa de los datos respecto de los que deseas ejercer tu derecho y de lo que solicitas; y (4) cualquier elemento que facilite la localización de tus datos.`,
      'Te responderemos en un plazo máximo de 20 (veinte) días hábiles contados desde la recepción de tu solicitud y, si resulta procedente, la haremos efectiva dentro de los 15 (quince) días hábiles siguientes. El trámite es gratuito. Ten en cuenta que no en todos los casos podremos atender tu solicitud o concluir el uso de inmediato, pues es posible que por alguna obligación legal o contractual debamos seguir tratando tus datos.',
    ].join('\n\n'),
  },
  {
    title: 'Cómo limitar el uso o la divulgación de tus datos',
    body: `Puedes pedirnos en cualquier momento que dejemos de enviarte información promocional o que retiremos de este sitio web y de nuestras redes sociales las fotografías o videos en los que apareces, escribiendo a ${EMAIL}. Retiraremos el material de los medios que controlamos; no podemos retirar las copias que terceros hayan hecho mientras estuvo publicado.`,
  },
  {
    title: 'Conservación y seguridad',
    body: [
      'Conservamos tus datos de contacto, del evento y de pago durante la vigencia de la relación contractual y, después, por el tiempo que exijan las disposiciones fiscales y legales aplicables. Las fotografías y los videos originales se resguardan por los plazos establecidos en el contrato; transcurridos estos, pueden ser eliminados.',
      'Aplicamos medidas de seguridad administrativas, técnicas y físicas para proteger tus datos contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no autorizado: el panel donde se administra la información es de acceso restringido con contraseña y las conexiones al sitio están cifradas.',
    ].join('\n\n'),
  },
  {
    title: 'Cookies y tecnologías similares',
    body: 'Este sitio no utiliza cookies publicitarias ni herramientas de rastreo o de análisis de comportamiento. Únicamente emplea el almacenamiento local del navegador para mantener la sesión de quien administra el sitio. Los servicios de terceros a los que enlazamos, como WhatsApp, Instagram y Facebook, aplican sus propias políticas cuando los visitas.',
  },
  {
    title: 'Cambios al aviso de privacidad',
    body: 'Este aviso puede modificarse por cambios en la ley, en nuestros servicios o en nuestras prácticas de privacidad. La versión vigente estará siempre disponible en esta página, con su número de versión y fecha de actualización.',
  },
  {
    title: 'Autoridad',
    body: 'Si consideras que tu derecho a la protección de datos personales ha sido vulnerado, puedes acudir a la Secretaría Anticorrupción y Buen Gobierno, autoridad encargada de vigilar el cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
  },
  {
    title: 'Consentimiento',
    body: 'Al proporcionarnos tus datos personales por cualquiera de los medios señalados y al firmar el contrato de prestación de servicios, manifiestas que conoces este aviso de privacidad y que consientes el tratamiento de tus datos en los términos aquí descritos.',
  },
];

const numbered = (sections) => sections.map((section, index) => ({ number: index + 1, ...section }));

export const legalDocuments = [
  {
    type: 'contract',
    title: 'Contrato de adhesión de prestación de servicios profesionales',
    version: '1.0',
    intro: `Este es el modelo del contrato que ${STUDIO} firma con cada cliente. Los datos del cliente, del evento, de los servicios contratados y del costo se llenan al momento de contratar; el ejemplar firmado por ambas partes es el que tiene validez.`,
    sections: numbered(contractSections),
    isProvisional: false,
  },
  {
    type: 'terms',
    title: 'Términos y condiciones',
    version: '1.0',
    intro: `Estos términos regulan el uso del sitio web de ${STUDIO}. Te pedimos leerlos con atención.`,
    sections: numbered(termsSections),
    isProvisional: false,
  },
  {
    type: 'privacy',
    title: 'Aviso de privacidad',
    version: '1.0',
    intro: `En cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, ${STUDIO} te informa cómo recaba, utiliza y protege tus datos personales.`,
    sections: numbered(privacySections),
    isProvisional: false,
  },
];
