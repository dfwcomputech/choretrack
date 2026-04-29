package com.computech.ctui.auth;

public class AccountPlanLimitException extends RuntimeException {

	private final String field;

	public AccountPlanLimitException(final String message, final String field) {
		super(message);
		this.field = field;
	}

	public String getField() {
		return field;
	}
}
