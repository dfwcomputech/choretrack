package com.computech.ctui.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

	@GetMapping(value = { "/", "/{path:[^\\.]*}", "/**/{path:[^\\.]*}" })
	public String index() {
		return "forward:/index.html";
	}
}
