package com.computech.ctui.library;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataSeasonTemplateRewardRepository extends JpaRepository<SeasonTemplateRewardJpaEntity, String> {

	List<SeasonTemplateRewardJpaEntity> findAllByTemplateIdOrderBySortOrderAsc(String templateId);
}
