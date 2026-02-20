
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding PUDO data...');

    // 1. Locations
    const locations = [
        {
            name: "Fajado-Coupi Travel",
            address: "Carretera #3 KM 45.5 Fajardo Market Square, Suite 4 Fajardo, PR 00738",
            businessDaysEn: "Monday to Saturday",
            businessDaysEs: "Lunes a Sábado",
            businessHours: "Monday -Friday: 8:30-17:00, Saturday: 8:30-12:00",
            contact: "787-860-1515",
            zipCode: "00738",
            status: "ACTIVE"
        },
        {
            name: "Morovis-Isla Menos Priting",
            address: "#23 Ave. Buena Vista, Morovis, PR 00687",
            businessDaysEn: "Monday - Saturday",
            businessDaysEs: "Lunes a Sábado",
            businessHours: "Monday-Friday 7:00 -17:00, Saturday: 9:00-14:00",
            contact: "939-255-2438",
            zipCode: "00687",
            status: "ACTIVE"
        },
        {
            name: "Local Artesanal",
            address: "126 Calle Georgetti, Naranjito, PR 00719",
            businessDaysEn: "7 Days",
            businessDaysEs: "7 Días",
            businessHours: "Monday-Friday 7:00am -5:00pm, Saturday: 8:00am-02:00pm, Sunday: Close",
            contact: "939-460-9500",
            zipCode: "00719",
            status: "ACTIVE"
        },
        {
            name: "Damasin Mini Market",
            address: "Carr. 173 Km 2.7, Sonadora, Aguas Buenas, PR 00703",
            businessDaysEn: "7 Days",
            businessDaysEs: "7 Días",
            businessHours: "Monday-Sunday 7:00am -8:00pm",
            contact: "939-313-4063",
            zipCode: "00703",
            status: "ACTIVE"
        },
        {
            name: "CAR GROUP INC (Las Piedras & Juncos)",
            address: "198 Carr Torres, Bo. Montones 1, Las Piedras P.R. 00771",
            businessDaysEn: "Monday - Saturday",
            businessDaysEs: "Lunes a Sábado",
            businessHours: "Monday-Saturday 8:00am -6:00pm. Sunday: Close",
            contact: "787-669-5920",
            zipCode: "00771",
            status: "ACTIVE"
        },
        {
            name: "Laurent Beauty Supply",
            address: "150 Calle Luis Muñoz Rivera, San Lorenzo, P.R. 00754",
            businessDaysEn: "Monday - Saturday",
            businessDaysEs: "Lunes a Sábado",
            businessHours: "Monday-Saturday 8:30am -4:00pm. Sunday: Close",
            contact: "787-787-561-8199",
            zipCode: "00754",
            status: "ACTIVE"
        }
    ];

    for (const loc of locations) {
        await prisma.pudoLocation.create({
            data: loc
        });
    }

    // 2. Content
    const introEn = `
PUDO (Pick Up Drop Off) is a service that allows customers to pick up their packages at designated self-pickup locations, which aims to improve delivery efficiency in remote areas where traditional door-to-door delivery is challenging.

PUDO Pilot Program Timeline
Start Date: Monday, September 8 (US Time)
Update: February 16, 2026

Key Notes During the Pilot:
1. New Tracking Status: if the tracking status shows "Awaiting Pickup by Recipient" indicates that the package is at the PUDO point. The recipient will receive an SMS notification for pickup.
2. A new problem parcel type, "Awaiting Pickup at PUDO Point," has been added to the DMS Workspace. Under no circumstances should CS reps manually report this issue type.
3. To prevent "No tracking updates", the "Awaiting Pickup by Recipient" status may be pushed multiple times until the package is picked up or expires. This is not a delivery exception or system error.
`.trim();

    const introEs = `
PUDO (Pick Up Drop Off) es un servicio que permite a los clientes recoger sus paquetes en puntos de auto-recogida designados, con el objetivo de mejorar la eficiencia de entrega en áreas remotas donde la entrega puerta a puerta tradicional es difícil.

Cronograma del Programa Piloto PUDO
Fecha de Inicio: Lunes, 8 de Septiembre (Hora de EE.UU.)
Actualización: 16 de Febrero, 2026

Notas Clave Durante el Piloto:
1. Nuevo Estado de Rastreo: si el estado muestra "Awaiting Pickup by Recipient" (Esperando Recogida por Destinatario), indica que el paquete está en el punto PUDO. El destinatario recibirá una notificación SMS para la recogida.
2. Un nuevo tipo de problema de paquete, "Awaiting Pickup at PUDO Point," ha sido agregado al espacio de trabajo DMS. Bajo ninguna circunstancia los representantes de CS deben reportar manualmente este tipo de problema.
3. Para prevenir "falta de actualizaciones de rastreo", el estado "Awaiting Pickup by Recipient" puede enviarse múltiples veces hasta que el paquete sea recogido o expire. Esto no es una excepción de entrega ni un error del sistema.
`.trim();

    const footerEn = `
PUDO-Related Customer Inquiries

Package Inquiry
• Scenario: Recipient asks for the pickup address or how to pick-up at a PUDO point.
• Action:
  a. Check the tracking status. If it shows "Awaiting Pickup by Recipient", then it means the package is at the PUDO point.
  b. Confirm the HC zip code and tracking status to identify the correct PUDO point.
  c. Provide the recipient with the PUDO point’s address and business hours.
  d. Inform the recipient that they should have received an SMS notification for pickup, which can be used as proof of pickup.

Redelivery Request: PUDO point to residential address
• Scenario: The parcel has been delivered to PUDO point, but customer requests to change from PUDO pickup to door delivery.
• Action:
  a. Create a work order with the following details:
     ▪ Work Order Type: Modify Info
     ▪ Detailed Type: Changing the Shipping Information During the Delivery
     ▪ Customer Complaint: No
     ▪ Remark: "PUDO to Door. Customer requires redelivery to residential address."
  b. Verify address. If the recipient requests a new address, update the address in the system following the standard address modification process.
  c. If no new address is requested, simply create the work order as described.
• Important:
  ◦ The product team will regularly export work orders and filter them by remarks to notify PUDO point operators to return and re-deliver packages. Please strictly follow the work order type and remark format.

Customer requests to have the parcel stored at the PUDO point for more than 14 days
• Inform the customer that the parcel will remain at the PUDO point for 14 calendar days during the first pickup period.
• If the parcel is not collected within those 14 days, it will be returned to the sorting center and then reassigned to the PUDO point for a second pickup period.
• If the parcel remains uncollected after the second PUDO cycle, it will be returned directly to the sender.
• There is no re-delivery process for PUDO parcels. However, while the parcel is still active in the system, the customer may request home delivery instead of PUDO pickup, but this does not qualify as a re-delivery request.
`.trim();

    const footerEs = `
Consultas de Clientes Relacionadas con PUDO

Consulta de Paquete
• Escenario: El destinatario pregunta por la dirección de recogida o cómo recoger en un punto PUDO.
• Acción:
  a. Verifique el estado de rastreo. Si muestra "Awaiting Pickup by Recipient", significa que el paquete está en el punto PUDO.
  b. Confirme el código postal HC y el estado de rastreo para identificar el punto PUDO correcto.
  c. Proporcione al destinatario la dirección y el horario de atención del punto PUDO.
  d. Informe al destinatario que debería haber recibido una notificación SMS para la recogida, la cual puede usarse como comprobante.

Solicitud de Re-entrega: Punto PUDO a dirección residencial
• Escenario: El paquete ha sido entregado en un punto PUDO, pero el cliente solicita cambiar de recogida en PUDO a entrega a domicilio.
• Acción:
  a. Cree una orden de trabajo con los siguientes detalles:
     ▪ Tipo de Orden de Trabajo: Modify Info
     ▪ Tipo Detallado: Changing the Shipping Information During the Delivery
     ▪ Queja del Cliente: No
     ▪ Nota: "PUDO to Door. Customer requires redelivery to residential address."
  b. Verifique la dirección. Si el destinatario solicita una nueva dirección, actualice la dirección en el sistema siguiendo el proceso estándar de modificación.
  c. Si no se solicita una nueva dirección, simplemente cree la orden de trabajo como se describe.
• Importante:
  ◦ El equipo de producto exportará regularmente las órdenes de trabajo y las filtrará por notas para notificar a los operadores de puntos PUDO que devuelvan y reenvíen los paquetes. Por favor, siga estrictamente el tipo de orden de trabajo y el formato de la nota.

El cliente solicita tener el paquete almacenado en el punto PUDO por más de 14 días
• Informe al cliente que el paquete permanecerá en el punto PUDO por 14 días naturales durante el primer período de recogida.
• Si el paquete no se recoge dentro de esos 14 días, será devuelto al centro de clasificación y luego reasignado al punto PUDO para un segundo período de recogida.
• Si el paquete permanece sin recoger después del segundo ciclo PUDO, será devuelto directamente al remitente.
• No hay proceso de re-entrega para paquetes PUDO. Sin embargo, mientras el paquete siga activo en el sistema, el cliente puede solicitar entrega a domicilio en lugar de recogida en PUDO, pero esto no califica como una solicitud de re-entrega.
`.trim();

    await prisma.pudoContent.upsert({
        where: { key: 'intro' },
        update: { contentEn: introEn, contentEs: introEs },
        create: { key: 'intro', contentEn: introEn, contentEs: introEs }
    });

    await prisma.pudoContent.upsert({
        where: { key: 'footer' },
        update: { contentEn: footerEn, contentEs: footerEs },
        create: { key: 'footer', contentEn: footerEn, contentEs: footerEs }
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
