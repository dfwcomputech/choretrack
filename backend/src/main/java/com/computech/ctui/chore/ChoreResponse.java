package com.computech.ctui.chore;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

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
		Instant updatedAt,
		String recurrenceSeriesId,
		ChoreRecurrenceResponse recurrence) {

	public record ChoreRecurrenceResponse(
			RecurrenceType type,
			LocalDate startDate,
			LocalDate endDate,
			List<String> daysOfWeek,
			String timeOfDay) {
	}
}
