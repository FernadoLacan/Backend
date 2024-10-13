import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Router } from "express"
import { prisma } from "../scripts/prisma-lib.js";
import authenticateToken from "../middlewares/authentication.js";
import { UserRoleEnum } from "@prisma/client";
const authRouter = Router();

authRouter.get('/', authenticateToken, async(req, res) => {
  try{
    const users = await prisma.user.findMany({ where: {active: true}})
    return res.status(200).json(users)
  }catch(error){
    console.log("Error al listar los usuarios", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudieron listar los usuarios"});
  }
})

authRouter.get('/developers', authenticateToken, async(req, res) => {
  try{
    const users = await prisma.user.findMany({ where: { role: UserRoleEnum.DEVELOPER, active: true }, select: { id: true, email: true }})
    return res.status(200).json(users)
  }catch(error){
    console.log("Error al listar los desarrolladores", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudieron listar los desarrolladores"});
  }
})

authRouter.get('/:id', authenticateToken, async(req, res) => {
  try{
    const id = req.params.id
    const user = await prisma.user.findUnique({ where: {id: id}})

    return res.status(200).json(user)
  }catch(error){
    console.log("Error al listar los usuarios", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudieron listar los usuarios"});
  }
})

authRouter.post('/register', authenticateToken, async (req, res) => {
  const { email, name, lastname, phone, password, role } = req.body;

  // Encriptamos la contraseña.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try{
  const user = await prisma.user.create({
    data: {
      email: email,
      phone: phone,
      name: name,
      lastname: lastname,
      password: hashedPassword,
      role: role
    }
  })

  return res.status(201).json({ message: 'Usuario registrado exitosamente' });
  }catch(error){
    console.log("Error al registrar al usuario ", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo registrar el usuario"});
  }
});

authRouter.put('/:id', authenticateToken, async (req, res) => {  
  const { email, name, lastname, phone, role } = req.body;
  try{
    const id = req.params.id
    const user = await prisma.user.update({
      where: { id: id},
      data: {
        email: email,
        phone: phone,
        name: name,
        lastname: lastname,
        role: role
      }
    })
  
    return res.status(200).json(user);
    }catch(error){
      console.log("Error al registrar al usuario ", error);
      return res.status(400).json({ message: "Ocurrió un error, no se pudo actualizar el usuario"});
    }
})

authRouter.post('/login', async (req, res) => {  
  const { email, password } = req.body;

  // Verificamos si el usuario existe.
  const user = await prisma.user.findUnique({ where: { email: email }})
  if(!user){
    return res.status(400).json({ message: "credenciales inválidas"});
  }

  // Verificamos la contraseña.
  const isMatch = await bcrypt.compare(password, user.password)
  if(!isMatch){
    return res.status(400).json({ message: "credenciales inválidas"});
  }

  // Generamos el token.
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '3h'
  });

  // Retornamos el token
  res.status(200).json({ token, role: user.role });
});

authRouter.delete('/:id', authenticateToken, async(req, res) => {
  try{
    const id = req.params.id
    const user = await prisma.user.update({ where: { id: id}, data: { active: false }})
    return res.status(200).json(user)
  }catch(error){
    return res.status(400).json({ message: "No se pudo eliminar al colaborador"});
  }
})

authRouter.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Acceso a la ruta protegida', user: req.user })
});

export default authRouter