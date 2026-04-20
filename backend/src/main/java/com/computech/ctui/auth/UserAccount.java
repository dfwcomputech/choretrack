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
		Instant createdAt,
		boolean active,
		int currentPoints,
		int totalEarnedPoints,
		Instant updatedAt,
		Instant deletedAt) {

	public UserAccount(final String id, final String username, final String email, final String passwordHash,
			final String firstName, final String lastName, final Instant createdAt) {
		this(id, username, email, passwordHash, firstName, lastName, null, AccountRole.PARENT, null, createdAt, true, 0,
				0, createdAt, null);
	}

	public UserAccount(final String id, final String username, final String email, final String passwordHash,
			final String firstName, final String lastName, final String displayName, final AccountRole role,
			final String parentId, final Instant createdAt) {
		this(id, username, email, passwordHash, firstName, lastName, displayName, role, parentId, createdAt, true, 0, 0,
				createdAt, null);
	}

	public UserAccount(final String id, final String username, final String email, final String passwordHash,
			final String firstName, final String lastName, final String displayName, final AccountRole role,
			final String parentId, final Instant createdAt, final boolean active, final Instant updatedAt,
			final Instant deletedAt) {
		this(id, username, email, passwordHash, firstName, lastName, displayName, role, parentId, createdAt, active, 0, 0,
				updatedAt, deletedAt);
	}
}
