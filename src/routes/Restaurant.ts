import express from "express";
import RestaurantController from "../controller/RestaurantController";
import { param } from "express-validator";
const router = express.Router();

router.get(
  "/search/:city",
  param("city")
    .trim()
    .isString()
    .notEmpty()
    .withMessage("City muse be a valid string"),
  RestaurantController.searchRestaurant
);

router.get("/search/restaurant/:id", RestaurantController.getRestaurantDetail);

router.get("/all",RestaurantController.getAllRestaurant)

export default router;
