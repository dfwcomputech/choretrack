package com.computech.ctui.auth;

public record RegistrationResponse(
		String id,
		String username,
		String email,
		String firstName,
		String lastName,
		AccountType accountType) {
}
