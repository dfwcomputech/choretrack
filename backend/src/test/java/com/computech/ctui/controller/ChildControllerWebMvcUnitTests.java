package com.computech.ctui.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
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
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.computech.ctui.auth.AccountRole;
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
}
