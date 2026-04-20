package com.computech.ctui.chore;

public class ChoreAlreadyCompletedException extends RuntimeException {

	public ChoreAlreadyCompletedException(final String message) {
		super(message);
	}
}
