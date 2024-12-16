server.use(middlewares);
server.use(router);
server.listen(port);



const { Server } = require("http");
const jsonServer = require("json-server");
const nodemailer = require("nodemailer"); // Asegúrate de instalar esta dependencia
const server = jsonServer.create();
const router = jsonServer.router("almacen.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

server.use(middlewares);
server.use(jsonServer.bodyParser); // Permitir el manejo de JSON en las solicitudes

// Endpoint personalizado para recuperación de contraseña
server.post("/recuperar-password", async (req, res) => {
  const { email } = req.body;

  // Verificar que el email fue enviado
  if (!email) {
    return res.status(400).json({ error: "El correo electrónico es obligatorio." });
  }

  // Buscar el usuario en almacen.json
  const db = router.db; // Acceso directo a la base de datos simulada
  const usuarios = db.get("usuarios").value(); // "usuarios" debe ser una colección en tu JSON
  const usuario = usuarios.find((u) => u.email === email);

  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado con ese correo." });
  }

  // Configurar el transporte de nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tuemail@gmail.com", // Reemplaza con tu correo
      pass: "tucontraseña", // Reemplaza con tu contraseña de aplicación
    },
  });

  const mailOptions = {
    from: "tuemail@gmail.com",
    to: email,
    subject: "Recuperación de Contraseña",
    text: `Hola, ${usuario.username}. Aquí está el enlace para recuperar tu contraseña: [ENLACE_DE_RECUPERACIÓN]`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Correo de recuperación enviado con éxito." });
  } catch (error) {
    res.status(500).json({ error: "Error al enviar el correo de recuperación." });
  }
});

server.use(router);
server.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
