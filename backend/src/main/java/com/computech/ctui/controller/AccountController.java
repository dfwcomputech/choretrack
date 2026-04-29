package com.computech.ctui.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.computech.ctui.auth.AccountType;
import com.computech.ctui.auth.UserAccount;
import com.computech.ctui.auth.UserAccountRepository;

@RestController
@RequestMapping("/api/me")
public class AccountController {

	private final UserAccountRepository userAccountRepository;

	public AccountController(final UserAccountRepository userAccountRepository) {
		this.userAccountRepository = userAccountRepository;
	}

	@GetMapping
	public ResponseEntity<ParentProfileResponse> getProfile(final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return userAccountRepository.findByUsernameIgnoreCase(authentication.getName())
				.map(account -> ResponseEntity.ok(toResponse(account)))
				.orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
	}

	private ParentProfileResponse toResponse(final UserAccount account) {
		final AccountType accountType = account.accountType() != null ? account.accountType() : AccountType.FREE;
		return new ParentProfileResponse(
				account.id(),
				account.username(),
				account.displayName() != null ? account.displayName() : account.firstName(),
				accountType);
	}

	public record ParentProfileResponse(String id, String username, String displayName, AccountType accountType) {
	}
}
