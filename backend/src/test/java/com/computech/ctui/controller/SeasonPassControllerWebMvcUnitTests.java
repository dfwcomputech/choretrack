package com.computech.ctui.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.config.ApiExceptionHandler;
import com.computech.ctui.library.SeasonTemplateNotFoundException;
import com.computech.ctui.reward.RewardResponse;
import com.computech.ctui.seasonpass.ApplyTemplateResponse;
import com.computech.ctui.seasonpass.SeasonPassService;

@Tag("unit")
class SeasonPassControllerWebMvcUnitTests {

	private final SeasonPassService seasonPassService = mock(SeasonPassService.class);
	private final MockMvc mockMvc;

	SeasonPassControllerWebMvcUnitTests() {
		this.mockMvc = MockMvcBuilders
				.standaloneSetup(new SeasonPassController(seasonPassService))
				.setControllerAdvice(new ApiExceptionHandler())
				.build();
	}

	@Test
	void applyTemplateReturnsOkForParent() throws Exception {
		final List<RewardResponse> rewards = List.of(
				new RewardResponse("r-1", "Ice Cream Treat", "Pick your favorite ice cream", 80, true, "Food", null,
						Instant.parse("2026-04-01T10:00:00Z"), Instant.parse("2026-04-01T10:00:00Z")),
				new RewardResponse("r-2", "Movie Night", "Choose a movie with the family", 200, true, "Outing", null,
						Instant.parse("2026-04-01T10:00:00Z"), Instant.parse("2026-04-01T10:00:00Z")));
		when(seasonPassService.applyTemplate(eq("season-template-1"), eq(true), eq("angie")))
				.thenReturn(new ApplyTemplateResponse(rewards));

		mockMvc.perform(post("/api/season-pass/templates/season-template-1/apply")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"replace\":true}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.rewards").isArray())
				.andExpect(jsonPath("$.rewards.length()").value(2))
				.andExpect(jsonPath("$.rewards[0].id").value("r-1"))
				.andExpect(jsonPath("$.rewards[0].name").value("Ice Cream Treat"));
	}

	@Test
	void applyTemplateDefaultsToReplaceWhenBodyIsAbsent() throws Exception {
		when(seasonPassService.applyTemplate(eq("season-template-1"), eq(true), eq("angie")))
				.thenReturn(new ApplyTemplateResponse(List.of()));

		mockMvc.perform(post("/api/season-pass/templates/season-template-1/apply")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of())))
				.andExpect(status().isOk());
	}

	@Test
	void applyTemplateReturnsUnauthorizedWhenAuthenticationMissing() throws Exception {
		mockMvc.perform(post("/api/season-pass/templates/season-template-1/apply")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"replace\":true}"))
				.andExpect(status().isUnauthorized());

		verifyNoInteractions(seasonPassService);
	}

	@Test
	void applyTemplateReturnsForbiddenForNonParent() throws Exception {
		when(seasonPassService.applyTemplate(any(), any(Boolean.class), eq("child1")))
				.thenThrow(new ForbiddenOperationException("only parent users can apply season templates"));

		mockMvc.perform(post("/api/season-pass/templates/season-template-1/apply")
				.principal(new UsernamePasswordAuthenticationToken("child1", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"replace\":true}"))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.message").value("only parent users can apply season templates"));
	}

	@Test
	void applyTemplateReturnsNotFoundForMissingTemplate() throws Exception {
		when(seasonPassService.applyTemplate(eq("missing-template"), any(Boolean.class), eq("angie")))
				.thenThrow(new SeasonTemplateNotFoundException("season template not found"));

		mockMvc.perform(post("/api/season-pass/templates/missing-template/apply")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"replace\":true}"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("season template not found"));
	}
}
