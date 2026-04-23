package com.computech.ctui.chore;

import java.time.LocalDate;

public record ChildDashboardCalendarEntryResponse(
		LocalDate date,
		String choreId,
		String title,
		ChoreStatus status) {
}
