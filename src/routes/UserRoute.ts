import express from "express";
import myUserController from "../controller/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validationMyUserRequest } from "../middleware/validation";

const router = express.Router();

router.post("/", jwtCheck, myUserController.createCurrentUser);

router.put(
  "/",
  jwtCheck,
  jwtParse,
  validationMyUserRequest,
  myUserController.updateUser
);

router.get(
  "/",
  jwtCheck,
  jwtParse,
  myUserController.getCurrentUser
);


export default router;
