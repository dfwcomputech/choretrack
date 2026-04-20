package com.computech.ctui.auth;

import java.time.Instant;

public record ChildAccountResponse(
		String id,
		String username,
		String firstName,
		String lastName,
		String displayName,
		String parentId,
		AccountRole role,
		boolean active,
		Instant createdAt,
		Instant updatedAt) {

	public ChildAccountResponse(final String id, final String username, final String firstName, final String lastName,
			final String displayName, final String parentId, final AccountRole role, final Instant createdAt) {
		this(id, username, firstName, lastName, displayName, parentId, role, true, createdAt, createdAt);
	}
}
