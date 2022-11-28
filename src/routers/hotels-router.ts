import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels, getSHotelById } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/:hotelId", getSHotelById);

export { hotelsRouter };
