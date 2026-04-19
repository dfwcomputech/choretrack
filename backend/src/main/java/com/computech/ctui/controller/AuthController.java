package com.computech.ctui.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.computech.ctui.auth.RegistrationRequest;
import com.computech.ctui.auth.RegistrationResponse;
import com.computech.ctui.auth.RegistrationService;
import com.computech.ctui.security.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;
	private final RegistrationService registrationService;

	public AuthController(final AuthenticationManager authenticationManager, final JwtService jwtService,
			final RegistrationService registrationService) {
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
		this.registrationService = registrationService;
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@RequestBody final LoginRequest request) {
		if (request == null || isBlank(request.username()) || isBlank(request.password())) {
			return ResponseEntity.badRequest().build();
		}
		try {
			final Authentication authentication = authenticationManager.authenticate(
					UsernamePasswordAuthenticationToken.unauthenticated(request.username(), request.password()));
			final String token = jwtService.generateToken(authentication.getName());
			return ResponseEntity.ok(new LoginResponse(token, "Bearer"));
		} catch (BadCredentialsException ex) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
	}

	@PostMapping("/register")
	@ResponseStatus(HttpStatus.CREATED)
	public RegistrationResponse register(@Valid @RequestBody final RegistrationRequest request) {
		return registrationService.register(request);
	}

	@PostMapping("/logout")
	public ResponseEntity<MessageResponse> logout(final Authentication authentication) {
		if (authentication != null && authentication.isAuthenticated()) {
			LOGGER.info("User '{}' logged out", authentication.getName());
		} else {
			LOGGER.warn("Logout requested without an authenticated principal");
		}
		return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
	}

	private boolean isBlank(final String value) {
		return value == null || value.isBlank();
	}

	public record LoginRequest(String username, String password) {
	}

	public record LoginResponse(String token, String tokenType) {
	}

	public record MessageResponse(String message) {
	}
}
