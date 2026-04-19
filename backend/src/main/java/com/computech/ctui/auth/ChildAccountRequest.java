package com.computech.ctui.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChildAccountRequest(
		@NotBlank(message = "username is required")
		@Pattern(regexp = "^[A-Za-z0-9_]+$", message = "username must contain only letters, numbers, or underscores")
		String username,
		@NotBlank(message = "password is required")
		@Size(min = 8, message = "password must be at least 8 characters")
		String password,
		@NotBlank(message = "firstName is required")
		String firstName,
		String lastName,
		@Size(max = 100, message = "displayName must be at most 100 characters")
		String displayName) {
}
