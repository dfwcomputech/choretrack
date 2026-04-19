package com.computech.ctui.auth;

public class ForbiddenOperationException extends RuntimeException {

	public ForbiddenOperationException(final String message) {
		super(message);
	}
}
