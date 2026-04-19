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
		Instant createdAt) {
}
