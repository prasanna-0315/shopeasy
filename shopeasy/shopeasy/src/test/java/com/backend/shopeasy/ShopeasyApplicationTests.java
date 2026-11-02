package com.backend.shopeasy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ShopeasyApplicationTests {
	@Autowired
	private MockMvc mockMvc;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Test
	void contextLoads() {
	}

	@Test
	void catalogAuthenticationAndOrderFlow() throws Exception {
		JsonNode products = objectMapper.readTree(mockMvc.perform(get("/api/products"))
				.andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString());
		assertTrue(products.size() >= 20, "The idempotent sample catalog should provide at least 20 products");

		mockMvc.perform(get("/api/orders/my-orders"))
				.andExpect(status().isUnauthorized());
		mockMvc.perform(get("/api/orders/admin/all"))
				.andExpect(status().isUnauthorized());
		mockMvc.perform(get("/api/orders/my-orders").header("Authorization", "Bearer invalid.token.value"))
				.andExpect(status().isUnauthorized());

		String email = "shop-test-" + UUID.randomUUID() + "@example.com";
		String credentials = objectMapper.writeValueAsString(
				Map.of("name", "Shop Test", "email", email, "password", "StrongPass123!", "role", "ADMIN"));
		mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(credentials))
				.andExpect(status().isCreated());
		mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(credentials))
				.andExpect(status().isConflict());

		MvcResult login = mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(
								Map.of("email", email, "password", "StrongPass123!"))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token").isNotEmpty())
				.andReturn();
		String token = objectMapper.readTree(login.getResponse().getContentAsString()).get("token").asText();
		mockMvc.perform(get("/api/orders/admin/all").header("Authorization", "Bearer " + token))
				.andExpect(status().isForbidden());

		JsonNode product = products.get(0);
		long productId = product.get("id").asLong();
		int originalStock = product.get("stock").asInt();
		String orderRequest = objectMapper.writeValueAsString(Map.of(
				"items", List.of(Map.of("productId", productId, "quantity", 2)),
				"address", Map.of(
						"customerName", "Shop Test",
						"email", email,
						"phone", "9876543210",
						"building", "12 Test House",
						"street", "Sample Road",
						"city", "Bengaluru",
						"state", "Karnataka",
						"pinCode", "560001"),
				"paymentMethod", "COD"));

		MvcResult placed = mockMvc.perform(post("/api/orders")
						.header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content(orderRequest))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("PENDING"))
				.andExpect(jsonPath("$.paymentMethod").value("COD"))
				.andExpect(jsonPath("$.items[0].quantity").value(2))
				.andExpect(jsonPath("$.totalAmount").value(product.get("price").asDouble() * 2
						+ (product.get("price").asDouble() * 2 >= 999 ? 0 : 49)))
				.andReturn();
		long orderId = objectMapper.readTree(placed.getResponse().getContentAsString()).get("id").asLong();

		JsonNode reducedProduct = objectMapper.readTree(mockMvc.perform(get("/api/products/{id}", productId))
				.andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
		assertEquals(originalStock - 2, reducedProduct.get("stock").asInt());

		String otherEmail = "other-" + UUID.randomUUID() + "@example.com";
		mockMvc.perform(post("/api/auth/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(Map.of(
								"name", "Other User", "email", otherEmail, "password", "StrongPass123!"))))
				.andExpect(status().isCreated());
		MvcResult otherLogin = mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(Map.of(
								"email", otherEmail, "password", "StrongPass123!"))))
				.andExpect(status().isOk()).andReturn();
		String otherToken = objectMapper.readTree(otherLogin.getResponse().getContentAsString())
				.get("token").asText();
		mockMvc.perform(get("/api/orders/{id}", orderId)
						.header("Authorization", "Bearer " + otherToken))
				.andExpect(status().isNotFound());

		mockMvc.perform(put("/api/orders/{id}/cancel", orderId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("CANCELLED"));
		JsonNode restoredProduct = objectMapper.readTree(mockMvc.perform(get("/api/products/{id}", productId))
				.andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
		assertEquals(originalStock, restoredProduct.get("stock").asInt());
	}
}
