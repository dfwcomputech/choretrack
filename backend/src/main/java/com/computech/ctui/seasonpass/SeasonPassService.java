package com.computech.ctui.seasonpass;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.computech.ctui.auth.AccountRole;
import com.computech.ctui.auth.ForbiddenOperationException;
import com.computech.ctui.auth.UserAccount;
import com.computech.ctui.auth.UserAccountRepository;
import com.computech.ctui.library.LibraryService;
import com.computech.ctui.library.SeasonTemplateRewardJpaEntity;
import com.computech.ctui.reward.Reward;
import com.computech.ctui.reward.RewardRepository;
import com.computech.ctui.reward.RewardResponse;

@Service
public class SeasonPassService {

	private final UserAccountRepository userAccountRepository;
	private final LibraryService libraryService;
	private final RewardRepository rewardRepository;

	public SeasonPassService(final UserAccountRepository userAccountRepository,
			final LibraryService libraryService,
			final RewardRepository rewardRepository) {
		this.userAccountRepository = userAccountRepository;
		this.libraryService = libraryService;
		this.rewardRepository = rewardRepository;
	}

	@Transactional
	public ApplyTemplateResponse applyTemplate(final String templateId, final boolean replace,
			final String authenticatedUsername) {
		final UserAccount parent = userAccountRepository.findByUsernameIgnoreCase(authenticatedUsername)
				.orElseThrow(() -> new ForbiddenOperationException("only parent users can apply season templates"));
		if (parent.role() != AccountRole.PARENT) {
			throw new ForbiddenOperationException("only parent users can apply season templates");
		}

		if (replace) {
			final List<Reward> existing = rewardRepository.findByParentId(parent.id());
			final Instant now = Instant.now();
			for (final Reward reward : existing) {
				if (reward.active()) {
					rewardRepository.save(new Reward(
							reward.id(),
							reward.name(),
							reward.description(),
							reward.pointCost(),
							false,
							reward.category(),
							reward.imageRef(),
							reward.parentId(),
							reward.createdAt(),
							now,
							now));
				}
			}
		}

		final List<SeasonTemplateRewardJpaEntity> templateRewards =
				libraryService.getSeasonTemplateRewards(templateId);
		final Instant now = Instant.now();
		final List<RewardResponse> created = templateRewards.stream()
				.map(templateReward -> {
					final Reward reward = rewardRepository.save(new Reward(
							UUID.randomUUID().toString(),
							templateReward.getName(),
							templateReward.getDescription(),
							templateReward.getPointCost(),
							true,
							templateReward.getCategory(),
							null,
							parent.id(),
							now,
							now,
							null));
					return toResponse(reward);
				})
				.toList();

		return new ApplyTemplateResponse(created);
	}

	private static RewardResponse toResponse(final Reward reward) {
		return new RewardResponse(
				reward.id(),
				reward.name(),
				reward.description(),
				reward.pointCost(),
				reward.active(),
				reward.category(),
				reward.imageRef(),
				reward.createdAt(),
				reward.updatedAt());
	}
}
