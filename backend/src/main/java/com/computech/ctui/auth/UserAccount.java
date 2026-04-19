package com.computech.ctui.auth;

import java.time.Instant;

public record UserAccount(
		String id,
		String username,
		String email,
		String passwordHash,
		String firstName,
		String lastName,
		String displayName,
		AccountRole role,
		String parentId,
		Instant createdAt) {

	public UserAccount(final String id, final String username, final String email, final String passwordHash,
			final String firstName, final String lastName, final Instant createdAt) {
		this(id, username, email, passwordHash, firstName, lastName, null, AccountRole.PARENT, null, createdAt);
	}
}
