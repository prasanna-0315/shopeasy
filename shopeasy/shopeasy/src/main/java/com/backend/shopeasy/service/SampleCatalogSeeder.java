package com.backend.shopeasy.service;

import com.backend.shopeasy.model.Product;
import com.backend.shopeasy.repository.ProductRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@ConditionalOnProperty(name = "shopeasy.catalog.seed", havingValue = "true", matchIfMissing = true)
public class SampleCatalogSeeder implements ApplicationRunner {
    private record CatalogProduct(String name, String category, String description,
                                  double price, int stock) {
    }

    private static final List<CatalogProduct> PRODUCTS = List.of(
            new CatalogProduct("Wireless Headphones", "Electronics", "Over-ear wireless headphones with clear sound and all-day comfort.", 2499, 35),
            new CatalogProduct("Bluetooth Speaker", "Electronics", "Portable Bluetooth speaker with rich sound and splash resistance.", 1799, 42),
            new CatalogProduct("Smart Watch", "Electronics", "Smart watch with activity tracking, notifications and a bright display.", 3999, 25),
            new CatalogProduct("Laptop", "Electronics", "Lightweight laptop for work, study and everyday browsing.", 54999, 12),
            new CatalogProduct("Wireless Mouse", "Electronics", "Ergonomic wireless mouse with precise optical tracking.", 799, 60),
            new CatalogProduct("Keyboard", "Electronics", "Full-size keyboard with quiet keys and a comfortable layout.", 1299, 38),
            new CatalogProduct("Mobile Phone", "Electronics", "Unlocked smartphone with a vivid display and fast performance.", 18999, 20),
            new CatalogProduct("Power Bank", "Electronics", "Compact high-capacity power bank with USB-C charging.", 1499, 50),
            new CatalogProduct("Men's T-Shirt", "Fashion", "Soft cotton crew-neck T-shirt for everyday wear.", 699, 48),
            new CatalogProduct("Women's Dress", "Fashion", "Versatile, comfortable dress with a flattering everyday fit.", 1899, 22),
            new CatalogProduct("Jeans", "Fashion", "Classic denim jeans with a comfortable straight fit.", 1599, 30),
            new CatalogProduct("Sneakers", "Fashion", "Lightweight casual sneakers with cushioned soles.", 2499, 26),
            new CatalogProduct("Handbag", "Fashion", "Everyday handbag with practical compartments and a zip closure.", 2199, 18),
            new CatalogProduct("Coffee Maker", "Home & Kitchen", "Easy-to-use drip coffee maker for home brewing.", 3299, 15),
            new CatalogProduct("Mixer Grinder", "Home & Kitchen", "Powerful mixer grinder with durable stainless-steel jars.", 4499, 14),
            new CatalogProduct("Water Bottle", "Home & Kitchen", "Reusable insulated water bottle for hot or cold drinks.", 599, 75),
            new CatalogProduct("Table Lamp", "Home & Kitchen", "Warm, adjustable table lamp for bedside or desk lighting.", 1399, 28),
            new CatalogProduct("Storage Organizer", "Home & Kitchen", "Stackable storage organizer to keep household essentials tidy.", 899, 32),
            new CatalogProduct("Face Wash", "Beauty", "Gentle daily face wash for a fresh, clean feel.", 349, 55),
            new CatalogProduct("Sunscreen", "Beauty", "Lightweight broad-spectrum sunscreen for daily use.", 499, 44),
            new CatalogProduct("Moisturizer", "Beauty", "Daily moisturizer that leaves skin feeling soft and hydrated.", 549, 40),
            new CatalogProduct("Shampoo", "Beauty", "Gentle everyday shampoo for clean, refreshed hair.", 399, 46),
            new CatalogProduct("Programming in Java", "Books", "A practical introduction to Java programming fundamentals.", 799, 24),
            new CatalogProduct("Python Programming", "Books", "Hands-on Python lessons for beginners and curious developers.", 699, 27),
            new CatalogProduct("Data Structures and Algorithms", "Books", "Clear explanations and practice for core data structures and algorithms.", 999, 19),
            new CatalogProduct("Database Management Systems", "Books", "A student-friendly guide to database concepts and relational design.", 899, 17),
            new CatalogProduct("USB-C Fast Charger", "Electronics", "Compact fast charger with USB-C output for compatible devices.", 999, 40),
            new CatalogProduct("Android Tablet", "Electronics", "Versatile tablet for reading, streaming and everyday tasks.", 14999, 16),
            new CatalogProduct("Travel Backpack", "Fashion", "Lightweight backpack with organized storage for daily commutes and trips.", 1799, 23),
            new CatalogProduct("Running Shoes", "Fashion", "Comfortable running shoes with a cushioned sole and breathable upper.", 2899, 21),
            new CatalogProduct("Cotton Bedsheet Set", "Home & Kitchen", "Soft cotton bedsheet set with matching pillow covers.", 1599, 20),
            new CatalogProduct("Electric Kettle", "Home & Kitchen", "Quick-boil electric kettle with an automatic shut-off feature.", 1299, 18),
            new CatalogProduct("Desk Organizer", "Home & Kitchen", "Neat desktop organizer for stationery and everyday essentials.", 699, 34),
            new CatalogProduct("Nourishing Lip Balm", "Beauty", "Moisturizing lip balm for comfortable everyday wear.", 199, 60),
            new CatalogProduct("The Art of Focus", "Books", "A practical guide to building focus and more mindful daily routines.", 599, 22),
            new CatalogProduct("Everyday Sketchbook", "Books", "Portable sketchbook with quality paper for notes, ideas and drawing.", 349, 29)
    );

    private final ProductRepository productRepository;

    public SampleCatalogSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (CatalogProduct item : PRODUCTS) {
            if (!productRepository.existsByNameIgnoreCaseAndCategoryIgnoreCase(item.name(), item.category())) {
                productRepository.save(new Product(
                        item.name(),
                        item.description(),
                        item.price(),
                        item.category(),
                        imageFor(item.category()),
                        item.stock()
                ));
            }
        }
    }

    private String imageFor(String category) {
        return switch (category) {
            case "Electronics" -> "/product-images/electronics.svg";
            case "Fashion" -> "/product-images/fashion.svg";
            case "Home & Kitchen" -> "/product-images/home-kitchen.svg";
            case "Beauty" -> "/product-images/beauty.svg";
            default -> "/product-images/books.svg";
        };
    }
}
