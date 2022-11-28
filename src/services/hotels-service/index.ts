import hotelRepository from "@/repositories/hotels-service";

async function findAllHotels() {
  return await hotelRepository.findHotels();
}

async function findRooms(hotelId: number) {
  return await hotelRepository.findRooms(hotelId);
}

const hotelServices = {
  findAllHotels,
  findRooms
};

export default hotelServices;
