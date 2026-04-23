package com.computech.ctui.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

@Tag("unit")
class DemoUserDataInitializerUnitTests {

	@Test
	void seedsDemoUsersWhenTheyDoNotExist() {
		final UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
		final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

		when(passwordEncoder.encode("password")).thenReturn("encoded-password");
		when(userAccountRepository.countAll()).thenReturn(0L);
		when(userAccountRepository.existsByUsernameIgnoreCase(any())).thenReturn(false);
		when(userAccountRepository.existsByEmailIgnoreCase(any())).thenReturn(false);

		new DemoUserDataInitializer(userAccountRepository, passwordEncoder);

		verify(userAccountRepository, times(4)).save(any(UserAccount.class));
		verify(passwordEncoder, times(4)).encode("password");
	}

	@Test
	void doesNotSeedUsersThatAlreadyExist() {
		final UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
		final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

		when(userAccountRepository.existsByUsernameIgnoreCase(eq("angie"))).thenReturn(true);
		when(userAccountRepository.existsByUsernameIgnoreCase(eq("preston"))).thenReturn(false);
		when(userAccountRepository.existsByUsernameIgnoreCase(eq("rylan"))).thenReturn(false);
		when(userAccountRepository.existsByUsernameIgnoreCase(eq("karla"))).thenReturn(false);
		when(userAccountRepository.countAll()).thenReturn(0L);
		when(userAccountRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
		when(passwordEncoder.encode("password")).thenReturn("encoded-password");

		new DemoUserDataInitializer(userAccountRepository, passwordEncoder);

		verify(userAccountRepository, times(3)).save(any(UserAccount.class));
		verify(passwordEncoder, times(3)).encode("password");
		verify(userAccountRepository, never()).existsByEmailIgnoreCase(eq("angie@choretrack.demo"));
	}

	@Test
	void doesNotSeedWhenRepositoryAlreadyHasUsers() {
		final UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
		final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

		when(userAccountRepository.countAll()).thenReturn(2L);

		new DemoUserDataInitializer(userAccountRepository, passwordEncoder);

		verify(userAccountRepository, never()).save(any(UserAccount.class));
		verify(passwordEncoder, never()).encode("password");
	}
}
