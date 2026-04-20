package com.computech.ctui.chore;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ChoreUpdateRequest(
		@NotBlank(message = "title is required")
		@Size(max = 150, message = "title must be at most 150 characters")
		String title,
		@Size(max = 1000, message = "description must be at most 1000 characters")
		String description,
		@NotNull(message = "points is required")
		@Positive(message = "points must be positive")
		Integer points,
		@NotBlank(message = "assignedChildId is required")
		String assignedChildId,
		LocalDate dueDate,
		ChoreStatus status) {
}
