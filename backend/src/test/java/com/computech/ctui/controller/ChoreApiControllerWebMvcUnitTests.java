package com.computech.ctui.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.chore.ChoreChildNotFoundException;
import com.computech.ctui.chore.ChoreCompletionResponse;
import com.computech.ctui.chore.ChoreAlreadyCompletedException;
import com.computech.ctui.chore.ChoreDeleteResponse;
import com.computech.ctui.chore.ChoreNotFoundException;
import com.computech.ctui.chore.ChoreResponse;
import com.computech.ctui.chore.ChoreService;
import com.computech.ctui.chore.ChoreStatus;
import com.computech.ctui.config.ApiExceptionHandler;

@Tag("unit")
class ChoreApiControllerWebMvcUnitTests {

	private final ChoreService choreService = mock(ChoreService.class);
	private final MockMvc mockMvc;

	ChoreApiControllerWebMvcUnitTests() {
		final LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
		validator.afterPropertiesSet();
		this.mockMvc = MockMvcBuilders
				.standaloneSetup(new ChoreApiController(choreService))
				.setControllerAdvice(new ApiExceptionHandler())
				.setValidator(validator)
				.build();
	}

	@Test
	void createChoreReturnsCreatedForParent() throws Exception {
		when(choreService.createChore(any(), eq("angie"))).thenReturn(new ChoreResponse(
				"chore-123",
				"Clean room",
				"Pick up clothes",
				25,
				"child-123",
				"Preston",
				LocalDate.parse("2026-04-25"),
				ChoreStatus.PENDING,
				Instant.parse("2026-04-19T10:00:00Z"),
				Instant.parse("2026-04-19T10:00:00Z")));

		mockMvc.perform(post("/api/chores")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "title":"Clean room",
						  "description":"Pick up clothes",
						  "points":25,
						  "assignedChildId":"child-123",
						  "dueDate":"2026-04-25"
						}
						"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value("chore-123"))
				.andExpect(jsonPath("$.assignedChildName").value("Preston"))
				.andExpect(jsonPath("$.status").value("PENDING"));
	}

	@Test
	void createChoreReturnsBadRequestForInvalidPayload() throws Exception {
		mockMvc.perform(post("/api/chores")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "title":" ",
						  "points":0,
						  "assignedChildId":" "
						}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.errors").isArray());

		verifyNoInteractions(choreService);
	}

	@Test
	void createChoreReturnsUnauthorizedWhenAuthenticationMissing() throws Exception {
		mockMvc.perform(post("/api/chores")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "title":"Clean room",
						  "points":25,
						  "assignedChildId":"child-123"
						}
						"""))
				.andExpect(status().isUnauthorized());

		verifyNoInteractions(choreService);
	}

	@Test
	void createChoreReturnsForbiddenForNonParent() throws Exception {
		when(choreService.createChore(any(), eq("preston1")))
				.thenThrow(new ForbiddenOperationException("only parent users can manage chores"));

		mockMvc.perform(post("/api/chores")
				.principal(new UsernamePasswordAuthenticationToken("preston1", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "title":"Clean room",
						  "points":25,
						  "assignedChildId":"child-123"
						}
						"""))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.message").value("only parent users can manage chores"));
	}

	@Test
	void createChoreReturnsForbiddenWhenChildBelongsToAnotherParent() throws Exception {
		when(choreService.createChore(any(), eq("angie")))
				.thenThrow(new ForbiddenOperationException("parent cannot access this child account"));

		mockMvc.perform(post("/api/chores")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "title":"Clean room",
						  "points":25,
						  "assignedChildId":"child-other-parent"
						}
						"""))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.message").value("parent cannot access this child account"));
	}

	@Test
	void createChoreReturnsNotFoundForInvalidChild() throws Exception {
		when(choreService.createChore(any(), eq("angie")))
				.thenThrow(new ChoreChildNotFoundException("child account not found"));

		mockMvc.perform(post("/api/chores")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "title":"Clean room",
						  "points":25,
						  "assignedChildId":"missing-child"
						}
						"""))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("child account not found"));
	}

	@Test
	void updateChoreReturnsOkForParent() throws Exception {
		when(choreService.updateChore(eq("chore-123"), any(), eq("angie"))).thenReturn(new ChoreResponse(
				"chore-123",
				"Clean room",
				"Pick up clothes and vacuum",
				30,
				"child-123",
				"Preston",
				LocalDate.parse("2026-04-26"),
				ChoreStatus.PENDING,
				Instant.parse("2026-04-19T10:00:00Z"),
				Instant.parse("2026-04-19T10:15:00Z")));

		mockMvc.perform(put("/api/chores/chore-123")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "title":"Clean room",
						  "description":"Pick up clothes and vacuum",
						  "points":30,
						  "assignedChildId":"child-123",
						  "dueDate":"2026-04-26",
						  "status":"PENDING"
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.points").value(30))
				.andExpect(jsonPath("$.dueDate").value("2026-04-26"));
	}

	@Test
	void updateChoreReturnsNotFoundForMissingChore() throws Exception {
		when(choreService.updateChore(eq("missing-chore"), any(), eq("angie")))
				.thenThrow(new ChoreNotFoundException("chore not found"));

		mockMvc.perform(put("/api/chores/missing-chore")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "title":"Clean room",
						  "points":30,
						  "assignedChildId":"child-123"
						}
						"""))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("chore not found"));
	}

	@Test
	void deleteChoreReturnsOkForParent() throws Exception {
		when(choreService.deleteChore("chore-123", "angie")).thenReturn(new ChoreDeleteResponse("Chore deleted successfully"));

		mockMvc.perform(delete("/api/chores/chore-123")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("Chore deleted successfully"));
	}

	@Test
	void completeChoreReturnsOkForAssignedChild() throws Exception {
		when(choreService.completeChore("chore-123", "preston1")).thenReturn(new ChoreCompletionResponse(
				"chore-123",
				ChoreStatus.COMPLETED,
				"child-123",
				25,
				140,
				Instant.parse("2026-04-19T10:30:00Z")));

		mockMvc.perform(post("/api/chores/chore-123/complete")
				.principal(new UsernamePasswordAuthenticationToken("preston1", "n/a", List.of())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("COMPLETED"))
				.andExpect(jsonPath("$.pointsAwarded").value(25))
				.andExpect(jsonPath("$.childCurrentPoints").value(140));
	}

	@Test
	void completeChoreReturnsConflictWhenAlreadyCompleted() throws Exception {
		when(choreService.completeChore("chore-123", "preston1"))
				.thenThrow(new ChoreAlreadyCompletedException("chore has already been completed"));

		mockMvc.perform(post("/api/chores/chore-123/complete")
				.principal(new UsernamePasswordAuthenticationToken("preston1", "n/a", List.of())))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("chore has already been completed"));
	}

	@Test
	void completeChoreReturnsUnauthorizedWhenAuthenticationMissing() throws Exception {
		mockMvc.perform(post("/api/chores/chore-123/complete"))
				.andExpect(status().isUnauthorized());

		verifyNoInteractions(choreService);
	}
}
