package com.computech.ctui.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import com.computech.ctui.auth.RegistrationService;
import com.computech.ctui.security.JwtService;

@Tag("unit")
class SecurityUnitTests {

	@Test
	void jwtServiceGeneratesAndValidatesToken() {
		final JwtService jwtService = new JwtService("choretrack-dev-secret-choretrack-dev-secret", 3600);
		final String token = jwtService.generateToken("admin");

		assertThat(jwtService.extractUsername(token)).isEqualTo("admin");
		assertThat(jwtService.isTokenValid(token, "admin")).isTrue();
		assertThat(jwtService.isTokenValid(token, "someoneElse")).isFalse();
	}

	@Test
	void authControllerReturnsTokenWhenCredentialsAreValid() {
		final AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
		final JwtService jwtService = new JwtService("choretrack-dev-secret-choretrack-dev-secret", 3600);
		final RegistrationService registrationService = mock(RegistrationService.class);
		final AuthController authController = new AuthController(authenticationManager, jwtService, registrationService);
		final Authentication authenticatedUser = new UsernamePasswordAuthenticationToken("admin", null, List.of());

		when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
				.thenReturn(authenticatedUser);

		final ResponseEntity<AuthController.LoginResponse> response = authController
				.login(new AuthController.LoginRequest("admin", "password"));

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().tokenType()).isEqualTo("Bearer");
		assertThat(response.getBody().token()).isNotBlank();
	}

	@Test
	void authControllerReturnsUnauthorizedForInvalidCredentials() {
		final AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
		final JwtService jwtService = new JwtService("choretrack-dev-secret-choretrack-dev-secret", 3600);
		final RegistrationService registrationService = mock(RegistrationService.class);
		final AuthController authController = new AuthController(authenticationManager, jwtService, registrationService);

		when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
				.thenThrow(new BadCredentialsException("bad credentials"));

		final ResponseEntity<AuthController.LoginResponse> response = authController
				.login(new AuthController.LoginRequest("admin", "wrong"));

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void authControllerLogoutReturnsSuccessMessageForAuthenticatedUser() {
		final AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
		final JwtService jwtService = new JwtService("choretrack-dev-secret-choretrack-dev-secret", 3600);
		final RegistrationService registrationService = mock(RegistrationService.class);
		final AuthController authController = new AuthController(authenticationManager, jwtService, registrationService);
		final Authentication authenticatedUser = new UsernamePasswordAuthenticationToken("admin", null, List.of());

		final ResponseEntity<AuthController.MessageResponse> response = authController.logout(authenticatedUser);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().message()).isEqualTo("Logged out successfully");
	}
}
