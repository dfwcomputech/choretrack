package com.computech.ctui.library;

import java.util.List;

public record SeasonTemplateResponse(
		String id,
		String name,
		String description,
		int rewardCount,
		List<SeasonTemplateRewardResponse> rewards) {
}
