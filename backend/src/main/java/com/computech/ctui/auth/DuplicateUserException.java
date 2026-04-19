package com.computech.ctui.auth;

public class DuplicateUserException extends RuntimeException {

	private final String field;

	public DuplicateUserException(final String field, final String message) {
		super(message);
		this.field = field;
	}

	public String getField() {
		return field;
	}
}
