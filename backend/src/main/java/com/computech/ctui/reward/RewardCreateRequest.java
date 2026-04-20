package com.computech.ctui.reward;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record RewardCreateRequest(
@NotBlank(message = "name is required")
@Size(max = 150, message = "name must be at most 150 characters")
String name,
@Size(max = 1000, message = "description must be at most 1000 characters")
String description,
@NotNull(message = "pointCost is required")
@Positive(message = "pointCost must be positive")
Integer pointCost,
Boolean active,
@Size(max = 100, message = "category must be at most 100 characters")
String category,
@Size(max = 255, message = "imageRef must be at most 255 characters")
String imageRef) {
}
