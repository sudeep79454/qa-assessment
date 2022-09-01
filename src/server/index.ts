import "reflect-metadata";

import { Application } from "express";
import { createExpressServer } from "routing-controllers";
import Home from "./controllers/home";
import AuthController from "./controllers/auth";
import ProtectedController from "./controllers/protected";
import { AuthMiddleware } from "./middleware/require-authorization";
/**
 * Start Server
 */
const expressApp: Application = createExpressServer({
  classTransformer: true,
  routePrefix: "/v3",
  defaultErrorHandler: true,  // set true so that it handles error in json when false it was returning data in html with only 200 status
  middlewares: [
    AuthMiddleware  // Added to be included as a middleware in the server
  ],
  controllers: [
    Home,
    AuthController,       // Added to be included in the server
    ProtectedController   // Added to be included in the server
  ],
});
export default expressApp;
export const server = expressApp.listen();