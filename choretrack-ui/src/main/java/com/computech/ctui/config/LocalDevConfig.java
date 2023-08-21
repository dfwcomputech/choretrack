package com.computech.ctui.config;

import java.io.File;

import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templateresolver.FileTemplateResolver;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Profile("local")
public class LocalDevConfig {

	@SneakyThrows
	public LocalDevConfig(final TemplateEngine templateEngine) {
		log.info("Init: localDevConfig");
		File sourceRoot = new ClassPathResource("application.properties").getFile().getParentFile();
		while (sourceRoot.listFiles((dir,name)-> name.equals("mvnw")).length != 1) {
			sourceRoot = sourceRoot.getParentFile();
		}
		final FileTemplateResolver fileTemplateResolver = new FileTemplateResolver();
        fileTemplateResolver.setPrefix(sourceRoot.getPath() + "/src/main/resources/templates/");
        fileTemplateResolver.setSuffix(".html");
        fileTemplateResolver.setCacheable(false);
        fileTemplateResolver.setCharacterEncoding("UTF-8");
        fileTemplateResolver.setCheckExistence(true);

        templateEngine.setTemplateResolver(fileTemplateResolver);
	}
}
