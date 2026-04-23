package com.computech.ctui.chore;

import java.util.List;

public record ChildDashboardCalendarResponse(
		int month,
		int year,
		List<ChildDashboardCalendarEntryResponse> entries) {
}
