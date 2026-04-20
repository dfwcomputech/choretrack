package com.computech.ctui.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.computech.ctui.auth.AccountRole;
import com.computech.ctui.auth.ChildAccountResponse;
import com.computech.ctui.auth.ChildAccountService;
import com.computech.ctui.demo.DemoDashboardService;
import com.computech.ctui.demo.DemoDashboardService.DemoDashboard;

@Tag("unit")
class DemoDashboardControllerUnitTests {

	@Test
	void returnsConfiguredDemoDashboardData() {
		final ChildAccountService childAccountService = mock(ChildAccountService.class);
		final DemoDashboardController controller = new DemoDashboardController(new DemoDashboardService(), childAccountService);

		final DemoDashboard dashboard = controller
				.getDashboard(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()));

		assertThat(dashboard.parent().name()).isEqualTo("Angie");
		assertThat(dashboard.children()).extracting(child -> child.name())
				.containsExactly("Preston", "Rylan", "Karla");
		assertThat(dashboard.chores()).extracting(chore -> chore.title())
				.containsExactly(
						"Pick up the trash",
						"Clean Cracker cage",
						"Feed Jessie",
						"Feed Hunter",
						"Clean your room",
						"Wash your dishes",
						"Wash your clothes");
		assertThat(dashboard.rewards()).extracting(reward -> reward.name())
				.containsExactly(
						"Get Icecream",
						"Go to the movies",
						"Extra gaming time",
						"Extra tablet time",
						"Buy one thing from Amazon");
		assertThat(dashboard.progress().points()).isEqualTo(220);
	}

	@Test
	void returnsAuthenticatedParentChildrenWithoutDemoData() {
		final ChildAccountService childAccountService = mock(ChildAccountService.class);
		when(childAccountService.listActiveChildren("newparent")).thenReturn(List.of(
				new ChildAccountResponse(
						"child-1",
						"preston1",
						"Preston",
						"Family",
						"Preston",
						"parent-1",
						AccountRole.CHILD,
						true,
						Instant.parse("2026-04-19T10:00:00Z"),
						Instant.parse("2026-04-19T10:00:00Z"))));
		final DemoDashboardController controller = new DemoDashboardController(new DemoDashboardService(), childAccountService);

		final DemoDashboard dashboard = controller
				.getDashboard(new UsernamePasswordAuthenticationToken("newparent", "n/a", List.of()));

		assertThat(dashboard.parent().name()).isEqualTo("newparent");
		assertThat(dashboard.children()).extracting(child -> child.name()).containsExactly("Preston");
		assertThat(dashboard.chores()).isEmpty();
		assertThat(dashboard.rewards()).isEmpty();
		assertThat(dashboard.progress().points()).isZero();
	}
}
