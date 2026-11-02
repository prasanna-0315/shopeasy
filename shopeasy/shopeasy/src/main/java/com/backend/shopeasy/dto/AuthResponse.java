package com.backend.shopeasy.dto;

public class AuthResponse {

    private String message;
    private String token;
    private String name;
    private String email;
    private String role;

    public AuthResponse(String message, String token,
                        String name, String email, String role) {
        this.message = message;
        this.token = token;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}