package com.computech.ctui.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.computech.ctui.auth.ChildAccountDeleteResponse;
import com.computech.ctui.auth.ChildAccountRequest;
import com.computech.ctui.auth.ChildAccountResponse;
import com.computech.ctui.auth.ChildAccountService;
import com.computech.ctui.auth.ChildAccountUpdateRequest;
import com.computech.ctui.chore.ChildProgressResponse;
import com.computech.ctui.chore.ChoreService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/children")
public class ChildController {

	private final ChildAccountService childAccountService;
	private final ChoreService choreService;

	public ChildController(final ChildAccountService childAccountService, final ChoreService choreService) {
		this.childAccountService = childAccountService;
		this.choreService = choreService;
	}

	@PostMapping
	public ResponseEntity<ChildAccountResponse> createChild(@Valid @RequestBody final ChildAccountRequest request,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		final ChildAccountResponse response = childAccountService.createChild(request, authentication.getName());
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping
	public ResponseEntity<List<ChildAccountResponse>> listChildren(final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(childAccountService.listActiveChildren(authentication.getName()));
	}

	@PutMapping("/{childId}")
	public ResponseEntity<ChildAccountResponse> updateChild(@PathVariable final String childId,
			@Valid @RequestBody final ChildAccountUpdateRequest request, final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(childAccountService.updateChild(childId, request, authentication.getName()));
	}

	@DeleteMapping("/{childId}")
	public ResponseEntity<ChildAccountDeleteResponse> hideChild(@PathVariable final String childId,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(childAccountService.hideChild(childId, authentication.getName()));
	}

	@GetMapping("/{childId}/progress")
	public ResponseEntity<ChildProgressResponse> getChildProgress(@PathVariable final String childId,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(choreService.getChildProgress(childId, authentication.getName()));
	}
}
