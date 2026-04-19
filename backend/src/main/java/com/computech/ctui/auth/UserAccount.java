package com.computech.ctui.auth;

import java.time.Instant;

public record UserAccount(
		String id,
		String username,
		String email,
		String passwordHash,
		String firstName,
		String lastName,
		Instant createdAt) {
}
