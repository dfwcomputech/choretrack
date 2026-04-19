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
import org.springframework.web.bind.annotation.RestController;

import com.computech.ctui.security.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	public AuthController(final AuthenticationManager authenticationManager, final JwtService jwtService) {
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
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

	private boolean isBlank(final String value) {
		return value == null || value.isBlank();
	}

	public record LoginRequest(String username, String password) {
	}

	public record LoginResponse(String token, String tokenType) {
	}
}
