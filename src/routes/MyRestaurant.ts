import express from "express";
import multer from "multer";
import RestaurantController from "../controller/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { verifyAccessToken } from "../middleware/auth.middleware";
import { handleUpload } from "../middleware/upload";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
});

router.post(
  "/",
  verifyAccessToken,
  // upload.single("imageFile"),
  handleUpload,
  RestaurantController.createRestaurant
);

router.get(
  "/",
  verifyAccessToken,
  RestaurantController.getRestaurant
);

router.put(
  "/update/:id",
  verifyAccessToken,
  upload.single("imageFile"),
  RestaurantController.updateMyRestaurant
);

router.get(
  "/orders",
  jwtCheck,
  jwtParse,
  RestaurantController.getMyRestaurantOrder
);

router.delete(
  "/",
  verifyAccessToken,
  RestaurantController.removeRestaurant
)

router.delete(
  "/multi",
  verifyAccessToken,
  RestaurantController.removeMultiRestaurant
)

router.post(
  "/search",
  verifyAccessToken,
  RestaurantController.searchRestaurant
)

router.get(
  "/:id",
  verifyAccessToken,
  RestaurantController.restaurantFindById
)



export default router;
 