package com.computech.ctui.chore;

import java.time.LocalDate;
import java.util.List;

public record ChildDashboardResponse(
		ChildDashboardChildResponse child,
		LocalDate selectedDate,
		boolean selectedDateIsToday,
		List<ChildDashboardChoreResponse> chores,
		ChildDashboardCalendarResponse calendar) {
}
