package com.computech.ctui.controller;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.chore.ChildDashboardCalendarResponse;
import com.computech.ctui.chore.ChildDashboardChildResponse;
import com.computech.ctui.chore.ChildDashboardChoreResponse;
import com.computech.ctui.chore.ChildDashboardResponse;
import com.computech.ctui.chore.ChoreService;
import com.computech.ctui.chore.ChoreStatus;
import com.computech.ctui.config.ApiExceptionHandler;

@Tag("unit")
class ChildDashboardControllerWebMvcUnitTests {

	private final ChoreService choreService = mock(ChoreService.class);
	private final MockMvc mockMvc = MockMvcBuilders
			.standaloneSetup(new ChildDashboardController(choreService))
			.setControllerAdvice(new ApiExceptionHandler())
			.build();

	@Test
	void getChildDashboardDefaultsToTodayWhenDateMissing() throws Exception {
		when(choreService.getChildDashboard("preston1", null)).thenReturn(new ChildDashboardResponse(
				new ChildDashboardChildResponse("child-123", "Preston", 140, 2, 60),
				LocalDate.now(),
				true,
				List.of(),
				new ChildDashboardCalendarResponse(LocalDate.now().getMonthValue(), LocalDate.now().getYear(), List.of())));

		mockMvc.perform(get("/api/child/dashboard")
				.principal(new UsernamePasswordAuthenticationToken("preston1", "n/a", List.of())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.child.id").value("child-123"))
				.andExpect(jsonPath("$.selectedDateIsToday").value(true));

		verify(choreService).getChildDashboard("preston1", null);
	}

	@Test
	void getChildDashboardReturnsSelectedDateChores() throws Exception {
		when(choreService.getChildDashboard("preston1", "2026-04-22")).thenReturn(new ChildDashboardResponse(
				new ChildDashboardChildResponse("child-123", "Preston", 140, 2, 60),
				LocalDate.parse("2026-04-22"),
				false,
				List.of(new ChildDashboardChoreResponse(
						"chore-1",
						"Feed Jessie",
						"Before school",
						LocalDate.parse("2026-04-22"),
						10,
						ChoreStatus.PENDING)),
				new ChildDashboardCalendarResponse(4, 2026, List.of())));

		mockMvc.perform(get("/api/child/dashboard")
				.param("date", "2026-04-22")
				.principal(new UsernamePasswordAuthenticationToken("preston1", "n/a", List.of())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.selectedDate").value("2026-04-22"))
				.andExpect(jsonPath("$.chores[0].id").value("chore-1"));

		verify(choreService).getChildDashboard("preston1", "2026-04-22");
	}

	@Test
	void getChildDashboardReturnsBadRequestForInvalidDate() throws Exception {
		when(choreService.getChildDashboard("preston1", "2026/04/22"))
				.thenThrow(new IllegalArgumentException("Invalid date format. Expected yyyy-MM-dd"));

		mockMvc.perform(get("/api/child/dashboard")
				.param("date", "2026/04/22")
				.principal(new UsernamePasswordAuthenticationToken("preston1", "n/a", List.of())))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("Invalid date format. Expected yyyy-MM-dd"));
	}

	@Test
	void getChildDashboardReturnsForbiddenForNonChildUser() throws Exception {
		when(choreService.getChildDashboard("angie", "2026-04-22"))
				.thenThrow(new ForbiddenOperationException("only child users can view child dashboard"));

		mockMvc.perform(get("/api/child/dashboard")
				.param("date", "2026-04-22")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of())))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.message").value("only child users can view child dashboard"));
	}

	@Test
	void getChildDashboardReturnsUnauthorizedWhenAuthenticationMissing() throws Exception {
		mockMvc.perform(get("/api/child/dashboard"))
				.andExpect(status().isUnauthorized());

		verifyNoInteractions(choreService);
	}
}
