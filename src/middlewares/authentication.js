
import jwt from "jsonwebtoken"

// Middleware para verificar si el usuario está autenticado
const authenticateToken = (req, res, next) => {
  //Obtenemos el token de la cabecera de Authorización de la petición.
  if(!req.header('Authorization')){
    return res.status(401).json({ message: 'Acceso denegado. No se encontró token.' });
  }

  const token = req.header('Authorization').replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se encontró token.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("usuario verificado ::: ", verified);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export default authenticateToken;