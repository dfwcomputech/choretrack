package com.computech.ctui.chore;

import java.time.Instant;
import java.time.LocalDate;

public record Chore(
		String id,
		String title,
		String description,
		int points,
		String assignedChildId,
		LocalDate dueDate,
		ChoreStatus status,
		String parentId,
		Instant createdAt,
		Instant updatedAt,
		boolean active,
		Instant deletedAt,
		Instant completedAt,
		String completedByChildId) {

	public Chore(final String id, final String title, final String description, final int points,
			final String assignedChildId, final LocalDate dueDate, final ChoreStatus status, final String parentId,
			final Instant createdAt, final Instant updatedAt, final boolean active, final Instant deletedAt) {
		this(id, title, description, points, assignedChildId, dueDate, status, parentId, createdAt, updatedAt, active,
				deletedAt, null, null);
	}
}
