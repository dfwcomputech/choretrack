package com.computech.ctui.chore;

public class ChoreAlreadyPendingException extends RuntimeException {

	public ChoreAlreadyPendingException(final String message) {
		super(message);
	}
}
