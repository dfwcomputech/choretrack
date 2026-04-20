package com.computech.ctui.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

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
		assertThat(savedChild.active()).isTrue();
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

	@Test
	void updatesOwnedChildProfile() {
		final InMemoryUserAccountRepository repository = new InMemoryUserAccountRepository();
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, encoder, "admin");
		final ChildAccountService childAccountService = new ChildAccountService(repository, encoder, "admin");

		registrationService.register(
				new RegistrationRequest("angie", "angie@example.com", "SecurePassword123", "Angie", "Parent"));
		final ChildAccountResponse createdChild = childAccountService.createChild(
				new ChildAccountRequest("preston1", "SecurePassword123", "Preston", "Family", "Preston"),
				"angie");

		final ChildAccountResponse updated = childAccountService.updateChild(createdChild.id(),
				new ChildAccountUpdateRequest("preston2", "Preston", "Family", "P"),
				"angie");

		assertThat(updated.username()).isEqualTo("preston2");
		assertThat(updated.displayName()).isEqualTo("P");
		assertThat(updated.updatedAt()).isAfterOrEqualTo(updated.createdAt());
	}

	@Test
	void hideChildMarksChildInactiveAndExcludesFromActiveList() {
		final InMemoryUserAccountRepository repository = new InMemoryUserAccountRepository();
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, encoder, "admin");
		final ChildAccountService childAccountService = new ChildAccountService(repository, encoder, "admin");

		registrationService.register(
				new RegistrationRequest("angie", "angie@example.com", "SecurePassword123", "Angie", "Parent"));
		final ChildAccountResponse childA = childAccountService.createChild(
				new ChildAccountRequest("preston1", "SecurePassword123", "Preston", "Family", "Preston"),
				"angie");
		childAccountService.createChild(
				new ChildAccountRequest("rylan1", "SecurePassword123", "Rylan", "Family", "Rylan"),
				"angie");

		childAccountService.hideChild(childA.id(), "angie");

		final List<ChildAccountResponse> activeChildren = childAccountService.listActiveChildren("angie");
		assertThat(activeChildren).extracting(ChildAccountResponse::username).containsExactly("rylan1");

		final UserAccount hiddenChild = repository.findById(childA.id()).orElseThrow();
		assertThat(hiddenChild.active()).isFalse();
		assertThat(hiddenChild.deletedAt()).isNotNull();
	}

	@Test
	void rejectsNonOwnerParentWhenUpdatingChild() {
		final InMemoryUserAccountRepository repository = new InMemoryUserAccountRepository();
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, encoder, "admin");
		final ChildAccountService childAccountService = new ChildAccountService(repository, encoder, "admin");

		registrationService.register(
				new RegistrationRequest("angie", "angie@example.com", "SecurePassword123", "Angie", "Parent"));
		registrationService.register(
				new RegistrationRequest("karen", "karen@example.com", "SecurePassword123", "Karen", "Parent"));
		final ChildAccountResponse child = childAccountService.createChild(
				new ChildAccountRequest("preston1", "SecurePassword123", "Preston", "Family", "Preston"),
				"angie");

		assertThatThrownBy(() -> childAccountService.updateChild(child.id(),
				new ChildAccountUpdateRequest(null, "Preston", "Family", "Preston"),
				"karen"))
				.isInstanceOf(ForbiddenOperationException.class)
				.hasMessage("parent cannot access this child account");
	}
}
