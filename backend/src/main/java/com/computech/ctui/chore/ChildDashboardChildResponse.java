package com.computech.ctui.chore;

public record ChildDashboardChildResponse(
		String id,
		String displayName,
		int currentPoints,
		int currentLevel,
		int pointsToNextLevel) {
}
