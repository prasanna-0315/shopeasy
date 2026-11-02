package com.backend.shopeasy.service;

import com.backend.shopeasy.dto.OrderResponse;
import com.backend.shopeasy.dto.PlaceOrderRequest;
import com.backend.shopeasy.model.DeliveryAddress;
import com.backend.shopeasy.model.OrderItem;
import com.backend.shopeasy.model.Product;
import com.backend.shopeasy.model.ShopOrder;
import com.backend.shopeasy.model.User;
import com.backend.shopeasy.repository.OrderRepository;
import com.backend.shopeasy.repository.ProductRepository;
import com.backend.shopeasy.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class OrderService {
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("999.00");
    private static final BigDecimal DELIVERY_CHARGE = new BigDecimal("49.00");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse placeOrder(String email, PlaceOrderRequest request) {
        if (!"COD".equalsIgnoreCase(request.paymentMethod().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only cash on delivery is currently available");
        }
        User user = findUser(email);
        Map<Long, Integer> quantities = new TreeMap<>();
        for (PlaceOrderRequest.OrderLineRequest line : request.items()) {
            quantities.merge(line.productId(), line.quantity(), Math::addExact);
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        var purchasedProducts = new TreeMap<Long, Product>();
        for (var entry : quantities.entrySet()) {
            Product product = productRepository.findByIdForUpdate(entry.getKey())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Product " + entry.getKey() + " was not found"));
            if (product.getStock() < entry.getValue()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Insufficient stock for " + product.getName());
            }
            purchasedProducts.put(entry.getKey(), product);
            subtotal = subtotal.add(BigDecimal.valueOf(product.getPrice())
                    .multiply(BigDecimal.valueOf(entry.getValue())));
        }

        BigDecimal deliveryCharge = subtotal.compareTo(FREE_DELIVERY_THRESHOLD) >= 0
                ? BigDecimal.ZERO : DELIVERY_CHARGE;
        ShopOrder order = new ShopOrder(
                user,
                LocalDateTime.now(),
                subtotal.add(deliveryCharge),
                deliveryCharge,
                toAddress(request.address()),
                "COD",
                "UNPAID",
                "PENDING"
        );

        for (var entry : quantities.entrySet()) {
            Product product = purchasedProducts.get(entry.getKey());
            int quantity = entry.getValue();
            product.setStock(product.getStock() - quantity);
            BigDecimal unitPrice = BigDecimal.valueOf(product.getPrice());
            order.addItem(new OrderItem(product.getId(), product.getName(), product.getImageUrl(),
                    quantity, unitPrice, unitPrice.multiply(BigDecimal.valueOf(quantity))));
        }
        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String email) {
        User user = findUser(email);
        return orderRepository.findAllByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(String email, Long orderId) {
        User user = findUser(email);
        return orderRepository.findByIdAndUser_Id(orderId, user.getId())
                .map(OrderResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Transactional
    public OrderResponse cancelMyOrder(String email, Long orderId) {
        User user = findUser(email);
        ShopOrder order = orderRepository.findForUpdateByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!"PENDING".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only pending orders can be cancelled");
        }
        restoreStock(order);
        order.setStatus("CANCELLED");
        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(OrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderForAdmin(Long orderId) {
        return orderRepository.findById(orderId)
                .map(OrderResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String requestedStatus) {
        String status = requestedStatus == null ? "" : requestedStatus.trim().toUpperCase();
        if (!List.of("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported order status");
        }
        ShopOrder order = orderRepository.findForUpdateById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if ("CANCELLED".equals(order.getStatus()) || "DELIVERED".equals(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A cancelled or delivered order cannot be changed");
        }
        if ("CANCELLED".equals(status)) {
            restoreStock(order);
        }
        if (!isAllowedTransition(order.getStatus(), status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Order status cannot move from " + order.getStatus() + " to " + status);
        }
        order.setStatus(status);
        return OrderResponse.from(order);
    }

    private boolean isAllowedTransition(String current, String requested) {
        return switch (current) {
            case "PENDING" -> List.of("CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED").contains(requested);
            case "CONFIRMED" -> List.of("SHIPPED", "DELIVERED", "CANCELLED").contains(requested);
            case "SHIPPED" -> "DELIVERED".equals(requested);
            default -> false;
        };
    }

    private void restoreStock(ShopOrder order) {
        for (OrderItem item : order.getItems()) {
            productRepository.findByIdForUpdate(item.getProductId())
                    .ifPresent(product -> product.setStock(product.getStock() + item.getQuantity()));
        }
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Authenticated user was not found"));
    }

    private DeliveryAddress toAddress(PlaceOrderRequest.AddressRequest address) {
        return new DeliveryAddress(address.customerName().trim(), address.email().trim().toLowerCase(),
                address.phone().trim(), address.building().trim(), address.street().trim(),
                address.city().trim(), address.state().trim(), address.pinCode().trim());
    }
}
