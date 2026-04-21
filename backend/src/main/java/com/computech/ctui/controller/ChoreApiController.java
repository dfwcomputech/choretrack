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

import com.computech.ctui.chore.ChoreCreateRequest;
import com.computech.ctui.chore.ChoreDeleteResponse;
import com.computech.ctui.chore.ChoreCompletionResponse;
import com.computech.ctui.chore.ChoreResponse;
import com.computech.ctui.chore.ChoreService;
import com.computech.ctui.chore.ChoreUpdateRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chores")
public class ChoreApiController {

	private final ChoreService choreService;

	public ChoreApiController(final ChoreService choreService) {
		this.choreService = choreService;
	}

	@GetMapping
	public ResponseEntity<List<ChoreResponse>> getChores(final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(choreService.listActiveChores(authentication.getName()));
	}

	@PostMapping
	public ResponseEntity<ChoreResponse> createChore(@Valid @RequestBody final ChoreCreateRequest request,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(choreService.createChore(request, authentication.getName()));
	}

	@PutMapping("/{choreId}")
	public ResponseEntity<ChoreResponse> updateChore(@PathVariable final String choreId,
			@Valid @RequestBody final ChoreUpdateRequest request, final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(choreService.updateChore(choreId, request, authentication.getName()));
	}

	@DeleteMapping("/{choreId}")
	public ResponseEntity<ChoreDeleteResponse> deleteChore(@PathVariable final String choreId,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(choreService.deleteChore(choreId, authentication.getName()));
	}

	@PostMapping("/{choreId}/complete")
	public ResponseEntity<ChoreCompletionResponse> completeChore(@PathVariable final String choreId,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(choreService.completeChore(choreId, authentication.getName()));
	}

	@PostMapping("/{choreId}/revert")
	public ResponseEntity<ChoreCompletionResponse> revertChore(@PathVariable final String choreId,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(choreService.revertChore(choreId, authentication.getName()));
	}
}
