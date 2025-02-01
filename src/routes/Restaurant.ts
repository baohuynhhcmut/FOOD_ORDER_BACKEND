import express from "express";
import multer from "multer";
import RestaurantController from "../controller/RestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  // limits: {
  //   fieldSize: 5 * 1024 * 1024,
  // },
});

router.post(
  "/",
  jwtCheck,
  jwtParse,
  upload.single("imageFile"),
  RestaurantController.createRestaurant
);

router.get(
  "/",
  jwtCheck,
  jwtParse,
  RestaurantController.getRestaurant
);

router.put(
  "/",
  jwtCheck,
  jwtParse,
  upload.single("imageFile"),
  RestaurantController.updateMyRestaurant
);

export default router;
