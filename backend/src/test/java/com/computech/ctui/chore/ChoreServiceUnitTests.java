package com.computech.ctui.chore;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

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
	void createsRecurringDailyChoresForWeekdaysOnly() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse child = createParentAndChild("angie", "preston1", userRepository);

		choreService.createChore(new ChoreCreateRequest(
				"Feed Jessie",
				"Before school",
				10,
				child.id(),
				null,
				ChoreStatus.PENDING,
				new ChoreRecurrenceRequest(
						RecurrenceType.DAILY,
						LocalDate.parse("2026-04-24"),
						LocalDate.parse("2026-05-01"),
						Set.of(
								RecurrenceDayOfWeek.MON,
								RecurrenceDayOfWeek.TUE,
								RecurrenceDayOfWeek.WED,
								RecurrenceDayOfWeek.THU,
								RecurrenceDayOfWeek.FRI),
						"before school")), "angie");

		final List<ChoreResponse> chores = choreService.listActiveChores("angie")
				.stream()
				.filter(chore -> "Feed Jessie".equals(chore.title()))
				.sorted((left, right) -> left.dueDate().compareTo(right.dueDate()))
				.toList();

		assertThat(chores).hasSize(6);
		assertThat(chores).extracting(ChoreResponse::dueDate).containsExactly(
				LocalDate.parse("2026-04-24"),
				LocalDate.parse("2026-04-27"),
				LocalDate.parse("2026-04-28"),
				LocalDate.parse("2026-04-29"),
				LocalDate.parse("2026-04-30"),
				LocalDate.parse("2026-05-01"));
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
	void deletingRecurringOccurrenceStopsFutureOccurrencesOnly() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse child = createParentAndChild("angie", "preston1", userRepository);

		choreService.createChore(new ChoreCreateRequest(
				"Feed Jessie",
				null,
				10,
				child.id(),
				null,
				ChoreStatus.PENDING,
				new ChoreRecurrenceRequest(
						RecurrenceType.DAILY,
						LocalDate.parse("2026-04-24"),
						LocalDate.parse("2026-04-28"),
						null,
						null)), "angie");

		final ChoreResponse targetOccurrence = choreService.listActiveChores("angie")
				.stream()
				.filter(chore -> LocalDate.parse("2026-04-26").equals(chore.dueDate()))
				.findFirst()
				.orElseThrow();
		choreService.deleteChore(targetOccurrence.id(), "angie");

		final List<LocalDate> remainingDueDates = choreService.listActiveChores("angie")
				.stream()
				.map(ChoreResponse::dueDate)
				.sorted()
				.toList();

		assertThat(remainingDueDates).containsExactly(
				LocalDate.parse("2026-04-24"),
				LocalDate.parse("2026-04-25"));
	}

	@Test
	void childSeesOnlyOwnAssignedActiveChores() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse childA = createParentAndChild("angie", "preston1", userRepository);
		final ChildAccountResponse childB = createChildForParent("angie", "rylan1", userRepository);

		final ChoreResponse activeForChildA = choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				null,
				25,
				childA.id(),
				null,
				ChoreStatus.PENDING), "angie");

		choreService.createChore(new ChoreCreateRequest(
				"Take out trash",
				null,
				10,
				childB.id(),
				null,
				ChoreStatus.PENDING), "angie");

		final ChoreResponse deletedForChildA = choreService.createChore(new ChoreCreateRequest(
				"Old chore",
				null,
				5,
				childA.id(),
				null,
				ChoreStatus.PENDING), "angie");
		choreService.deleteChore(deletedForChildA.id(), "angie");

		final List<ChoreResponse> childVisibleChores = choreService.listActiveChores(childA.username());

		assertThat(childVisibleChores).extracting(ChoreResponse::id).containsExactly(activeForChildA.id());
		assertThat(childVisibleChores).extracting(ChoreResponse::assignedChildId).containsOnly(childA.id());
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

	@Test
	void completesAssignedChoreAwardsPointsAndUpdatesProgress() {
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

		final ChoreCompletionResponse completion = choreService.completeChore(created.id(), "preston1");

		assertThat(completion.status()).isEqualTo(ChoreStatus.COMPLETED);
		assertThat(completion.pointsAwarded()).isEqualTo(25);
		assertThat(completion.childCurrentPoints()).isEqualTo(25);
		assertThat(completion.completedByChildId()).isEqualTo(child.id());
		assertThat(completion.completedAt()).isNotNull();

		final ChildProgressResponse progress = choreService.getChildProgress(child.id(), "preston1");
		assertThat(progress.currentPoints()).isEqualTo(25);
		assertThat(progress.totalEarnedPoints()).isEqualTo(25);
		assertThat(progress.completedChores()).isEqualTo(1);
		assertThat(progress.pendingChores()).isEqualTo(0);
	}

	@Test
	void rejectsDuplicateChoreCompletion() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse child = createParentAndChild("angie", "preston1", userRepository);

		final ChoreResponse created = choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				"Pick up clothes",
				25,
				child.id(),
				LocalDate.now(),
				ChoreStatus.PENDING), "angie");
		choreService.completeChore(created.id(), "preston1");

		assertThatThrownBy(() -> choreService.completeChore(created.id(), "preston1"))
				.isInstanceOf(ChoreAlreadyCompletedException.class)
				.hasMessage("chore has already been completed");
	}

	@Test
	void rejectsCompletionOfAnotherChildChore() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse childA = createParentAndChild("angie", "preston1", userRepository);
		final ChildAccountResponse childB = createChildForParent("angie", "rylan1", userRepository);

		final ChoreResponse created = choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				null,
				25,
				childA.id(),
				null,
				ChoreStatus.PENDING), "angie");

		assertThatThrownBy(() -> choreService.completeChore(created.id(), childB.username()))
				.isInstanceOf(ForbiddenOperationException.class)
				.hasMessage("child cannot complete this chore");
	}

	@Test
	void rejectsChildCompletionForPastOrFutureChoreDate() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse child = createParentAndChild("angie", "preston1", userRepository);

		final ChoreResponse pastChore = choreService.createChore(new ChoreCreateRequest(
				"Past chore",
				null,
				15,
				child.id(),
				LocalDate.now().minusDays(1),
				ChoreStatus.PENDING), "angie");
		final ChoreResponse futureChore = choreService.createChore(new ChoreCreateRequest(
				"Future chore",
				null,
				15,
				child.id(),
				LocalDate.now().plusDays(1),
				ChoreStatus.PENDING), "angie");

		assertThatThrownBy(() -> choreService.completeChore(pastChore.id(), "preston1"))
				.isInstanceOf(ForbiddenOperationException.class)
				.hasMessage("You can only complete chores scheduled for today");
		assertThatThrownBy(() -> choreService.completeChore(futureChore.id(), "preston1"))
				.isInstanceOf(ForbiddenOperationException.class)
				.hasMessage("You can only complete chores scheduled for today");
	}

	@Test
	void parentCanCompleteChildChoreForAnyDate() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse child = createParentAndChild("angie", "preston1", userRepository);

		final ChoreResponse created = choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				"Pick up clothes",
				25,
				child.id(),
				LocalDate.now().plusDays(3),
				ChoreStatus.PENDING), "angie");

		final ChoreCompletionResponse completion = choreService.completeChore(created.id(), "angie");

		assertThat(completion.status()).isEqualTo(ChoreStatus.COMPLETED);
		assertThat(completion.pointsAwarded()).isEqualTo(25);
		assertThat(completion.completedByChildId()).isEqualTo(child.id());
		assertThat(completion.childCurrentPoints()).isEqualTo(25);
	}

	@Test
	void revertsCompletedChoreBackToPendingAndRemovesPoints() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse child = createParentAndChild("angie", "preston1", userRepository);

		final ChoreResponse created = choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				"Pick up clothes",
				25,
				child.id(),
				LocalDate.now(),
				ChoreStatus.PENDING), "angie");
		choreService.completeChore(created.id(), "preston1");

		final ChoreCompletionResponse reverted = choreService.revertChore(created.id(), "preston1");
		assertThat(reverted.status()).isEqualTo(ChoreStatus.PENDING);
		assertThat(reverted.pointsAwarded()).isEqualTo(-25);
		assertThat(reverted.childCurrentPoints()).isEqualTo(0);
		assertThat(reverted.completedAt()).isNull();

		final ChildProgressResponse progress = choreService.getChildProgress(child.id(), "preston1");
		assertThat(progress.currentPoints()).isEqualTo(0);
		assertThat(progress.totalEarnedPoints()).isEqualTo(0);
		assertThat(progress.completedChores()).isEqualTo(0);
		assertThat(progress.pendingChores()).isEqualTo(1);
	}

	@Test
	void rejectsRevertWhenChoreAlreadyPending() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse child = createParentAndChild("angie", "preston1", userRepository);

		final ChoreResponse created = choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				null,
				25,
				child.id(),
				null,
				ChoreStatus.PENDING), "angie");

		assertThatThrownBy(() -> choreService.revertChore(created.id(), "preston1"))
				.isInstanceOf(ChoreAlreadyPendingException.class)
				.hasMessage("chore is already pending");
	}

	@Test
	void parentCanViewChildProgressButOtherChildCannot() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final ChoreService choreService = createService(userRepository);
		final ChildAccountResponse childA = createParentAndChild("angie", "preston1", userRepository);
		final ChildAccountResponse childB = createChildForParent("angie", "rylan1", userRepository);

		choreService.createChore(new ChoreCreateRequest(
				"Clean room",
				null,
				25,
				childA.id(),
				null,
				ChoreStatus.PENDING), "angie");

		final ChildProgressResponse parentView = choreService.getChildProgress(childA.id(), "angie");
		assertThat(parentView.childId()).isEqualTo(childA.id());
		assertThat(parentView.pendingChores()).isEqualTo(1);

		assertThatThrownBy(() -> choreService.getChildProgress(childA.id(), childB.username()))
				.isInstanceOf(ForbiddenOperationException.class)
				.hasMessage("child cannot access another child account");
	}

	private ChoreService createService(final InMemoryUserAccountRepository userRepository) {
		return new ChoreService(new InMemoryChoreRepository(), userRepository);
	}

	private ChildAccountResponse createParentAndChild(final String parentUsername, final String childUsername,
			final InMemoryUserAccountRepository repository) {
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, encoder, "admin");

		registrationService.register(
				new RegistrationRequest(parentUsername, parentUsername + "@example.com", "SecurePassword123",
						capitalize(parentUsername), "Parent"));
		return createChildForParent(parentUsername, childUsername, repository);
	}

	private ChildAccountResponse createChildForParent(final String parentUsername, final String childUsername,
			final InMemoryUserAccountRepository repository) {
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final ChildAccountService childAccountService = new ChildAccountService(repository, encoder, "admin");
		return childAccountService.createChild(
				new ChildAccountRequest(childUsername, "SecurePassword123", "Preston", "Family", "Preston"),
				parentUsername);
	}

	private String capitalize(final String value) {
		return Character.toUpperCase(value.charAt(0)) + value.substring(1);
	}
}
