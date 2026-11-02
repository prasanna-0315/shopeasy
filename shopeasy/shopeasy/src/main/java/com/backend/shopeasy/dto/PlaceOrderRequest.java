package com.backend.shopeasy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record PlaceOrderRequest(
        @NotEmpty List<@Valid OrderLineRequest> items,
        @NotNull @Valid AddressRequest address,
        @NotBlank String paymentMethod) {

    public record OrderLineRequest(
            @NotNull @Positive Long productId,
            @Positive int quantity) {
    }

    public record AddressRequest(
            @NotBlank String customerName,
            @NotBlank @Email String email,
            @NotBlank @Pattern(regexp = "^[0-9+() -]{7,20}$") String phone,
            @NotBlank String building,
            @NotBlank String street,
            @NotBlank String city,
            @NotBlank String state,
            @NotBlank @Pattern(regexp = "^[0-9]{6}$") String pinCode) {
    }
}
