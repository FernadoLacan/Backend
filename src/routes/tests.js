import { Router } from "express"
import { prisma } from "../scripts/prisma-lib.js";
import authenticateToken from "../middlewares/authentication.js";
const testRouter = Router();

testRouter.get('/get-developer-tests', authenticateToken, async (req, res) => {
  try{
    const userId = req.user.id
    
    const tests = await prisma.test.findMany({ where: { userId: userId, active: true }
    , select: {
      id: true,
      name: true,
      description: true,
      acceptance: true,
      startDate: true,
      endDate: true,
      state: true,
      user: {
        select: {
          id: true,
          email: true
        }
      },
      project: {
        select: {
          name: true
        }
      },
      issues: {
        select: {
          id: true,
          name: true,
          description: true,
          user: true
        }
      }
    }
    })
    return res.status(200).json(tests)
  }catch(e){
    return res.status(400).json({ message: "Ocurrió un error, no se pudo obtener las pruebas"});    
  }
})

testRouter.post('/', authenticateToken, async (req, res) => {  
  const { name, projectId, description, acceptance, userId, startDate, endDate } = req.body;

  const parseStartDate = new Date(startDate)
  const parseEndDate   = new Date(endDate)

  try{
    
    const test = await prisma.test.create({
      data: {
        name: name,
        projectId: projectId,
        userId: userId,
        description: description,
        acceptance: acceptance,
        startDate: parseStartDate,
        endDate: parseEndDate
      }
    })

    return res.status(201).json(test);
  }catch(error){
    console.log("Error al registrar el proyecto ", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo registrar el proyecto"});
  }
});

testRouter.put('/mark-test/:id', authenticateToken, async (req, res) => {  
  const { state } = req.body;
  const testId = req.params.id

  try{
    
    const issue = await prisma.test.update({
      where: { id: testId },
      data: { state: state }
    })

    return res.status(200).json(issue);
  }catch(error){
    console.log("Error al actualizar la prueba.", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo actualizar la prueba"});
  }
})

testRouter.delete('/:id', authenticateToken, async (req, res) => {    
  const testId = req.params.id

  try{
    
    const issue = await prisma.test.update({where: {id: testId}, data: {active: false }})
    return res.status(200).json(issue);
  }catch(error){
    console.log("Error al eliminar la prueba ", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo eliminar la prueba"});
  }
})


export default testRouter;