package com.computech.ctui.auth;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("unit")
class AccountPlanServiceUnitTests {

	private final AccountPlanService planService = new AccountPlanService();

	@Test
	void freeAccountCanCreateChildWhenBelowLimit() {
		final UserAccount parent = freeParent();
		assertThatCode(() -> planService.enforceChildCreationLimit(parent, 1)).doesNotThrowAnyException();
	}

	@Test
	void freeAccountCannotCreateChildWhenAtLimit() {
		final UserAccount parent = freeParent();
		assertThatThrownBy(() -> planService.enforceChildCreationLimit(parent, AccountPlanService.FREE_MAX_CHILDREN))
				.isInstanceOf(AccountPlanLimitException.class)
				.hasMessageContaining("Free accounts can only create");
	}

	@Test
	void paidAccountIgnoresChildLimit() {
		final UserAccount parent = paidParent();
		assertThatCode(() -> planService.enforceChildCreationLimit(parent, 100)).doesNotThrowAnyException();
	}

	@Test
	void demoAccountIgnoresChildLimit() {
		final UserAccount parent = demoParent();
		assertThatCode(() -> planService.enforceChildCreationLimit(parent, 100)).doesNotThrowAnyException();
	}

	@Test
	void freeAccountCanCreateChoreWhenBelowLimit() {
		final UserAccount parent = freeParent();
		assertThatCode(() -> planService.enforceChoreCreationLimit(parent, 5)).doesNotThrowAnyException();
	}

	@Test
	void freeAccountCannotCreateChoreWhenAtLimit() {
		final UserAccount parent = freeParent();
		assertThatThrownBy(() -> planService.enforceChoreCreationLimit(parent, AccountPlanService.FREE_MAX_ACTIVE_CHORES))
				.isInstanceOf(AccountPlanLimitException.class)
				.hasMessageContaining("Free accounts can only create");
	}

	@Test
	void paidAccountIgnoresChoreLimit() {
		final UserAccount parent = paidParent();
		assertThatCode(() -> planService.enforceChoreCreationLimit(parent, 200)).doesNotThrowAnyException();
	}

	@Test
	void freeAccountCanCreateRewardWhenBelowLimit() {
		final UserAccount parent = freeParent();
		assertThatCode(() -> planService.enforceRewardCreationLimit(parent, 4)).doesNotThrowAnyException();
	}

	@Test
	void freeAccountCannotCreateRewardWhenAtLimit() {
		final UserAccount parent = freeParent();
		assertThatThrownBy(() -> planService.enforceRewardCreationLimit(parent, AccountPlanService.FREE_MAX_ACTIVE_REWARDS))
				.isInstanceOf(AccountPlanLimitException.class)
				.hasMessageContaining("Free accounts can only create");
	}

	@Test
	void paidAccountIgnoresRewardLimit() {
		final UserAccount parent = paidParent();
		assertThatCode(() -> planService.enforceRewardCreationLimit(parent, 200)).doesNotThrowAnyException();
	}

	@Test
	void planLimitExceptionExposesField() {
		final UserAccount parent = freeParent();
		try {
			planService.enforceChildCreationLimit(parent, AccountPlanService.FREE_MAX_CHILDREN);
		} catch (final AccountPlanLimitException ex) {
			assert "accountType".equals(ex.getField());
		}
	}

	private UserAccount freeParent() {
		return new UserAccount("p1", "angie", "angie@example.com", "hash",
				"Angie", "Parent", "Angie", AccountRole.PARENT, AccountType.FREE, null, Instant.now());
	}

	private UserAccount paidParent() {
		return new UserAccount("p2", "karen", "karen@example.com", "hash",
				"Karen", "Parent", "Karen", AccountRole.PARENT, AccountType.PAID, null, Instant.now());
	}

	private UserAccount demoParent() {
		return new UserAccount("p3", "demo", "demo@example.com", "hash",
				"Demo", "User", "Demo", AccountRole.PARENT, AccountType.DEMO, null, Instant.now());
	}
}
