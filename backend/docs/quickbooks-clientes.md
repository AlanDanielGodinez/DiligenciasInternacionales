# QuickBooks: cliente/aplicante como Customer

Antes de esta corrección, la integración representaba cada 'contacto' como un
Customer y agregaba sus aplicantes en Notes. Ese modelo no permitía que dos
aplicantes del mismo contacto tuvieran Customers independientes.

La entidad canónica ahora es 'clientes.id_cliente'. Cada cliente se vincula con
un Customer mediante 'cliente_quickbooks'. El DisplayName incluye el nombre
completo y 'id_cliente'; después de la primera sincronización, el
'quickbooks_customer_id' persistido es la identidad principal. Cada update lee
primero el Customer para obtener el SyncToken vigente y guarda el nuevo token.

La creación y modificación de un cliente dispara su propia sincronización
después de completar la escritura local. Crear una solicitud, o cambiar su tipo
de trámite, vuelve a sincronizar únicamente el cliente de esa solicitud porque
sus trámites forman CompanyName. Cambiar un contacto no dispara QuickBooks.

'contacto_quickbooks' se conserva como estructura legacy y ya no participa en
sincronizaciones nuevas. No existe una migración automática segura: un contacto
puede tener varios clientes.

La migración '2026_09_29_quickbooks_cliente_mapping.sql' debe revisarse y
ejecutarse por separado antes de usar el nuevo flujo. No fue ejecutada durante
esta implementación. La prueba real con QuickBooks Sandbox también queda para
una fase posterior.
