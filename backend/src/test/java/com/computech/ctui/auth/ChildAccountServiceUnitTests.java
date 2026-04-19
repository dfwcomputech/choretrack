package com.computech.ctui.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Tag("unit")
class ChildAccountServiceUnitTests {

	@Test
	void createsChildWithHashedPasswordAndParentLink() {
		final InMemoryUserAccountRepository repository = new InMemoryUserAccountRepository();
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, encoder, "admin");
		final ChildAccountService childAccountService = new ChildAccountService(repository, encoder, "admin");

		final RegistrationResponse parent = registrationService.register(
				new RegistrationRequest("angie", "angie@example.com", "SecurePassword123", "Angie", "Parent"));

		final ChildAccountResponse response = childAccountService.createChild(
				new ChildAccountRequest("preston1", "SecurePassword123", "Preston", "Family", "Preston"),
				"angie");

		assertThat(response.id()).isNotBlank();
		assertThat(response.username()).isEqualTo("preston1");
		assertThat(response.parentId()).isEqualTo(parent.id());
		assertThat(response.role()).isEqualTo(AccountRole.CHILD);

		final UserAccount savedChild = repository.findByUsernameIgnoreCase("preston1").orElseThrow();
		assertThat(savedChild.passwordHash()).isNotEqualTo("SecurePassword123");
		assertThat(encoder.matches("SecurePassword123", savedChild.passwordHash())).isTrue();
		assertThat(savedChild.parentId()).isEqualTo(parent.id());
	}

	@Test
	void rejectsDuplicateUsername() {
		final InMemoryUserAccountRepository repository = new InMemoryUserAccountRepository();
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, encoder, "admin");
		final ChildAccountService childAccountService = new ChildAccountService(repository, encoder, "admin");

		registrationService.register(
				new RegistrationRequest("angie", "angie@example.com", "SecurePassword123", "Angie", "Parent"));
		childAccountService.createChild(new ChildAccountRequest("preston1", "SecurePassword123", "Preston", "Family", null),
				"angie");

		assertThatThrownBy(() -> childAccountService.createChild(
				new ChildAccountRequest("preston1", "SecurePassword123", "Preston", "Family", null),
				"angie"))
				.isInstanceOf(DuplicateUserException.class)
				.hasMessage("username already exists");
	}

	@Test
	void rejectsNonParentAuthenticatedUser() {
		final InMemoryUserAccountRepository repository = new InMemoryUserAccountRepository();
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, encoder, "admin");
		final ChildAccountService childAccountService = new ChildAccountService(repository, encoder, "admin");

		registrationService.register(
				new RegistrationRequest("angie", "angie@example.com", "SecurePassword123", "Angie", "Parent"));
		childAccountService.createChild(
				new ChildAccountRequest("preston1", "SecurePassword123", "Preston", "Family", "Preston"),
				"angie");

		assertThatThrownBy(() -> childAccountService.createChild(
				new ChildAccountRequest("rylan1", "SecurePassword123", "Rylan", "Family", "Rylan"),
				"preston1"))
				.isInstanceOf(ForbiddenOperationException.class)
				.hasMessage("only parent users can create child accounts");
	}
}
