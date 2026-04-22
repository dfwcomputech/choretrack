package com.computech.ctui.chore;

import java.time.DayOfWeek;

public enum RecurrenceDayOfWeek {
	MON(DayOfWeek.MONDAY),
	TUE(DayOfWeek.TUESDAY),
	WED(DayOfWeek.WEDNESDAY),
	THU(DayOfWeek.THURSDAY),
	FRI(DayOfWeek.FRIDAY),
	SAT(DayOfWeek.SATURDAY),
	SUN(DayOfWeek.SUNDAY);

	private final DayOfWeek dayOfWeek;

	RecurrenceDayOfWeek(final DayOfWeek dayOfWeek) {
		this.dayOfWeek = dayOfWeek;
	}

	public DayOfWeek toDayOfWeek() {
		return dayOfWeek;
	}
}
