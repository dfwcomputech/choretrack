package com.computech.ctui.chore;

public class DuplicateChoreException extends RuntimeException {

	private final String field;

	public DuplicateChoreException(final String message, final String field) {
		super(message);
		this.field = field;
	}

	public String getField() {
		return field;
	}
}
