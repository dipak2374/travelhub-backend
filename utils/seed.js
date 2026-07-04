import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Flight from '../models/Flight.js';
import Route from '../models/Route.js';
import Bus from '../models/Bus.js';
import Car from '../models/Car.js';
import Tour from '../models/Tour.js';
import Coupon from '../models/Coupon.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany(), Hotel.deleteMany(), Flight.deleteMany(),
      Route.deleteMany(), Bus.deleteMany(), Car.deleteMany(),
      Tour.deleteMany(), Coupon.deleteMany(),
    ]);

    console.log('Creating users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@travelhub.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    });

    const agency = await User.create({
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

    const airline = await User.create({
      name: 'SkyWings Airlines',
      email: 'airline@travelhub.com',
      password: 'airline123',
      role: 'airline_partner',
      isVerified: true,
      partnerProfile: { companyName: 'SkyWings Airlines', isApproved: true },
    });

    const busOp = await User.create({
      name: 'Express Bus Co',
      email: 'bus@travelhub.com',
      password: 'bus123',
      role: 'bus_operator',
      isVerified: true,
      partnerProfile: { companyName: 'Express Bus Co', isApproved: true },
    });

    const carPartner = await User.create({
      name: 'DriveEasy Rentals',
      email: 'car@travelhub.com',
      password: 'car123',
      role: 'car_rental_partner',
      isVerified: true,
      partnerProfile: { companyName: 'DriveEasy Rentals', isApproved: true },
    });

    const customer = await User.create({
      name: 'John Doe',
      email: 'customer@travelhub.com',
      password: 'customer123',
      role: 'customer',
      isVerified: true,
      phone: '+1-555-0100',
    });

    console.log('Creating hotels...');
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
        owner: agency._id,
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
        owner: agency._id,
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
        owner: agency._id,
        isApproved: true,
        averageRating: 4.7,
        reviewCount: 56,
      },
    ]);

    console.log('Creating flights...');
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
        owner: airline._id,
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
        owner: airline._id,
        isApproved: true,
        averageRating: 4.6,
      },
    ]);

    console.log('Creating routes and buses...');
    const route1 = await Route.create({
      origin: 'New York',
      destination: 'Boston',
      distance: 346,
      duration: 240,
      owner: busOp._id,
    });

    const route2 = await Route.create({
      origin: 'Los Angeles',
      destination: 'San Francisco',
      distance: 615,
      duration: 420,
      owner: busOp._id,
    });

    await Bus.insertMany([
      {
        busNumber: 'EB-001',
        operator: 'Express Bus Co',
        route: route1._id,
        departureTime: new Date(nextWeek.setHours(6, 0)),
        arrivalTime: new Date(nextWeek.setHours(10, 0)),
        busType: 'Luxury',
        totalSeats: 40,
        availableSeats: 28,
        price: 45,
        amenities: ['WiFi', 'AC', 'USB Charging', 'Reclining Seats'],
        owner: busOp._id,
        isApproved: true,
        averageRating: 4.2,
      },
      {
        busNumber: 'EB-002',
        operator: 'Express Bus Co',
        route: route2._id,
        departureTime: new Date(nextWeek.setHours(7, 30)),
        arrivalTime: new Date(nextWeek.setHours(14, 30)),
        busType: 'Sleeper',
        totalSeats: 30,
        availableSeats: 15,
        price: 65,
        amenities: ['WiFi', 'AC', 'Blanket', 'Water Bottle'],
        owner: busOp._id,
        isApproved: true,
        averageRating: 4.4,
      },
    ]);

    console.log('Creating cars...');
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
        owner: carPartner._id,
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
        owner: carPartner._id,
        isApproved: true,
        averageRating: 4.8,
      },
    ]);

    console.log('Creating tours...');
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
        owner: agency._id,
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
        owner: agency._id,
        isApproved: true,
        averageRating: 4.7,
        reviewCount: 78,
      },
    ]);

    console.log('Creating coupons...');
    await Coupon.insertMany([
      {
        code: 'WELCOME20',
        description: '20% off your first booking',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 100,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        applicableTypes: ['all'],
        createdBy: admin._id,
      },
      {
        code: 'FLIGHT50',
        description: '$50 off flight bookings',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 200,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        applicableTypes: ['flight'],
        createdBy: admin._id,
      },
    ]);

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Demo accounts:');
    console.log('  Admin:    admin@travelhub.com / admin123');
    console.log('  Customer: customer@travelhub.com / customer123');
    console.log('  Agency:   agency@travelhub.com / agency123');
    console.log('  Airline:  airline@travelhub.com / airline123');
    console.log('  Bus:      bus@travelhub.com / bus123');
    console.log('  Car:      car@travelhub.com / car123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
