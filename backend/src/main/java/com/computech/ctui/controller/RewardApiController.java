package com.computech.ctui.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.computech.ctui.reward.RewardCreateRequest;
import com.computech.ctui.reward.RewardDeleteResponse;
import com.computech.ctui.reward.RewardResponse;
import com.computech.ctui.reward.RewardService;
import com.computech.ctui.reward.RewardUpdateRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rewards")
public class RewardApiController {

private final RewardService rewardService;

public RewardApiController(final RewardService rewardService) {
this.rewardService = rewardService;
}

@PostMapping
public ResponseEntity<RewardResponse> createReward(@Valid @RequestBody final RewardCreateRequest request,
final Authentication authentication) {
if (authentication == null || !authentication.isAuthenticated()) {
return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}
return ResponseEntity.status(HttpStatus.CREATED)
.body(rewardService.createReward(request, authentication.getName()));
}

@PutMapping("/{rewardId}")
public ResponseEntity<RewardResponse> updateReward(@PathVariable final String rewardId,
@Valid @RequestBody final RewardUpdateRequest request, final Authentication authentication) {
if (authentication == null || !authentication.isAuthenticated()) {
return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}
return ResponseEntity.ok(rewardService.updateReward(rewardId, request, authentication.getName()));
}

@DeleteMapping("/{rewardId}")
public ResponseEntity<RewardDeleteResponse> deleteReward(@PathVariable final String rewardId,
final Authentication authentication) {
if (authentication == null || !authentication.isAuthenticated()) {
return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}
return ResponseEntity.ok(rewardService.deleteReward(rewardId, authentication.getName()));
}
}
