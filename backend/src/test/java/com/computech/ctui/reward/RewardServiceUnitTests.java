package com.computech.ctui.reward;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.computech.ctui.auth.ChildAccountRequest;
import com.computech.ctui.auth.ChildAccountService;
import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.auth.InMemoryUserAccountRepository;
import com.computech.ctui.auth.RegistrationRequest;
import com.computech.ctui.auth.RegistrationService;

@Tag("unit")
class RewardServiceUnitTests {

@Test
void createsRewardForParent() {
final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
final RewardService rewardService = createService(userRepository);
createParent("angie", userRepository);

final RewardResponse created = rewardService.createReward(new RewardCreateRequest(
"Extra gaming time",
"30 extra minutes",
150,
null,
"SCREEN_TIME",
null), "angie");

assertThat(created.id()).isNotBlank();
assertThat(created.name()).isEqualTo("Extra gaming time");
assertThat(created.active()).isTrue();
}

@Test
	void rejectsNonParentUser() {
		final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
		final RewardService rewardService = createService(userRepository);
		createParentAndChild("angie", "preston1", userRepository);

		assertThatThrownBy(() -> rewardService.createReward(new RewardCreateRequest(
				"Extra gaming time",
				null,
150,
true,
"SCREEN_TIME",
null), "preston1"))
.isInstanceOf(ForbiddenOperationException.class)
.hasMessage("only parent users can manage rewards");
}

@Test
void rejectsRewardOwnedByAnotherParent() {
final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
final RewardService rewardService = createService(userRepository);
createParent("angie", userRepository);
createParent("karen", userRepository);
final RewardResponse created = rewardService.createReward(new RewardCreateRequest(
"Movie night",
null,
90,
true,
"FUN",
null), "karen");

assertThatThrownBy(() -> rewardService.updateReward(created.id(), new RewardUpdateRequest(
"Movie night",
"updated",
95,
true,
"FUN",
null), "angie"))
.isInstanceOf(ForbiddenOperationException.class)
.hasMessage("parent cannot access this reward");
}

@Test
void updatesAndDeletesOwnedRewardAndHidesItFromActiveList() {
final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
final RewardService rewardService = createService(userRepository);
createParent("angie", userRepository);

final RewardResponse created = rewardService.createReward(new RewardCreateRequest(
"Extra gaming time",
"30 extra minutes",
150,
true,
"SCREEN_TIME",
null), "angie");

final RewardResponse updated = rewardService.updateReward(created.id(), new RewardUpdateRequest(
"Extra gaming time",
"45 extra minutes",
200,
true,
"SCREEN_TIME",
null), "angie");

assertThat(updated.pointCost()).isEqualTo(200);
assertThat(updated.description()).isEqualTo("45 extra minutes");

rewardService.deleteReward(created.id(), "angie");
final List<RewardResponse> activeRewards = rewardService.listActiveRewards("angie");
assertThat(activeRewards).isEmpty();
}

@Test
void returnsNotFoundForMissingReward() {
final InMemoryUserAccountRepository userRepository = new InMemoryUserAccountRepository();
final RewardService rewardService = createService(userRepository);
createParent("angie", userRepository);

assertThatThrownBy(() -> rewardService.updateReward("missing-id", new RewardUpdateRequest(
"Extra gaming time",
null,
150,
true,
"SCREEN_TIME",
null), "angie"))
.isInstanceOf(RewardNotFoundException.class)
.hasMessage("reward not found");
}

private RewardService createService(final InMemoryUserAccountRepository userRepository) {
return new RewardService(new InMemoryRewardRepository(), userRepository);
}

	private void createParent(final String parentUsername, final InMemoryUserAccountRepository repository) {
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, encoder, "admin");
		registrationService.register(
				new RegistrationRequest(parentUsername, parentUsername + "@example.com", "SecurePassword123",
						capitalize(parentUsername), "Parent"));
	}

	private void createParentAndChild(final String parentUsername, final String childUsername,
			final InMemoryUserAccountRepository repository) {
		final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		final RegistrationService registrationService = new RegistrationService(repository, encoder, "admin");
		final ChildAccountService childAccountService = new ChildAccountService(repository, encoder, "admin");
		registrationService.register(
				new RegistrationRequest(parentUsername, parentUsername + "@example.com", "SecurePassword123",
						capitalize(parentUsername), "Parent"));
		childAccountService.createChild(
				new ChildAccountRequest(childUsername, "SecurePassword123", "Preston", "Family", "Preston"),
				parentUsername);
	}

private String capitalize(final String value) {
return Character.toUpperCase(value.charAt(0)) + value.substring(1);
}
}
