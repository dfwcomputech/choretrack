package com.computech.ctui.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.computech.ctui.auth.AccountRole;
import com.computech.ctui.auth.ChildAccountDeleteResponse;
import com.computech.ctui.auth.ChildAccountNotFoundException;
import com.computech.ctui.auth.ChildAccountResponse;
import com.computech.ctui.auth.ChildAccountService;
import com.computech.ctui.auth.DuplicateUserException;
import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.config.ApiExceptionHandler;

@Tag("unit")
class ChildControllerWebMvcUnitTests {

	private final ChildAccountService childAccountService = mock(ChildAccountService.class);
	private final MockMvc mockMvc;

	ChildControllerWebMvcUnitTests() {
		final LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
		validator.afterPropertiesSet();
		this.mockMvc = MockMvcBuilders
				.standaloneSetup(new ChildController(childAccountService))
				.setControllerAdvice(new ApiExceptionHandler())
				.setValidator(validator)
				.build();
	}

	@Test
	void createChildReturnsCreatedForParent() throws Exception {
		when(childAccountService.createChild(any(), eq("angie"))).thenReturn(new ChildAccountResponse(
				"generated-id", "preston1", "Preston", "Family", "Preston", "parent-id", AccountRole.CHILD,
				Instant.parse("2026-04-19T10:00:00Z")));

		mockMvc.perform(post("/api/children")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "username":"preston1",
						  "password":"SecurePassword123",
						  "firstName":"Preston",
						  "lastName":"Family",
						  "displayName":"Preston"
						}
						"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value("generated-id"))
				.andExpect(jsonPath("$.parentId").value("parent-id"))
				.andExpect(jsonPath("$.role").value("CHILD"));
	}

	@Test
	void createChildReturnsUnauthorizedWhenAuthenticationMissing() throws Exception {
		mockMvc.perform(post("/api/children")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "username":"preston1",
						  "password":"SecurePassword123",
						  "firstName":"Preston"
						}
						"""))
				.andExpect(status().isUnauthorized());

		verifyNoInteractions(childAccountService);
	}

	@Test
	void createChildReturnsForbiddenForNonParent() throws Exception {
		when(childAccountService.createChild(any(), eq("preston1")))
				.thenThrow(new ForbiddenOperationException("only parent users can create child accounts"));

		mockMvc.perform(post("/api/children")
				.principal(new UsernamePasswordAuthenticationToken("preston1", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "username":"rylan1",
						  "password":"SecurePassword123",
						  "firstName":"Rylan"
						}
						"""))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.message").value("only parent users can create child accounts"));
	}

	@Test
	void createChildReturnsConflictForDuplicateUsername() throws Exception {
		when(childAccountService.createChild(any(), eq("angie")))
				.thenThrow(new DuplicateUserException("username", "username already exists"));

		mockMvc.perform(post("/api/children")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "username":"preston1",
						  "password":"SecurePassword123",
						  "firstName":"Preston"
						}
						"""))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.field").value("username"));
	}

	@Test
	void createChildReturnsBadRequestForInvalidPayload() throws Exception {
		mockMvc.perform(post("/api/children")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "username":" ",
						  "password":"short",
						  "firstName":" "
						}
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.errors").isArray());

		verifyNoInteractions(childAccountService);
	}

	@Test
	void createChildCallsServiceWithAuthenticatedUsername() throws Exception {
		when(childAccountService.createChild(any(), eq("angie"))).thenReturn(new ChildAccountResponse(
				"generated-id", "preston1", "Preston", "", "Preston", "parent-id", AccountRole.CHILD, Instant.now()));

		mockMvc.perform(post("/api/children")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "username":"preston1",
						  "password":"SecurePassword123",
						  "firstName":"Preston"
						}
						"""))
				.andExpect(status().isCreated());

		verify(childAccountService).createChild(any(), eq("angie"));
	}

	@Test
	void listChildrenReturnsUnauthorizedWhenAuthenticationMissing() throws Exception {
		mockMvc.perform(get("/api/children"))
				.andExpect(status().isUnauthorized());

		verifyNoInteractions(childAccountService);
	}

	@Test
	void listChildrenReturnsActiveChildrenForParent() throws Exception {
		when(childAccountService.listActiveChildren("angie")).thenReturn(List.of(
				new ChildAccountResponse("child-a", "preston1", "Preston", "Family", "Preston", "parent-id",
						AccountRole.CHILD, true, Instant.parse("2026-04-19T10:00:00Z"),
						Instant.parse("2026-04-19T10:00:00Z"))));

		mockMvc.perform(get("/api/children")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id").value("child-a"))
				.andExpect(jsonPath("$[0].active").value(true));
	}

	@Test
	void updateChildReturnsOkForParent() throws Exception {
		when(childAccountService.updateChild(eq("child-id"), any(), eq("angie"))).thenReturn(new ChildAccountResponse(
				"child-id", "preston1", "Preston", "Family", "Preston", "parent-id", AccountRole.CHILD, true,
				Instant.parse("2026-04-19T10:00:00Z"), Instant.parse("2026-04-20T10:00:00Z")));

		mockMvc.perform(put("/api/children/child-id")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "firstName":"Preston",
						  "lastName":"Family",
						  "displayName":"Preston"
						}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value("child-id"))
				.andExpect(jsonPath("$.active").value(true));
	}

	@Test
	void updateChildReturnsBadRequestForInvalidPayload() throws Exception {
		mockMvc.perform(put("/api/children/child-id")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "firstName":" ",
						  "displayName":"Preston"
						}
						"""))
				.andExpect(status().isBadRequest());

		verifyNoInteractions(childAccountService);
	}

	@Test
	void updateChildReturnsForbiddenForNonOwnerParent() throws Exception {
		when(childAccountService.updateChild(eq("child-id"), any(), eq("karen")))
				.thenThrow(new ForbiddenOperationException("parent cannot access this child account"));

		mockMvc.perform(put("/api/children/child-id")
				.principal(new UsernamePasswordAuthenticationToken("karen", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "firstName":"Preston"
						}
						"""))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.message").value("parent cannot access this child account"));
	}

	@Test
	void updateChildReturnsNotFoundForInvalidChildId() throws Exception {
		when(childAccountService.updateChild(eq("missing-id"), any(), eq("angie")))
				.thenThrow(new ChildAccountNotFoundException("child account not found"));

		mockMvc.perform(put("/api/children/missing-id")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "firstName":"Preston"
						}
						"""))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("child account not found"));
	}

	@Test
	void hideChildReturnsOkForParent() throws Exception {
		when(childAccountService.hideChild("child-id", "angie"))
				.thenReturn(new ChildAccountDeleteResponse("Child account hidden successfully"));

		mockMvc.perform(delete("/api/children/child-id")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("Child account hidden successfully"));
	}

	@Test
	void hideChildReturnsUnauthorizedWhenAuthenticationMissing() throws Exception {
		mockMvc.perform(delete("/api/children/child-id"))
				.andExpect(status().isUnauthorized());

		verifyNoInteractions(childAccountService);
	}
}
