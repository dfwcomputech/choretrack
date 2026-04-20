package com.computech.ctui.chore;

import java.time.Instant;
import java.time.LocalDate;

public record ChoreResponse(
		String id,
		String title,
		String description,
		int points,
		String assignedChildId,
		String assignedChildName,
		LocalDate dueDate,
		ChoreStatus status,
		Instant createdAt,
		Instant updatedAt) {
}
