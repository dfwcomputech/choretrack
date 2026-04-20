package com.computech.ctui.config;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.computech.ctui.auth.DuplicateUserException;
import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.auth.ChildAccountNotFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ValidationErrorResponse> handleValidationException(
			final MethodArgumentNotValidException exception) {
		final List<ValidationError> errors = exception.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(this::toValidationError)
				.toList();
		return ResponseEntity.badRequest().body(new ValidationErrorResponse(errors));
	}

	@ExceptionHandler(DuplicateUserException.class)
	public ResponseEntity<ErrorResponse> handleDuplicateUserException(final DuplicateUserException exception) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(new ErrorResponse(exception.getMessage(), exception.getField()));
	}

	@ExceptionHandler(ForbiddenOperationException.class)
	public ResponseEntity<ErrorResponse> handleForbiddenOperationException(final ForbiddenOperationException exception) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(new ErrorResponse(exception.getMessage(), null));
	}

	@ExceptionHandler(ChildAccountNotFoundException.class)
	public ResponseEntity<ErrorResponse> handleChildAccountNotFoundException(final ChildAccountNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ErrorResponse(exception.getMessage(), null));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleUnexpectedException(final Exception exception) {
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new ErrorResponse("internal server error", null));
	}

	private ValidationError toValidationError(final FieldError fieldError) {
		return new ValidationError(fieldError.getField(), fieldError.getDefaultMessage());
	}

	public record ErrorResponse(String message, String field) {
	}

	public record ValidationError(String field, String message) {
	}

	public record ValidationErrorResponse(List<ValidationError> errors) {
	}
}
