package com.computech.ctui.library;

public record RewardTemplateResponse(
		String id,
		String name,
		String description,
		int suggestedPoints,
		String category) {
}
