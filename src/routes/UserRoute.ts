import express from "express";
import myUserController from "../controller/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validationMyUserRequest } from "../middleware/validation";
import { verifyAccessToken } from "../middleware/auth.middleware";

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

router.post(
  "/login",
  myUserController.login
)

router.post(
  "/register",
  myUserController.register
)

router.get(
  "/info",
  verifyAccessToken,
  myUserController.getUserInfo
)

router.post(
  "/reset-password",
  myUserController.resetPassword
)

router.patch(
  "/update",
  verifyAccessToken,
  myUserController.updateUserInfo
)

router.post(
  '/login-google',
  myUserController.loginWithGoogleAuthen
)

export default router;
