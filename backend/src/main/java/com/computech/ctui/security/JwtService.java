package com.computech.ctui.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Service
public class JwtService {

	private final JwtEncoder jwtEncoder;
	private final JwtDecoder jwtDecoder;
	private final long expirationSeconds;

	public JwtService(@Value("${security.jwt.secret}") final String secret,
			@Value("${security.jwt.expiration-seconds}") final long expirationSeconds) {
		final byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
		final SecretKey secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");
		this.jwtEncoder = new NimbusJwtEncoder(new ImmutableSecret<>(keyBytes));
		this.jwtDecoder = NimbusJwtDecoder.withSecretKey(secretKey)
				.macAlgorithm(MacAlgorithm.HS256)
				.build();
		this.expirationSeconds = expirationSeconds;
	}

	public String generateToken(final String username) {
		final Instant now = Instant.now();
		final JwtClaimsSet claims = JwtClaimsSet.builder()
				.subject(username)
				.issuedAt(now)
				.expiresAt(now.plusSeconds(expirationSeconds))
				.build();
		final JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();
		return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
	}

	public String extractUsername(final String token) {
		return jwtDecoder.decode(token).getSubject();
	}

	public boolean isTokenValid(final String token, final String username) {
		try {
			final Jwt jwt = jwtDecoder.decode(token);
			return username.equals(jwt.getSubject()) && jwt.getExpiresAt() != null
					&& jwt.getExpiresAt().isAfter(Instant.now());
		} catch (JwtException ex) {
			return false;
		}
	}
}
