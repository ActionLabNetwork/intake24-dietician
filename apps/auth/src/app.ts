import express, { Response as ExResponse, Request as ExRequest } from 'express';
import bodyParser from 'body-parser';
// import jwt from 'jsonwebtoken';
import { RegisterRoutes } from '../build/routes';
import swaggerUi from 'swagger-ui-express';

export const app = express();
app.use(bodyParser.json());
app.use('/docs', swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(swaggerUi.generateHTML(await import('../build/swagger.json')));
});

RegisterRoutes(app);

// const SECRET = 'some-secret-key';

// interface User {
//   id: number;
//   username: string;
//   password: string;
// }

// const users: User[] = [{ id: 1, username: 'user', password: 'pass' }];

// app.post('/login', (req: Request, res: Response) => {
//   const { username, password } = req.body;

//   const user = users.find((u) => u.username === username && u.password === password);

//   if (user) {
//     const token: string = jwt.sign({ id: user.id }, SECRET);
//     res.json({ token });
//   } else {
//     res.status(401).json({ error: 'Invalid credentials' });
//   }
// });
