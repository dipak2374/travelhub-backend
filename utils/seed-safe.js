import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Flight from '../models/Flight.js';
import Route from '../models/Route.js';
import Bus from '../models/Bus.js';
import Car from '../models/Car.js';
import Tour from '../models/Tour.js';
import Coupon from '../models/Coupon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdminIfMissing = async () => {
  const adminExists = await User.exists({ role: 'admin' });
  if (adminExists) {
    console.log('Admin user already exists; skipping admin creation.');
    return;
  }

  await User.create({
    name: 'Admin User',
    email: 'admin@travelhub.com',
    password: 'admin123',
    phone: '+10000000000',
    role: 'admin',
    isVerified: true,
  });
  console.log('Admin user created: admin@travelhub.com / admin123');
};

const createHotelsIfEmpty = async (agencyId) => {
  const count = await Hotel.countDocuments();
  if (count > 0) {
    console.log('Hotels already exist; skipping hotel seed.');
    return;
  }

  await Hotel.insertMany([
    {
      name: 'Oceanview Resort & Spa',
      description: 'Luxury beachfront resort with world-class amenities, infinity pools, and stunning ocean views.',
      location: { address: '1 Beach Road', city: 'Maldives', country: 'Maldives', coordinates: { lat: 3.2028, lng: 73.2207 } },
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
      amenities: ['Pool', 'Spa', 'WiFi', 'Restaurant', 'Bar & Lounge', 'Beach Access'],
      starRating: 5,
      pricePerNight: 450,
      totalRooms: 50,
      availableRooms: 42,
      owner: agencyId,
      isApproved: true,
      averageRating: 4.8,
      reviewCount: 124,
    },
    {
      name: 'Grand Plaza Hotel',
      description: 'Elegant city hotel in the heart of downtown with modern rooms and rooftop dining.',
      location: { address: '500 Main Street', city: 'New York', country: 'USA', coordinates: { lat: 40.7128, lng: -74.006 } },
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
      amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar & Lounge', 'Parking', 'Room Service'],
      starRating: 4,
      pricePerNight: 189,
      totalRooms: 120,
      availableRooms: 85,
      owner: agencyId,
      isApproved: true,
      averageRating: 4.5,
      reviewCount: 89,
    },
    {
      name: 'Alpine Lodge',
      description: 'Cozy mountain retreat perfect for ski enthusiasts and nature lovers.',
      location: { address: 'Alpine Way 7', city: 'Zermatt', country: 'Switzerland', coordinates: { lat: 46.0207, lng: 7.7491 } },
      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
      amenities: ['Fireplace', 'Ski Storage', 'Sauna', 'Restaurant'],
      starRating: 4,
      pricePerNight: 320,
      totalRooms: 30,
      availableRooms: 18,
      owner: agencyId,
      isApproved: true,
      averageRating: 4.7,
      reviewCount: 56,
    },
  ]);

  console.log('Seeded sample hotels.');
};

const createFlightsIfEmpty = async (airlineId) => {
  const count = await Flight.countDocuments();
  if (count > 0) {
    console.log('Flights already exist; skipping flight seed.');
    return;
  }

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await Flight.insertMany([
    {
      flightNumber: 'SW-101',
      airline: 'SkyWings Airlines',
      origin: { city: 'New York', airport: 'JFK', code: 'JFK' },
      destination: { city: 'London', airport: 'Heathrow', code: 'LHR' },
      departureTime: new Date(nextWeek.setHours(8, 0)),
      arrivalTime: new Date(nextWeek.setHours(20, 30)),
      duration: 450,
      price: { economy: 599, business: 1899, firstClass: 4500 },
      totalSeats: 200,
      availableSeats: 156,
      owner: airlineId,
      isApproved: true,
      averageRating: 4.3,
    },
    {
      flightNumber: 'SW-205',
      airline: 'SkyWings Airlines',
      origin: { city: 'Dubai', airport: 'DXB', code: 'DXB' },
      destination: { city: 'Singapore', airport: 'Changi', code: 'SIN' },
      departureTime: new Date(nextWeek.setHours(14, 0)),
      arrivalTime: new Date(nextWeek.setHours(22, 0)),
      duration: 420,
      price: { economy: 399, business: 1299, firstClass: 3200 },
      totalSeats: 180,
      availableSeats: 120,
      owner: airlineId,
      isApproved: true,
      averageRating: 4.6,
    },
  ]);

  console.log('Seeded sample flights.');
};

const createBusesIfEmpty = async (busOpId) => {
  const count = await Bus.countDocuments();
  if (count > 0) {
    console.log('Buses already exist; skipping bus seed.');
    return;
  }

  const route1 = await Route.findOne({ origin: /New York/i, destination: /Boston/i })
    || await Route.create({ origin: 'New York', destination: 'Boston', distance: 346, duration: 240, owner: busOpId });
  const route2 = await Route.findOne({ origin: /Los Angeles/i, destination: /San Francisco/i })
    || await Route.create({ origin: 'Los Angeles', destination: 'San Francisco', distance: 615, duration: 420, owner: busOpId });

  await Bus.insertMany([
    {
      busNumber: 'EB-001',
      operator: 'Express Bus Co',
      route: route1._id,
      departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      busType: 'Luxury',
      totalSeats: 40,
      availableSeats: 28,
      price: 45,
      amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'],
      owner: busOpId,
      isApproved: true,
      averageRating: 4.2,
    },
    {
      busNumber: 'EB-002',
      operator: 'Express Bus Co',
      route: route2._id,
      departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 7.5 * 60 * 60 * 1000),
      arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 14.5 * 60 * 60 * 1000),
      busType: 'Sleeper',
      totalSeats: 30,
      availableSeats: 15,
      price: 65,
      amenities: ['WiFi', 'AC', 'Blanket', 'Water Bottle'],
      owner: busOpId,
      isApproved: true,
      averageRating: 4.4,
    },
  ]);

  console.log('Seeded sample buses.');
};

const createCarsIfEmpty = async (carPartnerId) => {
  const count = await Car.countDocuments();
  if (count > 0) {
    console.log('Cars already exist; skipping car seed.');
    return;
  }

  await Car.insertMany([
    {
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      category: 'Economy',
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      seats: 5,
      pricePerDay: 45,
      images: ['https://images.unsplash.com/photo-1621007947382-b9043dad5704?w=800'],
      features: ['GPS', 'Bluetooth', 'Backup Camera'],
      location: { city: 'New York', address: 'JFK Airport' },
      owner: carPartnerId,
      isApproved: true,
      averageRating: 4.5,
    },
    {
      make: 'BMW',
      model: 'X5',
      year: 2024,
      category: 'SUV',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      seats: 7,
      pricePerDay: 120,
      images: ['https://images.unsplash.com/photo-1555215695-3004980adade?w=800'],
      features: ['GPS', 'Leather Seats', 'Sunroof', 'Premium Sound'],
      location: { city: 'Los Angeles', address: 'LAX Airport' },
      owner: carPartnerId,
      isApproved: true,
      averageRating: 4.8,
    },
  ]);

  console.log('Seeded sample cars.');
};

const createToursIfEmpty = async (agencyId) => {
  const count = await Tour.countDocuments();
  if (count > 0) {
    console.log('Tours already exist; skipping tour seed.');
    return;
  }

  await Tour.insertMany([
    {
      title: 'Swiss Alps Adventure',
      description: '7-day guided tour through the breathtaking Swiss Alps with hiking, cable car rides, and village visits.',
      destination: 'Switzerland',
      duration: 7,
      price: 2499,
      maxGroupSize: 15,
      images: ['https://images.unsplash.com/photo-1530122037263-a5f1f91d3b99?w=800'],
      itinerary: [
        { day: 1, title: 'Arrival in Zurich', description: 'Welcome dinner and orientation' },
        { day: 2, title: 'Interlaken', description: 'Boat cruise on Lake Thun' },
        { day: 3, title: 'Jungfraujoch', description: 'Top of Europe excursion' },
      ],
      inclusions: ['Hotels', 'Breakfast', 'Guide', 'Transport'],
      exclusions: ['Flights', 'Personal expenses'],
      owner: agencyId,
      isApproved: true,
      averageRating: 4.9,
      reviewCount: 45,
    },
    {
      title: 'Bali Paradise Escape',
      description: '5-day tropical getaway featuring temples, rice terraces, and pristine beaches.',
      destination: 'Bali, Indonesia',
      duration: 5,
      price: 1299,
      maxGroupSize: 20,
      images: ['https://images.unsplash.com/photo-1537996194471-f297763fd423?w=800'],
      itinerary: [
        { day: 1, title: 'Ubud', description: 'Monkey Forest and art markets' },
        { day: 2, title: 'Tegallalang', description: 'Rice terrace trekking' },
      ],
      inclusions: ['Resort stay', 'Meals', 'Activities'],
      exclusions: ['Flights', 'Visa'],
      owner: agencyId,
      isApproved: true,
      averageRating: 4.7,
      reviewCount: 78,
    },
  ]);

  console.log('Seeded sample tours.');
};

const createCouponsIfEmpty = async (adminId) => {
  const count = await Coupon.countDocuments();
  if (count > 0) {
    console.log('Coupons already exist; skipping coupon seed.');
    return;
  }

  await Coupon.insertMany([
    {
      code: 'WELCOME20',
      description: '20% off your first booking',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscount: 100,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      applicableTypes: ['all'],
      createdBy: adminId,
    },
    {
      code: 'FLIGHT50',
      description: '$50 off flight bookings',
      discountType: 'fixed',
      discountValue: 50,
      minOrderAmount: 200,
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      applicableTypes: ['flight'],
      createdBy: adminId,
    },
  ]);

  console.log('Seeded sample coupons.');
};

const seedSafe = async () => {
  try {
    await connectDB();

    const adminUser = await User.findOne({ role: 'admin' });
    const agency = await User.findOne({ role: 'travel_agency' });
    const airline = await User.findOne({ role: 'airline_partner' });
    const busOp = await User.findOne({ role: 'bus_operator' });
    const carPartner = await User.findOne({ role: 'car_rental_partner' });

    if (!adminUser) {
      await createAdminIfMissing();
    } else {
      console.log('Admin user exists.');
    }

    const adminId = (adminUser || await User.findOne({ role: 'admin' }))._id;

    const defaultAgency = agency || await User.create({
      name: 'Wanderlust Travels',
      email: 'agency@travelhub.com',
      password: 'agency123',
      role: 'travel_agency',
      isVerified: true,
      agencyProfile: {
        companyName: 'Wanderlust Travels',
        licenseNumber: 'TA-2024-001',
        description: 'Premium travel agency specializing in luxury tours and hotels.',
        address: '123 Travel Street, New York',
        isApproved: true,
      },
    });

    const defaultAirline = airline || await User.create({
      name: 'SkyWings Airlines',
      email: 'airline@travelhub.com',
      password: 'airline123',
      role: 'airline_partner',
      isVerified: true,
      partnerProfile: { companyName: 'SkyWings Airlines', isApproved: true },
    });

    const defaultBusOp = busOp || await User.create({
      name: 'Express Bus Co',
      email: 'bus@travelhub.com',
      password: 'bus123',
      role: 'bus_operator',
      isVerified: true,
      partnerProfile: { companyName: 'Express Bus Co', isApproved: true },
    });

    const defaultCarPartner = carPartner || await User.create({
      name: 'DriveEasy Rentals',
      email: 'car@travelhub.com',
      password: 'car123',
      role: 'car_rental_partner',
      isVerified: true,
      partnerProfile: { companyName: 'DriveEasy Rentals', isApproved: true },
    });

    await createHotelsIfEmpty(defaultAgency._id);
    await createFlightsIfEmpty(defaultAirline._id);
    await createBusesIfEmpty(defaultBusOp._id);
    await createCarsIfEmpty(defaultCarPartner._id);
    await createToursIfEmpty(defaultAgency._id);
    await createCouponsIfEmpty(adminId);

    console.log('\n✅ Safe seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Safe seed error:', error);
    process.exit(1);
  }
};

seedSafe();
