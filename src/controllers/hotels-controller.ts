import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import hotelServices from "@/services/hotels-service";
import ticketService from "@/services/tickets-service";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const userTicket = await ticketService.getTicketByUserId(userId);

    if(userTicket.status !== "PAID") {
      return res.status(httpStatus.BAD_REQUEST).send("user needs to pay the ticket");
    }
        
    if(userTicket.TicketType.isRemote === true) {
      return res.status(httpStatus.BAD_REQUEST).send("ticket is remote");
    }
        
    if(userTicket.TicketType.includesHotel === false) {
      return res.status(httpStatus.BAD_REQUEST).send("ticket do not include hotel");
    }        

    const hotels = await hotelServices.findAllHotels();
        
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.status(httpStatus.NOT_FOUND).send("user has no tickets");
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("server error");
  }
}

export async function getSHotelById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params;

  try {
    const userTicket = await ticketService.getTicketByUserId(userId);

    if(userTicket.status !== "PAID") {
      return res.status(httpStatus.BAD_REQUEST).send("user needs to pay the ticket");
    }
        
    if(userTicket.TicketType.isRemote === true) {
      return res.status(httpStatus.BAD_REQUEST).send("ticket is remote");
    }
        
    if(userTicket.TicketType.includesHotel === false) {
      return res.status(httpStatus.BAD_REQUEST).send("ticket do not include hotel");
    }        

    const rooms = await hotelServices.findRooms(Number(hotelId));
        
    if(rooms.length === 0) {
      return res.status(httpStatus.NOT_FOUND).send("cannot find hotel");  
    }
        
    return res.status(httpStatus.OK).send(rooms);
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).send("sadness");
  }
}
