package com.backend.shopeasy.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class DeliveryAddress {
    private String customerName;
    private String email;
    private String phone;
    private String building;
    private String street;
    private String city;
    private String state;
    private String pinCode;

    protected DeliveryAddress() {
    }

    public DeliveryAddress(String customerName, String email, String phone, String building,
                           String street, String city, String state, String pinCode) {
        this.customerName = customerName;
        this.email = email;
        this.phone = phone;
        this.building = building;
        this.street = street;
        this.city = city;
        this.state = state;
        this.pinCode = pinCode;
    }

    public String getCustomerName() { return customerName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getBuilding() { return building; }
    public String getStreet() { return street; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getPinCode() { return pinCode; }
}
