package com.computech.ctui.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.computech.ctui.seasonpass.ApplyTemplateRequest;
import com.computech.ctui.seasonpass.ApplyTemplateResponse;
import com.computech.ctui.seasonpass.SeasonPassService;

@RestController
@RequestMapping("/api/season-pass")
public class SeasonPassController {

	private final SeasonPassService seasonPassService;

	public SeasonPassController(final SeasonPassService seasonPassService) {
		this.seasonPassService = seasonPassService;
	}

	@PostMapping("/templates/{templateId}/apply")
	public ResponseEntity<ApplyTemplateResponse> applyTemplate(
			@PathVariable final String templateId,
			@RequestBody(required = false) final ApplyTemplateRequest request,
			final Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(401).build();
		}
		final boolean replace = request == null || request.replace();
		return ResponseEntity.ok(seasonPassService.applyTemplate(templateId, replace, authentication.getName()));
	}
}
