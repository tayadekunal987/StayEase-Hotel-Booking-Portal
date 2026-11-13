package com.stayease.config;

import com.stayease.entity.Hotel;
import com.stayease.entity.HotelAmenity;
import com.stayease.entity.Room;
import com.stayease.repository.HotelRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Seeds the database with sample hotel, room, and amenity data on first startup.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final HotelRepository hotelRepository;

    public DataInitializer(HotelRepository hotelRepository) {
        this.hotelRepository = hotelRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        long currentCount = hotelRepository.count();
        if (currentCount >= 5) {
            log.info("Database already seeded with {} hotels. Skipping data initialisation.", currentCount);
            return;
        }

        log.info("Seeding database with sample hotel data...");
        if (currentCount == 0) {
            seedGrandPalaceMumbai();
            seedOceanBreezeGoa();
            seedHeritageHaveliJaipur();
            seedMountainSerenityShimla();
        }
        seedRoyalOrchidBengaluru();
        log.info("Database seeding complete. {} hotels now available.", hotelRepository.count());
    }

    private void seedRoyalOrchidBengaluru() {
        Hotel hotel = createHotel(
                "Royal Orchid Suites",
                "Bengaluru",
                "Indiranagar, 100 Feet Road, Bengaluru, Karnataka 560038",
                "Located in the vibrant heart of Indiranagar, Royal Orchid Suites offers contemporary luxury for discerning travelers. Featuring spacious suites, award-winning international dining, and state-of-the-art wellness facilities.",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
                new BigDecimal("4.8")
        );
        addAmenity(hotel, "Free WiFi");
        addAmenity(hotel, "Rooftop Pool");
        addAmenity(hotel, "Executive Business Lounge");
        addAmenity(hotel, "24-Hour Fitness Centre");
        addAmenity(hotel, "Pan-Asian Restaurant");
        addAmenity(hotel, "Airport Chauffeur Service");
        addRoom(hotel, "Club Suite", new BigDecimal("7500.00"), 8);
        addRoom(hotel, "Presidential Suite", new BigDecimal("18000.00"), 2);
        hotelRepository.save(hotel);
    }

    private void seedGrandPalaceMumbai() {
        Hotel hotel = createHotel(
                "The Grand Palace",
                "Mumbai",
                "Marine Lines, Mumbai, Maharashtra 400002",
                "Experience the pinnacle of luxury at The Grand Palace, Mumbai's most iconic five-star hotel. " +
                "Located steps from Marine Drive, the hotel blends colonial heritage with contemporary elegance. " +
                "Enjoy world-class dining, an award-winning spa, and panoramic views of the Arabian Sea.",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
                new BigDecimal("5.0")
        );
        addAmenity(hotel, "Free WiFi");
        addAmenity(hotel, "Swimming Pool");
        addAmenity(hotel, "Luxury Spa");
        addAmenity(hotel, "Fine Dining Restaurant");
        addAmenity(hotel, "Fitness Centre");
        addAmenity(hotel, "24-Hour Concierge");
        addAmenity(hotel, "Airport Transfer");
        addAmenity(hotel, "Valet Parking");
        addRoom(hotel, "Deluxe Room", new BigDecimal("8000.00"), 5);
        addRoom(hotel, "Executive Suite", new BigDecimal("15000.00"), 2);
        hotelRepository.save(hotel);
    }

    private void seedOceanBreezeGoa() {
        Hotel hotel = createHotel(
                "Ocean Breeze Resort",
                "Goa",
                "Calangute Beach Road, North Goa, Goa 403516",
                "Wake up to the sound of waves at Ocean Breeze Resort, a tropical paradise nestled along " +
                "Goa's most beloved beach. Lush gardens, a beachfront pool, and vibrant beach shacks " +
                "make this the perfect getaway for sun-seekers and adventure lovers alike.",
                "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
                new BigDecimal("4.5")
        );
        addAmenity(hotel, "Free WiFi");
        addAmenity(hotel, "Beachfront Access");
        addAmenity(hotel, "Infinity Pool");
        addAmenity(hotel, "Beach Bar & Restaurant");
        addAmenity(hotel, "Water Sports");
        addAmenity(hotel, "Yoga Deck");
        addRoom(hotel, "Garden Room", new BigDecimal("5000.00"), 10);
        addRoom(hotel, "Sea View Deluxe", new BigDecimal("9000.00"), 5);
        hotelRepository.save(hotel);
    }

    private void seedHeritageHaveliJaipur() {
        Hotel hotel = createHotel(
                "Heritage Haveli",
                "Jaipur",
                "Old City, Near Hawa Mahal, Jaipur, Rajasthan 302002",
                "Step into Rajasthan's royal past at Heritage Haveli, a meticulously restored 18th-century " +
                "mansion in the heart of the Pink City. Intricate frescoes, courtyard fountains, and " +
                "traditional Rajasthani cuisine transport you to a bygone era of regal splendour.",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
                new BigDecimal("4.0")
        );
        addAmenity(hotel, "Free WiFi");
        addAmenity(hotel, "Rooftop Restaurant");
        addAmenity(hotel, "Heritage Tours");
        addAmenity(hotel, "Courtyard Pool");
        addAmenity(hotel, "Ayurvedic Spa");
        addAmenity(hotel, "Cultural Performances");
        addRoom(hotel, "Heritage Room", new BigDecimal("6000.00"), 8);
        addRoom(hotel, "Royal Suite", new BigDecimal("12000.00"), 3);
        hotelRepository.save(hotel);
    }

    private void seedMountainSerenityShimla() {
        Hotel hotel = createHotel(
                "Mountain Serenity",
                "Shimla",
                "Jakhu Hill, Shimla, Himachal Pradesh 171001",
                "Breathe in the crisp Himalayan air at Mountain Serenity, a boutique hill retreat perched " +
                "above the charming town of Shimla. With breathtaking valley views, forest walks, and a " +
                "cozy fireplace lounge, this is the ideal escape from city life.",
                "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
                new BigDecimal("4.0")
        );
        addAmenity(hotel, "Free WiFi");
        addAmenity(hotel, "Valley View Terrace");
        addAmenity(hotel, "Mountain Restaurant");
        addAmenity(hotel, "Bonfire Area");
        addAmenity(hotel, "Guided Trekking");
        addAmenity(hotel, "Board Games Lounge");
        addRoom(hotel, "Cozy Room", new BigDecimal("4000.00"), 12);
        addRoom(hotel, "Mountain View Suite", new BigDecimal("8000.00"), 4);
        hotelRepository.save(hotel);
    }

    private Hotel createHotel(String name, String city, String address,
                               String description, String imageUrl, BigDecimal starRating) {
        Hotel hotel = new Hotel();
        hotel.setName(name);
        hotel.setCity(city);
        hotel.setAddress(address);
        hotel.setDescription(description);
        hotel.setImageUrl(imageUrl);
        hotel.setStarRating(starRating);
        return hotel;
    }

    private void addAmenity(Hotel hotel, String name) {
        HotelAmenity amenity = new HotelAmenity();
        amenity.setHotel(hotel);
        amenity.setAmenityName(name);
        hotel.getAmenities().add(amenity);
    }

    private void addRoom(Hotel hotel, String category, BigDecimal pricePerNight, int capacity) {
        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomCategory(category);
        room.setPricePerNight(pricePerNight);
        room.setTotalCapacity(capacity);
        hotel.getRooms().add(room);
    }
}
