package com.backend.shopeasy.dto;

import com.backend.shopeasy.model.DeliveryAddress;
import com.backend.shopeasy.model.OrderItem;
import com.backend.shopeasy.model.ShopOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        LocalDateTime createdAt,
        BigDecimal totalAmount,
        BigDecimal deliveryCharge,
        String paymentMethod,
        String paymentStatus,
        String status,
        DeliveryAddress deliveryAddress,
        String customerEmail,
        List<Item> items) {

    public record Item(
            Long productId,
            String productName,
            String imageUrl,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal) {
    }

    public static OrderResponse from(ShopOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getCreatedAt(),
                order.getTotalAmount(),
                order.getDeliveryCharge(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getStatus(),
                order.getDeliveryAddress(),
                order.getUser().getEmail(),
                order.getItems().stream()
                        .map(OrderResponse::toItem)
                        .toList()
        );
    }

    private static Item toItem(OrderItem item) {
        return new Item(item.getProductId(), item.getProductName(), item.getImageUrl(),
                item.getQuantity(), item.getUnitPrice(), item.getSubtotal());
    }
}
