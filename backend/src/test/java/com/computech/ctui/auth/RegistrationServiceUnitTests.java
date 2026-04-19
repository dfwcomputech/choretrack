package com.computech.ctui.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Tag("unit")
class RegistrationServiceUnitTests {

	@Test
	void registersUserAndStoresPasswordAsHash() {
		final InMemoryUserAccountRepository repository = new InMemoryUserAccountRepository();
		final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, passwordEncoder, "admin");

		final RegistrationResponse response = registrationService.register(
				new RegistrationRequest("mike123", "mike@example.com", "SecurePassword123", "Mike", "User"));

		assertThat(response.id()).isNotBlank();
		assertThat(response.username()).isEqualTo("mike123");
		assertThat(response.email()).isEqualTo("mike@example.com");

		final UserAccount saved = repository.findByUsernameIgnoreCase("mike123").orElseThrow();
		assertThat(saved.passwordHash()).isNotEqualTo("SecurePassword123");
		assertThat(passwordEncoder.matches("SecurePassword123", saved.passwordHash())).isTrue();
	}

	@Test
	void rejectsDuplicateUsername() {
		final InMemoryUserAccountRepository repository = new InMemoryUserAccountRepository();
		final RegistrationService registrationService = new RegistrationService(repository, new BCryptPasswordEncoder(),
				"admin");
		registrationService.register(
				new RegistrationRequest("mike123", "mike@example.com", "SecurePassword123", "Mike", "User"));

		assertThatThrownBy(() -> registrationService.register(
				new RegistrationRequest("mike123", "mike2@example.com", "SecurePassword123", "Mike", "User")))
				.isInstanceOf(DuplicateUserException.class)
				.hasMessage("username already exists");
	}

	@Test
	void rejectsDuplicateEmail() {
		final InMemoryUserAccountRepository repository = new InMemoryUserAccountRepository();
		final RegistrationService registrationService = new RegistrationService(repository, new BCryptPasswordEncoder(),
				"admin");
		registrationService.register(
				new RegistrationRequest("mike123", "mike@example.com", "SecurePassword123", "Mike", "User"));

		assertThatThrownBy(() -> registrationService.register(
				new RegistrationRequest("mike124", "mike@example.com", "SecurePassword123", "Mike", "User")))
				.isInstanceOf(DuplicateUserException.class)
				.hasMessage("email already exists");
	}
}
