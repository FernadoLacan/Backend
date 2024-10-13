import { Router } from "express"
import { prisma } from "../scripts/prisma-lib.js";
import authenticateToken from "../middlewares/authentication.js";
const issueRouter = Router();

issueRouter.get('/get-developer-issues', authenticateToken, async (req, res) => {
  try{
    const userId = req.user.id
    
    const issues = await prisma.issue.findMany({ 
      where: { 
        userId: userId
      },      
      select: {
        id: true,
        name: true,
        description: true,
        state: true,
        test: {
          select: {
            id: true,
            name: true,
            description: true
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
    })
    return res.status(200).json(issues)
  }catch(e){
    return res.status(400).json({ message: "Ocurrió un error, no se pudo obtener los errores"});    
  }
})

issueRouter.post('/', authenticateToken, async (req, res) => {  
  const { name, description, testId, userId } = req.body;

  try{
    
    const issue = await prisma.issue.create({
      data: {
        name: name,
        description: description,
        testId: testId,
        userId: userId        
      }
    })

    return res.status(201).json(issue);
  }catch(error){
    console.log("Error al registrar el issue ", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo registrar el issue"});
  }
});

issueRouter.put('/:id', authenticateToken, async (req, res) => {  
  const { name, description, userId } = req.body;
  const issueId = req.params.id

  try{    
    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        name: name,
        description: description,
        userId: userId
      },
      select: {
        name: true,
        description: true,
        test: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    })

    return res.status(200).json(issue);
  }catch(error){
    console.log("Error al actualizar la issue ", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo actualizar la issue"});
  }
})

issueRouter.put('/mark-issue/:id', authenticateToken, async (req, res) => {  
  const { state } = req.body;
  const issueId = req.params.id

  try{
    
    const issue = await prisma.issue.update({
      where: { id: issueId },
      data: { state: state }
    })

    return res.status(200).json(issue);
  }catch(error){
    console.log("Error al actualizar la issue ", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo actualizar la issue"});
  }
})

issueRouter.delete('/:id', authenticateToken, async (req, res) => {    
  const issueId = req.params.id

  try{
    
    const issue = await prisma.issue.delete({where: {id: issueId}})
    return res.status(200).json(issue);
  }catch(error){
    console.log("Error al eliminar la issue ", error);
    return res.status(400).json({ message: "Ocurrió un error, no se pudo eliminar la issue"});
  }
})

export default issueRouter;