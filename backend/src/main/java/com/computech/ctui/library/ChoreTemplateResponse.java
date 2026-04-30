package com.computech.ctui.library;

public record ChoreTemplateResponse(
		String id,
		String title,
		String description,
		int suggestedPoints,
		String category) {
}
