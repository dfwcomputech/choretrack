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
		Instant deletedAt) {
}
