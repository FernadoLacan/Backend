import { Router } from "express"
import { prisma } from "../scripts/prisma-lib.js";
import authenticateToken from "../middlewares/authentication.js";
import { UserRoleEnum } from "@prisma/client";
const projectRouter = Router();

projectRouter.get('/', authenticateToken, async(req, res) => {
  try{
    const projects = await prisma.project.findMany({ where: {active: true}})
    return res.status(200).json(projects)
  }catch(error){
    console.log("Error al listar los usuarios", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudieron listar los proyectos"});
  }
})

projectRouter.get('/projects-detail', authenticateToken, async(req, res) => {
  try{
    const developers = await prisma.user.findMany({
      where: { role: UserRoleEnum.DEVELOPER, active: true },
      select: {
        id: true,
        email: true,
        name: true,
        lastname: true,
        tests: {
          where: {
            active: true
          },
          select: {
            id: true,
            name: true,
            state: true,
            project: {
              select: {
                name: true
              }
            }
          }
        },
        issues: {              
          select: {
            id: true,
            name: true,
            state: true,
            test: {                            
              select: {       
                active: true,         
                project: {
                  select: {
                    name: true                    
                  }
                }
              }              
            }
          }
        }
      }
    })

    const projects = await prisma.project.findMany({ 
      where: {active: true},
      select: {
        id: true,
        name: true,
        clientName: true,
        startDate: true,
        endDate: true,
        tests: {
          where: {
            active: true
          },  
          select: {
            id: true,
            name: true,
            state: true,
            active: true,
            user: {
              select: {
                id: true,
                email: true
              }
            },
            issues: {
              select: {
                state: true,
                name: true,
                description: true,
                user: {
                  select: {
                    id: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    })
    return res.status(200).json({projects, developers})
  }catch(error){
    console.log("Error al listar los usuarios", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudieron listar los proyectos"});
  }
})

projectRouter.get('/:id', authenticateToken, async(req, res) => {
  try{
    const id = req.params.id
    const project = await prisma.project.findUnique({ 
      where: {id: id},
      select: {
        name: true,
        id: true,
        tests: {
          where: {
            active: true
          },
          select: {
            id: true,
            name: true,
            description: true,
            acceptance: true,            
            startDate: true,
            endDate: true,
            issues: {
              select: {
                id: true,
                name: true,
                description: true,
                state: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })
    return res.status(200).json(project)
  }catch(error){
    console.log("Error al obtener el proyecto", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo obtener el proyecto"});
  }
})

projectRouter.post('/', authenticateToken, async (req, res) => {  
  const { name, clientName, startDate, endDate } = req.body;

  const parseStartDate = new Date(startDate)
  const parseEndDate   = new Date(endDate)

  try{
    const project = await prisma.project.create({
      data: {
        name: name,
        clientName: clientName,
        startDate: parseStartDate,
        endDate: parseEndDate
      }
    })

    return res.status(201).json(project);
  }catch(error){
    console.log("Error al registrar el proyecto ", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo registrar el proyecto"});
  }
});

projectRouter.put('/:id', authenticateToken, async (req, res) => {
  const { name, clientName, startDate, endDate } = req.body;

  try{
    const id = req.params.id

    const parseStartDate = new Date(startDate)
    const parseEndDate   = new Date(endDate)

    const project = await prisma.project.update({
      where: { id: id},
      data: {
        name: name,
        clientName: clientName,
        startDate: parseStartDate,
        endDate: parseEndDate
      }
    })

    return res.status(201).json(project);
  }catch(error){
    console.log("Error al actualizar el proyecto ", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo actualizar el proyecto"});
  }
});

projectRouter.delete('/:id', authenticateToken, async(req, res) => {
  try{
    const id = req.params.id
    const project = await prisma.project.update({ where: { id: id}, data: { active: false }})
    return res.status(200).json(project)
  }catch(error){
    return res.status(400).json({ message: "No se pudo eliminar el proyecto"});
  }
})

export default projectRouter