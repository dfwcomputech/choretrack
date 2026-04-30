package com.computech.ctui.library;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

	private final LibraryService libraryService;

	public LibraryController(final LibraryService libraryService) {
		this.libraryService = libraryService;
	}

	@GetMapping("/chores")
	public ResponseEntity<List<ChoreTemplateResponse>> searchChoreTemplates(
			@RequestParam(required = false) final String query,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).build();
		}
		return ResponseEntity.ok(libraryService.searchChoreTemplates(query));
	}

	@GetMapping("/rewards")
	public ResponseEntity<List<RewardTemplateResponse>> searchRewardTemplates(
			@RequestParam(required = false) final String query,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).build();
		}
		return ResponseEntity.ok(libraryService.searchRewardTemplates(query));
	}
}
