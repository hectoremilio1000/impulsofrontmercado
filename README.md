# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

### README PAGOS FLUJO

¡Perfecto! Te dejo un flujo paso a paso que integra toda tu configuración de planes, suscripciones, creación de usuarios, asignación de empresas y módulos, y el tema de pagos/manual vs. automático. De esta forma, si en algún momento “nos perdemos” en la programación, tendremos un mapa de cómo proceder:

1. Creación de un usuario (rol = admin/cliente)
   El superadmin entra a “Usuarios” (página Usuarios.jsx) y hace clic en “Nuevo Usuario”.

Aparece el Modal CreateUser (CreateUserModal.jsx).

El superadmin llena name, email, whatsapp (opcional), y “password” (por defecto “12345678”, por ejemplo).
Al darle “Crear”, se llama a POST /api/newuser.
El backend crea el usuario con rol_id = 2 (admin) y responde con newUserId.
El frontend ejecuta onSuccess(newUserId), cierra el modal de usuario y abre el modal CreateCompanyModal, pasando ese userId para asignarlo como “dueño” de la empresa que se creará.

El superadmin crea la empresa (name, email, phone_contact, website, logo) y la asigna a user_id = newUserId.

Se llama a POST /api/companies.
El backend crea la empresa, responde con newCompanyId.
Inmediatamente, el frontend hace onSuccess(newCompanyId), cierra el modal de empresa y abre el modal SelectModulesModal.

Este modal carga la lista de módulos (GET /api/modules).
El superadmin elige 4 módulos para el Plan Básico (o si siempre es el Básico por default).
Luego hace clic en “Guardar”.
Al dar “Guardar”, llama a POST /api/subscriptions con:

json
Copy
Edit
{
"user_id": newUserId,
"plan_id": 1, // Plan Básico
"modules_ids": [ ... ] // los 4 módulos seleccionados
}
El backend crea la suscripción con status='trialing', start_date=Hoy, end_date=Hoy+15 (trial).
Deja la coaching_included en 2 si es plan básico.
Con esto, el usuario queda creado, con su empresa, su suscripción en estado trialing y sus 4 módulos asignados.

El superadmin cierra el modal y vuelve a la tabla de usuarios.
Ahora el usuario (admin/cliente) puede iniciar sesión, y verá su panel con 4 módulos habilitados, en period de prueba por 15 días. 2. Manejo de la Suscripción (Trial → Pago → Activo)
Usuario (admin/cliente) hace login, se da cuenta de que le quedan X días de prueba.

Al cumplirse el día 15 (o día 16), si no pagó, puedes dejar 5 días de gracia. Dos opciones:

(A) Cron Job: a la 1 AM, revisa suscripciones con status='trialing' y trial_ends_at + 5 días < now() => pasa a suspended.
(B) Check on-demand: al loguearse, si Date.now() > trialEndsAt + 5, => status='suspended'.
Para pagar: El usuario va a un botón “Pagar” (por ejemplo, “Pagar mi mensualidad”). El front crea un link de pago con POST /api/payments, indicando type='preference', plan_id=1, subscription_id=999, price=10000, etc.

Mercado Pago regresa un init_point. El front redirige al usuario.

Cuando el usuario paga, MP hace POST a POST /api/payments/notification. Tu backend ve status='approved', crea un transaction con status='approved', y pone la suscripción en status='active', y end_date = Hoy + 30.

Cuando falten X días para la siguiente fecha de corte, el usuario vuelve a pagar. Si no paga a tiempo, tras 5 días => suspended.

3. Creación de un Usuario Prospecto (flujo simplificado)
   Usuario se registra solo en un formulario (por ejemplo, la página RegisterProspect.jsx).
   Llama a POST /api/registerProspect con rol_id=3 (prospect).
   No crea empresa ni suscripción. (Ese prospecto no tiene acceso a módulos.)
   Luego, si se vuelve “cliente” en un futuro, el superadmin le cambia rol a 2, crea su empresa y su suscripción (módulos).
   (Esto es paralelo y no afecta el flujo principal de crear un admin con su empresa.)

4. Mantenimiento y Actualización de Datos
   Editar Usuario (pagina Usuarios.jsx => “Editar” en dropdown).
   Muestra EditUserModal, hace GET /api/users o /api/users/:id, se edita name/whatsapp.
   También carga GET /api/subscriptionbyuser/:id para ver la suscripción y los módulos asignados.
   El superadmin puede cambiar los módulos (PUT /api/subscriptions/:id, con modules_ids).
   Editar Empresa (pagina Companies.jsx).
   Se cambia el user_id (dueño), o su email, etc. => PUT /api/companies/:id.
5. Manejo de Planes / Módulos
   Planes: Tienes CRUD de planes en Plans.jsx.

Plan Básico = 10k => max_modules=4, coaching_included=2.
Plan Pro = 20k => max_modules=10, coaching_included=4.
Módulos: Tienes CRUD en Modules.jsx.

SubscriptionModules es la pivot que dice qué módulos tiene cada suscripción.
Asignación de Módulos en la suscripción:

Ocurre en POST /api/subscriptions (cuando se crea) o PUT /api/subscriptions/:id (cuando se actualiza). 6. Pagos Manuales (Off-line) vs. Mercado Pago (On-line)
A. Mercado Pago (on-line)
Usuario clica “Pagar”.
Front => POST /api/payments => type='preference', subscription_id=..., plan_id=..., price=10000.
Te devuelve un init_point. Rediriges al usuario a la pasarela de MP.
MP notifica a /api/payments/notification => si approved, tu backend crea transaction.status='approved' y subscription.status='active', end_date=Hoy+30.
B. Pago Manual (Efectivo, Transferencia)
Usuario (admin/cliente) avisa al superadmin “te deposité”.
El superadmin va a un panel “Pagos” o “Transactions” => hace POST /api/transactions, con status='pending'.
Verifica el comprobante, lo marca status='approved'.
Llama a PUT /api/subscriptions/:id => status='active', end_date=Hoy+30. 7. ¿Qué pasa con la “Empresa”?
Cada usuario (admin) puede tener una empresa.
Companies.jsx maneja su CRUD.
Se relaciona por user_id => indica quién es el “dueño”.
Esto no afecta directamente al “estado de suscripción”, pero sí a la información de la empresa (correo, teléfono, etc.). 8. Coaching Hours (Opcional)
Tu subscriptions ya trae coaching_included y coaching_used.
Cuando se crea la suscripción, si el plan es “Básico” => 2. Si es “Pro” => 4.
Cada mes, al renovar, se puede resetear coaching_used=0 (manual o con cron).
Si se pasa, cobras $1,000/h extra => POST /api/transactions => “approved” => sub. a “active” (o no la mueves si ya está “active”). 9. Resumen Simplificado del Primer Flujo (Nuevo cliente)
Para no enredarse, el primer caso (más común) será:

Superadmin hace clic en “Nuevo Usuario”.
1.1. Crea user (rol=2).
1.2. Crea company => user_id = [ese user].
1.3. Crea la subscription => plan_id=Básico, modules=4. => status='trialing'.
El cliente (admin) se loguea, ve su trial.
Al querer continuar tras 15 días, paga con MP (o efectivo).
Suscripción se pone “active”, end_date=+30 días.
De esa manera, ya tienes claro el paso a paso. Luego, integras la parte de cron si lo deseas, para suspender automáticamente tras 5 días sin pago.

¡Listo! Con este flujo siempre sabrás por dónde vas, y qué método o endpoint se toca en cada paso.
