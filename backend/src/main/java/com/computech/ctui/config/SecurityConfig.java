package com.computech.ctui.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.computech.ctui.auth.UserAccountRepository;
import com.computech.ctui.security.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

	private static final String UNAUTHORIZED_RESPONSE_BODY = "{\"message\":\"unauthorized\",\"field\":null}";

	@Bean
	SecurityFilterChain securityFilterChain(final HttpSecurity http,
			final JwtAuthenticationFilter jwtAuthenticationFilter,
			final AuthenticationProvider authenticationProvider) throws Exception {
		return http
				.csrf(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers("/", "/index.html", "/api/auth/login", "/api/auth/register", "/error", "/favicon.ico",
								"/assets/**")
						.permitAll()
						.requestMatchers("/api/**").authenticated()
						.anyRequest().permitAll())
				.exceptionHandling(exceptionHandling -> exceptionHandling.authenticationEntryPoint((request, response, ex) -> {
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					response.setContentType("application/json");
					response.getWriter().write(UNAUTHORIZED_RESPONSE_BODY);
				}))
				.authenticationProvider(authenticationProvider)
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
				.cors(Customizer.withDefaults())
				.build();
	}

	@Bean
	UserDetailsService userDetailsService(@Value("${security.default-user.name}") final String username,
			@Value("${security.default-user.password-hash}") final String passwordHash,
			final UserAccountRepository userAccountRepository) {
		final UserDetails defaultUser = User.withUsername(username)
				.password(passwordHash)
				.roles("USER")
				.build();
		return requestedUsername -> userAccountRepository.findByUsernameIgnoreCase(requestedUsername)
				.map(userAccount -> User.withUsername(userAccount.username())
						.password(userAccount.passwordHash())
						.roles(userAccount.role() == null ? "USER" : userAccount.role().name())
						.build())
				.orElseGet(() -> {
					if (defaultUser.getUsername().equalsIgnoreCase(requestedUsername)) {
						return defaultUser;
					}
					throw new UsernameNotFoundException("User not found: " + requestedUsername);
				});
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	AuthenticationProvider authenticationProvider(final UserDetailsService userDetailsService,
			final PasswordEncoder passwordEncoder) {
		final DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
		provider.setPasswordEncoder(passwordEncoder);
		return provider;
	}

	@Bean
	AuthenticationManager authenticationManager(final AuthenticationConfiguration authenticationConfiguration)
			throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}
}
