import app, { init } from "@/app";
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import { cleanDb, generateValidToken } from "../helpers";
import {
  createUser,
  createHotel,
  createEnrollmentWithAddress,
  createTicketForHotel,
  createTicketTypeForHotel,
  createRoom
} from "../factories";

const server = supertest(app);

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe("GET /tickets", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and hotel data when user has a ticket paid with hotel included", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      await createHotel();
      const ticketTypePaidWithHotel = await createTicketTypeForHotel(false, true);
      await createTicketForHotel(enrollment.id, ticketTypePaidWithHotel.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          })
        ])
      );
    });

    it("should respond with status 400 and without any data if has no ticket paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      await createHotel();
      const ticketTypePaidWithHotel = await createTicketTypeForHotel(false, true);
      await createTicketForHotel(enrollment.id, ticketTypePaidWithHotel.id, "RESERVED");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.text).toBe("user needs to pay the ticket");
    });

    it("should respond with status 400 and without any data if has a paid ticket type remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      await createHotel();
      const ticketTypePaidWithHotel = await createTicketTypeForHotel(true, false);
      await createTicketForHotel(enrollment.id, ticketTypePaidWithHotel.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.text).toBe("ticket is remote");
    });

    it("should respond with status 400 and without any data if has ticket paid without hotel included", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      await createHotel();
      const ticketTypePaidWithHotel = await createTicketTypeForHotel(false, false);
      await createTicketForHotel(enrollment.id, ticketTypePaidWithHotel.id, "PAID");

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.text).toBe("ticket do not include hotel");
    });
  });
});

describe("GET /tickets/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const hotelId = 1;
    const response = await server.get(`/hotels/${hotelId}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const hotelId = 1;
    const token = faker.lorem.word();

    const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with 200 and hotel data and rooms data", async () => {
      const hotel = await createHotel();
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      const room = await createRoom(hotel.id);
      const ticketTypePaidWithHotel = await createTicketTypeForHotel(false, true);
      await createTicketForHotel(enrollment.id, ticketTypePaidWithHotel.id, "PAID");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
            
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([{
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [{
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        }]
      }]);
    });

    it("should respond with status 400 and without any data if has no ticket paid", async () => {
      const hotel = await createHotel();
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      await createRoom(hotel.id);
      const ticketTypePaidWithHotel = await createTicketTypeForHotel(false, true);
      await createTicketForHotel(enrollment.id, ticketTypePaidWithHotel.id, "RESERVED");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.text).toBe("user needs to pay the ticket");
    });

    it("should respond with status 400 and without any data if has a paid ticket type remote", async () => {
      const hotel = await createHotel();
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      await createRoom(hotel.id);
      const ticketTypePaidWithHotel = await createTicketTypeForHotel(true, false);
      await createTicketForHotel(enrollment.id, ticketTypePaidWithHotel.id, "PAID");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.text).toBe("ticket is remote");
    });

    it("should respond with status 400 and without any data if has ticket paid without hotel included", async () => {
      const hotel = await createHotel();
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      await createRoom(hotel.id);
      const ticketTypePaidWithHotel = await createTicketTypeForHotel(false, false);
      await createTicketForHotel(enrollment.id, ticketTypePaidWithHotel.id, "PAID");

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
      expect(response.text).toBe("ticket do not include hotel");
    });

    it("should respond with status 404 if hotel is not found", async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const token = await generateValidToken(user);
      const ticketTypePaidWithHotel = await createTicketTypeForHotel(false, true);
      await createTicketForHotel(enrollment.id, ticketTypePaidWithHotel.id, "PAID");

      const response = await server.get("/hotels/4").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.text).toBe("cannot find hotel");
    });
  });    
});
