import { config } from "dotenv"
import express from "express"
import cors from "cors"
import authRouter from "./routes/auth.js";
import { createUserAdmin } from "./scripts/seed.js";
import projectRouter from "./routes/project.js";
import testRouter from "./routes/tests.js";
import issueRouter from "./routes/issues.js";
config();

// Inicializar app de Express
const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true}));


app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tests', testRouter);
app.use('/api/issues', issueRouter);

app.get('/', (req, res) => {
  res.send('Servidor en línea.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await createUserAdmin();
  console.log(`Servidor corriendo en puerto ${PORT}`);
});