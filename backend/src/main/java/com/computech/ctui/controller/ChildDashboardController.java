package com.computech.ctui.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.computech.ctui.chore.ChildDashboardResponse;
import com.computech.ctui.chore.ChoreService;

@RestController
@RequestMapping("/api/child")
public class ChildDashboardController {

	private final ChoreService choreService;

	public ChildDashboardController(final ChoreService choreService) {
		this.choreService = choreService;
	}

	@GetMapping("/dashboard")
	public ResponseEntity<ChildDashboardResponse> getChildDashboard(
			@RequestParam(required = false) final String date,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(choreService.getChildDashboard(authentication.getName(), date));
	}
}
