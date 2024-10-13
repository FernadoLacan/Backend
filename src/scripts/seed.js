import bcrypt from "bcryptjs"
import { prisma } from "./prisma-lib.js"
import { config } from "dotenv"
import { UserRoleEnum } from "@prisma/client";
config();

export const createUserAdmin = async () => {
  // Encriptar la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

  // Verificar si ya fue creado el usuario administrador.
  const userAdmin = await prisma.user.findUnique({ where: { email: "admin@system.com" }})
  if(userAdmin){
    console.log("El usuario administrador ya fue creado.")
  }else{
    // Crear al usuario administrador.
    const userAdmin = await prisma.user.create({
      data: {
        name: "administrador",        
        email: "admin@system.com",
        password: hashedPassword,
        role: UserRoleEnum.ADMIN
      }
    })

    console.log("Se ha creado el usuario administrador")
  }  
}