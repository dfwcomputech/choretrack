package com.computech.ctui.controller;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.computech.ctui.demo.DemoDashboardService;
import com.computech.ctui.demo.DemoDashboardService.DemoDashboard;

@Tag("unit")
class DemoDashboardControllerUnitTests {

	@Test
	void returnsConfiguredDemoDashboardData() {
		final DemoDashboardController controller = new DemoDashboardController(new DemoDashboardService());

		final DemoDashboard dashboard = controller.getDashboard();

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
}
