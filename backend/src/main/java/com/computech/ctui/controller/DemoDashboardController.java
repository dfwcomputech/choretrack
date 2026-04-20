package com.computech.ctui.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.computech.ctui.auth.ChildAccountService;
import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.demo.DemoDashboardService;
import com.computech.ctui.demo.DemoDashboardService.Child;
import com.computech.ctui.demo.DemoDashboardService.DemoDashboard;
import com.computech.ctui.demo.DemoDashboardService.Parent;
import com.computech.ctui.demo.DemoDashboardService.Progress;

@RestController
@RequestMapping("/api/demo")
public class DemoDashboardController {

	private static final String DEMO_USERNAME = "angie";

	private final DemoDashboardService demoDashboardService;
	private final ChildAccountService childAccountService;

	public DemoDashboardController(final DemoDashboardService demoDashboardService,
			final ChildAccountService childAccountService) {
		this.demoDashboardService = demoDashboardService;
		this.childAccountService = childAccountService;
	}

	@GetMapping("/dashboard")
	public DemoDashboard getDashboard(final Authentication authentication) {
		final String username = authentication == null || !authentication.isAuthenticated() ? "parent"
				: authentication.getName();
		if (DEMO_USERNAME.equalsIgnoreCase(username)) {
			return demoDashboardService.getDashboard();
		}

		final List<Child> children;
		try {
			children = childAccountService.listActiveChildren(username).stream()
					.map(child -> new Child(
							child.id(),
							child.displayName(),
							child.username(),
							"Child",
							"🧒",
							child.parentId()))
					.toList();
		} catch (ForbiddenOperationException ex) {
			return emptyDashboard(username, List.of());
		}
		return emptyDashboard(username, children);
	}

	private DemoDashboard emptyDashboard(final String username, final List<Child> children) {
		return new DemoDashboard(
				new Parent("parent-" + username, username, "Parent", "👩"),
				children,
				List.of(),
				List.of(),
				new Progress(1, 0, 100, Map.of()));
	}
}
