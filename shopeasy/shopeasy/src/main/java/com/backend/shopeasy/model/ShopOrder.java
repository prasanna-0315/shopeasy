package com.backend.shopeasy.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shop_orders")
public class ShopOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal deliveryCharge;

    @Embedded
    private DeliveryAddress deliveryAddress;

    @Column(nullable = false, length = 30)
    private String paymentMethod;

    @Column(nullable = false, length = 30)
    private String paymentStatus;

    @Column(name = "order_status", nullable = false, length = 30)
    private String status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    protected ShopOrder() {
    }

    public ShopOrder(User user, LocalDateTime createdAt, BigDecimal totalAmount,
                     BigDecimal deliveryCharge,
                     DeliveryAddress deliveryAddress, String paymentMethod,
                     String paymentStatus, String status) {
        this.user = user;
        this.createdAt = createdAt;
        this.totalAmount = totalAmount;
        this.deliveryCharge = deliveryCharge;
        this.deliveryAddress = deliveryAddress;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.status = status;
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BigDecimal getDeliveryCharge() { return deliveryCharge; }
    public DeliveryAddress getDeliveryAddress() { return deliveryAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getStatus() { return status; }
    public List<OrderItem> getItems() { return items; }
    public void setStatus(String status) { this.status = status; }
}
