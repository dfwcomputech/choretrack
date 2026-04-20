package com.computech.ctui.chore;

import java.time.Instant;

public record ChoreCompletionResponse(
		String choreId,
		ChoreStatus status,
		String completedByChildId,
		int pointsAwarded,
		int childCurrentPoints,
		Instant completedAt) {
}
