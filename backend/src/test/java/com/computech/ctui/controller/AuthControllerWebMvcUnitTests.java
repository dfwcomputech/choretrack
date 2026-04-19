package com.computech.ctui.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.computech.ctui.auth.DuplicateUserException;
import com.computech.ctui.auth.RegistrationResponse;
import com.computech.ctui.auth.RegistrationService;
import com.computech.ctui.config.ApiExceptionHandler;
import com.computech.ctui.security.JwtService;

@Tag("unit")
class AuthControllerWebMvcUnitTests {

	private final AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
	private final JwtService jwtService = new JwtService("choretrack-dev-secret-choretrack-dev-secret", 3600);
	private final RegistrationService registrationService = mock(RegistrationService.class);
	private final MockMvc mockMvc;

	AuthControllerWebMvcUnitTests() {
		final LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
		validator.afterPropertiesSet();
		this.mockMvc = MockMvcBuilders
				.standaloneSetup(new AuthController(authenticationManager, jwtService, registrationService))
				.setControllerAdvice(new ApiExceptionHandler())
				.setValidator(validator)
				.build();
	}

	@Test
	void registerReturnsCreatedForValidPayload() throws Exception {
		when(registrationService.register(any())).thenReturn(
				new RegistrationResponse("generated-id", "mike123", "mike@example.com", "Mike", "User"));

		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "username":"mike123",
						  "email":"mike@example.com",
						  "password":"SecurePassword123",
						  "firstName":"Mike",
						  "lastName":"User"
						}
						"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value("generated-id"))
				.andExpect(jsonPath("$.username").value("mike123"));
	}

	@Test
	void registerReturnsConflictWhenUsernameExists() throws Exception {
		when(registrationService.register(any()))
				.thenThrow(new DuplicateUserException("username", "username already exists"));

		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "username":"mike123",
						  "email":"mike@example.com",
						  "password":"SecurePassword123",
						  "firstName":"Mike",
						  "lastName":"User"
						}
						"""))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.field").value("username"));
	}

	@Test
	void registerReturnsConflictWhenEmailExists() throws Exception {
		when(registrationService.register(any()))
				.thenThrow(new DuplicateUserException("email", "email already exists"));

		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "username":"mike123",
						  "email":"mike@example.com",
						  "password":"SecurePassword123",
						  "firstName":"Mike",
						  "lastName":"User"
						}
						"""))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.field").value("email"));
	}

	@Test
	void registerReturnsBadRequestForInvalidPayload() throws Exception {
		mockMvc.perform(post("/api/auth/register")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "username":" ",
						  "email":"not-an-email",
						  "password":"short",
						  "firstName":" ",
						  "lastName":" "
						}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.errors").isArray());
	}

	@Test
	void logoutReturnsSuccessMessage() throws Exception {
		mockMvc.perform(post("/api/auth/logout")
				.principal(() -> "admin"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("Logged out successfully"));
	}
}
