import { prisma } from "@/config";

function findHotels() {
  return prisma.hotel.findMany();
}

function findRooms(id: number) {
  return prisma.hotel.findMany({
    where: { id: id },
    include: {
      Rooms: true,
    }
  });
}

const hotelRepository = {
  findHotels,
  findRooms
};

export default hotelRepository;
