package com.backend.shopeasy.controller;

import com.backend.shopeasy.dto.OrderResponse;
import com.backend.shopeasy.dto.PlaceOrderRequest;
import com.backend.shopeasy.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(@AuthenticationPrincipal String email,
                                    @Valid @RequestBody PlaceOrderRequest request) {
        return orderService.placeOrder(email, request);
    }

    @GetMapping("/my-orders")
    public List<OrderResponse> myOrders(@AuthenticationPrincipal String email) {
        return orderService.getMyOrders(email);
    }

    @GetMapping("/{id}")
    public OrderResponse orderDetails(@AuthenticationPrincipal String email, @PathVariable Long id) {
        return orderService.getMyOrder(email, id);
    }

    @PutMapping("/{id}/cancel")
    public OrderResponse cancelOrder(@AuthenticationPrincipal String email, @PathVariable Long id) {
        return orderService.cancelMyOrder(email, id);
    }

    @GetMapping("/admin/all")
    public List<OrderResponse> allOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/admin/{id}")
    public OrderResponse adminOrderDetails(@PathVariable Long id) {
        return orderService.getOrderForAdmin(id);
    }

    @PutMapping("/admin/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id,
                                      @RequestBody Map<String, String> request) {
        return orderService.updateOrderStatus(id, request.get("status"));
    }
}
