package com.computech.ctui.chore;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.computech.ctui.auth.ChildAccountRequest;
import com.computech.ctui.auth.ChildAccountResponse;
import com.computech.ctui.auth.ChildAccountService;
import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.auth.InMemoryUserAccountRepository;
import com.computech.ctui.auth.RegistrationRequest;
import com.computech.ctui.auth.RegistrationService;

@Tag("unit")
class ChoreServiceUnitTests {

	@Test
	void createsChoreForOwnedChild() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse child = createParentAndChild("angie", "preston1", userRepository);

		final ChoreResponse created = choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				"Pick up clothes",
				25,
				child.id(),
				LocalDate.parse("2026-04-25"),
				null), "angie");

		assertThat(created.id()).isNotBlank();
		assertThat(created.assignedChildId()).isEqualTo(child.id());
		assertThat(created.assignedChildName()).isEqualTo("Preston");
		assertThat(created.status()).isEqualTo(ChoreStatus.PENDING);
	}

	@Test
	void rejectsNonParentUser() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse child = createParentAndChild("angie", "preston1", userRepository);

		assertThatThrownBy(() -> choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				null,
				25,
				child.id(),
				null,
				ChoreStatus.PENDING), "preston1"))
				.isInstanceOf(ForbiddenOperationException.class)
				.hasMessage("only parent users can manage chores");
	}

	@Test
	void rejectsChildFromAnotherParent() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);

		createParentAndChild("angie", "preston1", userRepository);
		final ChildAccountResponse otherParentChild = createParentAndChild("karen", "rylan1", userRepository);

		assertThatThrownBy(() -> choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				null,
				25,
				otherParentChild.id(),
				null,
				ChoreStatus.PENDING), "angie"))
				.isInstanceOf(ForbiddenOperationException.class)
				.hasMessage("parent cannot access this child account");
	}

	@Test
	void updatesAndDeletesOwnedChoreAndHidesItFromActiveList() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse child = createParentAndChild("angie", "preston1", userRepository);

		final ChoreResponse created = choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				"Pick up clothes",
				25,
				child.id(),
				LocalDate.parse("2026-04-25"),
				ChoreStatus.PENDING), "angie");

		final ChoreResponse updated = choreService.updateChore(created.id(), new ChoreUpdateRequest(
				"Clean room",
				"Pick up clothes and vacuum",
				30,
				child.id(),
				LocalDate.parse("2026-04-26"),
				ChoreStatus.COMPLETED), "angie");

		assertThat(updated.points()).isEqualTo(30);
		assertThat(updated.status()).isEqualTo(ChoreStatus.COMPLETED);

		choreService.deleteChore(created.id(), "angie");

		final List<ChoreResponse> activeChores = choreService.listActiveChores("angie");
		assertThat(activeChores).isEmpty();
	}

	@Test
	void returnsNotFoundForMissingChore() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		createParentAndChild("angie", "preston1", userRepository);

		assertThatThrownBy(() -> choreService.updateChore("missing-id", new ChoreUpdateRequest(
				"Clean room",
				null,
				25,
				"missing-child",
				null,
				ChoreStatus.PENDING), "angie"))
				.isInstanceOf(ChoreNotFoundException.class)
				.hasMessage("chore not found");
	}

	private ChoreService createService(final InMemoryUserAccountRepository userRepository) {
		return new ChoreService(new InMemoryChoreRepository(), userRepository);
	}

	private ChildAccountResponse createParentAndChild(final String parentUsername, final String childUsername,
			final InMemoryUserAccountRepository repository) {
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, encoder, "admin");
		final ChildAccountService childAccountService = new ChildAccountService(repository, encoder, "admin");

		registrationService.register(
				new RegistrationRequest(parentUsername, parentUsername + "@example.com", "SecurePassword123",
						capitalize(parentUsername), "Parent"));
		return childAccountService.createChild(
				new ChildAccountRequest(childUsername, "SecurePassword123", "Preston", "Family", "Preston"),
				parentUsername);
	}

	private String capitalize(final String value) {
		return Character.toUpperCase(value.charAt(0)) + value.substring(1);
	}
}
