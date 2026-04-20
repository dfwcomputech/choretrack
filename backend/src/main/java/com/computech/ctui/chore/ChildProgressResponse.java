package com.computech.ctui.chore;

import java.time.Instant;

public record ChildProgressResponse(
		String childId,
		String childName,
		int currentPoints,
		int totalEarnedPoints,
		int completedChores,
		int pendingChores,
		int nextLevelAt,
		Instant updatedAt) {
}
