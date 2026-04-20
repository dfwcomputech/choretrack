package com.computech.ctui.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.config.ApiExceptionHandler;
import com.computech.ctui.reward.RewardDeleteResponse;
import com.computech.ctui.reward.RewardNotFoundException;
import com.computech.ctui.reward.RewardResponse;
import com.computech.ctui.reward.RewardService;

@Tag("unit")
class RewardApiControllerWebMvcUnitTests {

private final RewardService rewardService = mock(RewardService.class);
private final MockMvc mockMvc;

RewardApiControllerWebMvcUnitTests() {
final LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
validator.afterPropertiesSet();
this.mockMvc = MockMvcBuilders
.standaloneSetup(new RewardApiController(rewardService))
.setControllerAdvice(new ApiExceptionHandler())
.setValidator(validator)
.build();
}

@Test
void createRewardReturnsCreatedForParent() throws Exception {
when(rewardService.createReward(any(), eq("angie"))).thenReturn(new RewardResponse(
"reward-456",
"Extra gaming time",
"30 extra minutes of gaming time",
150,
true,
"SCREEN_TIME",
null,
Instant.parse("2026-04-19T10:00:00Z"),
Instant.parse("2026-04-19T10:00:00Z")));

mockMvc.perform(post("/api/rewards")
.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
.contentType(MediaType.APPLICATION_JSON)
.content("""
{
  "name":"Extra gaming time",
  "description":"30 extra minutes of gaming time",
  "pointCost":150,
  "active":true,
  "category":"SCREEN_TIME"
}
"""))
.andExpect(status().isCreated())
.andExpect(jsonPath("$.id").value("reward-456"))
.andExpect(jsonPath("$.name").value("Extra gaming time"));
}

@Test
void createRewardReturnsBadRequestForInvalidPayload() throws Exception {
mockMvc.perform(post("/api/rewards")
.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
.contentType(MediaType.APPLICATION_JSON)
.content("""
{
  "name":" ",
  "pointCost":0
}
"""))
.andExpect(status().isBadRequest())
.andExpect(jsonPath("$.errors").isArray());

verifyNoInteractions(rewardService);
}

@Test
void createRewardReturnsUnauthorizedWhenAuthenticationMissing() throws Exception {
mockMvc.perform(post("/api/rewards")
.contentType(MediaType.APPLICATION_JSON)
.content("""
{
  "name":"Extra gaming time",
  "pointCost":150
}
"""))
.andExpect(status().isUnauthorized());

verifyNoInteractions(rewardService);
}

@Test
void createRewardReturnsForbiddenForNonParent() throws Exception {
when(rewardService.createReward(any(), eq("preston1")))
.thenThrow(new ForbiddenOperationException("only parent users can manage rewards"));

mockMvc.perform(post("/api/rewards")
.principal(new UsernamePasswordAuthenticationToken("preston1", "n/a", List.of()))
.contentType(MediaType.APPLICATION_JSON)
.content("""
{
  "name":"Extra gaming time",
  "pointCost":150
}
"""))
.andExpect(status().isForbidden())
.andExpect(jsonPath("$.message").value("only parent users can manage rewards"));
}

@Test
void updateRewardReturnsForbiddenForNonOwnerParent() throws Exception {
when(rewardService.updateReward(eq("reward-456"), any(), eq("karen")))
.thenThrow(new ForbiddenOperationException("parent cannot access this reward"));

mockMvc.perform(put("/api/rewards/reward-456")
.principal(new UsernamePasswordAuthenticationToken("karen", "n/a", List.of()))
.contentType(MediaType.APPLICATION_JSON)
.content("""
{
  "name":"Extra gaming time",
  "description":"45 extra minutes of gaming time",
  "pointCost":200,
  "active":true,
  "category":"SCREEN_TIME"
}
"""))
.andExpect(status().isForbidden())
.andExpect(jsonPath("$.message").value("parent cannot access this reward"));
}

@Test
void updateRewardReturnsNotFoundForMissingReward() throws Exception {
when(rewardService.updateReward(eq("missing-reward"), any(), eq("angie")))
.thenThrow(new RewardNotFoundException("reward not found"));

mockMvc.perform(put("/api/rewards/missing-reward")
.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of()))
.contentType(MediaType.APPLICATION_JSON)
.content("""
{
  "name":"Extra gaming time",
  "pointCost":200,
  "active":true
}
"""))
.andExpect(status().isNotFound())
.andExpect(jsonPath("$.message").value("reward not found"));
}

	@Test
	void deleteRewardReturnsOkForParent() throws Exception {
		when(rewardService.deleteReward("reward-456", "angie"))
				.thenReturn(new RewardDeleteResponse("Reward deleted successfully"));

mockMvc.perform(delete("/api/rewards/reward-456")
.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.message").value("Reward deleted successfully"));
	}

	@Test
	void deleteRewardReturnsNotFoundForMissingReward() throws Exception {
		when(rewardService.deleteReward("missing-reward", "angie"))
				.thenThrow(new RewardNotFoundException("reward not found"));

		mockMvc.perform(delete("/api/rewards/missing-reward")
				.principal(new UsernamePasswordAuthenticationToken("angie", "n/a", List.of())))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.message").value("reward not found"));
	}

	@Test
	void deleteRewardReturnsUnauthorizedWhenAuthenticationMissing() throws Exception {
		mockMvc.perform(delete("/api/rewards/reward-456"))
.andExpect(status().isUnauthorized());

verifyNoInteractions(rewardService);
}
}
