package com.computech.ctui.chore;

import java.time.LocalDate;

public record ChildDashboardChoreResponse(
		String id,
		String title,
		String description,
		LocalDate dueDate,
		int points,
		ChoreStatus status) {
}
