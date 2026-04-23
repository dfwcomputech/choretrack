package com.computech.ctui.seasonpass;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SeasonPassRepository extends JpaRepository<SeasonPass, String> {

	Optional<SeasonPass> findByParentId(String parentId);
}
