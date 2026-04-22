package com.computech.ctui.chore;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChoreRecurrenceRequest(
		@NotNull(message = "recurrence.type is required")
		RecurrenceType type,
		@NotNull(message = "recurrence.startDate is required")
		LocalDate startDate,
		@NotNull(message = "recurrence.endDate is required")
		LocalDate endDate,
		@Size(max = 7, message = "recurrence.daysOfWeek must include at most 7 days")
		Set<RecurrenceDayOfWeek> daysOfWeek,
		@Size(max = 100, message = "recurrence.timeOfDay must be at most 100 characters")
		String timeOfDay) {

	@AssertTrue(message = "recurrence.endDate must be on or after recurrence.startDate")
	public boolean isDateRangeValid() {
		if (startDate == null || endDate == null) {
			return true;
		}
		return !endDate.isBefore(startDate);
	}

	public Set<DayOfWeek> asJavaDaysOfWeek() {
		if (daysOfWeek == null || daysOfWeek.isEmpty()) {
			return Set.of();
		}
		return daysOfWeek.stream()
				.map(RecurrenceDayOfWeek::toDayOfWeek)
				.collect(Collectors.toSet());
	}
}
