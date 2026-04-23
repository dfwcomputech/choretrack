package com.computech.ctui.auth;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChildRepository extends JpaRepository<UserAccountJpaEntity, String> {

	List<UserAccountJpaEntity> findByParentIdAndRole(String parentId, AccountRole role);
}
