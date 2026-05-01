package com.computech.ctui.library;

public record SeasonTemplateRewardResponse(
		String id,
		String name,
		String description,
		int pointCost,
		String category,
		int sortOrder) {
}
